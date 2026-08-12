import { getCurrentSession, getElapsedTime } from "./session.js";

/**
 * Build the complete learning context passed to the prompt builder.
 *
 * @param {Object} problem
 * @param {string[]} previousHints
 * @returns {{
 *   problem: Object,
 *   platform: string,
 *   difficulty: string,
 *   language: string,
 *   elapsedTime: number,
 *   hintRequests: number,
 *   mode: string,
 *   solved: boolean,
 *   previousHints: string[]
 * }}
 */
export function buildHintContext(problem, previousHints = []) {
  const currentSession = getCurrentSession();

  return {
    problem,

    platform: currentSession?.platform ?? problem.platform ?? "Unknown",

    difficulty:
      currentSession?.difficulty ??
      problem.difficulty ??
      "Unknown",

    language:
      currentSession?.language ??
      problem.language ??
      "Unknown",

    elapsedTime: getElapsedTime(),

    hintRequests:
      currentSession?.hintRequests ?? 0,

    mode:
      currentSession?.mode ?? "coaching",

    solved:
      currentSession?.solved ?? false,

    previousHints,
  };
}
