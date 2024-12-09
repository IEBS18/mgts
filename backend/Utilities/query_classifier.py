import os
import torch
import pickle
from elasticsearch import Elasticsearch
from openai import OpenAI
from transformers import BertTokenizer
from dotenv import load_dotenv
load_dotenv()


es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

# from diseasechatbot import generate_openai_completion
from Utilities.train_query_classifier import QueryClassifierModel
from Utilities.utils import(
    preprocess,
    filter_keys,
    createclinicalcontext,
    creatediseasecontext,
    createdrugcontext,
    createpubmedcontext
)  
MODEL = "gpt-3.5-turbo"

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

with open(r"Utilities\query_router.pkl", "rb") as f:
    model = QueryClassifierModel()
    state_dict = pickle.load(f)
    model.load_state_dict(state_dict)
    
print(model)

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
print(tokenizer)

model.eval()

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
            else:
                print(f"Warning: No 'hits' key in response: {res}")
        return all_results
 
    except Exception as e:
        print(f"Error querying Elasticsearch index {index}: {e}")
        return []

context = []
conversation_history = []
disease_conversation_history = []
keys = [
    'TradeName',
    'Active Ingredient',
    'Manufacturer',
    'Size',
    'Price',
    'Quality_of_Life',
    'Efficacy',
    'Safety',
    'Adverse_Events',
    'Annual_Therapy_Costs',
    'Type_of_Drug',
    'Country'
]

def predict_query(query, model, tokenizer, max_len=64, threshold=0.5, label_map=None):
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

label_map = {0: "PubMed", 1: "Clinical Trials", 2: "Drug-Disease Association"}  


def generate_openai_completion(question):
    if not isinstance(question, str):
        question = str(question)
    
    # Add the user's question to the conversation history
    conversation_history.append({"role": "user", "content": question})
    print('Conversation history updated.')
    # print("disease conv hist:",disease_conversation_history)
    print('aarti uvalte thamb')
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=conversation_history,
        temperature=0.7,
        top_p=1.0
          
    )
    print(model)
    print('response', response)
    
    assistant_response = response.choices[0].message.content
    print("response:")

    conversation_history.append({"role": "assistant", "content": assistant_response})

    return assistant_response


def route_to_chatbot(user_query, search_results, conversation_history):
    predicted_labels = predict_query(user_query, model, tokenizer, label_map=label_map)
    print("Predicted Labels:", predicted_labels)
    
    diseasename = search_results['diseaseData'][0]['Disease']

    for label in predicted_labels:
        if label== 'PubMed' :
            user_query=preprocess(user_query, diseasename)
            # print("user query", user_query)
            pubmedresults=get_elasticsearch_results(
        index="pubmed",
        query=user_query,
        fields=["Title", "AbstractText", "PMID"],
        operator="OR"
    )

            search_results['pubmedData'] = pubmedresults

        elif label =='Clinical Trials':
            user_query=preprocess(user_query, diseasename)
            # print("user query", user_query)
            clinicalresults= get_elasticsearch_results(
        index="clinicaltrial",
        query=user_query,
        fields=["Study Title", "Study Description", "NCT Number", "Study Status", "Conditions",
                "Interventions", "Sponsor", "Collaborators", "Study Design", "Phases"],
        operator="OR"
    )
            search_results['clinicalData'] = clinicalresults

            print("new search results:")
        elif label=='PubMed' and 'Clinical Trials':
            user_query=preprocess(user_query, diseasename)
            commonresults= get_elasticsearch_results(
        index="clinicaltrial",
        query=user_query,
        fields=["Study Title", "Study Description", "NCT Number", "Study Status", "Conditions",
                "Interventions", "Sponsor", "Collaborators", "Study Design", "Phases"],
        operator="OR"
        ) and get_elasticsearch_results(
        index="pubmed",
        query=user_query,
        fields=["Title", "AbstractText", "PMID"],
        operator="AND"
        )
            search_results['commonlData'] = commonresults
            print("done")
    print('ok')    
    response= process_question(search_results, user_query, conversation_history)
    # print('response:', response)
    # print("conv hist:", conversation_history)
    return response

def create_prompt(search_results):
    """
    Create a comprehensive OpenAI prompt based on the search results.

    Parameters:
        search_results: A dictionary containing data for disease, drug, PubMed, and clinical trials.

    Returns:
        str: A formatted OpenAI prompt string.
    """
    disease_data = search_results.get('diseaseData', [{}])[0]
    disease_context = str(creatediseasecontext(disease_data))
    disease_name = disease_data.get('Disease', 'Unknown Disease')

    drug_data = search_results.get('drugData', [])
    filtered_drug_data = filter_keys(drug_data, keys)
    drug_context = str(createdrugcontext(filtered_drug_data))

    final_prompt = (
        f"You are a highly knowledgeable assistant specializing in rare diseases, novel drug treatments, and clinical research.\n\n"
        f"Disease Information for '{disease_name}':\n\n{disease_context}\n\n"
        f"Drug Information:\n\n{drug_context}\n\n"
    )

    if 'pubmedData' in search_results:
        pubmed_context = str(createpubmedcontext(search_results['pubmedData']))
        final_prompt += f"PubMed Articles:\n\n{pubmed_context}\n\n"

    if 'clinicalData' in search_results:
        clinical_context = str(createclinicalcontext(search_results['clinicalData']))
        final_prompt += f"Clinical Trials Information:\n\n{clinical_context}\n\n"

    final_prompt += (
        "Please use the above data to answer the user's query accurately and factually. "
        "Do not hallucinate information or provide responses outside the context of the data provided."
    )
    # print("final prompt:",final_prompt)
    return final_prompt


def process_question(results, question, conversation_history):
    
    context_prompt = create_prompt(results)
    # print('context:', context_prompt)
    strlength = len(context_prompt)
    # print(context_prompt, strlength)
    conversation_history.append({"role": "system", "content": context_prompt})
    answer = generate_openai_completion(question)
    return answer
        

if __name__=="__main__":

    user_query = input("Enter your query: ")
    predicted_labels = predict_query(user_query, model, tokenizer, label_map=label_map)

    print("Predicted Labels:", predicted_labels)
    
    search_results = {'diseaseData':[{}], 'drugData':[{},{},{}]}
    # print("search results:", search_results)
    final_response = route_to_chatbot(user_query, search_results, conversation_history)

    # print("serc result",search_results)
    # print("conv hist",conversation_history)
    print("\nFinal Aggregated Response from Dynamic Chatbot:")
    print("final:",final_response)
