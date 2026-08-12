// content.js GrindWise v2
// Multi-platform: LeetCode, Codeforces, GFG, CodeChef, AtCoder, HackerRank, InterviewBit, TakeYouForward

(async function () {
  "use strict";

  const DEBUG = true;
  const debugPrefix = "[GrindWise Debug]";

  function debugLog(message, detail) {
    if (!DEBUG) return;
    if (detail !== undefined) {
      console.log(`${debugPrefix} ${message}`, detail);
      return;
    }
    console.log(`${debugPrefix} ${message}`);
  }

  async function importWithDebug(name, path) {
    const url = chrome.runtime.getURL(path);
    debugLog(`Loading module: ${name}`, { path, url });
    try {
      const moduleNs = await import(url);
      debugLog(`Module loaded: ${name}`, Object.keys(moduleNs));
      return moduleNs;
    } catch (error) {
      debugLog(`Module failed: ${name}`, {
        path,
        url,
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  }

  const helpersModule = await importWithDebug(
    "utils/helpers.js",
    "utils/helpers.js",
  );
  const constantsModule = await importWithDebug(
    "utils/constants.js",
    "utils/constants.js",
  );
  const promptModule = await importWithDebug(
    "core/promptBuilder.js",
    "core/promptBuilder.js",
  );
  const sessionModule = await importWithDebug(
    "core/session.js",
    "core/session.js",
  );
  const storageModule = await importWithDebug(
    "storage/storage.js",
    "storage/storage.js",
  );
  const toastModule = await importWithDebug("ui/toast.js", "ui/toast.js");
  await importWithDebug("platforms/atcoder.js", "platforms/atcoder.js");
  await importWithDebug("platforms/codechef.js", "platforms/codechef.js");
  await importWithDebug("platforms/codeforces.js", "platforms/codeforces.js");
  await importWithDebug("platforms/gfg.js", "platforms/gfg.js");
  await importWithDebug("platforms/hackerrank.js", "platforms/hackerrank.js");
  await importWithDebug(
    "platforms/interviewbit.js",
    "platforms/interviewbit.js",
  );
  await importWithDebug("platforms/leetcode.js", "platforms/leetcode.js");
  await importWithDebug(
    "platforms/takeuforward.js",
    "platforms/takeuforward.js",
  );
  const contextModule = await importWithDebug(
    "core/context.js",
    "core/context.js",
  );
  const aiModule = await importWithDebug("core/ai.js", "core/ai.js");
  const githubModule = await importWithDebug(
    "github/githubSync.js",
    "github/githubSync.js",
  );
  const platformModule = await importWithDebug(
    "platforms/index.js",
    "platforms/index.js",
  );
  const panelModule = await importWithDebug("ui/panel.js", "ui/panel.js");

  debugLog("All modules loaded successfully.");

  const { callAI } = aiModule;
  const { buildHintContext } = contextModule;
  const { pushSolutionToGitHub } = githubModule;
  const { getPlatformData, isProblemPage } = platformModule;
  const { buildHintPrompt } = promptModule;
  const {
    createLearningSession,
    restoreActiveLearningSession,
    isActiveSessionForProblem,
    getSessionHints,
    setSessionHints,
    incrementHintCount,
    completeLearningSession,
  } = sessionModule;
  const { getLocalStorage } = storageModule;
  const { closePanel, openPanel, resetHintIndex } = panelModule;
  const { showToast } = toastModule;
  const { SUBMISSION_SELECTORS, SUCCESS_PHRASES } = constantsModule;
  // helpersModule is loaded and available if you need utility functions
  // e.g. const { someHelper } = helpersModule;

  let hintsData = null;
  let currentHintRequest = null;
  let currentFailedHintNumber = null;
  let lastSubmissionUrl = "";
  let cachedCode = "";
  let submitPollInterval = null;
  let hasPushedSubmission = false;
  let isGeneratingHint = false;

  await restoreActiveLearningSession();

  debugLog("Initialization reached post-import state.");

  function removeHintButton() {
    const btn = document.getElementById("lhe-hint-btn");
    if (btn) {
      debugLog("removing stale hint button");
      btn.remove();
    }
  }

  function createEmptyHintsData() {
    return {
      hint1: "",
      hint2: "",
      hint3: "",
    };
  }

  function getGeneratedHintCount() {
    if (!hintsData) return 0;
    let count = 0;
    if (hintsData.hint1) count += 1;
    if (hintsData.hint2) count += 1;
    if (hintsData.hint3) count += 1;
    return count;
  }

  function getHintErrorMessage(errorType, hintNumber) {
    const map = {
      rate_limit:
        "Rate limit hit while generating the next hint. Try again in a moment.",
      parse_error: `Could not parse Hint ${hintNumber}. Try again.`,
      network: `Network error while generating Hint ${hintNumber}. Try again.`,
    };

    return (
      map[errorType] || `Could not generate Hint ${hintNumber}. Try again.`
    );
  }

  function getPreviousHintsForRequest(hintNumber) {
    if (!hintsData || hintNumber <= 1) return [];

    const previousHints = [];

    for (let i = 1; i < hintNumber; i += 1) {
      const hintText = hintsData[`hint${i}`];
      if (hintText) {
        previousHints.push(hintText);
      }
    }

    return previousHints;
  }

  async function generateHint(pd, aiProvider, apiKey, hintNumber) {
    debugLog(`Generating Hint ${hintNumber}`);
    const context = buildHintContext(
      pd,
      getPreviousHintsForRequest(hintNumber),
    );
    debugLog("Hint context snapshot:", JSON.parse(JSON.stringify(context)));
    const prompt = buildHintPrompt(context, hintNumber);
    const response = await callAI(aiProvider, apiKey, prompt);
    debugLog("Hint received");
    return response.hint;
  }

  function openHintsPanel(activeHint, extra = {}) {
    openPanel({
      state: "hints",
      title: currentHintRequest?.pd?.title || document.title,
      hints: hintsData,
      activeHint,
      onRetry: onRetryHintClick,
      onNextHint: onNextHintClick,
      ...extra,
    });
  }

  async function requestHint(hintNumber) {
    if (!currentHintRequest || isGeneratingHint) return;
    if (hintNumber < 1 || hintNumber > 3) return;

    isGeneratingHint = true;
    currentFailedHintNumber = null;

    openHintsPanel(getGeneratedHintCount(), { isLoadingNext: hintNumber > 1 });

    try {
      const hint = await generateHint(
        currentHintRequest.pd,
        currentHintRequest.aiProvider,
        currentHintRequest.apiKey,
        hintNumber,
      );

      hintsData[`hint${hintNumber}`] = hint;
      await setSessionHints(hintsData);

      openHintsPanel(hintNumber);
    } catch (err) {
      currentFailedHintNumber = hintNumber;
      openHintsPanel(Math.max(1, hintNumber - 1));
      showToast(getHintErrorMessage(err.message, hintNumber), "error");
    } finally {
      isGeneratingHint = false;
    }
  }

  async function onNextHintClick() {
    const nextHintNumber = getGeneratedHintCount() + 1;
    if (nextHintNumber > 3) return;
    await incrementHintCount();
    await requestHint(nextHintNumber);
  }

  async function onRetryHintClick() {
    if (isGeneratingHint) return;

    if (currentFailedHintNumber) {
      await requestHint(currentFailedHintNumber);
      return;
    }

    await onHintClick();
  }

  async function onHintClick() {
    try {
      const { aiProvider, apiKey, learningMode } = await getLocalStorage([
        "aiProvider",
        "apiKey",
        "learningMode",
      ]);
      if (!aiProvider || !apiKey) {
        openPanel({
          state: "error",
          errorType: "no_key",
          onRetry: onRetryHintClick,
        });
        return;
      }

      const pd = getPlatformData() || {
        platform: "Unknown",
        title: document.title,
        description: "",
      };

      if (isActiveSessionForProblem(pd)) {
        hintsData = { ...getSessionHints() };
        currentHintRequest = {
          pd,
          aiProvider,
          apiKey,
        };
        currentFailedHintNumber = null;

        const generatedHintCount = getGeneratedHintCount();
        if (generatedHintCount > 0) {
          openHintsPanel(generatedHintCount);
          return;
        }

        openPanel({
          state: "loading",
          title: pd.title,
          onRetry: onRetryHintClick,
        });

        await requestHint(1);
        return;
      }

      await createLearningSession(pd, aiProvider, learningMode);
      resetHintIndex();
      hintsData = createEmptyHintsData();
      currentHintRequest = {
        pd,
        aiProvider,
        apiKey,
      };
      currentFailedHintNumber = null;

      openPanel({
        state: "loading",
        title: pd.title,
        onRetry: onRetryHintClick,
      });

      await requestHint(1);
    } catch (e) {
      if (e.message.includes("Extension context invalidated")) {
        alert(
          "Extension was updated. Please refresh the page to use the GrindWise.",
        );
      }
    }
  }

  function injectHintButton() {
    debugLog("inject check", {
      href: location.href,
      isProblemPage: isProblemPage(),
    });
    debugLog("injectHintButton() called.", {
      existing: Boolean(document.getElementById("lhe-hint-btn")),
      hasBody: Boolean(document.body),
      readyState: document.readyState,
      href: location.href,
    });
    if (document.getElementById("lhe-hint-btn")) return;
    if (!isProblemPage() || !document.body) return;
    const btn = document.createElement("button");
    btn.id = "lhe-hint-btn";
    btn.setAttribute("aria-label", "Get a hint for this problem");
    btn.innerHTML =
      '<span>💡</span><span class="lhe-btn-label">Get Hint</span>';
    document.body.appendChild(btn);
    btn.addEventListener("click", onHintClick);
  }

  function waitAndInject() {
    debugLog("waitAndInject() starting.");
    injectHintButton();
    setTimeout(injectHintButton, 1000);
    setTimeout(injectHintButton, 2500);
    setTimeout(injectHintButton, 5000);
    setTimeout(injectHintButton, 8000);
  }

  function textScanForSuccess() {
    const candidates = document.querySelectorAll(
      'h1,h2,h3,h4,p,span,div.result,div[class*="output"],div[class*="verdict"],div[class*="result"]',
    );
    for (const el of candidates) {
      if (el.dataset.lhePushed) continue;
      if (el.children.length > 5) continue;
      const t = (el.textContent || "").trim().toLowerCase();
      if (t.length > 100) continue;
      if (SUCCESS_PHRASES.some((p) => t.includes(p))) {
        el.dataset.lhePushed = "1";
        return true;
      }
    }
    return false;
  }

  async function getEditorCode() {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ type: "GET_CODE" }, (response) => {
          if (chrome.runtime.lastError) {
            resolve(fallbackDOMCode());
            return;
          }
          let finalCode = response?.code;
          if (!finalCode) finalCode = fallbackDOMCode();
          resolve(finalCode);
        });
      } catch {
        resolve(fallbackDOMCode());
      }
    });
  }

  function fallbackDOMCode() {
    const ta =
      document.querySelector("textarea.editor") ||
      document.querySelector("[data-mode-id]") ||
      document.querySelector('textarea[name="code"]');
    if (ta) return ta.value;
    const lines = document.querySelectorAll(".view-line");
    return lines.length > 0
      ? Array.from(lines)
          .map((el) => el.textContent)
          .join("\n")
      : "";
  }

  async function onSubmissionAccepted() {
    try {
      const data = await getLocalStorage([
        "githubToken",
        "githubUser",
        "selectedRepo",
      ]);

      // Always complete and persist the GrindWise learning session.
      // GitHub syncing is optional and must not affect analytics.
      await completeLearningSession();

      // Clear active UI/session state after completion.
      hintsData = createEmptyHintsData();
      currentHintRequest = null;
      currentFailedHintNumber = null;

      // GitHub syncing is optional.
      if (!data.githubToken || !data.selectedRepo) return;

      const pd = getPlatformData() || {
        platform: "Unknown",
        title: document.title,
      };

      showToast("⏳ Saving solution to GitHub...", "info");

      let code = cachedCode;
      if (!code) code = await getEditorCode();

      cachedCode = "";

      if (!code) {
        showToast("❌ Could not extract code. Push failed.", "error");
        return;
      }

      await pushSolutionToGitHub(
        data.githubToken,
        data.githubUser,
        data.selectedRepo,
        pd,
        code,
      );
    } catch (e) {
      if (e.message?.includes("Extension context invalidated")) {
        showToast(
          "⚠️ Extension updated! Please refresh the page.",
          "error",
        );
      }
    }
  }

  function detectSubmission() {
    debugLog("detectSubmission() tick.", {
      hasPushedSubmission,
      href: location.href,
    });
    if (hasPushedSubmission) return;
    const url = location.href;
    if (
      url.includes("leetcode.com") &&
      url.includes("/submissions/") &&
      url !== lastSubmissionUrl
    ) {
      lastSubmissionUrl = url;
      setTimeout(() => {
        const el = document.querySelector(
          '[data-e2e-locator="submission-result"]',
        );
        if (el && el.textContent.trim() === "Accepted") {
          hasPushedSubmission = true;
          onSubmissionAccepted();
        }
      }, 2500);
      return;
    }
    for (const { sel, match } of SUBMISSION_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && match(el.textContent.trim())) {
        hasPushedSubmission = true;
        onSubmissionAccepted();
        return;
      }
    }
    if (textScanForSuccess()) {
      hasPushedSubmission = true;
      onSubmissionAccepted();
    }
  }

  function listenForSubmitClicks() {
    document.addEventListener(
      "click",
      async (e) => {
        const btn = e.target.closest(
          'button, [role="button"], input[type="submit"]',
        );
        if (!btn) return;
        const label = (
          btn.textContent ||
          btn.innerText ||
          btn.getAttribute("aria-label") ||
          btn.value ||
          ""
        )
          .toLowerCase()
          .trim();
        const isSubmit =
          label === "submit" ||
          label.includes("submit") ||
          (btn.id || "").toLowerCase().includes("submit");
        if (!isSubmit) return;
        const code = await getEditorCode();
        if (code) cachedCode = code;
        hasPushedSubmission = false;
        if (!location.hostname.includes("leetcode.com")) startSuccessPolling();
      },
      true,
    );
  }

  function startSuccessPolling() {
    if (submitPollInterval) clearInterval(submitPollInterval);
    let attempts = 0;
    submitPollInterval = setInterval(() => {
      attempts += 1;
      if (attempts > 60) {
        clearInterval(submitPollInterval);
        submitPollInterval = null;
        return;
      }
      detectSubmission();
    }, 1000);
  }

  debugLog("Starting content script initialization.");
  waitAndInject();
  listenForSubmitClicks();

  let lastPath = location.pathname;
  debugLog("Creating MutationObserver.", {
    lastPath,
    hasBody: Boolean(document.body),
  });
  new MutationObserver(() => {
    detectSubmission();
    if (location.pathname !== lastPath) {
      debugLog("route changed", {
        from: lastPath,
        to: location.pathname,
      });
      lastPath = location.pathname;
      closePanel();
      removeHintButton();

      if (!isProblemPage()) {
        return;
      }

      setTimeout(injectHintButton, 1500);
      setTimeout(injectHintButton, 3000);
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
