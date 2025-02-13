import os
import torch
import pickle
from elasticsearch import Elasticsearch
from openai import AzureOpenAI
from transformers import BertTokenizer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

import sys
sys.stdout.reconfigure(encoding='utf-8')

# Initialize Elasticsearch
es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

from Utilities.utils import preprocess, create_prompt
from Utilities.train_query_classifier import QueryClassifierModel  # Keep model import, but lazy load it

MODEL = "gpt-4o-mini"

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)

# 🛑 Lazy Load Model (Initialize later to save memory)
model = None
tokenizer = None

def load_model():
    """Lazy load the QueryClassifierModel and tokenizer."""
    global model, tokenizer
    if model is None or tokenizer is None:
        print("Loading Model and Tokenizer...")
        model = QueryClassifierModel()
        tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        with open(r"Utilities/query_router.pkl", "rb") as f:
            state_dict = pickle.load(f)
            model.load_state_dict(state_dict)
        model.eval()
    return model, tokenizer

# Elasticsearch Query Function
def get_elasticsearch_results(index, query, fields, operator="OR"):
    if isinstance(query, set):
        query = " OR ".join(query)
    es_query = [
        {'index': index},
        {
            "query": {
                "query_string": {
                    "query": query,
                    "fields": fields,
                    "default_operator": operator,
                }
            },
            "size": 10
        }
    ]
    try:
        result = es.msearch(body=es_query)
        responses = result.get('responses', [])
        all_results = []
        for res in responses:
            if 'hits' in res and 'hits' in res['hits']:
                all_results.extend([hit['_source'] for hit in res['hits']['hits']])
        return all_results
    except Exception as e:
        print(f"Error querying Elasticsearch index {index}: {e}")
        return []

# 🔵 Keep conversation history inside this script
conversation_history = []

# Labels for Query Classification
label_map = {0: "PubMed", 1: "Clinical Trials", 2: "Drug-Disease Association"}

def predict_query(query, threshold=0.5, max_len=64):
    """Predict query category using the lazy-loaded model."""
    model, tokenizer = load_model()  # Ensure model is loaded before prediction
    
    encoding = tokenizer.encode_plus(
        query, add_special_tokens=True, max_length=max_len,
        padding="max_length", truncation=True, return_tensors="pt"
    )
    
    input_ids = encoding["input_ids"]
    attention_mask = encoding["attention_mask"]
    
    with torch.no_grad():
        logits = model(input_ids, attention_mask=attention_mask)
    
    probs = torch.sigmoid(logits)
    predictions = (probs > threshold).long()
    predicted_indices = torch.nonzero(predictions[0]).flatten().tolist()
    
    return [label_map[idx] for idx in predicted_indices] if predicted_indices else []

def generate_openai_completion(question):
    """Generates a chatbot response using Azure OpenAI."""
    if not isinstance(question, str):
        question = str(question)
    
    conversation_history.append({"role": "user", "content": question})
    
    response = openai_client.chat.completions.create(
        model=MODEL, messages=conversation_history,
        temperature=0.7, top_p=1.0
    )
    
    assistant_response = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": assistant_response})
    return assistant_response

def route_to_chatbot(user_query, search_results):
    """Routes query to the appropriate service based on model predictions."""
    predicted_labels = predict_query(user_query)
    print("Predicted Labels:", predicted_labels)
    
    disease_name = search_results['diseaseData'][0]['Disease']

    if "PubMed" in predicted_labels:
        pubmed_query = preprocess(user_query, disease_name)
        search_results['pubmedData'] = get_elasticsearch_results(
            index="pubmed",
            query=pubmed_query,
            fields=["Title", "AbstractText", "PMID"]
        )

    if "Clinical Trials" in predicted_labels:
        clinical_query = preprocess(user_query, disease_name)
        search_results['clinicalData'] = get_elasticsearch_results(
            index="clinicaltrial",
            query=clinical_query,
            fields=["Study Title", "Study Description", "NCT Number", "Study Status",
                    "Conditions", "Interventions", "Sponsor", "Collaborators",
                    "Study Design", "Phases"]
        )

    return process_question(search_results, user_query)

def process_question(results, question):
    """Formats context and gets chatbot response."""
    context_prompt = create_prompt(results, list(results.keys()))
    conversation_history.append({"role": "system", "content": context_prompt})
    return generate_openai_completion(question)

if __name__ == "__main__":
    user_query = "Pubmed for Malaria"
    search_results = {'diseaseData': [{'Disease': 'Malaria'}], 'drugData': [{}, {}, {}]}
    
    final_response = route_to_chatbot(user_query, search_results)

    print("\nFinal Aggregated Response from Dynamic Chatbot:")
    print("BOT:", final_response)
