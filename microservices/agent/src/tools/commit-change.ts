import { exec } from "node:child_process";
import { writeFile } from "fs/promises";
import path from "path";
import git from "git-client";

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
  return path.startsWith('/')
}

/**
 * Remove all changes from the git repository
 * Fetch the latest changes from the remote repository first
 */
async function cleanup() {
  await git("fetch", "-a");
  await git("reset", "--hard", "origin/HEAD");
  await git("checkout", "main")
}

/**
 * Create a pull request for the given branch
 */
async function createPr(title: string, body: string) {
  return new Promise((resolve, reject) => {
    exec(`gh pr create --title "${title}" --body "${body}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });
}

export async function requestChanges({
  branchName,
  commitMessage,
  changes,
}: CommitChangeRequest): Promise<CommitChangeResponse> {
  try {
    await git("fetch", "-a");
    await git("branch", "-b", branchName);
    for (const change of changes) {
      const filePath = isFullPath(change.file) ? change.file : path.join(process.cwd(), change.file);
      await writeFile(filePath, change.content);
      await git("add", filePath);
    }

    await git("commit", "-m", commitMessage);
    await git("push", "-u", "origin", branchName);

    await git("checkout", "main");
    await createPr(commitMessage, commitMessage);

    return {
      success: true,
      message: 'Successfully committed changes',
    };
  } catch (error: unknown) {
    await cleanup();
    return {
      error,
    };
  }
}
