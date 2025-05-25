import path from "path";

process.env.MANIFESTS_PATH = 'tests/fixtures';
let repoPath = process.cwd();
// go down two levels
repoPath = path.join(repoPath, '..', '..');
process.env.REPO_PATH = repoPath;
process.env.REPO_URL = 'https://github.com/mmoreiradj/llm-on-call';

console.log('REPO_PATH:', process.env.REPO_PATH);
console.log('MANIFESTS_PATH:', process.env.MANIFESTS_PATH);
console.log('REPO_URL:', process.env.REPO_URL);
