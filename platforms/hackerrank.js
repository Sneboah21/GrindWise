import { txt } from "../utils/helpers.js";

/**
 * Scrape HackerRank problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeHackerRank() {
  const title = txt(".challenge-name") || txt("h1");
  const desc = txt(".challenge-body-html") || txt(".challenge-statement");
  return { platform: "HackerRank", title, description: desc.slice(0, 2000) };
}

export function isProblemPage() {
  const hasChallengeName = Boolean(document.querySelector(".challenge-name"));
  const hasBody = Boolean(
    document.querySelector(".challenge-body-html") ||
      document.querySelector(".challenge-statement"),
  );
  return hasChallengeName || hasBody;
}