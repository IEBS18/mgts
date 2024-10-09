import timeit
from typing import List, Dict, Union


from llama_index.core import PromptTemplate
from llama_index.core.retrievers import BaseRetriever, VectorIndexRetriever
from llama_index.core.response.pprint_utils import pprint_response
from llama_index.core.query_engine import CustomQueryEngine, SubQuestionQueryEngine
from llama_index.llms.openai import OpenAI
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.agent.openai import OpenAIAgent

from PharmaX1.reference.Embedloader import EmbeddingProcessor

# RELEVANCY_MODEL = OpenAI(model="gpt-4o-mini")
# CATEGORIZATION_MODEL = OpenAI(model="o1-preview")
STORE_LOCALLY = True

IndexLoader = EmbeddingProcessor(store_locally=STORE_LOCALLY)


def callLLMChatBot(indicies, user_query):
    index_set = IndexLoader.load_indexes(indicies)

    # For individual patents
    individual_query_engine_tools = [
        QueryEngineTool(
            query_engine=index_set[display_key].as_query_engine(),
            metadata=ToolMetadata(
                name=f"vector_index_patent_{i}",
                description=f"useful for when you want to answer queries about the {display_key} patent specifically",
            ),
        )
        for i, display_key in enumerate(indicies, start=1)
    ]

    # Create the SubQuestionQueryEngine to combine the tools
    query_engine = SubQuestionQueryEngine.from_defaults(
        query_engine_tools=individual_query_engine_tools,
        llm=OpenAI(model="gpt-4o-mini"),
    )

    # Instead of putting query_engine directly in tools, wrap it in a QueryEngineTool
    query_engine_tool = QueryEngineTool(
        query_engine=query_engine,
        metadata=ToolMetadata(
            name="combined_query_engine",
            description="useful for answering questions based on combined knowledge of all patents",
        ),
    )

    # Combine all tools, including the SubQuestionQueryEngine
    tools = [query_engine_tool]

    # Create an OpenAIAgent from the tools
    agent = OpenAIAgent.from_tools(tools, verbose=True)

    response = agent.chat(user_query)
    response_str = str(response)

    return response_str

