'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'

type IMaterialColumns = Omit<IMaterialClient, 'densityMin' | 'densityMax'> & {
  density: number
} & IMaterialVirtuals

export const materialsColumns: ColumnDef<IMaterialColumns>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="flex items-center">Name</div>,
  },
  {
    accessorKey: 'ec3MatchId',
    header: 'EC3 Material',
    cell: ({ row }) => {
      const ec3MatchId = row.original.ec3MatchId

      return ec3MatchId ? (
        <div className="truncate max-w-[200px] lg:max-w-[300px]">{ec3MatchId}</div>
      ) : (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          No Match
        </Badge>
      )
    },
  },
  {
    accessorKey: 'totalVolume',
    header: 'Volume (m³)',
    cell: ({ row }) => {
      const totalVolume = row.original.totalVolume
      return totalVolume.toLocaleString('de-CH', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })
    },
  },
  {
    accessorKey: 'density',
    header: 'Density (kg/m³)',
    cell: ({ row }) => {
      const density = row.original.density

      if (!density)
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            Not Set
          </Badge>
        )
      return `${density.toFixed(3)} kg/m³`
    },
  },
  {
    accessorKey: 'gwp',
    header: 'GWP (kg CO₂ eq)',
    cell: ({ row }) => {
      const gwp = row.original.gwp || 0
      return gwp.toLocaleString('de-CH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    },
  },
  {
    accessorKey: 'ubp',
    header: 'UBP',
    cell: ({ row }) => {
      const ubp = row.original.ubp || 0
      return ubp.toLocaleString('de-CH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    },
  },
  {
    accessorKey: 'penre',
    header: 'PENRE (kWh oil-eq)',
    cell: ({ row }) => {
      const penre = row.original.penre || 0
      return penre.toLocaleString('de-CH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    },
  },
]
