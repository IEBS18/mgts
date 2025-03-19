from flask import Flask, Blueprint, request, jsonify, Response, send_file
from flask_cors import CORS
import os
import sys
import logging
try:
    from .pp_util import display_competitor_details, fetch_competitor_data, parse_data, predict_price
except:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from pp_util import display_competitor_details, fetch_competitor_data, parse_data, predict_price
pp_blueprint = Blueprint('pp', __name__)


@pp_blueprint.route('/price-prediction', methods=['POST'])
def price_prediction():
    try:
        # Get JSON data from the request
        data = request.json
        print(data)
        disease = data.get("disease_name")
        country = data.get("country")
        quality_of_life = data.get("quality_of_life")
        mortality = float(data.get("mortality", 0))
        morbidity = float(data.get("morbidity", 0))
        safety = data.get("safety")
        efficacy = data.get("efficacy")
        modality=data.get("modality")
        subModality=data.get("subModality")

        # Fetch competitor data from Elasticsearch
        competitor_data_raw = fetch_competitor_data(disease, country, modality, subModality)
        competitor_df = parse_data(competitor_data_raw)

        # Predict price based on the input and competitor data
        prediction = predict_price(
            competitor_df, disease, quality_of_life, mortality, morbidity, safety, efficacy
        )
        
        print("prediction: ", prediction)
        
        chart_data = (prediction['competitor_data']).to_dict(orient='records')
        
        print("chart_data: ", chart_data)
        
        competitor_details = display_competitor_details(prediction['competitor_data'])
        # details= competitor_details.to_dict(orient='records')
        # print("x:", competitor_details)
        
        # Return the prediction as a JSON response
        return jsonify({'predicted_price': prediction['predicted_price'], 'chart_data': chart_data, 'competitor_details': competitor_details})

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
    app.register_blueprint(pp_blueprint)

    return app


# 5. Run the application
if __name__ == '__main__':
    logging.info("Starting Flask Price Prediction microservice on port 5006...")
    app = create_app()
    app.run(host="0.0.0.0", port=5006)
    
    
