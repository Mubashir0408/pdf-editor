import fs from "node:fs/promises";
import { PDFDocument } from "@cantoo/pdf-lib";

import { ApiError } from "../utils/ApiError";

export interface ProtectOptions {
  password: string;
  allowPrinting: boolean;
  allowCopying: boolean;
}

/**
 * The raw encryption operation — parallel to `PdfService`, but its own
 * class because it depends on `@cantoo/pdf-lib` rather than plain
 * `pdf-lib` —
 * upstream pdf-lib can *read* an encrypted PDF but has no support for
 * *writing* one. `@cantoo/pdf-lib` is a maintained fork that adds real
 * encryption on top of the same API, so this stays isolated to the one
 * tool that needs it instead of mixing two PDF libraries into the
 * shared service every other tool uses.
 *
 * There's only one password field in the UI, so it's used as both the
 * user password (required to open the file) and the owner password
 * (required to change permissions) — a standard simplification when a
 * tool doesn't collect a separate owner password.
 */
export class PdfEncryptionService {
  async protect(inputPath: string, options: ProtectOptions, label = "the file"): Promise<Uint8Array> {
    const bytes = await fs.readFile(inputPath);

    let doc: PDFDocument;
    try {
      doc = await PDFDocument.load(bytes);
    } catch {
      throw ApiError.badRequest(`"${label}" doesn't look like a valid PDF file.`);
    }

    doc.encrypt({
      userPassword: options.password,
      ownerPassword: options.password,
      permissions: {
        printing: options.allowPrinting ? "highResolution" : false,
        copying: options.allowCopying,
        contentAccessibility: options.allowCopying,
        modifying: false,
        annotating: false,
        fillingForms: false,
        documentAssembly: false,
      },
    });

    return doc.save();
  }
}
