// The one OpenAI chat model used for every AI step: word extraction, list processing,
// flash cards, scramble words and quiz timer suggestions. Override with the optional
// OPENAI_MODEL env var. GPT-5 family models reject "max_tokens": use "max_completion_tokens".
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
