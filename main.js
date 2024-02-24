import { generate_code } from './functions.js'
import * as readline from 'node:readline';

// defining readline

const prompter = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


prompter.question('Enter a prompt (type "STOP" to stop): ', async prompt => {
  // while prompt.toLowerCase() != STOP
    console.log(await generate_code(prompt));
});