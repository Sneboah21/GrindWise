import { txt } from "../utils/helpers.js";

/**
 * Scrape InterviewBit problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeInterviewBit() {
  const title = txt("h1.problem-title") || txt("h1");
  const desc = txt(".problem-description") || txt("article");
  return {
    platform: "InterviewBit",
    title,
    description: desc.slice(0, 2000),
  };
}

export function isProblemPage() {
  const isProblemUrl = location.pathname.startsWith("/problems/");
  const hasTitle = Boolean(document.querySelector("h1.problem-title"));
  return isProblemUrl && hasTitle;
}
