/**
 * Read trimmed text content from the page.
 * @param {string} sel
 * @param {string} [fallback=""]
 * @returns {string}
 */
export function txt(sel, fallback = "") {
  return document.querySelector(sel)?.innerText?.trim() || fallback;
}

/**
 * Escape text for safe HTML rendering.
 * @param {string} str
 * @returns {string}
 */
export function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Create a filesystem-safe slug from text.
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
