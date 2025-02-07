import os
import pandas as pd
from openai import OpenAI
import matplotlib.pyplot as plt
from elasticsearch import Elasticsearch
import numpy as np
import json
from dotenv import load_dotenv
import re

load_dotenv()

# Load environment variables
ELASTICSEARCH_ENDPOINT = os.getenv('elasticsearchendpoint')
ELASTIC_API_KEY = os.getenv('elasticapikey')

# Connect to Elasticsearch
es = Elasticsearch(ELASTICSEARCH_ENDPOINT, api_key=ELASTIC_API_KEY)

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4o-mini"

# Load the Excel file
file_path = r"C:\Users\nirmiti.deshmukh\Mindgram\mgts\backend\PricePrediction\pp_data.xlsx"  # Change this to your actual file path
df = pd.read_excel(file_path)

# Function to get corrected submodality using OpenAI
def get_corrected_submodality(drug, modality, existing_submodality):
    prompt = f"""
    The drug "{drug}" falls under the modality "{modality}". The existing submodality is "{existing_submodality}". 
    Based on pharmaceutical classification, what should be the correct submodality? 
    Respond with only the correct submodality name.
    You are an expert in pharmacology. Your task is to determine the correct submodality for a given drug based on its modality. 

Below is a reference table with examples that categorizes Biologics and Small Molecules:

Category:  
**Biologics** - Large, complex molecules derived from living organisms or cells.  
Examples: Monoclonal antibodies, vaccines, cytokines, gene therapies.  

**Small Molecules** - Small, chemically synthesized molecules with well-defined structures.  
Examples: Aspirin, ibuprofen, statins, small molecule kinase inhibitors.  

### Types of Biologics and Small Molecules:

- **Monoclonal Antibodies (mAbs)**: Rituximab, Trastuzumab, Adalimumab  
- **Vaccines**: Live-attenuated, inactivated, protein subunit, viral vector, mRNA vaccines (e.g., COVID-19 vaccines)  
- **Cytokines**: Interleukins, interferons (e.g., Interferon-alpha, IL-2)  
- **Gene Therapies**: DNA-based (e.g., Zolgensma), RNA-based therapies (e.g., Onpattro)  
- **Cell Therapies**: Stem cells, CAR-T cells (e.g., Tisagenlecleucel)  
- **Blood Products**: Plasma-derived products, coagulation factors (e.g., Factor VIII)  
- **Peptides**: Hormonal (e.g., Insulin), therapeutic peptides (e.g., Exenatide), ACE inhibitors (e.g., Enalapril), synthetic analogs (e.g., Lisinopril)  
- **Fusion Proteins**: Etanercept (TNF receptor-Fc fusion protein)  
- **Oligonucleotides**: siRNA, antisense oligonucleotides (e.g., Spinraza, Onpattro)  
- **Antibody-Drug Conjugates (ADCs)**: Brentuximab Vedotin, Trastuzumab Emtansine, ADC payloads include cytotoxic small molecules (e.g., MMAE, DM1)  
- **Biosimilars**: Biological products similar to reference biologics (e.g., Zarxio, a biosimilar of Neupogen)  
- **Traditional Drugs**: Alkaloids (e.g., Morphine), NSAIDs (e.g., Ibuprofen), antibiotics (e.g., Penicillin)  
- **Targeted Therapies**: Bi-specific antibodies, checkpoint inhibitors (e.g., Pembrolizumab), Kinase inhibitors (e.g., Imatinib), PARP inhibitors (e.g., Olaparib)  
- **Immunomodulators**: Cytokines, interleukins (e.g., Interferon-beta, IL-6 blockers), Small molecule immunosuppressants (e.g., Methotrexate, Cyclosporine)  
- **Hormones**: Recombinant hormones (e.g., Insulin, Growth Hormone), Synthetic hormones (e.g., Levothyroxine, Ethinyl Estradiol)  
- **Antibiotics**: Beta-lactams (e.g., Amoxicillin), macrolides (e.g., Azithromycin), fluoroquinolones (e.g., Ciprofloxacin)  
- **Antivirals**: Nucleoside analogs (e.g., Remdesivir), protease inhibitors (e.g., Ritonavir)  
- **Metabolic Modulators**: Enzyme replacement therapies (e.g., Agalsidase-beta), Statins (e.g., Atorvastatin), SGLT2 inhibitors (e.g., Empagliflozin)  

### Task:
Given a drug and its modality (Biologic or Small Molecule), determine the correct submodality from the list above. If the existing submodality is incorrect, replace it with the correct one. Only return the corrected submodality name.

    """
    try:
        response = openai_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": "You are an expert in pharmacology."},
                      {"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error processing {drug}: {e}")
        return existing_submodality  # Keep the existing one if an error occurs

# Apply the function to correct the Submodality column
df["Submodality_new"] = df.apply(lambda row: get_corrected_submodality(row["Drug"], row["Modality"], row["Submodality"]), axis=1)

# Save the corrected file
output_file = r"C:\Users\nirmiti.deshmukh\Mindgram\mgts\backend\PricePrediction\data.xlsx"
df.to_excel(output_file, index=False)

print(f"Corrected file saved as {output_file}")
