import { getPlatformData } from "../platforms/index.js";
import { esc } from "../utils/helpers.js";

let currentHintIndex = 0;
let retryHandler = null;
let nextHintHandler = null;

/**
 * Reset panel hint navigation state.
 */
export function resetHintIndex() {
  currentHintIndex = 0;
}

/**
 * Open or update the side panel.
 * @param {{ state: string, title?: string, hints?: Object|null, activeHint?: number, errorType?: string, onRetry?: Function|null, onNextHint?: Function|null, isLoadingNext?: boolean }} options
 */
export function openPanel({
  state,
  title = "",
  hints = null,
  activeHint = 1,
  errorType = "",
  onRetry = null,
  onNextHint = null,
  isLoadingNext = false,
}) {
  currentHintIndex = activeHint;
  retryHandler = onRetry;
  nextHintHandler = onNextHint;

  let panel = document.getElementById("lhe-panel");
  const isNew = !panel;
  if (isNew) {
    panel = createPanel();
    document.body.appendChild(panel);
    makeDraggable(panel);
  }

  updatePanel(panel, {
    state,
    title,
    hints,
    activeHint,
    errorType,
    isLoadingNext,
  });

  if (isNew) {
    requestAnimationFrame(() => panel.classList.add("lhe-panel--open"));
  }
}

/**
 * Close the side panel.
 */
export function closePanel() {
  const panel = document.getElementById("lhe-panel");
  if (!panel) return;
  panel.classList.remove("lhe-panel--open");
  panel.addEventListener("transitionend", () => panel.remove(), {
    once: true,
  });
}

/**
 * Create the panel shell.
 * @returns {HTMLDivElement}
 */
export function createPanel() {
  const panel = document.createElement("div");
  panel.id = "lhe-panel";
  panel.setAttribute("role", "complementary");
  return panel;
}

/**
 * Update panel content and handlers.
 * @param {HTMLElement} panel
 * @param {{ state: string, title: string, hints: Object|null, activeHint: number, errorType: string, isLoadingNext: boolean }} options
 */
export function updatePanel(
  panel,
  { state, title, hints, activeHint, errorType, isLoadingNext },
) {
  panel.innerHTML = buildPanelHTML(
    state,
    title,
    hints,
    activeHint,
    errorType,
    isLoadingNext,
  );
  panel
    .querySelector("#lhe-panel-close")
    .addEventListener("click", closePanel);

  if (state === "hints") {
    const nextBtn = panel.querySelector("#lhe-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (nextHintHandler) {
          nextHintHandler();
        }
      });
    }
  }

  if (state === "error") {
    panel.querySelector("#lhe-retry-btn")?.addEventListener("click", () => {
      if (retryHandler) retryHandler();
    });
  }
}

function buildPanelHTML(state, title, hints, activeHint, errorType, isLoadingNext) {
  const titleHtml = title ? `<p class="lhe-panel-problem">${esc(title)}</p>` : "";
  let body = "";
  if (state === "loading") {
    body = `<div class="lhe-loader"><div class="lhe-spinner"></div><span>Generating hints...</span></div>`;
  } else if (state === "error") {
    body = `<div class="lhe-error">${buildErrorHTML(errorType)}</div>`;
  } else if (state === "hints") {
    body = buildHintsHTML(hints, activeHint, title, isLoadingNext);
  }
  return `
      <div class="lhe-panel-header" id="lhe-panel-drag-handle">
        <span class="lhe-panel-title"><span class="lhe-panel-logo">🧠</span> GrindWise</span>
        <button id="lhe-panel-close" aria-label="Close">✕</button>
      </div>
      ${titleHtml}
      <div class="lhe-panel-body">${body}</div>`;
}

function buildHintsHTML(hints, activeHint, title, isLoadingNext) {
  const defs = [
    {
      num: 1,
      icon: "🧭",
      label: "Approach Direction",
      text: hints.hint1,
      cls: "lhe-hint--1",
    },
    {
      num: 2,
      icon: "🏗️",
      label: "Data Structure",
      text: hints.hint2,
      cls: "lhe-hint--2",
    },
    {
      num: 3,
      icon: "📝",
      label: "Pseudocode",
      text: hints.hint3,
      cls: "lhe-hint--3",
    },
  ];
  const cards = defs
    .map(({ num, icon, label, text, cls }) => {
      if (num > activeHint) return "";
      return `
        <div class="lhe-hint ${cls} lhe-hint--visible ${num === activeHint ? "lhe-hint--animate" : ""}">
          <div class="lhe-hint-header">
            <span class="lhe-hint-badge">Hint ${num}</span>
            <span class="lhe-hint-label">${icon} ${esc(label)}</span>
          </div>
          <p class="lhe-hint-text">${esc(text || "")}</p>
        </div>`;
    })
    .join("");

  const pd = getPlatformData();
  const searchTitle = title || pd?.title || document.title;
  const searchPlatform = pd?.platform || "";
  const ytQuery = encodeURIComponent(
    `${searchTitle} ${searchPlatform} solution explanation`.trim(),
  );
  const yt = `https://www.youtube.com/results?search_query=${ytQuery}`;

  const footer =
    activeHint < 3
      ? `<button class="lhe-next-btn" id="lhe-next-btn"${isLoadingNext ? " disabled" : ""}>${isLoadingNext ? "Generating..." : "Next Hint →"}</button>`
      : `<div class="lhe-done-msg">
           <span class="lhe-done-icon">✅</span>
           <p>Try it now!<br><span class="lhe-done-sub">Still stuck? <a class="lhe-walkthrough-link" href="${yt}" target="_blank">Find a walkthrough ↗</a></span></p>
         </div>`;

  return `<div class="lhe-hints-list">${cards}</div><div class="lhe-panel-footer">${footer}</div>`;
}

function buildErrorHTML(type) {
  const map = {
    no_key: {
      icon: "🔑",
      title: "No API Key",
      body: "Click the extension icon, select an AI provider and save your API key.",
    },
    rate_limit: {
      icon: "⏳",
      title: "Rate Limit Hit",
      body: "You've hit the API rate limit. Wait a moment and try again.",
    },
    parse_error: {
      icon: "⚠️",
      title: "Unexpected Response",
      body: "AI returned a response we could not parse. Try again.",
    },
    incomplete: {
      icon: "⚠️",
      title: "Incomplete Hints",
      body: "AI response was missing some hints. Try again.",
    },
    network: {
      icon: "📡",
      title: "Connection Error",
      body: "Could not reach the AI provider. Check your internet connection.",
    },
  };
  const { icon, title, body } = map[type] || {
    icon: "❌",
    title: "Something Went Wrong",
    body: esc(type),
  };
  return `
      <div class="lhe-error-icon">${icon}</div>
      <p class="lhe-error-title">${esc(title)}</p>
      <p class="lhe-error-body">${body}</p>
      <button class="lhe-retry-btn" id="lhe-retry-btn">Try Again</button>`;
}

function makeDraggable(panel) {
  let dragging = false;
  let startX;
  let startY;
  let startLeft;
  let startTop;

  panel.addEventListener("mousedown", (e) => {
    const handle = document.getElementById("lhe-panel-drag-handle");
    if (!handle?.contains(e.target) || e.target.id === "lhe-panel-close") return;
    const rect = panel.getBoundingClientRect();
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    panel.classList.add("lhe-panel--dragging");
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    panel.style.left = `${startLeft + e.clientX - startX}px`;
    panel.style.top = `${startTop + e.clientY - startY}px`;
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove("lhe-panel--dragging");
  });
}
