import os
from openai import OpenAI
from elasticsearch import Elasticsearch
from rapidfuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
load_dotenv()
from Utilities.search import preprocess

import sys
sys.stdout.reconfigure(encoding='utf-8')

openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

MODEL = "gpt-4o-mini"
TOP_N = 10

# Initialize conversation history
conversation_history = []

def remove_english_description(data_list):
    for entry in data_list:
        # Check if the 'type' is 'pregranted'
        if entry.get('type') == 'pregranted':
            # Remove the 'english_description' key if it exists
            entry.pop('english_description', None)
    return data_list

def search_with_tfidf_and_fuzziness(results, query, fuzz_threshold=70):
    """
    Search for relevant results using TF-IDF combined with fuzzy matching based on the provided query.
    
    Parameters:
        results (list): List of dictionaries containing the documents to search.
        query (str): The search query to find relevant documents.
        fuzz_threshold (int): The minimum fuzzy match score (0-100) to consider a document as relevant.
    
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

    # Apply fuzzy matching to further refine the results
    fuzzy_scores = [fuzz.partial_ratio(query, doc) for doc in corpus]

    # Combine TF-IDF and fuzzy matching scores
    combined_results = []
    for i in range(len(results)):
        if fuzzy_scores[i] >= fuzz_threshold:
            combined_score = cosine_similarities[i] * (fuzzy_scores[i] / 100)
            combined_results.append((results[i], combined_score))

    # Sort results by combined score in descending order
    combined_results = sorted(combined_results, key=lambda x: -x[1])

    # Extract only the dictionaries (without scores)
    filtered_results = [result for result, score in combined_results]

    return combined_results, filtered_results

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
    result = es.msearch(body=es_query)
    return [hit['_source'] for res in result['responses'] for hit in res['hits']['hits']]
 
# Function to create OpenAI prompt
# Function to create the OpenAI prompt from results
def create_openai_prompt(results):
    context = ""
    for hit in results:
        context += '\n'.join(f"{key}: {value}" for key, value in hit.items()) + "\n\n"
    print(context)
    prompt = f"""
- You are a research consultant specializing in answering questions based on structured data provided by the user.
- The user will provide a query followed by context data in dictionary format.
- The data will include attributes such as "Active Ingredient," "Adverse_Events," "Age_Group," "Annual_Therapy_Costs," "Country," "Disease," "Efficacy," "Gender," "Manufacturer," "Morbidity," "Mortality," "Prevalence," "Price," "Quality_of_Life," "Safety," "Size," "Symptoms," "TradeName," and "Type_of_Drug."
- Data Attributes:
    "Active Ingredient": The primary active component responsible for the drug's therapeutic effect.
    "Adverse_Events": Description of common and serious adverse events reported with the drug.
    "Age_Group": Specifies the approved age range for the drug's use.
    "Annual_Therapy_Costs": The estimated yearly cost of therapy with the drug, factoring in insurance and patient-specific factors.
    "Country": The country where the drug is approved or marketed.
    "Disease": The medical condition or disease the drug is intended to treat.
    "Efficacy": Effectiveness of the drug in achieving the desired therapeutic outcome, often provided as a percentage or qualitative description.
    "Gender": Information on the disease’s prevalence across different genders or specific impacts related to gender.
    "Manufacturer": The company responsible for producing or distributing the drug.
    "Morbidity": A numerical representation (often between 0 and 1) of the disease’s impact on quality of life or health status.
    "Mortality": A numerical value (often between 0 and 1) indicating the risk of death associated with the disease or condition.
    "Prevalence": Data on the frequency of the disease within the population, given as a percentage or approximate count.
    "Price": The cost of the drug per unit, typically in a specific dosage or packaging form.
    "Quality_of_Life": Information on how the drug impacts the quality of life of patients.
    "Safety": Summary of the drug's safety profile, including necessary precautions.
    "Size": The dosage or packaging size of the drug.
    "Symptoms": Symptoms associated with the disease the drug is intended to treat.
    "TradeName": The brand or commercial name under which the drug is marketed.
    "Type_of_Drug": The category or mechanism of action of the drug (e.g., "fusion inhibitor" for antiretroviral drugs).
    Instructions for Answering Questions:
    Provide precise and factual answers using only the context provided in the data.
    Avoid speculating or creating answers beyond the given data.
    Ensure responses are clear, reliable, and directly aligned with the provided context.
  """
    return prompt

# Function to generate OpenAI completion
def generate_openai_completion(question, conversation_history):
    # Add the user question to the conversation history
    conversation_history.append({"role": "user", "content": question})

    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=conversation_history
    )

    # Extract the assistant's response
    assistant_response = response.choices[0].message.content

    # Add the assistant's response to the conversation history
    conversation_history.append({"role": "assistant", "content": assistant_response})

    return assistant_response

# Main function to process the question using the provided results
def process_question(results, question, conversation_history):
    print(results)
    # Filter and preprocess the results if necessary
    # updated_results = remove_english_description(results)
    # _, filtered_results = search_with_tfidf_and_fuzziness(updated_results, question)
    
    # Generate context from filtered results for the OpenAI prompt
    context_prompt = create_openai_prompt(results)
    
    # Add context as a system message in the conversation history
    conversation_history.append({"role": "system", "content": context_prompt})
    
    # Generate an OpenAI completion for the user question
    answer = generate_openai_completion(question, conversation_history)
    return answer


if __name__ == "__main__":

    query = "lactose"
    results = get_elasticsearch_results(query)
    while(True):
        question = input("You: ")
        if question == "exit":
            print("Goodbye!")
            break
        
        response = process_question(results, question, conversation_history)
        print(f"Chatbot: {response}")
    
    
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
