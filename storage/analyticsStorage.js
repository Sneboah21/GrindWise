const STORAGE_KEY = "learningHistory";
const ACTIVE_SESSION_KEY = "activeLearningSession";

export async function getActiveLearningSession() {
  const data = await chrome.storage.local.get(ACTIVE_SESSION_KEY);
  return data[ACTIVE_SESSION_KEY] ?? null;
}

export async function saveActiveLearningSession(session) {
  await chrome.storage.local.set({
    [ACTIVE_SESSION_KEY]: session,
  });
}
export async function clearActiveLearningSession() {
  await chrome.storage.local.remove(ACTIVE_SESSION_KEY);
}

export async function getLearningHistory() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const history = result[STORAGE_KEY];

  return Array.isArray(history) ? history : [];
}

export async function saveLearningSession(session) {
  const history = await getLearningHistory();

  history.push(session);

  await chrome.storage.local.set({
    [STORAGE_KEY]: history,
  });
}

export async function clearLearningHistory() {
  await chrome.storage.local.set({
    [STORAGE_KEY]: [],
  });
}

export async function deleteLearningSession(sessionId) {
  const history = await getLearningHistory();

  const filtered = history.filter(
    (session) => session?.id !== sessionId,
  );

  await chrome.storage.local.set({
    [STORAGE_KEY]: filtered,
  });
}