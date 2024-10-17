import os
from openai import OpenAI
from elasticsearch import Elasticsearch as es


openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)

# Initialize conversation history
conversation_history = []
 
# Function to get Elasticsearch results
def get_elasticsearch_results(query):
    es_query = {
        "query": {
            "multi_match": {
                "query": query,
                "fields": [
                    "Diseases",
                    "Ingredients",
                    "Organization_Name",
                    "Product_Name",
                    "Routes_of_Administration",
                    "Territory_Code"
                ]
            }
        },
        "size": 5  # Fetch the top 10 documents
    }
    result = es.search(index="drug-disease-indication", body=es_query)
    return result["hits"]["hits"]
 
# Function to create OpenAI prompt
def create_openai_prompt(results):
    context = ""
    for hit in results:
        source_fields = hit["_source"]
        # Concatenate all fields for context
        context += '\n'.join(f"{key}: {value}" for key, value in source_fields.items()) + "\n\n"
 
    prompt = f"""
  Instructions:
 
  - You are an assistant for question-answering tasks.
  - Answer questions truthfully and factually using only the context presented.
  - If you don't know the answer, just say that you don't know, don't make up an answer.
  - You must always cite the product_name where the answer was extracted using inline academic citation style [], using the position.
  - Use plain text only, no HTML or markdown.
  - provide hyperlinks to the sources of the information.
  - You are correct, factual, precise, and reliable.
 
  Context:
  {context}
 
  """
    return prompt
 
# Function to generate OpenAI completion
def generate_openai_completion(question):
   

    # Add the user question to the conversation history
    conversation_history.append({"role": "user", "content": question})

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation_history
    )

    # Extract the assistant's response
    assistant_response = response.choices[0].message.content

    # Add the assistant's response to the conversation history
    conversation_history.append({"role": "assistant", "content": assistant_response})

    return assistant_response