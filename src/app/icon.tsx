import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Dynamically generated favicon — Next.js auto-links this at `/icon` with
 *  the right `<link rel="icon">` tag, matching the in-app logo mark. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #5b7fff, #7c5cff)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="white" />
          <path d="M14 2v6h6" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
    ),
    size
  );
}
