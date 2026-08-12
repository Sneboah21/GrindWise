import { txt } from "../utils/helpers.js";

/**
 * Scrape Codeforces problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeCodeforces() {
  const title = txt(".problem-statement .title") || txt("h1");
  const desc = txt(".problem-statement");
  return { platform: "Codeforces", title, description: desc.slice(0, 2000) };
}

export function isProblemPage() {
  const isProblemUrl =
    /\/problemset\/problem\/\d+\/[A-Z]\d*/.test(location.pathname) ||
    /\/contest\/\d+\/problem\/[A-Z]\d*/.test(location.pathname);
  const hasStatement = Boolean(
    document.querySelector(".problem-statement"),
  );
  return isProblemUrl && hasStatement;
}
