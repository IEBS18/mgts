import os
import numpy as np
from openai import OpenAI
from elasticsearch import Elasticsearch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


from dotenv import load_dotenv
load_dotenv()
import sys
sys.stdout.reconfigure(encoding='utf-8')

openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

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

# Initialize conversation history
conversation_history = []
 
# Function to get Elasticsearch results
def get_elasticsearch_results(query):
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
            "size": 1
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
            "size": 10
        },
        # {"index": "clinical-trial-outcomes"},
        # {
        #     "query": {
        #         "query_string": {
        #             "query": query, 
        #             "default_operator": "OR" # Search the same query across all fields
        #         }
        #     },
        #     "size": 10000
        # }
    ]
    result = es.msearch(body=es_query)
    return [hit['_source'] for res in result['responses'] for hit in res['hits']['hits']]
 
# Function to create OpenAI prompt
def create_openai_prompt(results):
    context = ""
    for hit in results:
        context += '\n'.join(f"{key}: {value}" for key, value in hit.items()) + "\n\n"
 
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
  {results}
 
  """
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

def process_question(question):
    # Get Elasticsearch results for the user query
    results = get_elasticsearch_results(question)
    # Create an OpenAI prompt using the search results
    prompt = create_openai_prompt(results)
    
    # Generate an OpenAI completion for the user question
    # answer = generate_openai_completion(prompt)
    return prompt

if __name__ == "__main__":

    question = "lactose"
    print(process_question(question))
    
    
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
