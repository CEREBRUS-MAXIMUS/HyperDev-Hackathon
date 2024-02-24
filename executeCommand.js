import { exec } from 'child_process';

export function executeCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return error;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}    