'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteProject } from '@/hooks/projects/use-delete-project'
import { useProjectsWithStats } from '@/hooks/projects/use-projects-with-stats'
import { DeleteProjectDialog } from './delete-project-dialog'
import ProjectCard from './project-card'

export function ProjectOverview() {
  const { projectsWithStats, isLoading, isError, error, hasNextPage, fetchNextPage } =
    useProjectsWithStats()
  const router = useRouter()
  const hasProjects = projectsWithStats.length > 0
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const { mutateAsync: deleteProject } = useDeleteProject()

  async function handleDeleteProject(projectId: string) {
    await deleteProject(projectId)
    router.push('/projects')
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="group relative transition-all hover:shadow-lg">
            <CardContent className="p-6 pt-12">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg" role="alert">
        <p className="text-red-600 font-semibold mb-4">{error?.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="bg-white">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!hasProjects) {
    return (
      <div className="col-span-full text-center py-12 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold mb-2 text-primary">No projects yet</h2>
        <p className="text-muted-foreground mb-4">Create your first project to get started.</p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsWithStats.map(project => {
          return (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => router.push(`/projects/${project._id}/edit`)}
              onDelete={() => setDeleteProjectId(project._id)}
            />
          )
        })}
      </div>

      {hasNextPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={projectsWithStats.length.toString()}
              onValueChange={value => {
                // setPageSize(Number(value));
                // setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 12, 24].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {projectsWithStats.length} of {projectsWithStats.length}
            </span>
          </div>
          <nav className="flex justify-center" aria-label="Pagination">
            <ul className="inline-flex gap-2">
              {Array.from({
                length: Math.ceil(projectsWithStats.length / 3),
              }).map((_, index) => (
                <li key={index}>
                  <Button
                    variant={index + 1 === 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => fetchNextPage()}
                    aria-current={index + 1 === 1 ? 'page' : undefined}
                    className={index + 1 === 1 ? 'bg-primary text-primary-foreground' : ''}>
                    {index + 1}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <DeleteProjectDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onDelete={() => deleteProjectId && handleDeleteProject(deleteProjectId)}
      />
    </>
  )
}
