'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Trash2, Upload, Box } from 'lucide-react'
import IProjectWithStatsClient from '@/interfaces/client/projects/IProjectWithStatsClient'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface ProjectCardProps {
  project: IProjectWithStatsClient
  onEdit: () => void
  onDelete: () => void
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const router = useRouter()

  return (
    <Card
      key={project._id}
      className="group relative transition-all hover:shadow-lg border-2 border-muted overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-background/80"
              onClick={e => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation()
                onEdit()
              }}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={e => {
                e.stopPropagation()
                onDelete()
              }}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        onClick={() => router.push(`/projects/${project._id}`)}
        className="aspect-video relative bg-muted cursor-pointer">
        {project.imageUrl ? (
          <>
            <Image
              src={project.imageUrl}
              alt={project.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Box className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <CardContent className="space-y-2 p-4">
        <h3 className="text-lg font-semibold leading-none tracking-tight">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Box className="h-3 w-3" />
            {project._count.elements} elements
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Upload className="h-3 w-3" />
            {project._count.uploads} uploads
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
