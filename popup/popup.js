// import { DEFAULT_AI_PROVIDER, DEFAULT_LEARNING_MODE, PROVIDERS } from "../utils/constants.js";
// import {
//   getLocalStorage,
//   removeLocalStorage,
//   setLocalStorage,
// } from "../storage/storage.js";

// const providerSelect = document.getElementById("providerSelect");
// const apiKeyInput = document.getElementById("apiKeyInput");
// const apiKeyLabel = document.getElementById("apiKeyLabel");
// const apiKeyLink = document.getElementById("apiKeyLink");
// const toggleVis = document.getElementById("toggleVis");
// const eyeOn = document.getElementById("eyeOn");
// const eyeOff = document.getElementById("eyeOff");
// const saveBtn = document.getElementById("saveBtn");
// const saveConfirm = document.getElementById("saveConfirm");
// const githubClientIdInput = document.getElementById("githubClientId");
// const redirectUriDisplay = document.getElementById("redirectUriDisplay");
// const copyUriBtn = document.getElementById("copyUriBtn");
// const githubConnectBtn = document.getElementById("githubConnectBtn");
// const githubDisconnectBtn = document.getElementById("githubDisconnectBtn");
// const ghNotConnected = document.getElementById("ghNotConnected");
// const ghConnected = document.getElementById("ghConnected");
// const ghAvatar = document.getElementById("ghAvatar");
// const ghUsername = document.getElementById("ghUsername");
// const repoSelect = document.getElementById("repoSelect");
// const saveRepoBtn = document.getElementById("saveRepoBtn");
// const repoConfirm = document.getElementById("repoConfirm");
// const helpBtn = document.getElementById("helpBtn");
// const closeHelpBtn = document.getElementById("closeHelpBtn");
// const helpModal = document.getElementById("helpModal");
// const learningModeSelect = document.getElementById("learningModeSelect");
// const learningModeHelp = document.getElementById("learningModeHelp");

// let saveConfirmTimer = null;
// let repoConfirmTimer = null;

// const MODE_DESCRIPTIONS = {
//   coaching:
//     "Balanced guidance that encourages independent thinking.",
//   socratic:
//     "The AI asks guiding questions instead of revealing answers.",
//   direct:
//     "The AI gives stronger implementation hints sooner.",
// };

// helpBtn.addEventListener("click", () => helpModal.classList.add("open"));
// closeHelpBtn.addEventListener("click", () => helpModal.classList.remove("open"));

// init();

// async function init() {
//   const data = await getLocalStorage([
//     "aiProvider",
//     "apiKey",
//     "learningMode",
//     "githubClientId",
//     "githubToken",
//     "githubUser",
//     "selectedRepo",
//   ]).catch(() => ({}));

//   const provider = data.aiProvider || DEFAULT_AI_PROVIDER;
//   providerSelect.value = provider;
//   learningModeSelect.value = data.learningMode || DEFAULT_LEARNING_MODE;
//   learningModeHelp.textContent = MODE_DESCRIPTIONS[learningModeSelect.value];
//     learningModeSelect.addEventListener("change", () => {
//     learningModeHelp.textContent =
//       MODE_DESCRIPTIONS[learningModeSelect.value];
//   });
//   updateProviderUI(provider);
//   if (data.apiKey) apiKeyInput.value = data.apiKey;
//   if (data.githubClientId) githubClientIdInput.value = data.githubClientId;
//   if (data.githubToken && data.githubUser) {
//     showGhConnected(data.githubUser, data.selectedRepo);
//   }
// }

// redirectUriDisplay.textContent = chrome.identity.getRedirectURL();

// function updateProviderUI(provider) {
//   const cfg = PROVIDERS[provider];
//   apiKeyLabel.textContent = cfg.label;
//   apiKeyInput.placeholder = cfg.placeholder;
//   apiKeyLink.href = cfg.link;
//   apiKeyLink.textContent = cfg.linkText;
// }

// providerSelect.addEventListener("change", () => updateProviderUI(providerSelect.value));

// saveBtn.addEventListener("click", async () => {
//   const key = apiKeyInput.value.trim();
//   if (!key) {
//     flashError(apiKeyInput);
//     return;
//   }

//   saveBtn.disabled = true;
//   saveBtn.textContent = "Saving…";
//   try {
//     await setLocalStorage({ aiProvider: providerSelect.value, apiKey: key, learningMode: learningModeSelect.value });
//   } finally {
//     saveBtn.disabled = false;
//     saveBtn.textContent = "Save API Key";
//     flashConfirm(saveConfirm, saveConfirmTimer, (t) => {
//       saveConfirmTimer = t;
//     });
//   }
// });

// toggleVis.addEventListener("click", () => {
//   const hidden = apiKeyInput.type === "password";
//   apiKeyInput.type = hidden ? "text" : "password";
//   eyeOn.style.display = hidden ? "none" : "block";
//   eyeOff.style.display = hidden ? "block" : "none";
// });

// copyUriBtn.addEventListener("click", () => {
//   navigator.clipboard.writeText(redirectUriDisplay.textContent).then(() => {
//     copyUriBtn.textContent = "Copied!";
//     setTimeout(() => {
//       copyUriBtn.textContent = "Copy";
//     }, 1500);
//   });
// });

// githubConnectBtn.addEventListener("click", async () => {
//   const clientId = githubClientIdInput.value.trim();
//   if (!clientId) {
//     flashError(githubClientIdInput);
//     return;
//   }

//   const redirectUri = chrome.identity.getRedirectURL();
//   const authUrl =
//     `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
//     `&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,read:user`;

//   const clientSecret = prompt(
//     "Enter your GitHub OAuth App Client Secret\n(needed once to exchange the auth code for a token):",
//   );
//   if (!clientSecret) return;

//   await setLocalStorage({ githubClientId: clientId });

//   githubConnectBtn.disabled = true;
//   githubConnectBtn.textContent = "Connecting…";

//   chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (responseUrl) => {
//     if (chrome.runtime.lastError || !responseUrl) {
//       githubConnectBtn.disabled = false;
//       githubConnectBtn.innerHTML = "⚠️ Auth failed — try again";
//       return;
//     }

//     const code = new URL(responseUrl).searchParams.get("code");
//     if (!code) {
//       githubConnectBtn.disabled = false;
//       githubConnectBtn.textContent = "⚠️ No code received";
//       return;
//     }

//     chrome.runtime.sendMessage(
//       { type: "GITHUB_TOKEN_EXCHANGE", clientId, clientSecret, code, redirectUri },
//       (res) => {
//         if (!res?.success || !res.data?.access_token) {
//           githubConnectBtn.disabled = false;
//           githubConnectBtn.textContent = "⚠️ Token exchange failed";
//           return;
//         }
//         const token = res.data.access_token;
//         chrome.runtime.sendMessage({ type: "GITHUB_GET_USER", token }, async (userRes) => {
//           if (!userRes?.success) return;
//           const user = userRes.data;
//           const userData = { login: user.login, avatar_url: user.avatar_url };
//           await setLocalStorage({ githubToken: token, githubUser: userData });
//           showGhConnected(userData, null);
//           fetchRepos(token);
//         });
//       },
//     );
//   });
// });

// githubDisconnectBtn.addEventListener("click", async () => {
//   await removeLocalStorage(["githubToken", "githubUser", "selectedRepo"]);
//   ghConnected.style.display = "none";
//   ghNotConnected.style.display = "flex";
//   githubConnectBtn.disabled = false;
//   githubConnectBtn.innerHTML =
//     '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> Connect GitHub';
// });

// function showGhConnected(user, selectedRepo) {
//   ghNotConnected.style.display = "none";
//   ghConnected.style.display = "flex";
//   ghAvatar.src = user.avatar_url;
//   ghUsername.textContent = user.login;

//   if (selectedRepo) {
//     const opt = document.createElement("option");
//     opt.value = selectedRepo;
//     opt.textContent = selectedRepo;
//     opt.selected = true;
//     repoSelect.innerHTML = "";
//     repoSelect.appendChild(opt);
//   }

//   getLocalStorage("githubToken").then(({ githubToken }) => {
//     if (githubToken) fetchRepos(githubToken, selectedRepo);
//   });
// }

// function fetchRepos(token, selectedRepo) {
//   repoSelect.innerHTML = '<option value="">Loading…</option>';
//   chrome.runtime.sendMessage({ type: "GITHUB_LIST_REPOS", token }, (res) => {
//     if (!res?.success || !Array.isArray(res.data)) {
//       repoSelect.innerHTML = '<option value="">⚠️ Failed to load repos</option>';
//       return;
//     }
//     repoSelect.innerHTML = '<option value="">— select a repo —</option>';
//     res.data.forEach((r) => {
//       const opt = document.createElement("option");
//       opt.value = r.full_name;
//       opt.textContent = r.full_name;
//       if (r.full_name === selectedRepo) opt.selected = true;
//       repoSelect.appendChild(opt);
//     });
//   });
// }

// saveRepoBtn.addEventListener("click", async () => {
//   const repo = repoSelect.value;
//   if (!repo) return;
//   await setLocalStorage({ selectedRepo: repo });
//   flashConfirm(repoConfirm, repoConfirmTimer, (t) => {
//     repoConfirmTimer = t;
//   });
// });

// function flashConfirm(el, timer, setTimer) {
//   el.classList.add("show");
//   if (timer) clearTimeout(timer);
//   setTimer(setTimeout(() => el.classList.remove("show"), 2500));
// }

// function flashError(input) {
//   input.style.borderColor = "#f85149";
//   input.style.boxShadow = "0 0 0 3px rgba(248,81,73,.15)";
//   input.focus();
//   setTimeout(() => {
//     input.style.borderColor = "";
//     input.style.boxShadow = "";
//   }, 1800);
// }

// apiKeyInput.addEventListener("input", () => {
//   apiKeyInput.style.borderColor = "";
//   apiKeyInput.style.boxShadow = "";
// });

import {
  DEFAULT_AI_PROVIDER,
  DEFAULT_LEARNING_MODE,
  PROVIDERS,
} from "../utils/constants.js";

import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../storage/storage.js";

import {
  getLearningHistory,
  clearLearningHistory,
} from "../storage/analyticsStorage.js";

import { calculateStatistics } from "../analytics/analytics.js";

const providerSelect = document.getElementById("providerSelect");
const apiKeyInput = document.getElementById("apiKeyInput");
const apiKeyLabel = document.getElementById("apiKeyLabel");
const apiKeyLink = document.getElementById("apiKeyLink");
const toggleVis = document.getElementById("toggleVis");
const eyeOn = document.getElementById("eyeOn");
const eyeOff = document.getElementById("eyeOff");
const saveBtn = document.getElementById("saveBtn");
const saveConfirm = document.getElementById("saveConfirm");

const githubClientIdInput = document.getElementById("githubClientId");
const redirectUriDisplay = document.getElementById("redirectUriDisplay");
const copyUriBtn = document.getElementById("copyUriBtn");
const githubConnectBtn = document.getElementById("githubConnectBtn");
const githubDisconnectBtn = document.getElementById("githubDisconnectBtn");
const ghNotConnected = document.getElementById("ghNotConnected");
const ghConnected = document.getElementById("ghConnected");
const ghAvatar = document.getElementById("ghAvatar");
const ghUsername = document.getElementById("ghUsername");
const repoSelect = document.getElementById("repoSelect");
const saveRepoBtn = document.getElementById("saveRepoBtn");
const repoConfirm = document.getElementById("repoConfirm");

const helpBtn = document.getElementById("helpBtn");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const helpModal = document.getElementById("helpModal");

const learningModeSelect = document.getElementById("learningModeSelect");
const learningModeHelp = document.getElementById("learningModeHelp");

const refreshAnalyticsBtn = document.getElementById("refreshAnalyticsBtn");
const clearAnalyticsBtn = document.getElementById("clearAnalyticsBtn");
const analyticsSubtitle = document.getElementById("analyticsSubtitle");
const analyticsLoadingState = document.getElementById("analyticsLoadingState");
const analyticsEmptyState = document.getElementById("analyticsEmptyState");
const analyticsErrorState = document.getElementById("analyticsErrorState");
const analyticsErrorMessage = document.getElementById("analyticsErrorMessage");
const analyticsDashboard = document.getElementById("analyticsDashboard");
const analyticsKpiGrid = document.getElementById("analyticsKpiGrid");
const modeUsageList = document.getElementById("modeUsageList");
const modeUsageTotal = document.getElementById("modeUsageTotal");

let saveConfirmTimer = null;
let repoConfirmTimer = null;
let analyticsLoadInvocation = 0;

const MODE_DESCRIPTIONS = {
  coaching: "Balanced guidance that encourages independent thinking.",
  socratic: "The AI asks guiding questions instead of revealing answers.",
  direct: "The AI gives stronger implementation hints sooner.",
};

const MODE_PRESENTATION = {
  coaching: {
    label: "Coaching",
    icon: "C",
    className: "mode-coaching",
  },
  socratic: {
    label: "Socratic",
    icon: "S",
    className: "mode-socratic",
  },
  direct: {
    label: "Direct",
    icon: "D",
    className: "mode-direct",
  },
};

init();

async function init() {
  console.log("[GrindWise][popup] init START");

  bindEventListeners();
  redirectUriDisplay.textContent = chrome.identity.getRedirectURL();

  await Promise.all([loadSettings(), loadAnalytics()]);

  console.log("[GrindWise][popup] init END");
}

function bindEventListeners() {
  helpBtn.addEventListener("click", openHelpModal);
  closeHelpBtn.addEventListener("click", closeHelpModal);

  providerSelect.addEventListener("change", () => {
    updateProviderUI(providerSelect.value);
  });

  learningModeSelect.addEventListener("change", () => {
    learningModeHelp.textContent = MODE_DESCRIPTIONS[learningModeSelect.value];
  });

  saveBtn.addEventListener("click", saveApiSettings);
  toggleVis.addEventListener("click", toggleApiKeyVisibility);
  copyUriBtn.addEventListener("click", copyRedirectUri);

  githubConnectBtn.addEventListener("click", connectGitHub);
  githubDisconnectBtn.addEventListener("click", disconnectGitHub);
  saveRepoBtn.addEventListener("click", saveRepository);

  refreshAnalyticsBtn.addEventListener("click", () => {
    console.log(
      "[GrindWise][popup] refreshAnalyticsBtn CLICK -> loadAnalytics",
    );
    void loadAnalytics();
  });
  clearAnalyticsBtn.addEventListener("click", handleClearAnalytics);

  apiKeyInput.addEventListener("input", () => {
    apiKeyInput.style.borderColor = "";
    apiKeyInput.style.boxShadow = "";
  });
}

async function loadSettings() {
  const data = await getLocalStorage([
    "aiProvider",
    "apiKey",
    "learningMode",
    "githubClientId",
    "githubToken",
    "githubUser",
    "selectedRepo",
  ]).catch(() => ({}));

  const provider = data.aiProvider || DEFAULT_AI_PROVIDER;
  const learningMode = data.learningMode || DEFAULT_LEARNING_MODE;

  providerSelect.value = provider;
  learningModeSelect.value = learningMode;
  learningModeHelp.textContent = MODE_DESCRIPTIONS[learningMode];
  updateProviderUI(provider);

  if (data.apiKey) {
    apiKeyInput.value = data.apiKey;
  }

  if (data.githubClientId) {
    githubClientIdInput.value = data.githubClientId;
  }

  if (data.githubToken && data.githubUser) {
    showGhConnected(data.githubUser, data.selectedRepo);
  }
}

function updateProviderUI(provider) {
  const cfg = PROVIDERS[provider];

  if (!cfg) return;

  apiKeyLabel.textContent = cfg.label;
  apiKeyInput.placeholder = cfg.placeholder;
  apiKeyLink.href = cfg.link;
  apiKeyLink.textContent = cfg.linkText;
}

async function loadAnalytics() {
  const invocationId = ++analyticsLoadInvocation;
  console.log("[GrindWise][popup] loadAnalytics START", invocationId);
  setAnalyticsViewState("loading");

  refreshAnalyticsBtn.disabled = true;
  refreshAnalyticsBtn.classList.add("is-loading");

  try {
    console.log("[GrindWise][popup] before getLearningHistory", invocationId);
    const history = await getLearningHistory();
    console.log(
      "[GrindWise][popup] getLearningHistory result",
      invocationId,
      history,
    );
    console.log(
      "[GrindWise][popup] Array.isArray(history)",
      invocationId,
      Array.isArray(history),
    );
    console.log(
      "[GrindWise][popup] history length",
      invocationId,
      Array.isArray(history) ? history.length : "not-an-array",
    );
    const validHistory = Array.isArray(history) ? history : [];

    if (validHistory.length === 0) {
      console.log("[GrindWise][popup] setting EMPTY", invocationId);
      setAnalyticsViewState("empty");
      console.log("[GrindWise][popup] set EMPTY complete", invocationId);
      return;
    }
    console.log("[GrindWise][popup] before calculateStatistics", invocationId);
    const statistics = calculateStatistics(validHistory);

    console.log(
      "[GrindWise][popup] before renderAnalyticsDashboard",
      invocationId,
    );
    renderAnalyticsDashboard(statistics);

    setAnalyticsViewState("dashboard");
    console.log("[GrindWise][popup] set DASHBOARD complete", invocationId);
  } catch (error) {
    console.log("[GrindWise][popup] loadAnalytics ERROR", invocationId);
    console.log("[GrindWise][popup] loadAnalytics error object", error);
    console.log(
      "[GrindWise][popup] loadAnalytics error.message",
      error?.message,
    );
    console.log("[GrindWise][popup] loadAnalytics error.stack", error?.stack);
    console.error("[GrindWise] Analytics loading failed:", error);

    analyticsErrorMessage.textContent =
      "Your stored learning history could not be loaded. Please refresh and try again.";

    setAnalyticsViewState("error");
  } finally {
    refreshAnalyticsBtn.disabled = false;
    refreshAnalyticsBtn.classList.remove("is-loading");
    console.log("[GrindWise][popup] loadAnalytics END", invocationId);
  }
}

function setAnalyticsViewState(state) {
  analyticsLoadingState.hidden = state !== "loading";
  analyticsEmptyState.hidden = state !== "empty";
  analyticsErrorState.hidden = state !== "error";
  analyticsDashboard.hidden = state !== "dashboard";

  if (state === "loading") {
    analyticsSubtitle.textContent = "Loading your learning history…";
    return;
  }

  if (state === "empty") {
    analyticsSubtitle.textContent =
      "Complete coding sessions to unlock insights.";
    return;
  }

  if (state === "error") {
    analyticsSubtitle.textContent = "Something interrupted the analytics load.";
    return;
  }

  analyticsSubtitle.textContent =
    "A snapshot of your completed learning sessions.";
}

function renderAnalyticsDashboard(statistics) {
  renderKpiCards(statistics);
  renderModeUsage(statistics.learningModes, statistics.totalSessions);
}

function renderKpiCards(statistics) {
  const cards = [
    {
      label: "Sessions",
      value: formatCount(statistics.totalSessions),
      detail: "Completed sessions",
      icon: "S",
      className: "metric-card--orange",
    },
    {
      label: "Completion rate",
      value: formatPercent(statistics.completionRate),
      detail: `${formatCount(statistics.totalSolved)} solved`,
      icon: "%",
      className: "metric-card--green",
    },
    {
      label: "Average time",
      value: formatDuration(statistics.averageTime),
      detail: "Per completed session",
      icon: "T",
      className: "metric-card--blue",
    },
    {
      label: "Average hints",
      value: formatAverage(statistics.averageHints),
      detail: "Hints per session",
      icon: "H",
      className: "metric-card--purple",
    },
  ];

  analyticsKpiGrid.replaceChildren(...cards.map(createMetricCard));
}

function createMetricCard({ label, value, detail, icon, className }) {
  const card = document.createElement("article");
  card.className = `metric-card ${className}`;

  const cardTop = document.createElement("div");
  cardTop.className = "metric-card-top";

  const labelElement = document.createElement("span");
  labelElement.className = "metric-label";
  labelElement.textContent = label;

  const iconElement = document.createElement("span");
  iconElement.className = "metric-icon";
  iconElement.textContent = icon;
  iconElement.setAttribute("aria-hidden", "true");

  cardTop.append(labelElement, iconElement);

  const valueElement = document.createElement("strong");
  valueElement.className = "metric-value";
  valueElement.textContent = value;

  const detailElement = document.createElement("span");
  detailElement.className = "metric-detail";
  detailElement.textContent = detail;

  card.append(cardTop, valueElement, detailElement);

  return card;
}

function renderModeUsage(learningModes, totalSessions) {
  modeUsageTotal.textContent = `${formatCount(totalSessions)} ${
    totalSessions === 1 ? "session" : "sessions"
  }`;

  const rows = ["coaching", "socratic", "direct"].map((mode) => {
    const meta = MODE_PRESENTATION[mode];
    const usage = learningModes?.[mode] || { count: 0, percentage: 0 };

    return createModeUsageRow({
      ...meta,
      count: usage.count,
      percentage: usage.percentage,
    });
  });

  modeUsageList.replaceChildren(...rows);
}

function createModeUsageRow({ label, icon, className, count, percentage }) {
  const row = document.createElement("article");
  row.className = "mode-usage-row";

  const leading = document.createElement("div");
  leading.className = "mode-leading";

  const iconElement = document.createElement("span");
  iconElement.className = `mode-icon ${className}`;
  iconElement.textContent = icon;
  iconElement.setAttribute("aria-hidden", "true");

  const labelElement = document.createElement("span");
  labelElement.className = "mode-label";
  labelElement.textContent = label;

  leading.append(iconElement, labelElement);

  const data = document.createElement("div");
  data.className = "mode-data";

  const countElement = document.createElement("span");
  countElement.className = "mode-count";
  countElement.textContent = `${formatCount(count)}`;

  const percentElement = document.createElement("span");
  percentElement.className = "mode-percent";
  percentElement.textContent = formatPercent(percentage);

  data.append(countElement, percentElement);

  const barTrack = document.createElement("div");
  barTrack.className = "mode-bar-track";

  const barFill = document.createElement("div");
  barFill.className = `mode-bar-fill ${className}`;
  barFill.style.width = `${Math.min(Math.max(Number(percentage) || 0, 0), 100)}%`;

  barTrack.appendChild(barFill);

  row.append(leading, data, barTrack);

  return row;
}

async function handleClearAnalytics() {
  console.log("[GrindWise][popup] handleClearAnalytics START");
  const confirmed = window.confirm(
    "Clear all GrindWise learning analytics? This cannot be undone.",
  );

  if (!confirmed) return;

  clearAnalyticsBtn.disabled = true;
  clearAnalyticsBtn.textContent = "Clearing…";

  try {
    console.log("[GrindWise][popup] before clearLearningHistory");
    await clearLearningHistory();

    console.log(
      "[GrindWise][popup] before loadAnalytics in handleClearAnalytics",
    );
    await loadAnalytics();
    console.log(
      "[GrindWise][popup] after loadAnalytics in handleClearAnalytics",
    );
  } catch (error) {
    console.error("[GrindWise] Could not clear learning history:", error);
    analyticsErrorMessage.textContent =
      "Your learning history could not be cleared. Please try again.";
    setAnalyticsViewState("error");
  } finally {
    clearAnalyticsBtn.disabled = false;
    clearAnalyticsBtn.textContent = "Clear learning history";
    console.log("[GrindWise][popup] handleClearAnalytics END");
  }
}

function formatCount(value) {
  return new Intl.NumberFormat().format(Number(value) || 0);
}

function formatPercent(value) {
  const safeValue = Number(value) || 0;

  if (Number.isInteger(safeValue)) {
    return `${safeValue}%`;
  }

  return `${safeValue.toFixed(1)}%`;
}

function formatAverage(value) {
  const safeValue = Number(value) || 0;

  if (Number.isInteger(safeValue)) {
    return String(safeValue);
  }

  return safeValue.toFixed(1);
}

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.round(Number(seconds) || 0));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

async function saveApiSettings() {
  const key = apiKeyInput.value.trim();

  if (!key) {
    flashError(apiKeyInput);
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  try {
    await setLocalStorage({
      aiProvider: providerSelect.value,
      apiKey: key,
      learningMode: learningModeSelect.value,
    });

    flashConfirm(saveConfirm, saveConfirmTimer, (timer) => {
      saveConfirmTimer = timer;
    });
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save API Key";
  }
}

function toggleApiKeyVisibility() {
  const isHidden = apiKeyInput.type === "password";

  apiKeyInput.type = isHidden ? "text" : "password";
  eyeOn.style.display = isHidden ? "none" : "block";
  eyeOff.style.display = isHidden ? "block" : "none";

  toggleVis.setAttribute(
    "aria-label",
    isHidden ? "Hide API key" : "Show API key",
  );
}

async function copyRedirectUri() {
  try {
    await navigator.clipboard.writeText(redirectUriDisplay.textContent);

    copyUriBtn.textContent = "Copied!";

    window.setTimeout(() => {
      copyUriBtn.textContent = "Copy";
    }, 1500);
  } catch (error) {
    console.error("[GrindWise] Could not copy redirect URL:", error);
    copyUriBtn.textContent = "Failed";

    window.setTimeout(() => {
      copyUriBtn.textContent = "Copy";
    }, 1500);
  }
}

async function connectGitHub() {
  const clientId = githubClientIdInput.value.trim();

  if (!clientId) {
    flashError(githubClientIdInput);
    return;
  }

  const redirectUri = chrome.identity.getRedirectURL();
  const authUrl =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&scope=repo,read:user";

  const clientSecret = window.prompt(
    "Enter your GitHub OAuth App Client Secret.\nIt is used once to exchange the auth code for a token.",
  );

  if (!clientSecret) return;

  await setLocalStorage({ githubClientId: clientId });

  githubConnectBtn.disabled = true;
  githubConnectBtn.textContent = "Connecting…";

  chrome.identity.launchWebAuthFlow(
    { url: authUrl, interactive: true },
    (responseUrl) => {
      if (chrome.runtime.lastError || !responseUrl) {
        resetGitHubConnectButton("Auth failed — try again");
        return;
      }

      const code = new URL(responseUrl).searchParams.get("code");

      if (!code) {
        resetGitHubConnectButton("No code received");
        return;
      }

      exchangeGitHubCode({
        clientId,
        clientSecret,
        code,
        redirectUri,
      });
    },
  );
}

function exchangeGitHubCode({ clientId, clientSecret, code, redirectUri }) {
  chrome.runtime.sendMessage(
    {
      type: "GITHUB_TOKEN_EXCHANGE",
      clientId,
      clientSecret,
      code,
      redirectUri,
    },
    (response) => {
      if (!response?.success || !response.data?.access_token) {
        resetGitHubConnectButton("Token exchange failed");
        return;
      }

      const token = response.data.access_token;
      fetchGitHubUser(token);
    },
  );
}

function fetchGitHubUser(token) {
  chrome.runtime.sendMessage(
    { type: "GITHUB_GET_USER", token },
    async (response) => {
      if (!response?.success || !response.data) {
        resetGitHubConnectButton("Could not load GitHub profile");
        return;
      }

      const userData = {
        login: response.data.login,
        avatar_url: response.data.avatar_url,
      };

      await setLocalStorage({
        githubToken: token,
        githubUser: userData,
      });

      showGhConnected(userData, null);
      fetchRepos(token);
    },
  );
}

async function disconnectGitHub() {
  await removeLocalStorage(["githubToken", "githubUser", "selectedRepo"]);

  ghConnected.style.display = "none";
  ghNotConnected.style.display = "flex";

  resetGitHubConnectButton();
}

function resetGitHubConnectButton(message = "") {
  githubConnectBtn.disabled = false;
  githubConnectBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
    ${message ? `Connect GitHub (${message})` : "Connect GitHub"}
  `;
}

function showGhConnected(user, selectedRepo) {
  ghNotConnected.style.display = "none";
  ghConnected.style.display = "flex";

  ghAvatar.src = user.avatar_url || "";
  ghUsername.textContent = user.login || "GitHub user";

  if (selectedRepo) {
    repoSelect.innerHTML = "";

    const selectedOption = document.createElement("option");
    selectedOption.value = selectedRepo;
    selectedOption.textContent = selectedRepo;
    selectedOption.selected = true;

    repoSelect.appendChild(selectedOption);
  }

  getLocalStorage("githubToken").then(({ githubToken }) => {
    if (githubToken) {
      fetchRepos(githubToken, selectedRepo);
    }
  });
}

function fetchRepos(token, selectedRepo) {
  repoSelect.innerHTML = '<option value="">Loading…</option>';

  chrome.runtime.sendMessage(
    { type: "GITHUB_LIST_REPOS", token },
    (response) => {
      if (!response?.success || !Array.isArray(response.data)) {
        repoSelect.innerHTML =
          '<option value="">Failed to load repositories</option>';
        return;
      }

      repoSelect.innerHTML = '<option value="">— select a repo —</option>';

      response.data.forEach((repo) => {
        const option = document.createElement("option");
        option.value = repo.full_name;
        option.textContent = repo.full_name;
        option.selected = repo.full_name === selectedRepo;
        repoSelect.appendChild(option);
      });
    },
  );
}

async function saveRepository() {
  const repo = repoSelect.value;

  if (!repo) return;

  await setLocalStorage({ selectedRepo: repo });

  flashConfirm(repoConfirm, repoConfirmTimer, (timer) => {
    repoConfirmTimer = timer;
  });
}

function openHelpModal() {
  helpModal.classList.add("open");
  helpModal.setAttribute("aria-hidden", "false");
}

function closeHelpModal() {
  helpModal.classList.remove("open");
  helpModal.setAttribute("aria-hidden", "true");
}

function flashConfirm(element, timer, setTimer) {
  element.classList.add("show");

  if (timer) {
    clearTimeout(timer);
  }

  setTimer(
    setTimeout(() => {
      element.classList.remove("show");
    }, 2500),
  );
}

function flashError(input) {
  input.style.borderColor = "#f85149";
  input.style.boxShadow = "0 0 0 3px rgba(248,81,73,.15)";
  input.focus();

  setTimeout(() => {
    input.style.borderColor = "";
    input.style.boxShadow = "";
  }, 1800);
}
