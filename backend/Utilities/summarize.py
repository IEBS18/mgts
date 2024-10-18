import os
from openai import OpenAI

openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)

def summarize_with_openai(document_text):
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": "You are a Summarisation Soecialist. As a Summarization Specialist, you transform complex inputs into concise summaries, capturing essential information within token limits. You analyze diverse texts, ensure clarity, and optimize token usage, making information accessible and engaging for all users. "},
                {"role": "user", "content": f"Summarize the following document: {document_text}"}
            ],
            #min_tokens=150,  # Adjust as per your need
            max_tokens=1000,  # Adjust as per your need
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
        
        # Prioritize title or organization name 
        if title:
            combined_text += f"Title: {title}\n"
        if org_name:
            combined_text += f"Organization: {org_name}\n"
            organization_names.add(org_name)
        
        
        abstract = document.get('abstract', '')
        english_description = document.get('english_description', '')
        ingredients = document.get('Ingredients', '')
        diseases = document.get('Diseases', '')
        
        # Append relevant content for each document
        if abstract:
            combined_text += f"Abstract: {abstract}\n"
        if english_description:
            combined_text += f"Description: {english_description}\n"
        if ingredients:
            combined_text += f"Ingredients: {ingredients}\n"
        if diseases:
            combined_text += f"Diseases: {diseases}\n"
        
        combined_text += "\n"  
    
    
    if len(organization_names) > 1:
        combined_text = f"Multiple organizations found: {', '.join(organization_names)}\n\n" + combined_text
    
    # Summarize the combined text using OpenAI
    if combined_text:
        summary = summarize_with_openai(combined_text)
        return summary
    else:
        return "No content available to summarize."