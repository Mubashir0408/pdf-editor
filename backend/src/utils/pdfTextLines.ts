import type { PdfjsTextItem } from "./pdfjs";

const Y_TOLERANCE = 2;

/**
 * Groups a page's raw text items (each with its own x/y position from the
 * PDF's content stream) into reading-order lines. PDF text has no inherent
 * concept of a "line" or "paragraph" — this reconstructs one by clustering
 * items whose baseline y-coordinate is within a small tolerance of each
 * other, then ordering those clusters top-to-bottom and each cluster's
 * items left-to-right. Used by PDF → Word, where the goal is readable
 * reflowed text, not a pixel-accurate layout reproduction.
 */
export function extractTextLines(items: PdfjsTextItem[]): string[] {
  const lines: { y: number; parts: { x: number; text: string }[] }[] = [];

  for (const item of items) {
    if (!item.str) continue;
    const x = item.transform[4] ?? 0;
    const y = item.transform[5] ?? 0;

    let line = lines.find((l) => Math.abs(l.y - y) <= Y_TOLERANCE);
    if (!line) {
      line = { y, parts: [] };
      lines.push(line);
    }
    line.parts.push({ x, text: item.str });
  }

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) =>
      line.parts
        .sort((a, b) => a.x - b.x)
        .map((p) => p.text)
        .join("")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((text) => text.length > 0);
}
