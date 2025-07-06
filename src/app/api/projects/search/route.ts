import { NextResponse } from "next/server"
import { Project } from "@/models"
import { AuthenticatedRequest, getUserId } from "@/lib/auth-middleware"
import IProjectDB from "@/interfaces/projects/IProjectDB"
import { withAuthAndDB } from "@/lib/api-middleware"

async function getProjectsBySearch(request: AuthenticatedRequest) {
  const userId = getUserId(request)

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const all = searchParams.get("all") === "true"

  const queryConditions = {
    userId,
    ...(all ? {} : { name: { $regex: query, $options: "i" } }),
  }

  const projects = await Project.find(queryConditions)
    .select("name description _id")
    .sort({ name: 1 })
    .limit(all ? 10 : 5)
    .lean<Pick<IProjectDB, "name" | "description" | "_id">[]>()

  return NextResponse.json(projects)
}

export const GET = withAuthAndDB(getProjectsBySearch)
