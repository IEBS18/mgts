import os
import sys
from openai import AzureOpenAI
from dotenv import load_dotenv
load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

openai_client =AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"

context = []
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


def filter_keys(input_list, keys_to_keep):
    filtered_list = []
    for item in input_list:
        filtered_dict = {key: item[key] for key in keys_to_keep if key in item}
        filtered_list.append(filtered_dict)
    return filtered_list

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

def create_prompt(search_results):
    """
    Create an OpenAI prompt using the search results.
    
    Parameters:
    - search_results: A list of dictionaries containing search results.
    
    Returns:
    - A formatted OpenAI prompt string.
    """

    disease_data = search_results['diseaseData'][0]
    drug_data = search_results['drugData']
    filtered_drug_data = filter_keys(drug_data, keys)
    disease_name = disease_data['Disease']
    context_prompt = f'''You are a highly knowledgeable medical assistant specializing in rare diseases and novel drug treatments. Below is context data regarding '{disease_name}' disease and its respective treatments (available drugs). Use this data to answer any user queries effectively. 
    
    Disease Information: \n\n {disease_data} \n\n
    Explanation of Disease Data Keys:
    - **Disease**: Name of the disease being described.
    - **Disease Overview**: Provides a general description of the disease, including its definition and basic details.
    - **Disease Biology**: In-depth biological background of the disease, including the molecular basis and pathology.
    - **Pathophysiology**: Explains how the disease develops, detailing the physiological changes it causes.
    - **Signs & Symptoms**: Lists symptoms that patients typically experience.
    - **Risk Factors**: Factors that increase a person's chance of getting the disease.
    - **Prevalence**: Information about how common the disease is in the population.
    - **Patient Demographics**: Characteristics of people most likely to develop the disease.
    - **Diagnosis**: How the disease is identified, including tests and evaluations.
    - **Stages progression**: Details any progression phases that the disease might have.
    - **Sub-types**: Possible subtypes or variations of the disease.
    - **Treatment & Management**: General approaches for treating and managing the disease.
    - **Treatment options**: Specific therapies used for treating the disease.
    - **Unmet Needs**: Unaddressed medical requirements for the disease.
    - **Document**: Name of the source document for this context.
    \n\n
    Drug Information: \n\n {filtered_drug_data} \n\n
    Explanation of Drug Data Keys:
    - **TradeName**: Commercial or brand name of the drug.
    - **Active Ingredient**: The main active pharmaceutical compound in the drug.
    - **Type_of_Drug**: Classification of the drug (e.g., small molecule, monoclonal antibody).
    - **Disease**: The condition(s) the drug is intended to treat.
    - **Country**: Country where the drug information is most applicable or where the drug is available.
    - **Symptoms**: Symptoms targeted or alleviated by this drug.
    - **Efficacy**: Effectiveness metrics, such as response rate or clinical outcomes.
    - **Safety**: Safety considerations and overall safety profile.
    - **Adverse_Events**: Possible side effects and adverse reactions from taking the drug.
    - **Manufacturer**: The company that produces the drug.
    - **Age_Group**: Age group for which the drug is most suitable.
    - **Gender**: Demographic information on which gender is more affected or targeted.
    - **Morbidity**: Morbidity rates associated with the disease treated by the drug.
    - **Mortality**: Mortality rate associated with the disease or drug.
    - **Annual_Therapy_Costs**: Estimated yearly cost of the therapy (Convert the currency mentioned in USD, and return in USD only).
    - **Price**: Price per unit of the medication strictly in USD.
    - **Quality_of_Life**: Impact of the drug on the patient's quality of life.
    - **Size**: Packaging information, such as dosage and form (e.g., capsules, vials).
    '''


    
    return context_prompt


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

if __name__ == "__main__":
    print("Welcome to the Disease Chatbot!")
    search_results = {'diseaseData': [{'Disease': 'Waldenstrom Macroglobulinemia','Disease Overview': 'Waldenstrom macroglobulinemia is a rare type of blood cancer, often affecting individuals aged 65 and older. Symptoms may include fatigue, fever, weight loss, night sweats, and enlarged lymph nodes.','Diagnosis': 'Diagnosis involves laboratory tests, including electrophoresis, bone marrow biopsy, and imaging.', 'Treatment & Management': 'Options include chemotherapy, immunotherapy, and targeted therapy. In cases of blood thickening, plasmapheresis may be recommended.', 'Prevalence': 'Approximately 5 cases per 1 million people in the United States.'}], 'drugData': [{'TradeName': 'Brukinsa', 'Type_of_Drug': 'Bruton tyrosine kinase inhibitor', 'Active Ingredient': 'Zanubrutinib', 'Efficacy': '80% overall response rate in treating Waldenstrom macroglobulinemia.', 'Adverse_Events': 'Common side effects include diarrhea, fatigue, and bruising.', 'Annual_Therapy_Costs': 'CHF 40,000 - CHF 70,000'}]}
    # search_results = {'diseaseData':[{}], 'drugData':[{},{},{}]}
    while(True):
        question = input("You: ")
        if question == "exit":
            print("Goodbye!")
            break
        
        response = process_question(search_results, question, disease_conversation_history)
        print(f"Chatbot: {response}")