from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
import logging
import os
from query_classifier import route_to_chatbot, conversation_history

chatbot_blueprint = Blueprint('chatbot', __name__)

@chatbot_blueprint.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get('query')
    results = data.get('results')
    # print(results)
    response = route_to_chatbot(query, results, conversation_history)
    return jsonify({"results": response})


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
    app.register_blueprint(chatbot_blueprint)

    return app


# 5. Run the application
if __name__ == '__main__':
    logging.info("Starting Flask Chatbot microservice on port 5002...")
    app = create_app()
    app.run(host="0.0.0.0", port=5002)