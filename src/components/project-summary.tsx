'use client'

import { BoxIcon, FileTextIcon, GaugeIcon, LayersIcon } from 'lucide-react'
import { EmissionsSummaryCard } from '@/components/emissions-summary-card'
import { ProjectImageUpload } from '@/components/project-image-upload'
import { Card, CardContent } from '@/components/ui/card'
import IProjectWithStatsClient from '@/interfaces/client/projects/IProjectWithStatsClient'

interface ProjectSummaryProps {
  project: IProjectWithStatsClient
}

export function ProjectSummary({ project }: ProjectSummaryProps) {
  // const totalEmissions = project.elements.reduce(
  //   (acc: ILCAIndicators, element: IElementClient) => {
  //     const elementTotals = element.materials.reduce(
  //       (materialAcc: ILCAIndicators, material: IMaterialLayerClient) => {
  //         const volume = material.volume || 0;
  //         const density = material.material?.density || 0;
  //         const kbobIndicators: ILCAIndicators = {
  //           gwp: material.material.kbobMatch?.gwp || 0,
  //           ubp: material.material.kbobMatch?.ubp || 0,
  //           penre: material.material.kbobMatch?.penre || 0,
  //         };

  //         return {
  //           gwp:
  //             (materialAcc.gwp || 0) +
  //             volume * density * (kbobIndicators.gwp || 0),
  //           ubp:
  //             (materialAcc.ubp || 0) +
  //             volume * density * (kbobIndicators.ubp || 0),
  //           penre:
  //             (materialAcc.penre || 0) +
  //             volume * density * (kbobIndicators.penre || 0),
  //         };
  //       },
  //       { gwp: 0, ubp: 0, penre: 0 }
  //     );
  //     return {
  //       gwp: (acc.gwp || 0) + elementTotals.gwp,
  //       ubp: (acc.ubp || 0) + elementTotals.ubp,
  //       penre: (acc.penre || 0) + elementTotals.penre,
  //     };
  //   },
  //   { gwp: 0, ubp: 0, penre: 0 } as ILCAIndicators
  // );

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-12 lg:col-span-5 h-full">
        <ProjectImageUpload projectId={project._id} imageUrl={project.imageUrl} />
      </div>

      <div className="col-span-12 lg:col-span-3 h-full">
        <div className="grid grid-cols-1 gap-4 h-full">
          <Card className="flex-1 group transition-colors duration-200 hover:border-primary/50">
            <CardContent className="px-4 pt-2 pb-3 flex flex-col">
              <div className="flex flex-row items-start justify-between mb-1">
                <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                  Elements
                </h3>
                <BoxIcon className="h-6 w-6 text-foreground mt-1.5 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold leading-none mb-0.5 group-hover:text-primary transition-colors">
                  {project._count?.elements}
                </p>
                <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
                  Construction components
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 group transition-colors duration-200 hover:border-primary/50">
            <CardContent className="px-4 pt-2 pb-3 flex flex-col">
              <div className="flex flex-row items-start justify-between mb-1">
                <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                  Uploads
                </h3>
                <FileTextIcon className="h-6 w-6 text-foreground mt-1.5 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold leading-none mb-0.5 group-hover:text-primary transition-colors">
                  {project._count?.uploads}
                </p>
                <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
                  Files analysed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 group transition-colors duration-200 hover:border-primary/50">
            <CardContent className="px-4 pt-2 pb-3 flex flex-col">
              <div className="flex flex-row items-start justify-between mb-1">
                <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                  Materials
                </h3>
                <LayersIcon className="h-6 w-6 text-foreground mt-1.5 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold leading-none mb-0.5 group-hover:text-primary transition-colors">
                  {project._count?.materials}
                </p>
                <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
                  Unique materials
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="col-span-12 lg:col-span-4 h-full group transition-colors duration-200 hover:border-primary/50">
        <CardContent className="px-4 pt-2 pb-3 h-full">
          <div className="flex flex-row items-start justify-between mb-1">
            <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
              Total Emissions
            </h3>
            <GaugeIcon className="h-6 w-6 text-foreground mt-1.5 group-hover:text-primary transition-colors" />
          </div>
          <EmissionsSummaryCard project={project} />
        </CardContent>
      </Card>
    </div>
  )
}
