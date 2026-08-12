import { txt } from "../utils/helpers.js";

/**
 * Scrape CodeChef problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeCodeChef() {
  const title = txt(".problem-name h1") || txt("h1");
  const desc = txt("#problem-statement") || txt(".problem-body");
  return { platform: "CodeChef", title, description: desc.slice(0, 2000) };
}

export function isProblemPage() {
  const isProblemUrl = location.pathname.startsWith("/problems/");
  const hasStatement = Boolean(document.querySelector("#problem-statement"));
  return isProblemUrl && hasStatement;
}
