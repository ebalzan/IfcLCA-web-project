'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderIcon, Pencil, ArrowLeft, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useDeleteProject } from '@/hooks/projects/use-delete-project'
import { useProjectById } from '@/hooks/projects/use-project-by-id'
import { useUpdateProject } from '@/hooks/projects/use-update-project'
import { Queries } from '@/queries'
import { UpdateProjectSchema, updateProjectSchema } from '@/schemas/projects/updateProjectSchema'

export default function EditProjectPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = params.id
  const { mutateAsync: deleteProject } = useDeleteProject()
  const { data: project, isLoading: isLoadingProject } = useProjectById(projectId)
  const { mutate: updateProject, isPending: isSaving } = useUpdateProject()
  const queryClient = useQueryClient()

  const form = useForm<UpdateProjectSchema>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  })
  const { register, getValues, handleSubmit, reset } = form

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        description: project.description || '',
      })
    }
  }, [project, reset])

  async function handleDeleteProject() {
    await deleteProject(projectId)
    router.replace('/projects')
  }

  function handleUpdateProject() {
    updateProject(
      { ...getValues() },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: [Queries.GET_PROJECTS] }),
            queryClient.invalidateQueries({
              queryKey: [Queries.GET_PROJECT_BY_ID, projectId],
            }),
          ])
          router.back()
        },
      }
    )
  }

  const breadcrumbItems = [
    { label: 'Projects', href: '/projects' },
    {
      label: project?.name || 'Loading...',
      href: `/projects/${projectId}`,
    },
    { label: 'Edit', href: undefined },
  ]

  if (!project || isLoadingProject) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-1/3" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-1/2" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Pencil className="h-6 w-6 text-muted-foreground" />
                Edit Project
              </CardTitle>
              <CardDescription>Update your project details below</CardDescription>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isSaving}
              className="h-10 w-10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleUpdateProject)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Project Name
              </Label>
              <Input
                {...register('name')}
                id="name"
                required
                disabled={isSaving}
                className="w-full"
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                disabled={isSaving}
                rows={4}
                className="w-full resize-none"
                placeholder="Enter project description (optional)"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}`)}
                disabled={isSaving}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteProject}
      />
    </div>
  )
}
