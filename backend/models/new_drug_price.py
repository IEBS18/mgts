import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

class NewDrugPricePredictor:
    def __init__(self, df, rag, sub_llm):
        self.df = df
        self.rag = rag
        self.sub_llm = sub_llm

    def predict_new_drug_price(self, new_drug_data):
        print("function: ", new_drug_data)
        disease_keywords = new_drug_data['disease'].split()
        disease_drugs = self.df[self.df['Indication'].apply(
            lambda x: all(keyword.lower() in str(x).lower() for keyword in disease_keywords)
        )].copy()

        if disease_drugs.empty:
            raise ValueError(f"No comparator drugs found for the disease '{new_drug_data['disease']}'.")

        comparator_prices = []
        for drug_name in disease_drugs['Drug_Name']:
            try:
                current_price = self.rag.get_current_price(drug_name)
                comparator_prices.append(current_price)
            except ValueError:
                print(f"No data available for comparator drug '{drug_name}', skipping.")
                comparator_prices.append(None)

        comparator_prices = np.array([price for price in comparator_prices if price is not None])

        median_price = np.median(comparator_prices)
        deviation = np.std(comparator_prices)
        relevant_prices = [price for price in comparator_prices if median_price - 2 * deviation <= price <= median_price + 2 * deviation]
        avg_comparator_cost = np.mean(relevant_prices)

        embeddings_weight = self.sub_llm.calculate_weights_from_embeddings(self.sub_llm.get_drug_embeddings(new_drug_data))
        adjusted_cost = avg_comparator_cost * embeddings_weight

        # self.visualize_comparator_drug_prices(disease_drugs, adjusted_cost, new_drug_data['Drug_Name'])
        print(adjusted_cost)

        return adjusted_cost

    def visualize_comparator_drug_prices(self, comparator_drugs, predicted_cost, new_drug_name):
        comparator_names = comparator_drugs['Drug_Name'].tolist()
        comparator_prices = []

        for drug_name in comparator_names:
            try:
                current_price = self.rag.get_current_price(drug_name)
                comparator_prices.append(current_price)
            except ValueError:
                print(f"No data available for comparator drug '{drug_name}', skipping.")
                comparator_prices.append(None)

        comparator_prices, comparator_names = zip(*[(price, name) for price, name in zip(comparator_prices, comparator_names) if price is not None])

        median_price = np.median(comparator_prices)
        deviation = np.std(comparator_prices)
        filtered_prices = [(price, name) for price, name in zip(comparator_prices, comparator_names) if median_price - 2 * deviation <= price <= median_price + 2 * deviation]

        filtered_comparator_prices, filtered_comparator_names = zip(*filtered_prices)

        min_price = min(filtered_comparator_prices + (predicted_cost,)) * 0.9
        max_price = max(filtered_comparator_prices + (predicted_cost,)) * 1.1

        plt.figure(figsize=(12, 6))
        plt.scatter(filtered_comparator_names, filtered_comparator_prices, color='blue', label='Comparator Drugs')

        # Plot the predicted price with a red circle
        plt.scatter("Predicted New Drug", predicted_cost, color='red', marker='o', s=100, label='Predicted Price for New Drug')

        # Annotate each comparator drug price
        for name, price in zip(filtered_comparator_names, filtered_comparator_prices):
            plt.text(name, price, f"€{price:.2f}", color='blue', va='bottom', ha='center', fontsize=8)

        # Annotate predicted drug price
        plt.text("Predicted New Drug", predicted_cost, f"€{predicted_cost:.2f}", color='red', va='bottom', ha='center', fontsize=10, fontweight='bold')

        plt.xlabel("Drug Name", fontsize=12)
        plt.ylabel("Price (€)", fontsize=12)
        plt.ylim(min_price, max_price)
        plt.title(f"Current Prices of Comparator Drugs vs Predicted Price for '{new_drug_name}'", fontsize=14)
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)  # Rewind the buffer for reading
        plt.close()  # Close the figure

        # Return the image bytes
        return img


# class NewDrugPricePredictor:
    # def __init__(self, df, rag, sub_llm):
    #     self.df = df
    #     self.rag = rag
    #     self.sub_llm = sub_llm

    # def predict_new_drug_price(self, new_drug_data):
    #     disease_keywords = new_drug_data['disease'].split()
    #     disease_drugs = self.df[self.df['Indication'].apply(
    #         lambda x: all(keyword.lower() in str(x).lower() for keyword in disease_keywords)
    #     )].copy()

    #     if disease_drugs.empty:
    #         raise ValueError(f"No comparator drugs found for the disease '{new_drug_data['disease']}'.")

    #     comparator_prices = []
    #     comparator_names = []
    #     for drug_name in disease_drugs['Drug_Name']:
    #         try:
    #             current_price = self.rag.get_current_price(drug_name)
    #             comparator_prices.append(current_price)
    #             comparator_names.append(drug_name)
    #         except ValueError:
    #             print(f"No data available for comparator drug '{drug_name}', skipping.")

    #     comparator_prices = np.array(comparator_prices)

    #     median_price = np.median(comparator_prices)
    #     deviation = np.std(comparator_prices)
    #     relevant_prices = [price for price in comparator_prices if median_price - 2 * deviation <= price <= median_price + 2 * deviation]
    #     avg_comparator_cost = np.mean(relevant_prices)

    #     embeddings_weight = self.sub_llm.calculate_weights_from_embeddings(self.sub_llm.get_drug_embeddings(new_drug_data))
    #     adjusted_cost = avg_comparator_cost * embeddings_weight

    #     # Return comparator drug data and predicted cost in a JSON-friendly format
    #     return {
    #         'comparator_prices': [{'name': name, 'price': price} for name, price in zip(comparator_names, comparator_prices)],
    #         'predicted_price': adjusted_cost
    #     }