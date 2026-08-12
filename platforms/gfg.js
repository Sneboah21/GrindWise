import { txt } from "../utils/helpers.js";

/**
 * Scrape GeeksForGeeks problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeGFG() {
  const title = txt("h1.problems-name") || txt(".header-content h1") || txt("h1");
  const desc =
    txt(".problem-statement") ||
    txt(".problems-page-description") ||
    txt("article");
  return {
    platform: "GeeksForGeeks",
    title,
    description: desc.slice(0, 2000),
  };
}

export function isProblemPage() {
  const hasTitle = Boolean(document.querySelector("h1.problems-name"));
  const hasStatement = Boolean(
    document.querySelector(".problem-statement") ||
      document.querySelector(".problems-page-description"),
  );
  return hasTitle || hasStatement;
}
