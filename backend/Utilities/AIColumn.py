import os
from openai import AzureOpenAI
from dotenv import load_dotenv
from Utilities.query_classifier import get_elasticsearch_results
import sys
sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

# Set up OpenAI API key
openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"

# def update_drug_data(drug_list, header_name, header_description):
#     updated_list = []
    
#     for drug in drug_list:
        
#         drug_name = drug['TradeName']
#         print(drug_name)
#         pubmedresults = get_elasticsearch_results(
#             index="pubmed",
#             query=drug_name,
#             fields=["Title", "AbstractText", "PMID"],
#             operator="OR"
#         )
#         clinicalresults = get_elasticsearch_results(
#             index="clinicaltrial",
#             query=drug_name,
#             fields=["Study Title", "Study Description", "NCT Number", "Study Status", "Conditions",
#                 "Interventions", "Sponsor", "Collaborators", "Study Design", "Phases"],
#             operator="OR"
#         )
#         # print(elasticresults)
#         # print(len(elasticresults))
#         print(len(pubmedresults))
#         print(len(clinicalresults))
#         # Create the prompt to send to OpenAI API
#         drug_context = "\n".join([f"{key}: {value}" for key, value in drug.items()])
#         prompt = (
#             f"Now, based on the provided information, please provide a value for the header '{header_name}'. "
#             f"Description of the header: {header_description}."
#         )
#         Message = [
#             {
#                 "role": "system", 
#                 "content": f'''You are a medical professional providing information about pharmaceutical drugs. 
#                 Here is some information about a drug:\n{drug_context}\n\n
#         Explanation of Drug Data Keys:
#                     - **TradeName**: Commercial or brand name of the drug.
#                     - **Active Ingredient**: The main active pharmaceutical compound in the drug.
#                     - **Type_of_Drug**: Classification of the drug (e.g., small molecule, monoclonal antibody).
#                     - **Disease**: The condition(s) the drug is intended to treat.
#                     - **Country**: Country where the drug information is most applicable or where the drug is available.
#                     - **Symptoms**: Symptoms targeted or alleviated by this drug.
#                     - **Efficacy**: Effectiveness metrics, such as response rate or clinical outcomes.
#                     - **Safety**: Safety considerations and overall safety profile.
#                     - **Adverse_Events**: Possible side effects and adverse reactions from taking the drug.
#                     - **Manufacturer**: The company that produces the drug.
#                     - **Age_Group**: Age group for which the drug is most suitable.
#                     - **Gender**: Demographic information on which gender is more affected or targeted.
#                     - **Morbidity**: Morbidity rates associated with the disease treated by the drug.
#                     - **Mortality**: Mortality rate associated with the disease or drug.
#                     - **Annual_Therapy_Costs**: Estimated yearly cost of the therapy (Convert the currency mentioned in USD, and return in USD only).
#                     - **Price**: Price per unit of the medication strictly in USD.
#                     - **Quality_of_Life**: Impact of the drug on the patient's quality of life.
#                     - **Size**: Packaging information, such as dosage and form (e.g., capsules, vials).
 
#                 "Explanation of PubMed Data Keys:\n"
#                  **Pubmed** data: Involves scientific publications, with attributes like "PMID", "Title", "AbstractText", "Author Name", "Country", "Journal Issue", "PubDate", "ISSN", "ISSN Type" and "type".
#                     the details of each attribute is given below:
#                     [**PMID**:A unique identifier assigned to each article in the PubMed database. It is a Alphanumeric code that allows for easy referencing and retrieval of the specific article.
#                     **Title**:The title of the research article. It provides a brief description of the main topic or findings of the study and is often the first element that researchers and readers will look at.
#                     **AbstractText**:A summary of the research article that includes the main objectives, methods, results, and conclusions. The abstract is designed to give readers a quick overview of the study's content and significance.
#                     **Author Name**:The names of the authors who contributed to the research article. This attribute may include multiple names and is essential for crediting those who conducted the research.
#                     **Country**:The country where the research was conducted or where the authors are based. This information can be important for understanding the geographical context of the study and its implications.
#                     **Journal Issue**:The specific issue of the journal in which the article was published, typically including the volume and issue number. This attribute helps in locating the article within the journal's archive.
#                     **PubDate**:The date when the article was published. This information is crucial for referencing and understanding the timeliness of the research.
#                     **ISSN**:A unique code used to identify the journal in which the article was published. The ISSN helps in distinguishing between different serial publications and is essential for library cataloging.
#                     **ISSN Type**:Indicates whether the ISSN is for the print version, the electronic version, or both. This information is helpful for understanding how the journal is available to readers.
#                     **type**:The classification type is pubmed.]
 
 
#                 **Clinicaltrial** data: Refers to clinical trial information with attributes such as "NCT Number", "Study Status", "Study Title", "Brief Summary", "Study Results", "Conditions", "Interventions", "Sponsor", "Collaborators", "Sex", "Age", "Phases", "Enrollment", "Study Type", "Study Design", "Other IDs", "Start Date", "Primary Completion Date", "Completion Date", "First Posted", "Last Update Posted", "Locations" and "type".
#                    The details of the attributes are:
#                         [**Primary Completion Date**: The date when the last participant's last visit occurred, marking the completion of the primary endpoint data collection.
#                         **Study Title**: The title of the clinical trial, describing its focus or objective.
#                         **Study Status**: The current status of the clinical trial (e.g., Recruiting, Completed, Terminated).
#                         **Sex**: The sex of the participants eligible for the trial (e.g., male, female, both).
#                         **Locations**: The sites where the clinical trial is conducted.
#                         **Sponsor**: The organization or entity that initiates, manages, or finances the clinical trial.
#                         **Completion Date**: The actual date when the trial was completed.
#                         **Study Results**: Findings or outcomes from the clinical trial.
#                         **Conditions**: The medical conditions being studied in the trial.
#                         **Study Description**: A detailed overview of the study's objectives, design, and methodology.
#                         **Brief Summary**: A concise summary of the study's purpose and design.
#                         **Interventions**: The treatments, drugs, or procedures being tested in the trial.
#                         **Phases**: The different stages of the clinical trial (e.g., Phase 1, Phase 2, Phase 3).
#                         **Start Date**: The date when the trial commenced.
#                         **Other IDs**: Additional identifiers related to the trial, which may include registry numbers or codes.
#                         **First Posted**: The date when the trial information was first made publicly available.
#                         **Enrollment**: The number of participants recruited for the trial.
#                         **NCT Number**: The unique identifier assigned to the trial in the ClinicalTrials.gov registry.
#                         **Study Design**: The overall plan or structure of the clinical trial.
#                         **Last Update Posted**: The date of the most recent update to the trial information.
#                         **Collaborators**: Other organizations or entities that are involved in the trial.
#                         **Age**: The age range of participants eligible for the trial.
#                         **Study Type**: The nature of the study (e.g., observational, interventional).
#                         **type**: The classification type is clinicaltrial.] 
#                     ONLY PROVIDE THE VALUE FOR THE HEADER '{header_name}'. NO OTHER INFORMATION IS REQUIRED.
#                     '''
#             },
#             {
#                 "role": "user", 
#                 "content": prompt
#             }
#             ]
#         try:
#             # Call OpenAI API to get the response
#             response = openai_client.chat.completions.create(
#                 model=MODEL,
#                 messages=Message
#             )
#             # Extract the generated value from response
#             new_value = response.choices[0].message.content.strip()
            
#             # Add the new key-value pair to the drug dictionary
#             drug[header_name] = new_value
            
#         except Exception as e:
#             print(f"An error occurred while processing the drug '{drug.get('name', 'Unknown')}': {e}")
#             drug[header_name] = "Error generating value"
        
#         # Append the updated dictionary to the new list
#         updated_list.append(drug)
    
#     return updated_list

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


if __name__ == "__main__":
    # Example usage
    drug_list = [
        {'Active Ingredient': 'Insulin glargine', 'Adverse_Events': 'Hypoglycemia, injection site reactions', 'Age_Group': 'All ages', 'Annual_Therapy_Costs': '1,200 USD', 'Country': 'UK', 'Disease': 'Diabetes', 'Efficacy': 'Very high, effective for blood glucose control', 'Gender': 'Both genders', 'Manufacturer': 'Sanofi', 'Morbidity': '15', 'Mortality': '4', 'Prevalence': '0.086', 'Price': '$50', 'Quality_of_Life': 'High impact, essential for Type 1 and some Type 2 patients', 'Safety': 'Requires careful dosing and monitoring', 'Size': '100 units/mL (vial or pre-filled pen)', 'Symptoms': 'Increased thirst, frequent urination, extreme fatigue, blurred vision, slow healing sores', 'TradeName': 'Insulin Glargine', 'Type_of_Drug': 'Insulin'}, {'Active Ingredient': 'Insulin glargine', 'Adverse_Events': 'Hypoglycemia, injection site reactions', 'Age_Group': 'All ages, predominantly adult', 'Annual_Therapy_Costs': '$1,200 - $1,500', 'Country': 'Switzerland', 'Disease': 'Diabetes', 'Efficacy': 'High as a long-acting insulin for blood glucose control', 'Gender': 'Balanced prevalence', 'Manufacturer': 'Sanofi', 'Morbidity': '30', 'Mortality': '3', 'Prevalence': '6.3', 'Price': '$30 - $50 per vial', 'Quality_of_Life': 'Moderate impact; requires regular monitoring', 'Safety': 'Caution needed in adjusting doses', 'Size': '100 units/mL (10 mL vial)', 'Symptoms': 'Increased thirst, frequent urination, extreme fatigue, blurred vision, slow-healing sores', 'TradeName': 'Insulin glargine', 'Type_of_Drug': 'Insulin'}, {'Active Ingredient': 'Insulin glargine', 'Adverse_Events': 'Hypoglycemia, injection site reactions', 'Age_Group': 'Primarily children and young adults, onset usually before age 30', 'Annual_Therapy_Costs': 'Approximately 6,500 USD', 'Country': 'USA', 'Disease': 'Type 1 Diabetes', 'Efficacy': 'Highly effective for long-term blood glucose control', 'Gender': 'Affects both genders approximately equally', 'Manufacturer': 'Sanofi', 'Morbidity': '20', 'Mortality': '3', 'Prevalence': 'Approximately 0.2% of the population (over 200,000 people)', 'Price': '268 $ (for a 10 mL vial)', 'Quality_of_Life': 'Significant impact due to daily blood glucose monitoring and insulin administration', 'Safety': 'Generally safe with a low incidence of adverse events', 'Size': '100 units/mL', 'Symptoms': 'Increased thirst, frequent urination, extreme hunger, fatigue, blurred vision', 'TradeName': 'Lantus', 'Type_of_Drug': 'Small molecules'}, {'Active Ingredient': 'Insulin glargine', 'Adverse_Events': 'Hypoglycemia, allergic reactions', 'Age_Group': 'Primarily children and young adults', 'Annual_Therapy_Costs': '800', 'Country': 'UK', 'Disease': 'Type 1 Diabetes', 'Efficacy': 'High, provides stable blood glucose control', 'Gender': 'Equal prevalence in males and females', 'Manufacturer': 'Sanofi', 'Morbidity': '15', 'Mortality': '1', 'Prevalence': '0.2', 'Price': '$35', 'Quality_of_Life': 'Moderate impact due to daily management and risks of complications', 'Safety': 'Generally safe, requires dose adjustments and monitoring', 'Size': '100 units/mL-10 mL', 'Symptoms': 'Increased thirst, frequent urination, extreme fatigue, blurred vision, unintended weight loss', 'TradeName': 'Lantus', 'Type_of_Drug': 'Small molecules'}, {'Active Ingredient': 'Insulin glargine', 'Adverse_Events': 'Hypoglycemia, injection site reactions', 'Age_Group': 'All age groups, primarily children and young adults', 'Annual_Therapy_Costs': '$4,000', 'Country': 'Switzerland', 'Disease': 'Type 1 Diabetes', 'Efficacy': 'High if properly managed', 'Gender': 'Equal prevalence in males and females', 'Manufacturer': 'Sanofi', 'Morbidity': '25', 'Mortality': '0.1', 'Prevalence': '0.004', 'Price': '$50', 'Quality_of_Life': 'Moderate to severe impact due to daily management', 'Safety': 'Generally safe; hypoglycemia if overdosed', 'Size': '10 ml vial (100 units/ml)', 'Symptoms': 'Increased thirst, frequent urination, extreme fatigue, unexpected weight loss, blurred vision', 'TradeName': 'Lantus', 'Type_of_Drug': 'Small molecules (insulin)'}
    ]

    header_name = "prevalence of disease"
    header_description = "what is the prevalence of the disease treated by the drug?"

    updated_drug_list = update_drug_data(drug_list, header_name, header_description)
    print(updated_drug_list)
