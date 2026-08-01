export type FileType =
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "jpg"
  | "png"
  | "txt"
  | "zip";

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  colorFrom: string;
  colorTo: string;
}

export interface ChatSource {
  id: string;
  fileName: string;
  page: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: ChatSource[];
}
