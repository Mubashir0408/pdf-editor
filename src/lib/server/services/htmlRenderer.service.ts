import fs from "node:fs";
import type { Browser } from "puppeteer-core";

import { logger } from "../logger";
import { ApiError } from "../ApiError";

export interface HtmlToPdfOptions {
  format?: "A4" | "Letter";
  width?: string;
  height?: string;
  printBackground?: boolean;
  landscape?: boolean;
  margin?: { top?: string; bottom?: string; left?: string; right?: string };
}

/** True on Vercel (and most other serverless hosts) — Vercel sets this
 *  automatically, so no separate env var to configure. */
const IS_SERVERLESS = !!process.env.VERCEL;

/**
 * Word/Excel/PowerPoint → PDF all reduce to the same last step: render an
 * HTML representation with a headless browser and print it to PDF. Adapted
 * from the old Express backend's `htmlRenderer.service.ts` — the actual
 * render logic (`renderToPdfOnce`) is unchanged; only how the browser
 * itself is launched differs by environment:
 *
 * - On Vercel: `puppeteer-core` + `@sparticuz/chromium`, the standard
 *   combination for headless Chrome on Vercel's Node serverless runtime.
 *   `@sparticuz/chromium`'s binary is Linux-only (Vercel's runtime), so it
 *   is never used outside `IS_SERVERLESS`.
 * - Locally: the exact same system-Chrome/Edge discovery the old backend
 *   used, so `npm run dev` behavior is unchanged.
 */
export class HtmlRendererService {
  private browserPromise: Promise<Browser> | null = null;

  async renderToPdf(html: string, options: HtmlToPdfOptions = {}): Promise<Uint8Array> {
    try {
      return await this.renderToPdfOnce(html, options);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        this.browserPromise = null;
        return this.renderToPdfOnce(html, options);
      }
      throw err;
    }
  }

  private async renderToPdfOnce(html: string, options: HtmlToPdfOptions): Promise<Uint8Array> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: "load" });
      return await page.pdf({
        format: options.format,
        width: options.width,
        height: options.height,
        printBackground: options.printBackground ?? true,
        landscape: options.landscape ?? false,
        margin: options.margin,
        preferCSSPageSize: !options.format,
      });
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  async closeBrowser(): Promise<void> {
    if (!this.browserPromise) return;
    const browser = await this.browserPromise;
    this.browserPromise = null;
    await browser.close().catch(() => undefined);
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browserPromise) {
      const browser = await this.browserPromise;
      if (browser.connected) return browser;
      this.browserPromise = null;
    }

    this.browserPromise = this.launchBrowser().catch((err) => {
      this.browserPromise = null;
      throw err;
    });
    return this.browserPromise;
  }

  private async launchBrowser(): Promise<Browser> {
    const puppeteer = (await import("puppeteer-core")).default;

    try {
      if (IS_SERVERLESS) {
        const chromium = (await import("@sparticuz/chromium")).default;
        return await puppeteer.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      }

      const executablePath = await resolveLocalChromiumExecutablePath();
      return await puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      logger.error({ err }, "Failed to launch Chromium for document conversion");
      throw ApiError.serviceUnavailable(
        "Document conversion is temporarily unavailable — no compatible browser engine could be started on the server."
      );
    }
  }
}

/** Local-dev-only: finds a system Chrome/Edge install — ported unchanged
 *  from the old backend, since `@sparticuz/chromium`'s binary only runs on
 *  Vercel's Linux runtime, not a Windows/Mac dev machine. */
async function resolveLocalChromiumExecutablePath(): Promise<string | undefined> {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/microsoft-edge"];

  return candidates.find((candidate) => fs.existsSync(candidate));
}
