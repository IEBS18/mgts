from concurrent.futures import ThreadPoolExecutor        
import json
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.core.pipeline.transport import RequestsTransport
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
from elasticsearch import Elasticsearch

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
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
processed_cache = {}
 
#-------------------------------------------------------------
# Chache clear after every 10 active ingredients input by user
#-------------------------------------------------------------
MAX_CACHE_SIZE = 140  # Keep only the latest 10 queries (140 extractions fom llm)
 
if len(processed_cache) > MAX_CACHE_SIZE:
    oldest_key = next(iter(processed_cache))  # Get the oldest query
    del processed_cache[oldest_key]  # Remove it
 
 
# -------------------------------------------------
# Elasticsearch Search & Data Extraction Functions
# -------------------------------------------------
 
# Define fields to search within each index
index_fields = {
   
    "granted-pharma": ["Title", "Abstract", "Claim"],
    "pg_pharma": ["Title", "Claim", "Abstract"],
    "test": ["Title", "Full Paper"],
    "clinicaltrial": ["Study Title","Interventions", "Brief Summary", "Study Description"]
}
 
# Define post-processing fields for filtering after search (if needed)
post_processing_fields = {
    "granted_updated_final": [
        "source", "Title", "Abstract", "Claim","Assignee_Applicant"],
    "pregranted": [
        "pgpub_id", "Title", "Abstract", "Claim","Assignee_Applicant"],
    "test": ["PMC_ID", "Title", "Abstract", "Full Paper"],
    "clinicaltrial": ["NCT Number","Study Title","Interventions", "Brief Summary", "Study Description","Sponsor"]
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
 
def fuzzy_results(user_query, size=10):
 
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
 
 
 
def fetch_results(user_query, size=5):
    """Fetches raw Elasticsearch results and returns them immediately."""
    return fuzzy_results(user_query, size=size)
 
def get_prompt(field_name, user_query):
    prompts = {
        f"Disease Name": "Extract details about the stability of the active ingredient '{user_query}', formulation, including storage conditions, temperature variations, shelf life, and degradation prevention methods.",
        f"Mechanism of Association": "Summarize how the active ingredient '{user_query}', interacts with other components in the formulation, including synergistic effects, adverse reactions, and stability changes.",
        f"Bacteria or Microbe": "Provide the composition of the formulation, including the active ingredient '{user_query}', carrier agents, and key excipients.",
        f"Role/Pathway": "Describe the characteristics of each ingredient in the composition, including physical and chemical properties.",
        f"Potential of Drug": "List the components that interact with the active ingredient'{user_query}', specifying whether they improve efficacy, stability, or cause degradation.",
        f"Constipation as Comorbidity": "Identify the physical form of the formulation (e.g., lotion, cream, gel, patch, spray, tablet, injectable) for the active ingredient '{user_query}'.",
        f"Analyst Comment (Disease Association to Gut Microbiome)": "Extract details about the experimental conditions used in stability, efficacy, and safety tests for the active ingredient '{user_query}'.",
        f"Scientific Evidence": "Summarize the stability test results, including duration, storage conditions, and observed stability or degradation percentages for the active ingredient '{user_query}'.",
        
 
    }
    return prompts.get(field_name, "NA")
 
def extract_info(field_name, text, user_query):
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


##USER REQUESTED FIELDS ONLY##

def stream_drug(results, user_query, requested_fields):
    """
    Extracts only the requested fields in parallel and yields partial SSE updates.
    
    :param results: List of Elasticsearch results.
    :param user_query: The active ingredient or user query.
    :param requested_fields: List of fields user wants (e.g., ["Stability Conditions", "Interaction"]).
    """
    all_fields = [
    "Disease Name",
    "Mechanism of Association",
    "Bacteria or Microbe",
    "Role/Pathway",
    "Potential of Drug",
    "Constipation as Comorbidity",
    "Analyst Comment (Disease Association to Gut Microbiome)",
    "Scientific Evidence",
    "Drug Studied player",

  
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
            brief_summary=patent.get("Brief Summary","N/A")
            description=patent.get("Study Description","N/A")
            source = patent.get("source", patent.get("pgpub_id", "N/A"))
            if source == "N/A":
                source = patent.get("PMC_ID", "N/A")
            elif source=="N/A":
                source=patent.get("NCT Number","N/A")

            print(f"\n[Processing] Patent: {source} - {title}")

            patent_text = (
                f"Title: {title}\n"
                f"Abstract: {patent.get('Abstract', '')}\n"
                f"Claim: {patent.get('Claim', '')}\n"
                f"Full Paper: {patent.get('Full Paper', '')}\n"
                f"Brief Summary: {patent.get('Brief Summary', '')}\n"
                f"Study Description: {patent.get('Study Description', '')}\n"
            )

            extracted_info = {
                "Title": title,
                "Claim": claim,
                "Brief Summary":brief_summary,
                "Study Description":description,
                "Publication Number": source
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
                    print(f"[Completed] {field} extracted for {source}")
                except Exception as e:
                    extracted_info[field] = f"Error: {str(e)}"
                    print(f"[Error] {field} failed for {source}: {e}")

                # Yield partial results as they complete
                print(f"[Yielding] Partial result for {source} - Field: {field}")
                yield f"data: {json.dumps(extracted_info)}\n\n"

            print(f"[Finished] All requested fields completed for {source}\n")

    # Send "done" event at the end
    print("[Done] All patents processed. Sending completion event.")
    yield 'event: done\ndata: {"finished": true}\n\n'


 
