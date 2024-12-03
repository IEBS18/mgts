import os
import torch
import pickle

from openai import OpenAI
from transformers import BertTokenizer
from dotenv import load_dotenv
load_dotenv()




# from diseasechatbot import generate_openai_completion
from Utilities.train_query_classifier import QueryClassifierModel
from Utilities.utils import(
    preprocess,
    get_elasticsearch_results_clinical,
    get_elasticsearch_results_pubmed,
    filter_keys,
    createclinicalcontext,
    creatediseasecontext,
    createdrugcontext,
    createpubmedcontext
)  
MODEL = "gpt-4o-mini"

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

with open(r"Utilities\query_router.pkl", "rb") as f:
    model = QueryClassifierModel()
    state_dict = pickle.load(f)
    model.load_state_dict(state_dict)
    
print(model)

# with open("tokenizer.pkl", "rb") as f:
#     tokenizer = QueryClassifierModel()
#     state_dict = pickle.load(f)
#     tokenizer.load_state_dict(state_dict)
# print(tokenizer)
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
print(tokenizer)

model.eval()

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

# def pubmed_chatbot(query):
#     return f"PubMed chatbot response for query: '{query}'"

# def clinical_trials_chatbot(query):
#     return f"Clinical Trials chatbot response for query: '{query}'"

# def drug_disease_association_chatbot(query):
#     return f"Drug-Disease Association chatbot response for query: '{query}'"

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


# Function to generate OpenAI completion
def generate_openai_completion(question):
   

    # Add the user question to the conversation history
    disease_conversation_history.append({"role": "user", "content": question})

    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=disease_conversation_history
    )

    # Extract the assistant's response
    assistant_response = response.choices[0].message.content

    # Add the assistant's response to the conversation history
    disease_conversation_history.append({"role": "assistant", "content": assistant_response})

    return assistant_response

def route_to_chatbot(user_query, search_results, conversation_history):
    predicted_labels = predict_query(user_query, model, tokenizer, label_map=label_map)
    print("Predicted Labels:", predicted_labels)
    
    diseasename = search_results['diseaseData'][0]['Disease']
        # for label in predicted_labels:
    #     if label == "PubMed":
    #         responses.append(pubmed_chatbot(user_query))
    #     elif label == "Clinical Trials":
    #         responses.append(clinical_trials_chatbot(user_query))
    #     elif label == "Drug-Disease Association":
    #         responses.append(drug_disease_association_chatbot(user_query))
    for label in predicted_labels:
        if label== 'PubMed' :
            user_query=preprocess(user_query, diseasename)
            print("user query", user_query)
            pubmedresults=get_elasticsearch_results_pubmed(user_query)
            print("pubmed results:",pubmedresults)
            search_results['pubmedData'] = pubmedresults
            print("new search_results",search_results)
    # if predicted_labels contains 0:
    #   pubmedresults = es.msearch(processed(user_query), data=pubmed)
            # search_results['pubmedData'] = pubmedresults
            return pubmedresults
    #   pmids = extractpmid(pubmedresults)
        elif label =='Clinical Trials':
            user_query=preprocess(user_query, diseasename)
            print("user query", user_query)
            clinicalresults=get_elasticsearch_results_clinical(user_query)
            print("clinical results:", clinicalresults)
            search_results['clinicalData'] = clinicalresults
            print("new search results:", search_results)
            return clinicalresults
        elif label=='PubMed' and 'Clinical Trials':
            user_query=preprocess(user_query, diseasename)
            print("user query", user_query)
            commonresults=get_elasticsearch_results_clinical(user_query) and get_elasticsearch_results_pubmed(user_query)
            print("clinical results:", clinicalresults)
            search_results['commonlData'] = commonresults
            print("new search results:", search_results)
            return commonresults
        
    response= process_question(search_results, user_query, conversation_history)
    return response


    # if predicted_labels contains 1:
    #   clinicalresults = es.msearch(processed(user_query), data=clinicaltrials)
    #   search_results['clinicalData'] = clinicalresults
    #   nctids = extractnctid(clinicalresults)
    
    # response = process_question(search_results, user_query, conversation_history)
    # response += showsources(pmid,nctid)
    
    # return response
# def process_question(results, question, conversation_history):
    
#     # Create an OpenAI prompt using the search results
#     context_prompt = create_prompt(results)
#     strlength = len(context_prompt)
#     print(context_prompt, strlength)
#     # Check if the system prompt is already in the last 10 items of conversation history
#     # if any(item["role"] == "system" for item in conversation_history[-10:]):
#     #     presentinlast10 = True
#     # else:
#     #     presentinlast10 = False
#     #     conversation_history.append({"role": "system", "content": context_prompt})
#     #     print("added system context.")
#         # Generate an OpenAI completion for the user question
#     conversation_history.append({"role": "system", "content": context_prompt})
#     answer = generate_openai_completion(question)
#     return answer
    # def process_question(results, question, conversation_history):
    #   context_prompt = create_prompt(results)
    #   conversation_history.append({"role": "system", "content": context_prompt})
    #   answer = generate_openai_completion(question)   ## NO CHANGE IN THIS FUNC.
    #   return answer
    
    # def create_prompt(search_results):
    #   disease_data = search_results['diseaseData'][0]
    #   disease_context = creatediseasecontext(disease_data)
    #   drug_data = search_results['drugData']
    #   filtered_drug_data = filter_keys(drug_data, keys)
    #   drug_context = createdrugcontext(drug_data)
    #   disease_name = disease_data['Disease']
    #   final_prompt = f"blah blah {diseaseName} blah blah we have disease data"
    #   final_prompt += disease_context
    #   final_prompt += "blah blah we have drug data "
    #   final_prompt += drug_context
    #   usePubMed = False
    #   useClinical = False
    #   if search_result.key() contains pubmedData:
    #       usePubMed = True
    #       pubmedData = search_results['pubmedData']
    #       pubmed_context = createpubmedcontext(pubmedData)
    #       final_prompt += " blah blah we have pubmed data"
    #       final_prompt += pubmed_context
    
    #   if search_result.key() contains clinicalData:
    #       useClinical = True
    #       ClinicalData = search_results['ClinicalData']   
    #       clinical_context = createclinicalcontext(clinicalData)
    #       final_prompt += " blah blah we have clinical data"
    #       final_prompt += clinical_context
    
    
    #   final_prompt += " blah blah dont hallucinate , answer user query"
    #   return final_prompt


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
    print(final_prompt)
    return final_prompt


def process_question(results, question, conversation_history):
    
    # Create an OpenAI prompt using the search results
    context_prompt = create_prompt(results)
    strlength = len(context_prompt)
    print(context_prompt, strlength)
    # Check if the system prompt is already in the last 10 items of conversation history
    # if any(item["role"] == "system" for item in conversation_history[-10:]):
    #     presentinlast10 = True
    # else:
    #     presentinlast10 = False
    #     conversation_history.append({"role": "system", "content": context_prompt})
    #     print("added system context.")
        # Generate an OpenAI completion for the user question
    conversation_history.append({"role": "system", "content": context_prompt})
    answer = generate_openai_completion(question)
    return answer
        

    
    # responses = []
    # for label in predicted_labels:
    #     if label == "PubMed":
    #         responses.append(pubmed_chatbot(user_query))
    #     elif label == "Clinical Trials":
    #         responses.append(clinical_trials_chatbot(user_query))
    #     elif label == "Drug-Disease Association":
    #         responses.append(drug_disease_association_chatbot(user_query))
    
    # final_response = dynamic_chatbot(user_query, responses)
    # return final_response
if __name__=="__main__":

    user_query = input("Enter your query: ")
    predicted_labels = predict_query(user_query, model, tokenizer, label_map=label_map)

    print("Predicted Labels:", predicted_labels)
    
    search_results = {'diseaseData':[{}], 'drugData':[{},{},{}]}
    print("search results:", search_results)
    final_response = route_to_chatbot(user_query, search_results, conversation_history)

    print(search_results)
    print(conversation_history)
    print("\nFinal Aggregated Response from Dynamic Chatbot:")
    print(final_response)
