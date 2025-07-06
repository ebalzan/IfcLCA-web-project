export interface MaterialChange {
  materialId: string;
  materialName: string;
  oldMatch: {
    Name: string;
    Density: number;
    Elements: number;
  } | null;
  newMatch: {
    id: string;
    Name: string;
    Density: number;
    Elements: number;
    hasDensityRange: boolean;
    minDensity?: number;
    maxDensity?: number;
  };
  projects: string[];
  projectId?: string;
  elements: number;
  selectedDensity?: number;
}
