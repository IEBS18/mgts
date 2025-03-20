from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Import each Blueprint
from Auth.auth import auth_blueprint
from Chatbot.chatbot import chatbot_blueprint
from CompetitveAnalysis.competitive_analysis import competitive_analysis_blueprint
from DiseaseOverview.disease_overview import disease_overview_blueprint
from Formulary.formulary import formulary_blueprint
from PricePrediction.pp import pp_blueprint
from RnD.rnd import rnd_blueprint


load_dotenv()

app = Flask(__name__)

# Allow cross-origin requests from specific hosts
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://68.154.56.138:3000", 
    "http://localhost:5174", 
    "http://127.0.0.1:5000"
])

# # Register Blueprints with a URL prefix
app.register_blueprint(auth_blueprint)
app.register_blueprint(competitive_analysis_blueprint)
app.register_blueprint(disease_overview_blueprint)
app.register_blueprint(chatbot_blueprint)
app.register_blueprint(formulary_blueprint)
app.register_blueprint(pp_blueprint)
app.register_blueprint(rnd_blueprint)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
