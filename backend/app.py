from flask import Flask, request, jsonify, send_file, make_response
import pandas as pd
from io import BytesIO
from flask_cors import CORS
import sys
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import os
import json
sys.stdout.reconfigure(encoding='utf-8')

from PlayerLandscape.player import get_disease_data
from dotenv import load_dotenv
load_dotenv()

from MarketEstimation.market import get_country_data

# from MarketEstimation.market import visualize_therapy_cost
# from Utilities.search import preprocess
from Utilities.summarize import summarize_by_title_or_org
from Utilities.chatbot import (
    # process_question,
    es,
    conversation_history,
)
from Utilities.diseasechatbot import (
    process_question,
    disease_conversation_history,
)
from Utilities.AIColumn import update_drug_data

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# # Load database URL from environment variables (or you can hardcode it for local development)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost:5432/db_name'

# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy(app)

# # Define User model
# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Text, unique=True, nullable=False)  # UUID for user identification
#     first_name = db.Column(db.Text, nullable=False)
#     last_name = db.Column(db.Text, nullable=False)
#     email = db.Column(db.Text, unique=True, nullable=False)
#     password = db.Column(db.Text, nullable=False)

# with app.app_context():
#     db.create_all()

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

    # Respond with success
    return jsonify({
        "user_pharmax_id": new_user["id"],
        "first_name": first_name,
        "message": "Account created successfully!"
    }), 201

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)

    if user and check_password_hash(user['password_hash'], password):
        response = jsonify({
            "user_pharmax_id": user["id"],
            "first_name": user["first_name"],
            "message": "Login successful!"
        })
        # Set the user_id cookie
        response.set_cookie('user_id', str(user["id"]), httponly=True)
        return response, 200
    return jsonify({"error": "Invalid credentials!"}), 401


# Check if user is logged in (session or cookie based)
@app.route('/check_login', methods=['GET'])
def check_login():
    user_id = request.cookies.get('user_id')  # Retrieve the 'user_id' cookie
    if user_id:
        return jsonify({'logged_in': True}), 200
    return jsonify({'logged_in': False}), 401



# @app.route('/search', methods=['POST'])
# def search():
#     # Get the search keyword from the request
#     search_keyword = request.json.get('keyword')
    
#     # Ensure the keyword is provided before further processing
#     if not search_keyword:
#         return jsonify({"error": "No search keyword provided."}), 400

#     # Preprocess the search keyword
#     query = preprocess(search_keyword)
    
#     if isinstance(query, set):
#         query = ' '.join(query)
    
#     print(query)

#     # Define two separate queries: one for `categorix_v2` and one for `drug-disease-indication`
#     es_query = [
#         # Query for categorix_v2 (specific fields: title, abstract)
#         {"index": "pregranted"},
#         {
#             "query": {
#                 "query_string": {
#                     "query": query,
#                     "fields": ["Title", "Abstract"],
#                     "default_operator": "AND",  # Search only in title and abstract fields
#                     "fuzziness": "AUTO"  # Adding fuzziness
#                 }
#             },
#             "size": 10000
#         },
#         # Query for drug-disease-indication (search all fields)
#         {"index": "drug-disease-indication"},
#         {
#             "query": {
#                 "query_string": {
#                     "query": query, 
#                     "default_operator": "AND",  # Search the same query across all fields
#                     "fuzziness": "AUTO"  # Adding fuzziness
#                 }
#             },
#             "size": 10000
#         },
#         {"index": "clinicaltrial"},
#         {
#             "query": {
#                 "query_string": {
#                     "query": query, 
#                     "default_operator": "AND",  # Search the same query across all fields
#                     "fuzziness": "AUTO"  # Adding fuzziness
#                 }
#             },
#             "size": 10000
#         },
#         {"index": "pubmed"},
#         {
#             "query": {
#                 "query_string": {
#                     "query": query, 
#                     "default_operator": "AND",  # Search the same query across all fields
#                     "fuzziness": "AUTO"  # Adding fuzziness
#                 }
#             },
#             "size": 10000
#         }
#     ]

#     # Perform the multi-search in Elasticsearch
#     try:
#         response = es.msearch(body=es_query)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     # Extract and combine hits from both queries directly
#     documents = [hit['_source'] for res in response['responses'] for hit in res['hits']['hits']]

#     # Reset the conversation history
#     conversation_history.clear()

#     # Return the combined results as a single list of documents
#     return jsonify({"documents": documents, "query": query}), 200



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
        # Search the 'combined-drug-data' index
        # drug_response = es.search(index='combined_country_drug', body=query)

        # # Extract relevant data from the Elasticsearch response
        # drugs = []
        # for hit in response['hits']['hits']:
        #     drug_info = hit['_source']  # Assuming the relevant drug info is in the "_source" field
        #     drugs.append(drug_info)
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
    search_type = data.get("search_type")
    index = "disease_data_final"

    es_query = []
    search_keyword = data.get("search_keyword", "")
    # country_names = data.get("country_name", [])

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
    print(results)
    response = process_question(results, query, disease_conversation_history)
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
        
        updated_results = update_drug_data(search_results, column_name, column_description)
        print(updated_results)

        if not column_name or not column_description:
            return jsonify({"error": "Both columnName and columnDescription are required"}), 400

        print(f"Adding AI column: {column_name}, Description: {column_description}")
        print(f"Search results associated: {search_results}")

        return jsonify({"updated_results": updated_results}), 200

    except Exception as e:
        print(f"Error while adding AI column: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
