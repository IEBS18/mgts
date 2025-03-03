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
