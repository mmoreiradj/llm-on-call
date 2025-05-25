import { z } from "zod";

const schema = z.object({
  REPO_PATH: z.string(),
  MANIFESTS_PATH: z.string(),
  REPO_URL: z.string(),
  NATS_SERVERS: z.string(),
  OPENAI_API_KEY: z.string(),
  TTS_API_URL: z.string().default("http://localhost:3001"),
});

const env = schema.parse(process.env);

export const config = {
  repoPath: env.REPO_PATH,
  manifestsPath: env.MANIFESTS_PATH,
  repoUrl: env.REPO_URL,
  natsServers: env.NATS_SERVERS.split(","),
  openaiApiKey: env.OPENAI_API_KEY,
  ttsApiUrl: env.TTS_API_URL,
};
