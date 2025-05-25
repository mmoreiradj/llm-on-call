import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama, Ollama } from "@langchain/ollama";
import { tools } from "./tools/index.js";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { NatsMessage, NatsMessageEvent } from "./nats.js";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "./config.js";
import { writeFileSync } from "node:fs";

// const llm = new ChatOllama({
//   model: "qwen3:8b",
//   temperature: 0,
//   maxConcurrency: 2,
//   verbose: true,
// });

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  maxConcurrency: 2,
  verbose: true,
  apiKey: config.openaiApiKey,
});

const agentCheckpointer = new MemorySaver();

const agentModel = createReactAgent({
  llm,
  tools,
  name: "KubernetesAgent",
  // prompt: `
  // You are a Kubernetes agent that can fix issues in a Kubernetes cluster.
  // The kubernetes manifests are installed using argocd, hence you need to use the tool "requestChanges"
  // to make a pull request to fix the issue.
  // If you cannot fix the issue, you should explain why you cannot fix it and suggest a solution.
  // If you can fix the issue, you should use the tools provided to fix it.
  // You have the following tools available to you:
  // ${tools.map((tool) => tool.name).join(", ")}
  // `,
  checkpointSaver: agentCheckpointer,
});

/**
 * This function is used to fix kubernetes issues based on received events
 * @param issue - The issue to fix
 */
async function fixIssue(issue: NatsMessageEvent) {
  const agentFinalState = await agentModel.invoke(
    {
      messages: [
        new HumanMessage(
          `The following error occured in this kubernetes cluster.
            Do not ask for more information or user consent.
            There is no human in the loop.
            Fix the issue yourself with the tools provided,
            DO NOT EDIT THE FILES DIRECTLY OR YOU WILL BE REPLACED BY A MORE PERFORMANT MODEL.
            If you want to edit any file, use the tool 'requestChanges' : ${JSON.stringify(issue)}`
        ),
      ],
    },
    { configurable: { thread_id: issue[1].metadata.uid } }
  );

  console.log("Agent final state", agentFinalState);
  writeFileSync("agent-final-state.json", JSON.stringify(agentFinalState, null, 2));
}

export default fixIssue;
