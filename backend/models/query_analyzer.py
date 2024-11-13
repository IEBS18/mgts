#models.query_Analyzer.py
from embeddings.utils import get_text_embeddings

class MainLLM:
    def __init__(self):
        pass

    def query_analyzer(self, query):
        drug_name, year = self._parse_query(query)
        return {"drug_name": drug_name, "year": year} 

    def _parse_query(self, query):
        tokens = query.split()
        drug_name = tokens[3]  
        year = tokens[-1]
        return drug_name, year

    def re_router(self, drug_data):
        disease_text = " ".join([str(drug_data[col]) for col in ["Indication", "Morbidity_(PFS)", "Mortality_Difference", "Quality_of_Life"]])
        comparator_therapy_text = " ".join([str(drug_data[col]) for col in ["Comparator_Therapy", "Annual_Comparitive_Therapy_Costs", "Benefit_Assessment", "Combination_Therapy", "Annual_Therapy_Costs"]])
        benefit_assessment_text = " ".join([str(drug_data[col]) for col in ["Side_Effects", "Total_Adverse_Events", "Serious_Adverse_Events", "Adverse_Event_Discontinuation"]])

        # Generate embeddings
        disease_embeddings = get_text_embeddings(disease_text)
        comparator_therapy_embeddings = get_text_embeddings(comparator_therapy_text)
        benefit_assessment_embeddings = get_text_embeddings(benefit_assessment_text)

        return {
            "disease_embeddings": disease_embeddings,
            "comparator_therapy_embeddings": comparator_therapy_embeddings,
            "benefit_assessment_embeddings": benefit_assessment_embeddings,
            "numeric_data": [
                drug_data["Morbidity_(PFS)"], drug_data["Adverse_Event_Discontinuation"],
                drug_data["Mortality_Difference"], drug_data["Quality_of_Life"],
                drug_data["Total_Adverse_Events"], drug_data["Annual_Comparitive_Therapy_Costs"],
                drug_data["Serious_Adverse_Events"], drug_data["Annual_Therapy_Costs"]
            ]
        }
