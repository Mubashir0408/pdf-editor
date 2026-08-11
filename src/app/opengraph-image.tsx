import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Root-level image file — Next.js's metadata file convention uses this as
 *  the fallback `openGraph.images` for every route that doesn't define its
 *  own, so all ~20 tool pages get a real, on-brand preview image without
 *  needing 20 separate assets. Matches the actual in-app logo (gradient
 *  mark + "Docy" wordmark, see sidebar-content.tsx's `Logo`). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              borderRadius: 32,
              background: "linear-gradient(135deg, #5b7fff, #7c5cff)",
            }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"
                fill="white"
              />
              <path d="M14 2v6h6" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, color: "#12121a" }}>
            Doc
            <span style={{ color: "#5b7fff" }}>y</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#6b6b7b" }}>
          Free Online PDF Tools — Convert, Merge, Split &amp; Edit
        </div>
      </div>
    ),
    size
  );
}
