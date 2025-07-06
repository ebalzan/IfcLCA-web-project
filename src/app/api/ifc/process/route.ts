import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withAuthAndDB } from "@/lib/api-middleware";
import { AuthenticatedRequest } from "@/lib/auth-middleware";

export const maxDuration = 300; // 5 minutes
export const runtime = "nodejs";

async function processIfcFile(request: AuthenticatedRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Forward to external API without API key (public endpoint)
  const externalFormData = new FormData();
  const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
  externalFormData.append("file", fileBlob, file.name || "upload.ifc");

  const response = await fetch(
    "https://openbim-service-production.up.railway.app/api/ifc/process",
    {
      method: "POST",
      body: externalFormData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("External API error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error("Failed to process Ifc file");
  }

  // Stream the response back to the client
  const stream = response.body;
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
    },
  });
}

export const POST = withAuthAndDB(processIfcFile);
