from flask import Flask, Blueprint, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import os
import logging
from io import BytesIO
import sys
try:
    from .disease_overview_util import adverse_effect_score, calculate_safety_efficacy_scores, extract_adverse_events, extract_annual_therapy_cost, process_drug_comparison, format_output, process_key_insights, key_insights, update_drug_data
    from Chatbot.query_classifier import es
except:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from disease_overview_util import adverse_effect_score, calculate_safety_efficacy_scores, extract_adverse_events, extract_annual_therapy_cost, process_drug_comparison, format_output, process_key_insights, key_insights, update_drug_data
    from Chatbot.query_classifier import es


disease_overview_blueprint = Blueprint('disease_overview', __name__)

file_path = './MnP.xlsx'

years = ['2019', '2020', '2021', '2022', '2023']
forecast_years = ['2024', '2025', '2026', '2027', '2028']

def get_disease_and_modality(drug_name):
    try:
        # Load the Excel file
        df = pd.read_excel("../tpp_database.xlsx")

        # Check if the drug exists in the 'Drug' column
        drug_data = df[df['Drug'] == drug_name]

        if drug_data.empty:
            return None

        # Extract Disease and Modality columns
        # Split the 'Disease' column values by newline and remove empty values
        diseases = drug_data['Disease'].dropna().apply(lambda x: [d.strip() for d in x.split('\n')]).explode().unique().tolist()

        # Extract modalities (assuming there are no newlines in the modality column)
        modalities = drug_data['Modality'].dropna().unique().tolist()

        return {
            "diseases": diseases,
            "modalities": modalities
        }
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        return None

def get_matched_disease_info(matched_disease):
    try:
        # Load the Excel file
        df = pd.read_excel("../tpp_database.xlsx")

        # Check if the disease exists in the 'Disease' column
        disease_data = df[df['Disease'].str.contains(matched_disease, na=False, case=False)]

        if disease_data.empty:
            return None

        # Extract unique routes of administration and modalities
        routes_of_administration = disease_data['Route Of Administration'].dropna().unique().tolist()
        modalities = disease_data['Modality'].dropna().unique().tolist()

        return {
            "routes_of_administration": routes_of_administration,
            "modalities": modalities
        }
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        return None

def load_tpp_data():
    try:
        # Assuming the Excel file is in the parent directory relative to this script
        excel_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tpp_database.xlsx")
        print(excel_path)
        return pd.read_excel(excel_path)
    except Exception as e:
        print(f"Error loading Excel file: {e}")
        return None

# Initialize the dataframe
df = load_tpp_data()


# API endpoint to fetch disease and modality based on drug name
@disease_overview_blueprint.route('/drug-info', methods=['POST'])
def drug_info():
    try:
        data = request.get_json()  # Get the input JSON from frontend
        drug_name = data.get("drugName")

        if not drug_name:
            return jsonify({"error": "Drug name is required"}), 400

        # Get the disease and modality for the given drug
        result = get_disease_and_modality(drug_name)

        if not result:
            return jsonify({"error": "Drug not found in the database"}), 404

        return jsonify(result), 200

    except Exception as e:
        print(f"Error in API request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


# API endpoint to fetch routes of administration and modalities for matched disease
@disease_overview_blueprint.route('/disease-info', methods=['POST'])
def matched_disease_info():
    try:
        data = request.get_json()  # Get the input JSON from frontend
        matched_disease = data.get("diseaseName")

        if not matched_disease:
            return jsonify({"error": "Matched disease name is required"}), 400

        # Get routes of administration and modalities for the given matched disease
        result = get_matched_disease_info(matched_disease)

        if not result:
            return jsonify({"error": "Matched disease not found in the database"}), 404

        return jsonify(result), 200

    except Exception as e:
        print(f"Error in API request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500




@disease_overview_blueprint.route('/search-by-disease', methods=['POST'])
def disease_search():
    data = request.json
    search_type = data.get("search_type")
    index = "disease_data_final"

    es_query = []

    disease_names = data.get("disease_name", [])
    # country_names = data.get("country_name", [])

    es_query.append({"index": index})

    # Construct the query
    bool_query = {"must": []}

    # Add disease filter if it's provided
    if disease_names != "all":
        bool_query["must"].append({"term": {"Disease.keyword": disease_names}})

    es_query.append({
        "query": {
            "bool": bool_query
        },
        "size": 10000  # Control the number of results for performance
    })
    
        # Search query to Elasticsearch: searching across all fields
    query = {
        "query": {
            "multi_match": {
                "query": disease_names,  # Query the disease name
                "fields": ["Disease"],  # Search across all fields in the index
                # "fuzziness": "AUTO",  # Optional: Fuzzy matching for minor spelling errors
            }
        }
    }

    try:
        # Perform the multi-search query
        response = es.msearch(body=es_query)
        documents = [
            hit['_source']
            for res in response['responses']
            for hit in res['hits']['hits']
        ]
        drug_response = es.search(index='combined_country_drug1', body=query)
        # Extract relevant data from the Elasticsearch response
        drugs = []
        for hit in drug_response['hits']['hits']:
            drug_info = hit['_source']  # Assuming the relevant drug info is in the "_source" field
            drugs.append(drug_info)

        return jsonify({"status": "success", "data": documents, "drugs": drugs})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@disease_overview_blueprint.route('/search-by-drug', methods=['POST'])
def drug_search():
    data = request.json
    search_type = data.get("search_type")
    index = "combined_country_drug1"

    es_query = []
    drug_names = data.get("drug_names", [])
    country_names = data.get("country_name", [])

    es_query.append({"index": index})

    # Construct the query
    bool_query = {"must": []}

    # Add drug filter if it's provided
    if drug_names != "all":
        bool_query["must"].append({"term": {"Active Ingredient.keyword": drug_names}})

    # Add country filter if it's not "all"
    if "all" not in country_names:
        bool_query["must"].append({"terms": {"Country.keyword": country_names}})

    es_query.append({
        "query": {
            "bool": bool_query
        },
        "size": 10000  # Control the number of results for performance
    })

    try:
        # Perform the multi-search query
        response = es.msearch(body=es_query)

        # Extract documents from responses
        documents = [
            hit['_source']
            for res in response['responses']
            for hit in res['hits']['hits']
        ]

        return jsonify({"status": "success", "data": documents})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@disease_overview_blueprint.route('/search-by-symptoms', methods=['POST'])
def symptom_search():
    data = request.json
    index = "disease_data_final"

    es_query = []
    search_keyword = data.get("search_keyword", "")

    es_query.append({"index": index})

    # Construct the query
    bool_query = {"must": []}

    # Add symptoms filter if it's provided
    if search_keyword:
        bool_query["must"].append({
            "match": {
                "Signs & Symptoms": {
                    "query": search_keyword,
                    "fuzziness": "AUTO"
                }
            }
        })
        
        es_query.append({
            "query": {
                "bool": bool_query
            },
            "size": 10000  # Control the number of results for performance
        })

    try:
        # Perform the multi-search query
        response = es.msearch(body=es_query)

        # Extract documents from responses
        documents = [
            hit['_source']
            for res in response['responses']
            for hit in res['hits']['hits']
        ]

        return jsonify({"status": "success", "data": documents})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
       

@disease_overview_blueprint.route('/add-ai-column', methods=['POST'])
def add_ai_column():
    try:
        data = request.get_json()
        column_name = data.get('columnName')
        column_description = data.get('columnDescription')
        search_results = data.get('searchResults')
        print(search_results)
        
        updated_results = update_drug_data(search_results, column_name, column_description)
        # print(updated_results)

        if not column_name or not column_description:
            return jsonify({"error": "Both columnName and columnDescription are required"}), 400

        print(f"Adding AI column: {column_name}, Description: {column_description}")
        print(f"Search results associated: {search_results}")

        return jsonify({"updated_results": updated_results}), 200

    except Exception as e:
        print(f"Error while adding AI column: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@disease_overview_blueprint.route('/annual_therapy_cost', methods=['POST'])
def annual_therapy_cost_calculator():
    try:
        data = request.json
        cost_statement = data.get('cost_statement')
        if not cost_statement:
            return jsonify({'error': 'cost_statement is required'}), 400

        result = extract_annual_therapy_cost(cost_statement)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@disease_overview_blueprint.route('/adverse_event_score', methods=['POST'])
def adverse_event_score_calculator():
    try:
        data = request.json
        drug_name = data.get('drug_name')
        adverse_event_statement = data.get('adverse_event_statement')

        if not drug_name or not adverse_event_statement:
            return jsonify({'error': 'drug_name and adverse_event_statement are required'}), 400

        # Extract adverse events
        adverse_events = extract_adverse_events(adverse_event_statement)
        if not adverse_events:
            return jsonify({'error': 'No adverse events found'}), 400

        result = adverse_effect_score(drug_name, adverse_events)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@disease_overview_blueprint.route('/safety_efficacy_score', methods=['POST'])
def safety_efficacy_score_calculator():
    try:
        data = request.json
        trade_name = data.get('trade_name')
        country = data.get('country')
        disease = data.get('disease')
        efficacy_statement = data.get('efficacy_statement')
        safety_statement = data.get('safety_statement')
        print(data)

        if not (trade_name and country and disease and efficacy_statement and safety_statement):
            return jsonify({
                'error': 'trade_name, country, disease, efficacy_statement, and safety_statement are required'
            }), 400

        result = calculate_safety_efficacy_scores(trade_name, country, disease, efficacy_statement, safety_statement)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@disease_overview_blueprint.route('/tpp-by-drug', methods=['POST'])
def search_tpp_by_drug():
    try:
        data = request.json
        print(data)

        # Extract search parameters
        drug_name = data.get('drugName', '').strip()
        disease_name = data.get('diseaseName', '').strip()
        modality = data.get('modality', '').strip()

        # First, filter the dataset to find rows for the given drug name
        drug_df = df[df['Drug'].str.lower() == drug_name.lower()]

        # If no data for the drug, return early
        if drug_df.empty:
            return jsonify({
                'message': 'No matching records found for the drug',
                'data': []
            }), 200

        # Extract and clean disease names if empty
        if not disease_name and not drug_df.empty:
            raw_disease_text = drug_df['Disease'].dropna().unique().tolist()
            disease_list = []
            
            # Process each disease entry
            for entry in raw_disease_text:
                diseases = entry.split("\n")  # Split by newline
                # diseases = [d.replace("-", "").strip() for d in diseases]  # Clean formatting
                disease_list.extend(diseases)  # Collect all disease names

            print(f"Extracted and Cleaned Diseases: {disease_list}")
        else:
            disease_list = [disease_name.strip()] if disease_name else []

        # Extract modality if empty
        if not modality and not drug_df.empty:
            modality = drug_df['Modality'].iloc[0]  # Picking first value
            print(f"Extracted Modality: {modality}")

        # Apply AND logic for Disease (match any extracted disease)
        if disease_list:
            disease_mask = df['Disease'].apply(lambda x: any(d in str(x) for d in disease_list))
        else:
            disease_mask = pd.Series([True] * len(df))

        # Apply AND logic for Modality
        modality_mask = df['Modality'].str.contains(modality, case=False, na=False) if modality else pd.Series([True] * len(df))

        # Combine the conditions using AND logic
        combined_mask = disease_mask & modality_mask

        # Apply the combined filter to the DataFrame
        filtered_df = df[combined_mask]

        # Now combine drug_df with the filtered results
        result_df = pd.concat([drug_df, filtered_df]).drop_duplicates()

        # If no combined records found, return a message
        if result_df.empty:
            return jsonify({
                'message': 'No matching records found for the given disease and modality',
                'data': []
            }), 200

        # Fill NaN values with empty strings
        result_df = result_df.fillna("")

        # Convert the filtered dataframe to a list of dictionaries
        results = result_df.to_dict('records')

        return jsonify({
            'message': f'Found {len(results)} matching records',
            'data': results
        }), 200

    except Exception as e:
        print(f"Error in processing request: {e}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An error occurred while processing your request.'
        }), 500


@disease_overview_blueprint.route('/tpp-by-therapies', methods=['POST'])
def search_tpp_by_therapies():
    try:
        data = request.json
        # print(data)
        
        disease_name = data.get('diseaseName', '').strip()
        route_of_administration = data.get('routeOfAdministration', '').strip()
        modality = data.get('modality', '').strip()
        
        if not any([disease_name, route_of_administration, modality]):
            return jsonify({
                'error': 'Missing required fields',
                'message': 'At least one of Disease, Route of Administration, or Modality is required'
            }), 400
            
        filtered_df = df.copy()
        
        condition1 = (filtered_df['Disease'].str.contains(disease_name, case=False, na=False)) & \
                     (filtered_df['Modality'].str.contains(modality, case=False, na=False)) if disease_name and modality else False

        condition2 = filtered_df['Route Of Administration'].str.contains(route_of_administration, case=False, na=False) if route_of_administration else False
        
        if condition1 is not False or condition2 is not False:
            filtered_df['match_type'] = 'OR'
            filtered_df.loc[condition1, 'match_type'] = 'AND'
            
            filtered_df = filtered_df[condition1 | condition2]
            
            # Sort so that AND condition matches appear first
            filtered_df = filtered_df.sort_values(by='match_type', ascending=True)
            
        else:
            filtered_df = pd.DataFrame(columns=filtered_df.columns)
            
        if filtered_df.empty:
            return jsonify({
                'message': 'No matching records found',
                'data': []
            }), 200
            
        filtered_df = filtered_df.fillna("")
        results = filtered_df.drop(columns=['match_type']).to_dict('records')
        print(results)
        
        return jsonify({
            'message': f'Found {len(results)} matching records',
            'data': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@disease_overview_blueprint.route('/main-drug-insights', methods=['POST'])
def main_drug_insights():
    try:
        data = request.json
        main_drug = data.get('drug_name')
        all_data = data.get('all_data')  # Get all_data from the request
        
        if not main_drug:
            return jsonify({"error": "Main drug not provided"}), 400
        
        if all_data is None:
            return jsonify({"error": "All data not provided"}), 400
        
        # Call your existing function to process drug comparison
        results = process_drug_comparison(all_data, main_drug)  # Pass all_data instead of DRUG_DATA
        
        # Format the output
        formatted_output_result = format_output(main_drug, results["differences"])
        
        keyResults = process_key_insights(all_data, main_drug)
        keyInsights = key_insights(main_drug, keyResults["differences"])
        
        return jsonify({"differentiator": formatted_output_result, "keyInsights": keyInsights})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500



@disease_overview_blueprint.route('/therapy-cost-estimation', methods=['POST'])
def therapy_cost_estimation():
    data = request.json
    disease = data.get('disease')
    forecast_years = ['2024', '2025', '2026', '2027', '2028']
    
    if not disease:
        return jsonify({'error': 'Disease name is required'}), 400
    
    # Retrieve data for multiple countries
    country_data = get_country_data(disease)
    if not country_data:
        return jsonify({'error': f'No data found for disease {disease}'}), 404
    
    # Prepare response data for each country
    response = {}
    for country, data in country_data.items():
        all_years = data['years'] + forecast_years
        combined_therapy_cost = data['therapy_cost'] + list(data['therapy_cost_forecast'])
        response[country] = {
            'all_years': all_years,
            'combined_therapy_cost': combined_therapy_cost
        }
    print(response)
    return jsonify(response)

@disease_overview_blueprint.route('/market-estimation', methods=['POST'])
def market_estimation():
    data = request.json
    disease = data.get('disease')
    forecast_years = ['2024', '2025', '2026', '2027', '2028']
    
    if not disease:
        return jsonify({'error': 'Disease name is required'}), 400
    
    # Retrieve data for multiple countries
    country_data = get_country_data(disease)
    if not country_data:
        return jsonify({'error': f'No data found for disease {disease}'}), 404
    
    # Prepare response data for each country
    response = {}
    for country, data in country_data.items():
        all_years = data['years'] + forecast_years
        combined_market_size = data['market_size'] + list(data['market_forecast'])
        response[country] = {
            'years': data['years'],
            'forecast_years': forecast_years,
            'market_size': data['market_size'],
            'market_forecast': data['market_forecast'].tolist()
        }
    print(response)
    return jsonify(response)  

@disease_overview_blueprint.route('/download-excel', methods=['POST'])
def download_excel():
    # Step 1: Get JSON data from the POST request
    data = request.get_json()
    print(data)
    
    # Step 2: Convert JSON to a Pandas DataFrame
    df = pd.DataFrame(data)
    
    # Step 3: Save the DataFrame as an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
    
    # Move to the beginning of the stream
    output.seek(0)
    
    # Step 4: Return the Excel file as a downloadable response
    return send_file(
        output,
        as_attachment=True,
        download_name='search_results.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    
    
@disease_overview_blueprint.route('/drug-search-by-disease', methods=['POST'])
def drug_search_by_disease():
    # Get the disease name from the request
    data = request.get_json()
    disease_name = data.get('disease')

    if not disease_name:
        return jsonify({"error": "Disease name is required"}), 400

    # Search query to Elasticsearch: searching across all fields
    query = {
        "query": {
            "multi_match": {
                "query": disease_name,  # Query the disease name
                "fields": ["Disease"],  # Search across all fields in the index
                # "fuzziness": "AUTO",  # Optional: Fuzzy matching for minor spelling errors
            }
        }
    }

    try:
        # Search the 'combined-drug-data' index
        response = es.search(index='combined_country_drug1', body=query)

        # Extract relevant data from the Elasticsearch response
        drugs = []
        for hit in response['hits']['hits']:
            drug_info = hit['_source']  # Assuming the relevant drug info is in the "_source" field
            drugs.append(drug_info)

        return jsonify(drugs), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500    


def preprocess_data(values, min_value=1e-5):
    """Convert values to float, handle missing entries, replace zeros with a small threshold."""
    processed_values = []
    for val in values:
        try:
            val = str(val).replace('$', '').replace(',', '').strip()
            val = float(val)
            if val == 0:
                val = min_value  # Replace zero values with a small threshold
            processed_values.append(val)
        except ValueError:
            processed_values.append(min_value)  # Replace invalid values with the threshold
    return processed_values

def forecast_with_noise(X, y, future_periods=5, noise_scale=1.98, min_value=1e-4):
    """Train Linear Regression and forecast future values with controlled noise and a minimum value"""
    model = LinearRegression()
    model.fit(X, y)
 
    future_X = np.array(range(len(X), len(X) + future_periods)).reshape(-1, 1)
    predictions = model.predict(future_X)
 
    # Ensure no predictions are zero
    predictions = np.maximum(predictions, min_value)  # Replace any zero or negative values with min_value
 
    noise = np.random.normal(0, predictions.std() * noise_scale, predictions.shape)
 
    predictions_with_noise = predictions + noise
    predictions_with_noise = np.clip(predictions_with_noise, min_value, None)  # Clip to avoid values less than min_value
 
    return predictions_with_noise 
def get_country_data(disease_name):
    """Retrieve market and therapy cost data for a disease across multiple countries."""
    country_data = {}
    try:
        # Read the single Excel file
        df = pd.read_excel(file_path)

        # Filter data for the given disease
        disease_data = df[df['Disease'] == disease_name]

        if not disease_data.empty:
            # Iterate through each country in the filtered data
            for country in disease_data['Country'].unique():
                country_specific_data = disease_data[disease_data['Country'] == country]
                
                # Process market size and therapy cost for existing years and forecast future values
                market_size = preprocess_data([country_specific_data[f'Market_Size_{year}'].values[0] for year in years])
                therapy_cost = preprocess_data([country_specific_data[f'Average_therapy_cost_{year}'].values[0] for year in years])
                
                # Forecast future values
                X = np.array(range(len(years))).reshape(-1, 1)
                market_forecast = forecast_with_noise(X, np.array(market_size), future_periods=len(forecast_years))
                therapy_cost_forecast = forecast_with_noise(X, np.array(therapy_cost), future_periods=len(forecast_years))
                print(market_forecast)
                print(therapy_cost_forecast)
                # Store results in dictionary
                country_data[country] = {
                    'years': years,
                    'market_size': market_size,
                    'market_forecast': market_forecast,
                    'therapy_cost': therapy_cost,
                    'therapy_cost_forecast': therapy_cost_forecast,
                }
    except Exception as e:
        print(f"Error loading data: {e}")
    
    if not country_data:
        print(f"No data found for disease '{disease_name}' in the file.")
    return country_data

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
    app.register_blueprint(disease_overview_blueprint)

    return app



if __name__ == '__main__':
    logging.info("Starting Flask Disease Overview microservice on port 5004...")
    app = create_app()
    app.run(host="0.0.0.0", port=5004)