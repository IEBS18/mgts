from flask import Flask, request, jsonify, send_file
import pandas as pd
from io import BytesIO
from flask_cors import CORS
import sys
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

from MarketEstimation.market import visualize_market_size
from MarketEstimation.market import visualize_therapy_cost
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
CORS(app)


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
    data= request.json
    # type_of_plot = data.get('number')
    disease = data.get('disease')
    # if type_of_plot and disease:
        # if type_of_plot == '1':
        #     visualize_market_size(disease)
        # elif type_of_plot == '2':
    all_years, combined_therapy_cost= visualize_therapy_cost(disease)
    return jsonify({'all_years': all_years, 'combined_therapy_cost': combined_therapy_cost})
 
@app.route('/market-estimation', methods=['POST'])
def market_estimation():
    data= request.json
    disease = data.get('disease')
    years, forecast_years, market_predictions, market_size= visualize_market_size(disease)
    return jsonify({
        'years': years,
        'forecast_years': forecast_years,
        'combined_prevalence': [],
        'market_predictions': market_predictions.tolist(),
        'market_size': market_size
    })
    
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

        if not column_name or not column_description:
            return jsonify({"error": "Both columnName and columnDescription are required"}), 400

        print(f"Adding AI column: {column_name}, Description: {column_description}")
        print(f"Search results associated: {search_results}")

        return jsonify({"message": "AI column added successfully!"}), 200

    except Exception as e:
        print(f"Error while adding AI column: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
