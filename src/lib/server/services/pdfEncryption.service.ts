import fs from "node:fs/promises";
import { PDFDocument } from "@cantoo/pdf-lib";

import { ApiError } from "../ApiError";

export interface ProtectOptions {
  password: string;
  allowPrinting: boolean;
  allowCopying: boolean;
}

/** Ported unchanged from the old Express backend's `pdfEncryption.service.ts`. */
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
