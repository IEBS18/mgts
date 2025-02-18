import os
from dotenv import load_dotenv
load_dotenv()

from RnD.rnd import fuzzy_search
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.core.pipeline.transport import RequestsTransport
import sys
sys.stdout.reconfigure(encoding='utf-8')


# Azure AI Configuration for LLaMA 3.3-70B
MODEL = "Llama-3.3-70B-Instruct"
transport = RequestsTransport(timeout=(600, 600))  # Increase timeout
client = ChatCompletionsClient(
    endpoint=os.getenv("LLAMA_3_URL"),
    credential=AzureKeyCredential(os.getenv("LLAMA_3_API")),
    transport=transport
)

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

def extract_info(text, column_name, column_description):
    try:
        user_message = "column name:" + column_name + "\ncolumn description:" + column_description + "\n\nCONTEXT:\n\n" + str(text)
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
        response = extract_info(patent, column_name, column_description)
        responses.append(response)
        
    return responses
 
 
    