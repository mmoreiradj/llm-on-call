import { requestChangesTool } from "./commit-change.js";
import { runKubectlCommandTool } from "./kubectl-command.js";
import { searchRepoTool } from "./search-repo.js";

export const tools = [searchRepoTool, requestChangesTool, runKubectlCommandTool]
