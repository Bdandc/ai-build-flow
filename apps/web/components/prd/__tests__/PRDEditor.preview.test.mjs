import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import sanitizeHtml from '@ai-build-flow/sanitizer';

test('sanitizes script tags from rendered preview', () => {
  const markdown = 'Hello<script>alert(1)</script>World';
  const rawHtml = marked.parse(markdown);
  const sanitized = sanitizeHtml(rawHtml);

  assert.ok(!sanitized.includes('<script'), 'script tags should be stripped');
  assert.ok(!sanitized.includes('alert(1)'), 'script contents should be removed');
  assert.match(sanitized, /Hello.*World/);
});
