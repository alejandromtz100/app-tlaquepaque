export interface RepLicencia {
  id: number;
  consecutivo: string;
  fechaCaptura: string;
  nombreConcepto: string;
  tipoLicencia: string;
  clasificacion: string;
  cantidad: number;
  medicionConcepto: string;
  costoConcepto: number;
  total: number;
}

export interface RepLicenciasMeta {
  page: number;
  limit: number;
  totalRegistros: number;
  totalPaginas: number;
}

export interface RepLicenciasResponse {
  meta: RepLicenciasMeta;
  data: RepLicencia[];
}

export interface RepLicenciasFilters {
  page?: number;
  limit?: number;
  fechaInicio?: string;
  fechaFin?: string;
  consecutivo?: string;
  nombreConcepto?: string;
  tipoLicencia?: string;
  clasificacion?: string;
}
