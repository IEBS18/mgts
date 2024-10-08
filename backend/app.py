from flask import Flask, request, jsonify
import os
import json
from flask_cors import CORS

from PharmaX.search import process_multiple_files

app = Flask(__name__)
CORS(app)

@app.route('/search', methods=['POST'])
def search():
    search_keyword = request.json.get('keyword')
    file_paths = os.listdir('Output_Files')
    file_paths = [os.path.join('Output_Files', file) for file in file_paths]
    
    results, list = process_multiple_files(file_paths, search_keyword)
    
    os.makedirs('results' , exist_ok= True)
    
    # results = [
    #     {
    #         "title": "US Budget Impact Model for Selinexor in Relapsed or Refractory Multiple Myeloma",
    #         "journal": "Clinicoecon Outcomes Res, Vol 12",
    #         "date": "Feb 25, 2020",
    #         "citations": 6,
    #         "relevantText": "Introduction Multiple myeloma (MM) is a cancer that develops as a plasma cell malignancy in the bone marrow.1 Clinical manifestations of ..."
    #     },
    #     {
    #         "title": "Patterns of bisphosphonate treatment among patients with multiple myeloma treated at oncology clinics across the USA: observations from real-world data",
    #         "journal": "Support Care Cancer, Vol 26 Issue 8",
    #         "date": "Aug 01, 2018",
    #         "citations": 13,
    #         "relevantText": "CONCLUSIONS Real-world data from US indicate that many patients with multiple receive optimal therapy for bone disease ... More"
    #     },
    #     {
    #         "title": "US Budget Impact Model for Selinexor in Relapsed or Refractory Multiple Myeloma",
    #         "journal": "Clinicoecon Outcomes Res, Vol 12",
    #         "date": "Feb 25, 2020",
    #         "citations": 6,
    #         "relevantText": "Introduction Multiple myeloma (MM) is a cancer that develops as a plasma cell malignancy in the bone marrow.1 Clinical manifestations of ..."
    #     },

    # ]
    with open(r'results\file_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    with open(r'results\unique_keys.json', 'w') as f:
        json.dump(list, f, indent=2)
    return jsonify(results), 200

if __name__ == '__main__':
    app.run(debug=True)
