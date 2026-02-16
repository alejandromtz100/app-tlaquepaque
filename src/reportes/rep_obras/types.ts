export interface RepObra {
  idObra: number;
  consecutivo: string;
  fechaCaptura: string;
  nombrePropietario: string;
  nombreColoniaObra: string;
  estadoObra: string;
  estadoPago: string;
  totalCostoConceptos: number | null;
}

export interface RepObrasMeta {
  page: number;
  limit: number;
  totalRegistros: number;
  totalPaginas: number;
}

export interface RepObrasResponse {
  meta: RepObrasMeta;
  data: RepObra[];
}

export interface RepObrasFilters {
  page?: number;
  limit?: number;
  fechaInicio?: string;
  fechaFin?: string;
  nombrePropietario?: string;
  consecutivo?: string;
  estadoObra?: string;
  estadoPago?: string;
}

/** Detalle completo de una obra (todos los campos del reporte) */
export interface RepObraDetalle extends RepObra {
  idObraSuperior?: string;
  tipoPropietario?: string;
  representanteLegal?: string;
  domicilioPropietario?: string;
  coloniaPropietario?: string;
  municipioPropietario?: string;
  entidadPropietario?: string;
  telefonoPropietario?: string;
  rfcPropietario?: string;
  codigoPostalPropietario?: string;
  correoPropietario?: string;
  sitioWebPropietario?: string;
  ocupacionPropietario?: string;
  identificacion?: string;
  tipoIdentificacion?: string;
  documentoAcreditaPropiedad?: string;
  tipoDocumentoAcreditaPropiedad?: string;
  documentosRequeridos?: string;
  idColoniaObra?: number;
  idDensidadColoniaObra?: string;
  manzanaObra?: string;
  loteObra?: string;
  etapaObra?: string;
  condominioObra?: string;
  numerosPrediosContiguosObra?: string;
  entreCalle1Obra?: string;
  entreCalle2Obra?: string;
  destinoActual?: string;
  destinoPropuesto?: string;
  aguaPotable?: string;
  drenaje?: string;
  electricidad?: string;
  alumbradoPublico?: string;
  machuelos?: string;
  banquetas?: string;
  pavimento?: string;
  servidumbreFrontal?: string;
  servidumbreLateral?: string;
  servidumbrePosterior?: string;
  coeficienteOcupacion?: string;
  coeficienteUtilizacion?: string;
  descripcionProyecto?: string;
  idDirectorObra?: number;
  bitacora?: string;
  vigencia?: string;
  fechaVerificacion?: string;
  verificacion?: string;
  fechaPago?: string;
  reciboDePago?: string;
  otrosRecibos?: string;
  folioDeLaForma?: string;
  fechaAprobacion?: string;
  informacionAdicional?: string;
}

