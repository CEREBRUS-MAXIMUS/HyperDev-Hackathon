import langchain_core
from import_recs import *
from tools import *

llm = llamafile_model

tools = [
    BingSearch(),
    DALLE3(),
    DuckDuckGoSearchResults(
        name="duck_duck_go"
    ),  # General internet search using DuckDuckGo
]

#export LANGCHAIN_TRACING_V2=true
# export LANGCHAIN_API_KEY=<your-api-key>
#write the above out in code
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = ""

llm_with_tools = llm.bind(functions=[format_tool_to_openai_function(t) for t in tools])

# Fetches the latest version of this prompt
# prompt = hub.pull("chuxij/open-interpreter-system:latest")
# prompt = hub.pull("homanp/superagent")
prompt = hub.pull("wfh/langsmith-agent-prompt:latest")

print("prompt: " + str(prompt))
print("llm_with_tools: " + str(llm_with_tools))

runnable_agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),

    }
    | prompt
    | llm_with_tools
    | OpenAIFunctionsAgentOutputParser()
)

agent_executor = AgentExecutor(
    agent=runnable_agent, tools=tools, handle_parsing_errors=True,
    verbose=True,
    memory=ConversationBufferMemory(),
    max_iterations=1000
)

print("agent_executor: " + str(agent_executor))

full_response = ""
input_with_context =  "search for Jeff Bezos' net worth?"
print("@@@@@@@@@ Chain Starting @@@@@@@@@@@")

async def run_agent(input_with_context):
    async for chunk in agent_executor.astream_log({"input":input_with_context}, diff=True):

        # Convert RunLogPatch to JsonPatch
        json_patch = convert_to_json_patch(chunk)

        # Print the value of each patch
        for patch in json_patch:
            if 'streamed_output' in patch["path"]:
                value_json = patch['value']
                if (str(type(value_json)) == "<class 'langchain_core.messages.ai.AIMessageChunk'>"):
                    AI_chunk_dict = langchain_core.messages.base.message_to_dict(value_json)
                    if ("function_call" in AI_chunk_dict["data"]["additional_kwargs"]):
                        if (AI_chunk_dict["data"]["additional_kwargs"]["function_call"]["name"] != ""):
                            print("name:" + AI_chunk_dict["data"]["additional_kwargs"]["function_call"]["name"])
                        else:
                            print(AI_chunk_dict["data"]["additional_kwargs"]["function_call"]["arguments"], end='')

                    print(AI_chunk_dict["data"]["content"], end='')




def convert_to_json_patch(run_log_patch):
    # Convert the ops attribute of RunLogPatch to a format suitable for jsonpatch
    json_patch = []
    for operation in run_log_patch.ops:
        patch = {
            "op": operation["op"],
            "path": operation["path"],
            "value": operation.get("value", None)  # Use get in case value is not present
        }
        json_patch.append(patch)
    return json_patch

def apply_json_patch_and_print(json_patch, target_dict):
    for patch in json_patch:
        try:
            patch_obj = jsonpatch.JsonPatch([patch])
            patch_obj.apply(target_dict, in_place=True)

            # Print the value being added or replaced
            if patch['op'] in ['add', 'replace']:
                print(f"Value {patch['op']}: {patch['value']}")
        except jsonpointer.JsonPointerException:
            # Handle the case where the path does not exist
            create_path(target_dict, patch['path'])
            patch_obj = jsonpatch.JsonPatch([patch])
            patch_obj.apply(target_dict, in_place=True)
        except jsonpatch.JsonPatchConflict:
            # If there is a conflict (like trying to replace a non-existent object), treat it as an 'add'
            if patch['op'] == 'replace':
                patch['op'] = 'add'
                patch_obj = jsonpatch.JsonPatch([patch])
                patch_obj.apply(target_dict, in_place=True)
                print(f"Value added due to replace conflict: {patch['value']}")

def create_path(target_dict, path):
    parts = path.strip('/').split('/')
    for part in parts[:-1]:
        if part not in target_dict:
            target_dict[part] = {}
        target_dict = target_dict[part]
    return target_dict


# run the run_agent function in the asyncio event loop
asyncio.run(run_agent(input_with_context))
