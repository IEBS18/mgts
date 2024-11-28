import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import mplcursors
 
# Function 1: Drug Counts by Manufacturer (Bar Chart) *drug count vs manufacturer*
def plot_drug_counts(filtered_df, disease_name):
    drug_counts = filtered_df.groupby('Manufacturer').agg(
        Drug_Count=('TradeName', 'size'),
        Drug_Names=('TradeName', lambda x: ', '.join(x))
    ).reset_index()
 
    plt.figure(figsize=(10, 6))
    bars = sns.barplot(data=drug_counts, x='Manufacturer', y='Drug_Count', palette='viridis')
    plt.title(f'Drug Counts by Manufacturer for {disease_name.title()}', fontsize=14)
    plt.xlabel('Manufacturer', fontsize=12)
    plt.ylabel('Number of Drugs', fontsize=12)
    plt.xticks(rotation=45)
    plt.tight_layout()
 
    # Add hover functionality
    cursor = mplcursors.cursor(bars, hover=True)
    @cursor.connect("add")
    def on_add(sel):
        index = sel.index
        manufacturer = drug_counts.iloc[index]['Manufacturer']
        count = drug_counts.iloc[index]['Drug_Count']
        drugs = drug_counts.iloc[index]['Drug_Names']
        sel.annotation.set(
            text=f"Manufacturer: {manufacturer}\nDrug Count: {count}\nDrugs: {drugs}",
            fontsize=10,
            bbox=dict(boxstyle="round,pad=0.3", edgecolor="black", facecolor="white")
        )
    plt.show()
 
# Function 2: Market Share by Manufacturer (Pie Chart) *revenue 2023(recent one) vs manufacturer*
def plot_market_share(filtered_df, disease_name):
    manufacturer_sales = filtered_df.groupby('Manufacturer')['Revenue_2023_Disease'].sum()
    plt.figure(figsize=(8, 8))
    plt.pie(manufacturer_sales, labels=manufacturer_sales.index, autopct='%1.1f%%', startangle=140, wedgeprops={'width': 0.4})
    plt.title(f"Market Share for Manufacturers in {disease_name.title()}")
    plt.show()
 
# Function 3: Revenue Over Years by Manufacturer (Bar Chart) *years vs manufacturer
def plot_revenue_over_years(filtered_df, disease_name):
    revenue_by_year = filtered_df.melt(
        id_vars=['Manufacturer'],
        value_vars=['Revenue_2019_Disease', 'Revenue_2020_Disease', 'Revenue_2021_Disease',
                    'Revenue_2022_Disease', 'Revenue_2023_Disease'],
        var_name='Year', value_name='Revenue'
    )
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Year', y='Revenue', hue='Manufacturer', data=revenue_by_year)
    plt.title(f"Revenue vs Year for Manufacturers in {disease_name.title()}")
    plt.ylabel("Revenue (USD)")
    plt.show()
 
# Function 4: Drug Type Distribution (Pie Chart) (drug type)
def plot_drug_type_distribution(filtered_df, disease_name):
    drug_type_distribution = filtered_df['Type_of_Drug'].value_counts()
    plt.figure(figsize=(8, 8))
    plt.pie(drug_type_distribution, labels=drug_type_distribution.index, autopct='%1.1f%%', startangle=140)
    plt.title(f"Drug Type Distribution for Treatment of {disease_name.title()}")
    plt.show()
 
# Main function to call individual plots
# def generate_disease_analysis(disease_name):
#     df = pd.read_csv('drug_sales_data.csv')
   
#     if 'Disease' not in df.columns or 'TradeName' not in df.columns:
#         raise ValueError("'Disease' or 'TradeName' column is missing in the dataset.")
 
#     disease_name = disease_name.strip().lower()
#     filtered_df = df[df['Disease'].str.lower() == disease_name]
 
#     if filtered_df.empty:
#         print(f"No data found for the disease: {disease_name.title()}")
#         return
 
#     plot_drug_counts(filtered_df, disease_name)
#     plot_market_share(filtered_df, disease_name)
#     plot_revenue_over_years(filtered_df, disease_name)
#     plot_drug_type_distribution(filtered_df, disease_name)

def get_disease_data(disease_name):
    df = pd.read_excel('PlayerLandscape/Drug_Sales_Data.xlsx')

    if 'Disease' not in df.columns or 'TradeName' not in df.columns:
        raise ValueError("'Disease' or 'TradeName' column is missing in the dataset.")

    disease_name = disease_name.strip().lower()
    filtered_df = df[df['Disease'].str.lower() == disease_name]

    if filtered_df.empty:
        return None

    # Drug Counts by Manufacturer
    drug_counts = filtered_df.groupby('Manufacturer').agg(
        Drug_Count=('TradeName', 'size'),
        Drug_Names=('TradeName', lambda x: ', '.join(x))
    ).reset_index()

    # Market Share by Manufacturer
    manufacturer_sales = filtered_df.groupby('Manufacturer')['Revenue_2023_Disease'].sum()

    # Revenue Over Years by Manufacturer
    revenue_by_year = filtered_df.melt(
        id_vars=['Manufacturer'],
        value_vars=['Revenue_2019_Disease', 'Revenue_2020_Disease', 'Revenue_2021_Disease',
                    'Revenue_2022_Disease', 'Revenue_2023_Disease'],
        var_name='Year', value_name='Revenue'
    )

    # Drug Type Distribution
    drug_type_distribution = filtered_df['Type_of_Drug'].value_counts()

    # Return the data as a dictionary
    data = {
        'drug_counts': drug_counts.to_dict(orient='records'),
        'market_share': manufacturer_sales.to_dict(),
        'revenue_by_year': revenue_by_year.to_dict(orient='records'),
        'drug_type_distribution': drug_type_distribution.to_dict(),
    }
    return data

# Example usage
# generate_disease_analysis("bipolar disorder")