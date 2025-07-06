import { Project } from "@/models";
import { withAuthAndDB } from "@/lib/api-middleware";
import { getUserId, AuthenticatedRequest } from "@/lib/auth-middleware";
import { NextResponse } from "next/server";
import IProjectDB from "@/interfaces/projects/IProjectDB";
import IElementDB from "@/interfaces/elements/IElementDB";
import IMaterialDB from "@/interfaces/materials/IMaterialDB";
import IUploadDB from "@/interfaces/uploads/IUploadDB";

export const runtime = "nodejs";

interface IProjectUI extends IProjectDB {
  elements: IElementDB[]
  materials: IMaterialDB[]
  uploads: IUploadDB[]
  lastActivityAt: Date
  _count: {
    elements: number
    uploads: number
    materials: number
  }
}

async function getProjects(request: AuthenticatedRequest) {
  const userId = getUserId(request);

  // Aggregate projects with their latest activity timestamps
  const projects = await Project.aggregate<IProjectUI>([
    { $match: { userId } },
    {
      $lookup: {
        from: "uploads",
        localField: "_id",
        foreignField: "projectId",
        as: "uploads",
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
      $lookup: {
        from: "materials",
        localField: "_id",
        foreignField: "projectId",
        as: "materials",
      },
    },
    {
      $addFields: {
        lastActivityAt: {
          $max: [
            "$updatedAt",
            { $max: "$uploads.createdAt" },
            { $max: "$elements.createdAt" },
            { $max: "$materials.createdAt" },
          ],
        },
        _count: {
          elements: { $size: "$elements" },
          uploads: { $size: "$uploads" },
          materials: { $size: "$materials" },
        },
        emissions: {
          $ifNull: [
            "$emissions",
            {
              gwp: 0,
              ubp: 0,
              penre: 0,
              lastCalculated: new Date(),
            },
          ],
        },
        elements: {
          $map: {
            input: "$elements",
            as: "element",
            in: {
              _id: "$$element._id",
              name: "$$element.name",
              type: "$$element.type",
              volume: "$$element.volume",
              materials: {
                $map: {
                  input: "$$element.materials",
                  as: "material",
                  in: {
                    volume: "$$material.volume",
                    indicators: {
                      gwp: "$$material.indicators.gwp",
                      ubp: "$$material.indicators.ubp",
                      penre: "$$material.indicators.penre",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    { $sort: { lastActivityAt: -1 } },
  ])
  
  const transformedProjects: IProjectUI[] = projects.map((project) => ({
    ...project,
    updatedAt: project.lastActivityAt || project.updatedAt,
  }))

  return NextResponse.json(transformedProjects);
}

async function createProject(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  const body: Pick<IProjectDB, "name" | "description" | "imageUrl"> = await request.json();

  const project: IProjectDB = await Project.create({
    ...body,
    userId,
    emissions: {
      gwp: 0,
      ubp: 0,
      penre: 0,
      lastCalculated: new Date(),
    },
  });

  return NextResponse.json(project);
}

export const GET = withAuthAndDB(getProjects);
export const POST = withAuthAndDB(createProject);
