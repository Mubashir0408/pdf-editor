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

export function extractTextLines(items: PdfjsTextItem[]): string[] {
  return groupIntoLines(items).map((line) => line.text);
}

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
