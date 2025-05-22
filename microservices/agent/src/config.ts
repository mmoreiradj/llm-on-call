import { z } from "zod";

const schema = z.object({
  REPO_PATH: z.string(),
  MANIFESTS_PATH: z.string(),
  REPO_URL: z.string(),
});

const env = schema.parse(process.env);

export const config = {
  repoPath: env.REPO_PATH,
  manifestsPath: env.MANIFESTS_PATH,
  repoUrl: env.REPO_URL,
};
