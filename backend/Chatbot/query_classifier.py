import os
import torch
import pickle
from elasticsearch import Elasticsearch
from openai import AzureOpenAI
from transformers import AutoTokenizer
from DiseaseOverview.disease_overview_util import get_elasticsearch_results
from dotenv import load_dotenv
load_dotenv()

import sys
sys.stdout.reconfigure(encoding='utf-8')

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)
try:
    from .train_query_classifier import QueryClassifierModel
    from .utils import(
        preprocess,
        create_prompt
    )  
except:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))   
    from train_query_classifier import QueryClassifierModel
    from utils import(
        preprocess,
        create_prompt
    )  

MODEL = "gpt-4o-mini"

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)

tokenizer = AutoTokenizer.from_pretrained('dmis-lab/biobert-v1.1') 


def get_model():
    global _model
    if _model is None:
        # Get the absolute path of the current directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Construct the absolute path to chatbot.pkl
        chatbot_model_path = os.path.join(current_dir, 'chatbot.pkl')

        try:
            with open(chatbot_model_path, "rb") as f:
                _model = QueryClassifierModel()
                state_dict = pickle.load(f)
                _model.load_state_dict(state_dict)
                _model.eval()
        except FileNotFoundError as e:
            print(f"Error: {e}")
            raise e  # Re-raise the exception after logging it
        
    return _model

context = []
conversation_history = []
keys = [
    'TradeName', 'Active Ingredient', 'Manufacturer', 'Size', 'Price',
    'Quality_of_Life', 'Efficacy', 'Safety', 'Adverse_Events', 'Annual_Therapy_Costs',
    'Type_of_Drug', 'Country'
]

def predict_query(query, model=None, tokenizer=tokenizer, max_len=64, threshold=0.5, label_map=None):
    model = get_model()
    encoding = tokenizer.encode_plus(
        query,
        add_special_tokens=True,
        max_length=max_len,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )
    input_ids = encoding["input_ids"]
    attention_mask = encoding["attention_mask"]
    with torch.no_grad():
        logits = model(input_ids, attention_mask=attention_mask)
    
    probs = torch.sigmoid(logits)
    
    predictions = (probs > threshold).long()
    predicted_indices = torch.nonzero(predictions[0]).flatten().tolist()
    
    if label_map:
        return [label_map[idx] for idx in predicted_indices]
    
    return predicted_indices

label_map = {0: "PubMed", 1: "Clinical Trials", 2: "Patent"}  

def generate_openai_completion(question):
    if not isinstance(question, str):
        question = str(question)
    
    conversation_history.append({"role": "user", "content": question})
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=conversation_history,
        temperature=0.7,
        top_p=1.0
    )
    
    assistant_response = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": assistant_response})
    return assistant_response

def route_to_chatbot(user_query, search_results, conversation_history):
    model = get_model()
    predicted_labels = predict_query(user_query, model, tokenizer, label_map=label_map)
    print("Predicted Labels:", predicted_labels)

    # Safe check for diseaseData
    diseasename = None
    if 'diseaseData' in search_results and search_results['diseaseData']:
        diseasename = search_results['diseaseData'][0].get('Disease', None)

    for label in predicted_labels:
        if label == 'PubMed':
            pubmed_query = preprocess(user_query, diseasename if diseasename else "")
            raw_pubmed_results = get_elasticsearch_results(
                index="test",
                query=pubmed_query,
                fields=["PMC_ID", "Title", "Full Paper"],
                operator="OR"
            )
            filtered_pubmed_results = []
            required_fields = [
        "PMC_ID", "Title", "Full Paper","Active Pharmaceutical Ingredient (API)", "Biomarkers","Disease"
    ]
            for pubmed in raw_pubmed_results:
                filtered_pubmed_results.append({key: pubmed.get(key, "N/A") for key in required_fields})
        # Store only the relevant patent data
            search_results['pubmedData'] = filtered_pubmed_results

        elif label == 'Clinical Trials':
            clinical_query = preprocess(user_query, diseasename if diseasename else "")
            clinicalresults = get_elasticsearch_results(
                index="clinicaltrial",
                query=clinical_query,
                fields=["Study Title", "Study Description", "Conditions"],
                operator="OR"
            )
            search_results['clinicalData'] = clinicalresults

        elif label == 'Patent':
            patent_query = preprocess(user_query, diseasename if diseasename else "")
            print(patent_query)
            raw_patent_results = get_elasticsearch_results(
                index="pg_pharma, granted_updated_final",
                query=patent_query,
                fields=["Abstract", "Claim", "Title"],
                operator="OR"
            )
            filtered_patent_results = []
            required_fields = [
                "Abstract", "Application_Date", "Application_Year", "Assignee_Applicant",
                "Broad_Industry", "CPC_Classification", "CPC_Classifications", "Claim",
                "Display_Key", "Earliest_Priority_Date", "IPC_Classifications", "Industry",
                "Inventor", "Jurisdiction", "Patent_Legal_Status", "Publication_Date",
                "Publication_Year", "Technology", "Title"
            ]

            for patent in raw_patent_results:
                filtered_patent_results.append({key: patent.get(key, "N/A") for key in required_fields})
            # Store only the relevant patent data
            search_results['patentData'] = filtered_patent_results

    response = process_question(search_results, user_query, conversation_history)
    return response

def process_question(results, question, conversation_history):
    context_prompt = create_prompt(results, keys)
    print(context_prompt)
    conversation_history.append({"role": "system", "content": context_prompt})
    answer = generate_openai_completion(question)
    return answer

# if __name__ == "__main__":
#     user_query = "pubmed related Biomarkers for Malaria"
#     search_results = {'diseaseData': [{'Disease': 'Malaria'}], 'drugData': [{}, {}, {}]}
#     final_response = route_to_chatbot(user_query, search_results, conversation_history)
#     print("\nFinal Aggregated Response from Dynamic Chatbot:")
#     print("BOT:", final_response)
