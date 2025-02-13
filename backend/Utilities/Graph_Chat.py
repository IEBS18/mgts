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
from openai import AzureOpenAI
# from openai import OpenAI
from transformers import BertTokenizer
from langchain_community.graphs import Neo4jGraph
from langchain.chains.graph_qa.cypher import GraphCypherQAChain # cypher query madad
# from langchain_community.chat_models import ChatOpenAI
from langchain.chat_models import AzureChatOpenAI
# from langchain.llms.openai import AzureOpenAI

from dotenv import load_dotenv
# from Utilities.train_query_classifier import QueryClassifierModel
# from Utilities.utils import preprocess, create_prompt
from train_query_classifier import QueryClassifierModel
# from utils import preprocess, create_prompt
import sys
sys.stdout.reconfigure(encoding='utf-8')


# import nltk
# from nltk.tokenize import word_tokenize
# from nltk.corpus import stopwords
# from nltk.tag import pos_tag
# from nltk.chunk import ne_chunk

# # Download required resources
# nltk.download('punkt')
# nltk.download('averaged_perceptron_tagger')
# nltk.download('stopwords')
# nltk.download('maxent_ne_chunker')
# nltk.download('words')


# Load environment variables
load_dotenv()

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)
#openai response  
MODEL = "gpt-4o-mini"
chatclient = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)

neo4j_uri = os.getenv("NEO4J_URI")
neo4j_user = os.getenv("NEO4J_USER")
neo4j_password = os.getenv("NEO4J_PASSWORD")

graph = Neo4jGraph(
    neo4j_uri,
    neo4j_user,
    neo4j_password,
)

# cypher creation
client = AzureChatOpenAI(

    api_key=os.getenv("AZURE_API"),
    api_version= os.getenv("AZURE_API_VERSION"),
    model= MODEL,
    deployment_name="gpt-4o-mini-2",
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)

# #initiate the langchain openai via azure openai client
# chatclient = ChatOpenAI(
#     model=MODEL,
#     temperature=0.2,
#     openai_api_key=os.getenv("AZURE_API")
#     )

cypher_chain = GraphCypherQAChain.from_llm(
    llm=client,
    graph=graph,
    allow_dangerous_queries=True,
    allow_dangerous_requests=True,
    verbose=True
)


with open(r"query_router.pkl", "rb") as f:
    model = QueryClassifierModel()
    state_dict = pickle.load(f)
    model.load_state_dict(state_dict)
    
#Load spacy langugae model
nlp=spacy.load("en_core_web_sm")

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


# def extract_keywords_nltk(user_query):
#     """
#     Extracts keywords and named entities using NLTK.
#     """
#     words = word_tokenize(user_query)
#     words = [word for word in words if word.isalnum()]  # Remove punctuations
#     words = [word.lower() for word in words if word.lower() not in stopwords.words('english')]

#     # Extract Named Entities
#     named_entities = ne_chunk(pos_tag(words), binary=True)
#     entities = [ " ".join(w for w, t in subtree) for subtree in named_entities if hasattr(subtree, 'label') and subtree.label() == 'NE']
    
#     keywords = list(set(words + entities))
#     return keywords

# def extract_keywords(user_query):
#     """
#     Extracts Named Entities using Flair.
#     """
#     sentence = Sentence(user_query)
#     tagger.predict(sentence)
#     return [entity.text for entity in sentence.get_spans('ner')]

# def generate_dynamic_cypher_query(keywords):
#     """
#     Dynamically generate a Cypher query based on extracted keywords.
#     """
#     # Define searchable properties in Neo4j nodes
#     searchable_fields = ["Conditions", "TradeName", "Disease", "Product_Name", "ActiveIngredient"]

#     # Construct WHERE clause using extracted keywords
#     where_clauses = " OR ".join(
#         [f"toLower(n.{prop}) CONTAINS $keyword OR toLower(m.{prop}) CONTAINS $keyword"
#          for prop in searchable_fields]
#     )

#     # Generate the Cypher query
#     cypher_query = f"""
#     MATCH (n)-[r]-(m)
#     WHERE ({where_clauses})
#     RETURN n, r, m
#     LIMIT 20
#     """

#     logger.info(f"Generated Cypher Query: {cypher_query}")
#     return cypher_query

# def generate_cypher_query(user_query, keywords):
#     """
#     Use OpenAI to generate a Cypher query dynamically based on extracted keywords and query intent.
#     """
#     searchable_fields = ["Conditions", "TradeName", "Disease", "Product_Name", "ActiveIngredient"]

#     # Create a prompt for OpenAI to generate an optimized Cypher query
#     prompt = f"""
#     You are an expert in Neo4j graph databases. 
#     Generate an optimized Cypher query based on the user's request.

#     - User Query: "{user_query}"
#     - Extracted Keywords: {keywords}
#     - Available Fields in the Graph: {searchable_fields}
#     - Ensure the query retrieves relevant documents.
#     - Match nodes and relationships meaningfully.

#     Example Neo4j schema:
#     (Drug)-[:TREATS]->(Disease)
#     (Drug)-[:CONTAINS]->(ActiveIngredient)
#     (ClinicalTrial)-[:STUDIES]->(Disease)
#     (PubMedArticle)-[:MENTIONS]->(Disease)

#     Generate a precise Cypher query that retrieves the most relevant structured data.
#     """

#     try:
#         # Use OpenAI API to generate Cypher query
#         response = client.chat.completions.create(
#             model=MODEL,
#             messages=[
#                 {"role": "system", "content": "You are an expert in querying Neo4j databases."},
#                 {"role": "user", "content": prompt}
#             ],
#             max_tokens=300,
#             temperature=0.5
#         )

#         cypher_query = response.choices[0].message.content.strip()

#         logger.info(f"Generated Cypher Query from OpenAI: {cypher_query}")
#         return cypher_query

#     except Exception as e:
#         logger.error(f"Error generating Cypher query with OpenAI: {e}")
#         return None

# USING LANGCHAIN
def generate_cypher_query(user_query):
    """
    Uses LangChain’s GraphCypherQAChain to generate a Cypher query.
    """
    try:
        response_query = cypher_chain.invoke(user_query) 
        # print("response_query:", response_query) # Use invoke instead of run
        logger.info(f"Raw LangChain Response: {response_query}")

        # Validate response type and structure
        if isinstance(response_query, dict) and 'query' in response_query:
            response_query = response_query['query']
        elif isinstance(response_query, str):
            response_query = response_query.strip()
        
        if not response_query.startswith("MATCH"):
            logger.error(f"Invalid Cypher Query Generated: {response_query}")
            return None  # Prevents execution of bad queries

        logger.info(f"Valid Cypher Query: {response_query}")
        return response_query

    except Exception as e:
        logger.error(f"Error generating Cypher query with LangChain: {e}")
        return None

def query_neo4j(response_query, keywords):
    """
    Query Neo4j using the dynamically generated Cypher query.
    """
    try:
        with driver.session() as session:
            result = session.run(response_query, keyword=keywords[0].lower())
            data = [
                {
                    "node1": record["n"].id,  # Node ID of first node
                    "node1_properties": record["n"]._properties,  # Properties of first node
                    "relationship": record["r"].type,  # Relationship type
                    "node2": record["m"].id,  # Node ID of second node
                    "node2_properties": record["m"]._properties  # Properties of second node
                }
                for record in result
            ]
            logger.info(f"Retrieved {len(data)} records from Neo4j.")
            return data
    except Exception as e:
        logger.error(f"Error querying Neo4j: {e}")
        return []
    
## LANGCHAIN BASED FUNCTION--> ithe error ahe 
# def query_neo4j(cypher_query):
#     """
#     Executes a Cypher query using Neo4j and ensures it returns structured data.
#     """
#     try:
#         with driver.session() as session:
#             logger.info(f"Executing Cypher Query: {cypher_query}")

#             result = session.run(cypher_query)
#             records = result.data()

#             if not records:
#                 logger.warning("No records found in Neo4j.")
#                 return []  # Return empty list instead of None

#             structured_data = []
#             for record in records:
#                 n = record.get("n") if "n" in record else None
#                 r = record.get("r") if "r" in record else None
#                 m = record.get("m") if "m" in record else None

#                 structured_data.append({
#                     "node1": dict(n) if isinstance(n, dict) else {"name": "Unknown Node"},
#                     "relationship": r["type"] if isinstance(r, dict) and "type" in r else "Unknown Relationship",
#                     "node2": dict(m) if isinstance(m, dict) else {"name": "Unknown Node"}
#                 })

#             logger.info(f"Retrieved {len(structured_data)} records from Neo4j.")
#             return structured_data

#     except Exception as e:
#         logger.error(f"Error querying Neo4j: {e}")
#         return []


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

def format_data_for_llm(data):
    """
    Format Neo4j data into a concise string for LLM input.
    """
    if not isinstance(data, list):  # Ensure data is a list
        logger.error("Invalid data format received in format_data_for_llm.")
        return "No structured data available."

    formatted_records = []
    for record in data[:5]:  # Limit to 5 records for brevity
        if not isinstance(record, dict):  # Validate record structure
            continue
        
        node1 = record.get("node1", {"name": "Unknown Node"})
        node2 = record.get("node2", {"name": "Unknown Node"})
        relationship = record.get("relationship", "Unknown Relationship")

        # Extract key fields from nodes
        node1_summary = ", ".join([f"{key}: {value}" for key, value in node1.items()])
        node2_summary = ", ".join([f"{key}: {value}" for key, value in node2.items()])

        formatted_records.append(f"{node1_summary} --[{relationship}]--> {node2_summary}")

    formatted_output = "\n".join(formatted_records)
    logger.info(f"Formatted Data for LLM:\n{formatted_output}")
    return formatted_output

def generate_response(user_query, data):
    """
    Generates an AI-enhanced response based on retrieved Neo4j or Elasticsearch data.
    """
    if not data:
        return "No relevant information was found in the database for your query."

    # formatted_data = format_data_for_llm(data)
    response_query = cypher_chain.invoke(user_query)
    prompt = f"""
    User Query: {user_query}

    Retrieved Data:
    {response_query}

    Generate a precise and structured response based strictly on this data.
    """

    response = chatclient.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a medical knowledge assistant providing structured responses."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.9
    )

    return response.choices[0].message.content.strip()


def route_to_chatbot(user_query):
    """
    Routes user queries to the appropriate retrieval method (Neo4j or Elasticsearch).
    """
    predicted_labels = predict_query(user_query, model, tokenizer)
    keywords = extract_keywords(user_query)

    # Step 1: Use LangChain to generate and execute a Cypher query in Neo4j
    cypher_query = generate_cypher_query(user_query)

    if cypher_query:
        neo4j_results = query_neo4j(cypher_query)
        if neo4j_results:
            return generate_response(user_query, neo4j_results)

    # Step 2: If no Neo4j results, fallback to Elasticsearch
    logger.warning("No relevant data found in Neo4j. Querying Elasticsearch instead.")

    # Step 2: If no Neo4j results, fallback to Elasticsearch
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
    user_query = "Treatment for Depression"
    final_response = route_to_chatbot(user_query)
    print("\nFinal Aggregated Response from Dynamic Chatbot:")
    print("BOT:", final_response)

if __name__ == "__main__":
    main()