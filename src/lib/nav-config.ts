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
  /** i18next key, e.g. "nav.dashboard" — resolved with `t()` at render time. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  labelKey?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    labelKey: "nav.overview",
    items: [{ labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "nav.tools",
    items: [
      { labelKey: "nav.convert", href: "/convert", icon: RefreshCw },
      { labelKey: "nav.merge", href: "/merge", icon: Layers },
      { labelKey: "nav.split", href: "/split", icon: Scissors },
      { labelKey: "nav.compress", href: "/compress", icon: Minimize2 },
      { labelKey: "nav.ocr", href: "/ocr", icon: ScanText },
      { labelKey: "nav.translate", href: "/translate", icon: Languages },
      { labelKey: "nav.aiChat", href: "/chat", icon: Sparkles, badge: "New" },
      { labelKey: "nav.protect", href: "/tools/protect", icon: Lock },
      { labelKey: "nav.watermark", href: "/tools/watermark", icon: Stamp },
      { labelKey: "nav.rotate", href: "/tools/rotate", icon: RotateCw },
      { labelKey: "nav.extractPages", href: "/tools/extract-pages", icon: FileOutput },
      { labelKey: "nav.deletePages", href: "/tools/delete-pages", icon: FileMinus },
      { labelKey: "nav.wordToPdf", href: "/tools/word-to-pdf", icon: FileText },
      { labelKey: "nav.excelToPdf", href: "/tools/excel-to-pdf", icon: Sheet },
      { labelKey: "nav.pptToPdf", href: "/tools/powerpoint-to-pdf", icon: MonitorPlay },
      { labelKey: "nav.imageToPdf", href: "/tools/image-to-pdf", icon: Image },
      { labelKey: "nav.pdfToImage", href: "/tools/pdf-to-image", icon: ImageDown },
      { labelKey: "nav.pdfToWord", href: "/tools/pdf-to-word", icon: FileEdit },
    ],
  },
  {
    items: [{ labelKey: "nav.settings", href: "/settings", icon: Settings }],
  },
];

export const mobileNavItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.convert", href: "/convert", icon: RefreshCw },
  { labelKey: "nav.merge", href: "/merge", icon: Layers },
  { labelKey: "nav.aiChat", href: "/chat", icon: Sparkles },
  { labelKey: "nav.settings", href: "/settings", icon: Settings },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
