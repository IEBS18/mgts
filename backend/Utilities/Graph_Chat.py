#query classifier
#dynamic cypher quer
# neo4j search relation found give response
# else throw back to the elastic search data.
# thats it.

import os
import torch
import pickle
import logging
import spacy
from dotenv import load_dotenv
from neo4j import GraphDatabase
from elasticsearch import Elasticsearch
from openai import OpenAI
from transformers import BertTokenizer
from Utilities.train_query_classifier import QueryClassifierModel
from Utilities.utils import preprocess, create_prompt

# Load environment variables
load_dotenv()

# Neo4j connection details
neo4j_uri = os.getenv("NEO4J_URI")
neo4j_user = os.getenv("NEO4J_USER")
neo4j_password = os.getenv("NEO4J_PASSWORD")

import sys
sys.stdout.reconfigure(encoding='utf-8')

#Load spacy langugae model
nlp=spacy.load("en_core_web_sm")

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

# from diseasechatbot import generate_openai_completion
from Utilities.train_query_classifier import QueryClassifierModel
# from train_query_classifier import QueryClassifierModel
from Utilities.utils import(
    preprocess,
    create_prompt
)  
MODEL = "gpt-4o-mini"

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

with open(r"Utilities/query_router.pkl", "rb") as f:
    model = QueryClassifierModel()
    state_dict = pickle.load(f)
    model.load_state_dict(state_dict)
    

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

model.eval()


# Initialize Neo4j driver
driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))

# Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Query Labels
label_map = {0: "PubMed", 1: "Clinical Trials", 2: "Drug-Disease Association"}

# Initialize conversation history
conversation_history = []


def predict_query(query, model, tokenizer, max_len=64, threshold=0.5, label_map=None):
    encoding = tokenizer.encode_plus(
        query,
        add_special_tokens=True,
        max_length=max_len,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )
    input_ids = encoding["input_ids"]
    attention_mask = encoding["attention_mask"]
    with torch.no_grad():
        logits = model(input_ids, attention_mask=attention_mask)
    
    probs = torch.sigmoid(logits)
    
    predictions = (probs > threshold).long()
    predicted_indices = torch.nonzero(predictions[0]).flatten().tolist()
    
    if label_map:
        return [label_map[idx] for idx in predicted_indices]
    
    return predicted_indices

label_map = {0: "PubMed", 1: "Clinical Trials", 2: "Drug-Disease Association"} 

def extract_keywords(user_query):
    """
    Extract meaningful keywords and entities from user query using spaCy.
    """
    doc = nlp(user_query)

    # Extract named entities and key tokens (nouns, proper nouns, adjectives)
    entities = [ent.text for ent in doc.ents]
    keywords = [token.text for token in doc if token.pos_ in ("NOUN", "PROPN", "ADJ")]

    # Combine and remove duplicates
    unique_keywords = list(set(keywords + entities))
    logger.info(f"Extracted Keywords: {unique_keywords}")

    return unique_keywords

def generate_dynamic_cypher_query(keywords):
    """
    Dynamically generate a Cypher query based on extracted keywords.
    """
    # Define searchable properties in Neo4j nodes
    searchable_fields = ["Conditions", "TradeName", "Disease", "Product_Name", "ActiveIngredient"]

    # Construct WHERE clause using extracted keywords
    where_clauses = " OR ".join(
        [f"toLower(n.{prop}) CONTAINS $keyword OR toLower(m.{prop}) CONTAINS $keyword"
         for prop in searchable_fields]
    )

    # Generate the Cypher query
    cypher_query = f"""
    MATCH (n)-[r]-(m)
    WHERE ({where_clauses})
    RETURN n, r, m
    LIMIT 20
    """

    logger.info(f"Generated Cypher Query: {cypher_query}")
    return cypher_query


def query_neo4j(cypher_query, keywords):
    """
    Query Neo4j using the dynamically generated Cypher query.
    """
    try:
        with driver.session() as session:
            result = session.run(cypher_query, keyword=keywords[0].lower())
            data = [
                {
                    "node1": record["n"],
                    "relationship": record["r"].type,
                    "node2": record["m"]
                }
                for record in result
            ]
            logger.info(f"Retrieved {len(data)} records from Neo4j.")
            return data
    except Exception as e:
        logger.error(f"Error querying Neo4j: {e}")
        return []
    

def get_elasticsearch_results(index, query, fields, operator="OR"):
    """
    Query Elasticsearch if Neo4j has no relevant results.
    """
    if isinstance(query, set):
        query = " OR ".join(query)

    es_query = [
        {'index': index},
        {
            "query": {
                "query_string": {
                    "query": query,
                    "fields": fields,
                    "default_operator": operator,
                }
            },
            "size": 10
        }
    ]

    try:
        result = es.msearch(body=es_query)
        responses = result.get('responses', [])
        all_results = []

        for res in responses:
            if 'hits' in res and 'hits' in res['hits']:
                all_results.extend([hit['_source'] for hit in res['hits']['hits']])

        return all_results
    except Exception as e:
        logger.error(f"Error querying Elasticsearch index {index}: {e}")
        return []


def update_conversation_history(role, content):
    """
    Maintain conversation history for context-aware responses.
    """
    conversation_history.append({"role": role, "content": content})

    # Limit to the last 10 exchanges to avoid excessive memory usage
    if len(conversation_history) > 50:
        conversation_history.pop(0)


def generate_response(user_query, data):
    """
    Generate a user-friendly response based on retrieved data using OpenAI.
    """
    if not data:
        return "No relevant information was found in the database for your query."

    formatted_data = "\n".join(
        [f"{record['node1']} --[{record['relationship']}]--> {record['node2']}" for record in data[:5]]
    )

    prompt = f"""
    User Query: {user_query}

    Retrieved Data:
    {formatted_data}

    Generate a precise and insightful response based on this information.
    """

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that provides accurate answers based on database results."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.5
    )

    return response.choices[0].message.content.strip()


def route_to_chatbot(user_query):
    """
    Routes query to Neo4j first, falls back to Elasticsearch if needed, and generates a response.
    """
    predicted_labels = predict_query(user_query, model, tokenizer)

    # Extract keywords from user query
    keywords = extract_keywords(user_query)

    if not keywords:
        return "I couldn't identify any relevant keywords in your query."

    # Generate dynamic Cypher query
    cypher_query = generate_dynamic_cypher_query(keywords)

    # Attempt Neo4j search
    neo4j_results = query_neo4j(cypher_query, keywords)

    if neo4j_results:
        return generate_response(user_query, neo4j_results)

    # If Neo4j has no results, fallback to Elasticsearch
    if "PubMed" in predicted_labels:
        search_results = get_elasticsearch_results(
            index="pubmed",
            query=user_query,
            fields=["Title", "AbstractText", "PMID"]
        )
    else:
        search_results = get_elasticsearch_results(
            index="clinicaltrial",
            query=user_query,
            fields=["Study Title", "Conditions"]
        )

    return generate_response(user_query, search_results)


def main():
    user_query = "Pubmed for Malaria"
    final_response = route_to_chatbot(user_query)
    print("\nFinal Aggregated Response from Dynamic Chatbot:")
    print("BOT:", final_response)

if __name__ == "__main__":
    main()