from Utilities.query_classifier import (
    es,
)
from openai import AzureOpenAI
import os
from flask import Flask
app = Flask(__name__)
def fetch_drug_data(drug_names):
    """
    Fetch efficacy, safety, modality, and submodality for given drug names from Elasticsearch.
   
    Parameters:
        drug_names (list): List of drug names to search for.
       
    Returns:
        dict: Drug data mapped with efficacy, safety, modality, and submodality.
    """
 
    index_name = "tpp_data_refine"  # Use the environment variable
    results = {}
 
    for drug in drug_names:
        query = {
            "query": {
                "match": {
                    "Drug": {
                        "query": drug,
                        "fuzziness": "AUTO"  # Enables fuzzy search for approximate matches
                    }
                }
            }
        }
 
        try:
            result = es.search(index=index_name, body=query)
        except es_exceptions.ConnectionError:
            return {"error": "Failed to connect to Elasticsearch."}, 500
        except es_exceptions.AuthenticationException:
            return {"error": "Authentication with Elasticsearch failed."}, 401
        except Exception as e:
            return {"error": f"An error occurred: {str(e)}"}, 500
 
        hits = [hit['_source'] for hit in result['hits']['hits']]
        print(f"Found {len(hits)} hits for drug: {drug}")
       
        if hits:
            hits = hits[0]
            results[drug] = {
                    "Efficacy": hits.get("Efficacy", "Not Available"),
                    "Safety": hits.get("Safety", "Not Available"),
                    "Modality": hits.get("Modality", "Not Available"),
                    "SubModality": hits.get("SubModality", "Not Available")
                }
        else:
            results[drug] = "No matching data found"
 
    return results




openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"
 
def predict_tier_and_requirement(new_plan: dict, competitor_data: dict):
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
                "Disease Name": {
                    "Drug Name": [
                        {
                            "Efficacy": "...",
                            "Safety": "...",
                            "Modality": "...",
                            "Tier": "...",
                            "Requirement": "..."
                        },
                        ...
                    ],
                    ...
                },
                ...
            }
 
    Returns:
        dict: Parsed response containing "Tier" and "Requirement", or error.
    """
    drug_name = new_plan.get("drug_name")
    diseasesname = new_plan.get("diseasesname")
    efficacy = new_plan.get("efficacy")
    safety = new_plan.get("safety")
    modality = new_plan.get("modality")
 
    app.logger.info(f"Predicting Tier and Requirement for Drug: {drug_name} under Disease: {diseasesname}")
 
    # Fetch competitor data for the given disease
    disease_competitors = competitor_data.get(diseasesname, {})
 
    if not disease_competitors:
        app.logger.error(f"No competitor data found for disease: {diseasesname}")
        return {
            "error": "No competitor data found for this disease.",
            "message": "No competitor data found for this disease."
        }
 
    # Construct the competitor data section of the prompt
    competitor_section = f"Disease: {diseasesname}\n"
    for competitor_drug, details_list in disease_competitors.items():
        for detail in details_list:
            competitor_section += (
                f"Drug: {competitor_drug}\n"
                f"Efficacy: {detail.get('Efficacy', 'N/A')}\n"
                f"Safety: {detail.get('Safety', 'N/A')}\n"
                f"Modality: {detail.get('Modality', 'N/A')}\n"
                f"Tier: {detail.get('Tier', 'N/A')}\n"
                f"Requirement: {detail.get('Requirement', 'N/A')}\n\n"
            )
 
    app.logger.debug(f"Constructed Competitor Section:\n{competitor_section}")
 
    # Prepare prompt for OpenAI API
    system_prompt = (
        "You are an expert in formulary management. "
        "Your task is to analyze the formulary tier placement and associated limitations for a new drug based on existing competitor data."
    )
    user_prompt = (
        f"{competitor_section}"
        f"New Drug Details:\n"
        f"Drug Name: {drug_name}\n"
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
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
 
        app.logger.info("Received response from OpenAI.")
 
        # Parse the response from OpenAI
        reply = response.choices[0].message.content.strip()
        app.logger.debug(f"OpenAI Reply:\n{reply}")
 
        # Initialize response dictionary with defaults
        parsed_response = {
            "Tier": "N/A",
            "Requirement": "Fully Reimbursed"
        }
 
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
        return {
            "error": "Failed to parse OpenAI response",
            "message": str(e)
        }
 