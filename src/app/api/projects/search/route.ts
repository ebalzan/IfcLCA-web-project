import { NextResponse } from "next/server"
import { Project } from "@/models"
import { AuthenticatedRequest, getUserId } from "@/lib/auth-middleware"
import { withAuthAndDB } from "@/lib/api-middleware"
import IProjectDB from "@/interfaces/projects/IProjectDB"

export type SearchResult = Pick<IProjectDB, "name" | "description" | "_id">

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
    .select<SearchResult>("name description _id")
    .sort({ name: 1 })
    .limit(all ? 10 : 5)
    .lean()

  return NextResponse.json<SearchResult[]>(projects)
}

export const GET = withAuthAndDB(getProjectsBySearch)
