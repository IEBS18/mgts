import os
import sys
from dotenv import load_dotenv
from openai import AzureOpenAI
from Formulary import predict_tier_and_requirement

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

MODEL = "gpt-4o-mini"  # Replace with an available model

def generate_differentiator(drug_name, safety, efficacy, tier, requirement, competitor_data):
    """Generates a differentiator for the drug compared to competitors."""
    system_prompt = (
        "You are an expert in pharmaceutical market research. Your task is to analyze how a drug stands out "
        "compared to competitors in terms of Safety and Efficacy. Based on its tier and requirements, "
        "explain why it has been classified in that tier. Keep it concise with 2-3 key points."
    )
    
    prompt = f"""
    Drug: {drug_name}
    Tier: {tier}
    Requirements/Limitations: {requirement}
    Safety: {safety}
    Efficacy: {efficacy}
    """
    
    for competitor in competitor_data:
        prompt += f"""
        
        Competitor: {competitor['Drug']}
        Safety: {competitor['Safety']}
        Efficacy: {competitor['Efficacy']}
        Tier: {competitor['Tier']}
        Requirement: {competitor['Requirement']}
        """
    
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        max_tokens=350,
        temperature=0.7
    )
    
    return response.choices[0].message.content.strip()

def generate_insights(drug_name, safety, efficacy, tier, requirement):
    """Generates insights about the drug, explaining its strengths, weaknesses, and market impact."""
    system_prompt = (
        "You are a pharmaceutical market analyst. Provide an analysis of the drug based on Safety, Efficacy, "
        "Tier classification, and Requirements. Discuss its strengths, weaknesses, and how it impacts the market."
        " Provide insights on its potential advantages or risks for patients and stakeholders. Keep it structured "
        "in 3-5 bullet points."
    )
    
    prompt = f"""
    Drug: {drug_name}
    Tier: {tier}
    Requirements/Limitations: {requirement}
    Safety: {safety}
    Efficacy: {efficacy}
    """
    
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        max_tokens=350,
        temperature=0.7
    )
    
    return response.choices[0].message.content.strip()

# Example call:
if __name__ == "__main__":
    drug_name = "Aspirin"
    safety = "Mild risk of stomach irritation and bleeding with prolonged use."
    efficacy = "Effective at reducing pain, fever, and inflammation. Can prevent blood clots."
    tier = "Tier 2"
    requirement = "Requires physician prescription for long-term use."
    competitor_data = [
        {"Drug": "Ibuprofen", "Safety": "Can cause gastrointestinal discomfort.", "Efficacy": "Highly effective for pain relief.","Tier":"Tier 4","Requirement":"Requires physician prescription for long-term use."},
        {"Drug": "Acetaminophen", "Safety": "Liver toxicity at high doses.", "Efficacy": "Good analgesic but weak anti-inflammatory effect.","Tier":"Tier 4","Requirement":"Requires physician prescription for long-term use."}
    ]
    
    differentiator = generate_differentiator(drug_name, safety, efficacy, tier, requirement, competitor_data)
    insights = generate_insights(drug_name, safety, efficacy, tier, requirement)
    
    print("Differentiator:")
    print(differentiator)
    print("\nInsights:")
    print(insights)
