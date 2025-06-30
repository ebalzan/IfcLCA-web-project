import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Upload } from "@/models";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const filename = body.filename || "Unnamed File";

    // Await params before accessing its properties
    const { id } = await params;

    // Validate and convert project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Create upload document with all required fields
    const upload = new Upload({
      projectId: new mongoose.Types.ObjectId(id),
      userId,
      filename,
      status: "Processing",
      elementCount: 0,
      materialCount: 0,
      deleted: false,
    });

    // Save with validation
    await upload.save();

    return NextResponse.json({
      success: true,
      uploadId: upload._id.toString(),
      status: upload.status,
      filename: upload.filename,
    });
  } catch (error) {
    console.error("Upload creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create upload record" },
      { status: 500 }
    );
  }
}
