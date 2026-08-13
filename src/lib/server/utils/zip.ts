import JSZip from "jszip";

export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

export async function createZip(entries: ZipEntry[]): Promise<Uint8Array> {
  const zip = new JSZip();

  for (const entry of entries) {
    zip.file(entry.name, entry.bytes);
  }

  return zip.generateAsync({ type: "uint8array" });
}
