import os
import json
import pandas as pd
from openai import AzureOpenAI
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.core.pipeline.transport import RequestsTransport

# Load .env with LLaMA credentials
load_dotenv()

MODEL = "gpt-4o-mini"

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)


def ask_llama(prompt: str):
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[UserMessage(content=prompt)]
    )
    return response.choices[0].message.content.strip()

def benchmark_score_llama(enrollment, mechanism_text, justification, prevalence, bausch_presence_text, safety, efficacy, weights):
    bausch_presence = bausch_presence_text.strip().lower() == "yes"

    prompt = f"""
You are evaluating a disease for drug repurposing based on benchmark criteria.

Assign scores: 1 (Low), 3 (Moderate), 5 (High). Output must be JSON only with integers.

Criteria:
1. No of Patient Treated:
   - <100: 1, 100–1000: 3, >1000: 5
   Value: {enrollment}

2. Gut Microbiome Association:
   "{mechanism_text}"

3. Rifaximin Treatment Justification:
   "{justification}"

4. Disease Prevalence:
   - <100 million: 1, 100–1000 million: 3, >1000 million: 5
   Value: "{prevalence}"

5. Bausch Presence (Is Bausch working on this disease?): {"1" if bausch_presence else "5"}
  - if bausch presence exists then score it as 1 else 5

6. Safety & Efficacy:
   Safety: "{safety}"
   Efficacy: "{efficacy}"

Output this JSON format:
{{
  "No_of_Patient_Treated": x,
  "Gut_Microbiome_Association": x,
  "Rifaximin_Treatment": x,
  "Prevalence": x,
  "Bausch_Presence": x,
  "Safety_Efficacy": x
}}

-- remove the ```json ``` tags from the output
"""
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )

    response_content = response.choices[0].message.content.strip()
    # print("resp:",response_content)
    # print(justification)
    # Fixing double quotes issue and ensuring proper JSON format
    # response_content = response_content.replace('""', '"')

    try:
        score_json = json.loads(response_content)
    except json.JSONDecodeError:
        print("⚠️ LLaMA Response Error. Raw Response:\n", response_content)
        return None, 0

    weighted_score = sum(score_json[key] * weights[key] for key in score_json)
    return score_json, round(weighted_score, 2)

def run_benchmark_from_excel(input_path, output_path, weights):
    df = pd.read_excel(input_path)
    scores_list = []
    total_scores = []

    for index, row in df.iterrows():
        try:
            scores, total = benchmark_score_llama(
                enrollment=row['Enrollment'],
                mechanism_text=row['Disease_Mechanism'],
                
                justification=row['Justification_for_Drug_Use'],
                prevalence=row['Prevalence'],
                bausch_presence_text=row['Bausch Presence'],
                safety=row['Safety'],
                efficacy=row['Efficacy'],
                weights=weights

                
            )
        except Exception as e:
            print(f"❌ Error processing row {index}: {e}")
            scores = {k: 0 for k in weights}
            total = 0
        
        scores_list.append(scores)
        total_scores.append(total)

    df['Benchmark Score'] = total_scores
    df['Score Breakdown'] = scores_list
    df.to_excel(output_path, index=False)
    print(f"✅ Output saved to: {output_path}")

def get_user_weights():
    # You can also modify this function to take weights from an Excel file
    print("Please input the weights for the following parameters:")
    weights = {}
    
    # Allow user to input weights for each parameter
    weights['No_of_Patient_Treated'] = float(input("No of Patient Treated (Default 0.20): ") or 0.20)
    weights['Gut_Microbiome_Association'] = float(input("Gut Microbiome Association (Default 0.15): ") or 0.15)
    weights['Rifaximin_Treatment'] = float(input("Rifaximin Treatment (Default 0.20): ") or 0.20)
    weights['Prevalence'] = float(input("Prevalence (Default 0.15): ") or 0.15)
    weights['Bausch_Presence'] = float(input("Bausch Presence (Default 0.10): ") or 0.10)
    weights['Safety_Efficacy'] = float(input("Safety & Efficacy (Default 0.20): ") or 0.20)
    
    print(f"Custom Weights: {weights}")
    return weights


if __name__ == "__main__":
    # === User Input ===
    input_file = r"C:\Users\nirmiti.deshmukh\marketX\mgts\backend\RnD\gutmicrobiome​_updated_bausch_presence.xlsx"  # Specify the Excel file path
    output_file = r"C:\Users\nirmiti.deshmukh\marketX\mgts\backend\RnD\gutmicrobiome​_scored_disease_output.xlsx"  # Specify the output file path

    # === User-defined Weights ===
    custom_weights = get_user_weights()  # User-defined weights input

    run_benchmark_from_excel(input_file, output_file, custom_weights)