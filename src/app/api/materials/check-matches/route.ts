import { NextResponse } from "next/server";
import { MaterialService } from "@/lib/services/material-service";
import { Project } from "@/models";
import { withAuthAndDB } from "@/lib/api-middleware";
import { AuthenticatedRequest, getUserId } from "@/lib/auth-middleware";

interface CheckMatchesRequest {
  materialNames: string[];
  projectId: string;
}

async function processMaterialMatches(
  request: AuthenticatedRequest,
) {
  const userId = getUserId(request);

  const body: CheckMatchesRequest = await request.json();
  const { materialNames, projectId } = body;

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  // Verify that the project belongs to the current user
  const project = await Project.findOne({ _id: projectId, userId }).lean();
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!Array.isArray(materialNames)) {
    return NextResponse.json(
      { error: "materialNames must be an array" },
      { status: 400 }
    );
  }

  const unmatchedMaterials = [];
  const matchedMaterials = [];

  for (const materialName of materialNames) {
    const existingMatch = await MaterialService.findExistingMaterial(
      materialName,
      userId
    );
    if (!existingMatch) {
      unmatchedMaterials.push(materialName);
    } else {
      // Create a new material in the current project with the same match
      const newMaterial = await MaterialService.createMaterialWithMatch(
        projectId,
        materialName,
        existingMatch.kbobMatchId,
        existingMatch.density
      );
      matchedMaterials.push(newMaterial);
    }
  }

  return NextResponse.json({
    unmatchedMaterials,
    matchedMaterials,
    unmatchedCount: unmatchedMaterials.length,
  });
}

export const POST = withAuthAndDB(processMaterialMatches);
