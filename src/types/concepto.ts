export interface Concepto {
  id: number;
  nombre: string;
  nivel: number;
  parent_id?: number | null;

  observaciones?: string;
  medicion?: string;
  costo?: number;
  porcentaje?: number;
  estado?: boolean;

  cuenta_tesoreria?: string;

  children?: Concepto[];
}
