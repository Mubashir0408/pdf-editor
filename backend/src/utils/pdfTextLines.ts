import type { PdfjsTextItem } from "./pdfjs";

const Y_TOLERANCE = 2;

interface Line {
  y: number;
  text: string;
}

function groupIntoLines(items: PdfjsTextItem[]): Line[] {
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
    .map((line) => ({
      y: line.y,
      text: line.parts
        .sort((a, b) => a.x - b.x)
        .map((p) => p.text)
        .join("")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((line) => line.text.length > 0);
}

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
  return groupIntoLines(items).map((line) => line.text);
}

/**
 * Builds on `extractTextLines` by additionally merging consecutive lines
 * into paragraphs — lines spaced closer than ~1.6x the page's typical
 * line-height are treated as wrapped text within the same paragraph; a
 * bigger vertical gap (a blank line, a heading, a new section) starts a
 * new one. Used by Translate PDF, where preserving paragraph boundaries
 * matters more than preserving every individual line break.
 */
export function extractParagraphs(items: PdfjsTextItem[]): string[] {
  const lines = groupIntoLines(items);
  if (lines.length === 0) return [];
  if (lines.length === 1) return [lines[0]!.text];

  const gaps = lines.slice(1).map((line, i) => lines[i]!.y - line.y);
  const typicalGap = median(gaps.filter((g) => g > 0)) || 14;

  const paragraphs: string[] = [];
  let current = lines[0]!.text;

  for (let i = 1; i < lines.length; i++) {
    const gap = lines[i - 1]!.y - lines[i]!.y;
    if (gap > typicalGap * 1.6) {
      paragraphs.push(current);
      current = lines[i]!.text;
    } else {
      current += ` ${lines[i]!.text}`;
    }
  }
  paragraphs.push(current);

  return paragraphs.filter((p) => p.trim().length > 0);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}
