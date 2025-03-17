from flask import Blueprint, request, jsonify
from .query_classifier import route_to_chatbot

chatbot_blueprint = Blueprint('chatbot', __name__)

@chatbot_blueprint.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get('query')
    results = data.get('results')
    # print(results)
    response = route_to_chatbot(query, results, conversation_history)
    return jsonify({"results": response})

