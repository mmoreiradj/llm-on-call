import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { exec } from "node:child_process";
import { config } from "../config.js";

export type SearchRepoRequest = {
  query: string;
};

export type SearchRepoResponse = {
  result?: {
    file: string;
    content: string;
  }[];
  error?: unknown;
};

/**
 * `findFiles` is a helper function that searches for files in the git repository
 * that contain the specified query.
 * @param query - The text to search for in the git repository
 * @returns A promise that resolves to an array of file paths that contain the query
 */
async function findFiles(query: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec(
      `git -C ${config.repoPath} grep -l --untracked --no-color -H "${query}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Error: ${stderr}`);
          return;
        }
        console.log("stdout", stdout);
        resolve(
          stdout
            .split("\n")
            .filter(Boolean)
            .map((file) => `${config.repoPath}/${file}`)
            .filter((file) => file.includes(config.manifestsPath))
        );
      }
    );
  });
}

/**
 * `getFileContent` is a helper function that retrieves the content of a file
 * from the git repository at the specified path.
 * @param file - The path to the file in the git repository
 * @returns A promise that resolves to the content of the file
 */
async function getFileContent(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      `cat ${file}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error}`);
          return;
        }
        if (stderr) {
          reject(`Error: ${stderr}`);
          return;
        }
        resolve(stdout);
      }
    );
  });
}

export async function searchRepo({
  query,
}: SearchRepoRequest): Promise<SearchRepoResponse> {
  try {
    const files = await findFiles(query);
    const results: SearchRepoResponse["result"] = [];
    const filePromises = files.map(async (file) => {
      const content = await getFileContent(file);
      results.push({
        file,
        content,
      });
    });
    await Promise.all(filePromises);
    return {
      result: results,
    };
  } catch (error: unknown) {
    return {
      error,
    };
  }
}

/**
 * `searchRepo` is a tool that allows you to search the git repository for a given query.
 * The repository is located at the path specified in the environment variable `REPO_PATH`
 * and the manifests are located at the path specified in the environment variable `MANIFESTS_PATH`.
 *
 * @param {SearchRepoRequest} request - The request object containing the query to search for.
 * @returns {Promise<SearchRepoResponse>} - A promise that resolves to the search results.
 */
export const searchRepoTool = tool(searchRepo, {
  name: "searchRepo",
  description: "Searches the git repository for a given query",
  schema: z.object({
    query: z.string().describe("The text to search for in the git repository"),
  }),
});
