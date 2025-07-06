import { Project } from "@/models";
import { withAuthAndDB } from "@/lib/api-middleware";
import { getUserId, AuthenticatedRequest } from "@/lib/auth-middleware";
import { NextResponse } from "next/server";
import ILCAIndicators from "@/interfaces/materials/ILCAIndicators";

export const runtime = "nodejs";

interface IProjectEmissionsResult extends ILCAIndicators {
  _id: null;
}

async function getEmissions(request: AuthenticatedRequest) {
  const userId = getUserId(request);

  // Aggregate emissions across all active projects for the user
  const projects = await Project.aggregate<IProjectEmissionsResult>([
    {
      $match: {
        userId,
        isArchived: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "elements",
        localField: "_id",
        foreignField: "projectId",
        as: "elements",
      },
    },
    {
      $unwind: {
        path: "$elements",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$elements.materials",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "materials",
        localField: "elements.materials.material",
        foreignField: "_id",
        as: "material",
      },
    },
    {
      $unwind: {
        path: "$material",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "indicatorsKBOB",
        localField: "material.kbobMatchId",
        foreignField: "_id",
        as: "kbobMatch",
      },
    },
    {
      $unwind: {
        path: "$kbobMatch",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: null,
        gwp: {
          $sum: {
            $multiply: [
              { $ifNull: ["$kbobMatch.GWP", 0] },
              { $ifNull: ["$elements.materials.volume", 0] },
              { $ifNull: ["$material.density", 1] },
            ],
          },
        },
        ubp: {
          $sum: {
            $multiply: [
              { $ifNull: ["$kbobMatch.UBP", 0] },
              { $ifNull: ["$elements.materials.volume", 0] },
              { $ifNull: ["$material.density", 1] },
            ],
          },
        },
        penre: {
          $sum: {
            $multiply: [
              { $ifNull: ["$kbobMatch.PENRE", 0] },
              { $ifNull: ["$elements.materials.volume", 0] },
              { $ifNull: ["$material.density", 1] },
            ],
          },
        },
      },
    },
  ]).exec();

  // If no projects or materials found, return zeros
  const totalEmissions = projects[0] || {
    gwp: 0,
    ubp: 0,
    penre: 0,
  };

  return NextResponse.json(totalEmissions);
}

export const GET = withAuthAndDB(getEmissions);
