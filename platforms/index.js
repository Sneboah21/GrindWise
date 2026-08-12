import { KNOWN_PLATFORM_HOSTS } from "../utils/constants.js";
import { scrapeAtCoder, isProblemPage as isAtCoderProblemPage } from "./atcoder.js";
import { scrapeCodeChef, isProblemPage as isCodeChefProblemPage } from "./codechef.js";
import { scrapeCodeforces, isProblemPage as isCodeforcesProblemPage } from "./codeforces.js";
import { scrapeGFG, isProblemPage as isGFGProblemPage } from "./gfg.js";
import { scrapeHackerRank, isProblemPage as isHackerRankProblemPage } from "./hackerrank.js";
import { scrapeInterviewBit, isProblemPage as isInterviewBitProblemPage } from "./interviewbit.js";
import { scrapeLeetCode, isProblemPage as isLeetCodeProblemPage } from "./leetcode.js";
import { scrapeTakeYouForward, isProblemPage as isTakeYouForwardProblemPage } from "./takeuforward.js";

/**
 * Check whether the current page belongs to a supported platform's domain.
 * This is a lightweight hostname-only check — it does NOT confirm the user
 * is on an actual problem page. Use isProblemPage() for that.
 * @returns {boolean}
 */
export function isOnKnownPlatform() {
  const host = location.hostname;
  return KNOWN_PLATFORM_HOSTS.some((item) => host.includes(item));
}

/**
 * Check whether the current page is an actual problem-solving page
 * (not home, discuss, contest list, profile, etc.) for the detected platform.
 * Each platform module defines its own isProblemPage() based on URL + DOM markers.
 * @returns {boolean}
 */
export function isProblemPage() {
  const host = location.hostname;

  if (host.includes("leetcode.com")) return isLeetCodeProblemPage();
  if (host.includes("codeforces.com")) return isCodeforcesProblemPage();
  if (host.includes("geeksforgeeks.org")) return isGFGProblemPage();
  if (host.includes("codechef.com")) return isCodeChefProblemPage();
  if (host.includes("atcoder.jp")) return isAtCoderProblemPage();
  if (host.includes("hackerrank.com")) return isHackerRankProblemPage();
  if (host.includes("interviewbit.com")) return isInterviewBitProblemPage();
  if (host.includes("takeuforward.org")) return isTakeYouForwardProblemPage();

  return false;
}

/**
 * Get problem details for the current platform.
 * @returns {{ platform: string, title: string, description: string }|null}
 */
export function getPlatformData() {
  const host = location.hostname;

  if (host.includes("leetcode.com")) return scrapeLeetCode();
  if (host.includes("codeforces.com")) return scrapeCodeforces();
  if (host.includes("geeksforgeeks.org")) return scrapeGFG();
  if (host.includes("codechef.com")) return scrapeCodeChef();
  if (host.includes("atcoder.jp")) return scrapeAtCoder();
  if (host.includes("hackerrank.com")) return scrapeHackerRank();
  if (host.includes("interviewbit.com")) return scrapeInterviewBit();
  if (host.includes("takeuforward.org")) return scrapeTakeYouForward();

  return null;
}