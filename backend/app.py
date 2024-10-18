from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()


from Utilities.search import preprocess
from Utilities.summarize import summarize_by_title_or_org
from Utilities.chatbot import (
    search_with_tfidf,
    create_openai_prompt,
    generate_openai_completion,
    es,
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
                    "default_operator": "AND"# Search only in title and abstract fields
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
                    "default_operator": "OR" # Search the same query across all fields
                }
            },
            "size": 10000
        },
        {"index": "clinical-trial-outcomes"},
        {
            "query": {
                "query_string": {
                    "query": query, 
                    "default_operator": "OR" # Search the same query across all fields
                }
            },
            "size": 10000
        },
        {"index": "pubmed"},
        {
            "query": {
                "query_string": {
                    "query": query, 
                    "default_operator": "OR" # Search the same query across all fields
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

    # Return the combined results as a single list of documents
    return jsonify({"documents": documents, "query": query}), 200


# Define the route for the API
@app.route('/ask', methods=['POST'])
def ask():
    global conversation_history
    data = request.json
    query = data.get('query')
    results = data.get('results')
    removed_english_descriptions = []
    for result in results:  # Check if 'type' is 'pregranted'
        if result.get('type') == 'pregranted':
            removed_english_description = result.pop('english_description', '')  
            # if removed_english_description is not None:
            removed_english_descriptions.append(removed_english_description)
    print(removed_english_descriptions[:5])
    full_results, filtered_results = search_with_tfidf(results, query)

    # Output the full results with scores
    # print("Full Results with Scores:")
    # for result, score in full_results[:3]:
    #     print(f"Result: {result}, Relevance Score: {score}")

    # Output the filtered results without scores
    # print("\nFiltered Results without Scores:")
    # for result in filtered_results:
    #     print(f"Filtered Result: {result}")


    # Get Elasticsearch results
    # elasticsearch_results = get_elasticsearch_results(query)
    # print(elasticsearch_results)
    # elasticsearch_results1 = results[:top_n]
    # print(elasticsearch_results1)
    # Create OpenAI prompt
    context_prompt = create_openai_prompt(filtered_results[:5])
    # Add context to conversation history
    # if system role is not present, add it
    if not any(d['role'] == 'system' for d in conversation_history):
        conversation_history.append({"role": "system", "content": context_prompt})
        print("added system context.")
    # Generate OpenAI completion
    openai_completion = generate_openai_completion(query)
 
    return jsonify({"results": openai_completion})


@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    data = request.json
    selected_cards = data.get('selectedCards')
    print(selected_cards)
    summary = summarize_by_title_or_org(selected_cards)
    return jsonify({"summary": summary})
    
    
if __name__ == '__main__':
    app.run(debug=True)
