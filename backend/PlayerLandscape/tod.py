import pandas as pd
 
# Load the Excel file
file_path = "Final_Drug_Sales_Data.xlsx"  # Replace with the actual file path
df = pd.read_excel(file_path)
 
# Function to simplify the Type_of_Drug column
def simplify_drug_type(value):
    value = str(value).lower()  # Convert to lowercase for uniformity
    if "topical" in value:
        return "Topical"
    elif "small molecule" in value:
        return "Small Molecule"
    elif "nsaid" in value:
        return "NSAID"
    elif "oral" in value:
        return "ORAL"
    elif "rectal" in value:
        return "Rectal"
    elif "vaginal" in value:
        return "Vaginal"
    elif "nasal" in value:
        return "Nasal"
    else:
        return value  # Keep the original value if no match is found
 
# Apply the function to the Type_of_Drug column
df['Type_of_Drug'] = df['Type_of_Drug'].apply(simplify_drug_type)
 
# Save the updated file
output_file = "simplified_excel_file.xlsx"  # Replace with desired output file name
df.to_excel(output_file, index=False)
 
print(f"Updated file saved as {output_file}")