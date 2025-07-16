import { NextResponse } from "next/server"; 
import { Upload } from "@/models";
import { AuthenticatedRequest } from "@/lib/auth-middleware";
import { withAuthAndDBParams } from "@/lib/api-middleware";

async function getUpload(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const upload = await Upload.findById(id).populate("elements");

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    return NextResponse.json(upload); 
}

export const GET = withAuthAndDBParams(getUpload)