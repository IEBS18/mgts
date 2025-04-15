import os
import json
import pandas as pd
from openai import AzureOpenAI
from dotenv import load_dotenv
from azure.ai.inference.models import UserMessage

# Load .env with LLaMA credentials
load_dotenv()

MODEL = "gpt-4o-mini"

# Azure OpenAI Client Initialization
openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)

# LLM benchmark scoring (used only in initial run)
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

    try:
        score_json = json.loads(response_content)
    except json.JSONDecodeError:
        print("⚠️ LLaMA Response Error. Raw Response:\n", response_content)
        return None, 0

    weighted_score = sum(score_json[key] * weights[key] for key in score_json)
    return score_json, round(weighted_score, 2)


# Initial run: scoring each row with LLM
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

    df['Score Breakdown'] = scores_list
    df['Benchmark Score'] = total_scores
    df.to_excel(output_path, index=False)
    print(f"✅ Initial scoring done. Output saved to: {output_path}")


# Recompute only the weighted score using stored JSON scores
def recompute_weighted_score_from_stored_scores(excel_path, output_path, weights):
    df = pd.read_excel(excel_path)
    new_scores = []

    for index, row in df.iterrows():
        try:
            score_str = row['score_breakdown_distribution']
            if isinstance(score_str, str):
                score_json = json.loads(score_str.replace("'", '"'))
            else:
                score_json = row['Score Breakdown']

            weighted_score = sum(score_json[key] * weights[key] for key in weights)
        except Exception as e:
            print(f"❌ Error on row {index}: {e}")
            weighted_score = 0

        new_scores.append(round(weighted_score, 2))

    df['Benchmark Score'] = new_scores
    df.to_excel(output_path, index=False)
    print(f"✅ Recomputed scores saved to: {output_path}")


# Allow user to input weights
def get_user_weights():
    print("Please input the weights for the following parameters:")
    weights = {
        'No_of_Patient_Treated': float(input("No of Patient Treated (Default 0.20): ") or 0.20),
        'Gut_Microbiome_Association': float(input("Gut Microbiome Association (Default 0.15): ") or 0.15),
        'Rifaximin_Treatment': float(input("Rifaximin Treatment (Default 0.20): ") or 0.20),
        'Prevalence': float(input("Prevalence (Default 0.15): ") or 0.15),
        'Bausch_Presence': float(input("Bausch Presence (Default 0.10): ") or 0.10),
        'Safety_Efficacy': float(input("Safety & Efficacy (Default 0.20): ") or 0.20)
    }
    print(f"Custom Weights: {weights}")
    return weights


# === Main execution ===
if __name__ == "__main__":
    input_file = r"C:\Users\nirmiti.deshmukh\marketX\mgts\backend\RnD\gutmicrobiome​_updated_bausch_presence.xlsx"
    output_file = r"C:\Users\nirmiti.deshmukh\marketX\mgts\backend\RnD\scored_100.xlsx"

    custom_weights = get_user_weights()

    df = pd.read_excel(input_file)

    if 'Score Breakdown' in df.columns:
        print("📊 Detected Score Breakdown column. Recomputing weighted scores only...")
        recompute_weighted_score_from_stored_scores(input_file, output_file, custom_weights)
    else:
        print("🧠 No Score Breakdown column found. Running full LLM-based scoring...")
        run_benchmark_from_excel(input_file, output_file, custom_weights)
