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
You are a market research analyst tasked with evaluating the Safety and Efficacy profiles of multiple drugs, including a given main drug and its comparators. 
Your objective is to identify and analyze clinically significant or numerically important differences between the main drug and other drugs.

-->TASK:
-Compare the Safety and Efficacy of the main drug against the other drugs.
-Identify key differences based on available data, considering statistical significance, clinical relevance, and impact on patient outcomes.
-Provide an impact-driven analysis explaining how these differences influence the main drug’s positioning in the market.
-->INSTRUCTIONS:
-Examine both Safety and Efficacy sections for the main drug and the comparators.
-Quantify differences wherever applicable (e.g., “X% lower incidence of adverse effects” or “Y% higher response rate”).
-Provide only the impact points in a structured manner. Each point should be a detailed summary (80-120 words) explaining the observed difference, potential causes, and implications on patient treatment, regulatory standing, or market competitiveness.
-If no significant differences exist, explicitly state that and mention any minor but notable differentiating factors that may still be relevant for decision-making.
-Ensure that the points are concise yet comprehensive, avoiding unnecessary repetition while covering all key insights.
-->FORMAT:
-Provide two separate sections for Safety and Efficacy.
-List 2-3 bullet points under each section, with each point offering an insightful explanation of a key difference.
-Avoid explicit section headers for the bullet points—just present the findings in a seamless, structured manner.
-->OUTPUT EXPECTATIONS:
-A precise yet detailed comparative analysis that highlights how the main drug stands out (positively or negatively) in terms of Safety and Efficacy.
-A focus on real-world impact, including treatment effectiveness, patient tolerability, and competitive advantages or disadvantages.
-If applicable, mention potential reasons for observed differences, such as formulation, mechanism of action, or patient demographics.
-This will help in understanding the market positioning of the main drug while ensuring data-driven decision-making in clinical and commercial strategies

Return in Bullet points. Maximum 6 points not more than that
"""

    )
    
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ],
        
        temperature=0.7
    )

    return response.choices[0].message.content.strip()

def process_drug_comparison(drug_data_list, main_drug):
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
        
        prompt_lines.append(f"Drug: {main_drug}")
        prompt_lines.append(f"Safety: {safety}")
        prompt_lines.append(f"Efficacy: {efficacy}")
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

def format_output(drug_name, differences):
    return f"\n{differences}"

if __name__ == "__main__":
    # Allow the user to input a main drug
    print("Enter the main drug to compare:")
    
    main_drug = input("Enter Main Drug: ").strip()
    
    if not main_drug:
        print("Please provide a valid drug name.")
        sys.exit()

    # Process the comparison
    results = process_drug_comparison(DRUG_DATA, main_drug)

    # Format and print the output
    formatted_output = format_output(main_drug, results["differences"])
    
    print(formatted_output)
