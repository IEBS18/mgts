import os
import pandas as pd
from openai import OpenAI
import matplotlib.pyplot as plt
from elasticsearch import Elasticsearch
import numpy as np
import json
from dotenv import load_dotenv
import re
 
load_dotenv()
 
# Load environment variables
ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
ELASTIC_API_KEY = os.getenv('elasticapikey')
 
# Connect to Elasticsearch
es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY)
 
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4o-mini"
# Function to fetch competitor data based on disease, country, and other factors
def fetch_competitor_data(disease, country, quality_of_life, mortality, morbidity, safety, efficacy):
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"Disease.keyword": disease}},
                    {"match": {"Country.keyword": country}},
                ]
            }
        }
    }
 
    result = es.search(index="combined_country_drug1", body=query)
    print("Elastic search result:", result)
    return result['hits']['hits']
 
def parse_data(raw_data):
    records = []
    for hit in raw_data:
        source = hit['_source']
        records.append({
            "Country": source.get("Country"),
            "TradeName": source.get("TradeName"),
            "Size": source.get("Size"),
            "Manufacturer": source.get("Manufacturer"),
            "Active Ingredient": source.get("Active Ingredient"),
            "Price": source.get("Price"),
            "Disease": source.get("Disease"),
            "Symptoms": source.get("Symptoms"),
            "Prevalence": source.get("Prevalence"),
            "Quality_of_Life": source.get("Quality_of_Life"),
            "Morbidity": source.get("Morbidity"),
            "Mortality": source.get("Mortality"),
            "Efficacy": source.get("Efficacy"),
            "Safety": source.get("Safety"),
            "Adverse_Events": source.get("Adverse_Events"),
            "Annual_Therapy_Costs": source.get("Annual_Therapy_Costs"),
            "Age_Group": source.get("Age_Group"),
            "Gender": source.get("Gender"),
            "Type_of_Drug": source.get("Type_of_Drug")
        })
    return pd.DataFrame(records)
 
def clean_price(price):
    """
    Extract numeric value from price strings.
    Handles cases like '$100 per session' or similar.
    """
    if not isinstance(price, str):
        return None  # Skip non-string values
 
    # Extract numeric values (e.g., '$100' -> 100)
    match = re.search(r"\$?([\d,\.]+)", price)
    if match:
        # Remove commas and convert to float
        numeric_price = float(match.group(1).replace(",", ""))
        print(numeric_price)
        return numeric_price
    return None
 
def fetch_weights_from_llm(disease, quality_of_life, mortality, morbidity, safety, efficacy, competitor_data):
    prompt = f"""
    Based on the following details, calculate and return appropriate weights for Quality of Life, Mortality, Morbidity, Safety, and Efficacy.
    Consider user inputs, disease-specific data, and competitor details:
   
    Disease: {disease}
    Quality of Life: {quality_of_life}
    Mortality: {mortality}
    Morbidity: {morbidity}
    Safety: {safety}
    Efficacy: {efficacy}
    Competitor Data (top entries):
    {competitor_data.head(10).to_dict(orient='records')}
   
    Provide the weights as a JSON object with keys: "quality_of_life_weight", "mortality_weight", "morbidity_weight", "safety_weight", "efficacy_weight".
    """
    try:
        response = openai_client.chat.completions.create(
        model=MODEL,
            messages=[{"role": "system", "content": "You are an expert in pharmaceutical pricing.you know the factors affecting the price of the drugs accroding to diseases and the morbidity, mortality, safety and efficay along with the quality of life"},
                      {"role": "user", "content": prompt}],
            max_tokens=200
        )
        llm_weights = json.loads(response.choices[0].message.content)
        return llm_weights
    except Exception as e:
        print(f"Error fetching weights from LLM: {e}")
        # Fallback weights in case of failure
        return {
            "quality_of_life_weight": 0.4,
            "mortality_weight": 0.8,
            "morbidity_weight": 0.6,
            "safety_weight": 0.4,
            "efficacy_weight": 0.5
        }
 
 
def predict_price(competitor_data, disease, quality_of_life, mortality, morbidity, safety, efficacy):
    if competitor_data.empty:
        return "No data available for prediction."
 
    # Clean and convert 'Price' to numeric
    competitor_data['Price'] = competitor_data['Price'].apply(clean_price)
 
    # Drop rows with invalid or missing prices
    competitor_data = competitor_data.dropna(subset=['Price'])
    print(clean_price)
    # competitor_data['Annual_Therapy_Costs'] = competitor_data['Annual_Therapy_Costs'].apply(clean_price)
 
    competitor_data['Mortality'] = pd.to_numeric(competitor_data['Mortality'], errors='coerce')
    competitor_data['Morbidity'] = pd.to_numeric(competitor_data['Morbidity'], errors='coerce')
 
    llm_weights = fetch_weights_from_llm(disease, quality_of_life, mortality, morbidity, safety, efficacy, competitor_data)
 
    competitor_data['quality_of_life_score'] = competitor_data['Quality_of_Life'].apply(lambda x: llm_weights['quality_of_life_weight'])
    competitor_data['mortality_score'] = competitor_data['Mortality'].apply(lambda x: llm_weights['mortality_weight'] * (x / 100) if pd.notnull(x) else 0)
    competitor_data['morbidity_score'] = competitor_data['Morbidity'].apply(lambda x: llm_weights['morbidity_weight'] * (x / 100) if pd.notnull(x) else 0)
    competitor_data['safety_score'] = competitor_data['Safety'].apply(lambda x: llm_weights['safety_weight'])
    competitor_data['efficacy_score'] = competitor_data['Efficacy'].apply(lambda x: llm_weights['efficacy_weight'])
 
    competitor_data['weighted_price'] = (competitor_data['Price'] * competitor_data['quality_of_life_score'] +
                                          competitor_data['Price'] * competitor_data['mortality_score'] +
                                          competitor_data['Price'] * competitor_data['morbidity_score'] +
                                          competitor_data['Price'] * competitor_data['safety_score'] +
                                          competitor_data['Price'] * competitor_data['efficacy_score'])
 
    competitor_data_sorted = competitor_data.sort_values(by='Price', ascending=False)
 
    avg_weighted_price = competitor_data['weighted_price'].mean()
    return {"average_price": avg_weighted_price, "competitor_data": competitor_data_sorted}
 
def plot_competitor_prices(competitor_data):
    if competitor_data.empty:
        return "No data available for plotting."
   
    # Ensure 'Price' is numeric and 'TradeName' is a string for plotting
    competitor_data['Price'] = pd.to_numeric(competitor_data['Price'], errors='coerce')
    competitor_data['TradeName'] = competitor_data['TradeName'].astype(str)
   
    # Plotting
    plt.figure(figsize=(10, 6))
    plt.scatter(competitor_data['TradeName'], competitor_data['Price'], s=competitor_data['Price']*5, alpha=0.7)
    plt.title('Top 10 Competitor Prices')
    plt.xlabel('Competitor Trade Name')
    plt.ylabel('Price ($)')
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.tight_layout()
    plt.show()
 
def display_competitor_details(competitor_data):
    if competitor_data.empty:
        return "No data available for displaying details."
   
    competitor_details = competitor_data[['TradeName', 'Morbidity', 'Mortality', 'Safety',"Price"]]
    # print("\nCompetitor Details (Morbidity, Mortality, Safety,Price):")
    # print(competitor_details)
    result = competitor_details.to_dict(orient='records')
    print(result)
    return result
 
def get_user_input():
    print("Please enter the following information:")
    disease = input("Disease (e.g., Eczema on Penis): ")
    country = input("Country (e.g., USA): ")
    quality_of_life = input("Quality of Life (e.g., Moderate impact due to mobility issues): ")
    mortality = float(input("Mortality (as a percentage, e.g., 0.2 for 20%): "))
    morbidity = float(input("Morbidity (as a percentage, e.g., 8): "))
    safety = input("Safety (e.g., Generally Safe): ")
    efficacy = input("Efficacy (e.g., Moderate for pain relief): ")
 
    return disease, country, quality_of_life, mortality, morbidity, safety, efficacy
 
def main():
    disease, country, quality_of_life, mortality, morbidity, safety, efficacy = get_user_input()
 
    # Fetch and parse competitor data
    competitor_data_raw = fetch_competitor_data(
        disease,
        country,
        quality_of_life,
        mortality,
        morbidity,
        safety,
        efficacy
    )
 
    competitor_df = parse_data(competitor_data_raw)
 
    # Price prediction
    price_prediction = predict_price(competitor_df, disease, quality_of_life, mortality, morbidity, safety, efficacy)
    if isinstance(price_prediction, dict):
        print(f"\nPredicted Price of the new drug:\nApproximate Price: ${price_prediction['average_price']:.2f}")
        competitor_data_sorted = price_prediction['competitor_data']
       
        # Plot competitor prices
        plot_competitor_prices(competitor_data_sorted)
 
        # Display competitor details
        display_competitor_details(competitor_data_sorted)
    else:
        print(price_prediction)
 
if __name__ == "__main__":
    main()