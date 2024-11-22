import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# Set up OpenAI API key
openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = "gpt-4o-mini"

def update_drug_data(drug_list, header_name, header_description):
    updated_list = []
    
    for drug in drug_list:
        # Create the prompt to send to OpenAI API
        drug_context = "\n".join([f"{key}: {value}" for key, value in drug.items()])
        prompt = (
            f"Now, based on the provided information, please provide a value for the header '{header_name}'. "
            f"Description of the header: {header_description}."
        )
        Message = [
            {
                "role": "system", 
                "content": f'''You are a medical professional providing information about pharmaceutical drugs. 
                        Here is some information about a drug:\n{drug_context}\n\n
                        Explanation of Drug Data Keys:
                    - **TradeName**: Commercial or brand name of the drug.
                    - **Active Ingredient**: The main active pharmaceutical compound in the drug.
                    - **Type_of_Drug**: Classification of the drug (e.g., small molecule, monoclonal antibody).
                    - **Disease**: The condition(s) the drug is intended to treat.
                    - **Country**: Country where the drug information is most applicable or where the drug is available.
                    - **Symptoms**: Symptoms targeted or alleviated by this drug.
                    - **Efficacy**: Effectiveness metrics, such as response rate or clinical outcomes.
                    - **Safety**: Safety considerations and overall safety profile.
                    - **Adverse_Events**: Possible side effects and adverse reactions from taking the drug.
                    - **Manufacturer**: The company that produces the drug.
                    - **Age_Group**: Age group for which the drug is most suitable.
                    - **Gender**: Demographic information on which gender is more affected or targeted.
                    - **Morbidity**: Morbidity rates associated with the disease treated by the drug.
                    - **Mortality**: Mortality rate associated with the disease or drug.
                    - **Annual_Therapy_Costs**: Estimated yearly cost of the therapy (Convert the currency mentioned in USD, and return in USD only).
                    - **Price**: Price per unit of the medication strictly in USD.
                    - **Quality_of_Life**: Impact of the drug on the patient's quality of life.
                    - **Size**: Packaging information, such as dosage and form (e.g., capsules, vials).
                    
                    ONLY PROVIDE THE VALUE FOR THE HEADER '{header_name}'. NO OTHER INFORMATION IS REQUIRED.
                    '''
            },
            {
                "role": "user", 
                "content": prompt
            }
            ]
        try:
            # Call OpenAI API to get the response
            response = openai_client.chat.completions.create(
                model=MODEL,
                messages=Message
            )
            # Extract the generated value from response
            new_value = response.choices[0].message.content.strip()
            
            # Add the new key-value pair to the drug dictionary
            drug[header_name] = new_value
            
        except Exception as e:
            print(f"An error occurred while processing the drug '{drug.get('name', 'Unknown')}': {e}")
            drug[header_name] = "Error generating value"
        
        # Append the updated dictionary to the new list
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
