from flask import Flask, request, jsonify
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
        {"index": "categorix_v2"},
        {
            "query": {
                "query_string": {
                    "query": query,
                    "fields": ["title", "abstract"],
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
                    "default_operator": "OR",  # Search the same query across all fields
                    "fuzziness": "AUTO"  # Adding fuzziness
                }
            },
            "size": 10000
        },
        {"index": "clinical-trial-outcomes"},
        {
            "query": {
                "query_string": {
                    "query": query, 
                    "default_operator": "OR",  # Search the same query across all fields
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
                    "default_operator": "OR",  # Search the same query across all fields
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
