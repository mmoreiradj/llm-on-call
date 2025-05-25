import { exec } from "node:child_process";
import { writeFile } from "fs/promises";
import path from "path";
import git from "git-client";
import { mkdir, rm, rmdir } from "node:fs/promises";
import { hash } from "node:crypto";
import { config } from "../config.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export type CommitChangeRequest = {
  branchName: string;
  commitMessage: string;
  changes: {
    file: string;
    content: string;
  }[];
};

export type CommitChangeResponse = {
  message?: string;
  error?: unknown;
  success?: boolean;
};

function isFullPath(path: string): boolean {
  return path.startsWith("/");
}

/**
 * Remove all changes from the git repository
 * Fetch the latest changes from the remote repository first
 */
async function cleanup() {
  await git("fetch", "-a");
  await git("reset", "--hard", "origin/HEAD");
  await git("checkout", "main");
}

/**
 * Create a pull request for the given branch
 */
async function createPr(title: string, body: string, cwd: string) {
  return new Promise((resolve, reject) => {
    exec(
      `gh pr create --title "${title}" --body "${body}"`,
      {
        cwd,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      }
    );
  });
}

/**
 * Pull the repo in /tmp/{uuid}
 * @param param0 P
 * @returns path to repo
 */
async function pullRepo(): Promise<string> {
  const uuid = crypto.randomUUID();
  const tempDir = `/tmp/${uuid}`;
  await mkdir(tempDir);
  await git("clone", config.repoUrl, tempDir);

  return tempDir;
}

export async function requestChanges({
  branchName,
  commitMessage,
  changes,
}: CommitChangeRequest): Promise<CommitChangeResponse> {
  try {
    const tempDir = await pullRepo();
    const execOptions = {
      $cwd: tempDir,
    };

    console.log("tempDir", tempDir);

    await git("fetch", "-a", execOptions);
    await git("checkout", "-b", branchName, execOptions);

    for (const change of changes) {
      const filePath = path.join(tempDir, change.file);
      await writeFile(filePath, change.content);
      await git("add", filePath, execOptions);
    }

    await git("commit", "-m", commitMessage, execOptions);
    await git("push", "-u", "origin", branchName, execOptions);

    await createPr(commitMessage, commitMessage, tempDir);

    await rm(tempDir, { recursive: true });

    return {
      success: true,
      message: "Successfully committed changes",
    };
  } catch (error: unknown) {
    // await cleanup();
    return {
      error,
    };
  }
}

/**
 * `requestChanges` is a tool that allows you to create a pull request with changes to the git repository.
 * The repository is cloned from the URL specified in the environment variable `REPO_URL`.
 * Changes are made in a temporary directory and then pushed to a new branch.
 *
 * @param {CommitChangeRequest} request - The request object containing the branch name, commit message, and changes to make.
 * @returns {Promise<CommitChangeResponse>} - A promise that resolves to the result of the operation.
 */
export const requestChangesTool = tool(requestChanges, {
  name: "requestChanges",
  description: "Makes a pull request based on the changes provided",
  schema: z.object({
    branchName: z.string().describe("The name of the branch to create"),
    commitMessage: z
      .string()
      .describe("The message to commit the changes with"),
    changes: z
      .array(
        z.object({
          file: z.string().describe("The path to the file to change"),
          content: z.string().describe("The content to write to the file"),
        })
      )
      .describe("The changes to make to the repository"),
  }),
});
