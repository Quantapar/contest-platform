export const languageList = {
  javascript: 63,
  python: 71,
  cpp: 54,
  c: 50,
  java: 62,
  typescript: 74,
} as const;

export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  RUNTIME_ERROR: 6,
} as const;
