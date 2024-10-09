from reference.Models import (
    IndexLoader,
    callLLMChatBot,
)
from reference.util import (
    ExcelFileProcessor,
    
)
from dotenv import load_dotenv
load_dotenv()

path= 'data\\drug_indication_sample_data.xlsx'
print(path)

CHAT = True
# row_num = 2
processor = ExcelFileProcessor(path)
processor.ensure_unique_key_column()
datalist = processor.extractor()


# # datalist = processor.row_extractor(row_num)
print(len(datalist))
# indicies = []  # Initialize an empty list to store the indices
# for i in datalist:
#     indicies.append(i['unique_key'])  # Append the 'unique_key' from each dictionary
# print(indicies)

while datalist[-1]['unique_key'] == '' or datalist[-1]['unique_key'] is None:
    datalist.pop(-1)


if CHAT:

    query = "what are the diseases associated with product name Diclofenac Sodium?"
    indicies = []
    for rowdata in datalist:
        IndexLoader.create_embeddings(rowdata) 
        indicies.append(rowdata['unique_key'])
    
    answer = callLLMChatBot(indicies, query)
    print(answer)

