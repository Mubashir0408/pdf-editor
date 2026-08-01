import { FileText, FileSpreadsheet, FileImage, File as FileGeneric, Presentation, FileArchive } from "lucide-react";

import { cn } from "@/lib/utils";
import { getFileIconColor } from "@/lib/mock-data";
import type { FileType } from "@/lib/types";

const iconMap: Record<FileType, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
  jpg: FileImage,
  png: FileImage,
  txt: FileGeneric,
  zip: FileArchive,
};

export function FileIcon({ type, className }: { type: FileType; className?: string }) {
  const Icon = iconMap[type];
  const { bg, fg } = getFileIconColor(type);

  return (
    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", bg, className)}>
      <Icon className={cn("size-5", fg)} strokeWidth={2} />
    </div>
  );
}
