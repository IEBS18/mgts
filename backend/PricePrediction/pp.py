import os
import pandas as pd
from openai import OpenAI
import matplotlib.pyplot as plt
from elasticsearch import Elasticsearch
import numpy as np
import json
from dotenv import load_dotenv
import re
from transformers import pipeline

load_dotenv()

# Load environment variables
ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
ELASTIC_API_KEY = os.getenv('elasticapikey')

# Connect to Elasticsearch
es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY)

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4o-mini"

# Initialize sentiment analysis pipeline (Healthcare-specific model)
sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

def analyze_sentiment(text):
    """
    Analyze the sentiment of a given text and return a numerical score.
    Positive (2), Neutral (1), Negative (0).
    """
    result = sentiment_analyzer(text)
    sentiment_score = result[0]['label']
    sentiment_map = {'LABEL_0': 0, 'LABEL_1': 1, 'LABEL_2': 1, 'LABEL_3': 2, 'LABEL_4': 2}
    return sentiment_map.get(sentiment_score, 1)  # Default to neutral if undefined

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
    # print("Elastic search result:", result)
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
    if not isinstance(price, str):
        return None

    match = re.search(r"\$?([\d,]+(?:\.\d+)?)", price)
    if match:
        cleaned_value = match.group(1).replace(",", "")
        try:
            return float(cleaned_value)
        except ValueError:
            return None
    return None

import json

def fetch_weights_from_llm(disease, quality_of_life, mortality, morbidity, safety, efficacy, competitor_data):
    """
    Fetch weight factors from LLM for sentiment analysis and price prediction.
    Ensures the response is structured as JSON.
    """

    prompt = f"""
    You are an expert in pharmaceutical pricing. Given the disease-specific information, 
    user inputs, and competitor data, determine weights for the following factors: 
    Quality of Life, Mortality, Morbidity, Safety, and Efficacy.

    ### Disease Information:
    - Disease: {disease}
    - Quality of Life: {quality_of_life}
    - Mortality: {mortality}
    - Morbidity: {morbidity}
    - Safety: {safety}
    - Efficacy: {efficacy}

    ### Competitor Data (Top 10 Entries):
    {competitor_data.head(10).to_dict(orient='records')}

    ### Instructions:
    - Return a JSON object with the following keys:
      "quality_of_life_weight", "mortality_weight", "morbidity_weight", "safety_weight", "efficacy_weight".
    - The values should be floating-point numbers between 0 and 1.
    - **Strictly return only the JSON output. No explanations.** do notwrite ```json tags 
    """

    try:
        response = openai_client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an AI that strictly returns JSON-formatted responses."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )

        llm_weights = response.choices[0].message.content.strip()

        print("Raw LLM Response:", llm_weights)  # Debugging

        # Ensure LLM response is valid JSON
        llm_weights = json.loads(llm_weights)

        # Validate that all necessary keys exist and contain numeric values
        required_keys = ["quality_of_life_weight", "mortality_weight", "morbidity_weight", "safety_weight", "efficacy_weight"]
        for key in required_keys:
            if key not in llm_weights or not isinstance(llm_weights[key], (int, float)):
                raise ValueError(f"Missing or invalid value for {key}")

        return llm_weights

    except json.JSONDecodeError:
        print("Error: LLM response is not valid JSON.")
        print("Response received:", llm_weights)
    except Exception as e:
        print(f"Error fetching weights from LLM: {e}")

    # Return default weights in case of an error
    return {
        "quality_of_life_weight": 0.4,
        "mortality_weight": 0.5,
        "morbidity_weight": 0.5,
        "safety_weight": 0.85,
        "efficacy_weight": 0.9
    }

def integrate_sentiment_features(data):
    """
    Integrate sentiment analysis features into the dataset for quality of life, safety, efficacy, mortality, morbidity.
    Convert all input columns to strings to prevent errors with non-string data.
    """
    # Convert non-string values to strings (including NaN/None values)
    data['Quality_of_Life'] = data['Quality_of_Life'].fillna("Unknown").astype(str)
    data['Safety'] = data['Safety'].fillna("Unknown").astype(str)
    data['Efficacy'] = data['Efficacy'].fillna("Unknown").astype(str)
    data['Mortality'] = data['Mortality'].fillna("Unknown").astype(str)
    data['Morbidity'] = data['Morbidity'].fillna("Unknown").astype(str)

    # Apply sentiment analysis
    data['Quality_of_Life_Sentiment'] = data['Quality_of_Life'].apply(analyze_sentiment)
    data['Safety_Sentiment'] = data['Safety'].apply(analyze_sentiment)
    data['Efficacy_Sentiment'] = data['Efficacy'].apply(analyze_sentiment)
    data['Mortality_Sentiment'] = data['Mortality'].apply(analyze_sentiment)
    data['Morbidity_Sentiment'] = data['Morbidity'].apply(analyze_sentiment)

    return data
def predict_price(competitor_data, disease, quality_of_life, mortality, morbidity, safety, efficacy):
    if competitor_data.empty:
        return "No data available for prediction."
    
    # Clean and convert 'Price' to numeric
    competitor_data['Price'] = competitor_data['Price'].apply(clean_price)
    
    # Drop rows with invalid or missing prices
    competitor_data = competitor_data.dropna(subset=['Price'])
    
    # Integrating sentiment features into the competitor data
    competitor_data = integrate_sentiment_features(competitor_data)

    # Normalize sentiment scores (scale between 0 and 1 for the sake of the prediction)
    sentiment_scaling_factor = 100  # A constant factor to amplify sentiment influence

    competitor_data['quality_of_life_score'] = competitor_data['Quality_of_Life_Sentiment'].apply(lambda x: (x + 1) * sentiment_scaling_factor)
    competitor_data['safety_score'] = competitor_data['Safety_Sentiment'].apply(lambda x: (x + 1) * sentiment_scaling_factor)
    competitor_data['efficacy_score'] = competitor_data['Efficacy_Sentiment'].apply(lambda x: (x + 1) * sentiment_scaling_factor)
    competitor_data['mortality_score'] = competitor_data['Mortality_Sentiment'].apply(lambda x: (x + 1) * sentiment_scaling_factor)
    competitor_data['morbidity_score'] = competitor_data['Morbidity_Sentiment'].apply(lambda x: (x + 1) * sentiment_scaling_factor)

    # Fetch competitor weights from LLM
    llm_weights = fetch_weights_from_llm(disease, quality_of_life, mortality, morbidity, safety, efficacy, competitor_data)
    
    # Apply the LLM weights to the sentiment scores
    competitor_data['weighted_quality_of_life_score'] = competitor_data['quality_of_life_score'] * llm_weights['quality_of_life_weight']
    competitor_data['weighted_safety_score'] = competitor_data['safety_score'] * llm_weights['safety_weight']
    competitor_data['weighted_efficacy_score'] = competitor_data['efficacy_score'] * llm_weights['efficacy_weight']
    competitor_data['weighted_mortality_score'] = competitor_data['mortality_score'] * llm_weights['mortality_weight']
    competitor_data['weighted_morbidity_score'] = competitor_data['morbidity_score'] * llm_weights['morbidity_weight']
    
    # Calculate the weighted price based on sentiment and competitor data
    competitor_data['weighted_price'] = (
        competitor_data['Price'] * competitor_data['weighted_quality_of_life_score'] +
        competitor_data['Price'] * competitor_data['weighted_safety_score'] +
        competitor_data['Price'] * competitor_data['weighted_efficacy_score'] +
        competitor_data['Price'] * competitor_data['weighted_mortality_score'] +
        competitor_data['Price'] * competitor_data['weighted_morbidity_score']
    )

    # Sort competitor data by weighted price
    competitor_data_sorted = competitor_data.sort_values(by='weighted_price', ascending=False)

    # Calculate the average weighted price for prediction
    avg_weighted_price = competitor_data['weighted_price'].mean()

    return {"predicted_price": avg_weighted_price, "competitor_data": competitor_data_sorted}

def plot_competitor_prices(competitor_data):
    if competitor_data.empty:
        return "No data available for plotting."
    
    competitor_data['Annual_Therapy_Costs'] = pd.to_numeric(competitor_data['Annual_Therapy_Costs'], errors='coerce')
    competitor_data['TradeName'] = competitor_data['TradeName'].astype(str)

    plt.figure(figsize=(10, 6))
    plt.scatter(competitor_data['TradeName'], competitor_data['Annual_Therapy_Costs'], s=competitor_data['Annual_Therapy_Costs']*5, alpha=0.7)
    plt.title('Top 10 Competitor Prices')
    plt.xlabel('Competitor Trade Name')
    plt.ylabel('Annual_Therapy_Costs ($)')
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.tight_layout()
    plt.show()

def display_competitor_details(competitor_data):
    if competitor_data.empty:
        return "No data available for displaying details."
   
    competitor_details = competitor_data[['TradeName', 'Morbidity', 'Mortality', 'Safety',"Annual_Therapy_Costs"]]
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
        print(f"\nPredicted Price of the new drug:\nApproximate Price: ${price_prediction['predicted_price']:.2f}")
        competitor_data_sorted = price_prediction['competitor_data']
       
        # Plot competitor prices
        plot_competitor_prices(competitor_data_sorted)
 
        # Display competitor details
        display_competitor_details(competitor_data_sorted)
    else:
        print(price_prediction)

if __name__ == "__main__":
    main()
