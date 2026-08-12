import { slugify } from "../utils/helpers.js";
import { showToast } from "../ui/toast.js";

/**
 * Build the markdown content saved to GitHub.
 * @param {{ platform: string, title: string }} pd
 * @param {string} code
 * @returns {string}
 */
export function buildSolutionMarkdown(pd, code) {
  const date = new Date().toISOString().slice(0, 10);

  return `# ${pd.title}

**Platform:** ${pd.platform}  
**Date:** ${date}  

## Solution

\`\`\`
${code}
\`\`\`
`;
}

/**
 * Get the existing SHA for a repository file.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {string} path
 * @returns {Promise<string|null>}
 */
export function getFileSha(token, owner, repo, path) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "GITHUB_GET_FILE", token, owner, repo, path },
      (res) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(res?.sha || null);
      },
    );
  });
}

/**
 * Push a solution markdown file to GitHub.
 * @param {string} token
 * @param {string} user
 * @param {string} fullRepo
 * @param {{ platform: string, title: string }} pd
 * @param {string} code
 * @returns {Promise<void>}
 */
export async function pushSolutionToGitHub(token, user, fullRepo, pd, code) {
  const [owner, repo] = fullRepo.split("/");
  const fileName = `${slugify(pd.title)}.md`;
  const filePath = `solutions/${slugify(pd.platform)}/${fileName}`;
  const content = buildSolutionMarkdown(pd, code);

  try {
    const sha = await getFileSha(token, owner, repo, filePath);
    const result = await pushFile(token, owner, repo, filePath, content, pd, sha);

    if (result?.success) {
      showToast(`✅ Solution saved to ${fullRepo}`, "success");
    } else {
      showToast(
        `❌ GitHub push failed: ${result?.error || "unknown error"}`,
        "error",
      );
    }
  } catch (error) {
    showToast(`❌ Background script error: ${error.message}`, "error");
  }
}

function pushFile(token, owner, repo, path, content, pd, sha) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "GITHUB_PUSH_FILE",
        token,
        owner,
        repo,
        path,
        content,
        message: `Add solution: ${pd.title} (${pd.platform})`,
        sha,
      },
      (res) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(res);
      },
    );
  });
}
