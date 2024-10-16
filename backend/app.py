from flask import Flask, request, jsonify
import os
import json
from flask_cors import CORS
import pandas as pd


from PharmaX1.search import process_multiple_files, preprocess
from PharmaX1.reference.Models import callLLMChatBot
from llama_index.core import Document, StorageContext, VectorStoreIndex, load_index_from_storage
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding

from elasticsearch import Elasticsearch

from dotenv import load_dotenv
load_dotenv()


# Ensure NLTK resources are downloaded

app = Flask(__name__)
CORS(app)
es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

@app.route('/search', methods=['POST'])
def search():
    # Get the search keyword from the request
    search_keyword = request.json.get('keyword')
    
    query = preprocess(search_keyword)
    
    if isinstance(query, set):
        query = ' '.join(query)
    
    print(query)
    

    # Ensure the keyword is provided
    if not search_keyword:
        return jsonify({"error": "No search keyword provided."}), 400

    # Perform the search in Elasticsearch
    try:
        # response = es.search(
        #     index="drug-disease-indication",
        #     body={
        #         "query": query,
        #         "size": 10000  # Include the size parameter
        #     }
        # )
        response = es.search(index='drug-disease-indication', q= query, size=10000 )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Extract hits from the response
    hits = response['hits']['hits']
    documents = [hit['_source'] for hit in hits]
    print(documents)

    # Convert the documents to a DataFrame for easier manipulation if needed
    # df = pd.DataFrame(documents)
    
    # df.fillna("", inplace=True)
    
    
    # # Print the DataFrame for debugging purposes
    # print(df)

    # # Convert the DataFrame back to a list of dictionaries before returning
    # documents = df.to_dict(orient='records')

    # # Save the DataFrame to an Excel file
    # excel_file_path = "search_results_app.xlsx"
    # df.to_excel(excel_file_path, index=False)

    # # Ensure the Excel file is saved successfully
    # if os.path.exists(excel_file_path):
    #     print(f"Excel file saved successfully at {excel_file_path}")
    
    # print("count:", df.count())
    
    # # print(len(df))
    
    # # Print the DataFrame for debugging purposes
    # print(df)

    # Return the documents in a JSON response
    return jsonify(documents), 200

# @app.route('/search', methods=['POST'])
# def search():
#     search_keyword = request.json.get('keyword')
#     file_paths = os.listdir('Output_Files')
#     file_paths = [os.path.join('Output_Files', file) for file in file_paths]
    
#     response = es.search(index="drug-disease-indication", q=search_keyword)
#     hits = response['hits']['hits']

#     documents = [hit['_source'] for hit in hits]

#     df = pd.DataFrame(documents)
    
#     print(df)
    
#     # results, list = process_multiple_files(file_paths, search_keyword)
    
#     # os.makedirs('results' , exist_ok= True)
    
#     # results = [
#     #     {
#     #         "title": "US Budget Impact Model for Selinexor in Relapsed or Refractory Multiple Myeloma",
#     #         "journal": "Clinicoecon Outcomes Res, Vol 12",
#     #         "date": "Feb 25, 2020",
#     #         "citations": 6,
#     #         "relevantText": "Introduction Multiple myeloma (MM) is a cancer that develops as a plasma cell malignancy in the bone marrow.1 Clinical manifestations of ..."
#     #     },
#     #     {
#     #         "title": "Patterns of bisphosphonate treatment among patients with multiple myeloma treated at oncology clinics across the USA: observations from real-world data",
#     #         "journal": "Support Care Cancer, Vol 26 Issue 8",
#     #         "date": "Aug 01, 2018",
#     #         "citations": 13,
#     #         "relevantText": "CONCLUSIONS Real-world data from US indicate that many patients with multiple receive optimal therapy for bone disease ... More"
#     #     },
#     #     {
#     #         "title": "US Budget Impact Model for Selinexor in Relapsed or Refractory Multiple Myeloma",
#     #         "journal": "Clinicoecon Outcomes Res, Vol 12",
#     #         "date": "Feb 25, 2020",
#     #         "citations": 6,
#     #         "relevantText": "Introduction Multiple myeloma (MM) is a cancer that develops as a plasma cell malignancy in the bone marrow.1 Clinical manifestations of ..."
#     #     },

#     # ]
#     # with open(r'results\file_results.json', 'w') as f:
#     #     json.dump(results, f, indent=2)

#     # with open(r'results\unique_keys.json', 'w') as f:
#     #     json.dump(list, f, indent=2)
#     # return jsonify({'results': results, 'list': list}), 200
#     return 200


@app.route('/chatbot', methods=['POST'])
def chatbot():
    query = request.json.get('query')
    print(query)
    list = request.json.get('list')
    results = request.json.get('results')
    
    for rowData in results:
        
        display_key = rowData['unique_key']
        # title = rowData['title']
        persist_dir = os.path.join('./storage', display_key)

        # Check if embeddings already exist
        if os.path.exists(persist_dir):
            print(f"Embeddings for '{display_key}' already exist. Skipping creation.")
            continue  # Exit the function if embeddings exist
        
        print(f"Creating embeddings for '{display_key}'.")
        documents = [Document(text=f"{key}: {val}") for key, val in rowData.items()]
        # print(documents)
        # To store the index

        storage_context = StorageContext.from_defaults()

        VectorStoreIndex.from_documents(
            documents=documents,
            storage_context=storage_context,
            transformations=[
                SentenceSplitter(chunk_size=128, chunk_overlap=5),
                OpenAIEmbedding(),
            ]
        )
        
        storage_context.persist(persist_dir=persist_dir)

    
            
    response = callLLMChatBot(list, query)
    # print(list)
    return jsonify({'results': response, 'list': list}), 200

if __name__ == '__main__':
    app.run(debug=True)
