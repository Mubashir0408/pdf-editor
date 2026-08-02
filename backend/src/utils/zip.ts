import JSZip from "jszip";

export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

/**
 * Bundles multiple generated files into one zip archive, in memory — used
 * whenever a tool produces more than one output file (Split, when the
 * source is broken into several pieces). A `Buffer` (which `Uint8Array`
 * covers) is returned rather than written to disk directly, matching
 * every other tool's output — the caller hands it to
 * `DownloadService.save()` exactly like a merged PDF's bytes.
 */
export async function createZip(entries: ZipEntry[]): Promise<Uint8Array> {
  const zip = new JSZip();

  for (const entry of entries) {
    zip.file(entry.name, entry.bytes);
  }

  return zip.generateAsync({ type: "uint8array" });
}
