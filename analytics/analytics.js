/**
 * analytics/analytics.js
 *
 * Pure analytics functions for GrindWise.
 * This module NEVER interacts with chrome.storage or the UI.
 * It only computes statistics from a provided learning history array.
 */

/**
 * Returns the number of solved sessions.
 */
export function calculateSolvedCount(history) {
    return history.filter(session => session.solved).length;
}

/**
 * Returns the average hints used per session.
 */
export function calculateAverageHints(history) {
    if (!history.length) return 0;

    const totalHints = history.reduce(
        (sum, session) => sum + (session.hintRequests || 0),
        0
    );

    return Number((totalHints / history.length).toFixed(2));
}

/**
 * Returns the average solving time in seconds.
 */
export function calculateAverageTime(history) {
    if (!history.length) return 0;

    const totalTime = history.reduce(
        (sum, session) => sum + (session.timeSpent || 0),
        0
    );

    return Number((totalTime / history.length).toFixed(2));
}

/**
 * Returns the percentage of completed sessions.
 */
export function calculateCompletionRate(history) {
    if (!history.length) return 0;

    const solved = calculateSolvedCount(history);

    return Number(((solved / history.length) * 100).toFixed(2));
}

/**
 * Returns learning mode usage with both counts and percentages.
 */
export function calculateLearningModeUsage(history) {
    const total = history.length;

    const counts = {
        coaching: 0,
        socratic: 0,
        direct: 0
    };

    history.forEach(session => {
        const mode = session.learningMode;

        if (Object.prototype.hasOwnProperty.call(counts, mode)) {
            counts[mode]++;
        }
    });

    const toPercentage = count =>
        total === 0 ? 0 : Number(((count / total) * 100).toFixed(2));

    return {
        coaching: {
            count: counts.coaching,
            percentage: toPercentage(counts.coaching)
        },
        socratic: {
            count: counts.socratic,
            percentage: toPercentage(counts.socratic)
        },
        direct: {
            count: counts.direct,
            percentage: toPercentage(counts.direct)
        }
    };
}

/**
 * Returns all analytics in one object.
 */
export function calculateStatistics(history) {
    return {
        totalSessions: history.length,

        totalSolved: calculateSolvedCount(history),

        averageHints: calculateAverageHints(history),

        averageTime: calculateAverageTime(history),

        completionRate: calculateCompletionRate(history),

        learningModes: calculateLearningModeUsage(history)
    };
}