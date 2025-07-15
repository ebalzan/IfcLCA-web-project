"use client";

import { ActivityFeed } from "@/components/activity-feed";
import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { UploadIfcButton } from "@/components/upload-ifc-button";
// import { UploadModal } from "@/components/upload-modal";
import { Box, Building, Layers, PlusCircle } from "lucide-react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
import ILCAIndicators from "@/interfaces/materials/ILCAIndicators";
// import { useProjectsWithStats } from "@/hooks/projects/use-projects-with-stats";
import { ProjectOverview } from "./project-overview";

interface DashboardStatistics {
  totalProjects: number;
  totalElements: number;
  totalMaterials: number;
  totalEmissions?: ILCAIndicators;
}

// Define the icon components explicitly
const Icons = {
  Building: Building,
  Box: Box,
  Layers: Layers,
} as const;

// Type for the metrics
interface Metric {
  title: string;
  value: number;
  description: string;
  icon: keyof typeof Icons;
}

export default function Dashboard() {
  // const [showProjectSelect, setShowProjectSelect] = useState(false);
  // const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
  //   null
  // );
  // const router = useRouter();
  // const [statistics, setStatistics] = useState<DashboardStatistics>({
  //   totalProjects: 0,
  //   totalElements: 0,
  //   totalMaterials: 0,
  // });

  // const metrics: Metric[] = useMemo(
  //   () => [
  //     {
  //       title: "Total Projects",
  //       value: statistics.totalProjects,
  //       description: "Active projects in your workspace",
  //       icon: "Building" as const,
  //     },
  //     {
  //       title: "Total Elements",
  //       value: statistics.totalElements,
  //       description: "Building elements across all projects",
  //       icon: "Box" as const,
  //     },
  //     {
  //       title: "Total Materials",
  //       value: statistics.totalMaterials,
  //       description: "Unique materials in use",
  //       icon: "Layers" as const,
  //     },
  //   ],
  //   [
  //     statistics.totalProjects,
  //     statistics.totalElements,
  //     statistics.totalMaterials,
  //   ]
  // )

  // const { projectsWithStats, isLoading: isLoadingProjects } =
  //   useProjectsWithStats();

  // const fetchStatistics = useCallback(
  //   async (force = false) => {
  //     const now = Date.now();
  //     if (!force && now - lastFetchRef.current < CACHE_TIMEOUT) {
  //       return; // Use cached data
  //     }

  //     try {
  //       setIsLoadingStatistics(true);

  //       // Cancel previous request if it exists
  //       if (abortControllerRef.current) {
  //         abortControllerRef.current.abort();
  //       }
  //       abortControllerRef.current = new AbortController();

  //       const [projectsRes, emissionsRes] = await Promise.all([
  //         fetch("/api/projects?withStats=true", {
  //           signal: abortControllerRef.current.signal,
  //           cache: "no-store",
  //         }),
  //         fetch("/api/emissions", {
  //           signal: abortControllerRef.current.signal,
  //           cache: "no-store",
  //         }),
  //       ]);

  //       if (!projectsRes.ok || !emissionsRes.ok) {
  //         console.error("API Response not OK:", {
  //           projects: projectsRes.status,
  //           emissions: emissionsRes.status,
  //         });
  //         throw new Error("Failed to fetch data");
  //       }

  //       const [projects, emissions] = await Promise.all([
  //         projectsRes.json(),
  //         emissionsRes.json(),
  //       ]);

  //       // Add null checks
  //       if (!Array.isArray(projects)) {
  //         console.error("Projects is not an array:", projects);
  //         throw new Error("Invalid projects data received");
  //       }

  //       const recentProjects = projects.slice(0, 3);
  //       const totalElements = projects.reduce(
  //         (acc: number, project: any) => acc + (project._count?.elements || 0),
  //         0
  //       );
  //       const totalMaterials = projects.reduce(
  //         (acc: number, project: any) => acc + (project._count?.materials || 0),
  //         0
  //       );

  //       const newStatistics = {
  //         ...statistics,
  //         totalProjects: projects.length,
  //         totalElements,
  //         totalMaterials,
  //         totalEmissions: emissions || 0,
  //       };

  //       setStatistics(newStatistics);
  //       setRecentProjects(recentProjects);
  //       lastFetchRef.current = now;
  //     } catch (error: unknown) {
  //       if (error instanceof Error && error.name !== "AbortError") {
  //         console.error("Failed to fetch statistics:", error);
  //       }
  //     } finally {
  //       setIsLoadingStatistics(false);
  //     }
  //   },
  //   [statistics]
  // );

  // useEffect(() => {
  //   if (showProjectSelect) {
  //     fetchProjects();
  //   }
  // }, [showProjectSelect, fetchProjects]);

  // useEffect(() => {
  //   fetchStatistics();
  //   const intervalId = setInterval(() => {
  //     fetchStatistics(true);
  //   }, CACHE_TIMEOUT);

  //   return () => {
  //     clearInterval(intervalId);
  //     if (abortControllerRef.current) {
  //       abortControllerRef.current.abort();
  //     }
  //   };
  // }, [fetchStatistics]);

  // const handleUploadClick = async () => {
  //   try {
  //     const response = await fetch("/api/projects", {
  //       cache: "no-store",
  //     });
  //     const projects = await response.json();

  //     if (!projects?.length) {
  //       return;
  //     }
  //     setShowProjectSelect(true);
  //   } catch (error) {
  //     console.error("Failed to check projects:", error);
  //   }
  // };

  return (
    <div className="main-container space-y-8">
      <section>
        <div className="page-header">
          <div>
            <h1 className="page-title">Home</h1>
            <p className="page-description">
              Overview of your projects and recent activity
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Project
              </Link>
            </Button>
            {/* <UploadIfcButton variant="outline" /> */}
          </div>
        </div>
      </section>

      {/* <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = Icons[metric.icon];
          return (
            <Card
              key={metric.title}
              className="group transition-all hover:bg-muted/5"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
        <DashboardEmissionsCard emissions={statistics.totalEmissions} />
      </section> */}

      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithStats?.map((project) => (
            <Card
              key={project._id}
              className="group relative transition-all hover:shadow-lg border-2 border-muted overflow-hidden cursor-pointer"
              onClick={() => router.push(`/projects/${project._id}`)}
            >
              <div className="aspect-video relative bg-muted">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Box className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <CardContent className="space-y-2 p-4">
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Box className="h-3 w-3" />
                    {project._count.elements} elements
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <UploadCloud className="h-3 w-3" />
                    {project._count.uploads} uploads
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last update:{" "}
                  {new Date(project.updatedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}
        <ProjectOverview />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Activity Feed</h2>
        </div>
        <ActivityFeed />
      </section>

      {/* <Dialog open={showProjectSelect} onOpenChange={setShowProjectSelect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Project</DialogTitle>
            <DialogDescription>
              Choose a project to upload the Ifc file to
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {projectsWithStats?.map((project) => (
              <Button
                key={project._id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedProjectId(project._id);
                  setShowProjectSelect(false);
                }}
              >
                {project.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog> */}

      {/* {selectedProjectId && (
        <UploadModal
          projectId={selectedProjectId}
          open={true}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setSelectedProjectId(null);
            }
          }}
          onSuccess={() => {
            setSelectedProjectId(null);
            router.push(`/projects/${selectedProjectId}`);
          }}
        />
      )} */}
    </div>
  );
}
