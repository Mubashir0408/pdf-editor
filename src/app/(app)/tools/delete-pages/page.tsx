import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import DeletePagesView from "./delete-pages-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Delete Pages from PDF Online Free",
  description: "Remove unwanted pages from a PDF document permanently. Free online PDF page remover.",
  path: "/tools/delete-pages",
  keywords: ["delete pdf pages", "remove pages from pdf", "pdf page remover"],
});

export default function Page() {
  return <DeletePagesView />;
}
