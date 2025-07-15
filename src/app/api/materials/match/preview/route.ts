import { NextResponse } from "next/server";
import { MaterialService } from "@/lib/services/material-service";
import { withAuthAndDBParams } from "@/lib/api-middleware";
import { AuthenticatedRequest } from "@/lib/auth-middleware";

interface GetKBOBMatchPreviewRequest {
  materialIds: string[];
  kbobMaterialId: string;
}

async function getKBOBMatchPreview(request: AuthenticatedRequest) {
  const body: GetKBOBMatchPreviewRequest = await request.json();
  const { materialIds, kbobMaterialId } = body;

  const preview = await MaterialService.getKBOBMatchPreview(
    materialIds,
    kbobMaterialId
  );

  return NextResponse.json(preview);
}

export const POST = withAuthAndDBParams(getKBOBMatchPreview);
