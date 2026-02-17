// src/services/numeros-oficiales.service.ts

export interface NumeroOficial {
  idnumerosoficialesobra: number;
  numerooficial: string;
  fechacreacionno: string;
  idusuariono?: number;
  calle?: string;
}

export interface ObraConNumerosOficiales {
  idObra: number;
  consecutivo: string;
  fechaCaptura: string | Date;
  nombrePropietario: string;
  domicilioPropietario: string;
  nombreColoniaObra: string;
  manzanaObra: string;
  loteObra: string;
  estadoObra: string;
  estadoPago: string;
  tipoPropietario?: string;
  prediosContiguos?: string;
  condominio?: string;
  etapa?: string;
  entreCalle1?: string;
  entreCalle2?: string;
  destinoActual?: string;
  destinoPropuesto?: string;
  numerosOficiales: NumeroOficial[];
  numeroOficial?: string;
  calle?: string;
}

const API_URL = "http://localhost:3001/op-numeros-oficiales";

export const NumerosOficialesService = {
  async getReporte(filtros?: { consecutivo?: string; numeroOficial?: string; calle?: string }): Promise<ObraConNumerosOficiales[]> {
    const params = new URLSearchParams();
    if (filtros?.consecutivo) params.append("consecutivo", filtros.consecutivo);
    if (filtros?.numeroOficial) params.append("numeroOficial", filtros.numeroOficial);
    if (filtros?.calle) params.append("calle", filtros.calle);
    
    const url = `${API_URL}/reporte${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener reporte de números oficiales");
    return res.json();
  },

  async getAll(): Promise<ObraConNumerosOficiales[]> {
    const res = await fetch(`${API_URL}/todos`);
    if (!res.ok) throw new Error("Error al obtener números oficiales");
    return res.json();
  },
};
