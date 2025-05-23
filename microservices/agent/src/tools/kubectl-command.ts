import { z } from "zod";
import { tool } from "@langchain/core/tools";

export async function runKubectlCommand(command: string): Promise<{
  error?: unknown;
  message?: string;
  result?: string;
}> {
  try {
    if (!command.startsWith('kubectl')) {
      return {
        error: new Error('Invalid command'),
        message: 'Command must start with kubectl'
      };
    }

    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      return {
        error: new Error(stderr),
        message: stderr
      };
    }

    return {
      result: stdout
    };
  } catch (error) {
    return {
      error,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export const runKubectlCommandTool = tool(runKubectlCommand, {
  name: "runKubectlCommand",
  description: "Executes a kubectl command and returns the output",
  schema: z.object({
    command: z.string().describe("The kubectl command to execute")
  })
});
