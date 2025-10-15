const SCRIPT_REGEX = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_REGEX = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const QUOTED_JAVASCRIPT_URL_REGEX =
  /((?:href|src)\s*=\s*)(["'])\s*javascript:(?:(?!\2).)*\2/gi;
const UNQUOTED_JAVASCRIPT_URL_REGEX = /((?:href|src)\s*=\s*)javascript:[^\s>]+/gi;

/**
 * Very small sanitizer that removes script tags and dangerous inline handlers.
 * This is not a full HTML sanitizer but is sufficient to protect the PRD preview.
 */
export function sanitizeHtml(input = "") {
  if (!input) return "";

  let sanitized = input.replace(SCRIPT_REGEX, "");
  sanitized = sanitized.replace(EVENT_HANDLER_REGEX, "");
  sanitized = sanitized.replace(
    QUOTED_JAVASCRIPT_URL_REGEX,
    (_, attr, quote) => `${attr}${quote}#${quote}`,
  );
  sanitized = sanitized.replace(
    UNQUOTED_JAVASCRIPT_URL_REGEX,
    (_, attr) => `${attr}"#"`,
  );

  return sanitized;
}

export default sanitizeHtml;
