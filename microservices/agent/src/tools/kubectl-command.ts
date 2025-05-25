import { z } from "zod";
import { tool } from "@langchain/core/tools";

const schema = z.object({
  command: z.string().describe("The kubectl command to execute")
})

export type RunKubectlCommandRequest = z.infer<typeof schema>;

export async function runKubectlCommand({ command }: RunKubectlCommandRequest): Promise<{
  error?: unknown;
  message?: string;
  result?: string;
}> {
  console.log("Running kubectl command", command);
  try {
    if (!command.startsWith('kubectl')) {
      command = `kubectl ${command}`;
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
  schema,
});
