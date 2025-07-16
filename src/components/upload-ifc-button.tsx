'use client'

import * as React from 'react'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadModal } from '@/components/upload-modal'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useProjectsWithStats } from "@/hooks/projects/use-projects-with-stats";
// import IProjectWithStatsClient from "@/interfaces/client/projects/IProjectWithStatsClient";

interface UploadIfcButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  showIcon?: boolean
  showText?: boolean
}

export function UploadIfcButton({
  variant = 'default',
  className = '',
  showIcon = true,
  showText = true,
}: UploadIfcButtonProps) {
  // const [showProjectSelect, setShowProjectSelect] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const router = useRouter()
  const { id: projectId } = useParams<{ id: string }>()

  // const { projectsWithStats, isLoading } = useProjectsWithStats();

  function handleUploadSuccess() {
    setIsUploadModalOpen(false)
    router.push(`/projects/${projectId}`)
  }

  return (
    <>
      <Button
        variant={variant}
        // onClick={() => setShowProjectSelect(true)}
        className={className}>
        {showIcon && <UploadCloud className={showText ? 'mr-2 h-4 w-4' : 'h-5 w-5'} />}
        {showText && 'Add new Ifc'}
      </Button>

      {/* <Dialog open={showProjectSelect} onOpenChange={setShowProjectSelect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Project</DialogTitle>
            <DialogDescription>
              Choose a project to upload the Ifc file to
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {projectsWithStats.map((project: IProjectWithStatsClient) => (
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

      <UploadModal
        projectId={projectId}
        open={isUploadModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setIsUploadModalOpen(false)
          }
        }}
        onSuccess={handleUploadSuccess}
      />
    </>
  )
}
