import os
import asyncio
from datetime import datetime
import requests
import json
import openai
from langchain.agents.agent_toolkits import AzureCognitiveServicesToolkit
from langchain.tools import DuckDuckGoSearchResults

from langchain.chat_models import AzureChatOpenAI
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)
from firebase_admin import credentials, firestore, initialize_app, messaging, credentials
from quart import Quart, g, jsonify, request, Response, stream_with_context
from quart_cors import cors
# from wandb.integration.openai import autolog

from langchain.document_loaders import YoutubeLoader
from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import UnstructuredExcelLoader
from langchain.document_loaders.csv_loader import CSVLoader

from langchain.document_loaders import WikipediaLoader
from langchain.document_loaders import YoutubeLoader
from langchain.document_loaders import WebBaseLoader

from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.vectorstores import Chroma

from langchain.document_loaders import PyPDFLoader
from langchain.document_loaders import Docx2txtLoader
from langchain.document_loaders import UnstructuredPowerPointLoader
from langchain.document_loaders import TextLoader
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain.tools.render import format_tool_to_openai_function
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import BaseTool, StructuredTool, Tool, tool
# from langchain.tools.python import PythonREPL

from langchain.agents import AgentType, initialize_agent
from langchain import hub

import base64
import os
import re
import getpass
# import tiktoken
import asyncio
import jsonpatch
import jsonpointer

from pydantic import BaseModel, Field
from langchain.utilities import BingSearchAPIWrapper
from openai import AzureOpenAI
from langchain_experimental.utilities import PythonREPL


toolkit = AzureCognitiveServicesToolkit()

azure_gpt35_model = AzureChatOpenAI(
    azure_endpoint="",
    openai_api_version="2023-07-01-preview",
    deployment_name="",
    openai_api_key="",
    openai_api_type="azure",
)

llamafile_model = ChatOpenAI(
    base_url="http://127.0.0.1:5000/v1", # "http://<Your api-server IP>:port"
    api_key = "sk-no-key-required"
)

openai.api_key = ""
os.environ["OPENAI_API_KEY"] = ""
os.environ["NVIDIA_API_KEY"] = ""

if not os.environ.get("NVIDIA_API_KEY", "").startswith("nvapi-"):
    nvapi_key = getpass.getpass("Enter your NVIDIA API key: ")
    assert nvapi_key.startswith("nvapi-"), f"{nvapi_key[:5]}... is not a valid key"
    os.environ["NVIDIA_API_KEY"] = nvapi_key

mixtral_8x7b_model = ChatNVIDIA(model="mixtral_8x7b")
llama2_model = ChatNVIDIA(model="playground_llama2_70b")
yi34b_model = ChatNVIDIA(model="playground_yi_34b")

os.environ["BING_SUBSCRIPTION_KEY"] = ""
os.environ["BING_SEARCH_URL"] = ""

system_message = "You are witty helpful AI assistant named spooky. You like to use emojis and You should output markdown when appropriate"

# encoding = tiktoken.encoding_for_model("gpt-4")
