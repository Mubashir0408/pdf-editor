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
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="white" />
        </svg>
      </div>
    ),
    size
  );
}
