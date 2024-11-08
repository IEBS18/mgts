from flask import Flask, request, jsonify, send_file
import pandas as pd
from io import BytesIO
from flask_cors import CORS
import sys
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

from Utilities.search import preprocess
from Utilities.summarize import summarize_by_title_or_org
from Utilities.chatbot import (
    process_question,
    es,
    conversation_history,
)

app = Flask(__name__)
CORS(app)


@app.route('/search', methods=['POST'])
def search():
    # Get the search keyword from the request
    search_keyword = request.json.get('keyword')
    
    # Ensure the keyword is provided before further processing
    if not search_keyword:
        return jsonify({"error": "No search keyword provided."}), 400

    # Preprocess the search keyword
    query = preprocess(search_keyword)
    
    if isinstance(query, set):
        query = ' '.join(query)
    
    print(query)

    # Define two separate queries: one for `categorix_v2` and one for `drug-disease-indication`
    es_query = [
        # Query for categorix_v2 (specific fields: title, abstract)
        {"index": "pregranted"},
        {
            "query": {
                "query_string": {
                    "query": query,
                    "fields": ["Title", "Abstract"],
                    "default_operator": "AND",  # Search only in title and abstract fields
                    "fuzziness": "AUTO"  # Adding fuzziness
                }
            },
            "size": 10000
        },
        # Query for drug-disease-indication (search all fields)
        {"index": "drug-disease-indication"},
        {
            "query": {
                "query_string": {
                    "query": query, 
                    "default_operator": "AND",  # Search the same query across all fields
                    "fuzziness": "AUTO"  # Adding fuzziness
                }
            },
            "size": 10000
        },
        {"index": "clinicaltrial"},
        {
            "query": {
                "query_string": {
                    "query": query, 
                    "default_operator": "AND",  # Search the same query across all fields
                    "fuzziness": "AUTO"  # Adding fuzziness
                }
            },
            "size": 10000
        },
        {"index": "pubmed"},
        {
            "query": {
                "query_string": {
                    "query": query, 
                    "default_operator": "AND",  # Search the same query across all fields
                    "fuzziness": "AUTO"  # Adding fuzziness
                }
            },
            "size": 10000
        }
    ]

    # Perform the multi-search in Elasticsearch
    try:
        response = es.msearch(body=es_query)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Extract and combine hits from both queries directly
    documents = [hit['_source'] for res in response['responses'] for hit in res['hits']['hits']]

    # Reset the conversation history
    conversation_history.clear()

    # Return the combined results as a single list of documents
    return jsonify({"documents": documents, "query": query}), 200

@app.route('/disease-search', methods=['POST'])
def disease_search():
    data = request.json
    search_type = data.get("search_type")
    index = "combined_country_drug"

    es_query = []

    if search_type == "disease":
        disease_names = data.get("disease_name", [])
        country_names = data.get("country_name", [])

        es_query.append({"index": index})
        es_query.append({
    "query": {
        "bool": {
            "must": [
                # Exact match on the Disease field using the .keyword sub-field
                {"term": {
                    "Disease.keyword": disease_names  # Use the .keyword sub-field for exact matching
                }},
                # Exact match on the Country field using the .keyword sub-field
                {"terms": {
                    "Country.keyword": country_names  # Ensure you are using .keyword for exact match on Country as well
                }}
            ]
        }
    },
    "size": 10000  # Control the number of results for performance
})

    elif search_type == "drug":
        drug_names = data.get("drug_names", [])
        country_names = data.get("country_name", [])

        es_query.append({"index": index})
        es_query.append({
            "query": {
                "bool": {
                    "must": [
                        {"term": {"Active Ingredient.keyword": drug_names}},        # Explicit field search for Drug
                        {"terms": {"Country.keyword": country_names}}   # Explicit field search for Country
                    ]
                }
            }
        })

    elif search_type == "symptoms":
        search_keyword = data.get("search_keyword", "")
        country_name = data.get("country_name", "")

        es_query.append({"index": index})
        es_query.append({
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "Symptoms": {
                                    "query": search_keyword,
                                    "fuzziness": "AUTO"
                                }
                            }
                        },
                        {"terms": {"Country.keyword": country_name}}  # Explicit field search for Country
                    ]
                }
            }
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
    response = process_question(results, query, conversation_history)
    print(conversation_history)
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


@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    data = request.json
    selected_cards = data.get('selectedCards')
    print(selected_cards)
    summary = summarize_by_title_or_org(selected_cards)
    return jsonify({"summary": summary})
    
    
if __name__ == '__main__':
    app.run(debug=True)
