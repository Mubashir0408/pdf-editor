import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  RefreshCw,
  Layers,
  Scissors,
  Minimize2,
  ScanText,
  Languages,
  Sparkles,
  Lock,
  Stamp,
  RotateCw,
  FileOutput,
  FileMinus,
  Settings,
  FileText,
  Sheet,
  MonitorPlay,
  Image,
  ImageDown,
  FileEdit,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Tools",
    items: [
      { label: "Convert PDF", href: "/convert", icon: RefreshCw },
      { label: "Merge PDF", href: "/merge", icon: Layers },
      { label: "Split PDF", href: "/split", icon: Scissors },
      { label: "Compress PDF", href: "/compress", icon: Minimize2 },
      { label: "OCR", href: "/ocr", icon: ScanText },
      { label: "Translate", href: "/translate", icon: Languages },
      { label: "AI Chat", href: "/chat", icon: Sparkles, badge: "New" },
      { label: "Password Protect", href: "/tools/protect", icon: Lock },
      { label: "Watermark", href: "/tools/watermark", icon: Stamp },
      { label: "Rotate", href: "/tools/rotate", icon: RotateCw },
      { label: "Extract Pages", href: "/tools/extract-pages", icon: FileOutput },
      { label: "Delete Pages", href: "/tools/delete-pages", icon: FileMinus },
      { label: "Word to PDF", href: "/tools/word-to-pdf", icon: FileText },
      { label: "Excel to PDF", href: "/tools/excel-to-pdf", icon: Sheet },
      { label: "PowerPoint to PDF", href: "/tools/powerpoint-to-pdf", icon: MonitorPlay },
      { label: "Image to PDF", href: "/tools/image-to-pdf", icon: Image },
      { label: "PDF to Image", href: "/tools/pdf-to-image", icon: ImageDown },
      { label: "PDF to Word", href: "/tools/pdf-to-word", icon: FileEdit },
    ],
  },
  {
    label: "",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export const mobileNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Convert", href: "/convert", icon: RefreshCw },
  { label: "Merge", href: "/merge", icon: Layers },
  { label: "AI Chat", href: "/chat", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
