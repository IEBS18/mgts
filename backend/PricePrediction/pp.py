# import os
# import pandas as pd
# from elasticsearch import Elasticsearch
# import numpy as np
# import json
# from dotenv import load_dotenv

# load_dotenv()

# # Load environment variables
# ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
# ELASTIC_API_KEY = os.getenv('elasticapikey')

# # Connect to Elasticsearch
# es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY)

# # Function to fetch competitor data based on disease, country, and other factors
# def fetch_competitor_data(disease, country, quality_of_life, mortality, morbidity, safety, efficacy):
#     query = {
#         "query": {
#             "bool": {
#                 "must": [
#                     {"match": {"Disease.keyword": disease}},
#                     {"match": {"Country.keyword": country}},
#                     # {"match": {"Quality_of_Life": quality_of_life}},
#                     # {"range": {"Mortality": {"gte": mortality}}},
#                     # {"range": {"Morbidity": {"gte": morbidity}}},
#                     # {"match": {"Safety": safety}},
#                     # {"match": {"Efficacy": efficacy}}
#                 ]
#             }
#         }
#     }

#     result = es.search(index="combined_country_drug1", body=query, size=10)
#     print("Elastic search result:", result)
#     return result['hits']['hits']

# def parse_data(raw_data):
#     records = []
#     for hit in raw_data:
#         source = hit['_source']
#         records.append({
#             "Country": source.get("Country"),
#             "TradeName": source.get("TradeName"),
#             "Size": source.get("Size"),
#             "Manufacturer": source.get("Manufacturer"),
#             "Active Ingredient": source.get("Active Ingredient"),
#             "Price": source.get("Price"),
#             "Disease": source.get("Disease"),
#             "Symptoms": source.get("Symptoms"),
#             "Prevalence": source.get("Prevalence"),
#             "Quality_of_Life": source.get("Quality_of_Life"),
#             "Morbidity": source.get("Morbidity"),
#             "Mortality": source.get("Mortality"),
#             "Efficacy": source.get("Efficacy"),
#             "Safety": source.get("Safety"),
#             "Adverse_Events": source.get("Adverse_Events"),
#             "Annual_Therapy_Costs": source.get("Annual_Therapy_Costs"),
#             "Age_Group": source.get("Age_Group"),
#             "Gender": source.get("Gender"),
#             "Type_of_Drug": source.get("Type_of_Drug")
#         })
#     return pd.DataFrame(records)

# def predict_price(competitor_data, quality_of_life_weight=0.2, mortality_weight=0.2, morbidity_weight=0.2, safety_weight=0.2, efficacy_weight=0.2):
#     if competitor_data.empty:
#         return "No data available for prediction."

#     competitor_data['Price'] = competitor_data['Price'].replace({'\$': '', ',': ''}, regex=True).astype(float)
#     competitor_data['Annual_Therapy_Costs'] = competitor_data['Annual_Therapy_Costs'].replace({'\$': '', ',': ''}, regex=True).astype(float)

#     competitor_data['Mortality'] = pd.to_numeric(competitor_data['Mortality'], errors='coerce')
#     competitor_data['Morbidity'] = pd.to_numeric(competitor_data['Morbidity'], errors='coerce')

#     competitor_data['quality_of_life_score'] = competitor_data['Quality_of_Life'].apply(lambda x: quality_of_life_weight)
#     competitor_data['mortality_score'] = competitor_data['Mortality'].apply(lambda x: mortality_weight * (x / 100) if pd.notnull(x) else 0)
#     competitor_data['morbidity_score'] = competitor_data['Morbidity'].apply(lambda x: morbidity_weight * (x / 100) if pd.notnull(x) else 0)
#     competitor_data['safety_score'] = competitor_data['Safety'].apply(lambda x: safety_weight)
#     competitor_data['efficacy_score'] = competitor_data['Efficacy'].apply(lambda x: efficacy_weight)

#     competitor_data['weighted_price'] = (competitor_data['Price'] * competitor_data['quality_of_life_score'] +
#                                           competitor_data['Price'] * competitor_data['mortality_score'] +
#                                           competitor_data['Price'] * competitor_data['morbidity_score'] +
#                                           competitor_data['Price'] * competitor_data['safety_score'] +
#                                           competitor_data['Price'] * competitor_data['efficacy_score'])

#     avg_weighted_price = competitor_data['weighted_price'].mean()
#     return {"average_price": avg_weighted_price}

# def get_user_input():
#     print("Please enter the following information:")
#     disease = input("Disease (e.g., Eczema on Penis): ")
#     country = input("Country (e.g., USA): ")
#     quality_of_life = input("Quality of Life (e.g., Moderate impact due to mobility issues): ")
#     mortality = float(input("Mortality (as a percentage, e.g., 0.2 for 20%): "))
#     morbidity = float(input("Morbidity (as a percentage, e.g., 8): "))
#     safety = input("Safety (e.g., Generally Safe): ")
#     efficacy = input("Efficacy (e.g., Moderate for pain relief): ")

#     return disease, country, quality_of_life, mortality, morbidity, safety, efficacy

# def main():
#     # Get user inputs
#     disease, country, quality_of_life, mortality, morbidity, safety, efficacy = get_user_input()

#     competitor_data_raw = fetch_competitor_data(
#         disease,
#         country,
#         quality_of_life,
#         mortality,
#         morbidity,
#         safety,
#         efficacy
#     )

#     competitor_df = parse_data(competitor_data_raw)

#     price_prediction = predict_price(competitor_df)

#     if isinstance(price_prediction, dict):
#         print(f"\nPredicted Price of the new drug:\nAverage Price: ${price_prediction['average_price']:.2f}")
#     else:
#         print(price_prediction)

# if __name__ == "__main__":
#     main()

import os
import pandas as pd
import matplotlib.pyplot as plt
from elasticsearch import Elasticsearch
import numpy as np
import json
from dotenv import load_dotenv

load_dotenv()

# Load environment variables
ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
ELASTIC_API_KEY = os.getenv('elasticapikey')

# Connect to Elasticsearch
es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY)

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

    result = es.search(index="combined_country_drug1", body=query, size=10)
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

def predict_price(competitor_data, quality_of_life_weight=0.2, mortality_weight=0.2, morbidity_weight=0.2, safety_weight=0.2, efficacy_weight=0.2):
    if competitor_data.empty:
        return "No data available for prediction."

    # Clean 'Price' and 'Annual_Therapy_Costs' columns and convert to numeric
    competitor_data['Price'] = competitor_data['Price'].replace({'\$': '', ',': ''}, regex=True).astype(float)
    competitor_data['Annual_Therapy_Costs'] = competitor_data['Annual_Therapy_Costs'].replace({'\$': '', ',': ''}, regex=True).astype(float)

    competitor_data['Mortality'] = pd.to_numeric(competitor_data['Mortality'], errors='coerce')
    competitor_data['Morbidity'] = pd.to_numeric(competitor_data['Morbidity'], errors='coerce')

    # Apply scoring based on weights
    competitor_data['quality_of_life_score'] = competitor_data['Quality_of_Life'].apply(lambda x: quality_of_life_weight)
    competitor_data['mortality_score'] = competitor_data['Mortality'].apply(lambda x: mortality_weight * (x / 100) if pd.notnull(x) else 0)
    competitor_data['morbidity_score'] = competitor_data['Morbidity'].apply(lambda x: morbidity_weight * (x / 100) if pd.notnull(x) else 0)
    competitor_data['safety_score'] = competitor_data['Safety'].apply(lambda x: safety_weight)
    competitor_data['efficacy_score'] = competitor_data['Efficacy'].apply(lambda x: efficacy_weight)

    # Calculate weighted price
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
    price_prediction = predict_price(competitor_df)
    if isinstance(price_prediction, dict):
        print(f"\nPredicted Price of the new drug:\nAverage Price: ${price_prediction['average_price']:.2f}")
        competitor_data_sorted = price_prediction['competitor_data']
        
        # Plot competitor prices
        plot_competitor_prices(competitor_data_sorted)

        # Display competitor details
        display_competitor_details(competitor_data_sorted)
    else:
        print(price_prediction)

if __name__ == "__main__":
    main()
