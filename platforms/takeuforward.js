import { txt } from "../utils/helpers.js";

/**
 * Scrape TakeYouForward problem details.
 * @returns {{ platform: string, title: string, description: string }}
 */
export function scrapeTakeYouForward() {
  const title = txt("h1") || document.title;
  const desc = txt(".entry-content") || txt("article") || txt("main");
  return {
    platform: "TakeYouForward",
    title,
    description: desc.slice(0, 2000),
  };
}

export function isProblemPage() {
  const hasArticle = Boolean(document.querySelector(".entry-content"));
  return hasArticle;
}
