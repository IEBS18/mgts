
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from io import BytesIO
import json
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv

from PricePrediction.pp import display_competitor_details, fetch_competitor_data, parse_data, predict_price
from PlayerLandscape.dm import get_bubble_chart_data, get_donut_chart_data, get_heatmap_data
from PlayerLandscape.player import get_disease_data
from MarketEstimation.market import get_country_data
from Utilities.summarize import summarize_by_title_or_org
from Utilities.chatbot import es, conversation_history
from Utilities.diseasechatbot import process_question, disease_conversation_history
from Utilities.AIColumn import update_drug_data

load_dotenv()

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://68.154.56.138:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USER_FILE_PATH = './users.json'

class User(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

class SearchByDisease(BaseModel):
    search_type: str
    disease_name: str

class SearchByDrug(BaseModel):
    search_type: str
    drug_names: list
    country_name: list

class SearchBySymptoms(BaseModel):
    search_type: str
    search_keyword: str

class TherapyCostEstimation(BaseModel):
    disease: str

class MarketEstimation(BaseModel):
    disease: str

class GenerateDiseaseAnalysis(BaseModel):
    disease_name: str

class GenerateSummary(BaseModel):
    selectedCards: list

class AddAIColumn(BaseModel):
    columnName: str
    columnDescription: str
    searchResults: list

class PricePrediction(BaseModel):
    disease_name: str
    country: str
    quality_of_life: str
    mortality: float
    morbidity: float
    safety: str
    efficacy: str

class GetDrugData(BaseModel):
    active_ingredient: str

# Helper functions
def load_users():
    try:
        with open(USER_FILE_PATH, 'r') as f:
            # print(json.load(f))
            return json.load(f)
    except FileNotFoundError:
        return []

def save_users(users):
    try:
        with open(USER_FILE_PATH, 'w') as f:
            json.dump(users, f, indent=4)
    except Exception as e:
        print(f"Error saving users to file: {e}")

@app.post('/signup')
async def signup(user: User):
    users = load_users()
    if any(u['email'] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Email already exists!")

    hashed_password = generate_password_hash(user.password, method='pbkdf2:sha256')
    new_user = {
        "id": len(users) + 1,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "password_hash": hashed_password
    }
    users.append(new_user)
    save_users(users)

    return {"user_pharmax_id": new_user["id"], "first_name": user.first_name, "message": "Account created successfully!"}

@app.post('/login')
async def login(user: Login):
    users = load_users()
    user_data = next((u for u in users if u['email'] == user.email), None)
    print(user_data)
    print(user.password)

    if user_data and check_password_hash(user_data['password_hash'], user.password):
        response = JSONResponse(content={
            "user_pharmax_id": user_data["id"],
            "first_name": user_data["first_name"],
            "message": "Login successful!"
        })
        print(response)
        response.set_cookie(key='user_id', value=str(user_data["id"]), httponly=True)
        return response
    raise HTTPException(status_code=401, detail="Invalid credentials!")

async def get_user_id(request: Request):
    return request.cookies.get('user_id')

@app.get('/check_login')
async def check_login(user_id: str = Depends(get_user_id)):
    if user_id:
        return {'logged_in': True}
    return {'logged_in': False}

@app.post('/search-by-disease')
async def disease_search (data: SearchByDisease):
    index = "disease_data_final"
    es_query = [{"index": index}]
    bool_query = {"must": []}

    if data.disease_name != "all":
        bool_query["must"].append({"term": {"Disease.keyword": data.disease_name}})

    es_query.append({
        "query": {
            "bool": bool_query
        },
        "size": 10000
    })

    try:
        response = es.msearch(body=es_query)
        documents = [hit['_source'] for res in response['responses'] for hit in res['hits']['hits']]
        return {"status": "success", "data": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/search-by-drug')
async def drug_search(data: SearchByDrug):
    index = "combined_country_drug1"
    es_query = [{"index": index}]
    bool_query = {"must": []}

    if data.drug_names != "all":
        bool_query["must"].append({"term": {"Active Ingredient.keyword": data.drug_names}})

    if "all" not in data.country_name:
        bool_query["must"].append({"terms": {"Country.keyword": data.country_name}})

    es_query.append({
        "query": {
            "bool": bool_query
        },
        "size": 10000
    })

    try:
        response = es.msearch(body=es_query)
        documents = [hit['_source'] for res in response['responses'] for hit in res['hits']['hits']]
        return {"status": "success", "data": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/search-by-symptoms')
async def symptom_search(data: SearchBySymptoms):
    index = "disease_data_final"
    es_query = [{"index": index}]
    bool_query = {"must": []}

    if data.search_keyword:
        bool_query["must"].append({
            "match": {
                "Signs & Symptoms": {
                    "query": data.search_keyword,
                    "fuzziness": "AUTO"
                }
            }
        })

    es_query.append({
        "query": {
            "bool": bool_query
        },
        "size": 10000
    })

    try:
        response = es.msearch(body=es_query)
        documents = [hit['_source'] for res in response['responses'] for hit in res['hits']['hits']]
        return {"status": "success", "data": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/therapy-cost-estimation')
async def therapy_cost_estimation(data: TherapyCostEstimation):
    if not data.disease:
        raise HTTPException(status_code=400, detail='Disease name is required')

    country_data = get_country_data(data.disease)
    if not country_data:
        raise HTTPException(status_code=404, detail=f'No data found for disease {data.disease}')

    response = {}
    for country, data in country_data.items():
        response[country] = {
            'all_years': data['years'] + ['2024', '2025', '2026', '2027', '2028'],
            'combined_therapy_cost': data['therapy_cost'] + list(data['therapy_cost_forecast'])
        }
    return response

@app.post('/market-estimation')
async def market_estimation(data: MarketEstimation):
    if not data.disease:
        raise HTTPException(status_code=400, detail='Disease name is required')

    country_data = get_country_data(data.disease)
    if not country_data:
        raise HTTPException(status_code=404, detail=f'No data found for disease {data.disease}')

    response = {}
    for country, data in country_data.items():
        response[country] = {
            'years': data['years'],
            'forecast_years': ['2024', '2025', '2026', '2027', '2028'],
            'market_size': data['market_size'],
            'market_forecast': data['market_forecast'].tolist()
        }
    return response

@app.post('/generate_disease_analysis')
async def generate_disease_analysis(data: GenerateDiseaseAnalysis):
    if not data.disease_name:
        raise HTTPException(status_code=400, detail='Disease name is required')

    disease_data = get_disease_data(data.disease_name)
    if not disease_data:
        raise HTTPException(status_code=404, detail=f'No data found for disease: {data.disease_name}')

    return disease_data

# @app.post('/generate-summary')
# async def generate_summary(data: GenerateSummary):
#     summary = summarize _by_title_or_org(data.selectedCards)
#     return {"summary": summary}

@app.post('/add-ai-column')
async def add_ai_column(data: AddAIColumn):
    if not data.columnName or not data.columnDescription:
        raise HTTPException(status_code=400, detail="Both columnName and columnDescription are required")

    updated_results = update_drug_data(data.searchResults, data.columnName, data.columnDescription)
    return {"updated_results": updated_results}

@app.post('/price-prediction')
async def price_prediction(data: PricePrediction):
    try:
        competitor_data_raw = fetch_competitor_data(
            data.disease_name, data.country, data.quality_of_life, data.mortality, 
            data.morbidity, data.safety, data.efficacy
        )
        competitor_df = parse_data(competitor_data_raw)
        prediction = predict_price(
            competitor_df, data.disease_name, data.quality_of_life, data.mortality, 
            data.morbidity, data.safety, data.efficacy
        )

        chart_data = prediction['competitor_data'].to_dict(orient='records')
        competitor_details = display_competitor_details(prediction['competitor_data'])

        return {
            'predicted_price': prediction['average_price'], 
            'chart_data': chart_data, 
            'competitor_details': competitor_details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/get-drug-data')
async def get_drug_data(data: GetDrugData):
    if not data.active_ingredient:
        raise HTTPException(status_code=400, detail="Active ingredient is required")

    query = {
        "size": 10000,
        "query": {
            "bool": {
                "must": [
                    {"match": {"Active Ingredient.keyword": data.active_ingredient}}
                ]
            }
        }
    }
    response = es.search(index="combined_country_drug1", body=query)
    hits = response['hits']['hits']
    if not hits:
        raise HTTPException(status_code=404, detail="No data found for the given active ingredient")

    data = pd.DataFrame([hit['_source'] for hit in hits])
    if data.empty:
        raise HTTPException(status_code=404, detail="No data found for the given active ingredient")

    top_diseases_data = get_donut_chart_data(data)
    annual_therapy_data = get_bubble_chart_data(data)
    adverse_events_data = get_heatmap_data(data)

    result = {
        "top_diseases_data": top_diseases_data,
        "annual_therapy_data": annual_therapy_data,
        "adverse_events_data": adverse_events_data
    }

    return result

@app.post('/download-excel')
async def download_excel(data: dict):
    df = pd.DataFrame(data)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
    output.seek(0)
    return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={"Content-Disposition": "attachment; filename=search_results.xlsx"})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")