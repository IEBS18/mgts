from pathlib import Path
from flask import Flask, request, jsonify, send_file, make_response, Response
import pandas as pd
from io import BytesIO
from flask_cors import CORS
import sys
from werkzeug.security import generate_password_hash, check_password_hash
import json
from openai import OpenAI
from openai import AzureOpenAI
import os
from PricePrediction.pp import display_competitor_details, fetch_competitor_data, parse_data, predict_price
from PlayerLandscape.dm import get_bubble_chart_data, get_donut_chart_data
# , get_heatmap_data
from Calculations.ATC import adverse_effect_score, calculate_safety_efficacy_scores, extract_adverse_events, extract_annual_therapy_cost
from Utilities.query_classifier import (
    route_to_chatbot,
    es,
    conversation_history,
)
from TPP.d import format_output, process_drug_comparison
from TPP.k import key_insights, process_key_insights
from openpyxl import Workbook
sys.stdout.reconfigure(encoding='utf-8')

from PlayerLandscape.player import get_disease_data
from dotenv import load_dotenv
load_dotenv()
import io
from MarketEstimation.market import get_country_data
from Utilities.summarize import summarize_by_title_or_org

from Utilities.AIColumn import update_drug_data

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://68.154.56.138:3000","http://localhost:5174", "http://127.0.0.1:5000"])

# Path to the user data file
USER_FILE_PATH = './users.json'

# Helper function to load users from the JSON file
def load_users():
    try:
        with open(USER_FILE_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []  # If the file doesn't exist, return an empty list

# Helper function to save users to the JSON file
def save_users(users):
    try:
        with open(USER_FILE_PATH, 'w') as f:
            json.dump(users, f, indent=4)
    except Exception as e:
        print(f"Error saving users to file: {e}")


# Signup route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # Extract user details
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')

    # Basic validation for input
    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "All fields are required!"}), 400

    # Load existing users from the JSON file
    users = load_users()

    # Check if the email already exists
    if any(user['email'] == email for user in users):
        return jsonify({"error": "Email already exists!"}), 400

    # Hash the password before storing
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Create a new user and add it to the list
    new_user = {
        "id": len(users) + 1,  # Assign a new unique ID based on existing users
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password_hash": hashed_password
    }
    users.append(new_user)

    # Save the updated users list back to the JSON file
    save_users(users)

    # Prepare response with success and set cookie
    response = make_response(jsonify({
        "user_pharmax_id": new_user["id"],
        "first_name": first_name,
        "message": "Account created successfully!"
    }), 201)

    # Set the user_pharmax_id cookie
    response.set_cookie(
        'user_pharmax_id', 
        value=str(new_user["id"]), 
        max_age=60*60*24*7,  # 1 week validity
        samesite='Lax'       # Adjust based on your requirements
    )

    return response


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    users = load_users()
    user = next((u for u in users if u['email'] == email), None)

    if user and check_password_hash(user['password_hash'], password):
        response = make_response(jsonify({
            "user_pharmax_id": user["id"],
            "first_name": user["first_name"],
            "message": "Login successful!"
        }), 200)

        # Set the cookie with proper attributes for local development
        response.set_cookie(
            'user_pharmax_id',
            value=str(user["id"]),
            max_age=60*60*24*7,  
            samesite='Lax'
        )
        return response

    return jsonify({"error": "Invalid credentials!"}), 401

@app.route('/check_login', methods=['GET'])
def check_login():
    user_id = request.cookies.get('user_pharmax_id')
    if user_id:
        return jsonify({'logged_in': True}), 200
    return jsonify({'logged_in': True}), 200

@app.route('/search-by-disease', methods=['POST'])
def disease_search():
    data = request.json
    search_type = data.get("search_type")
    index = "disease_data_final_mar_17"

    es_query = []

    disease_names = data.get("disease_name", [])
    # country_names = data.get("country_name", [])

    es_query.append({"index": index})

    # Construct the query
    bool_query = {"must": []}

    # Add disease filter if it's provided
    if disease_names != "all":
        bool_query["must"].append({"term": {"Disease.keyword": disease_names}})

    es_query.append({
        "query": {
            "bool": bool_query
        },
        "size": 10000  # Control the number of results for performance
    })
    
        # Search query to Elasticsearch: searching across all fields
    query = {
        "query": {
            "multi_match": {
                "query": disease_names,  # Query the disease name
                "fields": ["Disease"],  # Search across all fields in the index
                # "fuzziness": "AUTO",  # Optional: Fuzzy matching for minor spelling errors
            }
        }
    }

    try:
        # Perform the multi-search query
        response = es.msearch(body=es_query)
        documents = [
            hit['_source']
            for res in response['responses']
            for hit in res['hits']['hits']
        ]
        drug_response = es.search(index='combined_country_drug1', body=query)
        # Extract relevant data from the Elasticsearch response
        drugs = []
        for hit in drug_response['hits']['hits']:
            drug_info = hit['_source']  # Assuming the relevant drug info is in the "_source" field
            drugs.append(drug_info)

        return jsonify({"status": "success", "data": documents, "drugs": drugs})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/search-by-drug', methods=['POST'])
def drug_search():
    data = request.json
    search_type = data.get("search_type")
    index = "combined_country_drug1"

    es_query = []
    drug_names = data.get("drug_names", [])
    country_names = data.get("country_name", [])

    es_query.append({"index": index})

    # Construct the query
    bool_query = {"must": []}

    # Add drug filter if it's provided
    if drug_names != "all":
        bool_query["must"].append({"term": {"Active Ingredient.keyword": drug_names}})

    # Add country filter if it's not "all"
    if "all" not in country_names:
        bool_query["must"].append({"terms": {"Country.keyword": country_names}})

    es_query.append({
        "query": {
            "bool": bool_query
        },
        "size": 10000  # Control the number of results for performance
    })

    try:
        # Perform the multi-search query
        response = es.msearch(body=es_query)

        # Extract documents from responses
        documents = [
            hit['_source']
            for res in response['responses']
            for hit in res['hits']['hits']
        ]

        return jsonify({"status": "success", "data": documents})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/search-by-symptoms', methods=['POST'])
def symptom_search():
    data = request.json
    index = "disease_data_final"

    es_query = []
    search_keyword = data.get("search_keyword", "")

    es_query.append({"index": index})

    # Construct the query
    bool_query = {"must": []}

    # Add symptoms filter if it's provided
    if search_keyword:
        bool_query["must"].append({
            "match": {
                "Signs & Symptoms": {
                    "query": search_keyword,
                    "fuzziness": "AUTO"
                }
            }
        })
        
        es_query.append({
            "query": {
                "bool": bool_query
            },
            "size": 10000  # Control the number of results for performance
        })

    try:
        # Perform the multi-search query
        response = es.msearch(body=es_query)

        # Extract documents from responses
        documents = [
            hit['_source']
            for res in response['responses']
            for hit in res['hits']['hits']
        ]

        return jsonify({"status": "success", "data": documents})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/drug-search-by-disease', methods=['POST'])
def drug_search_by_disease():
    # Get the disease name from the request
    data = request.get_json()
    disease_name = data.get('disease')

    if not disease_name:
        return jsonify({"error": "Disease name is required"}), 400

    # Search query to Elasticsearch: searching across all fields
    query = {
        "query": {
            "multi_match": {
                "query": disease_name,  # Query the disease name
                "fields": ["Disease"],  # Search across all fields in the index
                # "fuzziness": "AUTO",  # Optional: Fuzzy matching for minor spelling errors
            }
        }
    }

    try:
        # Search the 'combined-drug-data' index
        response = es.search(index='combined_country_drug1', body=query)

        # Extract relevant data from the Elasticsearch response
        drugs = []
        for hit in response['hits']['hits']:
            drug_info = hit['_source']  # Assuming the relevant drug info is in the "_source" field
            drugs.append(drug_info)

        return jsonify(drugs), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500    
    
    

@app.route('/download-excel', methods=['POST'])
def download_excel():
    # Step 1: Get JSON data from the POST request
    data = request.get_json()
    print(data)
    
    # Step 2: Convert JSON to a Pandas DataFrame
    df = pd.DataFrame(data)
    
    # Step 3: Save the DataFrame as an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
    
    # Move to the beginning of the stream
    output.seek(0)
    
    # Step 4: Return the Excel file as a downloadable response
    return send_file(
        output,
        as_attachment=True,
        download_name='search_results.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
# Define the route for the API
@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get('query')
    results = data.get('results')
    # print(results)
    response = route_to_chatbot(query, results, conversation_history)
    # print(conversation_history)
    # Create OpenAI prompt
    # context_prompt = create_openai_prompt(filtered_results[:5])
    # # Add context to conversation history
    # # if system role is not present, add it
    # if not any(d['role'] == 'system' for d in conversation_history):
    #     conversation_history.append({"role": "system", "content": context_prompt})
    #     print("added system context.")
    # # Generate OpenAI completion
    # openai_completion = generate_openai_completion(query)
 
    return jsonify({"results": response})
@app.route('/therapy-cost-estimation', methods=['POST'])
def therapy_cost_estimation():
    data = request.json
    disease = data.get('disease')
    forecast_years = ['2024', '2025', '2026', '2027', '2028']
    
    if not disease:
        return jsonify({'error': 'Disease name is required'}), 400
    
    # Retrieve data for multiple countries
    country_data = get_country_data(disease)
    if not country_data:
        return jsonify({'error': f'No data found for disease {disease}'}), 404
    
    # Prepare response data for each country
    response = {}
    for country, data in country_data.items():
        all_years = data['years'] + forecast_years
        combined_therapy_cost = data['therapy_cost'] + list(data['therapy_cost_forecast'])
        response[country] = {
            'all_years': all_years,
            'combined_therapy_cost': combined_therapy_cost
        }
    print(response)
    return jsonify(response)

@app.route('/market-estimation', methods=['POST'])
def market_estimation():
    data = request.json
    disease = data.get('disease')
    forecast_years = ['2024', '2025', '2026', '2027', '2028']
    
    if not disease:
        return jsonify({'error': 'Disease name is required'}), 400
    
    # Retrieve data for multiple countries
    country_data = get_country_data(disease)
    if not country_data:
        return jsonify({'error': f'No data found for disease {disease}'}), 404
    
    # Prepare response data for each country
    response = {}
    for country, data in country_data.items():
        all_years = data['years'] + forecast_years
        combined_market_size = data['market_size'] + list(data['market_forecast'])
        response[country] = {
            'years': data['years'],
            'forecast_years': forecast_years,
            'market_size': data['market_size'],
            'market_forecast': data['market_forecast'].tolist()
        }
    print(response)
    return jsonify(response)  

@app.route('/generate_disease_analysis', methods=['POST'])
def generate_disease_analysis():
    data = request.get_json()
    disease_name = data.get('disease_name', '').strip().lower()

    if not disease_name:
        return jsonify({'error': 'Disease name is required'}), 400

    disease_data = get_disease_data(disease_name)
    print(disease_data)

    if not disease_data:
        return jsonify({'error': f'No data found for disease: {disease_name}'}), 404

    return jsonify(disease_data)

@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    data = request.json
    selected_cards = data.get('selectedCards')
    print(selected_cards)
    summary = summarize_by_title_or_org(selected_cards)
    return jsonify({"summary": summary})

@app.route('/add-ai-column', methods=['POST'])
def add_ai_column():
    try:
        data = request.get_json()
        column_name = data.get('columnName')
        column_description = data.get('columnDescription')
        search_results = data.get('searchResults')
        print(search_results)
        
        updated_results = update_drug_data(search_results, column_name, column_description)
        # print(updated_results)

        if not column_name or not column_description:
            return jsonify({"error": "Both columnName and columnDescription are required"}), 400

        print(f"Adding AI column: {column_name}, Description: {column_description}")
        print(f"Search results associated: {search_results}")

        return jsonify({"updated_results": updated_results}), 200

    except Exception as e:
        print(f"Error while adding AI column: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    
@app.route('/price-prediction', methods=['POST'])
def price_prediction():
    try:
        # Get JSON data from the request
        data = request.json
        print(data)
        disease = data.get("disease_name")
        country = data.get("country")
        quality_of_life = data.get("quality_of_life")
        mortality = float(data.get("mortality", 0))
        morbidity = float(data.get("morbidity", 0))
        safety = data.get("safety")
        efficacy = data.get("efficacy")
        modality=data.get("modality")
        subModality=data.get("subModality")

        # Fetch competitor data from Elasticsearch
        competitor_data_raw = fetch_competitor_data(disease, country, modality, subModality)
        competitor_df = parse_data(competitor_data_raw)

        # Predict price based on the input and competitor data
        prediction = predict_price(
            competitor_df, disease, quality_of_life, mortality, morbidity, safety, efficacy
        )
        
        print("prediction: ", prediction)
        
        chart_data = (prediction['competitor_data']).to_dict(orient='records')
        
        print("chart_data: ", chart_data)
        
        competitor_details = display_competitor_details(prediction['competitor_data'])
        # details= competitor_details.to_dict(orient='records')
        # print("x:", competitor_details)
        
        # Return the prediction as a JSON response
        return jsonify({'predicted_price': prediction['predicted_price'], 'chart_data': chart_data, 'competitor_details': competitor_details})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/get-drug-data', methods=['POST'])
def get_drug_data():
    try:
        # Get active ingredient from request
        active_ingredient = request.json.get('active_ingredient')
        print(active_ingredient)
        if not active_ingredient:
            return jsonify({"error": "Active ingredient is required"}), 400

        # Query Elasticsearch
        query = {
            "size": 10000,
            "query": {
                "bool": {
                    "must": [
                        {"match": {"Active Ingredient.keyword": active_ingredient}}
                    ]
                }
            }
        }
        response = es.search(index="combined_country_drug1", body=query)
        hits = response['hits']['hits']
        if not hits:
            return jsonify({"error": "No data found for the given active ingredient"}), 404

        # Process data
        data = pd.DataFrame([hit['_source'] for hit in hits])
        if data.empty:
            return jsonify({"error": "No data found for the given active ingredient"}), 404

        # Get chart data
        top_diseases_data = get_donut_chart_data(data)
        annual_therapy_data = get_bubble_chart_data(data)
        # print(annual_therapy_data)
        # adverse_events_data = get_heatmap_data(data)

        # Combine results
        result = {
            "top_diseases_data": top_diseases_data,
            "annual_therapy_data": annual_therapy_data
        }
        
        print(result)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
@app.route('/annual_therapy_cost', methods=['POST'])
def annual_therapy_cost_calculator():
    try:
        data = request.json
        cost_statement = data.get('cost_statement')
        if not cost_statement:
            return jsonify({'error': 'cost_statement is required'}), 400

        result = extract_annual_therapy_cost(cost_statement)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route: Adverse Event Score Calculator
@app.route('/adverse_event_score', methods=['POST'])
def adverse_event_score_calculator():
    try:
        data = request.json
        drug_name = data.get('drug_name')
        adverse_event_statement = data.get('adverse_event_statement')

        if not drug_name or not adverse_event_statement:
            return jsonify({'error': 'drug_name and adverse_event_statement are required'}), 400

        # Extract adverse events
        adverse_events = extract_adverse_events(adverse_event_statement)
        if not adverse_events:
            return jsonify({'error': 'No adverse events found'}), 400

        result = adverse_effect_score(drug_name, adverse_events)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route: Safety and Efficacy Score Calculator
@app.route('/safety_efficacy_score', methods=['POST'])
def safety_efficacy_score_calculator():
    try:
        data = request.json
        trade_name = data.get('trade_name')
        country = data.get('country')
        disease = data.get('disease')
        efficacy_statement = data.get('efficacy_statement')
        safety_statement = data.get('safety_statement')
        print(data)

        if not (trade_name and country and disease and efficacy_statement and safety_statement):
            return jsonify({
                'error': 'trade_name, country, disease, efficacy_statement, and safety_statement are required'
            }), 400

        result = calculate_safety_efficacy_scores(trade_name, country, disease, efficacy_statement, safety_statement)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/formularyData', methods=['GET'])
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
        app.logger.error(f"Error in /formularyData: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/formularyResult', methods=['POST'])
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
    app.logger.debug(f"Elasticsearch Query: {search_body}")

    try:
        # Perform search query
        response = es.search(index=index, body=search_body)

        # For debugging: Log the raw response
        app.logger.debug(f"Elasticsearch Response: {response}")

        # Extract matching documents from the response
        documents = [
            hit['_source']
            for hit in response['hits']['hits']
        ]

        return jsonify({"status": "success", "data": documents})

    except Exception as e:
        app.logger.error(f"Elasticsearch query failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/downloadExcelFormulary', methods=['POST'])
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

def load_tpp_data():
    try:
        # Assuming the Excel file is in a data directory relative to this script
        excel_path = Path(__file__).parent / "tpp_database.xlsx"
        return pd.read_excel(excel_path)
    except Exception as e:
        print(f"Error loading Excel file: {e}")
        return None

# Initialize the dataframe
df = load_tpp_data()


@app.route('/api/tpp-by-drug', methods=['POST'])
def search_tpp_by_drug():
    try:
        data = request.json
        print(data)

        # Extract search parameters
        drug_name = data.get('drugName', '').strip()
        disease_name = data.get('diseaseName', '').strip()
        modality = data.get('modality', '').strip()

        # First, filter the dataset to find rows for the given drug name
        drug_df = df[df['Drug'].str.lower() == drug_name.lower()]

        # If no data for the drug, return early
        if drug_df.empty:
            return jsonify({
                'message': 'No matching records found for the drug',
                'data': []
            }), 200

        # Extract and clean disease names if empty
        if not disease_name and not drug_df.empty:
            raw_disease_text = drug_df['Disease'].dropna().unique().tolist()
            disease_list = []
            
            # Process each disease entry
            for entry in raw_disease_text:
                diseases = entry.split("\n")  # Split by newline
                # diseases = [d.replace("-", "").strip() for d in diseases]  # Clean formatting
                disease_list.extend(diseases)  # Collect all disease names

            print(f"Extracted and Cleaned Diseases: {disease_list}")
        else:
            disease_list = [disease_name.strip()] if disease_name else []

        # Extract modality if empty
        if not modality and not drug_df.empty:
            modality = drug_df['Modality'].iloc[0]  # Picking first value
            print(f"Extracted Modality: {modality}")

        # Apply AND logic for Disease (match any extracted disease)
        if disease_list:
            disease_mask = df['Disease'].apply(lambda x: any(d in str(x) for d in disease_list))
        else:
            disease_mask = pd.Series([True] * len(df))

        # Apply AND logic for Modality
        modality_mask = df['Modality'].str.contains(modality, case=False, na=False) if modality else pd.Series([True] * len(df))

        # Combine the conditions using AND logic
        combined_mask = disease_mask & modality_mask

        # Apply the combined filter to the DataFrame
        filtered_df = df[combined_mask]

        # Now combine drug_df with the filtered results
        result_df = pd.concat([drug_df, filtered_df]).drop_duplicates()

        # If no combined records found, return a message
        if result_df.empty:
            return jsonify({
                'message': 'No matching records found for the given disease and modality',
                'data': []
            }), 200

        # Fill NaN values with empty strings
        result_df = result_df.fillna("")

        # Convert the filtered dataframe to a list of dictionaries
        results = result_df.to_dict('records')

        return jsonify({
            'message': f'Found {len(results)} matching records',
            'data': results
        }), 200

    except Exception as e:
        print(f"Error in processing request: {e}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An error occurred while processing your request.'
        }), 500


@app.route('/api/tpp-by-therapies', methods=['POST'])
def search_tpp_by_therapies():
    try:
        data = request.json
        print(data)
        
        disease_name = data.get('diseaseName', '').strip()
        route_of_administration = data.get('routeOfAdministration', '').strip()
        modality = data.get('modality', '').strip()
        
        if not any([disease_name, route_of_administration, modality]):
            return jsonify({
                'error': 'Missing required fields',
                'message': 'At least one of Disease, Route of Administration, or Modality is required'
            }), 400
            
        filtered_df = df.copy()
        
        condition1 = (filtered_df['Disease'].str.contains(disease_name, case=False, na=False)) & \
                     (filtered_df['Modality'].str.contains(modality, case=False, na=False)) if disease_name and modality else False

        condition2 = filtered_df['Route Of Administration'].str.contains(route_of_administration, case=False, na=False) if route_of_administration else False
        
        if condition1 is not False or condition2 is not False:
            filtered_df['match_type'] = 'OR'
            filtered_df.loc[condition1, 'match_type'] = 'AND'
            
            filtered_df = filtered_df[condition1 | condition2]
            
            # Sort so that AND condition matches appear first
            filtered_df = filtered_df.sort_values(by='match_type', ascending=True)
            
        else:
            filtered_df = pd.DataFrame(columns=filtered_df.columns)
            
        if filtered_df.empty:
            return jsonify({
                'message': 'No matching records found',
                'data': []
            }), 200
            
        filtered_df = filtered_df.fillna("")
        results = filtered_df.drop(columns=['match_type']).to_dict('records')
        print(results)
        
        return jsonify({
            'message': f'Found {len(results)} matching records',
            'data': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

def get_disease_and_modality(drug_name):
    try:
        # Load the Excel file
        df = pd.read_excel("tpp_database.xlsx")

        # Check if the drug exists in the 'Drug' column
        drug_data = df[df['Drug'] == drug_name]

        if drug_data.empty:
            return None

        # Extract Disease and Modality columns
        # Split the 'Disease' column values by newline and remove empty values
        diseases = drug_data['Disease'].dropna().apply(lambda x: [d.strip() for d in x.split('\n')]).explode().unique().tolist()

        # Extract modalities (assuming there are no newlines in the modality column)
        modalities = drug_data['Modality'].dropna().unique().tolist()

        return {
            "diseases": diseases,
            "modalities": modalities
        }
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        return None

# API endpoint to fetch disease and modality based on drug name
@app.route('/api/drug-info', methods=['POST'])
def drug_info():
    try:
        data = request.get_json()  # Get the input JSON from frontend
        drug_name = data.get("drugName")

        if not drug_name:
            return jsonify({"error": "Drug name is required"}), 400

        # Get the disease and modality for the given drug
        result = get_disease_and_modality(drug_name)

        if not result:
            return jsonify({"error": "Drug not found in the database"}), 404

        return jsonify(result), 200

    except Exception as e:
        print(f"Error in API request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

def get_matched_disease_info(matched_disease):
    try:
        # Load the Excel file
        df = pd.read_excel("tpp_database.xlsx")

        # Check if the disease exists in the 'Disease' column
        disease_data = df[df['Disease'].str.contains(matched_disease, na=False, case=False)]

        if disease_data.empty:
            return None

        # Extract unique routes of administration and modalities
        routes_of_administration = disease_data['Route Of Administration'].dropna().unique().tolist()
        modalities = disease_data['Modality'].dropna().unique().tolist()

        return {
            "routes_of_administration": routes_of_administration,
            "modalities": modalities
        }
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        return None


# API endpoint to fetch routes of administration and modalities for matched disease
@app.route('/api/disease-info', methods=['POST'])
def matched_disease_info():
    try:
        data = request.get_json()  # Get the input JSON from frontend
        matched_disease = data.get("diseaseName")

        if not matched_disease:
            return jsonify({"error": "Matched disease name is required"}), 400

        # Get routes of administration and modalities for the given matched disease
        result = get_matched_disease_info(matched_disease)

        if not result:
            return jsonify({"error": "Matched disease not found in the database"}), 404

        return jsonify(result), 200

    except Exception as e:
        print(f"Error in API request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
   
    
@app.route('/main-drug-insights', methods=['POST'])
def main_drug_insights():
    try:
        data = request.json
        main_drug = data.get('drug_name')
        all_data = data.get('all_data')  # Get all_data from the request
        
        if not main_drug:
            return jsonify({"error": "Main drug not provided"}), 400
        
        if all_data is None:
            return jsonify({"error": "All data not provided"}), 400
        
        # Call your existing function to process drug comparison
        results = process_drug_comparison(all_data, main_drug)  # Pass all_data instead of DRUG_DATA
        
        # Format the output
        formatted_output_result = format_output(main_drug, results["differences"])
        
        keyResults = process_key_insights(all_data, main_drug)
        keyInsights = key_insights(main_drug, keyResults["differences"])
        
        return jsonify({"differentiator": formatted_output_result, "keyInsights": keyInsights})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500




# Formulary
from Reimbursement.Formulary import fetch_drug_details_from_excel, predict_tier_and_requirement, fetch_data
from Reimbursement.Insights import generate_differentiator, generate_insights
@app.route('/get_safety_efficacy', methods=['POST'])
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


# Route for predicting tier and requirement
# @app.route('/predict_tier_and_requirement', methods=['POST'])
# def predict_tier_and_requirement_route():
#     """
#     Endpoint to predict the Tier and Requirement for a new drug plan.
 
#     Expects a JSON payload:
#     {
#         "drug_name": "Aspirin",
#         "diseasesname": "Hypertension",
#         "efficacy": "Effective in reducing blood clot formation",
#         "safety": "Generally safe with minor gastrointestinal side effects",
#         "modality": "Small Molecule",
#         "competitor_data": {
#             "Hypertension": {
#                 "Amlodipine": [
#                     {
#                         "Efficacy": "Effective in lowering blood pressure",
#                         "Safety": "Generally well tolerated, mild headaches reported",
#                         "Modality": "Small Molecule",
#                         "Tier": "Tier 1",
#                         "Requirement": "No prior authorization required"
#                     },
#                     {
#                         "Efficacy": "Moderate effectiveness in elderly patients",
#                         "Safety": "Mild dizziness and occasional swelling",
#                         "Modality": "Small Molecule",
#                         "Tier": "Tier 2",
#                         "Requirement": "Prior authorization required for patients over 65"
#                     }
#                 ],
#                 "Losartan": [
#                     {
#                         "Efficacy": "Strong efficacy in preventing strokes and heart failure",
#                         "Safety": "Mild fatigue and occasional dry cough",
#                         "Modality": "Small Molecule",
#                         "Tier": "Tier 2",
#                         "Requirement": "Step therapy required"
#                     }
#                 ]
#             }
#         }
#     }
#     """
#     data = request.json
 
#     # Extract fields from the request
#     drug_name = data.get('drug_name')
#     diseasesname = data.get('diseasesname')
#     efficacy = data.get('efficacy')
#     safety = data.get('safety')
#     modality = data.get('modality')
#     competitor_data = data.get('competitor_data')  # Expecting this in the request
 
#     # Validate input
#     missing_fields = []
#     for field in ['drug_name', 'diseasesname', 'efficacy', 'safety', 'modality', 'competitor_data']:
#         if not data.get(field):
#             missing_fields.append(field)
 
#     if missing_fields:
#         message = f"The following fields are required: {', '.join(missing_fields)}."
#         app.logger.error(message)
#         return jsonify({
#             "status": "error",
#             "message": message
#         }), 400
 
#     # Validate competitor_data structure
#     if not isinstance(competitor_data, dict):
#         message = "Invalid format for competitor_data. It should be a dictionary."
#         app.logger.error(message)
#         return jsonify({
#             "status": "error",
#             "message": message
#         }), 400
 
#     # Further validation: Ensure diseasesname exists in competitor_data
#     if diseasesname not in competitor_data:
#         message = f"Disease '{diseasesname}' not found in competitor_data."
#         app.logger.error(message)
#         return jsonify({
#             "status": "error",
#             "message": message
#         }), 400
 
#     try:
#         # Construct new_plan dictionary
#         new_plan = {
#             "drug_name": drug_name,
#             "diseasesname": diseasesname,
#             "efficacy": efficacy,
#             "safety": safety,
#             "modality": modality
#         }
 
#         app.logger.info(f"Processing new plan: {new_plan}")
 
#         # Call the prediction function
#         prediction = predict_tier_and_requirement(new_plan, competitor_data)
 
#         # Check if the result is an error or a valid prediction
#         if "error" in prediction:
#             app.logger.error(f"Prediction Error: {prediction['message']}")
#             return jsonify({"status": "error", "message": prediction["message"]}), 500
 
#         # Return successful prediction response
#         response_payload = {
#             "status": "success",
#             "tier": prediction["Tier"],  # Return Tier
#             "requirement": prediction["Requirement"]  # Return Requirement
#         }
 
#         app.logger.info(f"Prediction Successful: {response_payload}")
 
#         return jsonify(response_payload), 200
 
#     except Exception as e:
#         app.logger.exception("Unexpected error during prediction.")
#         return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/add-drug-formulary', methods=['POST'])
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

@app.route('/formulary-drug-insights', methods=['POST'])
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


from RnD.rnd import fetch_raw_results, stream_llm_results, processed_data_cache, fuzzy_search
# from RnD.searchbyDrug import fetch_results, stream_drug, processed_cache
from RnD.RNDAI_column import getAIColumn
# ------------------------------
# API Routes
# ------------------------------

@app.route('/api/rnd-formulation-llama', methods=['GET'])
def rnd_formulation_llama():
    """
    SSE endpoint that streams LLaMA results for R&D Formulations.
    """
    user_query = request.args.get('user_query')
    size = request.args.get('size', default=2, type=int)
    # Accept requested fields as a comma-separated list
    requested_fields = request.args.get('requested_fields', '')
    # Log the raw input
    print("Raw requested_fields:", repr(requested_fields))
    print("Type of requested_fields:", type(requested_fields))

    # Convert requested fields into a list
    if isinstance(requested_fields, list):
        processed_fields = [field.strip() for field in requested_fields if field.strip()]
    else:
        processed_fields = [field.strip() for field in requested_fields.split(',') if field.strip()]

    print("Processed requested_fields:", processed_fields)
    print("Type after processing:", type(processed_fields))

    if not user_query:
        return jsonify({"error": "Missing 'user_query'"}), 400

    # Fetch Elasticsearch results
    raw_results = fetch_raw_results(user_query, size=size)

    # Stream results as SSE (pass processed fields)
    return Response(
        stream_llm_results(raw_results, user_query, processed_fields),
        content_type="text/event-stream",
        status=200
    )
    
 
@app.route('/api/rnd-formulation-llama-results', methods=['GET'])
def get_processed_results():
    """Endpoint to fetch processed LLaMA-3.3 results."""
    user_query = request.args.get("user_query")
    if not user_query or user_query not in processed_data_cache:
        return jsonify({"error": "Results not ready yet"}), 404

    return jsonify({"results": processed_data_cache[user_query]}), 200
    
## SEARCH BY DRUG RND Formulation    



# @app.route('/api/rnd-formulation-drug', methods=['GET'])
#def get_rnd_formulation_drug():

    # try:
    #     requested_tabs = request.args.getlist('selected_tabs')  # Expecting a list of column names
    #     print(requested_tabs)
    #     if not requested_tabs:
    #         raise ValueError("Missing 'selected_tabs' parameter in request")
        
    #     if not os.path.exists(EXCEL_FILE_PATH):
    #         raise ValueError("Excel file does not exist in backend")
        
    #     # Read the Excel file
    #     xl = pd.ExcelFile(EXCEL_FILE_PATH)
        
    #     # Read the single sheet into a DataFrame
    #     df = xl.parse('Sheet1')
    #     print(df.columns)
    #     # Ensure the columns exist in the DataFrame
    #     missing_columns = [col for col in requested_tabs if col not in df.columns]
    #     if missing_columns:
    #         raise ValueError(f"Missing columns in the Excel file: {', '.join(missing_columns)}")

    #     # Extract the requested columns
    #     data = df[requested_tabs].to_dict(orient='records')
        
    #     # Send back the relevant data
    #     response_data = {
    #         "data": data,
    #         "message": "Columns retrieved successfully"
    #     }
        
    #     return jsonify(response_data), 200
    
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 400


import matplotlib.pyplot as plt    
import io
import base64
from RnD.benchmark import benchmark_score_llama, run_benchmark_from_excel, get_user_weights

EXCEL_FILE_PATH = r"gutmicrobiome​_scored_disease_output.xlsx"

# Default Weights
default_weights = {
    "No_of_Patient_Treated": 0.20,
    "Gut_Microbiome_Association": 0.15,
    "Rifaximin_Treatment": 0.20,
    "Prevalence": 0.20,
    "Bausch_Presence": 0.15,
    "Safety_Efficacy": 0.10
}

@app.route('/api/rnd-formulation-drug', methods=['GET'])
def get_rnd_formulation_drug():
    try:
        # Retrieve the selected_tabs parameter from the request
        requested_tabs_raw = request.args.get('selected_tabs')  # Expecting a comma-separated string
        print("Raw requested_tabs:", requested_tabs_raw)
        
        if not requested_tabs_raw:
            raise ValueError("Missing 'selected_tabs' parameter in request")

        # Split the selected_tabs string by commas and sanitize
        requested_tabs = [tab.strip().lower().replace(" ", "_") for tab in requested_tabs_raw.split(',')]
        print("Sanitized requested_tabs:", requested_tabs)

        if not os.path.exists(EXCEL_FILE_PATH):
            raise ValueError("Excel file does not exist in backend")
        
        # Read the Excel file
        xl = pd.ExcelFile(EXCEL_FILE_PATH)
        
        # Read the single sheet into a DataFrame
        df = xl.parse('Sheet1')
        
        # Sanitize column names (strip spaces, lowercase, replace spaces with underscores)
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
        
        print("Sanitized columns in the Excel file:", df.columns)

        # Ensure the requested columns exist in the DataFrame (case insensitive)
        missing_columns = [col for col in requested_tabs if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing columns in the Excel file: {', '.join(missing_columns)}")

        # Extract the requested columns
        data = df[requested_tabs].to_dict(orient='records')

        # Send back the relevant data
        response_data = {
            "data": data,
            "message": "Columns retrieved successfully"
        }
        
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

#==== BENCHMARK TABLE SCORE API ROUTE ====
@app.route('/api/benchmark-table', methods=['GET'])
def get_benchmark_table():
    try:
        # User-defined Weights (you can replace this part with dynamic input from user interface)
        # custom_weights = get_user_weights()  # User-defined weights input
        
        # Read the Excel file
        xl = pd.ExcelFile(EXCEL_FILE_PATH)
        
        # Read the sheet into a DataFrame
        df = xl.parse('Sheet1')
        print("cols:",df.columns)
        # Sanitize column names (strip spaces, lowercase, replace spaces with underscores)
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        # Calculate benchmark scores for each disease
        benchmark_scores = []
        for index, row in df.iterrows():
            scores, total = benchmark_score_llama(
                enrollment=row['enrollment'],
                mechanism_text=row['disease_mechanism'],
                justification=row['justification_for_drug_use'],
                prevalence=row['prevalence'],
                bausch_presence_text=row['bausch_presence'],
                safety=row['safety'],
                efficacy=row['efficacy'],
                weights=default_weights  # Use default weights initially
            )
            benchmark_scores.append({"Disease": row['disease'], "Benchmark Score": total, "Weights": default_weights})

        # Create the Benchmark Table with diseases, default weights, and benchmark scores
        benchmark_table = pd.DataFrame(benchmark_scores)

        # Send back the benchmark table
        response_data = {
            "benchmark_table": benchmark_table.to_dict(orient='records'),
            "message": "Benchmark Table retrieved successfully"
        }
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


#==== Top 5 Diseases to expolore in PIE CHART ====
@app.route('/api/pie-chart', methods=['GET'])
def get_pie_chart():
    try:
        # User-defined Weights (you can replace this part with dynamic input from user interface)
        custom_weights = get_user_weights()  # User-defined weights input
        
        # Read the Excel file
        xl = pd.ExcelFile(EXCEL_FILE_PATH)
        
        # Read the sheet into a DataFrame
        df = xl.parse('Sheet1')
        
        # Sanitize column names (strip spaces, lowercase, replace spaces with underscores)
        # Sanitize column names (strip spaces, lowercase, replace spaces with underscores)
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        # Calculate benchmark scores for each disease
        benchmark_scores = []
        for index, row in df.iterrows():
            scores, total = benchmark_score_llama(
                enrollment=row['enrollment'],
                mechanism_text=row['disease_mechanism'],
                justification=row['justification_for_drug_use'],
                prevalence=row['prevalence'],
                bausch_presence_text=row['bausch_presence'],
                safety=row['safety'],
                efficacy=row['efficacy'],
                weights=default_weights  # Use default weights initially
            )
            benchmark_scores.append({"Disease": row['disease'], "Benchmark Score": total, "Weights": default_weights})

        # Create the Benchmark Table with diseases, default weights, and benchmark scores
        benchmark_df = pd.DataFrame(benchmark_scores)
        # Drop duplicates based on 'Disease' column (keeping the first occurrence)
        benchmark_df = benchmark_df.drop_duplicates(subset='Disease', keep='first')

        # Get the top 5 diseases based on benchmark score
        top_scores = benchmark_df.nlargest(5, 'Benchmark Score')  # Get top 5 diseases
        pie_data = top_scores['Benchmark Score'].values
        labels = top_scores['Disease'].values

        # Generate Pie Chart
        fig, ax = plt.subplots(figsize=(8, 8))  # Aspect ratio for a square pie chart
        ax.pie(pie_data, labels=labels, autopct='%1.1f%%', startangle=90, wedgeprops={'edgecolor': 'black'})
        ax.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.

        # Save the pie chart to a BytesIO object
        img_bytes = io.BytesIO()
        plt.savefig(img_bytes, format='png')
        plt.close(fig)  # Close the plot to free memory
        img_bytes.seek(0)

        # Convert image to base64 for sending to the frontend
        img_base64 = base64.b64encode(img_bytes.read()).decode('utf-8')

        return jsonify({
            "pie_chart": img_base64,
            "message": "Pie chart generated successfully"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# def rnd_formulation_drug():
#     """
#     SSE endpoint that streams LLaMA results for R&D Formulations.
#     """
#     # user_query = request.args.get('user_query')
#     # size = request.args.get('size', default=2, type=int)
#     # Accept requested fields as a comma-separated list
#     requested_fields = request.args.get('requested_fields', '')
#     # Log the raw input
#     print("Raw requested_fields:", repr(requested_fields))
#     print("Type of requested_fields:", type(requested_fields))

#     # # Convert requested fields into a list
#     # if isinstance(requested_fields, list):
#     #     processed_fields = [field.strip() for field in requested_fields if field.strip()]
#     # else:
#     #     processed_fields = [field.strip() for field in requested_fields.split(',') if field.strip()]

#     # print("Processed requested_fields:", processed_fields)
#     # print("Type after processing:", type(processed_fields))

#     # if not user_query:
#     #     return jsonify({"error": "Missing 'user_query'"}), 400

#     # # Fetch Elasticsearch results
#     # raw_results = fetch_results(user_query, size=size)

#     # # Stream results as SSE (pass processed fields)
#     # return Response(
#     #     stream_drug(raw_results, user_query, processed_fields),
#     #     content_type="text/event-stream",
#     #     status=200
#     # )

    # response_data = {"requested_tabs": requested_fields, "message": "Data fetched successfully"}
        
    # return jsonify(response_data), 200

  

 
# @app.route('/api/rnd-formulation-drug-results', methods=['GET'])
# def get_results():
    # try:
    #     selected_columns = request.json.get('columns')
        
    #     if not os.path.exists(EXCEL_FILE_PATH):
    #         raise ValueError("Excel file does not exist in backend")
    #     if not selected_columns:
    #         raise ValueError("No columns provided")
        
    #     df = pd.read_excel(EXCEL_FILE_PATH)
    #     missing_columns = [col for col in selected_columns if col not in df.columns]
    #     if missing_columns:
    #         raise ValueError(f"Columns not found in the file: {missing_columns}")
        
    #     extracted_data = df[selected_columns].to_dict(orient='records')
        
    #     return jsonify({"extracted_data": extracted_data, "message": "Columns extracted successfully"}), 200
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 400
#     """Endpoint to fetch processed LLaMA-3.3 results."""
    # user_query = request.args.get("user_query")
    # if not user_query or user_query not in processed_cache:
    #     return jsonify({"error": "Results not ready yet"}), 404

    # return jsonify({"results": processed_cache[user_query]}), 200

@app.route('/add-ai-column-rnd', methods=['POST'])
def add_ai_column_rnd():
    """
    Receives JSON with:
      - userQuery
      - columnName
      - columnDescription

    Returns JSON with:
      - updated_ai_responses: an array of strings,
        each one corresponding (by index) to an SSE record in the frontend.
    """
    data = request.get_json()

    user_query = data.get('userQuery')
    column_name = data.get('columnName')
    column_description = data.get('columnDescription')

    # Retrieve or replicate the SSE data in the same order
    results = fuzzy_search(user_query)

    # Generate or fetch the new AI field for each item
    updated_ai_responses = getAIColumn(results, column_name, column_description)

    # Return the array so the frontend can merge it by index
    return jsonify({
        "updated_ai_responses": updated_ai_responses
    })



@app.route('/rnd-excel-export', methods=['POST'])
def rnd_excel_export():
    """
    Expects JSON in the format:
    {
      "data": [ ... array of objects ... ]
    }
    Returns an Excel file with two sheets:
      - "pub_med" for items that have "PMC_ID"
      - "patent" for items that have "Publication_Date"
    """
    # Retrieve the JSON payload from the request
    payload = request.get_json(silent=True) or {}
    data = payload.get("data", [])

    if not isinstance(data, list):
        return jsonify({"error": "Invalid data. 'data' should be a list."}), 400

    # Separate pub_med vs. patent data
    pmc_data = [item for item in data if "PMC_ID" in item]
    patent_data = [item for item in data if "Publication_Date" in item]

    # Create an Excel workbook with openpyxl
    wb = Workbook()

    # 1) Create the 'pub_med' sheet
    ws_pubmed = wb.active
    ws_pubmed.title = "pub_med"

    # Gather all distinct keys from pmc_data for column headers
    pmc_keys = set()
    for row in pmc_data:
        pmc_keys.update(row.keys())
    pmc_columns = list(pmc_keys)

    # Write column headers for pub_med
    ws_pubmed.append(pmc_columns)

    # Write rows for pub_med
    for row in pmc_data:
        values = [row.get(key, "") for key in pmc_columns]
        ws_pubmed.append(values)

    # 2) Create the 'patent' sheet
    ws_patent = wb.create_sheet(title="patent")

    patent_keys = set()
    for row in patent_data:
        patent_keys.update(row.keys())
    patent_columns = list(patent_keys)

    # Write column headers for patent
    ws_patent.append(patent_columns)

    # Write rows for patent
    for row in patent_data:
        values = [row.get(key, "") for key in patent_columns]
        ws_patent.append(values)

    # Save the workbook to an in-memory buffer
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    # Return the Excel file as an attachment
    return send_file(
        output,
        as_attachment=True,
        download_name="exported_data.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )    

if __name__ == '__main__':
    app.run(debug=True)
