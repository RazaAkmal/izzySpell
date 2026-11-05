// Caps that keep AI / OCR cost bounded
export const MAX_WORDS_PER_LIST = 100;
export const MAX_WORDS_ERROR = `Word lists are limited to ${MAX_WORDS_PER_LIST} words.`;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB (files and images)
// Raw words/tokens read from an uploaded file that are sent to the first AI step
export const MAX_RAW_TOKENS = 3000;
