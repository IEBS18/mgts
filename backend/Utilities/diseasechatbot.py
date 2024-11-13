import os
import sys
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4o-mini"

context = []
disease_conversation_history = []

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
    prompt = "Here are the top search results for your query:\n\n"
    disease_data = search_results['diseaseData'][0]
    drug_data = search_results['drugData'][0]
    disease_name = disease_data['Disease']
    context_prompt = f'''You are a highly knowledgeable medical assistant specializing in rare diseases and novel drug treatments. Below is context data regarding '{disease_name}' disease and it's respective treatments(Avaiable drugs) , using this data answer any user queries. \n\n
    Disease Information: \n\n {disease_data} \n\n'''
    context_prompt += f'''Drug Information: \n\n {drug_data} \n\n'''
    
    return context_prompt


def process_question(results, question, conversation_history):
    
    # Create an OpenAI prompt using the search results
    context_prompt = create_prompt(results)
    print(context_prompt)
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


print("Welcome to the Disease Chatbot!")
search_results = {'diseaseData': [{'Disease': 'Waldenstrom Macroglobulinemia','Disease Overview': 'Waldenstrom macroglobulinemia is a rare type of blood cancer, often affecting individuals aged 65 and older. Symptoms may include fatigue, fever, weight loss, night sweats, and enlarged lymph nodes.','Diagnosis': 'Diagnosis involves laboratory tests, including electrophoresis, bone marrow biopsy, and imaging.', 'Treatment & Management': 'Options include chemotherapy, immunotherapy, and targeted therapy. In cases of blood thickening, plasmapheresis may be recommended.', 'Prevalence': 'Approximately 5 cases per 1 million people in the United States.'}], 'drugData': [{'TradeName': 'Brukinsa', 'Type_of_Drug': 'Bruton tyrosine kinase inhibitor', 'Active Ingredient': 'Zanubrutinib', 'Efficacy': '80% overall response rate in treating Waldenstrom macroglobulinemia.', 'Adverse_Events': 'Common side effects include diarrhea, fatigue, and bruising.', 'Annual_Therapy_Costs': 'CHF 40,000 - CHF 70,000'}]}
# search_results = {'diseaseData':[{}], 'drugData':[{}]}
while(True):
    question = input("You: ")
    if question == "exit":
        print("Goodbye!")
        break
    
    response = process_question(search_results, question, disease_conversation_history)
    print(f"Chatbot: {response}")