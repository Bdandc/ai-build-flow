const SCRIPT_REGEX = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_REGEX = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_REGEX = /((?:href|src)\s*=\s*["'])\s*javascript:[^"']*(["'])/gi;

/**
 * Very small sanitizer that removes script tags and dangerous inline handlers.
 * This is not a full HTML sanitizer but is sufficient to protect the PRD preview.
 */
export function sanitizeHtml(input = "") {
  if (!input) return "";

  let sanitized = input.replace(SCRIPT_REGEX, "");
  sanitized = sanitized.replace(EVENT_HANDLER_REGEX, "");
  sanitized = sanitized.replace(JAVASCRIPT_URL_REGEX, "$1#$2");

  return sanitized;
}

export default sanitizeHtml;
