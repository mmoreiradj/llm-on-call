// @vitest-environment node

import { expect, test } from 'vitest';
import { requestChanges, type CommitChangeRequest, type CommitChangeResponse } from '../src/tools/commit-change.js';

test('commit changes', async () => {
  const expectedResponse: CommitChangeResponse = {
    success: true,
    message: 'Successfully committed changes',
  }

  const req: CommitChangeRequest = {
    branchName: 'test-branch',
    commitMessage: 'test-commit',
    changes: [{
      file: './microservices/agent/tests/fixtures/my-deployment.yaml',
      content: 'test-content',
    }],
  };

  const res = await requestChanges(req);

  expect(res).toEqual(expectedResponse);
})
