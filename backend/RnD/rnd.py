from flask import Flask, Blueprint, request, jsonify, Response, send_file
from flask_cors import CORS
import os
import logging
from rnd_util import fetch_raw_results, stream_llm_results, processed_data_cache, fuzzy_search, getAIColumn
from searchbyDrug import fetch_results, stream_drug, processed_cache
from openpyxl import Workbook
import io


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
 
@rnd_blueprint.route('/rnd-formulation-drug', methods=['GET'])
def rnd_formulation_drug():
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
    raw_results = fetch_results(user_query, size=size)

    # Stream results as SSE (pass processed fields)
    return Response(
        stream_drug(raw_results, user_query, processed_fields),
        content_type="text/event-stream",
        status=200
    )
  

 
@rnd_blueprint.route('/rnd-formulation-drug-results', methods=['GET'])
def get_results():
    """Endpoint to fetch processed LLaMA-3.3 results."""
    user_query = request.args.get("user_query")
    if not user_query or user_query not in processed_cache:
        return jsonify({"error": "Results not ready yet"}), 404

    return jsonify({"results": processed_cache[user_query]}), 200

@rnd_blueprint.route('/add-ai-column-rnd', methods=['POST'])
def add_ai_column_rnd():
    """
    Receives JSON with:
      - userQuery
      - columnName
      - columnDescription

    Returns JSON with:
      - updated_ai_responses: an array of strings,
        each one corresponding (by index) to an SSE record in the frontend.
    """
    data = request.get_json()

    user_query = data.get('userQuery')
    column_name = data.get('columnName')
    column_description = data.get('columnDescription')

    # Retrieve or replicate the SSE data in the same order
    results = fuzzy_search(user_query)

    # Generate or fetch the new AI field for each item
    updated_ai_responses = getAIColumn(results, column_name, column_description)

    # Return the array so the frontend can merge it by index
    return jsonify({
        "updated_ai_responses": updated_ai_responses
    })



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