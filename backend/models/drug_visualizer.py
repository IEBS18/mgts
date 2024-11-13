# #drug visualiser

# import pandas as pd
# import matplotlib.pyplot as plt
# import numpy as np

# class DrugVisualizer:
#     def __init__(self, df, rag):
#         self.df = df
#         self.rag = rag

#     def visualize_drug_data(self, drug_name):
#         # Filter data for the selected drug
#         drug_data = self.df[self.df['Drug_Name'].str.lower() == drug_name.lower()].copy()

#         if drug_data.empty:
#             raise ValueError(f"No data found for drug '{drug_name}'")

#         # Sort data by Resolution_Date and retrieve relevant information
#         drug_data['Resolution_Date'] = pd.to_datetime(drug_data['Resolution_Date'], errors='coerce')
#         drug_data = drug_data.sort_values(by='Resolution_Date')

#         historical_years = drug_data['Resolution_Date'].dt.year.tolist()
#         historical_costs = drug_data['Annual_Therapy_Costs'].astype(float).tolist()

#         # Get the last recorded year and cost
#         last_record = drug_data.iloc[-1]
#         last_year = last_record['Resolution_Date'].year
#         last_cost = last_record['Annual_Therapy_Costs']

#         # Fetch the patent expiry year
#         patent_expiry_year = self.rag.get_patent_expiry_year(drug_name)

#         # Project future costs for the next decade, starting from the last year
#         future_years = [last_year + i for i in range(1, 11)]
#         inflation_rate = self.rag.calculate_inflation_rate(drug_name)
#         projected_costs = [last_cost * (1 + inflation_rate) ** i for i in range(1, 11)]

#         # Add fluctuations to the projected costs for variability
#         fluctuations_drug = np.sin(np.linspace(0, 2 * np.pi, len(future_years))) * 0.05
#         projected_costs = [projected_costs[i] * (1 + fluctuations_drug[i]) for i in range(len(future_years))]

#         plt.figure(figsize=(12, 8))
        
#         # Plot historical data in blue
#         plt.plot(historical_years, historical_costs, label='Historical Costs', color='blue', marker='o')
        
#         # Plot projected data in red, starting from the last historical point for continuity
#         plt.plot([last_year] + future_years, [last_cost] + projected_costs, label='Projected Costs (Next Decade)', color='red', linestyle='--', marker='o')
        
#         # Annotate each point with cost values
#         for i, cost in enumerate(historical_costs):
#             plt.text(historical_years[i], cost, f"₹{cost:.2f}", fontsize=8, ha='center', color='blue')
        
#         for i, cost in enumerate(projected_costs):
#             plt.text(future_years[i], cost, f"₹{cost:.2f}", fontsize=8, ha='center', color='red')

#         # Mark the patent expiry date if available
#         if patent_expiry_year:
#             plt.axvline(x=patent_expiry_year, color='purple', linestyle='--', linewidth=1.5, label='Patent Expiry')
#             plt.text(patent_expiry_year, plt.ylim()[1] * 0.9, 'Patent Expiry', color='purple', rotation=90, ha='center', fontsize=10)
        
#         # Labels and title
#         plt.title(f"Annual Therapy Costs for {drug_name} (from {historical_years[0]} to Projected 10 Years)", fontsize=14)
#         plt.xlabel('Year', fontsize=12)
#         plt.ylabel('Annual Therapy Cost (€)', fontsize=12)
#         plt.legend()
#         plt.grid(True)
#         plt.show()

import pandas as pd

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

import io
# import matplotlib.pyplot as plt

class DrugVisualizer:
    def __init__(self, df, rag):
        self.df = df
        self.rag = rag

    def visualize_drug_data(self, drug_name):
        # Filter data for the selected drug
        drug_data = self.df[self.df['Drug_Name'].str.lower() == drug_name.lower()].copy()

        if drug_data.empty:
            raise ValueError(f"No data found for drug '{drug_name}'")

        # Sort data by Resolution_Date and retrieve relevant information
        drug_data['Resolution_Date'] = pd.to_datetime(drug_data['Resolution_Date'], errors='coerce')
        drug_data = drug_data.sort_values(by='Resolution_Date')

        # Extract historical years and costs
        historical_years = drug_data['Resolution_Date'].dt.year.tolist()
        historical_costs = drug_data['Annual_Therapy_Costs'].astype(float).tolist()

        if len(historical_costs) == 1:
            print(f"Only one entry for {drug_name}. Using single data point for future projection.")

        # Get the last recorded year and cost (this will be the base for projection)
        last_record = drug_data.iloc[-1]
        last_year = last_record['Resolution_Date'].year
        last_cost = last_record['Annual_Therapy_Costs']

        # Fetch the patent expiry year
        patent_expiry_year = self.rag.get_patent_expiry_year(drug_name)

        # Project future costs for the next decade, starting from the last year
        future_years = [last_year + i for i in range(1, 11)]
        inflation_rate = self.rag.calculate_inflation_rate(drug_name)
        projected_costs = [last_cost * (1 + inflation_rate) ** i for i in range(1, 11)]

        # Add fluctuations to the projected costs for variability
        fluctuations_drug = np.sin(np.linspace(0, 2 * np.pi, len(future_years))) * 0.05
        projected_costs = [projected_costs[i] * (1 + fluctuations_drug[i]) for i in range(len(future_years))]

        # Generate the plot
        plt.figure(figsize=(12, 8))

        # Plot historical data in blue
        plt.plot(historical_years, historical_costs, label='Historical Costs', color='blue', marker='o')

        # Plot projected data in red
        plt.plot([last_year] + future_years, [last_cost] + projected_costs, label='Projected Costs (Next Decade)', color='red', linestyle='--', marker='o')

        # Annotate historical points
        for i, cost in enumerate(historical_costs):
            plt.text(historical_years[i], cost, f"€{cost:.2f}", fontsize=8, ha='center', color='blue')

        # Annotate projected points
        for i, cost in enumerate(projected_costs):
            plt.text(future_years[i], cost, f"€{cost:.2f}", fontsize=8, ha='center', color='red')

        # Mark the patent expiry date
        if patent_expiry_year:
            plt.axvline(x=patent_expiry_year, color='purple', linestyle='--', linewidth=1.5, label='Patent Expiry')
            plt.text(patent_expiry_year, plt.ylim()[1] * 0.9, 'Patent Expiry', color='purple', rotation=90, ha='center', fontsize=10)

        # Labels and title
        plt.title(f"Annual Therapy Costs for {drug_name} (from {historical_years[0]} to Projected 10 Years)", fontsize=14)
        plt.xlabel('Year', fontsize=12)
        plt.ylabel('Annual Therapy Cost (€)', fontsize=12)
        plt.legend()
        plt.grid(True)

        # Save the plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)  # Rewind the buffer for reading
        plt.close()  # Close the figure

        # Return the image bytes
        return img


# class DrugVisualizer:
#     def __init__(self, df, rag):
#         self.df = df
#         self.rag = rag

#     def visualize_drug_data(self, drug_name):
#         # Filter data for the selected drug
#         drug_data = self.df[self.df['Drug_Name'].str.lower() == drug_name.lower()].copy()

#         if drug_data.empty:
#             raise ValueError(f"No data found for drug '{drug_name}'")

#         # Sort data by Resolution_Date and retrieve relevant information
#         drug_data['Resolution_Date'] = pd.to_datetime(drug_data['Resolution_Date'], errors='coerce')
#         drug_data = drug_data.sort_values(by='Resolution_Date')

#         # Extract historical years and costs
#         historical_years = drug_data['Resolution_Date'].dt.year.tolist()
#         historical_costs = drug_data['Annual_Therapy_Costs'].astype(float).tolist()

#         if len(historical_costs) == 1:
#             print(f"Only one entry for {drug_name}. Using single data point for future projection.")

#         # Get the last recorded year and cost (this will be the base for projection)
#         last_record = drug_data.iloc[-1]
#         last_year = last_record['Resolution_Date'].year
#         last_cost = last_record['Annual_Therapy_Costs']

#         # Fetch the patent expiry year
#         patent_expiry_year = self.rag.get_patent_expiry_year(drug_name)

#         # Project future costs for the next decade, starting from the last year
#         future_years = [last_year + i for i in range(1, 11)]
#         inflation_rate = self.rag.calculate_inflation_rate(drug_name)
#         projected_costs = [last_cost * (1 + inflation_rate) ** i for i in range(1, 11)]

#         # Add fluctuations to the projected costs for variability
#         fluctuations_drug = np.sin(np.linspace(0, 2 * np.pi, len(future_years))) * 0.05
#         projected_costs = [projected_costs[i] * (1 + fluctuations_drug[i]) for i in range(len(future_years))]

#         plt.figure(figsize=(12, 8))
        
#         # Plot historical data in blue (even if there's only one point)
#         plt.plot(historical_years, historical_costs, label='Historical Costs', color='blue', marker='o')
        
#         # Plot projected data in red, starting from the last historical point for continuity
#         plt.plot([last_year] + future_years, [last_cost] + projected_costs, label='Projected Costs (Next Decade)', color='red', linestyle='--', marker='o')
        
#         # Annotate each point with cost values
#         for i, cost in enumerate(historical_costs):
#             plt.text(historical_years[i], cost, f"₹{cost:.2f}", fontsize=8, ha='center', color='blue')
        
#         for i, cost in enumerate(projected_costs):
#             plt.text(future_years[i], cost, f"₹{cost:.2f}", fontsize=8, ha='center', color='red')

#         # Mark the patent expiry date if available
#         if patent_expiry_year:
#             plt.axvline(x=patent_expiry_year, color='purple', linestyle='--', linewidth=1.5, label='Patent Expiry')
#             plt.text(patent_expiry_year, plt.ylim()[1] * 0.9, 'Patent Expiry', color='purple', rotation=90, ha='center', fontsize=10)
        
#         # Labels and title
#         plt.title(f"Annual Therapy Costs for {drug_name} (from {historical_years[0]} to Projected 10 Years)", fontsize=14)
#         plt.xlabel('Year', fontsize=12)
#         plt.ylabel('Annual Therapy Cost (₹)', fontsize=12)
#         plt.legend()
#         plt.grid(True)
#         plt.show()


# import pandas as pd
# import numpy as np

# class DrugVisualizer:
#     def __init__(self, df, rag):
#         self.df = df
#         self.rag = rag

#     def visualize_drug_data(self, drug_name):
#         # Filter data for the selected drug
#         drug_data = self.df[self.df['Drug_Name'].str.lower() == drug_name.lower()].copy()

#         if drug_data.empty:
#             raise ValueError(f"No data found for drug '{drug_name}'")

#         # Sort data by Resolution_Date and retrieve relevant information
#         drug_data['Resolution_Date'] = pd.to_datetime(drug_data['Resolution_Date'], errors='coerce')
#         drug_data = drug_data.sort_values(by='Resolution_Date')

#         # Extract historical years and costs
#         historical_years = drug_data['Resolution_Date'].dt.year.tolist()
#         historical_costs = drug_data['Annual_Therapy_Costs'].astype(float).tolist()

#         if len(historical_costs) == 1:
#             print(f"Only one entry for {drug_name}. Using single data point for future projection.")

#         # Get the last recorded year and cost (this will be the base for projection)
#         last_record = drug_data.iloc[-1]
#         last_year = last_record['Resolution_Date'].year
#         last_cost = last_record['Annual_Therapy_Costs']

#         # Fetch the patent expiry year
#         patent_expiry_year = self.rag.get_patent_expiry_year(drug_name)

#         # Project future costs for the next decade, starting from the last year
#         future_years = [last_year + i for i in range(1, 11)]
#         inflation_rate = self.rag.calculate_inflation_rate(drug_name)
#         projected_costs = [last_cost * (1 + inflation_rate) ** i for i in range(1, 11)]

#         # Add fluctuations to the projected costs for variability
#         fluctuations_drug = np.sin(np.linspace(0, 2 * np.pi, len(future_years))) * 0.05
#         projected_costs = [projected_costs[i] * (1 + fluctuations_drug[i]) for i in range(len(future_years))]

#         # Prepare the result data to return for frontend visualization
#         historical_data = [{"year": year, "cost": cost} for year, cost in zip(historical_years, historical_costs)]
#         projected_data = [{"year": year, "cost": cost} for year, cost in zip(future_years, projected_costs)]

#         return {
#             "historical_data": historical_data,
#             "projected_data": projected_data,
#             "patent_expiry_year": patent_expiry_year
#         }
