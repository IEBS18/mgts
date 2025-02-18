from concurrent.futures import ThreadPoolExecutor        
import json
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.core.pipeline.transport import RequestsTransport
import os
from Utilities.query_classifier import (
    es,
)
 
 
executor = ThreadPoolExecutor(max_workers=5)
# Azure AI Configuration for LLaMA 3.3-70B
MODEL = "Llama-3.3-70B-Instruct"
transport = RequestsTransport(timeout=(600, 600))  # Increase timeout
client = ChatCompletionsClient(
    endpoint=os.getenv("LLAMA_3_URL"),
    credential=AzureKeyCredential(os.getenv("LLAMA_3_API")),
    transport=transport
)
 
# Cache for storing processed LLM results
processed_data_cache = {}
 
#-------------------------------------------------------------
# Chache clear after every 10 active ingredients input by user
#-------------------------------------------------------------
MAX_CACHE_SIZE = 140  # Keep only the latest 10 queries (140 extractions fom llm)
 
if len(processed_data_cache) > MAX_CACHE_SIZE:
    oldest_key = next(iter(processed_data_cache))  # Get the oldest query
    del processed_data_cache[oldest_key]  # Remove it
 
 
# -------------------------------------------------
# Elasticsearch Search & Data Extraction Functions
# -------------------------------------------------
 
# Define fields to search within each index
index_fields = {
   
    "granted_updated_final": ["Title", "Abstract", "Claim"],
    "pg_pharma": ["Title", "Claim", "Abstract"],
    "test": ["Title", "Full Paper"]
}
 
# Define post-processing fields for filtering after search (if needed)
post_processing_fields = {
    "granted_updated_final": [
        "Display_Key", "Title", "Abstract", "Claim"],
    "pregranted": [
        "pgpub_id", "Title", "Abstract", "Claim"],
    "test": ["PMC_ID", "Title", "Abstract", "Full Paper"]
}
 
def get_elasticsearch_results(index_name, user_query, fields, size=10):
    """Fetches Elasticsearch results with a multi_match fuzzy query."""
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
    return [hit["_source"] for hit in hits]
 
def fuzzy_search(user_query, size=10):
 
    """Performs fuzzy search across all specified indexes and adds index labels."""
 
    all_results = []
 
    for index_name, fields in index_fields.items():
 
        results = get_elasticsearch_results(index_name, user_query, fields, size=size)
        if index_name == "test":
            for result in results:
                if "PMC_ID" in result:
                    print(result["PMC_ID"])
                else:
                    print("Not found")
 
        # Add an index label to each result
 
        for result in results:
 
            result["_index"] = index_name  # Add index source information
 
            all_results.append(result)
            # print(all_results)
    return all_results
 
 
 
def fetch_raw_results(user_query, size=5):
    """Fetches raw Elasticsearch results and returns them immediately."""
    return fuzzy_search(user_query, size=size)
 
def get_prompt(field_name):
    prompts = {
        "Stability Conditions": "Extract details about the stability of the active ingredient formulation...",
        "Interaction": "Summarize how the active ingredient interacts with other components...",
        "Composition": "Provide the composition of the formulation...",
        "Composition Characteristics": "Describe the characteristics of each ingredient...",
        "Interaction Components": "List the components that interact with the active ingredient...",
        "Solution Form": "Identify the physical form of the formulation...",
        "Testing Conditions": "Extract details about the experimental conditions used in stability...",
        "Stability Test Results": "Summarize the stability test results...",
        "Dissolution Study": "Extract details of dissolution studies conducted on the formulation...",
        "Safety Study Results": "Summarize safety-related findings...",
        "Efficacy Studies": "Summarize key efficacy findings...",
        "Toxicity Studies": "Summarize toxicity-related findings...",
        "Application": "Identify the intended application of the formulation...",
        "IEB Comment (Summary)": "Provide a concise summary of the patent..."
    }
    return prompts.get(field_name, "NA")
 
def extract_info(field_name, text):
    try:
        response = client.complete(
            model=MODEL,
            messages=[
                SystemMessage(content="""
    You are an expert in pharmaceutical and costemics drugs and ingredients and data related to thier patents and pubmed.
    ===General Extraction Guidelines for All Queries===
    1. Rely solely on the provided data: Use only the information available in the clinical trial record or patent data. Do not speculate or add external context.
    2. Focus on requested data: Extract only the information relevant to the query. Avoid unnecessary details or commentary.
    3. Be specific and concise: Provide clear, direct answers. Use bullet points or short sentences where appropriate.
    4. Include in-vivo/in-vitro details: For safety, efficacy, toxicity, and stability studies, specify whether the test was conducted in-vivo or in-vitro, the methodology used, and the results observed.
    5. Don't terminate the response in between keep it conscise and complete to the end for user to understand the meaning of the response.
    ===Output Format===
    1. For each query, provide the exact text or data from the record that answers the question.
    2. Don't terminate the sentence in between as per token limitation complete the response within the token but dont keep it open ended.
    3. If no relevant information is found, state "Not mentioned." Do not give elaborated things simply give as Not Mentioned or keep it blank.
    4. Clearly reference the question category (header) and question in your response.
    5. Directly start with answer instead of Based on the provided text or The article discusses or any similar
    6. Response with Not Mentioned words if no response if found instead of any eloborated sentences
                """),
                UserMessage(content=get_prompt(field_name) + "\n\n" + text)
            ],
            temperature=0.3,
            # max_tokens=168
        )
        # print("llama cha response:", response)
        return response.choices[0].message.content.strip() if response.choices else "Not mentioned."
    except Exception as e:
        print(f"Error during extract_info: {e}")
        return "Not Found"
 
# def process_with_llm(results):
 
#     """Processes Elasticsearch results with LLaMA-3.3 for structured extraction."""
 
#     extracted_data = []
 
#     for patent in results:
       
#         title = patent.get("Title", "N/A")
#         claim = patent.get("Claim", "N/A")
#         display_key = patent.get("Display_Key", patent.get("pgpub_id", "N/A"))
#         abstract = patent.get("Abstract", "N/A")
 
#         # Retrieve index name
#         index_name = patent.get("_index", "Unknown Index")  
 
#         # Prepare text for LLaMA extraction
#         patent_text = (
#             f"Title: {title}\n"
#             f"Abstract: {abstract}\n"
#             f"Claim: {claim}\n"
#             f"Full Paper: {patent.get('Full Paper', '')}"
#         )
 
#         extracted_info = {
#             "Title": title,
#             "Claim": claim,
#             "Abstract": abstract,
#             "Publication Number": display_key,
#             "Source Index": index_name,  # Add index name for reference
#             "Stability Conditions": extract_info("Stability Conditions", patent_text),
#             "Interaction": extract_info("Interaction", patent_text),
#             "Composition": extract_info("Composition", patent_text),
#             "Composition Characteristics": extract_info("Composition Characteristics", patent_text),
#             "Interaction Components": extract_info("Interaction Components", patent_text),
#             "Solution Form": extract_info("Solution Form", patent_text),
#             "Testing Conditions": extract_info("Testing Conditions", patent_text),
#             "Stability Test Results": extract_info("Stability Test Results", patent_text),
#             "Dissolution Study": extract_info("Dissolution Study", patent_text),
#             "Safety Study Results": extract_info("Safety Study Results", patent_text),
#             "Efficacy Studies": extract_info("Efficacy Studies", patent_text),
#             "Toxicity Studies": extract_info("Toxicity Studies", patent_text),
#             "Application": extract_info("Application", patent_text),
#             "IEB Comment (Summary)": extract_info("IEB Comment (Summary)", patent_text),
 
#         }
 
#         extracted_data.append(extracted_info)
 
#     return extracted_data
 
 
# def process_with_llm_async(results, user_query):
#     """Processes results with LLaMA-3.3 asynchronously and caches the output."""
   
#     # Check if results are already cached
#     if user_query in processed_data_cache:
#         print("Using cached results for:", user_query)
#         return processed_data_cache[user_query]  # Return cached results
 
#     # Not in cache? Process with LLaMA
#     final_results = process_with_llm(results)
 
#     # Store results in cache
#     processed_data_cache[user_query] = final_results  
 
#     return final_results
 
#{column name
#column description
#active ingredient }--> from frontend
# processed data cacghe+ get elastic results --> from backend
def stream_llm_results(results):
    """
    Yields partial SSE updates for each patent + field.
    Finally yields an event 'done' to signal completion.
    """
    for patent in results:
        # Identify the record
        print(patent.keys())
        print("DHKWBHJBFHJBHFJBWHJFBJFHJVGJVGJGHVJDEVJVWFVJVVDGVDFGVGVVVVVVV")
        title = patent.get("Title", "N/A")
        claim = patent.get("Claim", "N/A")
        display_key = patent.get("Display_Key", patent.get("pgpub_id", "N/A"))
        if display_key=="N/A":
            display_key = patent.get("PMC_ID", "N/A")
 
        patent_text = (
            f"Title: {title}\n"
            f"Abstract: {patent.get('Abstract', '')}\n"
            f"Claim: {patent.get('Claim', '')}\n"
            f"Full Paper: {patent.get('Full Paper', '')}"
        )
 
        # Start partial dict
        extracted_info = {
            "Title": title,
            "Claim": claim,
            "Publication Number": display_key
        }
 
        fields_to_extract = [
            "Stability Conditions", "Interaction", "Composition",
            "Composition Characteristics", "Interaction Components",
            "Solution Form", "Testing Conditions",
            "Stability Test Results", "Dissolution Study",
            "Safety Study Results", "Efficacy Studies",
            "Toxicity Studies", "Application",
            "IEB Comment (Summary)"
        ]
 
        for field in fields_to_extract:
            # Extract each field
            extracted_info[field] = extract_info(field, patent_text)
            # Immediately yield to the frontend
            yield f"data: {json.dumps(extracted_info)}\n\n"
 
    # After all patents/fields, send a "done" event to close connection gracefully
    yield 'event: done\ndata: {"finished": true}\n\n'
 
 
 
 