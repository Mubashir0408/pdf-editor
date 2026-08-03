import fs from "node:fs";
import puppeteer, { type Browser } from "puppeteer";

import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";

export interface HtmlToPdfOptions {
  /** e.g. "A4" — omit when `width`/`height` are given instead. */
  format?: "A4" | "Letter";
  width?: string;
  height?: string;
  printBackground?: boolean;
  landscape?: boolean;
  margin?: { top?: string; bottom?: string; left?: string; right?: string };
}

/**
 * Word/Excel/PowerPoint → PDF all reduce to the same last step: render an
 * HTML representation of the document with a headless browser and print it
 * to PDF. This class owns the one browser instance the whole process
 * shares — launching a fresh Chromium per conversion would cost a second
 * or more of every single request, so `getBrowser()` starts it once, lazily,
 * on first use and every conversion reuses it via a short-lived page/tab.
 *
 * No bundled Chromium ships with this project (it wasn't reliably
 * downloadable in every environment); instead this resolves whatever
 * Chromium-family browser is already on the machine — Puppeteer's own
 * managed install if present, otherwise system Edge/Chrome/Chromium.
 */
export class HtmlRendererService {
  private browserPromise: Promise<Browser> | null = null;

  async renderToPdf(html: string, options: HtmlToPdfOptions = {}): Promise<Uint8Array> {
    try {
      return await this.renderToPdfOnce(html, options);
    } catch (err) {
      // The cached browser can die between the connected-check in
      // getBrowser() and actually using it (or mid-render). One retry
      // against a freshly launched browser covers that race without
      // masking a genuine, repeatable rendering failure.
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

  /**
   * Reuses the cached browser only while it's actually still connected —
   * Chromium can die on its own (OOM, a host-level kill, ...) between
   * requests, and without this check every conversion after that would
   * keep failing forever with a stale "Connection closed" error instead of
   * the service recovering by relaunching.
   */
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
    const executablePath = await resolveChromiumExecutablePath();

    try {
      return await puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      logger.error({ err, executablePath }, "Failed to launch Chromium for document conversion");
      throw ApiError.serviceUnavailable(
        "Document conversion is temporarily unavailable — no compatible browser engine could be started on the server."
      );
    }
  }
}

/**
 * Prefers an operator-supplied path (`PUPPETEER_EXECUTABLE_PATH`), then
 * Puppeteer's own managed download if one succeeded, then falls back to
 * whatever Chromium-family browser is already installed on the host.
 * Returns `undefined` only as an absolute last resort, letting Puppeteer
 * make its own (likely-failing) attempt so the error message is at least
 * Puppeteer's own.
 */
async function resolveChromiumExecutablePath(): Promise<string | undefined> {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const managed = await puppeteer.executablePath();
    if (managed && fs.existsSync(managed)) return managed;
  } catch {
    // No managed browser installed — fall through to system candidates.
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
        : [
            "/usr/bin/google-chrome",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
            "/usr/bin/microsoft-edge",
          ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}
