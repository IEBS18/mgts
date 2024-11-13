# import pandas as pd

# class RAG:
#     def __init__(self, historical_data_path):
#         self.historical_data = pd.read_csv(historical_data_path)
#         # Ensure Resolution_Date is converted to datetime during initialization
#         self.historical_data['Resolution_Date'] = pd.to_datetime(self.historical_data['Resolution_Date'], errors='coerce')

#     def get_first_appearance_year(self, Drug_Name):
#         drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == Drug_Name.lower()].copy()
#         if drug_data.empty:
#             raise ValueError(f"No data found for drug '{Drug_Name}'")
#         drug_data['Year'] = drug_data['Resolution_Date'].dt.year
#         start_year = drug_data['Year'].min()
#         print('Start Year:', start_year)
#         return start_year

#     def calculate_inflation_rate(self, Drug_Name):
#         # Filter for the specific drug and copy to avoid SettingWithCopyWarning
#         drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == Drug_Name.lower()].copy()
#         if drug_data.empty:
#             raise ValueError(f"No data found for drug '{Drug_Name}'")

#         # Ensure 'Annual_Therapy_Costs' is in string format only if needed, then clean and convert to numeric
#         if drug_data['Annual_Therapy_Costs'].dtype != 'object':
#             drug_data['Annual_Therapy_Costs'] = drug_data['Annual_Therapy_Costs'].astype(str)
#         drug_data['Annual_Therapy_Costs'] = pd.to_numeric(drug_data['Annual_Therapy_Costs'].str.replace(r'[^0-9.]', ''), errors='coerce')

#         # Sort by date to get the most recent records for inflation calculation
#         drug_data = drug_data.sort_values(by='Resolution_Date', ascending=False)
#         if len(drug_data) < 2:
#             raise ValueError(f"Not enough historical data for '{Drug_Name}' to calculate inflation.")

#         # Calculate inflation based on the two most recent records
#         recent_year_data = drug_data.iloc[0]
#         previous_year_data = drug_data.iloc[1]
#         inflation_rate_medical = (recent_year_data['Annual_Therapy_Costs'] - previous_year_data['Annual_Therapy_Costs']) / previous_year_data['Annual_Therapy_Costs']
#         print('Medical Inflation Rate:', inflation_rate_medical)
#         return inflation_rate_medical

#     def get_country_inflation_rate(self):
#         return 0.04  # Hardcoded for now

#     def get_current_price(self, drug_name):
#         drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == drug_name.lower()].copy()
#         if drug_data.empty:
#             raise ValueError(f"No data found for drug '{drug_name}'")
        
#         # Sort to get the latest price
#         drug_data = drug_data.sort_values(by='Resolution_Date', ascending=False)
#         latest_record = drug_data.iloc[0]
#         latest_cost = latest_record['Annual_Therapy_Costs']

#         # Ensure 'Resolution_Date' is in datetime format and calculate years difference
#         latest_record_date = pd.to_datetime(latest_record['Resolution_Date'], errors='coerce')
#         if pd.isnull(latest_record_date):
#             raise ValueError(f"No valid Resolution_Date for drug '{drug_name}'")
        
#         current_year = pd.Timestamp.now().year
#         years_diff = current_year - latest_record_date.year
#         inflation_rate = self.calculate_inflation_rate(drug_name)
        
#         current_price = latest_cost * (1 + inflation_rate) ** years_diff
#         return current_price

#     def get_current_inflation_rate(self, drug_name):
#         try:
#             inflation_rate_medical = self.calculate_inflation_rate(drug_name)
#         except ValueError:
#             print(f"No historical data found for drug '{drug_name}', skipping medical inflation.")
#             inflation_rate_medical = 0
#         inflation_rate_country = self.get_country_inflation_rate()
#         combined_inflation_rate = (inflation_rate_medical + inflation_rate_country) / 2 if inflation_rate_medical != 0 else inflation_rate_country
#         print('Combined Inflation Rate:', combined_inflation_rate)
#         return combined_inflation_rate

#     def get_patent_expiry_year(self, drug_name):
#         drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == drug_name.lower()]
#         if drug_data.empty:
#             raise ValueError(f"No data found for drug '{drug_name}'")
#         patent_expiry = drug_data['Patent_Expiry_Date'].dropna()
#         if not patent_expiry.empty:
#             return int(patent_expiry.iloc[0])
        
#         latest_resolution_date = pd.to_datetime(drug_data['Resolution_Date']).max()
#         fallback_year = latest_resolution_date.year + 10 if pd.notna(latest_resolution_date) else None
#         print(f"Using fallback patent expiry year for {drug_name}: {fallback_year}")
#         return fallback_year

#     def retrieve_historical_costs_for_disease(self, disease):
#         disease_drugs = self.historical_data[self.historical_data['Indication'].str.contains(disease, case=False, na=False)]
#         if disease_drugs.empty:
#             raise ValueError(f"No comparator drugs found for the disease '{disease}'.")
#         historical_costs = disease_drugs['Annual_Therapy_Costs'].astype(float)
#         return historical_costs

#     def retrieve_historical_cost(self, Drug_Name):
#         drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == Drug_Name.lower()]
#         return drug_data["Annual_Therapy_Costs"].values

#     def multi_agent_rag(self, sub_llm_output, historical_costs):
#         weighted_average = sum(historical_costs) / len(historical_costs) if historical_costs.size > 0 else 0
#         final_cost = weighted_average + sub_llm_output 
#         print('Final Cost:', final_cost)
#         return final_cost


import pandas as pd

class RAG:
    def __init__(self, historical_data_path):
        self.historical_data = pd.read_csv(historical_data_path)
        # Ensure Resolution_Date is converted to datetime during initialization
        self.historical_data['Resolution_Date'] = pd.to_datetime(self.historical_data['Resolution_Date'], errors='coerce')

    def get_first_appearance_year(self, Drug_Name):
        drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == Drug_Name.lower()].copy()
        if drug_data.empty:
            raise ValueError(f"No data found for drug '{Drug_Name}'")
        drug_data['Year'] = drug_data['Resolution_Date'].dt.year
        start_year = drug_data['Year'].min()
        print('Start Year:', start_year)
        return start_year

    def calculate_inflation_rate(self, Drug_Name):
        # Filter for the specific drug and copy to avoid SettingWithCopyWarning
        drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == Drug_Name.lower()].copy()
        if drug_data.empty:
            raise ValueError(f"No data found for drug '{Drug_Name}'")

        # Ensure 'Annual_Therapy_Costs' is in string format only if needed, then clean and convert to numeric
        if drug_data['Annual_Therapy_Costs'].dtype != 'object':
            drug_data['Annual_Therapy_Costs'] = drug_data['Annual_Therapy_Costs'].astype(str)
        drug_data['Annual_Therapy_Costs'] = pd.to_numeric(drug_data['Annual_Therapy_Costs'].str.replace(r'[^0-9.]', ''), errors='coerce')

        # Sort by date to get the most recent records for inflation calculation
        drug_data = drug_data.sort_values(by='Resolution_Date', ascending=False)

        # Handle case where there is less than 2 data points for inflation calculation
        if len(drug_data) < 2:
            print(f"Not enough historical data for '{Drug_Name}' to calculate inflation. Using fallback inflation rate.")
            return self.get_country_inflation_rate()  # Fallback to default inflation rate

        # Calculate inflation based on the two most recent records
        recent_year_data = drug_data.iloc[0]
        previous_year_data = drug_data.iloc[1]
        inflation_rate_medical = (recent_year_data['Annual_Therapy_Costs'] - previous_year_data['Annual_Therapy_Costs']) / previous_year_data['Annual_Therapy_Costs']
        print('Medical Inflation Rate:', inflation_rate_medical)
        return inflation_rate_medical

    def get_country_inflation_rate(self):
        return 0.04  # Hardcoded fallback inflation rate

    def get_current_price(self, drug_name):
        drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == drug_name.lower()].copy()
        if drug_data.empty:
            raise ValueError(f"No data found for drug '{drug_name}'")
        
        # Sort to get the latest price
        drug_data = drug_data.sort_values(by='Resolution_Date', ascending=False)
        latest_record = drug_data.iloc[0]
        latest_cost = latest_record['Annual_Therapy_Costs']

        # Ensure 'Resolution_Date' is in datetime format and calculate years difference
        latest_record_date = pd.to_datetime(latest_record['Resolution_Date'], errors='coerce')
        if pd.isnull(latest_record_date):
            raise ValueError(f"No valid Resolution_Date for drug '{drug_name}'")
        
        current_year = pd.Timestamp.now().year
        years_diff = current_year - latest_record_date.year
        inflation_rate = self.calculate_inflation_rate(drug_name)
        
        current_price = latest_cost * (1 + inflation_rate) ** years_diff
        return current_price

    def get_current_inflation_rate(self, drug_name):
        try:
            inflation_rate_medical = self.calculate_inflation_rate(drug_name)
        except ValueError:
            print(f"No historical data found for drug '{drug_name}', skipping medical inflation.")
            inflation_rate_medical = 0
        inflation_rate_country = self.get_country_inflation_rate()
        combined_inflation_rate = (inflation_rate_medical + inflation_rate_country) / 2 if inflation_rate_medical != 0 else inflation_rate_country
        print('Combined Inflation Rate:', combined_inflation_rate)
        return combined_inflation_rate

    def get_patent_expiry_year(self, drug_name):
        drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == drug_name.lower()]
        if drug_data.empty:
            raise ValueError(f"No data found for drug '{drug_name}'")
        patent_expiry = drug_data['Patent_Expiry_Date'].dropna()
        if not patent_expiry.empty:
            return int(patent_expiry.iloc[0])
        
        latest_resolution_date = pd.to_datetime(drug_data['Resolution_Date']).max()
        fallback_year = latest_resolution_date.year + 10 if pd.notna(latest_resolution_date) else None
        print(f"Using fallback patent expiry year for {drug_name}: {fallback_year}")
        return fallback_year

    def retrieve_historical_costs_for_disease(self, disease):
        disease_drugs = self.historical_data[self.historical_data['Indication'].str.contains(disease, case=False, na=False)]
        if disease_drugs.empty:
            raise ValueError(f"No comparator drugs found for the disease '{disease}'.")
        historical_costs = disease_drugs['Annual_Therapy_Costs'].astype(float)
        return historical_costs

    def retrieve_historical_cost(self, Drug_Name):
        drug_data = self.historical_data[self.historical_data['Drug_Name'].str.lower() == Drug_Name.lower()]
        return drug_data["Annual_Therapy_Costs"].values

    def multi_agent_rag(self, sub_llm_output, historical_costs):
        weighted_average = sum(historical_costs) / len(historical_costs) if historical_costs.size > 0 else 0
        final_cost = weighted_average + sub_llm_output 
        print('Final Cost:', final_cost)
        return final_cost