import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Next.js auto-links this at `/apple-icon` as `<link rel="apple-touch-icon">`. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5b7fff, #7c5cff)",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
          <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="white" />
          <path d="M14 2v6h6" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
    ),
    size
  );
}
