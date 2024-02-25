import * as functions from "./functions.js";
import * as readline from "node:readline";
import { ChatOpenAI } from "@langchain/openai";
import { executeCommand } from "./executeCommand.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { readFile, writeFile } from "fs/promises";

// setting base prompts

const mainPrompt = await readFile("main_prompt.txt", { encoding: "utf8" });
const subPrompt = await readFile("sub_prompt.txt", { encoding: "utf8" });

const client = new ChatOpenAI({
  openAIApiKey: "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",
  modelName: "gpt-4-turbo-preview",
  temperature: 0,
  maxTokens: -1,
});

// Defining readline
const prompter = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});  

// Function to asynchronously get user input
const getPrompt = () => {
  return new Promise((resolve) => {
    prompter.question('Enter a prompt (type "STOP" to stop): ', (input) => {
      resolve(input);
    });
  });
};

function markdownJsonToJson(markdown) {
  // Regex to find a code block that might contain JSON
  // This assumes the JSON is in a code block marked with ```json or ```
  const codeBlockRegex = /```(?:json)?\s*([^`]+)```/;

  const match = markdown.match(codeBlockRegex);

  if (match && match[1]) {
    // Extracted JSON string from the code block
    const jsonString = match[1].trim();

    try {
      // Parse the JSON string into an object
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } catch (error) {
      console.error("Error parsing JSON from Markdown:", error);
      return null;
    }
  } 
}


// Main function to handle the input and calling generate_code
const main = async () => {
  let prompt = await getPrompt(); // Initial prompt

  while (prompt.toLowerCase() !== "stop") {
    // main prompt

    const task_understanding = await client.invoke([
      new SystemMessage(mainPrompt),
      new HumanMessage(prompt),
    ]);

    //console.log(task_understanding.content);

    // sub prompt (for getting JSON)

    const json_array = await client.invoke([
      new SystemMessage(subPrompt),
      new HumanMessage(task_understanding.content),
    ]);

    console.log(json_array.content);

    const json_steps = JSON.parse(json_array.content);

    await writeFile("json_steps.txt", JSON.stringify(json_steps));
    console.log("Data written to file");

    for(const step of json_steps) {
      console.log("THIS THE CURRENT STEP ", step)
      if(step.tool === "generate_code"){
        console.log(step.tool)
        await executeCommand(step.tool, step.expected_output)
        //functions.generate_code(file_data, prompt)
        
      }

      else if(step.tool === "run_code"){
        console.log(step.tool)
        await executeCommand(step.tool, step.expected_output)
        //functions.run_code(prompt)
      }

      /*if(step.tool === "create_file"){
        console.log(step.tool)
        //file_data = functions.create_file(step.expected_output)
        executeCommand(step.tool, step.expected_output)
      }

      /*if(step.tool === "create_folder"){
        console.log(step.tool)
        functions.create_folder(step.expected_output)
      }

      if(step.tool === "delete_file"){
        console.log(step.tool)
        functions.delete_file(prompt)
      }

      if(step.tool === "delete_folder"){
        console.log(step.tool)
        functions.delete_folder(prompt)
      }*/
    }

    prompt = await getPrompt(); // Ask for next input
  }

  prompter.close(); // Close the readline interface
};

main().catch(console.error);
