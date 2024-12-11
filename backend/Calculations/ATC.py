import os
import re

from openai import OpenAI


openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
 
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
            model="gpt-4o-mini",  # Replace with 'gpt-3.5-turbo' or 'gpt-4' as appropriate
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
            model="gpt-4o-mini",  # Replace with 'gpt-3.5-turbo' or 'gpt-4' as appropriate
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
            model="gpt-4o-mini",  # Use the appropriate model
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
