import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import json
import os

# Ensure NLTK resources are downloaded
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')

def preprocess(text):
    """
    Preprocess the input text by tokenizing, converting to lowercase,
    removing stop words and non-alphanumeric tokens.
    """
    # Tokenize and convert to lowercase
    tokens = word_tokenize(text.lower())
    # Define stop words
    stop_words = set(stopwords.words('english'))
    # Filter tokens
    filtered = [word for word in tokens if word.isalnum() and word not in stop_words]
    
    # remove generic words
    toremove = [
        'mg', 'ml', 'oral', 'tablet', 'tablets', 'capsule', 'capsules', 'solution', 'suspension', 
        'injection', 'injections', 'inhalation', 'inhaler', 'inhalers', 'drug', 'drugs', 'medication', 
        'medications', 'medicine', 'medicines', 'treatment', 'treatments', 'therapy', 'therapies', 
        'dose', 'doses', 'dosage', 'dosages', 'administration', 'acid', 'acids', 'documents', 
        'document', 'information', 'patient', 'patients', 'report', 'reports', 'study', 'studies', 
        'result', 'results', 'data', 'file', 'files', 'details', 'description', 'content', 
        'publication', 'publications', 'article', 'articles', 'reference', 'references', 'content', 
        'version', 'versions', 'test', 'tests', 'trial', 'trials', 'method', 'methods', 'system', 
        'systems', 'evaluation', 'evaluations', 'protocol', 'protocols', 'dose', 'level', 'levels', 
        'standard', 'standards', 'procedures', 'review', 'reviews', 'procedure', 'objectives', 
        'objective', 'category', 'categories', 'class', 'classes', 'group', 'groups', 'show',
        
        # Add more generic words to remove
        'regarding', 'about', 'concerning', 'related', 'associated', 'in', 'on', 'by', 'of', 
        'with', 'to', 'from', 'as', 'for', 'and', 'the', 'a', 'an', 'that', 'this', 'these', 
        'those', 'which', 'such', 'any', 'all', 'each', 'many', 'much', 'other', 'others', 
        'more', 'few', 'overview', 'insights', 'analysis', 'guidelines', 'effects', 'factors', 
        'methods', 'results', 'research', 'data', 'researchers', 'patients', 'trials', 
        'studies', 'criteria', 'conclusions', 'summary', 'implications', 'applications', 
        'results', 'evidence', 'findings', 'presentation', 'exploration',
        
        # Expanded terms
        'chemical', 'chemicals', 'compound', 'compounds', 'substance', 'substances', 
        'formula', 'formulas', 'properties', 'property', 'characteristics', 
        'characteristic', 'composition', 'components', 'component', 'ingredients', 
        'ingredient', 'mechanism', 'mechanisms', 'action', 'actions', 'impact', 
        'effects', 'administration', 'route', 'routes', 'indication', 'indications', 
        'usage', 'usage', 'use', 'uses', 'recommendations', 'recommendation', 
        'safety', 'safeness', 'risk', 'risks', 'adverse', 'reactions', 'reaction', 
        'efficacy', 'efficacious', 'benefit', 'benefits', 'review', 'evaluation', 
        'evaluation', 'implication', 'implications', 'impact', 'clinical', 'clinical trials', 
        'clinical data', 'guidance', 'findings', 'treatment', 'treatment options',
        
        # Miscellaneous terms
        'criteria', 'finding', 'suggestions', 'suggestion', 'analyses', 'analysis', 
        'clinical', 'clinical findings', 'support', 'supports', 'considerations', 
        'consideration', 'context', 'situations', 'case', 'cases', 'history', 
        'pathway', 'pathways', 'evaluation', 'measure', 'measurement', 'recommend', 
        'effectiveness', 'guide', 'reporting', 'results', 'summary', 'future', 'studies',
        
        # General filler words
        'also', 'but', 'or', 'if', 'then', 'however', 'meanwhile', 'during', 
        'after', 'before', 'although', 'while', 'despite', 'since', 'unless', 
        'yet', 'so', 'therefore', 'thus', 'hence', 'but', 'although', 'where', 
        'when', 'which', 'that', 'is', 'are', 'was', 'were', 'be', 'been',
        
        'advantage', 'advantages', 'disadvantage', 'disadvantages', 'pros', 'cons', 
        'benefit', 'benefits', 'drawback', 'drawbacks', 'merit', 'merits', 'downside', 
        'downsides', 'upside', 'upsides', 'positive', 'negatives', 'negative', 'impact', 
        'outcome', 'outcomes', 'effect', 'effects',
    ]
    
    filtered = [word for word in filtered if word not in toremove]
    
    return set(filtered)

def search_excel(file_path, user_query, results=None):
    """
    Search the Excel/CSV file for rows matching the user query.
    
    Parameters:
    - file_path: Path to the Excel or CSV file.
    - user_query: The search query input by the user.
    
    Returns:
    - A JSON-formatted string with matching rows and their details.
    - A list of unique keys from the file.
    """
    # Read file (CSV or Excel)
    try:
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path, engine='openpyxl')
        elif file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            raise ValueError("Unsupported file format. Please use Excel or CSV files.")
    except Exception as e:
        return json.dumps({"error": str(e)}), set()

    # Preprocess user query
    query_tokens = preprocess(user_query)
    
    matching_rows = []
    unique_keys = set()

    # Iterate over DataFrame rows
    for index, row in df.iterrows():
        # Concatenate all string-type columns for searching
        row_text = ' '.join(str(item) for item in row if isinstance(item, str))
        row_tokens = preprocess(row_text)

        # Check if all query tokens are present in the row
        if query_tokens.issubset(row_tokens):
            # Convert row to dictionary
            row_dict = row.to_dict()
            # replace nan values with empty strings
            row_dict = {k: '' if pd.isna(v) else v for k, v in row_dict.items()} 
            
            # Add index to the dictionary
            row_dict['index'] = index
            matching_rows.append(row_dict)
            if results is not None:
                results.append(row_dict)

            # Add unique keys (assuming the key is a specific column, like 'ID' or 'Key')
            unique_keys.update([row_dict.get('unique_key', '')])

    # Convert the list of dictionaries to JSON format
    return json.dumps(matching_rows, indent=2), unique_keys

def process_multiple_files(file_paths, user_query):
    """
    Process multiple Excel/CSV files and return:
    - JSON results for each file.
    - A single unique key list from all files.
    
    Parameters:
    - file_paths: A list of file paths (Excel or CSV).
    - user_query: The search query.
    
    Returns:
    - A dictionary with file-wise JSON results and a combined unique key list.
    """
    # results = {}
    results = []
    combined_unique_keys = set()

    for file_path in file_paths:
        # Perform search for each file
        result_json, unique_keys = search_excel(file_path, user_query, results)
        # Save the result for the file
        # file_name = os.path.basename(file_path)
        # results[file_name] = json.loads(result_json)
        # results.append(json.loads(result_json))
        # Combine unique keys from all files
        combined_unique_keys.update(unique_keys)

    # Return JSON results for each file and the combined unique key list
    return results, list(combined_unique_keys)

# Example Usage
if __name__ == "__main__":
    
    # List of Excel/CSV file paths
    # file_paths = [
    #     r'data\file1.xlsx',
    #     r'data\file2.csv'
    # ]

    file_paths = os.listdir('Output_Files')
    file_paths = [os.path.join('Output_Files', file) for file in file_paths]
    
    # User query
    user_query = "LACTOSE MONOHYDRATE medicines"

    # Process files
    file_results, unique_key_list = process_multiple_files(file_paths, user_query)

    # Save the JSON results and unique key list
    with open(r'results\file_results.json', 'w') as f:
        json.dump(file_results, f, indent=2)

    with open(r'results\unique_keys.json', 'w') as f:
        json.dump(unique_key_list, f, indent=2)

    # Print unique keys
    print("Unique Keys from all files:", unique_key_list[:10], "...")
