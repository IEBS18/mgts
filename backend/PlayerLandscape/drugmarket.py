import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import mplcursors
 
def charts(data, active_ingredient, graph_choice):
    if graph_choice == '1':
        # Donut chart of the top 10 diseases that are being treated by the drug
        plt.figure(figsize=(10, 6))
 
        # Get the top 10 diseases
        top_diseases = data['Disease'].value_counts().nlargest(10)
 
        # Create the pie chart
        plt.pie(top_diseases, labels=top_diseases.index, autopct='%1.1f%%', startangle=140)
 
        # Add a circle to make it a donut chart
        centre_circle = plt.Circle((0, 0), 0.70, fc='white')
        fig = plt.gcf()
        fig.gca().add_artist(centre_circle)
 
        plt.axis('equal')
        plt.title(f'Distribution of Top 10 Diseases Treated by {active_ingredient}')
        plt.show()
 
    elif graph_choice == '2':
        plt.figure(figsize=(12, 8))
 
        # Create the bubble chart
        ax = sns.scatterplot(
            x='TradeName',
            y='Annual_Therapy_Costs',
            size='Annual_Therapy_Costs',
            hue='Disease',  # Add hue as Disease
            data=data,
            sizes=(20, 200),
            alpha=0.7
        )
 
        # Add title and labels
        plt.title(f'Annual Therapy Cost vs Drug Name for {active_ingredient}', fontsize=14)
        plt.xlabel('Drug Name', fontsize=12)
        plt.ylabel('Annual Therapy Cost ($)', fontsize=12)
 
    # Rotate x-axis labels for better readability
        plt.xticks(rotation=45, ha='right')
 
    # Add hover labels using mplcursors
        cursor = mplcursors.cursor(ax.collections, hover=True)
 
        @cursor.connect("add")
        def on_add(sel):
            index = sel.index  # Index of the point in the data
            sel.annotation.set_text(
                f"Disease: {data.iloc[index]['Disease']}\n"
                f"Cost: ${data.iloc[index]['Annual_Therapy_Costs']:,.0f}\n"
                f"Drug: {data.iloc[index]['TradeName']}"
        )
 
        # Adjust layout and show the plot
        # plt.legend(title='Disease')
        # plt.tight_layout()
        plt.show()
    elif graph_choice == '3':
        # Competitive matrix (heatmap) of the drugs using Adverse_Affect_Score and Morbidity
        plt.figure(figsize=(12, 8))
        pivot_data = data.pivot_table(index='Drug_Name', columns='Adverse_Affect_Score', values='Morbidity', aggfunc='mean')
        sns.heatmap(pivot_data, cmap='coolwarm', annot=True, fmt=".1f")
        plt.title(f'Competitive Matrix of Drugs for {active_ingredient}')
        plt.xlabel('Adverse Affect Score')
        plt.ylabel('Drug Name')
        plt.show()
    else:
        print("Invalid choice! Please select a valid graph option (1, 2, or 3).")
 
# Load the data
data = pd.read_excel("Drug_data\\UK_Italy_data.xlsx")
 
# Display the first few rows of the data
print(data.head())
 
# User enters the active ingredient of the drug
active_ingredient = input("Enter the active ingredient of the drug: ")
 
# User filters the data by country
country = input("Enter the country to filter by (or leave blank for all countries): ")
 
# Drop rows with NaN in the relevant columns
data = data.dropna(subset=['Active Ingredient', 'Country'])
 
# Filter the data based on the active ingredient and country
filtered_data = data[data['Active Ingredient'].str.contains(active_ingredient, case=False)]
if country:
    filtered_data = filtered_data[filtered_data['Country'].str.contains(country, case=False)]
 
# Display the filtered data
print(filtered_data)
 
# Ensure there's data to visualize
if filtered_data.empty:
    print("No data found for the given filters!")
else:
    # Display graph options
    print("\nSelect the graph to display:")
    print("1. Distribution of Diseases Treated by the Drug (Donut Chart)")
    print("2. Annual Therapy Cost vs Drug Name (Bubble Chart)")
    print("3. Competitive Matrix (Heatmap)")
    graph_choice = input("Enter your choice (1, 2, or 3): ")
 
    # Generate the selected chart based on the filtered data
    charts(filtered_data, active_ingredient, graph_choice)