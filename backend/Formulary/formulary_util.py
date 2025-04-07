# from Chatbot.query_classifier import (
#     es,
# )
from elasticsearch import Elasticsearch
from openai import AzureOpenAI
import os
import sys
import pandas as pd
from flask import Flask
from dotenv import load_dotenv
load_dotenv()

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)
sys.stdout.reconfigure(encoding='utf-8')
app = Flask(__name__)

def fetch_data(disease_name):
    index_name = "reimbursementfinal"
    fetched = {}

    for disease in disease_name:
        query = {
            "query": {
                "match": {
                    "Disease Name": {
                        "query": disease,
                        "fuzziness": "AUTO"
                    }
                }
            }
        }

        try:
            result = es.search(index=index_name, body=query)
        except Exception as e:
            return {"error": f"An error occurred: {str(e)}"}

        hits = [hit['_source'] for hit in result['hits']['hits']]
        print(f"Found {len(hits)} hits for disease: {disease}")

        if hits:
            fetched[disease] = []
            unique_drugs = set()
            drug_names = list(set(hit.get("Drug Name", "Not Available") for hit in hits if hit.get("Drug Name")))
            drug_details = fetch_drug_details_from_excel(drug_names)

            for hit in hits:
                drug_name = hit.get("Drug Name", "Not Available")
                #print(drug_name)
                if drug_name not in unique_drugs:
                    unique_drugs.add(drug_name)
                #    print("unique",unique_drugs)
                    drug_detail = next((d for d in drug_details if d["Drug"].lower() == drug_name.lower()), {})

                    fetched[disease].append({
                        "Drug Name": drug_name,
                        "Drug Type": hit.get("Drug Type", "Not Available"),
                        "Tier": hit.get("Tier", "Not Available"),
                        "Requirements/Limits": hit.get("Requirements/Limits", "Not Available"),  # Fixed key mapping
                        "Plan Name": hit.get("Plan Name", "Not Available"),  # Fixed key mapping
                        "Plan Type": hit.get("Plan Type", "Not Available"),  # Fixed key mapping
                        "State Name": hit.get("State Name", "Not Available"),  # Fixed key mapping
                        "Modality": drug_detail.get("Modality", "Not Available"),
                        "Efficacy": drug_detail.get("Efficacy", "Not Available"),
                        "Safety": drug_detail.get("Safety", "Not Available")
                    })
        else:
            fetched[disease] = []  # Ensure structure consistency

    # print("Elastic results:", fetched)

    return fetched



def fetch_drug_details_from_excel(drug_names):
    try:
        df = pd.read_excel("./tpp_database.xlsx")
    except:
        df = pd.read_excel("backend/tpp_database.xlsx")    

        # Ensure drug_names is a list and convert to lowercase
    drug_names = [drug.strip().lower() for drug in drug_names]  

        # Filter the dataframe where 'Drug' matches any in the list
    drug_info = df[df['Drug'].str.lower().isin(drug_names)]

    if not drug_info.empty:
        return drug_info[['Drug', 'Modality', 'Efficacy', 'Safety']].to_dict(orient='records')
    else:
        return "No matching drug details found"



openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"
 
def predict_tier_and_requirement(new_plan, competitor_data_dict):
    """
    Predicts the Tier and Requirement for a new drug plan based on competitor data.

    Args:
        new_plan (dict): Dictionary containing new plan details:
            - drug_name (str)
            - diseasesname (str)
            - efficacy (str)
            - safety (str)
            - modality (str)
        competitor_data (dict): Dictionary containing competitor data in the format:
            {
                "Drug Name": [
                    {
                        "Efficacy": "...",
                        "Safety": "...",
                        "Modality": "...",
                        "Tier": "...",
                        "Requirement": "..."
                    },
                    ...
                ]
            }

    Returns:
        dict: Parsed response containing "Tier" and "Requirement", or error.
    """
    drug_name = new_plan.get("drug_name")
    diseasename = new_plan.get("diseasesname")
    efficacy = new_plan.get("efficacy")
    safety = new_plan.get("safety")
    modality = new_plan.get("modality")

    app.logger.info(f"Predicting Tier and Requirement for Drug: {drug_name} under Disease: {diseasename}")
    # print("comp.", competitor_data_dict)
    # Fetch competitor data for the given disease
    # disease_competitors = competitor_data_dict.get(diseasename, {})
    # print(f"Looking for disease: '{diseasename}' in {competitor_data_dict.keys()}")
    # drug_competitors = competitor_data_dict.get(diseasename.strip().lower(), {})

    # if not disease_competitors:
    #     app.logger.error(f"No competitor data found for disease: {diseasename}")
    #     return {
    #         "error": "No competitor data found for this disease.",
    #         "message": "No competitor data found for this disease."
    #     }

    # Construct the competitor data section of the prompt
    competitor_section = f"Drug Name: {drug_name}\n"
    for competitor_drug, details in competitor_data_dict.items():
        # Directly access the competitor details (no need for nested loops if data is a dictionary)
        detail = details[0] if isinstance(details, list) else details
        competitor_section += (
            f"Drug Name: {competitor_drug}\n"
            f"Efficacy: {detail.get('Efficacy', 'N/A')}\n"
            f"Safety: {detail.get('Safety', 'N/A')}\n"
            f"Modality: {detail.get('Modality', 'N/A')}\n"
            f"Tier: {detail.get('Tier', 'N/A')}\n"
            f"Requirement: {detail.get('Requirement', 'N/A')}\n\n"
        )

    app.logger.debug(f"Constructed Competitor Section:\n{competitor_section}")

    # Prepare prompt for OpenAI API
    system_prompt = (
        """
        You are an expert in formulary management, responsible for analyzing the formulary tier placement and associated requirements/limitations for a new drug based on existing competitor data. 
        Your objective is to determine the most suitable formulary tier level for the drug and identify any restrictions, prior authorizations, step therapy requirements, or coverage limitations that may apply.

        #TASK:
            -Evaluate the new drug based on its efficacy, safety, and modality in comparison to competitor drugs used for the same disease.
            -Identify which formulary tier (Tier 1, Tier 2, Tier 3, Tier 4, Tier 5) the drug would likely be placed in, based on factors such as:
                --Comparative efficacy (superior, equivalent, or inferior to competitors).
                --Safety profile (any notable adverse effects vs. competitors).
                --Modality considerations (biologic vs. small molecule, innovative mechanisms, etc.).
                --Market precedents (how similar drugs are tiered).
            -Outline any requirements/limitations, such as:
                --Prior authorization (if the drug requires approval before prescribing).
                --Step therapy (if the drug is only covered after other treatments fail).
                --Quantity limits (restrictions on dosage or duration).
                --Cost-sharing implications (higher/lower co-pays based on tier placement).
        #INSTRUCTIONS:
            -Provide a clear formulary tier recommendation based on the comparative analysis.
            -List any requirements or limitations that might be imposed based on existing formulary trends.
            -Only provide the Tier and Requirements/Limitations.
            -Do not include explanations, justifications, or headers.
            -Ensure the tier placement is based on comparative analysis with competitor drugs.
            -List any applicable restrictions or coverage criteria directly.
            -Use competitor drugs as reference points to justify the tier placement and restrictions.
            -If the drug has advantages over competitors, highlight how this might influence tiering decisions.
            -If the drug faces disadvantages, discuss potential hurdles in achieving a favorable placement.
            -The predicted drug tier should never be N/A or not available, it should always return a tier
        """
    )

    user_prompt = (
        f"{competitor_section}"
        f"New Drug Details:\n"
        f"Drug Name: {competitor_drug}\n"
        f"Efficacy: {efficacy}\n"
        f"Safety: {safety}\n"
        f"Modality: {modality}\n\n"
        f"Based on the above information, determine the appropriate Tier and any Requirements/Limits for the new drug."
    )

    app.logger.debug(f"Constructed User Prompt:\n{user_prompt}")

    try:
        # Call OpenAI for predictions using the new interface
        response = openai_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]
        )
        # print(response)
        app.logger.info("Received response from OpenAI.")

        # Parse the response from OpenAI
        reply = response.choices[0].message.content.strip()
        app.logger.debug(f"OpenAI Reply:\n{reply}")

        # Initialize response dictionary with defaults
        parsed_response = {"Tier": "N/A", "Requirement": "Fully Reimbursed"}

        # Extract Tier and Requirement from the reply
        for line in reply.split("\n"):
            if line.lower().startswith("tier:"):
                parsed_response["Tier"] = line.split(":", 1)[1].strip() or "N/A"
            elif line.lower().startswith("requirement:"):
                parsed_response["Requirement"] = line.split(":", 1)[1].strip() or "Fully Reimbursed"

        app.logger.info(f"Parsed Response: {parsed_response}")

        return parsed_response

    except Exception as e:
        app.logger.exception("Exception occurred while processing OpenAI response.")
        return {"error": "Failed to parse OpenAI response", "message": str(e)}



def generate_differentiator(drug_name, safety, efficacy, tier, requirement, competitor_data):
    # print("fuck off-difference")
    """Generates a differentiator for the drug compared to competitors."""
    system_prompt = (
        "You are an expert in pharmaceutical market research. Your task is to analyze how a drug stands out "
        "compared to competitors in terms of Safety and Efficacy. Based on its tier and requirements, "
        "explain why it has been classified in that tier. Keep it concise with 2-3 key points."
    )
    # print("sys", system_prompt)
    prompt = f"""
    Drug: {drug_name}
    Tier: {tier}
    Requirements/Limitations: {requirement}
    Safety: {safety}
    Efficacy: {efficacy}
    """
    # print("promtp:",prompt)
    for competitor in competitor_data:
        # print("comp_data",competitor)
        # print("promtp:",prompt)
        new_prompt=prompt + f"""
        
        Competitor: {competitor['Drug Name']}
        Safety: {competitor['Safety']}
        Efficacy: {competitor['Efficacy']}
        Tier: {competitor['Tier']}
        Requirements/Limitations: {competitor['Requirements/Limits']}
        """
        # print("prompt",new_prompt)
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": new_prompt}
        ],
        # max_tokens=350,
        temperature=0.7
    )
    
    return response.choices[0].message.content.strip()

def generate_insights(drug_name, safety, efficacy, tier, requirement):
    """Generates insights about the drug, explaining its strengths, weaknesses, and market impact."""
    # print("fuck off-insights")
    system_prompt = (
        "You are a pharmaceutical market analyst. Provide an analysis of the drug based on Safety, Efficacy, "
        "Tier classification, and Requirements. Discuss its strengths, weaknesses, and how it impacts the market."
        " Provide insights on its potential advantages or risks for patients and stakeholders. Keep it structured "
        "in 3-5 bullet points."
    )
    
    insights_prompt = f"""
    drug_name: {drug_name}
    Tier: {tier}
    Requirements/Limitations: {requirement}
    Safety: {safety}
    Efficacy: {efficacy}
    """
    # print("promtp", insights_prompt)
    insights_response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": insights_prompt}
        ],
        # max_tokens=350,
        temperature=0.7
    )
    #print("response", insights_response)
    insights_resp=insights_response.choices[0].message.content.strip()
    # print("insights", insights)
    return insights_resp
