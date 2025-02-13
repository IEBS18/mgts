import os
import pandas as pd
# from openai import OpenAI
from openai import AzureOpenAI
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
 
# openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
# OpenAI API Configuration
MODEL = "gpt-4o-mini"
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)


##HYA FUN LA EXCL WALYA SHI REPLACE KELA AHES KHALI NTR CHANGE KARAYCH AHE 
# def fetch_competitor_drug_names(disease, country):
#     query = {
#         "query": {
#             "bool": {
#                 "must": [
#                     {"match": {"Disease.keyword": disease}},
#                     {"match": {"Country.keyword": country}}
#                 ]
#             }
#         },
#         "size":1000
#     }
#     result = es.search(index="combined_country_drug1", body=query)
#     return [hit['_source']['TradeName'] for hit in result['hits']['hits'] if 'TradeName' in hit['_source']]

# # Function to fetch drug details from tpp_data_refresh1
# def fetch_tpp_data(drug_names, modality):
#     query = {
#         "query": {
#             "bool": {
#                 "must": [
#                     {
#                         "bool": {
#                             "should": [
#                                 {"match": {"Drug": {"query": drug, "fuzziness": "AUTO"}}}
#                                 for drug in drug_names
#                             ]
#                         }
#                     },
#                     {"match": {"Modality.keyword": modality}},
#                     {"range": {"Patent_Expiry": {"gte": "2024-06-01"}}}
#                 ]
#             }
#         },
#         "size": 1000
#     }
#     result = es.search(index="tpp_data_refine", body=query)
#     return [hit['_source'] for hit in result['hits']['hits']]

# # Function to fetch final competitor data
# def fetch_competitor_data(disease, country, modality, sub_modality=None):
#     # Step 1: Fetch competitor names (TradeNames) from `combined_country_drug1` index
#     drug_names = fetch_competitor_drug_names(disease, country)
#     if not drug_names:
#         return []

#     # Step 2: Fetch competitor details (including modality and patent expiry) from `tpp_data_refine` index
#     # If modality is biologic and sub_modality is provided, filter by sub_modality
#     if modality.lower() == "biologics" and sub_modality:
#         tpp_data = fetch_tpp_data(drug_names, modality)
#         tpp_data = [data for data in tpp_data if sub_modality.lower() in data.get('SubModality', '').lower()]
#     else:
#         tpp_data = fetch_tpp_data(drug_names, modality)

#     # Step 3: Fetch price and annual therapy costs from `combined_country_drug1` for each competitor
#     query = {
#         "query": {
#             "bool": {
#                 "must": [
#                     {"terms": {"TradeName.keyword": drug_names}}
#                 ]
#             }
#         },
#         "size": 1000
#     }
#     result = es.search(index="combined_country_drug1", body=query)
#     data = {hit['_source']['TradeName']: {
#         'Price': hit['_source']['Price'],
#         'Annual_Therapy_Costs': hit['_source']['Annual_Therapy_Costs'],
#         'Morbidity': hit['_source']['Morbidity'],
#         'Mortality': hit['_source']['Mortality'],
#         'Efficacy': hit['_source']['Efficacy'],
#         'Quality_of_Life': hit['_source']['Quality_of_Life'],
#         'Safety': hit['_source']['Safety'],
#     } for hit in result['hits']['hits']}

#     # Merge price and annual therapy cost data into the competitor details from tpp_data
#     for competitor in tpp_data:
#         trade_name = competitor.get('Drug')
#         if trade_name and trade_name in data:
#             competitor['Price'] = data[trade_name]['Price']  # Add the price to the competitor data
#             competitor['Annual_Therapy_Costs'] = data[trade_name]['Annual_Therapy_Costs']  # Add the therapy cost
#             competitor['Morbidity'] = data[trade_name]['Morbidity'] 
#             competitor['Mortality'] = data[trade_name]['Mortality'] 
#             competitor['Efficacy'] = data[trade_name]['Efficacy'] 
#             competitor['Quality_of_Life'] = data[trade_name]['Quality_of_Life']
#             competitor['Safety'] = data[trade_name]['Safety']  
#     return tpp_data
######varti elastic pasun data fetch krnyacha logic lihlela ahe and khali fetch through excel ch function ahe. {lksht thev visrun jashil nahi tr tu. }


def fetch_competitor_data(disease, country, modality, sub_modality=None):
    # Load the Excel data
    competitors_df = pd.read_excel("PricePrediction/pp_data.xlsx")  # Path to your Excel file

    # Shortlist competitors by disease
    competitors_disease_filtered = competitors_df[competitors_df['Disease'] == disease]
    print("competitors_disease_filtered", competitors_disease_filtered)
    # Filter by modality
    competitors_modality_filtered = competitors_disease_filtered[competitors_disease_filtered['Modality'] == modality]

    # If modality is Biologic, filter by submodality
    if modality == "Biologic" and sub_modality:
        competitors_submodality_filtered = competitors_modality_filtered[competitors_modality_filtered['Submodality'] == sub_modality]

        # If no competitors are found for the submodality, search within the same modality across other diseases
        if competitors_submodality_filtered.empty:
            competitors_submodality_filtered = competitors_modality_filtered
    else:
        competitors_submodality_filtered = competitors_modality_filtered

    # Filter by country
    competitors_country_filtered = competitors_submodality_filtered[competitors_submodality_filtered['Country'] == country]

    # If no competitors found for the country, search across other countries
    if competitors_country_filtered.empty:
        competitors_country_filtered = competitors_submodality_filtered  # Use competitors from other countries
    
    return competitors_country_filtered

def parse_data(raw_data):
    records = []
    for hit in raw_data:
        source = hit['_source']
        records.append({
            "Country": source.get("Country"),
            "Drug": source.get("Drug"),
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
 
import re

def clean_price(price):
    """
    Extract numeric value from price strings.
    Handles cases like '$100 per session' or similar.
    """
    if not isinstance(price, str):
        return None  # Skip non-string values

    # Extract numeric values (e.g., '$100' -> 100)
    match = re.search(r"\$?([\d,]+(?:\.\d+)?)", price)  # Updated regex to handle decimals
    if match:
        # Remove commas and convert to float
        cleaned_value = match.group(1).replace(",", "")
        
        # Check if the cleaned value is a valid number
        if cleaned_value == '.' or cleaned_value == '':
            return None  # Return None for invalid numeric values

        try:
            numeric_price = float(cleaned_value)
            # print(numeric_price)  # Debugging line to see the extracted price
            return numeric_price
        except ValueError:
            return None  # Return None if conversion fails

    return None  # Return None if no match is found
def fetch_weights_from_llm(disease, quality_of_life, mortality, morbidity, safety, efficacy, competitor_data):
    """
    Fetch weight factors from LLM for sentiment analysis and price prediction.
    Ensures the response is structured as JSON.
    """
 
    prompt = f"""
    You are an expert in pharmaceutical pricing. Given the disease-specific information,
    user inputs, and competitor data, determine weights for the following factors:
    Quality of Life, Mortality, Morbidity, Safety, and Efficacy.
    The weights are to be given as these factors play a vital role in deciding the price for that specific drug
 
    ### Disease Information:
    - Disease: {disease}
    - Quality_of_Life: {quality_of_life}
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
        response = client.chat.completions.create(
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
        # print("Response received:", llm_weights)
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


def predict_price(competitor_data, disease, quality_of_life, mortality, morbidity, safety, efficacy):
    if competitor_data.empty:
        return "No data available for prediction."
    print("competitor data:", competitor_data['Drug'])
    
    # Clean and convert 'Price' to numeric
    competitor_data['Price'] = competitor_data['Price'].apply(clean_price)
 
    # Drop rows with invalid or missing prices
    competitor_data = competitor_data.dropna(subset=['Price'])
    competitor_data = competitor_data.copy()
    print("clean:", competitor_data['Price'])
    
    # Apply clean_price to 'Annual_Therapy_Costs'
    competitor_data.loc[:, 'Annual_Therapy_Costs'] = competitor_data['Annual_Therapy_Costs'].apply(clean_price)

    # Clean 'Morbidity' and 'Mortality' by removing '%' and converting them to numeric values using .loc
    competitor_data.loc[:, 'Morbidity'] = competitor_data['Morbidity'].astype(str).str.replace('%', '', regex=True)
    competitor_data.loc[:, 'Mortality'] = competitor_data['Mortality'].astype(str).str.replace('%', '', regex=True)

    # Convert 'Morbidity' and 'Mortality' to numeric values using .loc
    competitor_data.loc[:, 'Mortality'] = pd.to_numeric(competitor_data['Mortality'], errors='coerce')
    competitor_data.loc[:, 'Morbidity'] = pd.to_numeric(competitor_data['Morbidity'], errors='coerce')

    llm_weights = fetch_weights_from_llm(disease, quality_of_life, mortality, morbidity, safety, efficacy, competitor_data)
    
    competitor_data.loc[:, 'quality_of_life_score'] = competitor_data['Quality_of_Life'].apply(lambda x: llm_weights['quality_of_life_weight'])
    competitor_data.loc[:, 'mortality_score'] = competitor_data['Mortality'].apply(lambda x: llm_weights['mortality_weight'] * (x / 100) if pd.notnull(x) else 0)
    competitor_data.loc[:, 'morbidity_score'] = competitor_data['Morbidity'].apply(lambda x: llm_weights['morbidity_weight'] * (x / 100) if pd.notnull(x) else 0)
    competitor_data.loc[:, 'safety_score'] = competitor_data['Safety'].apply(lambda x: llm_weights['safety_weight'])
    competitor_data.loc[:, 'efficacy_score'] = competitor_data['Efficacy'].apply(lambda x: llm_weights['efficacy_weight'])

    # Apply .loc for the 'weighted_price' calculation to avoid the warning
    competitor_data.loc[:, 'weighted_price'] = (competitor_data['Price'] * competitor_data['quality_of_life_score'] +
                                                competitor_data['Price'] * competitor_data['mortality_score'] +
                                                competitor_data['Price'] * competitor_data['morbidity_score'] +
                                                competitor_data['Price'] * competitor_data['safety_score'] +
                                                competitor_data['Price'] * competitor_data['efficacy_score'])

    competitor_data_sorted = competitor_data.sort_values(by='Price', ascending=False)
 
    avg_weighted_price = competitor_data['weighted_price'].mean()
    return {"predicted_price": avg_weighted_price, "competitor_data": competitor_data_sorted}
 
def plot_competitor_prices(competitor_data):
    if competitor_data.empty:
        return "No data available for plotting."

    # Ensure 'Price' is numeric and 'Drug' is a string for plotting
    competitor_data['Price'] = pd.to_numeric(competitor_data['Price'], errors='coerce')
    competitor_data['Drug'] = competitor_data['Drug'].astype(str)

    # Ensure 'Annual_Therapy_Costs' is numeric
    competitor_data['Annual_Therapy_Costs'] = pd.to_numeric(competitor_data['Annual_Therapy_Costs'], errors='coerce')

    # Drop rows where 'Annual_Therapy_Costs' or 'Price' is NaN
    competitor_data_cleaned = competitor_data.dropna(subset=['Annual_Therapy_Costs', 'Price'])

    # Handle empty cleaned data
    if competitor_data_cleaned.empty:
        return "No valid data available for plotting."

    # Plotting with a bar graph
    plt.figure(figsize=(10, 6))
    
    # Create the bar graph with drug names on the x-axis and therapy costs on the y-axis
    bar_width = 0.35  # Width of the bars
    index = np.arange(len(competitor_data_cleaned))  # Position of each bar

    # Bar graph for Annual_Therapy_Costs
    plt.bar(index, competitor_data_cleaned['Annual_Therapy_Costs'], bar_width, label='Annual Therapy Costs ($)', alpha=0.7)

    # Add labels and title
    plt.xlabel('Competitor Drug Name')
    plt.ylabel('Annual Therapy Costs ($)')
    plt.title('Top 10 Competitor Prices and Annual Therapy Costs')
    plt.xticks(index, competitor_data_cleaned['Drug'], rotation=45)
    plt.legend()

    # Show the grid and layout adjustments
    plt.grid(True)
    plt.tight_layout()
    plt.show()

    # Display the details of dropped data (those with NaN values in Price or Annual_Therapy_Costs)
    competitor_data_dropped = competitor_data[competitor_data.isna().any(axis=1)]
    return competitor_data_dropped[['Drug', 'Annual_Therapy_Costs', 'Price']]
 
def display_competitor_details(competitor_data):
    if competitor_data.empty:
        return "No data available for displaying details."
   
    competitor_details = competitor_data[['Drug', 'Morbidity', 'Mortality', 'Safety',"Annual_Therapy_Costs"]]
    # print("\nCompetitor Details (Morbidity, Mortality, Safety,Price):")
    print(competitor_details)
    result = competitor_details.to_dict(orient='records')
    # print(result)
    return result
 
def get_user_input():
    print("Please enter the following information:")
    disease = input("Disease (e.g., Catatonic Schizophrenia): ")
    country = input("Country (e.g., USA): ")
    modality = input("Modality (Small Molecule/Biologic): ")

    # Ask for submodality only if modality is biologic
    sub_modality = None
    if modality.lower() == "biologics":
        sub_modality = input
        ("Sub Modality (e.g., Cell Therapies, Gene Therapy, etc.): ")
        # _conte
    
    quality_of_life = input("Quality of Life: ")
    mortality = float(input("Mortality (percentage): "))
    morbidity = float(input("Morbidity (percentage): "))
    safety = input("Safety: ")
    efficacy = input("Efficacy: ")
    
    return disease, country, modality, sub_modality, quality_of_life, mortality, morbidity, safety, efficacy

def parse_data(raw_data):
    return pd.DataFrame(raw_data)

def main():
    disease, country, modality, sub_modality, quality_of_life, mortality, morbidity, safety, efficacy = get_user_input()
    # disease, country, modality, sub_modality, quality_of_life, mortality, morbidity, safety, efficacy = "COVID-19", "USA", "Biologics", "Vaccines", "Significant impairment in daily functioning", 5, 50, "Risk of sedation and metabolic side effects; careful dosing is required", "good for relief"
    competitor_data_raw = fetch_competitor_data(disease, country, modality, sub_modality)
    competitor_df = pd.DataFrame(competitor_data_raw)
    print("Fetched Competitor Data:", competitor_df.head())
    print("columns",competitor_df.columns)

 
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