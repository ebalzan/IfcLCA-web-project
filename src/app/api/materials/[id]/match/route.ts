import { NextResponse } from "next/server";
import { Material, Project } from "@/models";
import IMaterialDB from "@/interfaces/materials/IMaterialDB";
import { withAuthAndDBParams } from "@/lib/api-middleware";
import { AuthenticatedRequest, getUserId } from "@/lib/auth-middleware";
import { Types } from "mongoose";
import IKBOBMaterial from "@/interfaces/materials/IKBOBMaterial";

interface MatchMaterialRequest {
  kbobMatchId: Types.ObjectId
}

interface MatchMaterialResponse extends Omit<IMaterialDB, '_id' | 'kbobMatchId'> {
  _id: string
  kbobMatchId: Omit<IKBOBMaterial, '_id'> & { _id: string }
}

async function matchMaterialsWithKbob(
  request: AuthenticatedRequest,
  context: { params: Promise<{ [key: string]: string }> }
) {
  const userId = getUserId(request);
  const params = await context.params;

  const body: MatchMaterialRequest = await request.json();
  const { kbobMatchId } = body;

  // Get the material first to check project ownership
  const material = await Material.findById(params.id)
    .select("projectId")
    .lean<Pick<IMaterialDB, "projectId">>();

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  // Verify user has access to this project
  const project = await Project.findOne({
    _id: material.projectId,
    userId,
  }).lean();

  if (!project) {
    return NextResponse.json(
      { error: "Not authorized to modify this material" },
      { status: 403 }
    );
  }

  // Update the material with KBOB match
  const updatedMaterial = await Material.findByIdAndUpdate(
    params.id,
    {
      $set: {
        kbobMatchId,
      },
    },
    { new: true }
  )
  .populate<{ kbobMatchId: Pick<IKBOBMaterial, "_id" | "name" | "category" | "gwp" | "ubp" | "penre"> }>("kbobMatchId", "_id name category gwp ubp penre")
  .lean()

  if (!updatedMaterial) {
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }

  return NextResponse.json<MatchMaterialResponse>({
    ...updatedMaterial,
    _id: updatedMaterial._id.toString(),
    kbobMatchId: {
      ...updatedMaterial.kbobMatchId,
      _id: updatedMaterial.kbobMatchId._id.toString(),
    }
  });
}

export const POST = withAuthAndDBParams(matchMaterialsWithKbob);
