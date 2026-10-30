// The one OpenAI chat model used for list processing, flash cards, scramble words and
// quiz timer suggestions. "gpt-4" was retired by OpenAI (404 "has been deprecated").
// Same model the mobile API uses (PROCESS_MODEL). Override with the optional OPENAI_MODEL env var.
// The cheap word-extraction step stays on gpt-4o-mini (see extractWordsFromContent).
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1";
