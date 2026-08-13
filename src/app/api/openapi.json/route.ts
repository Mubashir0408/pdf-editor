import { NextResponse } from "next/server";

import { openapiSpec } from "@/lib/server/openapiSpec";

export function GET() {
  return NextResponse.json(openapiSpec);
}
