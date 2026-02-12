// src/services/repObras.service.ts

const API_URL = "http://localhost:3001/reportes/obras";

export interface RepObrasParams {
  page?: number;
  limit?: number;
  fechaInicio?: string;
  fechaFin?: string;
  estadoObra?: string;
  estadoPago?: string;      // <-- agregar
  nombrePropietario?: string;
  representanteLegal?: string;
  consecutivo?: string;
}

export const getReporteObras = async (params: RepObrasParams) => {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.fechaInicio) query.append("fechaInicio", params.fechaInicio);
  if (params.fechaFin) query.append("fechaFin", params.fechaFin);
  if (params.consecutivo) query.append("consecutivo", params.consecutivo);
  if (params.estadoObra) query.append("estadoObra", params.estadoObra);
  if (params.estadoPago) query.append("estadoPago", params.estadoPago); // <-- agregar
  if (params.nombrePropietario)
    query.append("nombrePropietario", params.nombrePropietario);
  if (params.representanteLegal)
    query.append("representanteLegal", params.representanteLegal);

  const res = await fetch(`${API_URL}?${query.toString()}`);

  if (!res.ok) {
    throw new Error("Error al obtener reporte de obras");
  }

  return res.json();
};

/** Obtener detalle completo de una obra (todos los campos) */
export const getDetalleObra = async (idObra: number) => {
  const res = await fetch(`${API_URL}/detalle/${idObra}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Error al obtener detalle de la obra");
  }
  return res.json();
};
