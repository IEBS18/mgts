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
from Utilities.train_query_classifier import QueryClassifierModel;
from Utilities.Graph_Chat import get_elasticsearch_results, predict_query
from Utilities.utils import preprocess, create_prompt

# Load environment variables
load_dotenv()

# OpenAI API Key
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# Neo4j connection details
neo4j_uri = os.getenv("NEO4J_URI")
neo4j_user = os.getenv("NEO4J_USER")
neo4j_password = os.getenv("NEO4J_PASSWORD")

# Elasticsearch connection details
es = Elasticsearch(
    os.getenv("ELASTICSEARCH_ENDPOINT"),
    api_key=os.getenv("ELASTICSEARCH_API_KEY")
)

# Load BERT-based Query Classifier Model
with open("Utilities/query_router.pkl", "rb") as f:
    model = QueryClassifierModel()
    state_dict = pickle.load(f)
    model.load_state_dict(state_dict)

# Load tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Initialize Neo4j driver
driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))

# Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Query Labels
label_map = {0: "PubMed", 1: "Clinical Trials", 2: "Drug-Disease Association"}

# Initialize conversation history
conversation_history = []

# Load the spaCy language model
nlp = spacy.load("en_core_web_sm")


# Extract Keywords
def extract_keywords(user_query):
    """
    Extract meaningful keywords and entities from user query using spaCy.
    """
    doc = nlp(user_query)
    entities = [ent.text for ent in doc.ents]
    keywords = [token.text for token in doc if token.pos_ in ("NOUN", "PROPN", "ADJ")]
    unique_keywords = list(set(keywords + entities))
    logger.info(f"Extracted Keywords: {unique_keywords}")
    return unique_keywords


# Generate Cypher Query for Drug Search
def generate_drug_cypher_query(drug_name):
    """
    Dynamically generate a Cypher query to fetch drug details from Neo4j.
    """
    cypher_query = f"""
    MATCH (d:Drug)-[r]-(m)
    WHERE toLower(d.TradeName) CONTAINS toLower('{drug_name}')
    RETURN d, r, m
    LIMIT 10
    """
    logger.info(f"Generated Cypher Query for Drug: {cypher_query}")
    return cypher_query


# Query Neo4j for Drug Information
def neo4j_drug_data(drug_name):
    """
    Fetch drug details from Neo4j using dynamic Cypher queries.
    """
    cypher_query = generate_drug_cypher_query(drug_name)
    try:
        with driver.session() as session:
            result = session.run(cypher_query)
            drug_data = [
                {
                    "node1": record["d"],
                    "relationship": record["r"].type,
                    "node2": record["m"]
                }
                for record in result
            ]
            logger.info(f"Retrieved {len(drug_data)} records from Neo4j.")
            return drug_data
    except Exception as e:
        logger.error(f"Error querying Neo4j for drug data: {e}")
        return []


# Query Elasticsearch for Drug Data (Fallback)
def elasticsearch_drug_data(drug_name):
    """
    Fetch drug details from Elasticsearch if Neo4j returns no results.
    """
    return get_elasticsearch_results(
        index="combined_country_drug1",
        query=drug_name,
        fields=["TradeName", "ActiveIngredient", "Efficacy", "Price", "Manufacturer"],
        operator="OR"
    )


# AI Column Generation
def generate_ai_column(drug_data, header_name, header_description):
    """
    Uses OpenAI GPT-4o to generate a value for a custom AI column based on drug data.
    """
    if not drug_data:
        return "No relevant data available."

    drug_context = "\n".join([f"{key}: {value}" for key, value in drug_data.items()])

    prompt = f"""
    User Query: Generate a value for the AI column '{header_name}'.

    Column Description: {header_description}

    Drug Information:
    {drug_context}

    Provide a concise value for '{header_name}'.
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


# Update Drug Data with AI Column
def update_drug_data(drug_list, header_name, header_description):
    """
    Adds an AI-generated column to drug data.
    """
    updated_list = []

    for drug in drug_list:
        drug_name = drug.get("TradeName", "Unknown Drug")
        print(f"Processing AI Column for Drug: {drug_name}")

        # Try fetching drug data from Neo4j
        drug_data = neo4j_drug_data(drug_name)

        # If Neo4j fails, fallback to Elasticsearch
        if not drug_data:
            drug_data = elasticsearch_drug_data(drug_name)

        # Generate AI Column Value
        ai_column_value = generate_ai_column(drug_data, header_name, header_description)

        # Append AI Column to Drug Data
        drug[header_name] = ai_column_value
        updated_list.append(drug)

    return updated_list


# Main Function
def main():
    user_query = "Find drug data for Insulin"
    header_name = "prevalence of disease"
    header_description = "What is the prevalence of the disease treated by the drug?"

    # Extract keywords and predict query type
    keywords = extract_keywords(user_query)
    predicted_labels = predict_query(user_query, model, tokenizer)

    # Fetch drug data
    drug_list = neo4j_drug_data("Insulin")

    # If Neo4j has no results, fallback to Elasticsearch
    if not drug_list:
        drug_list = elasticsearch_drug_data("Insulin")

    # Add AI Column
    updated_drug_list = update_drug_data(drug_list, header_name, header_description)

    print("\nFinal Updated Drug Data:")
    for drug in updated_drug_list:
        print(drug)


if __name__ == "__main__":
    main()
