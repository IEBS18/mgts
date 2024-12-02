import os
import torch
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from openai import OpenAI
from transformers import BertTokenizer
from dotenv import load_dotenv
load_dotenv()

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')


# from diseasechatbot import generate_openai_completion
from Utilities.train_query_classifier import QueryClassifierModel  
MODEL = "gpt-4o-mini"

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

with open("query_router.pkl", "rb") as f:
    model = pickle.load(f)
print(model)

with open("tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)
print(tokenizer)

model.eval()

context = []
conversation_history = []
disease_conversation_history = []
keys = [
    'TradeName',
    'Active Ingredient',
    'Manufacturer',
    'Size',
    'Price',
    'Quality_of_Life',
    'Efficacy',
    'Safety',
    'Adverse_Events',
    'Annual_Therapy_Costs',
    'Type_of_Drug',
    'Country'
]

# def pubmed_chatbot(query):
#     return f"PubMed chatbot response for query: '{query}'"

# def clinical_trials_chatbot(query):
#     return f"Clinical Trials chatbot response for query: '{query}'"

# def drug_disease_association_chatbot(query):
#     return f"Drug-Disease Association chatbot response for query: '{query}'"

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

def filter_keys(input_list, keys_to_keep):
    filtered_list = []
    for item in input_list:
        filtered_dict = {key: item[key] for key in keys_to_keep if key in item}
        filtered_list.append(filtered_dict)
    return filtered_list   


#function for elastic search for pubmed
def get_elasticsearch_results_pubmed(query):
    es_query = [
        # Query for categorix_v2 (specific fields: title, abstract)
        {"index": "pubmed"},
        {
            "query": {
                "query_string": {
                    "query": query,
                    # "fields": ["title", "abstract"],
                    "default_operator": "OR",  # Search only in title and abstract fields
                    "fuzziness": "AUTO"  # Adding fuzziness
                }
            },
            "size": 10000
        }
    ]


def get_elasticsearch_results_clinical(query):
    es_query = [
        # Query for categorix_v2 (specific fields: title, abstract)
        {"index": "clinicaltrial"},
        {
            "query": {
                "query_string": {
                    "query": query,
                    # "fields": ["title", "abstract"],
                    "default_operator": "OR",  # Search only in title and abstract fields
                    "fuzziness": "AUTO"  # Adding fuzziness
                }
            },
            "size": 10000
        }
    ]
def preprocess(text, dn):
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
        'disease', 'diseases',
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
        'also', 'but', 'or', 'if', 'then', 'however', 'meanwhile', 'during', 'want',
        'after', 'before', 'although', 'while', 'despite', 'since', 'unless',
        'yet', 'so', 'therefore', 'thus', 'hence', 'but', 'although', 'where',
        'when', 'which', 'that', 'is', 'are', 'was', 'were', 'be', 'been',
       
        'advantage', 'advantages', 'disadvantage', 'disadvantages', 'pros', 'cons',
        'benefit', 'benefits', 'drawback', 'drawbacks', 'merit', 'merits', 'downside',
        'downsides', 'upside', 'upsides', 'positive', 'negatives', 'negative', 'impact',
        'outcome', 'outcomes', 'effect', 'effects',
    ]
   
    filtered = [word for word in filtered if word not in toremove]
    filtered.append(dn)
   
    return set(filtered)
 

# def dynamic_chatbot(query, responses):
#     aggregated_response = f"Query: '{query}'\n"
#     aggregated_response += "Here are the responses from the relevant sources:\n"
    
#     for response in responses:
#         aggregated_response += f"- {response}\n"
    
#     return aggregated_response
## SOURCE QUOTATION
def clinicallink(nctid):
    return "https://clinicaltrials.gov/study/" + str(nctid)

def pubmedlink(pmid):
    return "https://pubmed.ncbi.nlm.nih.gov/" + str(pmid)

# Function to generate OpenAI completion
def generate_openai_completion(question):
   

    # Add the user question to the conversation history
    disease_conversation_history.append({"role": "user", "content": question})

    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=disease_conversation_history
    )

    # Extract the assistant's response
    assistant_response = response.choices[0].message.content

    # Add the assistant's response to the conversation history
    disease_conversation_history.append({"role": "assistant", "content": assistant_response})

    return assistant_response

def route_to_chatbot(user_query, search_results, predicted_indices):
    predicted_labels = predict_query(user_query, model, tokenizer, label_map=label_map)
    print("Predicted Labels:", predicted_labels)
    
    search_results = {'diseaseData':[{}], 'drugData':[{},{},{}]}
    diseasename = search_results['diseaseData'][0]['Disease']
        # for label in predicted_labels:
    #     if label == "PubMed":
    #         responses.append(pubmed_chatbot(user_query))
    #     elif label == "Clinical Trials":
    #         responses.append(clinical_trials_chatbot(user_query))
    #     elif label == "Drug-Disease Association":
    #         responses.append(drug_disease_association_chatbot(user_query))
    for label in predicted_labels:
        if label== 'PubMed' :
            user_query=preprocess(user_query, diseasename)
            pubmedresults=get_elasticsearch_results_pubmed(user_query)
            search_results['pubmedData'] = pubmedresults
    # if predicted_labels contains 0:
    #   pubmedresults = es.msearch(processed(user_query), data=pubmed)
            # search_results['pubmedData'] = pubmedresults
            return pubmedresults
    #   pmids = extractpmid(pubmedresults)
        elif label =='Clinical Trials':
            user_query=preprocess(user_query, diseasename)
            clinicalresults=get_elasticsearch_results_clinical(user_query)
            search_results['pubmedData'] = clinicalresults

            return clinicalresults
        
    response= process_question(search_results, user_query, conversation_history)
    return response


    # if predicted_labels contains 1:
    #   clinicalresults = es.msearch(processed(user_query), data=clinicaltrials)
    #   search_results['clinicalData'] = clinicalresults
    #   nctids = extractnctid(clinicalresults)
    
    # response = process_question(search_results, user_query, conversation_history)
    # response += showsources(pmid,nctid)
    
    # return response
def process_question(results, question, conversation_history):
    
    # Create an OpenAI prompt using the search results
    context_prompt = create_prompt(results)
    # strlength = len(context_prompt)
    # print(context_prompt, strlength)
    # Check if the system prompt is already in the last 10 items of conversation history
    # if any(item["role"] == "system" for item in conversation_history[-10:]):
    #     presentinlast10 = True
    # else:
    #     presentinlast10 = False
    #     conversation_history.append({"role": "system", "content": context_prompt})
    #     print("added system context.")
        # Generate an OpenAI completion for the user question
    conversation_history.append({"role": "system", "content": context_prompt})
    answer = generate_openai_completion(question)
    return answer
    # def process_question(results, question, conversation_history):
    #   context_prompt = create_prompt(results)
    #   conversation_history.append({"role": "system", "content": context_prompt})
    #   answer = generate_openai_completion(question)   ## NO CHANGE IN THIS FUNC.
    #   return answer
    
    # def create_prompt(search_results):
    #   disease_data = search_results['diseaseData'][0]
    #   disease_context = creatediseasecontext(disease_data)
    #   drug_data = search_results['drugData']
    #   filtered_drug_data = filter_keys(drug_data, keys)
    #   drug_context = createdrugcontext(drug_data)
    #   disease_name = disease_data['Disease']
    #   final_prompt = f"blah blah {diseaseName} blah blah we have disease data"
    #   final_prompt += disease_context
    #   final_prompt += "blah blah we have drug data "
    #   final_prompt += drug_context
    #   usePubMed = False
    #   useClinical = False
    #   if search_result.key() contains pubmedData:
    #       usePubMed = True
    #       pubmedData = search_results['pubmedData']
    #       pubmed_context = createpubmedcontext(pubmedData)
    #       final_prompt += " blah blah we have pubmed data"
    #       final_prompt += pubmed_context
    
    #   if search_result.key() contains clinicalData:
    #       useClinical = True
    #       ClinicalData = search_results['ClinicalData']   
    #       clinical_context = createclinicalcontext(clinicalData)
    #       final_prompt += " blah blah we have clinical data"
    #       final_prompt += clinical_context
    
    
    #   final_prompt += " blah blah dont hallucinate , answer user query"
    #   return final_prompt


def create_prompt(search_results):
    """
    Create a comprehensive OpenAI prompt based on the search results.

    Parameters:
        search_results: A dictionary containing data for disease, drug, PubMed, and clinical trials.

    Returns:
        str: A formatted OpenAI prompt string.
    """
    disease_data = search_results.get('diseaseData', [{}])[0]
    disease_context = creatediseasecontext(disease_data)
    disease_name = disease_data.get('Disease', 'Unknown Disease')

    drug_data = search_results.get('drugData', [])
    filtered_drug_data = filter_keys(drug_data, keys)
    drug_context = createdrugcontext(filtered_drug_data)

    final_prompt = (
        f"You are a highly knowledgeable assistant specializing in rare diseases, novel drug treatments, and clinical research.\n\n"
        f"Disease Information for '{disease_name}':\n\n{disease_context}\n\n"
        f"Drug Information:\n\n{drug_context}\n\n"
    )

    if 'pubmedData' in search_results:
        pubmed_context = createpubmedcontext(search_results['pubmedData'])
        final_prompt += f"PubMed Articles:\n\n{pubmed_context}\n\n"

    if 'clinicalData' in search_results:
        clinical_context = createclinicalcontext(search_results['clinicalData'])
        final_prompt += f"Clinical Trials Information:\n\n{clinical_context}\n\n"

    final_prompt += (
        "Please use the above data to answer the user's query accurately and factually. "
        "Do not hallucinate information or provide responses outside the context of the data provided."
    )

    return final_prompt

def createpubmedcontext(pubmed_data):
    """
    Create an OpenAI prompt using PubMed article data.

    Parameters:
        pubmed_data: A list of PubMed articles retrieved from Elasticsearch.

    Returns:
        str: A formatted string that explains the PubMed data and attributes for OpenAI.
    """
    if not pubmed_data:
        return "No PubMed data available for this query."

    pubmed_context_prompt = (
    """"You are a highly knowledgeable assistant specializing in biomedical literature. Below is the context data regarding scientific publications from PubMed. Use this data to answer user queries effectively.\n\n"
    "Explanation of PubMed Data Keys:\n"
    "Pubmed" data: Involves scientific publications, with attributes like "PMID", "Title", "AbstractText", "Author Name", "Country", "Journal Issue", "PubDate", "ISSN", "ISSN Type" and "type".
    the details of each attribute is given below:
    ['PMID':A unique identifier assigned to each article in the PubMed database. It is a numeric code that allows for easy referencing and retrieval of the specific article.
    'Title':The title of the research article. It provides a brief description of the main topic or findings of the study and is often the first element that researchers and readers will look at.
    'AbstractText':A summary of the research article that includes the main objectives, methods, results, and conclusions. The abstract is designed to give readers a quick overview of the study's content and significance.
    'Author Name':The names of the authors who contributed to the research article. This attribute may include multiple names and is essential for crediting those who conducted the research.
    'Country':The country where the research was conducted or where the authors are based. This information can be important for understanding the geographical context of the study and its implications.
    'Journal Issue':The specific issue of the journal in which the article was published, typically including the volume and issue number. This attribute helps in locating the article within the journal's archive.
    'PubDate':The date when the article was published. This information is crucial for referencing and understanding the timeliness of the research.
    'ISSN':A unique code used to identify the journal in which the article was published. The ISSN helps in distinguishing between different serial publications and is essential for library cataloging.
    'ISSN Type':Indicates whether the ISSN is for the print version, the electronic version, or both. This information is helpful for understanding how the journal is available to readers.
    'type':The classification type is pubmed.]"""
    )

    pubmed_context_prompt += "PubMed Articles:\n\n"
    for idx, article in enumerate(pubmed_data, start=1):
        source = article.get('_source', {})
        pmid = source.get('PMID', 'No PMID provided.')
        title = source.get('Title', 'No title available.')
        abstract = source.get('AbstractText', 'No abstract available.')
        authors = source.get('Author Name', 'No authors listed.')
        country = source.get('Country', 'Country not specified.')
        journal_issue = source.get('Journal Issue', 'Journal issue not specified.')
        pub_date = source.get('PubDate', 'Publication date not provided.')
        issn = source.get('ISSN', 'No ISSN provided.')
        issn_type = source.get('ISSN Type', 'ISSN type not specified.')
        article_type = source.get('type', 'Not classified.')

        pubmed_context_prompt += (
            f"{idx}. Title: {title}\n"
            f"   - PMID: {pmid}\n"
            f"   - AbstractText: {abstract}\n"
            f"   - Author Name: {authors}\n"
            f"   - Country: {country}\n"
            f"   - Journal Issue: {journal_issue}\n"
            f"   - PubDate: {pub_date}\n"
            f"   - ISSN: {issn} (Type: {issn_type})\n"
            f"   - type: {article_type}\n\n"
        )

    # Final instructions to OpenAI
    pubmed_context_prompt += (
        "Please use the above data to answer user queries factually and concisely. Do not hallucinate information or provide responses outside the context of the data provided.\n"
    )

    return pubmed_context_prompt



def createclinicalcontext(clinical_data):
    """
    Create an OpenAI prompt using clinical trial data.

    Parameters:
        clinical_data: A list of clinical trial records retrieved from Elasticsearch or any data source.

    Returns:
        str: A formatted string that explains the clinical trial data and attributes for OpenAI.
    """
    if not clinical_data:
        return "No clinical trial data available for this query."

    clinical_context_prompt = (
       """ "You are a highly knowledgeable assistant specializing in clinical trials. Below is the context data regarding clinical trial information. Use this data to answer user queries effectively.\n\n"
        "Clinicaltrial" data: Refers to clinical trial information with attributes such as "NCT Number", "Study Status", "Study Title", "Brief Summary", "Study Results", "Conditions", "Interventions", "Sponsor", "Collaborators", "Sex", "Age", "Phases", "Enrollment", "Study Type", "Study Design", "Other IDs", "Start Date", "Primary Completion Date", "Completion Date", "First Posted", "Last Update Posted", "Locations" and "type".
    
    The details of the attributes are:
    ['Primary Completion Date': The date when the last participant's last visit occurred, marking the completion of the primary endpoint data collection.
    'Study Title': The title of the clinical trial, describing its focus or objective.
    'Study Status': The current status of the clinical trial (e.g., Recruiting, Completed, Terminated).
    'Sex': The sex of the participants eligible for the trial (e.g., male, female, both).
    'Locations': The sites where the clinical trial is conducted.
    'Sponsor': The organization or entity that initiates, manages, or finances the clinical trial.
    'Completion Date': The actual date when the trial was completed.
    'Study Results': Findings or outcomes from the clinical trial.
    'Conditions': The medical conditions being studied in the trial.
    'Study Description': A detailed overview of the study's objectives, design, and methodology.
    'Brief Summary': A concise summary of the study's purpose and design.
    'Interventions': The treatments, drugs, or procedures being tested in the trial.
    'Phases': The different stages of the clinical trial (e.g., Phase 1, Phase 2, Phase 3).
    'Start Date': The date when the trial commenced.
    'Other IDs': Additional identifiers related to the trial, which may include registry numbers or codes.
    'First Posted': The date when the trial information was first made publicly available.
    'Enrollment': The number of participants recruited for the trial.
    'NCT Number': The unique identifier assigned to the trial in the ClinicalTrials.gov registry.
    'Study Design': The overall plan or structure of the clinical trial.
    'Last Update Posted': The date of the most recent update to the trial information.
    'Collaborators': Other organizations or entities that are involved in the trial.
    'Age': The age range of participants eligible for the trial.
    'Study Type': The nature of the study (e.g., observational, interventional).
    'type': The classification type is clinicaltrial.]"""
    )

    clinical_context_prompt += "Clinical Trial Information:\n\n"
    for idx, trial in enumerate(clinical_data, start=1):
        source = trial.get('_source', {})
        nct_number = source.get('NCT Number', 'No NCT Number provided.')
        study_title = source.get('Study Title', 'No title available.')
        study_status = source.get('Study Status', 'No status provided.')
        brief_summary = source.get('Brief Summary', 'No brief summary available.')
        study_results = source.get('Study Results', 'No results available.')
        conditions = source.get('Conditions', 'No conditions listed.')
        interventions = source.get('Interventions', 'No interventions listed.')
        sponsor = source.get('Sponsor', 'No sponsor provided.')
        collaborators = source.get('Collaborators', 'No collaborators listed.')
        sex = source.get('Sex', 'No sex information provided.')
        age = source.get('Age', 'No age range specified.')
        phases = source.get('Phases', 'No phase information provided.')
        enrollment = source.get('Enrollment', 'No enrollment information provided.')
        study_type = source.get('Study Type', 'No study type provided.')
        study_design = source.get('Study Design', 'No study design provided.')
        primary_completion_date = source.get('Primary Completion Date', 'No primary completion date provided.')
        start_date = source.get('Start Date', 'No start date provided.')
        completion_date = source.get('Completion Date', 'No completion date provided.')
        first_posted = source.get('First Posted', 'No first posted date provided.')
        last_update_posted = source.get('Last Update Posted', 'No last update posted date provided.')
        locations = source.get('Locations', 'No location information provided.')
        other_ids = source.get('Other IDs', 'No other IDs provided.')
        trial_type = source.get('type', 'Not classified.')

        clinical_context_prompt += (
            f"{idx}. Study Title: {study_title}\n"
            f"   - NCT Number: {nct_number}\n"
            f"   - Study Status: {study_status}\n"
            f"   - Brief Summary: {brief_summary}\n"
            f"   - Study Results: {study_results}\n"
            f"   - Conditions: {conditions}\n"
            f"   - Interventions: {interventions}\n"
            f"   - Sponsor: {sponsor}\n"
            f"   - Collaborators: {collaborators}\n"
            f"   - Sex: {sex}\n"
            f"   - Age: {age}\n"
            f"   - Phases: {phases}\n"
            f"   - Enrollment: {enrollment}\n"
            f"   - Study Type: {study_type}\n"
            f"   - Study Design: {study_design}\n"
            f"   - Primary Completion Date: {primary_completion_date}\n"
            f"   - Start Date: {start_date}\n"
            f"   - Completion Date: {completion_date}\n"
            f"   - First Posted: {first_posted}\n"
            f"   - Last Update Posted: {last_update_posted}\n"
            f"   - Locations: {locations}\n"
            f"   - Other IDs: {other_ids}\n"
            f"   - type: {trial_type}\n\n"
        )

    clinical_context_prompt += (
        "Please use the above data to answer user queries factually and concisely. Do not hallucinate information or provide responses outside the context of the data provided.\n"
    )

    return clinical_context_prompt



def createdrugcontext(drug_data):
    """
    Create a structured context for drug information.

    Parameters:
        drug_data: A list of dictionaries containing drug-related data.

    Returns:
        str: A formatted string that explains the drug data and attributes for OpenAI.
    """
    if not drug_data:
        return "No drug information available for this query."

    drug_context_prompt = (
        "You are a highly knowledgeable assistant specializing in pharmacology and drug information. Below is the context data regarding drugs used for treating specific diseases. Use this data to answer user queries effectively.\n\n"
        "Explanation of Drug Data Keys:\n"
        "- **TradeName**: Commercial or brand name of the drug.\n"
        "- **Active Ingredient**: The main active pharmaceutical compound in the drug.\n"
        "- **Type_of_Drug**: Classification of the drug (e.g., small molecule, monoclonal antibody).\n"
        "- **Disease**: The condition(s) the drug is intended to treat.\n"
        "- **Country**: Country where the drug information is most applicable or where the drug is available.\n"
        "- **Symptoms**: Symptoms targeted or alleviated by this drug.\n"
        "- **Efficacy**: Effectiveness metrics, such as response rate or clinical outcomes.\n"
        "- **Safety**: Safety considerations and overall safety profile.\n"
        "- **Adverse_Events**: Possible side effects and adverse reactions from taking the drug.\n"
        "- **Manufacturer**: The company that produces the drug.\n"
        "- **Age_Group**: Age group for which the drug is most suitable.\n"
        "- **Gender**: Demographic information on which gender is more affected or targeted.\n"
        "- **Morbidity**: Morbidity rates associated with the disease treated by the drug.\n"
        "- **Mortality**: Mortality rate associated with the disease or drug.\n"
        "- **Annual_Therapy_Costs**: Estimated yearly cost of the therapy (Convert the currency mentioned in USD, and return in USD only).\n"
        "- **Price**: Price per unit of the medication strictly in USD.\n"
        "- **Quality_of_Life**: Impact of the drug on the patient's quality of life.\n"
        "- **Size**: Packaging information, such as dosage and form (e.g., capsules, vials).\n\n"
    )

    drug_context_prompt += "Drug Information:\n\n"
    for idx, drug in enumerate(drug_data, start=1):
        trade_name = drug.get('TradeName', 'No trade name provided.')
        active_ingredient = drug.get('Active Ingredient', 'No active ingredient provided.')
        drug_type = drug.get('Type_of_Drug', 'No drug type specified.')
        disease = drug.get('Disease', 'No disease information provided.')
        country = drug.get('Country', 'No country specified.')
        symptoms = drug.get('Symptoms', 'No symptoms specified.')
        efficacy = drug.get('Efficacy', 'No efficacy data available.')
        safety = drug.get('Safety', 'No safety data available.')
        adverse_events = drug.get('Adverse_Events', 'No adverse events specified.')
        manufacturer = drug.get('Manufacturer', 'No manufacturer specified.')
        age_group = drug.get('Age_Group', 'No age group specified.')
        gender = drug.get('Gender', 'No gender specified.')
        morbidity = drug.get('Morbidity', 'No morbidity data available.')
        mortality = drug.get('Mortality', 'No mortality data available.')
        annual_therapy_costs = drug.get('Annual_Therapy_Costs', 'No annual therapy costs provided.')
        price = drug.get('Price', 'No price information available.')
        quality_of_life = drug.get('Quality_of_Life', 'No quality of life data available.')
        size = drug.get('Size', 'No packaging information provided.')

        drug_context_prompt += (
            f"{idx}. Trade Name: {trade_name}\n"
            f"   - Active Ingredient: {active_ingredient}\n"
            f"   - Type of Drug: {drug_type}\n"
            f"   - Disease: {disease}\n"
            f"   - Country: {country}\n"
            f"   - Symptoms: {symptoms}\n"
            f"   - Efficacy: {efficacy}\n"
            f"   - Safety: {safety}\n"
            f"   - Adverse Events: {adverse_events}\n"
            f"   - Manufacturer: {manufacturer}\n"
            f"   - Age Group: {age_group}\n"
            f"   - Gender: {gender}\n"
            f"   - Morbidity: {morbidity}\n"
            f"   - Mortality: {mortality}\n"
            f"   - Annual Therapy Costs: {annual_therapy_costs}\n"
            f"   - Price: {price}\n"
            f"   - Quality of Life: {quality_of_life}\n"
            f"   - Size: {size}\n\n"
        )

    drug_context_prompt += (
        "Please use the above data to answer user queries factually and concisely. "
        "Do not hallucinate information or provide responses outside the context of the data provided.\n"
    )

    return drug_context_prompt


def creatediseasecontext(disease_data):
    """
    Create a structured context for disease information.

    Parameters:
        disease_data: A dictionary containing disease-related information.

    Returns:
        str: A formatted string that explains the disease data and attributes for OpenAI.
    """
    if not disease_data:
        return "No disease information available for this query."

    disease_context_prompt = (
        "You are a highly knowledgeable assistant specializing in medical diseases and treatments. Below is the context data regarding a specific disease. Use this data to answer user queries effectively.\n\n"
        "Explanation of Disease Data Keys:\n"
        "- **Disease**: Name of the disease being described.\n"
        "- **Disease Overview**: Provides a general description of the disease, including its definition and basic details.\n"
        "- **Disease Biology**: In-depth biological background of the disease, including the molecular basis and pathology.\n"
        "- **Pathophysiology**: Explains how the disease develops, detailing the physiological changes it causes.\n"
        "- **Signs & Symptoms**: Lists symptoms that patients typically experience.\n"
        "- **Risk Factors**: Factors that increase a person's chance of getting the disease.\n"
        "- **Prevalence**: Information about how common the disease is in the population.\n"
        "- **Patient Demographics**: Characteristics of people most likely to develop the disease.\n"
        "- **Diagnosis**: How the disease is identified, including tests and evaluations.\n"
        "- **Stages progression**: Details any progression phases that the disease might have.\n"
        "- **Sub-types**: Possible subtypes or variations of the disease.\n"
        "- **Treatment & Management**: General approaches for treating and managing the disease.\n"
        "- **Treatment options**: Specific therapies used for treating the disease.\n"
        "- **Unmet Needs**: Unaddressed medical requirements for the disease.\n"
        "- **Document**: Name of the source document for this context.\n\n"
    )

    disease_context_prompt += "Disease Information:\n\n"
    disease_name = disease_data.get("Disease", "No disease name provided.")
    disease_overview = disease_data.get("Disease Overview", "No overview available.")
    disease_biology = disease_data.get("Disease Biology", "No biological background provided.")
    pathophysiology = disease_data.get("Pathophysiology", "No pathophysiology data available.")
    signs_symptoms = disease_data.get("Signs & Symptoms", "No symptoms provided.")
    risk_factors = disease_data.get("Risk Factors", "No risk factors provided.")
    prevalence = disease_data.get("Prevalence", "No prevalence data available.")
    patient_demographics = disease_data.get("Patient Demographics", "No demographic data provided.")
    diagnosis = disease_data.get("Diagnosis", "No diagnostic methods provided.")
    stages_progression = disease_data.get("Stages progression", "No progression data provided.")
    sub_types = disease_data.get("Sub-types", "No sub-types listed.")
    treatment_management = disease_data.get("Treatment & Management", "No management strategies provided.")
    treatment_options = disease_data.get("Treatment options", "No treatment options available.")
    unmet_needs = disease_data.get("Unmet Needs", "No unmet needs specified.")
    document = disease_data.get("Document", "No source document provided.")

    disease_context_prompt += (
        f"- **Disease**: {disease_name}\n"
        f"- **Disease Overview**: {disease_overview}\n"
        f"- **Disease Biology**: {disease_biology}\n"
        f"- **Pathophysiology**: {pathophysiology}\n"
        f"- **Signs & Symptoms**: {signs_symptoms}\n"
        f"- **Risk Factors**: {risk_factors}\n"
        f"- **Prevalence**: {prevalence}\n"
        f"- **Patient Demographics**: {patient_demographics}\n"
        f"- **Diagnosis**: {diagnosis}\n"
        f"- **Stages progression**: {stages_progression}\n"
        f"- **Sub-types**: {sub_types}\n"
        f"- **Treatment & Management**: {treatment_management}\n"
        f"- **Treatment options**: {treatment_options}\n"
        f"- **Unmet Needs**: {unmet_needs}\n"
        f"- **Document**: {document}\n\n"
    )

    disease_context_prompt += (
        "Please use the above data to answer user queries factually and concisely. "
        "Do not hallucinate information or provide responses outside the context of the data provided.\n"
    )

    return disease_context_prompt

        

    
    # responses = []
    # for label in predicted_labels:
    #     if label == "PubMed":
    #         responses.append(pubmed_chatbot(user_query))
    #     elif label == "Clinical Trials":
    #         responses.append(clinical_trials_chatbot(user_query))
    #     elif label == "Drug-Disease Association":
    #         responses.append(drug_disease_association_chatbot(user_query))
    
    # final_response = dynamic_chatbot(user_query, responses)
    # return final_response
if __name__=="__main__":

    user_query = input("Enter your query: ")
    predicted_labels = predict_query(user_query, model, tokenizer, label_map=label_map)

    print("Predicted Labels:", predicted_labels)

    final_response = route_to_chatbot(user_query)
    print("\nFinal Aggregated Response from Dynamic Chatbot:")
    print(final_response)
