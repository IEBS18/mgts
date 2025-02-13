from pathlib import Path
from flask import Flask, request, jsonify, send_file, make_response
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
    es_exceptions
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
    index = "disease_data_final"

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


def fetch_drug_data(drug_names):
    """
    Fetch efficacy, safety, modality, and submodality for given drug names from Elasticsearch.
   
    Parameters:
        drug_names (list): List of drug names to search for.
       
    Returns:
        dict: Drug data mapped with efficacy, safety, modality, and submodality.
    """
 
    index_name = "tpp_data_refine"  # Use the environment variable
    results = {}
 
    for drug in drug_names:
        query = {
            "query": {
                "match": {
                    "Drug": {
                        "query": drug,
                        "fuzziness": "AUTO"  # Enables fuzzy search for approximate matches
                    }
                }
            }
        }
 
        try:
            result = es.search(index=index_name, body=query)
        except es_exceptions.ConnectionError:
            return {"error": "Failed to connect to Elasticsearch."}, 500
        except es_exceptions.AuthenticationException:
            return {"error": "Authentication with Elasticsearch failed."}, 401
        except Exception as e:
            return {"error": f"An error occurred: {str(e)}"}, 500
 
        hits = [hit['_source'] for hit in result['hits']['hits']]
        print(f"Found {len(hits)} hits for drug: {drug}")
       
        if hits:
            hits = hits[0]
            results[drug] = {
                    "Efficacy": hits.get("Efficacy", "Not Available"),
                    "Safety": hits.get("Safety", "Not Available"),
                    "Modality": hits.get("Modality", "Not Available"),
                    "SubModality": hits.get("SubModality", "Not Available")
                }
        else:
            results[drug] = "No matching data found"
 
    return results

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
    safety_efficacy_data = fetch_drug_data(drug_names)

    # Check if fetch_drug_data returned an error
    if isinstance(safety_efficacy_data, tuple):
        # It's an error response
        return jsonify(safety_efficacy_data[0]), safety_efficacy_data[1]

    return jsonify(safety_efficacy_data), 200


openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"
 
def predict_tier_and_requirement(new_plan: dict, competitor_data: dict):
    """
    Predicts the Tier and Requirement for a new drug plan based on competitor data.
 
    Args:
        new_plan (dict): Dictionary containing new plan details:
            - drug_name (str)
            - diseasesname (str)
            - efficacy (str)
            - safety (str)
            - modality (str)
        competitor_data (dict): Dictionary containing competitor data in the format:
            {
                "Disease Name": {
                    "Drug Name": [
                        {
                            "Efficacy": "...",
                            "Safety": "...",
                            "Modality": "...",
                            "Tier": "...",
                            "Requirement": "..."
                        },
                        ...
                    ],
                    ...
                },
                ...
            }
 
    Returns:
        dict: Parsed response containing "Tier" and "Requirement", or error.
    """
    drug_name = new_plan.get("drug_name")
    diseasesname = new_plan.get("diseasesname")
    efficacy = new_plan.get("efficacy")
    safety = new_plan.get("safety")
    modality = new_plan.get("modality")
 
    app.logger.info(f"Predicting Tier and Requirement for Drug: {drug_name} under Disease: {diseasesname}")
 
    # Fetch competitor data for the given disease
    disease_competitors = competitor_data.get(diseasesname, {})
 
    if not disease_competitors:
        app.logger.error(f"No competitor data found for disease: {diseasesname}")
        return {
            "error": "No competitor data found for this disease.",
            "message": "No competitor data found for this disease."
        }
 
    # Construct the competitor data section of the prompt
    competitor_section = f"Disease: {diseasesname}\n"
    for competitor_drug, details_list in disease_competitors.items():
        for detail in details_list:
            competitor_section += (
                f"Drug: {competitor_drug}\n"
                f"Efficacy: {detail.get('Efficacy', 'N/A')}\n"
                f"Safety: {detail.get('Safety', 'N/A')}\n"
                f"Modality: {detail.get('Modality', 'N/A')}\n"
                f"Tier: {detail.get('Tier', 'N/A')}\n"
                f"Requirement: {detail.get('Requirement', 'N/A')}\n\n"
            )
 
    app.logger.debug(f"Constructed Competitor Section:\n{competitor_section}")
 
    # Prepare prompt for OpenAI API
    system_prompt = (
        "You are an expert in formulary management. "
        "Your task is to analyze the formulary tier placement and associated limitations for a new drug based on existing competitor data."
    )
    user_prompt = (
        f"{competitor_section}"
        f"New Drug Details:\n"
        f"Drug Name: {drug_name}\n"
        f"Efficacy: {efficacy}\n"
        f"Safety: {safety}\n"
        f"Modality: {modality}\n\n"
        f"Based on the above information, determine the appropriate Tier and any Requirements/Limits for the new drug."
    )
 
    app.logger.debug(f"Constructed User Prompt:\n{user_prompt}")
 
    try:
        # Call OpenAI for predictions using the new interface
        response = openai_client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
 
        app.logger.info("Received response from OpenAI.")
 
        # Parse the response from OpenAI
        reply = response.choices[0].message.content.strip()
        app.logger.debug(f"OpenAI Reply:\n{reply}")
 
        # Initialize response dictionary with defaults
        parsed_response = {
            "Tier": "N/A",
            "Requirement": "Fully Reimbursed"
        }
 
        # Extract Tier and Requirement from the reply
        for line in reply.split("\n"):
            if line.lower().startswith("tier:"):
                parsed_response["Tier"] = line.split(":", 1)[1].strip() or "N/A"
            elif line.lower().startswith("requirement:"):
                parsed_response["Requirement"] = line.split(":", 1)[1].strip() or "Fully Reimbursed"
 
        app.logger.info(f"Parsed Response: {parsed_response}")
 
        return parsed_response
 
    except Exception as e:
        app.logger.exception("Exception occurred while processing OpenAI response.")
        return {
            "error": "Failed to parse OpenAI response",
            "message": str(e)
        }
 
# Route for predicting tier and requirement
@app.route('/predict_tier_and_requirement', methods=['POST'])
def predict_tier_and_requirement_route():
    """
    Endpoint to predict the Tier and Requirement for a new drug plan.
 
    Expects a JSON payload:
    {
        "drug_name": "Aspirin",
        "diseasesname": "Hypertension",
        "efficacy": "Effective in reducing blood clot formation",
        "safety": "Generally safe with minor gastrointestinal side effects",
        "modality": "Small Molecule",
        "competitor_data": {
            "Hypertension": {
                "Amlodipine": [
                    {
                        "Efficacy": "Effective in lowering blood pressure",
                        "Safety": "Generally well tolerated, mild headaches reported",
                        "Modality": "Small Molecule",
                        "Tier": "Tier 1",
                        "Requirement": "No prior authorization required"
                    },
                    {
                        "Efficacy": "Moderate effectiveness in elderly patients",
                        "Safety": "Mild dizziness and occasional swelling",
                        "Modality": "Small Molecule",
                        "Tier": "Tier 2",
                        "Requirement": "Prior authorization required for patients over 65"
                    }
                ],
                "Losartan": [
                    {
                        "Efficacy": "Strong efficacy in preventing strokes and heart failure",
                        "Safety": "Mild fatigue and occasional dry cough",
                        "Modality": "Small Molecule",
                        "Tier": "Tier 2",
                        "Requirement": "Step therapy required"
                    }
                ]
            }
        }
    }
    """
    data = request.json
 
    # Extract fields from the request
    drug_name = data.get('drug_name')
    diseasesname = data.get('diseasesname')
    efficacy = data.get('efficacy')
    safety = data.get('safety')
    modality = data.get('modality')
    competitor_data = data.get('competitor_data')  # Expecting this in the request
 
    # Validate input
    missing_fields = []
    for field in ['drug_name', 'diseasesname', 'efficacy', 'safety', 'modality', 'competitor_data']:
        if not data.get(field):
            missing_fields.append(field)
 
    if missing_fields:
        message = f"The following fields are required: {', '.join(missing_fields)}."
        app.logger.error(message)
        return jsonify({
            "status": "error",
            "message": message
        }), 400
 
    # Validate competitor_data structure
    if not isinstance(competitor_data, dict):
        message = "Invalid format for competitor_data. It should be a dictionary."
        app.logger.error(message)
        return jsonify({
            "status": "error",
            "message": message
        }), 400
 
    # Further validation: Ensure diseasesname exists in competitor_data
    if diseasesname not in competitor_data:
        message = f"Disease '{diseasesname}' not found in competitor_data."
        app.logger.error(message)
        return jsonify({
            "status": "error",
            "message": message
        }), 400
 
    try:
        # Construct new_plan dictionary
        new_plan = {
            "drug_name": drug_name,
            "diseasesname": diseasesname,
            "efficacy": efficacy,
            "safety": safety,
            "modality": modality
        }
 
        app.logger.info(f"Processing new plan: {new_plan}")
 
        # Call the prediction function
        prediction = predict_tier_and_requirement(new_plan, competitor_data)
 
        # Check if the result is an error or a valid prediction
        if "error" in prediction:
            app.logger.error(f"Prediction Error: {prediction['message']}")
            return jsonify({"status": "error", "message": prediction["message"]}), 500
 
        # Return successful prediction response
        response_payload = {
            "status": "success",
            "tier": prediction["Tier"],  # Return Tier
            "requirement": prediction["Requirement"]  # Return Requirement
        }
 
        app.logger.info(f"Prediction Successful: {response_payload}")
 
        return jsonify(response_payload), 200
 
    except Exception as e:
        app.logger.exception("Unexpected error during prediction.")
        return jsonify({"status": "error", "message": str(e)}), 500
    
   
   
   
   
   
  
  ########## RND FORMUALTION #####################


# Define the fields to search within each index
index_fields = {
    "test": ["Title", "Full Paper"],
    "granted_updated_final": ["Title", "Abstract", "Claim"],
    "pregranted": ["Title", "Claim", "Abstract"]
}

# Define post-processing fields to return from each index
post_processing_fields = {
    "granted_updated_final": [
        "Display_Key", "Title", "Abstract", "Claim", "Publication_Date",
        "Assignee_Applicant", "Inventor", "IPC_Classifications", "CPC_Classifications"
    ],
    "pregranted": [
        "Display_Key", "Title", "Abstract", "Claim", "Publication_Date",
        "Assignee_Applicant", "Inventor", "IPC_Classifications", "CPC_Classifications"
    ],
    "test": ["PMC_ID", "Title", "Abstract", "Full Paper"]
}

def search_index(index_name, user_query, fields, size=10):
    """
    Searches a given Elasticsearch index using a multi-match query with fuzziness.
    """
    query_body = {
        "query": {
            "multi_match": {
                "query": user_query,
                "fields": fields,
                "fuzziness": "AUTO"
            }
        },
        "size": size
    }
    response = es.search(index=index_name, body=query_body)
    hits = response.get("hits", {}).get("hits", [])
    return [
        {"index": index_name, "score": hit["_score"], "source": hit["_source"]}
        for hit in hits
    ]

def fuzzy_search(user_query, size=10):
    """
    Performs the fuzzy search across all specified indexes and returns merged raw results.
    """
    all_results = []
    for index_name, fields in index_fields.items():
        results = search_index(index_name, user_query, fields, size)
        all_results.extend(results)
    return all_results

def process_results(all_results):
    """
    Processes the raw search results by filtering out only the desired fields for each index.
    """
    processed_results = []
    for result in all_results:
        index_name = result["index"]
        source_data = result["source"]
        if index_name in post_processing_fields:
            # Keep only the post-processing fields defined for this index
            filtered_data = {key: source_data.get(key) for key in post_processing_fields[index_name]}
        else:
            filtered_data = source_data
        processed_results.append(filtered_data)
    return processed_results

@app.route('/api/rnd-formulation', methods=['POST'])
def rnd_formulation():
    """
    Expects a JSON payload like:
      { "user_query": "lamivudine", "size": 10 }
    
    It returns a JSON response with the processed search results.
    """
    data = request.get_json()
    if not data or 'user_query' not in data:
        return jsonify({"error": "Missing 'user_query' in request body"}), 400

    user_query = data['user_query']
    # Allow a size parameter for limiting results (default to 10 if not provided)
    size = int(data.get("size", 10))

    # Perform fuzzy search across the defined indexes
    raw_results = fuzzy_search(user_query, size=size)
    processed_results = process_results(raw_results)
    
    # Return the processed results as JSON
    return jsonify({"results": processed_results}), 200  
    
    
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
