import { exec } from 'child_process';

export async function listDir() {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' ? 'dir' : 'ls';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}
