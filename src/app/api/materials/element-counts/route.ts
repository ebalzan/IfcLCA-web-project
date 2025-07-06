import { NextResponse } from "next/server";
import { Element, Project } from "@/models";
import mongoose from "mongoose";
import IMaterialLayer from "@/interfaces/elements/IMaterialLayer";
import { AuthenticatedRequest, getUserId } from "@/lib/auth-middleware";
import { withAuthAndDBParams } from "@/lib/api-middleware";

async function getElementCountsForMaterials(request: AuthenticatedRequest) {
    const userId = getUserId(request);

    const { materialIds } = await request.json();

    // Get user's projects
    const userProjects = await Project.find({ userId })
      .select("_id")
      .lean();
    const projectIds = userProjects.map(p => p._id);

    // Convert material IDs to ObjectIds
    const objectIds = materialIds.map(
      (id: string) => new mongoose.Types.ObjectId(id)
    );

    // Get elements from user's projects that have any of these materials
    const elements = await Element.find({
      projectId: { $in: projectIds },
      "materials.material": { $in: objectIds }
    })
    .populate<{ materials: Pick<IMaterialLayer, "material">[] }>("materials.material")
    .lean({ virtuals: true, getters: true })

    // Count elements per material
    const countMap: Record<string, number> = {};
    elements.forEach(element => {
      element.materials.forEach((materialLayer) => {
        const materialId = materialLayer.material._id.toString();
        if (materialIds.includes(materialId)) {
          countMap[materialId] = (countMap[materialId] || 0) + 1;
        }
      });
    });

    // Ensure all requested materials have a count (even if 0)
    const result = materialIds.reduce((acc, id) => {
      acc[id] = countMap[id] || 0;
      return acc;
    }, {} as Record<string, number>);

  return NextResponse.json(result);
}

export const POST = withAuthAndDBParams(getElementCountsForMaterials)
