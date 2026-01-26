export interface Concepto {
  id: number;
  nombre: string;
  nivel: number;
  parent_id?: number | null;

  observaciones?: string;
  medicion?: string;
  costo?: number;
  porcentaje?: number;
  estado?: "ACTIVO" | "INACTIVO";

  children?: Concepto[];
}