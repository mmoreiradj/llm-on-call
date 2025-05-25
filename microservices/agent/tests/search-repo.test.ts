// @vitest-environment node

import { expect, test } from "vitest";
import {
  searchRepo,
  type SearchRepoRequest,
  type SearchRepoResponse,
} from "../src/tools/search-repo.js";
import { readFile } from "fs/promises";

test("search repo", async () => {
  const FILE_PATH =
    process.cwd() + "/tests/fixtures/my-deployment.yaml";
  const fileContent = await readFile(FILE_PATH, "utf-8");
  const expectedResponse: SearchRepoResponse = {
    result: [
      {
        file: FILE_PATH,
        content: fileContent,
      },
    ],
  };

  const req: SearchRepoRequest = {
    query: "my-deployment",
  };

  const res = await searchRepo(req);

  expect(res).toEqual(expectedResponse);
});
