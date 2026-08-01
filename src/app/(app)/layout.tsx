import { AppShell } from "@/components/layout/app-shell";
import { PendingFileProvider } from "@/components/providers/pending-file-provider";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <PendingFileProvider>
      <AppShell>{children}</AppShell>
    </PendingFileProvider>
  );
}
