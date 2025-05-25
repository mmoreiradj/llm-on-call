import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama, Ollama } from "@langchain/ollama";
import { tools } from "./tools/index.js";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatOllama({
  model: "qwen3:8b",
  temperature: 0,
  maxConcurrency: 2,
  verbose: true,
});

const agentCheckpointer = new MemorySaver();

const agentModel = createReactAgent({
  llm,
  tools,
  checkpointSaver: agentCheckpointer,
});

(async () => {
  const agentFinalState = await agentModel.invoke(
    {
      messages: [new HumanMessage("Show me the pods in the default namespace")],
    },
    { configurable: { thread_id: "42" } }
  );

  console.log(
    agentFinalState.messages[agentFinalState.messages.length - 1].content
  );
})();
