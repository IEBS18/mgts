from flask import Flask, Blueprint, request, jsonify, Response, send_file
from flask_cors import CORS
import os
import logging
from openpyxl import Workbook
import io
import json
import sys
import ast
import matplotlib.pyplot as plt
import pandas as pd

try:
    from .rnd_util import fetch_raw_results, stream_llm_results, processed_data_cache, fuzzy_search, getAIColumn
    from .searchbyDrug import fetch_results, stream_drug, processed_cache
    from .searchbyDrug_util import benchmark_score_llama, run_benchmark_from_excel, get_user_weights

except:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from rnd_util import fetch_raw_results, stream_llm_results, processed_data_cache, fuzzy_search, getAIColumn
    from searchbyDrug import fetch_results, stream_drug, processed_cache
    from searchbyDrug_util import benchmark_score_llama, run_benchmark_from_excel, get_user_weights


rnd_blueprint = Blueprint('rnd', __name__)

@rnd_blueprint.route('/rnd-formulation-llama', methods=['GET'])
def rnd_formulation_llama():
    """
    SSE endpoint that streams LLaMA results for R&D Formulations.
    """
    user_query = request.args.get('user_query')
    size = request.args.get('size', default=2, type=int)
    # Accept requested fields as a comma-separated list
    requested_fields = request.args.get('requested_fields', '')
    # Log the raw input
    print("Raw requested_fields:", repr(requested_fields))
    print("Type of requested_fields:", type(requested_fields))

    # Convert requested fields into a list
    if isinstance(requested_fields, list):
        processed_fields = [field.strip() for field in requested_fields if field.strip()]
    else:
        processed_fields = [field.strip() for field in requested_fields.split(',') if field.strip()]

    print("Processed requested_fields:", processed_fields)
    print("Type after processing:", type(processed_fields))

    if not user_query:
        return jsonify({"error": "Missing 'user_query'"}), 400

    # Fetch Elasticsearch results
    raw_results = fetch_raw_results(user_query, size=size)

    # Stream results as SSE (pass processed fields)
    return Response(
        stream_llm_results(raw_results, user_query, processed_fields),
        content_type="text/event-stream",
        status=200
    )
    
 
@rnd_blueprint.route('/rnd-formulation-llama-results', methods=['GET'])
def get_processed_results():
    """Endpoint to fetch processed LLaMA-3.3 results."""
    user_query = request.args.get("user_query")
    if not user_query or user_query not in processed_data_cache:
        return jsonify({"error": "Results not ready yet"}), 404

    return jsonify({"results": processed_data_cache[user_query]}), 200
    
## SEARCH BY DRUG RND Formulation    
try:
    EXCEL_FILE_PATH = "./rifaximin_highlight_score.xlsx"
    # EXCEL_FILE_PATH = "./gut_microbiome_documents_output_file.xlsx"
except:
    EXCEL_FILE_PATH = "backend/rifaximin_highlight_score.xlsx"
    # EXCEL_FILE_PATH = "backend/gut_microbiome_documents_output_file.xlsx"

print(EXCEL_FILE_PATH)
# Default Weights


# Default Weights
default_weights = {
    "No_of_Patient_Treated": 0.20,
    "Gut_Microbiome_Association": 0.15,
    "Rifaximin_Treatment": 0.20,
    "Prevalence": 0.20,
    "Unmet_Needs": 0.15
    # "Bausch_Presence": 0.15
}

@rnd_blueprint.route('/api/rnd-formulation-drug', methods=['GET'])
def get_rnd_formulation_drug():
    try:
        drug_name = request.args.get('drug_name')
        requested_tabs_raw = request.args.get('selected_tabs')  # e.g., "enrollment,justification"

        if not drug_name:
            raise ValueError("Missing 'drug_name' parameter in request")

        if not requested_tabs_raw:
            raise ValueError("Missing 'selected_tabs' parameter in request")

        # Construct Excel path dynamically
        
        if not os.path.exists(EXCEL_FILE_PATH):
            raise FileNotFoundError(f"Excel file for {drug_name} not found at {EXCEL_FILE_PATH}")

        requested_tabs = [tab.strip().lower().replace(" ", "_") for tab in requested_tabs_raw.split(',')]


        xl = pd.ExcelFile(EXCEL_FILE_PATH)
        # Read the single sheet into a DataFrame
        df = xl.parse('Sheet1')
        
        
        # Sanitize column names (strip spaces, lowercase, replace spaces with underscores)
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
        
        print("Sanitized columns in the Excel file:", df.columns)

        # Ensure the requested columns exist in the DataFrame (case insensitive)
        missing_columns = [col for col in requested_tabs if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing columns in the Excel file: {', '.join(missing_columns)}")

        # Extract the requested columns
        data = df[requested_tabs].to_dict(orient='records')

        # Send back the relevant data
        response_data = {
            "data": data,
            "message": "Columns retrieved successfully"
        }
        
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

#==== BENCHMARK TABLE SCORE API ROUTE ====
# Default Weights (initial weights for the benchmark score calculation)
current_weights = {
    "No_of_Patient_Treated": 0.20,
    "Gut_Microbiome_Association": 0.15,
    "Rifaximin_Treatment": 0.20,
    "Prevalence": 0.20,
    "Unmet_Needs": 0.15
    # "Bausch_Presence": 0.15
}

# Route to handle the benchmark table (Excel-based or recalculated if weights are updated)
@rnd_blueprint.route('/api/benchmark-table', methods=['GET', 'POST'])
def get_benchmark_table():
    try:
        drug_name = request.args.get('drug_name')

        if not drug_name:
            raise ValueError("Missing 'drug_name' parameter in request")

        excel_filename = f"{drug_name.lower()}_highlight_score.xlsx"
        EXCEL_FILE_PATH = os.path.join("backend", excel_filename)

        if not os.path.exists(EXCEL_FILE_PATH):
            raise FileNotFoundError(f"Excel file for {drug_name} not found at {EXCEL_FILE_PATH}")

        xl = pd.ExcelFile(EXCEL_FILE_PATH)
        df = xl.parse('Sheet1')
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        if request.method == 'POST':
            data = request.get_json()
            updated_weights = {
                "No_of_Patient_Treated": data['weights'].get('enrollment', 0.2),
                "Gut_Microbiome_Association": data['weights'].get('mechanism', 0.175),
                "Rifaximin_Treatment": data['weights'].get('justification', 0.25),
                "Prevalence": data['weights'].get('prevalence', 0.175),
                "Unmet_Needs": data['weights'].get('unmet_needs', 0.10)
            }

            benchmark_scores = []
            for index, row in df.iterrows():
                try:
                    score_str = row['score_breakdown_distribution']
                    score_json = json.loads(score_str.replace("'", '"')) if isinstance(score_str, str) else score_str
                    total_score = sum(score_json[key] * updated_weights[key] for key in updated_weights)
                except Exception as e:
                    print(f"⚠️ Error parsing score breakdown on row {index}: {e}")
                    total_score = 0

                benchmark_scores.append({
                    "disease": row['disease'],
                    "benchmark_score": round(total_score, 2),
                    "score_breakdown_distribution": updated_weights
                })

            benchmark_table = pd.DataFrame(benchmark_scores).sort_values(by="benchmark_score", ascending=False)

            return jsonify({
                "benchmark_table": benchmark_table.to_dict(orient='records'),
                "message": f"✅ Benchmark Table recalculated for {drug_name}"
            }), 200

        else:
            df = df.sort_values(by="benchmark_score", ascending=False)
            top_scores = df.drop_duplicates(subset='disease', keep='first')
            top_scores['score_breakdown_distribution'] = top_scores['score_breakdown_distribution'].apply(ast.literal_eval)

            benchmark_table = top_scores[['disease', 'benchmark_score', 'score_breakdown_distribution']]

            return jsonify({
                "benchmark_table": benchmark_table.to_dict(orient='records'),
                "message": f"✅ Benchmark Table retrieved successfully for {drug_name}"
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


#             for index, row in df.iterrows():
#                 scores, total = benchmark_score_llama(
#                     enrollment=row['enrollment'],
#                     mechanism_text=row['disease_mechanism'],
#                     justification=row['justification_for_drug_use'],
#                     prevalence=row['prevalence'],
#                     bausch_presence_text=row['bausch_presence'],
#                     safety=row['safety'],
#                     efficacy=row['efficacy'],
#                     weights=updated_weights  # Use the updated weights
#                 )
#                 # print(benchmark_scores)
#                 benchmark_scores.append({
#                     "disease": row['disease'],
#                     "benchmark_score": total,
#                     "score_breakdown_distribution": updated_weights
#                 })
            
#             # benchmark_table = pd.DataFrame(benchmark_scores)
#             benchmark_table = pd.DataFrame(benchmark_scores).sort_values(by="benchmark_score", ascending=False)
#             response_data = {
#                 "benchmark_table": benchmark_table.to_dict(orient='records'),
#                 "message": "Benchmark Table recalculated successfully"
#             }
#         else:
#             # Fetch pre-calculated data from the Excel sheet
#             xl = pd.ExcelFile(EXCEL_FILE_PATH)
#             df = xl.parse('Sheet1')

#             # Sanitize column names (strip spaces, lowercase, replace spaces with underscores)
#             df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

#             # Sort by 'Benchmark_Score' to get the top 5 diseases
#             # top_scores = df.nlargest(5, 'benchmark_score')  # Top 5 diseases based on benchmark score
#             df=pd.DataFrame(df).sort_values(by="benchmark_score", ascending=False)
#             top_scores =df.drop_duplicates(subset='disease', keep='first')

#             # Create the benchmark table with diseases, benchmark scores, and score breakdown
            

# # Assuming 'score_breakdown_distribution' is a string representation of a dictionary
#             top_scores['score_breakdown_distribution'] = top_scores['score_breakdown_distribution'].apply(ast.literal_eval)

#             benchmark_table = top_scores[['disease', 'benchmark_score', 'score_breakdown_distribution']]

#             response_data = {
#                 "benchmark_table": benchmark_table.to_dict(orient='records'),
#                 "message": "Benchmark Table retrieved successfully from Excel"
#             }

#         return jsonify(response_data), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 400



# Route to handle pie chart for top benchmark scores (Excel-based or recalculated if weights are updated)
@rnd_blueprint.route('/api/pie-chart', methods=['GET', 'POST'])
def get_pie_chart():
    try:
        drug_name = request.args.get('drug_name', '').strip().lower()

        xl = pd.ExcelFile(EXCEL_FILE_PATH)
        df = xl.parse('Sheet1')
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        if drug_name:
            df = df[df['drug'].str.lower() == drug_name]

        if df.empty:
            raise ValueError(f"No data found for drug: {drug_name}")

        if request.method == 'POST':
            data = request.get_json()
            updated_weights = {
                "No_of_Patient_Treated": data['weights'].get('enrollment', 0.2),
                "Gut_Microbiome_Association": data['weights'].get('mechanism', 0.175),
                "Rifaximin_Treatment": data['weights'].get('justification', 0.25),
                "Prevalence": data['weights'].get('prevalence', 0.175),
                "Unmet_Needs": data['weights'].get('unmet_needs', 0.10)
            }

            benchmark_scores = []
            for index, row in df.iterrows():
                try:
                    score_str = row['score_breakdown_distribution']
                    score_json = json.loads(score_str.replace("'", '"')) if isinstance(score_str, str) else score_str
                    total_score = sum(score_json[key] * updated_weights[key] for key in updated_weights)
                except Exception as e:
                    print(f"⚠️ Error parsing score breakdown on row {index}: {e}")
                    total_score = 0

                benchmark_scores.append({
                    "disease": row['disease'],
                    "benchmark_score": round(total_score, 2),
                })

            benchmark_df = pd.DataFrame(benchmark_scores).drop_duplicates(subset='disease', keep='first')
            top_scores = benchmark_df.nlargest(5, 'benchmark_score')

        else:
            df = df.drop_duplicates(subset='disease', keep='first')
            top_scores = df.nlargest(5, 'benchmark_score')

        pie_chart_data = [
            {"name": row['disease'], "value": row['benchmark_score']}
            for _, row in top_scores.iterrows()
        ]

        return jsonify({
            "pie_chart_data": pie_chart_data,
            "message": "Pie chart data generated successfully"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400



@rnd_blueprint.route('/rnd-excel-export', methods=['POST'])
def rnd_excel_export():
    """
    Expects JSON in the format:
    {
      "data": [ ... array of objects ... ]
    }
    Returns an Excel file with two sheets:
      - "pub_med" for items that have "PMC_ID"
      - "patent" for items that have "Publication_Date"
    """
    # Retrieve the JSON payload from the request
    payload = request.get_json(silent=True) or {}
    data = payload.get("data", [])

    if not isinstance(data, list):
        return jsonify({"error": "Invalid data. 'data' should be a list."}), 400

    # Separate pub_med vs. patent data
    pmc_data = [item for item in data if "PMC_ID" in item]
    patent_data = [item for item in data if "Publication_Date" in item]

    # Create an Excel workbook with openpyxl
    wb = Workbook()

    # 1) Create the 'pub_med' sheet
    ws_pubmed = wb.active
    ws_pubmed.title = "pub_med"

    # Gather all distinct keys from pmc_data for column headers
    pmc_keys = set()
    for row in pmc_data:
        pmc_keys.update(row.keys())
    pmc_columns = list(pmc_keys)

    # Write column headers for pub_med
    ws_pubmed.append(pmc_columns)

    # Write rows for pub_med
    for row in pmc_data:
        values = [row.get(key, "") for key in pmc_columns]
        ws_pubmed.append(values)

    # 2) Create the 'patent' sheet
    ws_patent = wb.create_sheet(title="patent")

    patent_keys = set()
    for row in patent_data:
        patent_keys.update(row.keys())
    patent_columns = list(patent_keys)

    # Write column headers for patent
    ws_patent.append(patent_columns)

    # Write rows for patent
    for row in patent_data:
        values = [row.get(key, "") for key in patent_columns]
        ws_patent.append(values)

    # Save the workbook to an in-memory buffer
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    # Return the Excel file as an attachment
    return send_file(
        output,
        as_attachment=True,
        download_name="exported_data.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )    

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
    app.register_blueprint(rnd_blueprint)

    return app


# 5. Run the application
if __name__ == '__main__':
    logging.info("Starting Flask R&D microservice on port 5007...")
    app = create_app()
    app.run(host="0.0.0.0", port=5007)