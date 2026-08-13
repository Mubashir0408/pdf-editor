import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS } from "@/lib/seo";
import "./globals.css";

/** Temporary safety net: `SITE_URL` should always be a valid absolute URL,
 *  but an unguarded `new URL()` here takes down the entire build (every
 *  page collects this shared layout's metadata) if it isn't. Omitting
 *  `metadataBase` entirely on failure is safe — Next.js just falls back to
 *  resolving relative OG/canonical URLs against the request origin instead. */
function safeMetadataBase(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Online PDF Tools`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} — Free Online PDF Tools`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free Online PDF Tools`,
    description: DEFAULT_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafafc",
};

/** WebApplication structured data — tells search engines this is a free,
 *  browser-based tool (not a company brochure page), which is what
 *  qualifies it for rich-result treatment in search. Site-wide since every
 *  route is a facet of the same application, not a separate "product". */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full min-h-screen bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          // Structured data is 100% static/hardcoded above, never user input —
          // the `<` escape is just defense-in-depth against a `</script>`
          // sequence prematurely closing this tag, not an XSS concern here.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <AuthProvider>
          <I18nProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster />
            </TooltipProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
