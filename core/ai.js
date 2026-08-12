import { SYSTEM_PROMPT } from "./promptBuilder.js";

/**
 * Call the selected AI provider and parse the returned hints.
 * @param {string} provider
 * @param {string} apiKey
 * @param {string} prompt
 * @returns {Promise<{ hint: string }>}
 */
export async function callAI(provider, apiKey, prompt) {
  const userMsg = prompt;

  let res;
  try {
    if (provider === "groq") {
      res = await fetchGroq(apiKey, userMsg);
    } else if (provider === "openai") {
      res = await fetchOpenAI(apiKey, userMsg);
    } else if (provider === "gemini") {
      res = await fetchGemini(apiKey, userMsg);
    } else if (provider === "claude") {
      res = await fetchClaude(apiKey, userMsg);
    } else if (provider === "cohere") {
      res = await fetchCohere(apiKey, userMsg);
    } else {
      throw new Error("unknown_provider");
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("network");
    }
    throw error;
  }

  return parseHintResponse(res);
}

/**
 * Call the OpenAI Chat Completions API.
 * @param {string} apiKey
 * @param {string} userMsg
 * @returns {Promise<string>}
 */
export async function fetchOpenAI(apiKey, userMsg) {
  return fetchOpenAICompat(
    "https://api.openai.com/v1/chat/completions",
    apiKey,
    "gpt-4o-mini",
    userMsg,
  );
}

/**
 * Call the Groq OpenAI-compatible API.
 * @param {string} apiKey
 * @param {string} userMsg
 * @returns {Promise<string>}
 */
export async function fetchGroq(apiKey, userMsg) {
  return fetchOpenAICompat(
    "https://api.groq.com/openai/v1/chat/completions",
    apiKey,
    "llama-3.3-70b-versatile",
    userMsg,
  );
}

async function fetchOpenAICompat(endpoint, apiKey, model, userMsg) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
    }),
  });
  if (r.status === 429) throw new Error("rate_limit");
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error?.message || `api_error_${r.status}`);
  }
  const d = await r.json();
  return d.choices?.[0]?.message?.content || "";
}

/**
 * Call the Gemini API.
 * @param {string} apiKey
 * @param {string} userMsg
 * @returns {Promise<string>}
 */
export async function fetchGemini(apiKey, userMsg) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMsg }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
      }),
    },
  );
  if (r.status === 429) throw new Error("rate_limit");
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error?.message || `api_error_${r.status}`);
  }
  const d = await r.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Call the Claude API.
 * @param {string} apiKey
 * @param {string} userMsg
 * @returns {Promise<string>}
 */
export async function fetchClaude(apiKey, userMsg) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (r.status === 429) throw new Error("rate_limit");
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error?.message || `api_error_${r.status}`);
  }
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

/**
 * Call the Cohere API.
 * @param {string} apiKey
 * @param {string} userMsg
 * @returns {Promise<string>}
 */
export async function fetchCohere(apiKey, userMsg) {
  const r = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "command-r-plus-08-2024",
      system_prompt: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
      max_tokens: 512,
    }),
  });
  if (r.status === 429) throw new Error("rate_limit");
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error?.message || `api_error_${r.status}`);
  }
  const d = await r.json();
  return d.message?.content?.[0]?.text || "";
}

/**
 * Parse raw hint JSON from the AI response.
 * @param {string} raw
 * @returns {{ hint: string }}
 */
export function parseHintResponse(raw) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("parse_error");
  }
  if (!parsed.hint) {
    throw new Error("parse_error");
  }
  return parsed;
}
