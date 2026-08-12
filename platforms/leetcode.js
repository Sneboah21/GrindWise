import { txt } from "../utils/helpers.js";

/**
 * Scrape LeetCode problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeLeetCode() {
  const title =
    txt('[data-cy="question-title"]') ||
    txt("h1") ||
    location.pathname.replace("/problems/", "").replace(/\/$/, "").replace(/-/g, " ");
  const desc =
    txt('[data-track-load="description_content"]') ||
    txt(".question-content") ||
    txt('[class*="question-content"]');
  return { platform: "LeetCode", title, description: desc.slice(0, 2000) };
}

export function isProblemPage() {
  const isProblemUrl = location.pathname.startsWith("/problems/");
  const hasTitle = Boolean(document.querySelector('[data-cy="question-title"]'));
  const hasDescription = Boolean(
    document.querySelector('[data-track-load="description_content"]'),
  );
  return isProblemUrl && (hasTitle || hasDescription);
}