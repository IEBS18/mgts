import os
import re
import sys
from dotenv import load_dotenv
from openai import AzureOpenAI
from elasticsearch import Elasticsearch

sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)

MODEL = "gpt-4o-mini"


# Example in-memory drug data
DRUG_DATA = [
    {
        "Drug": "Aspirin",
        "Safety": "Mild risk of stomach irritation and bleeding with prolonged use.",
        "Efficacy": "Effective at reducing pain, fever, and inflammation. Can prevent blood clots."
    },
    {
        "Drug": "Ibuprofen",
        "Safety": "Can cause gastrointestinal discomfort and rare kidney issues with long-term use.",
        "Efficacy": "Highly effective for mild to moderate pain, inflammation, and fever reduction."
    },
    {
        "Drug": "Acetaminophen",
        "Safety": "Liver toxicity at high doses. Generally safe if used within recommended dosage.",
        "Efficacy": "Good analgesic and antipyretic but weaker anti-inflammatory effects than NSAIDs."
    },
    {
        "Drug": "Naproxen",
        "Safety": "May increase risk of cardiovascular events if used long-term; GI upset possible.",
        "Efficacy": "Long-acting NSAID effective for chronic inflammatory conditions like arthritis."
    },
    {
        "Drug": "Diclofenac",
        "Safety": "Possible GI side effects, potential cardiovascular risks, particularly at high doses.",
        "Efficacy": "Potent anti-inflammatory and analgesic effect for arthritis and acute injuries."
    }
]

 
def extract_annual_therapy_cost(cost_statement):
    # Prepare the prompt to send to the LLM
    messages = [
        {
            "role": "system",
            "content": "You are an expert data extractor who extracts numerical values from financial statements."
        },
        {
            "role": "user",
            "content": f"""Extract the annual therapy cost from the following statement:

\"{cost_statement}\"

INSTRUCTIONS:
1. Identify all numerical values representing the annual therapy cost.
2. If there is a range (e.g., "$100 - $200" or "$100 to $200"), calculate the average of the two numbers.
3. Provide the final extracted number as 'Annual_Therapy_Costs(Numbers)' (in USD).
4. If a calculation was performed (e.g., averaging a range), include the calculation as 'Reason'.

***Output Format:***

- Annual_Therapy_Costs(Numbers): [Extracted or Averaged Number]
- Reason: [Calculation if any]

***Do not include any extra information beyond what is specified in the output format.***
"""
        },
    ]

    # Call the OpenAI API
    try:
        response = openai_client.chat.completions.create(
            model=MODEL,  # Replace with 'gpt-3.5-turbo' or 'gpt-4' as appropriate
            messages=messages,
            temperature=0,
        )
        response_content = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return None

    # Parse the response to extract the cost and reason
    cost_pattern = re.compile(r"- Annual_Therapy_Costs\(Numbers\):\s*\$?([\d,\.]+)")
    reason_pattern = re.compile(r"- Reason:\s*(.*)")

    cost_match = cost_pattern.search(response_content)
    reason_match = reason_pattern.search(response_content)

    if cost_match:
        cost_str = cost_match.group(1)
        cost_number = float(cost_str.replace(',', ''))
    else:
        cost_number = None

    if reason_match:
        reason = reason_match.group(1)
    else:
        reason = None

    return {
        'Annual_Therapy_Costs(Numbers)': cost_number,
        'Reason': reason
    }
    
    
    
def calculate_safety_efficacy_scores(trade_name, country, disease, efficacy_statement, safety_statement):
    # Prepare the prompt to send to the LLM
    messages = [
        {
            "role": "system",
            "content": "You are an expert analyst who evaluates medical statements to calculate safety and efficacy scores using sentiment analysis."
        },
        {
            "role": "user",
            "content": f"""Given the following information:
 
Trade Name: "{trade_name}"
Country: "{country}"
Disease: "{disease}"
 
Efficacy statement:
"{efficacy_statement}"
 
Safety statement:
"{safety_statement}"
 
Calculate an efficacy score and a safety score based on the statements, using sentiment analysis.
 
INSTRUCTIONS:
 
1. Analyze the efficacy statement and assign an efficacy score between 0 and 1, where 0 indicates no efficacy and 1 indicates high efficacy.
 
2. Analyze the safety statement and assign a safety score between 0 and 1, where 0 indicates unsafe and 1 indicates very safe.
 
3. Provide the reasons for the assigned scores.
 
***Output Format:***
 
- Efficacy_Score: [Score between 0 and 1]
 
- Efficacy_Reason: [Reason for the score]
 
- Safety_Score: [Score between 0 and 1]
 
- Safety_Reason: [Reason for the score]
 
***Do not include any extra information beyond what is specified in the output format.***
"""
        },
    ]
 
    # Call the OpenAI API
    try:
        response = openai_client.chat.completions.create(
            model=MODEL,  # Replace with 'gpt-3.5-turbo' or 'gpt-4' as appropriate
            messages=messages,
            temperature=0,
        )
        response_content = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return None
 
    # Parse the response to extract the scores and reasons
    efficacy_score_pattern = re.compile(r"- Efficacy_Score:\s*([\d\.]+)")
    efficacy_reason_pattern = re.compile(r"- Efficacy_Reason:\s*(.*?)(?=- Safety_Score:)", re.DOTALL)
    safety_score_pattern = re.compile(r"- Safety_Score:\s*([\d\.]+)")
    safety_reason_pattern = re.compile(r"- Safety_Reason:\s*(.*)", re.DOTALL)
 
    efficacy_score_match = efficacy_score_pattern.search(response_content)
    efficacy_reason_match = efficacy_reason_pattern.search(response_content)
    safety_score_match = safety_score_pattern.search(response_content)
    safety_reason_match = safety_reason_pattern.search(response_content)
 
    if efficacy_score_match:
        efficacy_score = float(efficacy_score_match.group(1))
    else:
        efficacy_score = None
 
    if efficacy_reason_match:
        efficacy_reason = efficacy_reason_match.group(1).strip()
    else:
        efficacy_reason = None
 
    if safety_score_match:
        safety_score = float(safety_score_match.group(1))
    else:
        safety_score = None
 
    if safety_reason_match:
        safety_reason = safety_reason_match.group(1).strip()
    else:
        safety_reason = None
 
    return {
        'Efficacy_Score': efficacy_score,
        'Efficacy_Reason': efficacy_reason,
        'Safety_Score': safety_score,
        'Safety_Reason': safety_reason
    }
    
    
def extract_adverse_events(statement):
    statement = str(statement)
    match = re.search(r'include (.*)', statement, re.IGNORECASE)
    if match:
        events_str = match.group(1)
    else:
        events_str = statement
    events = re.split(r',|\band\b|;', events_str, flags=re.IGNORECASE)
    events = [event.strip() for event in events if event.strip()]
    return events

def adverse_effect_score(drug_name, adverse_event):
    events_list_str = '\n'.join([f"- {event}" for event in adverse_event])

    # Prepare the messages for ChatCompletion
    messages = [
        {"role": "system", "content": "You are an expert medical assistant specializing in pharmacovigilance and adverse event assessment."},
        {"role": "user", "content": f"""Assess the following adverse events associated with the drug **{drug_name}**.

INSTRUCTIONS:
1. For each adverse event listed, provide:
   - A severity score on a scale from 1 to 10 (as a float), where 1 is the least severe and 10 is the most severe.
   - A label based on the score:
     - 1-3: Mild
     - 4-6: Moderate
     - 7-10: Severe
   - A brief reason for the score.

2. After assessing all individual adverse events, calculate the overall severity score for the drug by averaging the individual scores.

3. Provide the overall severity label based on the average score:
   - 1-3: Mild
   - 4-6: Moderate
   - 7-10: Severe

4. Provide a combined reason summarizing the assessments.

***Adverse Events:***
{events_list_str}

***Output Format:***

For each adverse event:

- Adverse Event: [Adverse Event]
  - Score: X.XX
  - Label: [Mild/Moderate/Severe]
  - Reason: [Reason]

After all events:

- Overall Score: Y.YY
- Overall Label: [Mild/Moderate/Severe]
- Combined Reason: [Combined Reason]

***Do not include any extra information beyond what is specified in the output format.***"""},
    ]
    # Call the OpenAI API
    try:
        response = openai_client.chat.completions.create(
            model=MODEL,  # Use the appropriate model
            messages=messages,
            temperature=0,
        )
        response_content = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return None

    # Parse the response to extract scores, labels, and reasons
    individual_scores = []
    individual_labels = []
    individual_reasons = []
    overall_score = None
    overall_label = None
    combined_reason = None

    adverse_event_pattern = re.compile(
        r"- Adverse Event:\s*(.*?)\n\s*- Score:\s*([\d\.]+)\n\s*- Label:\s*(\w+)\n\s*- Reason:\s*(.*?)\n(?=- Adverse Event:|$)",
        re.DOTALL
    )
    overall_pattern = re.compile(
        r"- Overall Score:\s*([\d\.]+)\n- Overall Label:\s*(\w+)\n- Combined Reason:\s*(.*)",
        re.DOTALL
    )

    # Extract individual adverse event assessments
    matches = adverse_event_pattern.findall(response_content)
    for match in matches:
        event, score_str, label, reason = match
        try:
            score = float(score_str)
        except ValueError:
            score = 1.0
        individual_scores.append(score)
        individual_labels.append(label)
        individual_reasons.append({'event': event.strip(), 'score': score, 'label': label, 'reason': reason.strip()})

    # Extract overall assessment
    overall_match = overall_pattern.search(response_content)
    if overall_match:
        overall_score_str, overall_label, combined_reason = overall_match.groups()
        try:
            overall_score = float(overall_score_str)
        except ValueError:
            overall_score = sum(individual_scores) / len(individual_scores) if individual_scores else 1.0
    else:
        overall_score = sum(individual_scores) / len(individual_scores) if individual_scores else 1.0
        overall_label = 'Mild' if overall_score <= 3 else ('Moderate' if overall_score <= 6 else 'Severe')
        combined_reason = 'Combined assessment based on individual adverse events.'

    # Prepare result dictionary
    result = {
        'Final Score': overall_score,
        'Final Label': overall_label,
        'Combined Reason': combined_reason,
    }

    return result



def get_drug_docs_from_memory(drug_name, drug_data_list):
    """Returns a list of all documents in drug_data_list where Drug == drug_name."""
    matching_docs = [entry for entry in drug_data_list if entry["Drug"].strip().lower() == drug_name.strip().lower()]
    return matching_docs

# insights
def get_insights_from_llm(prompt_text):
    """Sends the prompt to OpenAI GPT model and returns the response text."""
    system_prompt = (

"""
You are a market research analyst tasked with evaluating the Safety and Efficacy profiles of multiple drugs, including a given main drug and its comparators. 
Your objective is to identify and analyze clinically significant or numerically important differences between the main drug and other drugs.

-->TASK:
-Compare the Safety and Efficacy of the main drug against the other drugs.
-Identify key differences based on available data, considering statistical significance, clinical relevance, and impact on patient outcomes.
-Provide an impact-driven analysis explaining how these differences influence the main drug’s positioning in the market.
-->INSTRUCTIONS:
-Examine both Safety and Efficacy sections for the main drug and the comparators.
-Quantify differences wherever applicable (e.g., “X% lower incidence of adverse effects” or “Y% higher response rate”).
-Provide only the impact points in a structured manner. Each point should be a detailed summary (80-120 words) explaining the observed difference, potential causes, and implications on patient treatment, regulatory standing, or market competitiveness.
-If no significant differences exist, explicitly state that and mention any minor but notable differentiating factors that may still be relevant for decision-making.
-Ensure that the points are concise yet comprehensive, avoiding unnecessary repetition while covering all key insights.
-->FORMAT:
-Provide two separate sections for Safety and Efficacy.
-List 2-3 bullet points under each section, with each point offering an insightful explanation of a key difference.
-Avoid explicit section headers for the bullet points—just present the findings in a seamless, structured manner.
-->OUTPUT EXPECTATIONS:
-A precise yet detailed comparative analysis that highlights how the main drug stands out (positively or negatively) in terms of Safety and Efficacy.
-A focus on real-world impact, including treatment effectiveness, patient tolerability, and competitive advantages or disadvantages.
-If applicable, mention potential reasons for observed differences, such as formulation, mechanism of action, or patient demographics.
-This will help in understanding the market positioning of the main drug while ensuring data-driven decision-making in clinical and commercial strategies

Return in Bullet points. Maximum 6 points not more than that
"""

    )
    
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ],
        
        temperature=0.7
    )

    return response.choices[0].message.content.strip()

def process_drug_comparison(drug_data_list, main_drug):
    """Builds the prompt for main_drug vs other drugs from in-memory data."""
    
    # Get docs for the main drug
    main_drug_docs = get_drug_docs_from_memory(main_drug, drug_data_list)

    if not main_drug_docs:
        print(f"No documents found for the main drug: {main_drug}")
        return {"docs": [], "differences": ""}

    # Start building the prompt
    prompt_lines = [f"Below is the Safety and Efficacy information for the drug: {main_drug} compared with other drugs.", ""]
    
    # Append main drug details
    for doc in main_drug_docs:
        safety = doc.get("Safety", "No Safety Info")
        efficacy = doc.get("Efficacy", "No Efficacy Info")
        
        prompt_lines.append(f"Drug: {main_drug}")
        prompt_lines.append(f"Safety: {safety}")
        prompt_lines.append(f"Efficacy: {efficacy}")
        prompt_lines.append("")

    # Include data for other drugs (excluding main drug)
    other_drugs = [entry for entry in drug_data_list if entry["Drug"].strip().lower() != main_drug.strip().lower()]
    
    for doc in other_drugs:
        safety = doc.get("Safety", "No Safety Info")
        efficacy = doc.get("Efficacy", "No Efficacy Info")
        
        prompt_lines.append(f"Drug: {doc['Drug']}")
        prompt_lines.append(f"Safety: {safety}")
        prompt_lines.append(f"Efficacy: {efficacy}")
        prompt_lines.append("")
    
    # Combine everything
    combined_prompt = "\n".join(prompt_lines)
    
    differences_text = get_insights_from_llm(combined_prompt)

    return {
        "docs": main_drug_docs,
        "differences": differences_text
    }

def format_output(drug_name, differences):
    return f"\n{differences}"

# differences
def get_differences_from_llm(prompt_text):
    """Sends the prompt to OpenAI GPT model and returns the response text."""
    system_prompt = (
 """
-You are a market research analyst evaluating multiple drugs based on Safety, Efficacy, and Patient Eligibility. 
-Your task is to extract key insights from the comparison between a main drug and its competitor drugs, focusing on its effectiveness and market potential.

-->TASK:
-Identify key strengths, weaknesses, or differentiators of the main drug using comparative drugs as reference points.
-Assess how effectiveness, safety, and patient eligibility criteria influence its potential in the market.
-Provide insightful, data-driven summaries that explain where the drug stands in the competitive landscape.
-->INSTRUCTIONS:
-Do not explicitly categorize insights under “Safety,” “Efficacy,” or “Patient Eligibility.” Instead, provide a seamless summary integrating all aspects.
-Only provide 2-3 key insights, each within 50-80 words.
-Ensure that each point highlights the comparative advantage, market impact, or clinical positioning of the main drug.
-Use quantitative differences when available (e.g., “X rate higher response rate” or “Y rate broader eligibility criteria”).
-Insights should focus on the practical implications of these differences, such as prescription preference, patient outcomes, regulatory advantages, or market growth potential.
-Avoid generic statements—every point should be comparative and impactful.
OUTPUT EXPECTATIONS:
A concise yet informative summary that highlights the main drug’s positioning.
Clear competitive differentiation, showing how it stands out or where it lags.
A focus on real-world implications to aid in market strategy and decision-making.
Return in bullet points"""
 
    )
   
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ],
        max_tokens=350,
        temperature=0.7
    )
 
    return response.choices[0].message.content.strip()
 
def process_key_insights(drug_data_list, main_drug):
    """Builds the prompt for main_drug vs other drugs from in-memory data."""
   
    # Get docs for the main drug
    main_drug_docs = get_drug_docs_from_memory(main_drug, drug_data_list)
 
    if not main_drug_docs:
        print(f"No documents found for the main drug: {main_drug}")
        return {"docs": [], "differences": ""}
 
    # Start building the prompt
    prompt_lines = [f"Below is the Safety and Efficacy information for the drug: {main_drug} compared with other drugs.", ""]
   
    # Append main drug details
    for doc in main_drug_docs:
        safety = doc.get("Safety", "No Safety Info")
        efficacy = doc.get("Efficacy", "No Efficacy Info")
        pat_elig = doc.get("Patient Eligibility", "No Patient Eligibility")
        prompt_lines.append(f"Drug: {doc['Drug']}")
        prompt_lines.append(f"Safety: {safety}")
        prompt_lines.append(f"Efficacy: {efficacy}")
        prompt_lines.append(f"Patient Eligibility: {pat_elig}")
        prompt_lines.append("")
 
    # Include data for other drugs (excluding main drug)
    other_drugs = [entry for entry in drug_data_list if entry["Drug"].strip().lower() != main_drug.strip().lower()]
   
    for doc in other_drugs:
        safety = doc.get("Safety", "No Safety Info")
        efficacy = doc.get("Efficacy", "No Efficacy Info")
       
        prompt_lines.append(f"Drug: {doc['Drug']}")
        prompt_lines.append(f"Safety: {safety}")
        prompt_lines.append(f"Efficacy: {efficacy}")
        prompt_lines.append("")
   
    # Combine everything
    combined_prompt = "\n".join(prompt_lines)
   
    differences_text = get_differences_from_llm(combined_prompt)
 
    return {
        "docs": main_drug_docs,
        "differences": differences_text
    }
 
def key_insights(drug_name, differences):
    return f"\n{differences}"


def get_elasticsearch_results(index, query, fields, operator="OR"):
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
            else:
                print(f"Warning: No 'hits' key in response: {res}")
        return all_results
 
    except Exception as e:
        print(f"Error querying Elasticsearch index {index}: {e}")
        return []



def update_drug_data(drug_list, header_name, header_description):
    updated_list = []
    
    for drug in drug_list:
        try:
            drug_name = drug.get('TradeName', 'Unknown Drug Name')
            print(f"Processing drug: {drug_name}")
            
            # Fetch PubMed and ClinicalTrial results
            pubmedresults = get_elasticsearch_results(
                index="pubmed",
                query=drug_name,
                fields=["Title", "AbstractText", "PMID"],
                operator="OR"
            )
            clinicalresults = get_elasticsearch_results(
                index="clinicaltrial",
                query=drug_name,
                fields=["Study Title", "Study Description", "NCT Number", "Study Status", "Conditions",
                        "Interventions", "Sponsor", "Collaborators", "Study Design", "Phases"],
                operator="OR"
            )
            
            print(f"PubMed Results: {len(pubmedresults)}, ClinicalTrial Results: {len(clinicalresults)}")
            
            # Prepare context from drug, PubMed, and ClinicalTrial data
            drug_context = "\n".join([f"{key}: {value}" for key, value in drug.items()])
            
            pubmed_context = "\n\n".join(
                [
                    f"--- PubMed Article [{index + 1}] ---\n\n"
                    f"PMID: {res.get('PMID', 'N/A')},\n\n"
                    f"Title: {res.get('Title', 'N/A')},\n\n"
                    f"Abstract: {res.get('AbstractText', 'N/A')}\n\n"
                    for index, res in enumerate(pubmedresults)
                ]
            )
            
            clinical_context = "\n\n".join(
                [
                    f"--- Clinical Trial [{index + 1}] ---\n\n"
                    f"NCT Number: {res.get('NCT Number', 'N/A')},\n\n"
                    f"Study Title: {res.get('Study Title', 'N/A')},\n\n"
                    f"Description: {res.get('Study Description', 'N/A')},\n\n"
                    f"Status: {res.get('Study Status', 'N/A')}\n\n"
                    for index, res in enumerate(clinicalresults)
                ]
            )
            
            # Construct the system prompt
            system_prompt = (
            
                "=== SYSTEM PROMPT ===\n"
                f"[1] ROLE:\n"
                f"You are a medical professional providing detailed information about pharmaceutical drugs. You answer stricty using the given information.\n\n"

                f"[2] DRUG INFORMATION:\n"
                f"Below are details about the '{drug_name.upper()}' drug, its relevant PubMed publications, and ClinicalTrial results:\n\n"

                f"--- Drug Details ---\n"
                f"{drug_context}\n\n"

                f"--- PubMed Data ---\n"
                f"{pubmed_context if pubmed_context else 'No relevant PubMed results found.'}\n\n"

                f"--- ClinicalTrial Data ---\n"
                f"{clinical_context if clinical_context else 'No relevant ClinicalTrial results found.'}\n\n"

                f"[3] TASK:\n"
                f"Please provide a value for the header '{header_name}' based on the provided data.\n\n"

                f"[4] HEADER DESCRIPTION:\n"
                f"{header_description}\n\n"

                f"[5] INSTRUCTION:\n"
                f"ONLY PROVIDE THE VALUE FOR THE HEADER '{header_name}'. NO OTHER INFORMATION IS REQUIRED.\n\n"
                f"=== END SYSTEM PROMPT ==="

            )
            user_prompt = (
            f"Based on the provided information, please provide a value for the header '{header_name}'. "
            f"Description of the header: {header_description}."
            )
            
            # Prepare messages for OpenAI API
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            # Call OpenAI API
            response = openai_client.chat.completions.create(
                model=MODEL,
                messages=messages
            )
            # Extract generated value
            new_value = response.choices[0].message.content.strip()
            if not new_value:
                raise ValueError("Generated response is empty.")
            
            # Update the drug data with the new header value
            drug[header_name] = new_value
            print(new_value)
        
        except Exception as e:
            error_message = f"An error occurred for drug '{drug_name}': {e}"
            print(error_message)
            drug[header_name] = "Error generating value"
        
        # Append the updated drug to the list
        updated_list.append(drug)
    
    return updated_list
