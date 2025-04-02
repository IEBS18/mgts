from concurrent.futures import ThreadPoolExecutor        
import json
from openai import AzureOpenAI
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.core.pipeline.transport import RequestsTransport
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
from dotenv import load_dotenv
import sys
sys.stdout.reconfigure(encoding='utf-8')
from elasticsearch import Elasticsearch

load_dotenv()

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)
 
 
executor = ThreadPoolExecutor(max_workers=5)
# Azure AI Configuration for LLaMA 3.3-70B
MODEL = "gpt-4o-mini"

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
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
   
    "granted-pharma": ["Title", "Abstract", "Claim"],
    "pg_pharma": ["Title", "Claim", "Abstract"],
    "test": ["Title", "Full Paper"]
}
 
# Define post-processing fields for filtering after search (if needed)
post_processing_fields = {
    "granted_pharma": [
        "Display_Key", "Title", "Abstract", "Claim"],
    "pg_pharma": [
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
                "type": "phrase"
                # "fuzziness": "AUTO"
            }
        },
        "size": size
    }
    response = es.search(index=index_name, body=query_body)
    hits = response.get("hits", {}).get("hits", [])
    print(hits)
    return [hit["_source"] for hit in hits]
 
def fuzzy_search(user_query, size=10):
 
    """Performs fuzzy search across all specified indexes and adds index labels."""
 
    all_results = []
 
    for index_name, fields in index_fields.items():
 
        results = get_elasticsearch_results(index_name, user_query, fields, size=size)
 
        # Add an index label to each result
 
        for result in results:
 
            result["_index"] = index_name  # Add index source information
 
            all_results.append(result)
            # print(all_results)
    return all_results
 
 
 
def fetch_raw_results(user_query, size=5):
    """Fetches raw Elasticsearch results and returns them immediately."""
    return fuzzy_search(user_query, size=size)
 
def get_prompt(field_name, user_query):
    prompts = {
        f"Stability Conditions": "Extract details about the stability of the active ingredient '{user_query}', formulation, including storage conditions, temperature variations, shelf life, and degradation prevention methods.",
        f"Interaction": "Summarize how the active ingredient '{user_query}', interacts with other components in the formulation, including synergistic effects, adverse reactions, and stability changes.",
        f"Composition": "Provide the composition of the formulation, including the active ingredient '{user_query}', carrier agents, and key excipients.",
        f"Composition Characteristics": "Describe the characteristics of each ingredient in the composition, including physical and chemical properties.",
        f"Interaction Components": "List the components that interact with the active ingredient'{user_query}', specifying whether they improve efficacy, stability, or cause degradation.",
        f"Solution Form": "Identify the physical form of the formulation (e.g., lotion, cream, gel, patch, spray, tablet, injectable) for the active ingredient '{user_query}'.",
        f"Testing Conditions": "Extract details about the experimental conditions used in stability, efficacy, and safety tests for the active ingredient '{user_query}'.",
        f"Stability Test Results": "Summarize the stability test results, including duration, storage conditions, and observed stability or degradation percentages for the active ingredient '{user_query}'.",
        f"Dissolution Study": "Extract details of dissolution studies conducted on the formulation, including dissolution rate, pH conditions, temperature, and medium used for the active ingredient '{user_query}'.",
        f"Safety Study Results": "Summarize safety-related findings, including cytotoxicity test results, irritation studies, toxicity data, and reported adverse effects for the active ingredient '{user_query}'.",
        f"Efficacy Studies": "Summarize key efficacy findings, including clinical or human trial results, observed benefits, duration, and proof of effectiveness for the active ingredient '{user_query}'.",
        f"Toxicity Studies": "Summarize toxicity-related findings, including acute and chronic toxicity studies, genotoxicity, and carcinogenicity data for the active ingredient '{user_query}'.",
        f"Application": "Identify the intended application of the formulation (e.g., pharmaceuticals, cosmetics, food, industrial) for the active ingredient '{user_query}'.",
        f"IEB Comment (Summary)": "Provide a concise summary of the patent for the active ingredient '{user_query}', covering stability, composition, interaction, safety, efficacy, and toxicity." 
 
    }
    return prompts.get(field_name, "NA")
 
def extract_info(field_name, text, user_query):
    try:
        response = openai_client.chat.completions.create(
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
                UserMessage(content=get_prompt(field_name, user_query) + "\n\nCONTEXT:\n\n" + text)
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

# def stream_llm_results(results, user_query):
#     """
#     Yields partial SSE updates for each patent + field.
#     Extracts LLM responses in parallel and prints debug statements.
#     """
#     fields_to_extract = [
#         "Stability Conditions", "Interaction", "Composition",
#         "Composition Characteristics", "Interaction Components",
#         "Solution Form", "Testing Conditions",
#         "Stability Test Results", "Dissolution Study",
#         "Safety Study Results", "Efficacy Studies",
#         "Toxicity Studies", "Application",
#         "IEB Comment (Summary)"
#     ]
    
#     with ThreadPoolExecutor(max_workers=5) as executor:  # Adjust max_workers if needed
#         for patent in results:
#             # Identify the record
#             title = patent.get("Title", "N/A")
#             claim = patent.get("Claim", "N/A")
#             display_key = patent.get("Display_Key", patent.get("pgpub_id", "N/A"))
#             if display_key == "N/A":
#                 display_key = patent.get("PMC_ID", "N/A")

#             # print(f"\n[Processing] Patent: {display_key} - {title}")  # Debug: Start processing patent

#             patent_text = (
#                 f"Title: {title}\n"
#                 f"Abstract: {patent.get('Abstract', '')}\n"
#                 f"Claim: {patent.get('Claim', '')}\n"
#                 f"Full Paper: {patent.get('Full Paper', '')}"
#             )

#             # Start partial dict
#             extracted_info = {
#                 "Title": title,
#                 "Claim": claim,
#                 "Publication Number": display_key
#             }

#             # Submit LLM tasks in parallel
#             future_to_field = {
#                 executor.submit(extract_info, field, patent_text, user_query): field
#                 for field in fields_to_extract
#             }

#             for future in as_completed(future_to_field):
#                 field = future_to_field[future]
#                 try:
#                     extracted_info[field] = future.result()
#                     # print(f"[Completed] {field} extracted for {display_key}")  # Debug: Field extracted
#                 except Exception as e:
#                     extracted_info[field] = f"Error: {str(e)}"
#                     # print(f"[Error] {field} failed for {display_key}: {e}")  # Debug: Error encountered

#                 # Yield partial results as they complete
#                 # print(f"[Yielding] Partial result for {display_key} - Field: {field}")  # Debug: Yield event
#                 yield f"data: {json.dumps(extracted_info)}\n\n"

#             # print(f"[Finished] All extractions completed for {display_key}\n")  # Debug: Completed all fields

#     # Send "done" event at the end
#     # print("[Done] All patents processed. Sending completion event.")  # Debug: Completion event
#     yield 'event: done\ndata: {"finished": true}\n\n'





# def stream_llm_results(results, user_query):
#     """
#     Yields partial SSE updates for each patent + field.
#     Extracts LLM responses in parallel and prints debug statements.
#     """
#     fields_to_extract = [
#         "Stability Conditions", "Interaction", "Composition",
#         "Composition Characteristics", "Interaction Components",
#         "Solution Form", "Testing Conditions",
#         "Stability Test Results", "Dissolution Study",
#         "Safety Study Results", "Efficacy Studies",
#         "Toxicity Studies", "Application",
#         "IEB Comment (Summary)"
#     ]
    
#     with ThreadPoolExecutor(max_workers=5) as executor:  # Adjust max_workers if needed
#         for patent in results:
#             # Identify the record
#             title = patent.get("Title", "N/A")
#             claim = patent.get("Claim", "N/A")
#             display_key = patent.get("Display_Key", patent.get("pgpub_id", "N/A"))
#             if display_key == "N/A":
#                 display_key = patent.get("PMC_ID", "N/A")

#             # print(f"\n[Processing] Patent: {display_key} - {title}")  # Debug: Start processing patent

#             patent_text = (
#                 f"Title: {title}\n"
#                 f"Abstract: {patent.get('Abstract', '')}\n"
#                 f"Claim: {patent.get('Claim', '')}\n"
#                 f"Full Paper: {patent.get('Full Paper', '')}"
#             )

#             # Start partial dict
#             extracted_info = {
#                 "Title": title,
#                 "Claim": claim,
#                 "Publication Number": display_key
#             }

#             # Submit LLM tasks in parallel
#             future_to_field = {
#                 executor.submit(extract_info, field, patent_text, user_query): field
#                 for field in fields_to_extract
#             }

#             for future in as_completed(future_to_field):
#                 field = future_to_field[future]
#                 try:
#                     extracted_info[field] = future.result()
#                     # print(f"[Completed] {field} extracted for {display_key}")  # Debug: Field extracted
#                 except Exception as e:
#                     extracted_info[field] = f"Error: {str(e)}"
#                     # print(f"[Error] {field} failed for {display_key}: {e}")  # Debug: Error encountered

#                 # Yield partial results as they complete
#                 # print(f"[Yielding] Partial result for {display_key} - Field: {field}")  # Debug: Yield event
#                 yield f"data: {json.dumps(extracted_info)}\n\n"

#             # print(f"[Finished] All extractions completed for {display_key}\n")  # Debug: Completed all fields

#     # Send "done" event at the end
#     # print("[Done] All patents processed. Sending completion event.")  # Debug: Completion event
#     yield 'event: done\ndata: {"finished": true}\n\n'


##USER REQUESTED FIELDS ONLY##

def stream_llm_results(results, user_query, requested_fields):
    """
    Extracts only the requested fields in parallel and yields partial SSE updates.
    
    :param results: List of Elasticsearch results.
    :param user_query: The active ingredient or user query.
    :param requested_fields: List of fields user wants (e.g., ["Stability Conditions", "Interaction"]).
    """
    all_fields = [  "Stability Conditions",
    "Interaction",
    "Composition",
    "Composition Characteristics",
    "Interaction Components",
    "Solution Form",
    "Testing Conditions",
    "Stability Test Results",
    "Dissolution Study",
    "Safety Study Results",
    "Efficacy Studies",
    "Toxicity Studies",
    "Application",
    "IEB Comment (Summary)",
  
    ]
# Debugging log
    print("Received requested_fields:", requested_fields)
    print("Type of requested_fields:", type(requested_fields))

    # If no requested fields are provided, return an error message
    if not requested_fields or not isinstance(requested_fields, list):
        print("[Error] No valid fields selected.")
        yield 'event: error\ndata: {"error": "Please specify valid fields for extraction."}\n\n'
        return

    # Validate requested fields (case-insensitive)
    requested_fields = [field for field in requested_fields if field in all_fields]
    print("Validated requested_fields:", requested_fields)

    if not requested_fields:
        print("[Error] User requested invalid fields.")
        yield 'event: error\ndata: {"error": "None of the requested fields are valid."}\n\n'
        return
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        for patent in results:
            # Identify the record
            title = patent.get("Title", "N/A")
            claim = patent.get("Claim", "N/A")
            display_key = patent.get("Display_Key", patent.get("pgpub_id", "N/A"))
            if display_key == "N/A":
                display_key = patent.get("PMC_ID", "N/A")

            print(f"\n[Processing] Patent: {display_key} - {title}")

            patent_text = (
                f"Title: {title}\n"
                f"Abstract: {patent.get('Abstract', '')}\n"
                f"Claim: {patent.get('Claim', '')}\n"
                f"Full Paper: {patent.get('Full Paper', '')}"
            )

            extracted_info = {
                "Title": title,
                "Claim": claim,
                "Publication Number": display_key
            }

            # Submit only the requested fields
            future_to_field = {
                executor.submit(extract_info, field, patent_text, user_query): field
                for field in requested_fields
            }

            for future in as_completed(future_to_field):
                field = future_to_field[future]
                try:
                    extracted_info[field] = future.result()
                    print(f"[Completed] {field} extracted for {display_key}")
                except Exception as e:
                    extracted_info[field] = f"Error: {str(e)}"
                    print(f"[Error] {field} failed for {display_key}: {e}")

                # Yield partial results as they complete
                print(f"[Yielding] Partial result for {display_key} - Field: {field}")
                yield f"data: {json.dumps(extracted_info)}\n\n"

            print(f"[Finished] All requested fields completed for {display_key}\n")

    # Send "done" event at the end
    print("[Done] All patents processed. Sending completion event.")
    yield 'event: done\ndata: {"finished": true}\n\n'



def extract_info_ai(text, column_name, column_description):
    try:
        user_message = "column name:" + column_name + "\ncolumn description:" + column_description + "\n\nCONTEXT:\n\n" + str(text)
        response = openai_client.chat.completions.create(
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
                UserMessage(content=user_message)
            ],
            temperature=0.3,
        )

        return response.choices[0].message.content.strip() if response.choices else "Not mentioned."
    except Exception as e:
        print(f"Error during extract_info: {e}")
        return "Not Found"
    
def getAIColumn(results, column_name, column_description):
    responses = []
    for patent in results:
        response = extract_info_ai(patent, column_name, column_description)
        responses.append(response)
        
    return responses
 
 
    