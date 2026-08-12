import { txt } from "../utils/helpers.js";

/**
 * Scrape AtCoder problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeAtCoder() {
  const title = txt("#task-statement h2") || txt("h2");
  const desc = txt("#task-statement");
  return { platform: "AtCoder", title, description: desc.slice(0, 2000) };
}

export function isProblemPage() {
  const isTaskUrl = /\/contests\/[^/]+\/tasks\/[^/]+/.test(location.pathname);
  const hasStatement = Boolean(document.querySelector("#task-statement"));
  return isTaskUrl && hasStatement;
}