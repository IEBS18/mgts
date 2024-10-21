import os
import numpy as np
from openai import OpenAI
from elasticsearch import Elasticsearch
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

def remove_english_description(data_list):
    for entry in data_list:
        # Check if the 'type' is 'pregranted'
        if entry.get('type') == 'pregranted':
            # Remove the 'english_description' key if it exists
            entry.pop('english_description', None)
    return data_list

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
def create_openai_prompt(results):
    context = ""
    for hit in results:
        context += '\n'.join(f"{key}: {value}" for key, value in hit.items()) + "\n\n"
 
    prompt = f"""
INSTRUCTIONS:
 
- You are a research consultant specializing in answering questions based on structured data.

- The data will be provided in dictionaries and will include either of these four types: "pregranted", "drugdisease",  "clinicaltrial", and "pubmed".

- Types of Data:

    1. "pregranted" data: Contains information about pre-grant patents, including attributes like "cpc_classifications", "application_year", "jurisdiction", "ipc_classifications", "abstract", "title", "type", "patent_legal_status", "assignee_applicant", "display_key", "publication_year", "pgpub_id", "publication_date", "application_date", "claim", "earliest_priority_date", and "inventor".
    
    The details of the attributes are:
    ['cpc_classifications': The Cooperative Patent Classification (CPC) system codes that categorize the patent into specific technological areas,
    'application_year': The year when the patent application was filed.
    'jurisdiction': The legal territory where the patent is granted or applies, such as the country or region,
    'ipc_classifications': The International Patent Classification (IPC) codes that classify the patent based on its technical features.
    'abstract': A summary of the patent that outlines its key features and purpose,
    'title': The title of the patent, usually reflecting its content or purpose,
    'type': The classification type is pregranted,
    'patent_legal_status': The current legal status of the patent (e.g., active, expired, pending),
    'assignee_applicant': The individual or organization that owns or applied for the patent,
    'display_key': A unique identifier or key for the patent, often used for display purposes in databases,
    'publication_year': The year when the patent was published.
    'pgpub_id': A unique identifier for the published patent.
    'publication_date': The date when the patent was officially published.
    'application_date': The date when the patent application was submitted.
    'claim': Specific legal statements that define the scope of protection sought by the patent.
    'earliest_priority_date': The earliest date from which the applicant claims priority based on previous filings.
    'inventor': The individual(s) who invented the subject matter of the patent.]
    
    2. "drugdisease" data: Includes drug-related information with attributes like "Organization_Name", "Ingredients", "Routes_of_Administration", "Territory_Code", "Product_Name", "Diseases" and "type".
    
    The details of the attributes are as:
    ['Organization_Name': The name of the organization that developed or produced the drug.
    'Ingredients': The active and inactive components that make up the drug formulation.
    'Routes_of_Administration': The method by which the drug is delivered to the body (e.g., oral, intravenous, topical).
    'Territory_Code': A code representing the geographical area where the drug is approved or marketed.
    'Product_Name': The commercial name under which the drug is sold.
    'type': The classification type is drugdisease.
    'Diseases': The medical conditions or diseases that the drug is intended to treat or manage.]
    
    3. "Clinicaltrial" data: Refers to clinical trial information with attributes such as "NCT Number", "Study Status", "Study Title", "Brief Summary", "Study Results", "Conditions", "Interventions", "Sponsor", "Collaborators", "Sex", "Age", "Phases", "Enrollment", "Study Type", "Study Design", "Other IDs", "Start Date", "Primary Completion Date", "Completion Date", "First Posted", "Last Update Posted", "Locations" and "type".
    
    The details of the attributes are:
    ['Primary Completion Date': The date when the last participant's last visit occurred, marking the completion of the primary endpoint data collection.
    'Study Title': The title of the clinical trial, describing its focus or objective.
    'Study Status': The current status of the clinical trial (e.g., Recruiting, Completed, Terminated).
    'Sex': The sex of the participants eligible for the trial (e.g., male, female, both).
    'Locations': The sites where the clinical trial is conducted.
    'Sponsor': The organization or entity that initiates, manages, or finances the clinical trial.
    'Completion Date': The actual date when the trial was completed.
    'Study Results': Findings or outcomes from the clinical trial.
    'Conditions': The medical conditions being studied in the trial.
    'Study Description': A detailed overview of the study's objectives, design, and methodology.
    'Brief Summary': A concise summary of the study's purpose and design.
    'Interventions': The treatments, drugs, or procedures being tested in the trial.
    'Phases': The different stages of the clinical trial (e.g., Phase 1, Phase 2, Phase 3).
    'Start Date': The date when the trial commenced.
    'Other IDs': Additional identifiers related to the trial, which may include registry numbers or codes.
    'First Posted': The date when the trial information was first made publicly available.
    'Enrollment': The number of participants recruited for the trial.
    'NCT Number': The unique identifier assigned to the trial in the ClinicalTrials.gov registry.
    'Study Design': The overall plan or structure of the clinical trial.
    'Last Update Posted': The date of the most recent update to the trial information.
    'Collaborators': Other organizations or entities that are involved in the trial.
    'Age': The age range of participants eligible for the trial.
    'Study Type': The nature of the study (e.g., observational, interventional).
    'type': The classification type is clinicaltrial.]
    
    4. "Pubmed" data: Involves scientific publications, with attributes like "PMID", "Title", "AbstractText", "Author Name", "Country", "Journal Issue", "PubDate", "ISSN", "ISSN Type" and "type".
    
    the details of each attribute is given below:
    ['PMID':A unique identifier assigned to each article in the PubMed database. It is a numeric code that allows for easy referencing and retrieval of the specific article.
    'Title':The title of the research article. It provides a brief description of the main topic or findings of the study and is often the first element that researchers and readers will look at.
    'AbstractText':A summary of the research article that includes the main objectives, methods, results, and conclusions. The abstract is designed to give readers a quick overview of the study's content and significance.
    'Author Name':The names of the authors who contributed to the research article. This attribute may include multiple names and is essential for crediting those who conducted the research.
    'Country':The country where the research was conducted or where the authors are based. This information can be important for understanding the geographical context of the study and its implications.
    'Journal Issue':The specific issue of the journal in which the article was published, typically including the volume and issue number. This attribute helps in locating the article within the journal's archive.
    'PubDate':The date when the article was published. This information is crucial for referencing and understanding the timeliness of the research.
    'ISSN':A unique code used to identify the journal in which the article was published. The ISSN helps in distinguishing between different serial publications and is essential for library cataloging.
    'ISSN Type':Indicates whether the ISSN is for the print version, the electronic version, or both. This information is helpful for understanding how the journal is available to readers.
    'type':The classification type is pubmed.]
    
- Instructions for Answering Questions:

    Be Precise and factual in your answers, using only the context provided in the dictionaries.
    If the required information is missing, simply state that the "information is not available".
    Do not fabricate answers.
    Your responses should always be factually correct, reliable, and based on the context provided.
 
CONTEXT:
  {results}
 
  """
    return prompt
 
# Function to generate OpenAI completion
def generate_openai_completion(question):
   

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

def process_question(results, question, conversation_history):
    
    search_query = preprocess(question)
    if isinstance(search_query, set):
        search_query = ' '.join(search_query)
    print(search_query)
    
    # Get Elasticsearch results for the user query
    # results = get_elasticsearch_results(search_query)
    # updated_results = remove_english_description(results)
    # context_prompt = create_openai_prompt(results[:5])
    
    updated_results = remove_english_description(results)
    _, filtered_results = search_with_tfidf(updated_results, search_query)
    
    # # Create an OpenAI prompt using the search results
    context_prompt = create_openai_prompt(filtered_results[:TOP_N])
    # print(context_prompt)
    conversation_history.append({"role": "system", "content": context_prompt})
    # print("added system context.")
    # Generate an OpenAI completion for the user question
    answer = generate_openai_completion(question)
    return answer

if __name__ == "__main__":

    query = "lactose"
    results = get_elasticsearch_results(query)
    # results = []
    question = "which drugs use lactose monohydrate as an ingredient?"
    response = process_question(results, question, conversation_history)
    print(response)
    
    
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
