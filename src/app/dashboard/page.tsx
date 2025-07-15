import { auth } from "@clerk/nextjs/server";
import Dashboard from "@/components/dashboard";
import { redirect } from "next/navigation";
// import { unstable_cache } from "next/cache";
// import { fetchApi } from "@/lib/fetch";
// import IProjectWithStatsClient from "@/interfaces/client/projects/IProjectWithStatsClient";
// import { IProjectEmissionsResponse } from "../api/emissions/route";

// Cache the data fetching functions
// const getInitialData = unstable_cache(
//   async () => {
//     try {
//       const [projects, emissions] = await Promise.all([
//         fetchApi<IProjectWithStatsClient[]>(`/api/projects?withStats=true`),
//         fetchApi<IProjectEmissionsResponse>(`/api/emissions`),
//       ])

//       const recentProjects = projects.slice(0, 3);
//       const totalElements = projects.reduce(
//         (acc: number, project: IProjectWithStatsClient) =>
//           acc + (project._count?.elements || 0),
//         0
//       );
//       const totalMaterials = projects.reduce(
//         (acc: number, project: IProjectWithStatsClient) =>
//           acc + (project._count?.materials || 0),
//         0
//       );

//       return {
//         initialRecentProjects: recentProjects,
//         statistics: {
//           totalProjects: projects.length,
//           totalElements,
//           totalMaterials,
//           totalEmissions: emissions[0],
//         },
//       };
//     } catch (error) {
//       console.error("Failed to fetch initial data:", error);
//       return {
//         initialRecentProjects: [],
//         statistics: {
//           totalProjects: 0,
//           totalElements: 0,
//           totalMaterials: 0,
//         },
//       };
//     }
//   },
//   ["dashboard-initial-data"],
//   {
//     revalidate: 300, // Cache for 5 minutes
//     tags: ["dashboard"],
//   }
// );

// export const dynamic = "force-dynamic";
// export const revalidate = 300; // Revalidate page every 5 minutes

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  // const initialData = await getInitialData();

  // return <Dashboard {...initialData} />;
  return <Dashboard />
}
