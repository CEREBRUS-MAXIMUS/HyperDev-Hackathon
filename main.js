import { generate_code, create_file } from './functions.js';
import * as readline from 'node:readline';

// Defining readline
const prompter = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to asynchronously get user input
const getPrompt = () => {
  return new Promise(resolve => {
    prompter.question('Enter a prompt (type "STOP" to stop): ', input => {
      resolve(input);
    });
  });
};

// Main function to handle the input and calling generate_code
const main = async () => {
  let prompt = await getPrompt(); // Initial prompt

  while (prompt.toLowerCase() !== "stop") {
    //console.log(await generate_code(prompt)); // Process the input
    console.log(await create_file(prompt))
    prompt = await getPrompt(); // Ask for next input
  }

  prompter.close(); // Close the readline interface
};

main().catch(console.error);
