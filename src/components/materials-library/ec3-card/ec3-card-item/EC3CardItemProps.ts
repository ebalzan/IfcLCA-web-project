import { IEC3Material } from '@/interfaces/materials/IEC3Material'

export interface EC3CardItemProps {
  material: Pick<
    IEC3Material,
    'id' | 'name' | 'category' | 'gwp' | 'ubp' | 'penre' | 'declaredUnit' | 'manufacturer'
  >
  isSelectable: boolean
  onSelect: (materialId: string) => void
}
