import { searchRepoTool } from "./search-repo.js";
import { requestChangesTool } from "./commit-change.js";
import { runKubectlCommandTool } from "./kubectl-command.js";
import { TTSToolTool } from "./tts-tool.js";
import { STTToolTool } from "./stt-tool.js";
import { K8sVoiceToolTool } from "./k8s-voice-tool.js";

export const tools = [
  searchRepoTool,
  requestChangesTool,
  runKubectlCommandTool,
  TTSToolTool,
  STTToolTool,
  K8sVoiceToolTool
];

export { K8sVoiceToolTool } from "./k8s-voice-tool.js";
