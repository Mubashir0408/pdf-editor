"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

/**
 * Replaces the old Express backend's `swagger-ui-express` mount at
 * `/api-docs`. `swagger-ui-react` renders the same interactive docs UI
 * against `/api/openapi.json` (the spec ported to `openapiSpec.ts`).
 * Loaded dynamically with SSR disabled — swagger-ui-react touches
 * `window`/DOM APIs directly and isn't SSR-safe.
 */
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div>
      <SwaggerUI url="/api/openapi.json" />
    </div>
  );
}
