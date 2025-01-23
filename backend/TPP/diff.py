import os

import sys

from dotenv import load_dotenv

from openai import OpenAI
 
# Ensure UTF-8 output (especially on Windows)

sys.stdout.reconfigure(encoding='utf-8')
 
# Load environment variables (e.g., OPENAI_API_KEY)

load_dotenv()
 
# Set up OpenAI

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

MODEL = "gpt-4o-mini"  # Replace with a model that your org has access to
 
###############################################################################

# EXAMPLE IN-MEMORY DRUG DATA

#

# You can expand this list with more drug entries as needed. Each dict should

# contain at least the following keys:

#  - "Drug":     Name of the drug (string)

#  - "Safety":   Summary of the drug's safety (string)

#  - "Efficacy": Summary of the drug's efficacy (string)

###############################################################################

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

    """

    Returns a list of all "documents" (dicts) in drug_data_list where Drug == drug_name.

    Matching is case-insensitive.

    """

    matching_docs = [entry for entry in drug_data_list

                     if entry["Drug"].strip().lower() == drug_name.strip().lower()]

    return matching_docs
 
def get_differences_from_llm(prompt_text):

    """

    Sends the prompt to OpenAI GPT model and returns the response text.

    """

    system_prompt = (

        "You are a market research analyst. You are provided with information about multiple drugs' 'Safety' and 'Efficacy'. "

        "Your task is to identify key numeric or clinically important differences between the given drug(main drug) and other drugs. "

        "Provide your findings in two separate bullet-point lists for both Safety and Efficacy along with how the difference affects the drug. "

        "INSTRUCTIONS:\n"

        "- CONSIDER both Safety and Efficacy headers for both the given drug and other drugs. "

        "- All the key differences of the main drug from the other drugs should be added in Impact along with the percentages. \n"

        "- ONLY display the Impact points. The Impact point should be the summary (50-80 words). \n"

        "Don't give explicit headers for the points and provide 2-3 bullet points. "

        "If there is no significant difference found among the given drugs, then highlight that as well along with any differentiating factors."

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
 
def process_drug_comparison(drug_data_list, main_drug, other_drugs):

    """

    Builds the prompt for main_drug vs other_drugs from in-memory data,

    calls OpenAI for analysis, and returns the differences text.

    """

    # Get docs for the main drug

    main_drug_docs = get_drug_docs_from_memory(main_drug, drug_data_list)

    if not main_drug_docs:

        print(f"No documents found for the main drug: {main_drug}")

        return {"docs": [], "differences": ""}
 
    # Start building the prompt

    prompt_lines = [

        f"Below is the Safety and Efficacy information for the drug: {main_drug} compared with other drugs.",

        ""

    ]
 
    # Append main drug details

    for doc in main_drug_docs:

        safety = doc.get("Safety", "No Safety Info")

        efficacy = doc.get("Efficacy", "No Efficacy Info")

        prompt_lines.append(f"Drug: {main_drug}")

        prompt_lines.append(f"Safety: {safety}")

        prompt_lines.append(f"Efficacy: {efficacy}")

        prompt_lines.append("")
 
    # Include data for comparison drugs

    for other_drug in other_drugs:

        comparison_docs = get_drug_docs_from_memory(other_drug, drug_data_list)

        if not comparison_docs:

            print(f"No documents found for the drug: {other_drug}")

            continue
 
        for doc in comparison_docs:

            safety = doc.get("Safety", "No Safety Info")

            efficacy = doc.get("Efficacy", "No Efficacy Info")

            prompt_lines.append(f"Drug: {other_drug}")

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

    return f"Differentiator\n{drug_name}:\n{differences}"
 
if __name__ == "__main__":

    # Allow the user to input up to 5 drugs

    drug_names = []

    print("Enter up to 5 drugs to compare (press Enter to finish):")

    for i in range(5):

        drug = input(f"Enter Drug {i + 1}: ").strip()

        if drug:

            drug_names.append(drug)

        else:

            break
 
    if len(drug_names) < 2:

        print("Please provide at least two drugs for comparison.")

        sys.exit()
 
    # First drug is the main drug

    main_drug = drug_names[0]

    # Remainder are the comparison drugs

    other_drugs = drug_names[1:]
 
    # Process the comparison

    results = process_drug_comparison(DRUG_DATA, main_drug, other_drugs)
 
    # Format and print the output

    formatted_output = format_output(main_drug, results["differences"])

    print(formatted_output)

    print("=" * 60)

 