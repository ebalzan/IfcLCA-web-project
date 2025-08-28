'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import cn from 'classnames'
import { Edit, UploadCloud } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { DataTable } from '@/components/data-table'
import { elementsColumns } from '@/components/elements-columns'
import { materialsColumns } from '@/components/materials-columns'
import { ProjectSummary } from '@/components/project-summary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadModal } from '@/components/upload-modal'
import { useGetMaterialBulkByProject } from '@/hooks/materials/use-material-operations'
import { useGetProjectWithNestedData } from '@/hooks/projects/use-project-operations'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { IProjectWithNestedDataClient } from '@/interfaces/client/projects/IProjectWithNestedData'
import { IUploadClient } from '@/interfaces/client/uploads/IUploadClient'
import { GetProjectWithNestedDataSchema } from '@/schemas/client/project-schemas'

export default function ProjectPage() {
  const router = useRouter()
  const { id: projectId } = useParams<GetProjectWithNestedDataSchema>()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)
  const { data: project, isLoading } = useGetProjectWithNestedData({ id: projectId })

  function handleNavigateToEditProject() {
    router.push(`/projects/${projectId}/edit`)
  }

  if (!project || isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Projects', href: '/projects' },
    { label: project.name || 'Loading...', href: undefined },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      <ProjectHeader
        project={project}
        onUpload={() => setIsUploadModalOpen(true)}
        onEdit={handleNavigateToEditProject}
      />
      <ProjectSummary project={project} />
      <ProjectTabs project={project} onUpload={() => setIsUploadModalOpen(true)} />
      <UploadModal
        projectId={projectId}
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />
    </div>
  )
}

const ProjectHeader = ({
  project,
  onUpload,
  onEdit,
}: {
  project: IProjectWithNestedDataClient
  onUpload: () => void
  onEdit: () => void
}) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">{project.name}</h1>
        {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
      </div>
    </div>
    <div className="flex flex-col sm:flex-row gap-4">
      <Button onClick={onUpload} className="bg-primary text-primary-foreground">
        <UploadCloud className="mr-2 h-4 w-4" />
        Add New Ifc
      </Button>
      <Button variant="outline" onClick={onEdit}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Project
      </Button>
    </div>
  </div>
)

const ProjectTabs = ({
  project,
  onUpload,
}: {
  project: IProjectWithNestedDataClient
  onUpload: () => void
}) => (
  <Tabs defaultValue="uploads" className="w-full">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="uploads">Uploads</TabsTrigger>
      <TabsTrigger value="elements">Elements</TabsTrigger>
      <TabsTrigger value="materials">Materials</TabsTrigger>
      <TabsTrigger value="graph">Charts</TabsTrigger>
    </TabsList>

    <TabsContent value="uploads" className="space-y-4">
      <UploadsTab project={project} onUpload={onUpload} />
    </TabsContent>

    <TabsContent value="elements" className="space-y-4">
      <ElementsTab project={project} />
    </TabsContent>

    <TabsContent value="materials" className="space-y-4">
      <MaterialsTab project={project} />
    </TabsContent>

    <TabsContent value="graph" className="space-y-4">
      <GraphTab project={project} />
    </TabsContent>
  </Tabs>
)

const UploadsTab = ({
  project,
  onUpload,
}: {
  project: IProjectWithNestedDataClient
  onUpload: () => void
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Sort uploads by createdAt in descending order (newest first)
  const sortedUploads = [...(project?.uploads || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Calculate pagination
  const totalPages = Math.ceil((sortedUploads?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUploads = sortedUploads.slice(startIndex, endIndex)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Uploads{' '}
          <Badge variant="secondary" className="ml-2">
            {project?.uploads?.length || 0}
          </Badge>
        </h2>
      </div>
      {!project?.uploads || project.uploads.length === 0 ? (
        <EmptyState
          icon={UploadCloud}
          title="No uploads yet"
          description="Get elements and materials from an Ifc file."
          action={
            <Button onClick={onUpload}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Add New Ifc
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {currentUploads.map(upload => (
              <UploadCard key={upload._id} upload={upload} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </>
  )
}

const UploadCard = ({ upload }: { upload: IUploadClient }) => (
  <Card>
    <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3">
      <div className="space-y-1">
        <p className="font-medium text-base">{upload.filename}</p>
        <p className="text-sm text-muted-foreground">
          Uploaded on {new Date(upload.createdAt).toLocaleString()}
        </p>
        {upload._count.elements > 0 && (
          <p className="text-sm text-muted-foreground">Elements: {upload._count.elements}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Badge
          variant={upload.status?.toLowerCase() === 'completed' ? 'success' : 'warning'}
          className={cn(
            'transition-colors',
            upload.status?.toLowerCase() === 'completed'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          )}>
          {upload.status}
        </Badge>
      </div>
    </CardContent>
  </Card>
)

const ElementsTab = ({ project }: { project: IProjectWithNestedDataClient }) => {
  const elementCount = project._count.elements
  const elements = useMemo(() => project.elements, [project])

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Elements{' '}
          <Badge variant="secondary" className="ml-2">
            {elementCount}
          </Badge>
        </h2>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={elementsColumns} data={elements} />
        </CardContent>
      </Card>
    </>
  )
}

const MaterialsTab = ({ project }: { project: IProjectWithNestedDataClient }) => {
  const { data: materials } = useGetMaterialBulkByProject({
    projectId: project._id,
  })

  const data = useMemo(() => {
    // Group materials by name and sum volumes
    console.log('MATERIALS#########', materials)
    const materialGroups =
      materials &&
      materials.map(material => ({
        ...material,
        ec3MatchId: material.ec3MatchId !== null ? material.ec3MatchId : null,
        density: material.density || 0,
        gwp: material.gwp || 0,
        ubp: material.ubp || 0,
        penre: material.penre || 0,
        totalVolume: material.totalVolume || 0,
      }))
    // const materialGroups = project.elements.reduce(
    //   (acc, element) => {
    //     element.materialRefs.forEach((materialLayer: IMaterialClient) => {
    //       const key = materialLayer._id
    //       if (!acc[key]) {
    //         acc[key] = {
    //           ...materialLayer,
    //           // totalVolume: 0,
    //           gwp: 0,
    //           ubp: 0,
    //           penre: 0,
    //         }
    //       }
    //       acc[key].totalVolume += materialLayer.totalVolume || 0
    //       acc[key].gwp +=
    //         materialLayer.totalVolume *
    //         (materialLayer.density || 0) *
    //         (materialLayer.indicators.gwp || 0)
    //       acc[key].ubp +=
    //         materialLayer.totalVolume *
    //         (materialLayer.density || 0) *
    //         (materialLayer.indicators.ubp || 0)
    //       acc[key].penre +=
    //         materialLayer.volume *
    //         (materialLayer.material.density || 0) *
    //         (materialLayer.material.kbobMatch?.penre || 0)
    //     })
    //     return acc
    //   },
    //   {} as Record<string, IMaterialClient>
    // )

    return materialGroups
  }, [materials])

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Materials{' '}
          <Badge variant="secondary" className="ml-2">
            {data?.length || 0}
          </Badge>
        </h2>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={materialsColumns} data={data || []} />
        </CardContent>
      </Card>
    </>
  )
}

const GraphTab = ({ project }: { project: IProjectWithNestedDataClient }) => {
  const materialsData = project.elements.flatMap(element =>
    // Create one entry per element-material combination
    element.materialRefs.map((material: IMaterialClient) => ({
      name: element.name, // Element name from elements table
      elementName: element.name, // Explicit element name for grouping
      ifcMaterial: material.name || 'Unknown',
      openEPDMaterial: material.ec3MatchId,
      category: element.type, // Ifc entity type
      // volume: material.volume, // Use individual material volume
      indicators: {
        gwp: 0,
        // material.volume *
        // (material.material?.density || 0) *
        // (material.material?.openEPDMatch?.gwp || 0),
        ubp: 0,
        // material.volume *
        // (material.material?.density || 0) *
        // (material.material?.openEPDMatch?.ubp || 0),
        penre: 0,
        // material.volume *
        // (material.material?.density || 0) *
        // (material.material?.openEPDMatch?.penre || 0),
      },
    }))
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <Card>
          <CardContent className="pt-6">
            {/* <GraphPageComponent materialsData={materialsData} /> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action: React.ReactNode
}) => (
  <Card className="bg-muted/50">
    <CardContent className="flex flex-col items-center justify-center">
      <Icon className="h-10 w-10 text-muted-foreground mb-1" />
      <p className="text-muted-foreground text-center">{title}</p>
      <p className="text-sm text-muted-foreground text-center mt-1">{description}</p>
      <div className="mt-2">{action}</div>
    </CardContent>
  </Card>
)
