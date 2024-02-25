import { exec } from 'child_process';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { extractCodeFromMarkdown } from './functions.js'
import { listDir } from './get_dir.js';

const client = new ChatOpenAI({
  openAIApiKey: "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",
  modelName: "gpt-4-turbo-preview",
  maxTokens: -1,
}); 
   
export const executeCommand = async (t, e, successCallback, errorCallback) => {

  let sysMsg;

  let humanMsg;

  if (t === "generate_code") {
      sysMsg = 
      
`    # MISSION
    Given an expected output, generate a WINDOWS powershell command that generates code that is added to a file to accomplish the expected output.

    # PROCESS
    1. **Generate command**: Generate a WINDOWS powershell command that generates code that adds the code to a file.

    # COMPLETION
    - Confirm the code has been generated and added to the file as per the task requirements.`

      humanMsg = 
      `
      Expected Output: ${e} 
      
      `
  }

  else if (t === "run_code") {

    // get dir for run_code
    const dir = await listDir()

    console.log("THE DIR IS " + dir)

      sysMsg = 
      
      `# MISSION
        Write and return a WINDOWS powershell terminal command to run_code based on the current directory data

        # PROCESS
        1. **Identify File**: Determine which file the command should run the code on based on the directory data.
        2. **Command Generation**:
          - Return a command to run a code file in Windows powershell terminal. The code file has already been generated, you just need to return the command to execute that code file in terminal.

        # COMPLETION
        - Ensure the returned command is specific to the task and can achieve the expected output when executed in a Windows terminal.`
      
      humanMsg = 
      `
      Expected Output: ${e} 

      Current Directory: ${dir}
      
      `
  }

  let command = await client.invoke([
      new SystemMessage(sysMsg),
      new HumanMessage(humanMsg)
  ]);

  console.log(command.content)

const regex = /@"([\s\S]*?)"@/;

// Extracting the match
let match = command.content.match(regex);

// Extracted PowerShell command
match = match ? match[1].trim() : '';

// Extracted PowerShell command
const functionNameMatch = match.match(/def (\w+)/);
const functionName = functionNameMatch ? functionNameMatch[1] : 'function';
const fileName = `${functionName}.py`;

// Escape single quotes for PowerShell
const escapedPythonCode = match.replace(/'/g, "''");

// PowerShell command to write the Python code into a file with the function's name
const powershellCommand = `powershell.exe -command "$code = '${escapedPythonCode}'; Set-Content -Path .\\${fileName} -Value $code"`;


  exec(powershellCommand, (error, stdout, stderr) => {
    if (error) {
     console.log(`error: ${error.message}`);
      if (errorCallback) {
        errorCallback(error.message);
      }
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      if (errorCallback) {
        errorCallback(stderr);
      }
      return;
    }
    console.log(`stdout: ${stdout}`);
    if (successCallback) {
      successCallback(stdout);
    }
  });
};