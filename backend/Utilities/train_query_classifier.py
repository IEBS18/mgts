import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, BertForSequenceClassification, AdamW
import pickle
from sklearn.preprocessing import MultiLabelBinarizer
 
class QueryDataset(Dataset):
    def __init__(self, queries, labels, tokenizer, max_len=64):
        self.queries = queries
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len
 
    def __len__(self):
        return len(self.queries)
 
    def __getitem__(self, index):
        query = self.queries[index]
        label = self.labels[index]
 
        encoding = self.tokenizer.encode_plus(
            query,
            add_special_tokens=True,
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
 
        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'labels': torch.tensor(label, dtype=torch.float32)
        }
 
class QueryClassifierModel(nn.Module):
    def __init__(self, num_labels=3):
        super(QueryClassifierModel, self).__init__()
        self.num_labels = num_labels
        self.bert = BertForSequenceClassification.from_pretrained('dmis-lab/biobert-v1.1', num_labels=self.num_labels)
   
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        return outputs.logits
 
data = [
("What is the association between the drug and disease?", [2]),
("Give me the PubMed articles for the drug and clinical trial information for the disease.", [0, 1]),
("Tell me the PubMed details for the drug and the drug-disease association.", [0, 2]),
("Tell me the relationship between the drug and disease.", [2]),
("Give me the PubMed details for the drug and correlation with the disease.", [0, 2]),
("What are the clinical trials for the disease and the relationship with the drug?", [1, 2]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Tell me the clinical trials for the disease and its association with the drug.", [1, 2]),
("Give me the clinical trials for the disease and PubMed articles for the drug.", [0, 1]),
("What are the adverse reactions of MS treatments, and how do they relate to disease progression?", [2, 1]),
("How do patient outcomes differ based on the type of disease-modifying therapy used for MS?", [1, 2]),
("Does the age of diagnosis affect the effectiveness of MS treatments?", [2, 0]),
("What impact do recent clinical trial results have on the approval of new MS drugs?", [1]),
("How does the genetic predisposition influence the efficacy of MS treatments?", [0, 2]),
("What are the key findings from PubMed articles about the role of genetics in MS therapy?", [0]),
("How does the incidence of MS in young adults compare to older populations in terms of treatment options?", [2, 0]),
("What is the connection between MS and vitamin D levels, and how does this affect treatment outcomes?", [0, 2]),
("How does the market for oral MS therapies compare with injectable treatments in terms of patient preference?", [1, 2]),
("What is the effect of socioeconomic status on MS treatment choices and clinical trial outcomes?", [1, 0]),
("What are the latest clinical trials on MS and how do they evaluate the efficacy of new drugs?", [1]),
("How do recent PubMed studies on MS help inform current clinical trial designs?", [0, 1]),
("What impact do lifestyle interventions (e.g., diet, exercise) have on MS disease progression?", [2]),
("How does drug resistance in MS therapies influence the search for new treatment options?", [2]),
("How does the frequency of MS relapse impact the choice of therapeutic strategies?", [1, 2]),
("What role do inflammatory markers play in predicting the effectiveness of MS treatments?", [0, 2]),
("Can MS patients with progressive forms benefit from clinical trials on new biologic therapies?", [1, 2]),
("What are the long-term effects of MS drugs on fertility, and how are they addressed in clinical trials?", [1, 2]),
("How do clinical trials evaluate the potential of stem cell therapy in MS treatment?", [1]),
("What are the top PubMed studies on the efficacy of interferon beta for treating MS?", [0]),
("What is the role of monoclonal antibodies in treating MS, and what do the clinical trials say?", [1, 2]),
("How does the use of high-dose steroids impact MS symptoms and long-term prognosis?", [1]),
("What are the findings of recent clinical trials on the use of cannabinoids for MS symptom management?", [1]),
("How do age and gender affect the prevalence of MS, and what does this imply for treatment development?", [0, 2]),
("What are the most promising new treatments for MS according to PubMed research?", [0]),
("What are the major clinical trials investigating MS drug efficacy in pediatric patients?", [1]),
("How does MS treatment adherence vary by country, and how is this linked to disease outcomes?", [1, 2]),
("What are the key PubMed studies on MS relapse prevention strategies?", [0]),
("What is the relationship between MS and comorbid conditions like depression, and how does it affect treatment?", [2, 0]),
("How do different forms of MS influence treatment decisions and the selection of clinical trial participants?", [2]),
("What role do biomarkers play in predicting the efficacy of MS therapies?", [0, 1, 2]),
("What are the challenges in diagnosing MS at an early stage, and how does this affect treatment outcomes?", [0]),
("What clinical trials are currently testing new treatments for MS and what are their goals?", [1]),
("How does the availability of generic drugs impact MS treatment costs and accessibility?", [2]),
("What are the safety profiles of MS treatments, and how are these evaluated in clinical trials?", [1, 2]),
("How do MS treatments vary by disease stage (e.g., relapse-remitting, secondary progressive)?", [1, 2]),
("What is the relationship between MS disease progression and the need for combination therapy?", [2]),
("How are MS drugs monitored for safety post-market, and what role does pharmacovigilance play?", [2]),
("How do clinical trials influence MS treatment guidelines?", [1]),
("What is the impact of socioeconomic disparities on the access to MS treatments?", [1, 2]),
("How do new MS therapies compare to older therapies in terms of long-term safety?", [1, 2]),
("What are the challenges in diagnosing MS in women, and how does this affect treatment strategies?", [0]),
("How do MS treatments affect quality of life, and what do recent studies say?", [1, 2]),
("What role does insurance coverage play in the adoption of new MS treatments?", [2]),
("What are the potential implications of MS drug patents expiring for the treatment market?", [2]),
("How do clinical trials account for comorbidities in MS patients?", [1]),
("What is the connection between smoking and MS progression, and how does this impact treatment choices?", [2]),
("How does the prevalence of MS vary between different ethnic groups, and what does this imply for treatment?", [0, 2]),
("What clinical trials are exploring combination therapies for MS?", [1]),
("How does the availability of new MS therapies impact the long-term prognosis for patients?", [1, 2]),
("How do public health policies impact the availability of MS treatments?", [1]),
("What are the factors influencing drug discontinuation in MS treatment?", [2]),
("How do patient perceptions of MS therapies impact treatment adherence?", [1]),
("What is the role of clinical trials in establishing the effectiveness of newer MS therapies?", [1]),
("How do MS treatments affect the mental health of patients?", [1, 2]),
("What are the key findings from clinical trials about the long-term effects of MS therapies?", [1]),
("How does early intervention impact the effectiveness of MS treatments?", [2]),
("How does the type of MS (relapsing vs. progressive) influence the drug-disease relationship?", [1, 2]),
("What is the role of pharmacogenomics in customizing MS treatments?", [0, 2]),
("What are the clinical outcomes of new therapies in the treatment of progressive MS?", [1, 2]),
("How do new diagnostic techniques influence the early detection and treatment of MS?", [0]),
("What is the relationship between MS and autoimmune diseases, and how does this affect treatment?", [0, 2]),
("How does environmental exposure to pollutants influence the onset of MS, and what are the implications for treatment?", [2]),
("How do MS treatments influence the cognitive function of patients?", [1, 2]),
("What role does MS patient education play in improving treatment outcomes?", [0]),
("How does the effectiveness of MS drugs change with age?", [2]),
("How are biomarkers used to personalize MS treatment plans?", [0, 1]),
("What clinical trials are exploring the use of novel oral therapies for MS?", [1]),
("What role does MS advocacy play in shaping treatment options?", [0]),
("How do clinical trials involving MS patients address treatment side effects?", [1]),
("What are the latest PubMed articles about advancements in MS drug therapies?", [0]),
("What are the economic implications of treating MS in low-income regions?", [2]),
("How does the incidence of MS in children differ from adults in terms of treatment responses?", [2, 1]),
("What is the connection between vitamin D deficiency and the severity of MS symptoms?", [0, 2]),
("What are the major challenges in enrolling MS patients in clinical trials?", [1]),
("How do MS drugs compare in terms of cost-effectiveness?", [2]),
("What factors are considered when selecting patients for MS clinical trials?", [1]),
("How do clinical trials measure the progression of MS in patients?", [1]),
("What are the emerging biomarkers for MS that could influence treatment strategies?", [0, 2]),
("How does MS treatment differ for pediatric vs. adult populations?", [1, 2]),
("What are the clinical outcomes of treating MS with stem cell therapies?", [1]),
("How do lifestyle changes influence MS disease management?", [2]),
("What are the clinical trial results on using monoclonal antibodies for MS?", [1]),
("How does comorbid diabetes affect MS treatment plans?", [1, 2]),
("What are the challenges in conducting clinical trials on rare forms of MS?", [1]),
("How does geographical location affect MS treatment patterns?", [0, 1]),
("What are the latest findings in PubMed regarding MS and autoimmune disorders?", [0]),
("How do changes in the immune system affect MS disease progression and treatment options?", [0, 1]),
("What role does patient support play in improving MS treatment outcomes?", [1]),
("What are the impacts of MS on quality of life in patients with comorbidities?", [2]),
("How do economic factors affect the pricing of MS treatments?", [2]),
("What are the potential benefits of long-term treatment for MS in delaying disease progression?", [2]),
("How do clinical trials measure the impact of MS treatments on mobility?", [1]),
("How does MS treatment change for patients with coexisting mental health issues?", [1]),
("What is the role of PubMed research in developing new MS treatment guidelines?", [0, 1]),
("What are the most promising new treatments for progressive MS?", [1, 2]),
("What are the latest findings on MS treatment adherence in developing countries?", [2]),
("How does age impact the response to MS therapies?", [2]),
("What are the side effects associated with the long-term use of MS treatments?", [1, 2]),
("How do MS treatments vary by disease stage, and what is their effect on patient outcomes?", [1]),
("Show me the PubMed results for the drug, clinical trials for the disease, and the drug-disease relationship.", [0, 1, 2]),
("Tell me the clinical trials for the disease, PubMed articles for the drug, and their relationship.", [0, 1, 2]),
("Give me the clinical trials for the disease and PubMed details for the drug.", [0, 1]),
("What are the clinical trials for the disease?", [1]),
("Give me the clinical trial details related to the disease.", [1]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Give me the PubMed articles for the drug and clinical trial information for the disease.", [0, 1]),
("Tell me the clinical trials for the disease and its association with the drug.", [1, 2]),
("Tell me the PubMed details related to the drug.", [0]),
("Give me the drug-disease correlation.", [2]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Give me the PubMed details for the drug and correlation with the disease.", [0, 2]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Show me the PubMed articles for the drug and relationship with the disease.", [0, 2]),
("Tell me the clinical trial details related to the disease.", [1]),
("Give me the clinical trials for the disease and PubMed details for the drug.", [0, 1]),
("What is the association between the drug and disease?", [2]),
("Give me the PubMed articles for the drug.", [0]),
("Tell me the clinical trials for the disease and its association with the drug.", [1, 2]),
("Show me the PubMed results for the drug.", [0]),
("What is the age distribution of Multiple Sclerosis patients, and how does this influence the demand for various treatment options?", [2]),
("How does early diagnosis and improved diagnostic techniques affect the reported prevalence of MS in recent years?", [0, 2]),
("How does the prevalence of MS in rural vs. urban areas differ, and what impact does this have on healthcare access and treatment patterns?", [2, 1]),
("Are there significant racial or ethnic differences in the prevalence of MS, and how should treatment strategies differ in these populations?", [1, 2, 0]),
("How do lifestyle factors (e.g., smoking, vitamin D deficiency) contribute to the incidence and prevalence of MS in different regions?", [0, 2]),
("What are the long-term safety concerns associated with the use of DMTs (disease-modifying therapies) for MS, and how do these concerns affect patient adherence?", [1, 2]),
("How do adverse events related to MS medications (e.g., risk of infections, liver toxicity) impact treatment choice and the market potential of new drugs?", [2]),
("What is the role of pharmacovigilance in tracking the safety of MS drugs post-market, and how does this affect forecasting demand?", [2]),
("How do the side effects of MS treatments (e.g., flu-like symptoms, injection site reactions) influence the choice between first-line and second-line therapies?", [0, 1]),
("How do patient's perceptions of drug safety (e.g., concerns about long-term effects) impact their willingness to switch from one MS therapy to another?", [1, 2]),
("How do new MS treatments (e.g., oral therapies, biologics) compare to older options in terms of effectiveness, convenience, and side effects?", [1, 2]),
("What role do clinical trial outcomes play in shaping treatment trends and influencing prescriber behavior in MS?", [1]),
("How does the rising prevalence of progressive forms of MS affect the market demand for new therapies targeting these patient populations?", [2]),
("What external factors (e.g., changes in healthcare reimbursement policies, insurance coverage) are influencing the uptake of novel MS therapies?", [1, 2]),
("How do media, advocacy organizations, and patient education affect the public's awareness and preference for specific MS treatments?", [0]),
("How does disease progression (e.g., from relapsing-remitting to secondary progressive MS) influence treatment decisions and forecasting models?", [1, 0]),
("How do new therapies targeting progressive MS impact long-term treatment strategies, and what forecasting challenges do they present?", [1]),
("How does the effectiveness of first-line MS therapies influence the switch to second-line treatments, and what is the impact on drug adoption trends?", [1]),
("What is the role of combination therapies (e.g., combining DMTs with symptom management drugs) in treating MS, and how does this affect treatment outcomes and market growth?", [1]),
("How does the availability of new biomarkers for MS impact the prediction of disease progression and the identification of patients who might benefit from specific treatments?", [0, 1, 2]),
("How do changes in national healthcare policy, such as new drug pricing regulations, influence the adoption of MS treatments in different markets?", [1, 2]),
("How do the availability of generic MS drugs and biosimilars impact the market for branded therapies, and what trends are emerging as a result?", [1]),
("What is the impact of changes in treatment guidelines (e.g., the introduction of new MS treatment classes) on physician prescribing patterns?", [1]),
("How does competition between drug manufacturers (e.g., between oral therapies and injectables) affect market dynamics and treatment adoption?", [2]),
("How do global events (e.g., COVID-19 pandemic, economic recessions) impact the accessibility and demand for MS treatments?", [0, 1]),
("How do patient preferences for treatment convenience (e.g., oral vs. injectable therapies) influence the demand for specific MS medications?", [0, 2]),
("What role does patient-reported quality of life (e.g., fatigue, mobility issues) play in determining the choice of MS treatments?", [1, 2]),
("How do factors like treatment costs, insurance coverage, and patient access to therapy affect adherence and patient outcomes in MS treatment?", [2]),
("How do concerns about fertility or pregnancy impact MS treatment choices, especially in women of childbearing age?", [0, 1, 2]),
("How do healthcare provider-patient interactions (e.g., physician recommendations, trust in treatment options) influence the selection of MS therapies and treatment outcomes?", [1, 2]),
("What are the forecasted growth rates for MS treatment segments (e.g., oral therapies, biologics, injectables) over the next 5-10 years?", [0, 1]),
("How do market access challenges (e.g., restricted reimbursement, treatment availability) impact forecasting for MS drug sales in different regions?", [2]),
("What factors could lead to disruptions in the MS treatment market, such as patent expirations, new regulatory approvals, or competitive drugs entering the market?", [0, 1, 2]),
("How do the costs of MS treatments affect the affordability and adoption rates in emerging markets compared to developed markets?", [2]),
("How do shifts in treatment paradigms (e.g., new drug classes, earlier intervention) impact the overall market for MS therapies?", [1, 2]),
("Tell me the relationship between the drug and disease.", [2]),
("Give me the PubMed details for the drug and relationship with the disease.", [0, 2]),
("What are the clinical trials for the disease and the relationship with the drug?", [1, 2]),
("Tell me the PubMed details related to the drug.", [0]),
("Give me the PubMed articles for the drug and correlation with the disease.", [0, 2]),
("Show me the PubMed results for the drug and relationship with the disease.", [0, 2]),
("Give me the clinical trials for the disease.", [1]),
("Tell me the PubMed details related to the drug.", [0]),
("What are the clinical trials for the disease?", [1]),
("Tell me the relationship between the drug and disease.", [2]),
("What is the association between the drug and disease?", [2]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Tell me the PubMed details for the drug and the drug-disease association.", [0, 2]),
("Give me the clinical trials for the disease and PubMed articles for the drug.", [0, 1]),
("Tell me the clinical trials for the disease and its association with the drug.", [1, 2]),
("What are the clinical trials for the disease?", [1]),
("Tell me the clinical trials for the disease.", [1]),
("Give me the PubMed articles for the drug and relationship with the disease.", [0, 2]),
("Show me the PubMed results for the drug.", [0]),
("Give me the clinical trials for the disease and PubMed details for the drug.", [0, 1]),
("Tell me the PubMed details for the drug and correlation with the disease.", [0, 2]),
("Give me the PubMed articles for the drug.", [0]),
("What are the clinical trials for the disease?", [1]),
("Tell me the clinical trials for the disease.", [1]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Show me the PubMed results for the drug and relationship with the disease.", [0, 2]),
("Tell me the relationship between the drug and disease.", [2]),
("What is the association between the drug and disease?", [2]),
("Tell me the clinical trial details related to the disease.", [1]),
("Tell me the relationship between the drug and disease.", [2]),
("What are the clinical trials for the disease?", [1]),
("Tell me the relationship between the drug and disease.", [2]),
("Give me the PubMed details for the drug and the drug-disease association.", [0, 2]),
("Tell me the PubMed details related to the drug.", [0]),
("Give me the clinical trials for the disease and PubMed details for the drug.", [0, 1]),
("Tell me the clinical trials for the disease and its association with the drug.", [1, 2]),
("Give me the clinical trials for the disease.", [1]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Give me the clinical trials for the disease.", [1]),
("Give me the clinical trials for the disease and the drug-disease correlation.", [1, 2]),
("Give me the clinical trials for the disease and relationship with the drug.", [1, 2]),
("What are the clinical trials for the disease?", [1]),
("Give me the PubMed articles for the drug.", [0]),
("Give me the clinical trials for the disease.", [1]),
("Give me the clinical trials for the disease and PubMed articles for the drug.", [0, 1]),
]
 
queries = [item[0] for item in data]
labels = [item[1] for item in data]
 
mlb = MultiLabelBinarizer()
labels_bin = mlb.fit_transform(labels)
 
tokenizer = AutoTokenizer.from_pretrained('dmis-lab/biobert-v1.1')
dataset = QueryDataset(queries, labels_bin, tokenizer)
dataloader = DataLoader(dataset, batch_size=4, shuffle=True)
 
num_labels = labels_bin.shape[1]
model = QueryClassifierModel(num_labels)
optimizer = AdamW(model.parameters(), lr=2e-5)
loss_fn = nn.BCEWithLogitsLoss()
 
epochs = 20
 
if __name__=="__main__":
 
    for epoch in range(epochs):
        model.train()
        for batch in dataloader:
            optimizer.zero_grad()
 
            input_ids = batch['input_ids']
            attention_mask = batch['attention_mask']
            labels = batch['labels']
 
            outputs = model(input_ids, attention_mask)
            loss = loss_fn(outputs, labels)
            loss.backward()
            optimizer.step()
 
        print(f"Epoch {epoch + 1}/{epochs} - Loss: {loss.item()}")
 
    with open(r'chatbot.pkl', 'wb') as f:
        state = model.state_dict()
        pickle.dump(state, f)
 
    # with open('tokenizer.pkl', 'wb') as f:
    #     state = tokenizer.
    #     pickle.dump(tokenizer, f)
 