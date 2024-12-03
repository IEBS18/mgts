# from elasticsearch import Elasticsearch
# import pandas as pd
# import matplotlib.pyplot as plt
# import seaborn as sns
# import mplcursors
# from dotenv import load_dotenv
# import os
# import re
# import openai  # Required for Adverse_Affect_Score calculation


# # Load environment variables
# load_dotenv()
# ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
# ELASTIC_API_KEY = os.getenv('elasticapikey')
# OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# # Connect to Elasticsearch
# es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY) 

# # Set up OpenAI
# openai.api_key = OPENAI_API_KEY

# # Function to convert textual cost descriptions to numeric values
# def estimate_therapy_cost(statement):
#     prompt = f"Extract the numeric range or single value in USD from the following description: {statement}"
#     try:
#         response = openai.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0
#         )
#         content = response.choices[0].message.content.strip()
#         values = [float(v) for v in re.findall(r'\b\d+\.?\d*\b', content)] 
#         print(sum(values) / len(values))
#         return sum(values) / len(values) if values else None
#     except Exception as e:
#         print(f"Error during OpenAI API call for therapy cost: {e}")
#         return None

# # Function to calculate adverse effect score
# def calculate_adverse_effect_score(drug_name, adverse_events):
#     events_list_str = "\n".join([f"- {event}" for event in adverse_events])
#     prompt = f"""
#     Assess the adverse events for {drug_name}:
#     Events:
#     {events_list_str}

#     Output:
#     - Score: X.XX
#     """
#     try:
#         response = openai.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0
#         )
#         content = response.choices[0].message.content.strip()
#         score_match = re.search(r"- Score: ([\d.]+)", content)
#         return float(score_match.group(1)) if score_match else None
#     except Exception as e:
#         print(f"Error during OpenAI API call for adverse effect score: {e}")
#         return None

# # Function to process data and create charts
# def charts(data, active_ingredient, graph_choice):
#     if graph_choice == '1':
#         # Donut chart
#         plt.figure(figsize=(10, 6))
#         top_diseases = data['Disease'].value_counts().nlargest(10)
#         plt.pie(top_diseases, labels=top_diseases.index, autopct='%1.1f%%', startangle=140)
#         centre_circle = plt.Circle((0, 0), 0.70, fc='white')
#         fig = plt.gcf()
#         fig.gca().add_artist(centre_circle)
#         plt.axis('equal')
#         plt.title(f'Distribution of Top 10 Diseases Treated by {active_ingredient}')
#         plt.show()

#     elif graph_choice == '2':
#         # Convert therapy cost to numeric
#         # data['Annual_Therapy_Costs'] = data['Annual_Therapy_Costs'].apply(estimate_therapy_cost)
#         # data = data.dropna(subset=['Annual_Therapy_Costs'])
#         # # Drop rows with NaN costs
#         data= data['Annual_Therapy_Costs(Numbers)']
#         plt.figure(figsize=(12, 8))
#         ax = sns.scatterplot(
#             x='TradeName',
#             y='Annual_Therapy_Costs',
#             size='Annual_Therapy_Costs',
#             hue='Disease',
#             data=data,
#             sizes=(20, 200),
#             alpha=0.7
#         )
#         plt.title(f'Annual Therapy Cost vs Drug Name for {active_ingredient}', fontsize=14)
#         plt.xlabel('Drug Name', fontsize=12)
#         plt.ylabel('Annual Therapy Cost ($)', fontsize=12)
#         plt.xticks(rotation=45, ha='right')
#         cursor = mplcursors.cursor(ax.collections, hover=True)
#         @cursor.connect("add")
#         def on_add(sel):
#             index = sel.index
#             sel.annotation.set_text(
#                 f"Disease: {data.iloc[index]['Disease']}\n"
#                 f"Cost: ${data.iloc[index]['Annual_Therapy_Costs']:,.0f}\n"
#                 f"Drug: {data.iloc[index]['TradeName']}"
#             )
#         plt.show()

#     elif graph_choice == '3':
#         # Calculate adverse effect scores
#         data['Adverse_Affect_Score'] = data.apply(
#             lambda row: calculate_adverse_effect_score(row['TradeName'], row['Adverse_Events']),
#             axis=1
#         )
#         data['Adverse_Affect_Score'] = pd.to_numeric(data['Adverse_Affect_Score'], errors='coerce')
#         if data['Adverse_Affect_Score'].isnull().all():
#             print("No valid Adverse Affect Score data available for heatmap.")
#             return
#         data['Morbidity'] = pd.to_numeric(data['Morbidity'], errors='coerce')
#         if data['Morbidity'].isnull().all():
#             print("No valid Morbidity data available for heatmap.")
#             return
#         plt.figure(figsize=(12, 8))
#         pivot_data = data.pivot_table(index='TradeName', columns='Adverse_Affect_Score', values='Morbidity', aggfunc='mean')
#         sns.heatmap(pivot_data, cmap='coolwarm', annot=True, fmt=".1f")
#         plt.title(f'Competitive Matrix of Drugs for {active_ingredient}')
#         plt.xlabel('Adverse Affect Score')
#         plt.ylabel('Drug Name')
#         plt.show()

#     else:
#         print("Invalid choice! Please select a valid graph option (1, 2, or 3).")

# # User input and Elasticsearch query
# active_ingredient = input("Enter the active ingredient of the drug: ")
# query = {
#     "size": 10000,
#     "query": {
#         "bool": {
#             "must": [
#                 {"match": {"Active Ingredient.keyword": active_ingredient}}
#             ]
#         }
#     }
# }
# response = es.search(index="combined_country_drug1", body=query)
# hits = response['hits']['hits']
# if hits:
#     data = pd.DataFrame([hit['_source'] for hit in hits])
#     if not data.empty:
#         print("\nSelect the graph to display:")
#         print("1. Distribution of Diseases Treated by the Drug (Donut Chart)")
#         print("2. Annual Therapy Cost vs Drug Name (Bubble Chart)")
#         print("3. Competitive Matrix (Heatmap)")
#         graph_choice = input("Enter your choice (1, 2, or 3): ")
#         charts(data, active_ingredient, graph_choice)
#     else:
#         print("No data found for the given active ingredient!")
# else:
#     print("No data found for the given active ingredient!")


from elasticsearch import Elasticsearch
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import mplcursors
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
ELASTIC_API_KEY = os.getenv('elasticapikey')

# Connect to Elasticsearch
es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY)


def get_donut_chart_data(data):
    top_diseases = data['Disease'].value_counts().nlargest(10)
    return top_diseases.to_dict()

# Function for Bubble Chart Data
def get_bubble_chart_data(data):
    if 'Annual_Therapy_Costs(Numbers)' not in data.columns:
        return {"error": "Missing Annual Therapy Costs data"}
    data = data.dropna(subset=['Annual_Therapy_Costs(Numbers)'])
    bubble_chart_data = data[['TradeName', 'Annual_Therapy_Costs(Numbers)', 'Disease', 'Size']].to_dict(orient='records')
    return bubble_chart_data

# Function for Heatmap Data
def get_heatmap_data(data):
    if 'Adverse_Events_Score' not in data.columns or 'Morbidity' not in data.columns:
        return {"error": "Missing necessary fields for heatmap"}
    data['Adverse_Events_Score'] = pd.to_numeric(data['Adverse_Events_Score'], errors='coerce')
    data['Morbidity'] = pd.to_numeric(data['Morbidity'], errors='coerce')
    if data['Adverse_Events_Score'].isnull().all() or data['Morbidity'].isnull().all():
        return {"error": "No valid data for heatmap"}
    pivot_data = data.pivot_table(index='TradeName', columns='Adverse_Events_Score', values='Morbidity', aggfunc='mean')
    return pivot_data.to_dict()
# Function to process data and create charts
# def charts(data, active_ingredient, graph_choice):
#     if graph_choice == '1':
#         # Donut chart
#         plt.figure(figsize=(10, 6))
#         top_diseases = data['Disease'].value_counts().nlargest(10)
#         print('Diseases: ', top_diseases)
#         plt.pie(top_diseases, labels=top_diseases.index, autopct='%1.1f%%', startangle=140)
#         centre_circle = plt.Circle((0, 0), 0.70, fc='white')
#         fig = plt.gcf()
#         fig.gca().add_artist(centre_circle)
#         plt.axis('equal')
#         plt.title(f'Distribution of Top 10 Diseases Treated by {active_ingredient}')
#         plt.show()

#     elif graph_choice == '2':
#         # Bubble chart with pre-fetched `Annual_Therapy_Costs(Numbers)`
#         if 'Annual_Therapy_Costs(Numbers)' not in data.columns:
#             print("Data does not contain pre-processed Annual Therapy Costs. Aborting!")
#             return
#         data = data.dropna(subset=['Annual_Therapy_Costs(Numbers)'])
#         print('AnnualTherapyCost: ', data)
#         plt.figure(figsize=(12, 8))
#         ax = sns.scatterplot(
#             x='TradeName',
#             y='Annual_Therapy_Costs(Numbers)',
#             size='Annual_Therapy_Costs(Numbers)',
#             hue='Disease',
#             data=data,
#             sizes=(20, 200),
#             alpha=0.7
#         )
#         plt.title(f'Annual Therapy Cost vs Drug Name for {active_ingredient}', fontsize=14)
#         plt.xlabel('Drug Name', fontsize=12)
#         plt.ylabel('Annual Therapy Cost ($)', fontsize=12)
#         plt.xticks(rotation=45, ha='right')
#         cursor = mplcursors.cursor(ax.collections, hover=True)
#         @cursor.connect("add")
#         def on_add(sel):
#             index = sel.index
#             sel.annotation.set_text(
#                 f"Disease: {data.iloc[index]['Disease']}\n"
#                 f"Cost: ${data.iloc[index]['Annual_Therapy_Costs(Numbers)']:,.0f}\n"
#                 f"Drug: {data.iloc[index]['TradeName']}"
#             )
#         plt.show()

#     elif graph_choice == '3':
#         # Heatmap with pre-fetched `Adverse_Events_Score`
#         if 'Adverse_Events_Score' not in data.columns or 'Morbidity' not in data.columns:
#             print("Data does not contain necessary fields for heatmap. Aborting!")
#             return
#         data['Adverse_Events_Score'] = pd.to_numeric(data['Adverse_Events_Score'], errors='coerce')
#         data['Morbidity'] = pd.to_numeric(data['Morbidity'], errors='coerce')
#         if data['Adverse_Events_Score'].isnull().all() or data['Morbidity'].isnull().all():
#             print("No valid data available for heatmap.")
#             return
#         plt.figure(figsize=(12, 8))
#         pivot_data = data.pivot_table(index='TradeName', columns='Adverse_Events_Score', values='Morbidity', aggfunc='mean')
#         print("adverseeventsscore:", pivot_data)
#         sns.heatmap(pivot_data, cmap='coolwarm', annot=True, fmt=".1f")
#         plt.title(f'Competitive Matrix of Drugs for {active_ingredient}')
#         plt.xlabel('Adverse Events Score')
#         plt.ylabel('Drug Name')
#         plt.show()

#     else:
#         print("Invalid choice! Please select a valid graph option (1, 2, or 3).")

# User input and Elasticsearch query
# active_ingredient = input("Enter the active ingredient of the drug: ")
# query = {
#     "size": 10000,
#     "query": {
#         "bool": {
#             "must": [
#                 {"match": {"Active Ingredient.keyword": active_ingredient}}
#             ]
#         }
#     }
# }
# response = es.search(index="combined_country_drug1", body=query)
# hits = response['hits']['hits']
# if hits:
#     data = pd.DataFrame([hit['_source'] for hit in hits])
#     if not data.empty:
#         print("\nSelect the graph to display:")
#         print("1. Distribution of Diseases Treated by the Drug (Donut Chart)")
#         print("2. Annual Therapy Cost vs Drug Name (Bubble Chart)")
#         print("3. Competitive Matrix (Heatmap)")
#         graph_choice = input("Enter your choice (1, 2, or 3): ")
#         charts(data, active_ingredient, graph_choice)
#     else:
#         print("No data found for the given active ingredient!")
# else:
#     print("No data found for the given active ingredient!")
