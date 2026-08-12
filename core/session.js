import {
  saveLearningSession,
  saveActiveLearningSession,
  getActiveLearningSession,
  clearActiveLearningSession,
} from "../storage/analyticsStorage.js";

import { DEFAULT_LEARNING_MODE } from "../utils/constants.js";

let currentSession = null;

/**
 * Create and store the current learning session.
 * @param {{ platform: string, title: string, description: string, difficulty?: string, language?: string }} problem
 * @param {string} provider
 * @param {string} learningMode
 * @returns {Object}
 */
export async function createLearningSession(
  problem,
  provider,
  learningMode = DEFAULT_LEARNING_MODE,
) {
  currentSession = {
    platform: problem.platform,
    title: problem.title,
    description: problem.description,

    provider,

    difficulty: problem.difficulty || "Unknown",
    language: problem.language || "Unknown",

    startTime: Date.now(),

    hintRequests: 0,

    hints: {
      hint1: "",
      hint2: "",
      hint3: "",
    },

    mode: learningMode,

    solved: false,
  };

  await saveActiveLearningSession(currentSession);

  return currentSession;
}

/**
 * Restore the active learning session from storage.
 * @returns {Promise<Object|null>}
 */
export async function restoreActiveLearningSession() {
  currentSession = await getActiveLearningSession();
  return currentSession;
}

function isSameProblem(session, problem) {
  return (
    session?.platform === (problem?.platform ?? "Unknown") &&
    session?.title === (problem?.title ?? "") &&
    session?.description === (problem?.description ?? "")
  );
}

/**
 * Get the active learning session.
 * @returns {Object|null}
 */
export function getCurrentSession() {
  return currentSession;
}

/**
 * Whether the active learning session matches the current problem.
 * @param {{ platform: string, title: string, description: string }} problem
 * @returns {boolean}
 */
export function isActiveSessionForProblem(problem) {
  if (!currentSession || currentSession.solved) return false;

  return isSameProblem(currentSession, problem);
}

/**
 * Return seconds elapsed in the active session.
 * @returns {number}
 */
export function getElapsedTime() {
  if (!currentSession) return 0;

  return Math.floor((Date.now() - currentSession.startTime) / 1000);
}

/**
 * Complete the active learning session and persist it.
 */
export async function completeLearningSession() {
  // No active session, or session was already completed.
  if (!currentSession || currentSession.solved) return;

  currentSession.solved = true;

  const endTime = Date.now();

  const completedSession = {
    id: crypto.randomUUID(),

    title: currentSession.title,
    platform: currentSession.platform,
    description: currentSession.description,
    difficulty: currentSession.difficulty,
    language: currentSession.language,
    provider: currentSession.provider,

    learningMode: currentSession.mode,

    startTime: currentSession.startTime,
    endTime,

    timeSpent: Math.floor(
      (endTime - currentSession.startTime) / 1000,
    ),

    hintRequests: currentSession.hintRequests,

    solved: true,

    date: new Date().toISOString().split("T")[0],
  };
  try {
    await saveLearningSession(completedSession);
    await clearActiveLearningSession();
    currentSession = null;
  } catch (error) {
    console.error(
      "[GrindWise] Failed to complete learning session:",
      error,
    );
    // Keep the active session available so completion can be retried.
    currentSession.solved = false;
    throw error;
  }
}

/**
 * Get the generated hints stored in the active session.
 * @returns {{ hint1: string, hint2: string, hint3: string }}
 */
export function getSessionHints() {
  return (
    currentSession?.hints ?? {
      hint1: "",
      hint2: "",
      hint3: "",
    }
  );
}

/**
 * Update the generated hints stored in the active session.
 * @param {{ hint1?: string, hint2?: string, hint3?: string }} hints
 */
export async function setSessionHints(hints) {
  if (!currentSession) return;

  currentSession.hints = {
    hint1: currentSession.hints?.hint1 ?? "",
    hint2: currentSession.hints?.hint2 ?? "",
    hint3: currentSession.hints?.hint3 ?? "",
    ...hints,
  };

  await saveActiveLearningSession(currentSession);
}

/**
 * Increment the active session hint counter.
 */
export async function incrementHintCount() {
  if (currentSession) {
    currentSession.hintRequests += 1;

    await saveActiveLearningSession(currentSession);
  }
}

/**
 * Get the number of hints requested.
 */
export function getHintCount() {
  return currentSession?.hintRequests ?? 0;
}

/**
 * Get the active learning mode.
 */
export function getLearningMode() {
  return currentSession?.mode ?? "coaching";
}
