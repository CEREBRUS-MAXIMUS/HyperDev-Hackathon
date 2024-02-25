from langchain.agents import AgentType, initialize_agent
from langchain.llms.openai import OpenAI

import os
import spookyai
# from langchain.tools import ShellTool
from langchain import LLMMathChain
from langchain.agents import AgentType, initialize_agent
from langchain.chat_models import AzureChatOpenAI
from langchain.chat_models import ChatOpenAI
from import_recs import *
from tools import *

import os
import langchain_core

spookyai.api_key = ""  #Example: W0jY4BtoMKX9gDXoCYHfWImECZu1
spookyai.agent_id = "homework_bot_435"  #Example: homework_bot_435
spookyai.agent_name = "Jack's AI Assistant"  #Example: "Jack's AI Assistant"
spookyai.agent_image = "https://www.shutterstock.com/image-photo/innovative-ai-robot-tutor-helping-600nw-2271198751.jpg"  #Example: https://www.shutterstock.com/image-photo/innovative-ai-robot-tutor-helping-600nw-2271198751.jpg

shell_tool = ShellTool()

shell_tool.description = shell_tool.description + f"args {shell_tool.args}".replace(
    "{", "{{"
).replace("}", "}}")


os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = ""

tools = [
    shell_tool,
    # DuckDuckGoSearchResults(
    #     name="duck_duck_go"
    # ),  # General internet search using DuckDuckGo
    BingSearch(),
    # PythonFile(),
    # ReplaceTextInFile(),
    # spookyai.HumanQuery
]

azure_gpt35_model = ChatOpenAI(model_name='gpt-4', openai_api_key="",)


memory = ConversationBufferMemory(memory_key="chat_history")


from langchain.agents import AgentType, initialize_agent, load_tools


root_directory_for_sandbox = "/Users/jackblair/Otherwise/experiments/sandbox"
import getpass
import os
import platform

username = getpass.getuser()
# current_working_directory = os.getcwd()
operating_system = platform.system()
info = ""
info += f"[User Info]\nName: {username}\nCWD: {root_directory_for_sandbox}\nOS: {operating_system}"

self_ask_with_search = initialize_agent(
    tools, azure_gpt35_model, memory=memory, verbose=True, handle_parsing_errors=True, max_iterations=1000, max_execution_time=1000
)

self_ask_with_search.run(
    # "\nDO EACH COMMAND ONE AT A TIME!! \nYou are an AI with full access to every single command on a terminal. This means you can read, write, create, and delete files.\n For this particular assignemnt: Read the files and use your commands and brainstorming to solve the assignemnt. Then, write the complete code to solve the assignment, and test. You submit your work by editing the files with the final code and testing. \n YOU DO NOT KNOW THE FINAL ANSWER THE PYTHON CODE IS RUNNING AND VERFIRIED TO WORK BY TESTING BY YOU, NOT THE USER!!!!! ALWAYS PERSEVERE AND THINK OUTSIDE THE BOX FOR SOLUTIONS."
    # "Google what Jeff Bezos' net worth is and then tell me what it is in dollars. use your tools"
    # "replace the text in example.txt from talking about football to be chicken salad"
    "\nDO EACH COMMAND ONE AT A TIME!! \nYou are an AI with full access to every single command on a terminal. This means you can read, write, create, and delete files.\n For this particular assignemnt: Read the files and use your commands and brainstorming to solve the assignemnt. Then, write the complete code to solve the assignment, and test. You submit your work by editing the files with the final code and testing. \n YOU DO NOT KNOW THE FINAL ANSWER THE CODE IS RUNNING AND VERFIRIED TO WORK BY TESTING BY YOU, NOT THE USER!!!!! ALWAYS PERSEVERE AND THINK OUTSIDE THE BOX FOR SOLUTIONS. SOLVE THE ASsiGnMENT. Think through yourself what must be solved for this system to work"
)
