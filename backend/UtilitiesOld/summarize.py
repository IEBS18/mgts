import os
from openai import OpenAI

openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)



def summarize_with_openai(document_text):
    # print(len(document_text))
    # if len()
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": "You are a Summarisation Specialist. As a Summarization Specialist, you transform complex inputs into concise summaries, capturing essential information within token limits. You analyze diverse texts, ensure clarity, and optimize token usage, making information accessible and engaging for all users. Write in minimum 500 words. "},
                {"role": "user", "content": f"Summarize the following document: {document_text}"}
            ],
            # min_tokens=5000,  # Adjust as per your need
            max_tokens=10000,  # Adjust as per your need
            temperature=0.3,
        )
        summary = response.choices[0].message.content
        return summary.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def summarize_by_title_or_org(search_results):

    combined_text = ""
    organization_names = set()  
    for document in search_results:
        title = document.get('title', '')
        org_name = document.get('Organization_Name', '')
        abstract = document.get('AbstractText','')
        LitTitle = document.get('Title','')
        nct_id = document.get('NCT Number','')
        interventions= document.get('Interventions','')
        publication_id= document.get('pgpub_id','')
        patentabstract= document.get('abstract','')
        # claims=document.get('claim','')
                
        
        
        # Prioritize title or organization name 
        if title:
            combined_text += f"Title: {title}\n"
        if org_name:
            combined_text += f"Organization: {org_name}\n"
            organization_names.add(org_name)
        if abstract:
            combined_text += f"Abstract: {abstract}\n"
        if LitTitle:
            combined_text+= f"Literature Title:{LitTitle}\n"
        if nct_id:
            combined_text+= f"NCT ID:{nct_id}\n"
        if interventions:
            combined_text+=f"Intervion: {interventions}\n"
        if publication_id:
            combined_text += f"Publication ID: {publication_id}\n"
        if patentabstract:
            combined_text += f"Summary: {patentabstract}\n"
        # if claims:
        #     combined_text += f"Patent Claims: {claims}\n"
        
        
        abstract = document.get('abstract', '')
        # english_description = document.get('english_description', '')
        ingredients = document.get('Ingredients', '')
        diseases = document.get('Diseases', '')
        Author_Name = document.get('Author Name','')
        ISSN=document.get('ISSN','')
        Publicate_Date = document.get('PubDate','')
        Brief_Summary=document.get('Brief Summary','')
        Phases=document.get('Phases','')
        Collaborators=document.get('Collaborators','')
        Sponsor=document.get('Sponsor','')
        Study_Title=document.get('Study Title','')
        Study_Status=document.get('Study Status','')
        Type=document.get('type','')
        Inventor=document.get('inventor','')
        
            # Append relevant content for each document
        if abstract:
            combined_text += f"Abstract: {abstract}\n"
        # if english_description:
        #     combined_text += f"Description: {english_description}\n"
        if ingredients:
            combined_text += f"Ingredients: {ingredients}\n"
        if diseases:
            combined_text += f"Diseases: {diseases}\n"
        if Author_Name:
            combined_text += f"Author Name: {Author_Name}\n"
        if ISSN:
            combined_text += f"Issue Number: {ISSN}\n"
        if Publicate_Date:
            combined_text += f"Publication Date: {Publicate_Date}\n"
        if Brief_Summary:
            combined_text += f"Brief Summary: {Brief_Summary}\n"
        if Phases:
            combined_text += f"Phases Completed/Ongoing: {Phases}\n"
        if Collaborators:
            combined_text += f"Collaborators: {Collaborators}\n"
        if Sponsor:
            combined_text += f"Sponsor Universities: {Sponsor}\n"
        if Study_Title:
            combined_text += f"Study Title: {Study_Title}\n"
        if Study_Status:
            combined_text += f"Study Status: {Study_Status}\n"
        if Inventor:
            combined_text += f"Author/Inventor Name: {Inventor}\n"
        if Type:
            combined_text += f"Patent Type: {Type}\n"
            
        
        
        
        combined_text += "\n"  
    
    
    if len(organization_names) > 1:
        combined_text = f"Multiple organizations found: {', '.join(organization_names)}\n\n" + combined_text
    
    # Summarize the combined text using OpenAI
    if combined_text:
        summary = summarize_with_openai(combined_text)
        return summary
    else:
        return "No content available to summarize."