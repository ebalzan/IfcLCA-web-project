"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import IMaterialClient from "@/interfaces/client/materials/IMaterialClient";

export const materialsColumns: ColumnDef<IMaterialClient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center">Ifc Material</div>
    ),
  },
  {
    accessorKey: "kbobMatch.name",
    header: "KBOB Material",
    cell: ({ row }) => {
      const kbobName = row.original.kbobMatch?.name;
      return kbobName ? (
        <div className="truncate max-w-[200px] lg:max-w-[300px]">
          {kbobName}
        </div>
      ) : (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20"
        >
          No Match
        </Badge>
      );
    },
  },
  {
    accessorKey: "volume",
    header: "Volume (m³)",
    cell: ({ row }) => {
      const volume = row.original.totalVolume;
      return volume
      // toLocaleString("de-CH", {
      //   minimumFractionDigits: 3,
      //   maximumFractionDigits: 3,
      // });
    },
  },
  {
    accessorKey: "density",
    header: "Density (kg/m³)",
    cell: ({ row }) => {
      const density = row.original.density;
      if (!density)
        return (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            Not Set
          </Badge>
        );
      return density.toLocaleString("de-CH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    },
  },
  {
    accessorKey: "gwp",
    header: "GWP (kg CO₂ eq)",
    cell: ({ row }) => {
      const gwp = row.original.gwp || 0;
      return gwp.toLocaleString("de-CH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    },
  },
  {
    accessorKey: "ubp",
    header: "UBP",
    cell: ({ row }) => {
      const ubp = row.original.ubp || 0;
      return ubp.toLocaleString("de-CH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    },
  },
  {
    accessorKey: "penre",
    header: "PENRE (kWh oil-eq)",
    cell: ({ row }) => {
      const penre = row.original.penre || 0;
      return penre.toLocaleString("de-CH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    },
  },
];
