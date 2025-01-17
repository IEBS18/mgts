from openai import OpenAI
import pandas as pd
from dotenv import load_dotenv
import os
import re
import sys
import io
import numpy as np  # Import numpy for handling NaN values
 
import time  # For handling delays
import logging  # For logging errors and progress
 
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
 
load_dotenv()
 
# Initialize the OpenAI client
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
 
# Function to extract adverse events from the statement
def extract_adverse_events(statement):
    # Ensure statement is a string
    statement = str(statement)
    # Find the portion after 'include'
    match = re.search(r'include (.*)', statement, re.IGNORECASE)
    if match:
        events_str = match.group(1)
    else:
        events_str = statement
    # Split by common connectors
    events = re.split(r',|\band\b|;', events_str, flags=re.IGNORECASE)
    # Clean up and normalize
    events = [event.strip() for event in events if event.strip()]
    return events
 
def adverse_affect_score(drug_name, adverse_event):
    """
    Sending the drug name and adverse events associated with the drug to OpenAI,
    scoring them together, and returning the overall score, label, and reason for the adverse events.
    """
 
    print("\n====== Calculating the Adverse Effect Score for the Drug ======\n")
    print(f"Drug Name: {drug_name}")
    print(f"Adverse Events: {adverse_event}")
 
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
            model="gpt-4o-mini",  # Replace with 'gpt-3.5-turbo' or 'gpt-4' as appropriate
            messages=messages,
            temperature=0,
        )
        response_content = response.choices[0].message.content.strip()
        print("\nResponse:\n", response_content)
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return None
 
    # Parse the response to extract individual scores, labels, and reasons
    individual_scores = []
    individual_labels = []
    individual_reasons = []
    overall_score = None
    overall_label = None
    combined_reason = None
 
    # Use regex patterns to extract the required information
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
            score = 1.0  # Default to least severe if parsing fails
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
        # Calculate overall score if not provided
        overall_score = sum(individual_scores) / len(individual_scores) if individual_scores else 1.0
        # Determine the overall label based on the average score
        if overall_score <= 3:
            overall_label = 'Mild'
        elif overall_score <= 6:
            overall_label = 'Moderate'
        else:
            overall_label = 'Severe'
        combined_reason = 'Combined assessment based on individual adverse events.'
 
    print("\n====== Final Assessment ======\n")
    print(f"Final Score: {overall_score:.2f}")
    print(f"Final Label: {overall_label}")
    print(f"Combined Reason:\n{combined_reason}")
 
    # Prepare result dictionary
    result = {
        'Final Score': overall_score,
        'Final Label': overall_label,
        'Combined Reason': combined_reason,
    }
 
    # Optionally, add individual assessments to the result
    # Uncomment the following lines if you want to include individual adverse events
    # for idx, item in enumerate(individual_reasons, start=1):
    #     result[f'Adverse Event {idx}'] = item['event']
    #     result[f'Score {idx}'] = item['score']
    #     result[f'Label {idx}'] = item['label']
    #     result[f'Reason {idx}'] = item['reason']
 
    return result
 
 
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(filename='processing.log', level=logging.INFO,
                        format='%(asctime)s %(levelname)s:%(message)s')
 
    # Input and output file paths
    Input_file = r"C:\Users\nirmiti.deshmukh\Mindgram\adverse_events\USA.xlsx"
    output_file = Input_file.replace('.xlsx', '_with_Adverse_Affect_Scores.xlsx')
 
    # Load the input data
    data = pd.read_excel(Input_file)
    print("Data Head:")
    print(data.head())
    logging.info(f"Loaded data from '{Input_file}'")
 
    # Initialize new columns in the DataFrame if they don't exist
    if 'Statements' not in data.columns:
        # Extract adverse events without removing percentages
        data['Statements'] = data['Adverse_Events'].apply(extract_adverse_events)
   
    if 'Final Score' not in data.columns:
        data['Final Score'] = np.nan
    if 'Final Label' not in data.columns:
        data['Final Label'] = ''
    if 'Combined Reason' not in data.columns:
        data['Combined Reason'] = ''
 
    # Initialize initial_index
    initial_index = 0
 
    # Check if there's a partially processed file
    if os.path.exists(output_file):
        # Load the processed data
        processed_data = pd.read_excel(output_file)
        # Update the main DataFrame with the processed data
        data.update(processed_data)
        # Determine the last processed index
        processed_indices = processed_data[processed_data['Final Score'].notna()].index
        if not processed_indices.empty:
            initial_index = processed_indices[-1] + 1
        else:
            initial_index = 0
        print(f"Resuming from index {initial_index}")
        logging.info(f"Resuming from index {initial_index}")
    else:
        print("Starting processing from the beginning.")
        logging.info("Starting processing from the beginning.")
 
    # Loop through each row and calculate the adverse effect score starting from initial_index
    for idx in range(initial_index, len(data)):
        row = data.iloc[idx]
        try:
            drug_name = row['TradeName']
            adverse_event = row['Statements']
            score = adverse_affect_score(drug_name, adverse_event)
            if score:
                # Assign the results to the DataFrame
                data.at[idx, 'Final Score'] = score['Final Score']
                data.at[idx, 'Final Label'] = score['Final Label']
                data.at[idx, 'Combined Reason'] = score['Combined Reason']
            else:
                # If score is None, leave the values as they are
                pass
 
            # Save progress every 50 rows or at the end
            if (idx + 1) % 50 == 0 or idx == len(data) - 1:
                # Save the DataFrame up to the current index
                data.to_excel(output_file, index=False)
                print(f"\n====== Processed {idx + 1} Records ======\n")
                logging.info(f"Processed {idx + 1} records and saved progress to '{output_file}'")
            # Add a delay to handle rate limits if necessary
            # time.sleep(1)  # Uncomment if you need to add a delay between requests
        except Exception as e:
            print(f"Error processing row {idx + 1}: {e}")
            logging.error(f"Error processing row {idx + 1}: {e}")
            continue
 
    print("\n====== Final Save of All Results ======\n")
    data.to_excel(output_file, index=False)
    print(f"Results saved to '{output_file}'")
    logging.info(f"Results saved to '{output_file}'")