import OpenAI from "openai";
import { executeCommand } from "./executeCommand.js";

const client = new OpenAI({
  apiKey: "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"
});

function extractCodeFromMarkdown(text) {
  let accumulatedBlock = "";
  let insideCodeBlock = false;
  let language = null;

  const lines = text.split('\n');
  let extractedCode = "";

  for (const line of lines) {
    accumulatedBlock += line + '\n';

    // Check if we're entering a code block
    if (!insideCodeBlock && accumulatedBlock.includes("```")) {
      insideCodeBlock = true;
      const splitBlock = accumulatedBlock.split("```");
      accumulatedBlock = splitBlock[1] ?? "";
      language = accumulatedBlock.split('\n')[0].trim();
      if (!language.match(/^[a-zA-Z]+$/)) { // Ensure language is only alphabets
        language = "text"; // Default to text if not a valid language
      }
      continue;
    }

    // Check if we're exiting a code block
    if (insideCodeBlock && accumulatedBlock.includes("```")) {
      insideCodeBlock = false;
      extractedCode += accumulatedBlock.split("```")[0].trim() + '\n';
      accumulatedBlock = ""; // Reset for potential subsequent code blocks
      continue;
    }

    // Accumulate the code if we're inside a code block
    if (insideCodeBlock) {
      extractedCode += line + '\n';
    }
  }

  return extractedCode.trim();
}

export const generate_code = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        "role": "system",
        "content": "You are a junior programmer given a programming task. Using your knowledge, you will generate ALL code that completes that task."
      },
      {
          "role": "user",
          "content": prompt
      }
    ]
  });

  return extractCodeFromMarkdown(response.choices[0].message.content);
}

export const create_file = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        "role": "system",
        "content": "You are a junior programmer given a programming task. Using your knowledge, you will generate a command that will CREATE A FILE."
      },
      {
          "role": "user",
          "content": prompt
      }
    ]

    
  });  

  const commands = extractCodeFromMarkdown(response.choices[0].message.content)

  console.log(executeCommand(commands))

  return commands; 
}

export const create_folder = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        "role": "system",
        "content": "You are a junior programmer given a programming task. Using your knowledge, you will generate a command that will CREATE A FOLDER."
      },
      {
          "role": "user",
          "content": prompt
      }
    ]
  });  

  const commands = extractCodeFromMarkdown(response.choices[0].message.content)

  console.log(executeCommand(commands))
  
  return commands; 
}

export const delete_file = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        "role": "system",
        "content": "You are a junior programmer given a programming task. Using your knowledge, you will generate a command that will DELETE A FILE."
      },
      {
          "role": "user",
          "content": prompt
      }
    ]
  });  

  const commands = extractCodeFromMarkdown(response.choices[0].message.content)

  console.log(executeCommand(commands))

  return commands; 
}

export const delete_folder = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        "role": "system",
        "content": "You are a junior programmer given a programming task. Using your knowledge, you will generate a command that will DELETE A FOLDER."
      },
      {
          "role": "user",
          "content": prompt
      }
    ]
  });  

  const commands = extractCodeFromMarkdown(response.choices[0].message.content)

  console.log(executeCommand(commands))

  return commands; 
}
