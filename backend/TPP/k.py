import os
import sys
from dotenv import load_dotenv
from openai import AzureOpenAI
 
# Ensure UTF-8 output (especially on Windows)
sys.stdout.reconfigure(encoding='utf-8')
 
# Load environment variables (e.g., OPENAI_API_KEY)
load_dotenv()
 
# Set up OpenAI
openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
 
MODEL = "gpt-4o-mini"  # Replace with a model that your org has access to
 
# Example in-memory drug data
DRUG_DATA = [
    {
        "Drug": "Aspirin",
        "Safety": "Mild risk of stomach irritation and bleeding with prolonged use.",
        "Efficacy": "Effective at reducing pain, fever, and inflammation. Can prevent blood clots."
    },
    {
        "Drug": "Ibuprofen",
        "Safety": "Can cause gastrointestinal discomfort and rare kidney issues with long-term use.",
        "Efficacy": "Highly effective for mild to moderate pain, inflammation, and fever reduction."
    },
    {
        "Drug": "Acetaminophen",
        "Safety": "Liver toxicity at high doses. Generally safe if used within recommended dosage.",
        "Efficacy": "Good analgesic and antipyretic but weaker anti-inflammatory effects than NSAIDs."
    },
    {
        "Drug": "Naproxen",
        "Safety": "May increase risk of cardiovascular events if used long-term; GI upset possible.",
        "Efficacy": "Long-acting NSAID effective for chronic inflammatory conditions like arthritis."
    },
    {
        "Drug": "Diclofenac",
        "Safety": "Possible GI side effects, potential cardiovascular risks, particularly at high doses.",
        "Efficacy": "Potent anti-inflammatory and analgesic effect for arthritis and acute injuries."
    }
]
 
def get_drug_docs_from_memory(drug_name, drug_data_list):
    """Returns a list of all documents in drug_data_list where Drug == drug_name."""
    matching_docs = [entry for entry in drug_data_list if entry["Drug"].strip().lower() == drug_name.strip().lower()]
    return matching_docs
 
def get_differences_from_llm(prompt_text):
    """Sends the prompt to OpenAI GPT model and returns the response text."""
    system_prompt = (
 """
-You are a market research analyst evaluating multiple drugs based on Safety, Efficacy, and Patient Eligibility. 
-Your task is to extract key insights from the comparison between a main drug and its competitor drugs, focusing on its effectiveness and market potential.

-->TASK:
-Identify key strengths, weaknesses, or differentiators of the main drug using comparative drugs as reference points.
-Assess how effectiveness, safety, and patient eligibility criteria influence its potential in the market.
-Provide insightful, data-driven summaries that explain where the drug stands in the competitive landscape.
-->INSTRUCTIONS:
-Do not explicitly categorize insights under “Safety,” “Efficacy,” or “Patient Eligibility.” Instead, provide a seamless summary integrating all aspects.
-Only provide 2-3 key insights, each within 50-80 words.
-Ensure that each point highlights the comparative advantage, market impact, or clinical positioning of the main drug.
-Use quantitative differences when available (e.g., “X rate higher response rate” or “Y rate broader eligibility criteria”).
-Insights should focus on the practical implications of these differences, such as prescription preference, patient outcomes, regulatory advantages, or market growth potential.
-Avoid generic statements—every point should be comparative and impactful.
OUTPUT EXPECTATIONS:
A concise yet informative summary that highlights the main drug’s positioning.
Clear competitive differentiation, showing how it stands out or where it lags.
A focus on real-world implications to aid in market strategy and decision-making.
Return in bullet points"""
 
    )
   
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ],
        max_tokens=350,
        temperature=0.7
    )
 
    return response.choices[0].message.content.strip()
 
def process_key_insights(drug_data_list, main_drug):
    """Builds the prompt for main_drug vs other drugs from in-memory data."""
   
    # Get docs for the main drug
    main_drug_docs = get_drug_docs_from_memory(main_drug, drug_data_list)
 
    if not main_drug_docs:
        print(f"No documents found for the main drug: {main_drug}")
        return {"docs": [], "differences": ""}
 
    # Start building the prompt
    prompt_lines = [f"Below is the Safety and Efficacy information for the drug: {main_drug} compared with other drugs.", ""]
   
    # Append main drug details
    for doc in main_drug_docs:
        safety = doc.get("Safety", "No Safety Info")
        efficacy = doc.get("Efficacy", "No Efficacy Info")
        pat_elig = doc.get("Patient Eligibility", "No Patient Eligibility")
        prompt_lines.append(f"Drug: {doc['Drug']}")
        prompt_lines.append(f"Safety: {safety}")
        prompt_lines.append(f"Efficacy: {efficacy}")
        prompt_lines.append(f"Patient Eligibility: {pat_elig}")
        prompt_lines.append("")
 
    # Include data for other drugs (excluding main drug)
    other_drugs = [entry for entry in drug_data_list if entry["Drug"].strip().lower() != main_drug.strip().lower()]
   
    for doc in other_drugs:
        safety = doc.get("Safety", "No Safety Info")
        efficacy = doc.get("Efficacy", "No Efficacy Info")
       
        prompt_lines.append(f"Drug: {doc['Drug']}")
        prompt_lines.append(f"Safety: {safety}")
        prompt_lines.append(f"Efficacy: {efficacy}")
        prompt_lines.append("")
   
    # Combine everything
    combined_prompt = "\n".join(prompt_lines)
   
    differences_text = get_differences_from_llm(combined_prompt)
 
    return {
        "docs": main_drug_docs,
        "differences": differences_text
    }
 
def key_insights(drug_name, differences):
    return f"\n{differences}"
 
if __name__ == "__main__":
    # Allow the user to input a main drug
    print("Enter the main drug to compare:")
   
    main_drug = input("Enter Main Drug: ").strip()
   
    if not main_drug:
        print("Please provide a valid drug name.")
        sys.exit()
 
    # Process the comparison
    results = process_key_insights(DRUG_DATA, main_drug)
 
    # Format and print the output
    formatted_output = key_insights(main_drug, results["differences"])
   
    print(formatted_output)
 