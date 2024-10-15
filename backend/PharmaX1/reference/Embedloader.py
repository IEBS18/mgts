import os

from typing import Dict, Any, List
from llama_index.core import Document, StorageContext, VectorStoreIndex, load_index_from_storage
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding

from llama_index.core.ingestion import IngestionPipeline



class EmbeddingProcessor:
    def __init__(self, base_path: str = "./storage", store_locally: bool = True, store_in_memory: bool = False):
        self.base_path = base_path
        self.store_locally = store_locally
        self.store_in_memory = store_in_memory
        if self.store_locally:
            os.makedirs(self.base_path, exist_ok=True)  # Ensure the base directory exists

    def create_embeddings(self, rowData: Dict[str, str]) -> str:
        """Create embeddings from row data and save to storage."""

        if not self.store_locally:
           return

        display_key = rowData['unique_key']
        # title = rowData['title']
        persist_dir = os.path.join(self.base_path, display_key)

        # Check if embeddings already exist
        if os.path.exists(persist_dir):
            print(f"Embeddings for '{display_key}' already exist. Skipping creation.")
            return  # Exit the function if embeddings exist
        
        print(f"Creating embeddings for '{display_key}'.")
        documents = [Document(text=f"{key}: {val}") for key, val in rowData.items()]
        # print(documents)
        # To store the index

        storage_context = StorageContext.from_defaults()

        VectorStoreIndex.from_documents(
            documents=documents,
            storage_context=storage_context,
            transformations=[
                SentenceSplitter(chunk_size=128, chunk_overlap=5),
                OpenAIEmbedding(),
            ]
        )
        
        storage_context.persist(persist_dir=persist_dir)



    def load_indexes(self, titles: List[str]) -> Dict[str, VectorStoreIndex]:
        
        if self.store_locally:
            index_set = {}
            for title in titles:
                # print(title)
                storage_context = StorageContext.from_defaults(
                    persist_dir=os.path.join(self.base_path, title)
                )
                cur_index = load_index_from_storage(
                    storage_context
                )
                index_set[title] = cur_index
            return index_set
        
if __name__ == "__main__":
    embedding_creator = EmbeddingProcessor('./storage')
    result = embedding_creator.create_embeddings({'title': 'example', 'content': 'This is some content to embed.'})
    print(result)
    indexes = embedding_creator.load_indexes(['example'])
    print(indexes)
    index = embedding_creator.load_index('example')
    print(index)