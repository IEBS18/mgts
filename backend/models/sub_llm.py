#subllm model
from embeddings.utils import combine_embeddings, calculate_weightage, get_text_embeddings

class SubLLM:
    def __init__(self, group_data=None):
        self.group_data = group_data

    def calculate_weights(self):
        if not self.group_data:
            raise ValueError("Group data is not provided for existing drugs.")
        
        combined_disease_embeddings = combine_embeddings(self.group_data["disease_embeddings"], self.group_data["numeric_data"])
        combined_comparator_embeddings = combine_embeddings(self.group_data["comparator_therapy_embeddings"], self.group_data["numeric_data"])
        combined_benefit_embeddings = combine_embeddings(self.group_data["benefit_assessment_embeddings"], self.group_data["numeric_data"])


        disease_weight = calculate_weightage(combined_disease_embeddings)
        print('subllm1 weight (disease):', disease_weight)
        comparator_weight = calculate_weightage(combined_comparator_embeddings)
        print('subllm2 weight (comparator):', comparator_weight)
        benefit_weight = calculate_weightage(combined_benefit_embeddings)
        print('subllm3 weight (benefit assessment):', benefit_weight)


        total_weight = (disease_weight + comparator_weight + benefit_weight) / 3
        
        return total_weight

    def get_drug_embeddings(self, drug_data):
        numeric_data = [
            drug_data['mortality'], 
            drug_data['morbidity'], 
            drug_data['quality_of_life'],
            drug_data['Total_Adverse_Events'],
            drug_data['Adverse_Event_Discontinuation'],
            drug_data['Serious_Adverse_Events']
        ]
        
        text_data = " ".join([
            str(drug_data['Benefit_Assessment']),
            str(drug_data['Side_Effects']),
            str(drug_data['Combination_Therapy'])
        ])
        
        text_embeddings = get_text_embeddings(text_data)
        
        combined_embeddings = combine_embeddings(text_embeddings, numeric_data)
        
        return combined_embeddings

    def calculate_weights_from_embeddings(self, embeddings):
        weight = calculate_weightage(embeddings)
        return weight
