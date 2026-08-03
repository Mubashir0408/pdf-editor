import type { FileType, QuickAction } from "@/lib/types";

export const quickActions: QuickAction[] = [
  { id: "convert", label: "Convert PDF", description: "Turn PDFs into any format", icon: "RefreshCw", href: "/convert", colorFrom: "#5B7FFF", colorTo: "#7C5CFF" },
  { id: "merge", label: "Merge PDF", description: "Combine files into one", icon: "Layers", href: "/merge", colorFrom: "#7C5CFF", colorTo: "#B45CFF" },
  { id: "split", label: "Split PDF", description: "Break apart by page range", icon: "Scissors", href: "/split", colorFrom: "#36CFC9", colorTo: "#5B7FFF" },
  { id: "compress", label: "Compress PDF", description: "Shrink file size fast", icon: "Minimize2", href: "/compress", colorFrom: "#22C55E", colorTo: "#36CFC9" },
  { id: "word-to-pdf", label: "Word to PDF", description: "DOCX → PDF instantly", icon: "FileText", href: "/tools/word-to-pdf", colorFrom: "#5B7FFF", colorTo: "#3D9BFF" },
  { id: "excel-to-pdf", label: "Excel to PDF", description: "XLSX → PDF instantly", icon: "Sheet", href: "/tools/excel-to-pdf", colorFrom: "#22C55E", colorTo: "#5B7FFF" },
  { id: "ppt-to-pdf", label: "PowerPoint to PDF", description: "PPTX → PDF instantly", icon: "MonitorPlay", href: "/tools/powerpoint-to-pdf", colorFrom: "#F59E0B", colorTo: "#EF4444" },
  { id: "image-to-pdf", label: "Image to PDF", description: "JPG / PNG → PDF", icon: "Image", href: "/tools/image-to-pdf", colorFrom: "#7C5CFF", colorTo: "#36CFC9" },
  { id: "pdf-to-word", label: "PDF to Word", description: "PDF → editable DOCX", icon: "FileEdit", href: "/tools/pdf-to-word", colorFrom: "#5B7FFF", colorTo: "#7C5CFF" },
  { id: "pdf-to-excel", label: "PDF to Excel", description: "Extract tables to XLSX", icon: "Table", href: "/convert?from=pdf&to=xlsx", colorFrom: "#22C55E", colorTo: "#36CFC9" },
  { id: "pdf-to-image", label: "PDF to Image", description: "Export pages as PNG/JPG", icon: "ImageDown", href: "/tools/pdf-to-image", colorFrom: "#F59E0B", colorTo: "#7C5CFF" },
  { id: "ocr", label: "OCR Scanner", description: "Extract text from scans", icon: "ScanText", href: "/ocr", colorFrom: "#36CFC9", colorTo: "#22C55E" },
  { id: "translate", label: "Translate PDF", description: "Translate any document", icon: "Languages", href: "/translate", colorFrom: "#5B7FFF", colorTo: "#36CFC9" },
  { id: "ai-chat", label: "AI Chat", description: "Ask questions about a file", icon: "Sparkles", href: "/chat", colorFrom: "#7C5CFF", colorTo: "#5B7FFF" },
  { id: "protect", label: "Password Protect", description: "Encrypt sensitive files", icon: "Lock", href: "/tools/protect", colorFrom: "#EF4444", colorTo: "#F59E0B" },
  { id: "watermark", label: "Watermark PDF", description: "Brand and protect pages", icon: "Stamp", href: "/tools/watermark", colorFrom: "#7C5CFF", colorTo: "#EF4444" },
  { id: "rotate", label: "Rotate PDF", description: "Fix page orientation", icon: "RotateCw", href: "/tools/rotate", colorFrom: "#36CFC9", colorTo: "#5B7FFF" },
  { id: "extract", label: "Extract Pages", description: "Pull out specific pages", icon: "FileOutput", href: "/tools/extract-pages", colorFrom: "#5B7FFF", colorTo: "#22C55E" },
  { id: "delete-pages", label: "Delete Pages", description: "Remove unwanted pages", icon: "FileMinus", href: "/tools/delete-pages", colorFrom: "#EF4444", colorTo: "#7C5CFF" },
];

/** Curated subset shown in the "Popular tools" section on the homepage. */
export const popularToolIds = ["convert", "merge", "compress", "ai-chat", "ocr", "watermark"];

export const suggestedPrompts = [
  "Summarize this document in 5 bullet points",
  "What are the key risks mentioned?",
  "Extract all dates and deadlines",
  "Translate the executive summary to Spanish",
  "Find every mention of budget figures",
  "Draft a follow-up email based on this",
];

export const languages = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Dutch", "Japanese", "Korean", "Mandarin Chinese", "Arabic", "Hindi",
  "Russian", "Turkish", "Polish", "Vietnamese",
];

export const conversionFormats: Record<string, string[]> = {
  pdf: ["docx", "xlsx", "pptx", "jpg", "png", "txt"],
  docx: ["pdf"],
  xlsx: ["pdf"],
  pptx: ["pdf"],
  jpg: ["pdf"],
  png: ["pdf"],
};

export function getFileIconColor(type: FileType) {
  const map: Record<FileType, { bg: string; fg: string }> = {
    pdf: { bg: "bg-red-500/10", fg: "text-red-500" },
    docx: { bg: "bg-blue-500/10", fg: "text-blue-500" },
    xlsx: { bg: "bg-emerald-500/10", fg: "text-emerald-500" },
    pptx: { bg: "bg-orange-500/10", fg: "text-orange-500" },
    jpg: { bg: "bg-purple-500/10", fg: "text-purple-500" },
    png: { bg: "bg-purple-500/10", fg: "text-purple-500" },
    txt: { bg: "bg-slate-500/10", fg: "text-slate-500" },
    zip: { bg: "bg-amber-500/10", fg: "text-amber-500" },
  };
  return map[type];
}
