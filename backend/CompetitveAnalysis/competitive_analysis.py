from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
import re
import pandas as pd
import os
from Chatbot.query_classifier import es
import logging


competitive_analysis_blueprint = Blueprint('competitive_analysis', __name__)


def get_disease_data(disease_name):
    # Get the absolute directory where this file is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Join that directory path with the file name
    excel_path = os.path.join(current_dir, "simplified_excel_file.xlsx")

    df = pd.read_excel(excel_path)

    if 'Disease' not in df.columns or 'TradeName' not in df.columns:
        raise ValueError("'Disease' or 'TradeName' column is missing in the dataset.")

    disease_name = disease_name.strip().lower()
    filtered_df = df[df['Disease'].str.lower() == disease_name]

    if filtered_df.empty:
        return None

    # Drug Counts by Manufacturer
    drug_counts = filtered_df.groupby('Manufacturer').agg(
        Drug_Count=('TradeName', 'size'),
        Drug_Names=('TradeName', lambda x: ', '.join(x))
    ).reset_index()

    # Market Share by Manufacturer
    manufacturer_sales = filtered_df.groupby('Manufacturer')['Revenue_2023_Disease'].sum()

    # Revenue Over Years by Manufacturer
    revenue_by_year = filtered_df.melt(
        id_vars=['Manufacturer'],
        value_vars=['Revenue_2019_Disease', 'Revenue_2020_Disease', 'Revenue_2021_Disease',
                    'Revenue_2022_Disease', 'Revenue_2023_Disease'],
        var_name='Year', value_name='Revenue'
    )

    # Drug Type Distribution
    drug_type_distribution = filtered_df['Type_of_Drug'].value_counts()

    # Return the data as a dictionary
    data = {
        'drug_counts': drug_counts.to_dict(orient='records'),
        'market_share': manufacturer_sales.to_dict(),
        'revenue_by_year': revenue_by_year.to_dict(orient='records'),
        'drug_type_distribution': drug_type_distribution.to_dict(),
    }
    return data


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

def get_donut_chart_data(data):
    top_diseases = data['Disease'].value_counts().nlargest(10)
    return top_diseases.to_dict()

# Function for Bubble Chart Data
def get_bubble_chart_data(data):
    # if 'Annual_Therapy_Costs(Numbers)' not in data.columns:
    #     return {"error": "Missing Annual Therapy Costs data"}
    print(data['Annual_Therapy_Costs'])
    data['Annual_Therapy_Costs'] = (data['Annual_Therapy_Costs']).apply(clean_price)
    
    data = data.dropna(subset=['Annual_Therapy_Costs'])
    bubble_chart_data = data[['TradeName', 'Annual_Therapy_Costs', 'Disease', 'Size']].to_dict(orient='records')
    # print(bubble_chart_data)
    return bubble_chart_data


@competitive_analysis_blueprint.route('/generate_disease_analysis', methods=['POST'])
def generate_disease_analysis():
    data = request.get_json()
    disease_name = data.get('disease_name', '').strip().lower()

    if not disease_name:
        return jsonify({'error': 'Disease name is required'}), 400

    disease_data = get_disease_data(disease_name)
    print(disease_data)

    if not disease_data:
        return jsonify({'error': f'No data found for disease: {disease_name}'}), 404

    return jsonify(disease_data)



@competitive_analysis_blueprint.route('/get-drug-data', methods=['POST'])
def get_drug_data():
    try:
        # Get active ingredient from request
        active_ingredient = request.json.get('active_ingredient')
        print(active_ingredient)
        if not active_ingredient:
            return jsonify({"error": "Active ingredient is required"}), 400

        # Query Elasticsearch
        query = {
            "size": 10000,
            "query": {
                "bool": {
                    "must": [
                        {"match": {"Active Ingredient.keyword": active_ingredient}}
                    ]
                }
            }
        }
        response = es.search(index="combined_country_drug1", body=query)
        hits = response['hits']['hits']
        if not hits:
            return jsonify({"error": "No data found for the given active ingredient"}), 404

        # Process data
        data = pd.DataFrame([hit['_source'] for hit in hits])
        if data.empty:
            return jsonify({"error": "No data found for the given active ingredient"}), 404

        # Get chart data
        top_diseases_data = get_donut_chart_data(data)
        annual_therapy_data = get_bubble_chart_data(data)
        # print(annual_therapy_data)
        # adverse_events_data = get_heatmap_data(data)

        # Combine results
        result = {
            "top_diseases_data": top_diseases_data,
            "annual_therapy_data": annual_therapy_data
        }
        
        print(result)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# 4. Create the Flask app instance, configure logging/CORS, and register the blueprint
def create_app():
    app = Flask(__name__)

    # Configure Logging
    log_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
    os.makedirs(log_directory, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(os.path.join(log_directory, "app.log")),
            logging.StreamHandler()
        ]
    )

    # Set up CORS
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://68.154.56.138:3000",
            "http://localhost:5174",
            "http://127.0.0.1:5000"
        ]
    )

    # Register Blueprint
    app.register_blueprint(competitive_analysis_blueprint)

    return app


# 5. Run the application
if __name__ == '__main__':
    logging.info("Starting Flask Competitive Analysis microsrvicrsron port 5003...")
    app = create_app()
    app.run(host="0.0.0.0", port=5003)
