// src/services/repLicencias.service.ts

const API_URL = "http://localhost:3001/reportes/licencias";

export interface RepLicenciasParams {
  page?: number;
  limit?: number;
  fechaInicio?: string;
  fechaFin?: string;
  consecutivo?: string;
  nombreConcepto?: string;
  tipoLicencia?: string;
  clasificacion?: string;
}

export const getReporteLicencias = async (params: RepLicenciasParams) => {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.fechaInicio) query.append("fechaInicio", params.fechaInicio);
  if (params.fechaFin) query.append("fechaFin", params.fechaFin);
  if (params.consecutivo) query.append("consecutivo", params.consecutivo);
  if (params.nombreConcepto) query.append("nombreConcepto", params.nombreConcepto);
  if (params.tipoLicencia) query.append("tipoLicencia", params.tipoLicencia);
  if (params.clasificacion) query.append("clasificacion", params.clasificacion);

  const res = await fetch(`${API_URL}?${query.toString()}`);

  if (!res.ok) {
    throw new Error("Error al obtener reporte de licencias");
  }

  return res.json();
};
