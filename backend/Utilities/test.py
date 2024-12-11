from elasticsearch import Elasticsearch
import pandas as pd
import os

from dotenv import load_dotenv
load_dotenv()
 
# Load environment variables
ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
ELASTIC_API_KEY = os.getenv('elasticapikey')
 
# Connect to Elasticsearch
es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY) 

def get_elasticsearch_results(index, query, fields, operator="AND"):
    es_query = [
        {'index': index},
        {
            "query": {
                "query_string": {
                    "query": query,
                    "fields": fields,
                    "default_operator": operator,
                    "fuzziness": "AUTO"
                }
            },
            "size": 10000
        }
    ]

    try:
        result = es.msearch(body=es_query)
        print("Elasticsearch response:", result)

        # Ensure responses and hits structure exists
        responses = result.get('responses', [])
        all_results = []
        for res in responses:
            if 'hits' in res and 'hits' in res['hits']:
                all_results.extend([hit['_source'] for hit in res['hits']['hits']])
            else:
                print(f"Warning: No 'hits' key in response: {res}")
        return all_results

    except Exception as e:
        print(f"Error querying Elasticsearch index {index}: {e}")
        return []

def save_to_excel(pubmed_results, clinical_results, file_name="results.xlsx"):
    with pd.ExcelWriter(file_name, engine='xlsxwriter') as writer:
        if pubmed_results:
            pubmed_df = pd.DataFrame(pubmed_results)
            pubmed_df.to_excel(writer, sheet_name='pubmed', index=False)
        if clinical_results:
            clinical_df = pd.DataFrame(clinical_results)
            clinical_df.to_excel(writer, sheet_name='clinicaltrial', index=False)

def main():
    query = input("Enter your search query: ")

    # Fetch results
    pubmed_results = get_elasticsearch_results(
        index="pubmed",
        query=query,
        fields=["Title", "AbstractText", "PMID"],
        operator="OR"
    )
    clinical_results = get_elasticsearch_results(
        index="clinicaltrial",
        query=query,
        fields=["Study Title", "Study Description", "NCT Number", "Study Status", "Conditions",
                "Interventions", "Sponsor", "Collaborators", "Study Design", "Phases"],
        operator="OR"
    )

    # Save results to Excel
    save_to_excel(pubmed_results, clinical_results)
    print(f"Results saved to results.xlsx")

if __name__ == "__main__":
    main()
