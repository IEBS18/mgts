from flask import Flask, request, jsonify
import os
import json
from flask_cors import CORS
import pandas as pd

from openai import OpenAI
import requests

from Utilities.search import process_multiple_files, preprocess
# from PharmaX1.reference.Models import callLLMChatBot
# from llama_index.core import Document, StorageContext, VectorStoreIndex, load_index_from_storage
# from llama_index.core.node_parser import SentenceSplitter
# from llama_index.embeddings.openai import OpenAIEmbedding


from elasticsearch import Elasticsearch

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from dotenv import load_dotenv
load_dotenv()


# Ensure NLTK resources are downloaded

app = Flask(__name__)
CORS(app)
es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

@app.route('/search', methods=['POST'])
def search():
    # Get the search keyword from the request
    search_keyword = request.json.get('keyword')
    
    # openai_api_key = os.environ.get('OPENAI_API_KEY')
    # headers = {
    #     'Authorization': f'Bearer {openai_api_key}',
    #     'Content-Type': 'application/json'
    # }

    # openai_payload = {
    #     'model': 'gpt-4o-mini',
    #     'messages': [
    #         {'role': 'system', 
    #          'content': 'You are a chemical expert. You will be given a query, you have to return only drugs/chemical names and important words only. Return your answer in just plain text.'},
    #         {'role': 'user', 
    #          'content': f"Query: {search_keyword}"}
    #     ]
    # }

    # openai_response = requests.post(
    #     'https://api.openai.com/v1/chat/completions',
    #     headers=headers,
    #     json=openai_payload
    # )

    # openai_data = openai_response.json()

    # Handle response from OpenAI and extract the SQL query
    # if openai_response.status_code == 200:
    #     query = openai_data['choices'][0]['message']['content']
    #     # print(f"Generated SQL Query: {sql_query}")
    # else:
    #     raise Exception(f"OpenAI API failed: {openai_data}")
    
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
        }
    ]

    # chat
    # Perform the multi-search in Elasticsearch
    try:
        response = es.msearch(body=es_query)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Extract and combine hits from both queries directly
    documents = [hit['_source'] for res in response['responses'] for hit in res['hits']['hits']]

    # Return the combined results as a single list of documents
    return jsonify({"documents": documents, "query": query}), 200


# @app.route('/search', methods=['POST'])
# def search():
#     search_keyword = request.json.get('keyword')
#     file_paths = os.listdir('Output_Files')
#     file_paths = [os.path.join('Output_Files', file) for file in file_paths]
    
#     response = es.search(index="drug-disease-indication", q=search_keyword)
#     hits = response['hits']['hits']

#     documents = [hit['_source'] for hit in hits]

#     df = pd.DataFrame(documents)
    
#     print(df)
    
#     # results, list = process_multiple_files(file_paths, search_keyword)
    
#     # os.makedirs('results' , exist_ok= True)
    
#     # results = [
#     #     {
#     #         "title": "US Budget Impact Model for Selinexor in Relapsed or Refractory Multiple Myeloma",
#     #         "journal": "Clinicoecon Outcomes Res, Vol 12",
#     #         "date": "Feb 25, 2020",
#     #         "citations": 6,
#     #         "relevantText": "Introduction Multiple myeloma (MM) is a cancer that develops as a plasma cell malignancy in the bone marrow.1 Clinical manifestations of ..."
#     #     },
#     #     {
#     #         "title": "Patterns of bisphosphonate treatment among patients with multiple myeloma treated at oncology clinics across the USA: observations from real-world data",
#     #         "journal": "Support Care Cancer, Vol 26 Issue 8",
#     #         "date": "Aug 01, 2018",
#     #         "citations": 13,
#     #         "relevantText": "CONCLUSIONS Real-world data from US indicate that many patients with multiple receive optimal therapy for bone disease ... More"
#     #     },
#     #     {
#     #         "title": "US Budget Impact Model for Selinexor in Relapsed or Refractory Multiple Myeloma",
#     #         "journal": "Clinicoecon Outcomes Res, Vol 12",
#     #         "date": "Feb 25, 2020",
#     #         "citations": 6,
#     #         "relevantText": "Introduction Multiple myeloma (MM) is a cancer that develops as a plasma cell malignancy in the bone marrow.1 Clinical manifestations of ..."
#     #     },

#     # ]
#     # with open(r'results\file_results.json', 'w') as f:
#     #     json.dump(results, f, indent=2)

#     # with open(r'results\unique_keys.json', 'w') as f:
#     #     json.dump(list, f, indent=2)
#     # return jsonify({'results': results, 'list': list}), 200
#     return 200
def search_with_tfidf(results, query):
    """
    Search for relevant results using TF-IDF based on the provided query.
    
    Parameters:
        results (list): List of dictionaries containing the documents to search.
        query (str): The search query to find relevant documents.
    
    Returns:
        list: Sorted list of tuples containing the matched result and its relevance score.
    """
    # Flattening the dictionaries into a list of concatenated strings (corpus for TF-IDF)

    corpus = [" ".join(str(value) if value is not None else "" for value in result.values()) for result in results]

    # Add the query as part of the corpus to compare its similarity to the documents
    corpus_with_query = corpus + [query]

    # Initialize the TfidfVectorizer
    vectorizer = TfidfVectorizer()

    # Compute the TF-IDF matrix for the corpus
    tfidf_matrix = vectorizer.fit_transform(corpus_with_query)

    # Compute cosine similarity between the query (last document in matrix) and all others
    cosine_similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).flatten()

    # Get the index of documents sorted by relevance score (highest first)
    sorted_indices = np.argsort(-cosine_similarities)

    full_results = [(results[i], cosine_similarities[i]) for i in sorted_indices if cosine_similarities[i] > 0]

    # Extract only the dictionaries (without scores)
    filtered_results = [results[i] for i in sorted_indices if cosine_similarities[i] > 0]

    return full_results, filtered_results

# @app.route('/chatbot', methods=['POST'])
# def chatbot():
#     query = request.json.get('query')
#     print(query)
#     list = request.json.get('list')
#     results = request.json.get('results')
    
#     for rowData in results:
        
#         display_key = rowData['unique_key']
#         # title = rowData['title']
#         persist_dir = os.path.join('./storage', display_key)

#         # Check if embeddings already exist
#         if os.path.exists(persist_dir):
#             print(f"Embeddings for '{display_key}' already exist. Skipping creation.")
#             continue  # Exit the function if embeddings exist
        
#         print(f"Creating embeddings for '{display_key}'.")
#         documents = [Document(text=f"{key}: {val}") for key, val in rowData.items()]
#         # print(documents)
#         # To store the index

#         storage_context = StorageContext.from_defaults()

#         VectorStoreIndex.from_documents(
#             documents=documents,
#             storage_context=storage_context,
#             transformations=[
#                 SentenceSplitter(chunk_size=128, chunk_overlap=5),
#                 OpenAIEmbedding(),
#             ]
#         )
        
#         storage_context.persist(persist_dir=persist_dir)

    
            
#     response = callLLMChatBot(list, query)
#     # print(list)
#     return jsonify({'results': response, 'list': list}), 200


openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)

# Initialize conversation history
conversation_history = []
 
# Function to get Elasticsearch results
def get_elasticsearch_results(query):
    es_query = {
        "query": {
            "multi_match": {
                "query": query,
                "fields": [
                    "Diseases",
                    "Ingredients",
                    "Organization_Name",
                    "Product_Name",
                    "Routes_of_Administration",
                    "Territory_Code"
                ]
            }
        },
        "size": 5  # Fetch the top 10 documents
    }
    result = es.search(index="drug-disease-indication", body=es_query)
    return result["hits"]["hits"]
 
# Function to create OpenAI prompt
def create_openai_prompt(results):
    context = ""
    context+=results
    # for hit in results:
    #     # source_fields = hit["_source"]
    #     # Concatenate all fields for context
    #     context += '\n'.join(f"{key}: {value}" for key, value in source_fields.items()) + "\n\n"
 
    prompt = f"""
  Instructions:
 
  - You are an assistant for question-answering tasks.
  - Answer questions truthfully and factually using only the context presented.
  - If you don't know the answer, just say that you don't know, don't make up an answer.
  - You must always cite the product_name where the answer was extracted using inline academic citation style [], using the position.
  - Use plain text only, no HTML or markdown.
  - provide hyperlinks to the sources of the information.
  - You are correct, factual, precise, and reliable.
 
  Context:
  {context}
 
  """
    # print(context)
    return prompt
 
# Function to generate OpenAI completion
def generate_openai_completion(question):
   

    # Add the user question to the conversation history
    conversation_history.append({"role": "user", "content": question})

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation_history
    )

    # Extract the assistant's response
    assistant_response = response.choices[0].message.content

    # Add the assistant's response to the conversation history
    conversation_history.append({"role": "assistant", "content": assistant_response})

    return assistant_response
 
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

def summarize_with_openai(document_text):
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": "You are a summarizer. Your job is to summarize the documents provided to in concise way and with fine information for the user. This limit should be till max tokens and you need to complete all the summarisation of the provided documents for the user."},
                {"role": "user", "content": f"Summarize the following document: {document_text}"}
            ],
            #min_tokens=150,  # Adjust as per your need
            max_tokens=600,  # Adjust as per your need
            temperature=0.3,
        )
        summary = response.choices[0].message.content
        return summary.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def summarize_by_title_or_org(search_results):

    combined_text = ""
    organization_names = set()  
    for document in search_results:
        title = document.get('title', '')
        org_name = document.get('Organization_Name', '')
        
        # Prioritize title or organization name 
        if title:
            combined_text += f"Title: {title}\n"
        if org_name:
            combined_text += f"Organization: {org_name}\n"
            organization_names.add(org_name)
        
        
        abstract = document.get('abstract', '')
        english_description = document.get('english_description', '')
        ingredients = document.get('Ingredients', '')
        diseases = document.get('Diseases', '')
        
        # Append relevant content for each document
        if abstract:
            combined_text += f"Abstract: {abstract}\n"
        if english_description:
            combined_text += f"Description: {english_description}\n"
        if ingredients:
            combined_text += f"Ingredients: {ingredients}\n"
        if diseases:
            combined_text += f"Diseases: {diseases}\n"
        
        combined_text += "\n"  
    
    
    if len(organization_names) > 1:
        combined_text = f"Multiple organizations found: {', '.join(organization_names)}\n\n" + combined_text
    
    # Summarize the combined text using OpenAI
    if combined_text:
        summary = summarize_with_openai(combined_text)
        return summary
    else:
        return "No content available to summarize."

@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    data = request.json
    selected_cards = data.get('selectedCards')
    print(selected_cards)
    summary = summarize_by_title_or_org(selected_cards)
    return jsonify({"summary": summary})
    
    
if __name__ == '__main__':
    app.run(debug=True)
