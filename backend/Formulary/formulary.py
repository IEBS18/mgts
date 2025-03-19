from flask import Flask, jsonify, request, Blueprint, send_file
from flask_cors import CORS
from elasticsearch import Elasticsearch
import logging
import pandas as pd
import io
import os
import sys
# from Chatbot.query_classifier import es
try:
    from .formulary_util import fetch_drug_details_from_excel, predict_tier_and_requirement, fetch_data, generate_differentiator, generate_insights
except:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from formulary_util import fetch_drug_details_from_excel, predict_tier_and_requirement, fetch_data, generate_differentiator, generate_insights

from dotenv import load_dotenv
load_dotenv()

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

formulary_blueprint = Blueprint('formulary', __name__)

@formulary_blueprint.route('/formularyData', methods=['GET'])
def formulary_data():
    try:
        index = "reimbursementfinal"

        # Get state from query parameters if provided
        selected_state = request.args.get('state', None)

        aggregation_query = {
            "size": 0,
            "aggs": {
                "unique_diseases": {
                    "terms": {
                        "field": "Disease Name.keyword",
                        "size": 10000
                    }
                },
                "unique_drugs": {
                    "terms": {
                        "field": "Drug Name.keyword",
                        "size": 10000
                    }
                },
                "unique_states": {
                    "terms": {
                        "field": "State Name.keyword",
                        "size": 10000
                    }
                },
                "filtered_unique_plans": {  # Plans within the filtered query
                    "terms": {
                        "field": "Plan Name.keyword",
                        "size": 10000
                    },
                    "aggs": {
                        "plan_type": {
                            "terms": {
                                "field": "Plan Type.keyword",
                                "size": 1
                            }
                        },
                        "available_states": {
                            "terms": {
                                "field": "State Name.keyword",
                                "size": 10000
                            }
                        }
                    }
                },
                "global_unique_plans": {  # All plans, regardless of state
                    "global": {},  # Define a global aggregation scope
                    "aggs": {
                        "unique_plans": {
                            "terms": {
                                "field": "Plan Name.keyword",
                                "size": 10000
                            },
                            "aggs": {
                                "plan_type": {
                                    "terms": {
                                        "field": "Plan Type.keyword",
                                        "size": 1
                                    }
                                },
                                "available_states": {
                                    "terms": {
                                        "field": "State Name.keyword",
                                        "size": 10000
                                    }
                                }
                            }
                        }
                    }
                },
                "unique_drug_tiers": {
                    "terms": {
                        "field": "Drug Tier.keyword",
                        "size": 10000
                    }
                },
                "unique_plan_types": {  # Aggregation for Plan Types
                    "terms": {
                        "field": "Plan Type.keyword",
                        "size": 10000
                    }
                },
                "disease_to_drugs": {  # Aggregation for Disease to Drugs mapping
                    "terms": {
                        "field": "Disease Name.keyword",
                        "size": 10000
                    },
                    "aggs": {
                        "associated_drugs": {
                            "terms": {
                                "field": "Drug Name.keyword",
                                "size": 10000
                            }
                        }
                    }
                }
            }
        }

        # Apply state filter if selected
        if selected_state and selected_state != "All States":
            aggregation_query["query"] = {
                "term": {
                    "State Name.keyword": selected_state
                }
            }

        response = es.search(index=index, body=aggregation_query)

        # Extract unique values from aggregation buckets
        diseases = [bucket['key'] for bucket in response['aggregations']['unique_diseases']['buckets']]
        drugs = [bucket['key'] for bucket in response['aggregations']['unique_drugs']['buckets']]
        states = [bucket['key'] for bucket in response['aggregations']['unique_states']['buckets']]
        drug_tiers = [bucket['key'] for bucket in response['aggregations']['unique_drug_tiers']['buckets']]
        plan_types = [bucket['key'] for bucket in response['aggregations']['unique_plan_types']['buckets']]

        # Build plans from filtered_unique_plans (associated with the selected state)
        filtered_plans = []
        for plan_bucket in response['aggregations']['filtered_unique_plans']['buckets']:
            plan_name = plan_bucket['key']
            # Extract the most common plan type for each plan
            plan_type_buckets = plan_bucket['plan_type']['buckets']
            if plan_type_buckets:
                plan_type = plan_type_buckets[0]['key']
            else:
                plan_type = "Unknown"
            # Extract available states for each plan
            available_states = [state_bucket['key'] for state_bucket in plan_bucket['available_states']['buckets']]
            filtered_plans.append({"name": plan_name, "type": plan_type, "states": available_states})

        # Build plans from global_unique_plans (all plans)
        all_plans = []
        for plan_bucket in response['aggregations']['global_unique_plans']['unique_plans']['buckets']:
            plan_name = plan_bucket['key']
            # Extract the most common plan type for each plan
            plan_type_buckets = plan_bucket['plan_type']['buckets']
            if plan_type_buckets:
                plan_type = plan_type_buckets[0]['key']
            else:
                plan_type = "Unknown"
            # Extract available states for each plan
            available_states = [state_bucket['key'] for state_bucket in plan_bucket['available_states']['buckets']]
            all_plans.append({"name": plan_name, "type": plan_type, "states": available_states})

        # Decide which plans to return based on selected_state
        if selected_state and selected_state != "All States":
            # Return only plans associated with the selected state
            plans = filtered_plans
        else:
            # Return all plans
            plans = all_plans

        # Build disease to drugs mapping
        disease_to_drugs = {}
        for disease_bucket in response['aggregations']['disease_to_drugs']['buckets']:
            disease_name = disease_bucket['key']
            associated_drugs = [drug['key'] for drug in disease_bucket['associated_drugs']['buckets']]
            disease_to_drugs[disease_name] = associated_drugs

        # Return aggregated data as JSON
        return jsonify({
            "status": "success",
            "diseases": diseases,
            "drugs": drugs,
            "states": states,
            "plans": plans,  # Now includes 'states' field
            "drugTiers": drug_tiers,
            "planTypes": plan_types,  # Include Plan Types
            "diseaseToDrugs": disease_to_drugs  # Include Disease to Drugs mapping
        })

    except Exception as e:
        # Enhanced error logging for debugging
        formulary_blueprint.logger.error(f"Error in /formularyData: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
@formulary_blueprint.route('/formularyResult', methods=['POST'])
def formulary_result():
    data = request.json
    index = "reimbursementfinal"

    # Extract filters from payload
    selected_diseases = data.get('selectedDiseases', [])
    selected_drugs = data.get('selectedDrugs', [])
    selected_plans = data.get('selectedPlans', [])
    selected_state = data.get('selectedState', None)
    selected_plan_type = data.get('selectedPlanType', None)  # New field for Plan Type

    # Construct the bool query with must clauses
    bool_query = {"must": []}

    if selected_diseases:
        bool_query["must"].append({
            "terms": {
                "Disease Name.keyword": selected_diseases
            }
        })

    if selected_drugs:
        # Extract drug names ensuring they are non-empty strings
        drug_names = [drug['name'].strip() for drug in selected_drugs if 'name' in drug and drug['name'].strip()]
        if drug_names:
            bool_query["must"].append({
                "terms": {
                    "Drug Name.keyword": drug_names
                }
            })

    if selected_plans:
        # Extract plan names ensuring they are non-empty strings
        plan_names = [plan['name'].strip() for plan in selected_plans if 'name' in plan and plan['name'].strip()]
        if plan_names:
            bool_query["must"].append({
                "terms": {
                    "Plan Name.keyword": plan_names
                }
            })

    if selected_state and selected_state != "All States":
        bool_query["must"].append({
            "term": {
                "State Name.keyword": selected_state
            }
        })

    if selected_plan_type and selected_plan_type != "All Plan Types":
        bool_query["must"].append({
            "term": {
                "Plan Type.keyword": selected_plan_type
            }
        })

    # If no filters provided, default to match all to avoid errors
    if not bool_query["must"]:
        bool_query["must"].append({"match_all": {}})
        
    # Add pagination parameters
    page = data.get('page', 1)
    per_page = data.get('per_page', 50)
    from_record = (page - 1) * per_page

    search_body = {
        "query": {
            "bool": bool_query
        },
        "from": from_record,
        "size": per_page
    }


    # For debugging: Log the constructed query
    formulary_blueprint.logger.debug(f"Elasticsearch Query: {search_body}")

    try:
        # Perform search query
        response = es.search(index=index, body=search_body)

        # For debugging: Log the raw response
        formulary_blueprint.logger.debug(f"Elasticsearch Response: {response}")

        # Extract matching documents from the response
        documents = [
            hit['_source']
            for hit in response['hits']['hits']
        ]

        return jsonify({"status": "success", "data": documents})

    except Exception as e:
        formulary_blueprint.logger.error(f"Elasticsearch query failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    
    

@formulary_blueprint.route('/downloadExcelFormulary', methods=['POST'])
def download_excel_formulary():
    try:
        # Parse the JSON payload from the request
        data = request.get_json()
        results = data.get('results', [])

        # Create a DataFrame from the results
        df = pd.DataFrame(results)

        # Use an in-memory bytes buffer for the Excel file
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Results')
        output.seek(0)

        # For Flask 2.x and above, use 'download_name'
        return send_file(
            output,
            as_attachment=True,
            download_name="results.xlsx",
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        # Log the error to the console for debugging
        print(f"Error generating Excel file: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500




@formulary_blueprint.route('/get_safety_efficacy', methods=['POST'])
def get_safety_efficacy():
    """
    Endpoint to fetch Safety, Efficacy, Modality, and SubModality data from Elasticsearch based on drug names.
    Expects a JSON payload:
    {
        "drug_names": ["Drug1", "Drug2", ...]
    }
    """
    data = request.get_json()
    drug_names = data.get('drug_names')

    if not drug_names:
        return jsonify({"error": "List of drug names is required."}), 400

    if not isinstance(drug_names, list) or not all(isinstance(name, str) for name in drug_names):
        return jsonify({"error": "'drug_names' must be a list of strings."}), 400

    # Fetch drug data using the helper function
    safety_efficacy_data = fetch_drug_details_from_excel(drug_names)

    # Check if fetch_drug_data returned an error
    if isinstance(safety_efficacy_data, tuple):
        # It's an error response
        return jsonify(safety_efficacy_data[0]), safety_efficacy_data[1]

    return jsonify(safety_efficacy_data), 200

   
@formulary_blueprint.route('/add-drug-formulary', methods=['POST'])
def add_drug_formulary():
    
# Parse JSON payload from the frontend
    data = request.get_json()

    # Extract fields from the request
    new_drug = data.get('drugName', '')
    diseasesname = data.get('diseaseName', '')
    efficacy = data.get('efficacy', '')
    safety = data.get('safety', '')
    modality = data.get('modality', '')

    # Prepare the "plan" dict used for any downstream processing/predictions
    new_plan = {
        "drug_name": new_drug,
        "diseasesname": diseasesname,
        "efficacy": efficacy,
        "safety": safety,
        "modality": modality
    }

    # STEP 1: Fetch competitor data from your existing source
    # Expecting fetch_data to return either a list or dict of competitor drugs
    list_competitor_drug = fetch_data([diseasesname])

    # Convert competitor data to the dict structure { diseaseName: [ ... ] }
    if isinstance(list_competitor_drug, list):
        list_competitor_drug = {diseasesname: list_competitor_drug}
    elif not isinstance(list_competitor_drug, dict):
        list_competitor_drug = {diseasesname: []}

    # Make sure there's a list under the disease key
    if diseasesname not in list_competitor_drug:
        list_competitor_drug[diseasesname] = []

    competitor_data = list_competitor_drug[diseasesname]

    # STEP 2: Restructure competitor data (if needed) for your prediction engine
    # For demonstration, let's create a competitor_data_dict. Adjust as your model requires.
    competitor_data_dict = {}
    for item in competitor_data:
        if isinstance(item, dict):
            drug_name_in_item = item.get('Drug Name') or item.get('drug_name')
            if drug_name_in_item:
                competitor_data_dict[drug_name_in_item] = [item]

    # STEP 3: Predict tier/requirement for the new drug (adjust as needed for your logic)
    prediction_result = predict_tier_and_requirement(new_plan, competitor_data_dict)

    # STEP 4: Create a dictionary for the newly added drug using the same key style
    # (lowercase keys like "drug_name", "efficacy", etc. are fine, since your React
    # code unifies them to "Drug Name," "Efficacy," etc. in the front end.)
    new_drug_entry = {
        "drug_name": new_drug,
        "diseasesname": diseasesname,
        "efficacy": efficacy,
        "safety": safety,
        "modality": modality,
        "Tier": prediction_result.get("Tier", "N/A"),
        "Requirement": prediction_result.get("Requirement", "Fully Reimbursed"),
    }

    # Insert the newly added drug into the competitor array (front of the list, if you prefer)
    competitor_data.insert(0, new_drug_entry)

    # Reassign the updated array back to the main dict
    list_competitor_drug[diseasesname] = competitor_data

    # STEP 5: Return exactly what the front-end code expects:
    # {
    #   "list_competitor_drug": { "Disease X": [ {drug}, ... ] },
    #   "drug_name": "..."
    # }
    # The front-end’s unify/parse logic references "rawData.list_competitor_drug"
    # and "rawData.drug_name" – so we must include these keys exactly.
    return jsonify({
        "list_competitor_drug": list_competitor_drug,
        "drug_name": new_drug
    }), 201

@formulary_blueprint.route('/formulary-drug-insights', methods=['POST'])
def formulary_drug_insights():
    try:
        # Extract the incoming JSON data
        data = request.json
        drug_name = data.get('drug_name')
        all_data = data.get('all_data')
        user_added_drug = all_data[0]
        safety = user_added_drug.get('Safety')
        efficacy = user_added_drug.get('Efficacy')
        tier = user_added_drug.get('Tier')
        requirement = user_added_drug.get('Requirements/Limits')
        competitor_data = all_data[1:]  # List of competitor drug data
        if requirement=="N/A" or not requirement:
            requirement="Not Available"
            
        # print(drug_name)
        # print(safety)
        # print(efficacy)
        # print(tier)
        # print(requirement)

        # Validate input data
        # if not drug_name:
            # return jsonify({"error": "Drug name is required"}), 400
        # if not safety or not efficacy or not tier or not requirement:
            # return jsonify({"error": "Drug safety, efficacy, tier, and requirement are required"}), 400
        if not competitor_data or not isinstance(competitor_data, list):
            return jsonify({"error": "Competitor data is required and should be a list"}), 400

        # Generate Differentiator and Insights using the imported functions
        differentiator = generate_differentiator(drug_name, safety, efficacy, tier, requirement, competitor_data)
        # print("fck")
        insights = generate_insights(drug_name, safety, efficacy, tier, requirement)
        # print("insights",insights)
        # Return the generated insights and differentiator
        return jsonify({"differentiator": differentiator, "insights": insights}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

# 4. Create the Flask app instance, configure logging/CORS, and register the blueprint
def create_app():
    app = Flask(__name__)

    # Configure Logging
    log_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
    os.makedirs(log_directory, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(os.path.join(log_directory, "app.log")),
            logging.StreamHandler()
        ]
    )

    # Set up CORS
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://68.154.56.138:3000",
            "http://localhost:5174",
            "http://127.0.0.1:5000"
        ]
    )

    # Register Blueprint
    app.register_blueprint(formulary_blueprint)

    return app


# 5. Run the application
if __name__ == '__main__':
    logging.info("Starting Flask Formulary microservice on port 5005...")
    app = create_app()
    app.run(host="0.0.0.0", port=5005)    