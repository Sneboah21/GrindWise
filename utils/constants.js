export const PROVIDERS = {
  groq: {
    label: "Groq API Key",
    placeholder: "gsk_••••••••••••••••••••••••",
    link: "https://console.groq.com/keys",
    linkText: "console.groq.com →",
  },
  gemini: {
    label: "Gemini API Key",
    placeholder: "AIza••••••••••••••••••••••••••",
    link: "https://aistudio.google.com/app/apikey",
    linkText: "Google AI Studio →",
  },
  openai: {
    label: "OpenAI API Key",
    placeholder: "sk-••••••••••••••••••••••••••",
    link: "https://platform.openai.com/api-keys",
    linkText: "platform.openai.com →",
  },
  claude: {
    label: "Anthropic API Key",
    placeholder: "sk-ant-••••••••••••••••••••••",
    link: "https://console.anthropic.com/account/keys",
    linkText: "console.anthropic.com →",
  },
  cohere: {
    label: "Cohere API Key",
    placeholder: "••••••••••••••••••••••••••••••",
    link: "https://dashboard.cohere.com/api-keys",
    linkText: "dashboard.cohere.com →",
  },
};

export const DEFAULT_AI_PROVIDER = "groq";
export const DEFAULT_LEARNING_MODE = "coaching";

export const KNOWN_PLATFORM_HOSTS = [
  "leetcode.com",
  "codeforces.com",
  "geeksforgeeks.org",
  "codechef.com",
  "atcoder.jp",
  "hackerrank.com",
  "interviewbit.com",
  "takeuforward.org",
];

export const SUCCESS_PHRASES = [
  "accepted",
  "problem solved successfully",
  "correct answer",
  "all test cases passed",
  "congratulations",
  "solution accepted",
  "passed",
  "solved successfully",
];

export const SUBMISSION_SELECTORS = [
  {
    sel: '[data-e2e-locator="submission-result"]',
    match: (t) => t === "Accepted",
  },
  { sel: ".verdict-accepted", match: () => true },
  { sel: ".verdict", match: (t) => t.toLowerCase().includes("accepted") },
  {
    sel: '[class*="solved"]',
    match: (t) => SUCCESS_PHRASES.some((p) => t.toLowerCase().includes(p)),
  },
  {
    sel: '[class*="correct"]',
    match: (t) => SUCCESS_PHRASES.some((p) => t.toLowerCase().includes(p)),
  },
  { sel: ".problems-solved", match: () => true },
  {
    sel: ".compilation-result h3",
    match: (t) => SUCCESS_PHRASES.some((p) => t.toLowerCase().includes(p)),
  },
  {
    sel: ".output-window h3",
    match: (t) => SUCCESS_PHRASES.some((p) => t.toLowerCase().includes(p)),
  },
  { sel: ".ac", match: () => true },
  { sel: "td.accepted", match: () => true },
  { sel: "#result-pane .accepted", match: () => true },
  { sel: ".result-state", match: (t) => t === "Accepted" || t === "Passed" },
  { sel: ".status-pass", match: () => true },
  { sel: ".correct-solution", match: () => true },
  {
    sel: "#result-state",
    match: (t) => t.toLowerCase().includes("accepted"),
  },
  {
    sel: ".submission-result",
    match: (t) => t.toLowerCase().includes("accepted"),
  },
];
