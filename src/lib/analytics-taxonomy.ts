export const CONTENT_TOPICS = [
  "ai",
  "devops",
  "hardware",
  "open_source",
  "software",
  "web_development",
  "other",
] as const;

export type ContentTopic = (typeof CONTENT_TOPICS)[number];

export function isContentTopic(value: string): value is ContentTopic {
  return CONTENT_TOPICS.includes(value as ContentTopic);
}

export function contentTopic(value: string | undefined): ContentTopic {
  return value && isContentTopic(value) ? value : "other";
}
