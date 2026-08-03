const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Used wherever spreadsheet cell values or presentation slide text — both
 * arbitrary user content — get interpolated into HTML that's then handed to
 * Puppeteer. Without this, a cell containing `<script>` or a bare `&` would
 * corrupt the rendered layout (at best) rather than appear as literal text.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]!);
}
