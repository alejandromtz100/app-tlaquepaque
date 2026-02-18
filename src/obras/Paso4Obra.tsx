import { useEffect, useState } from 'react';
import { getConceptosByObra } from '../services/obraConceptos.service';
import { Printer } from 'lucide-react';
import { PDFObra } from '../services/pdfobra';

const API_OBRAS = 'http://localhost:3001/op_obras';
const NIVELES_LABELS = ['Abuelo', 'Padre', 'Hijo', 'Nieto'] as const;
const MAX_NIVELES = 4;

interface Props {
  obraId: number;
}

function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Paso4Obra({ obraId }: Props) {
  const [obra, setObra] = useState<any>(null);
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const [resObra, dataConceptos] = await Promise.all([
          fetch(`${API_OBRAS}/${obraId}`),
          getConceptosByObra(obraId),
        ]);

        if (!resObra.ok) {
          setError('No se encontró la obra');
          setLoading(false);
          return;
        }

        const dataObra = await resObra.json();
        setObra(dataObra);
        setConceptos(dataConceptos);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [obraId]);

  // Inicializar nuevoEstado cuando la obra está "Enviado a Pago" (siempre mismo orden de hooks)
  useEffect(() => {
    if (!obra) return;
    const estadoLower = obra.estadoObra ? String(obra.estadoObra).toLowerCase() : '';
    if (estadoLower === 'enviado a pago' && !nuevoEstado) {
      setNuevoEstado(obra.estadoObra);
    }
  }, [obra]);

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error || !obra) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        {error || 'Obra no encontrada'}
      </div>
    );
  }

  const path = (c: any): string[] => {
    const arr = c.conceptoPath && Array.isArray(c.conceptoPath)
      ? c.conceptoPath.map((n: { nombre: string }) => n.nombre)
      : c.concepto?.nombre
        ? [c.concepto.nombre]
        : [];
    return arr;
  };

  const celdaNivel = (niveles: string[], colIndex: number): string => {
    const offset = MAX_NIVELES - niveles.length;
    const idx = colIndex - offset;
    return idx >= 0 && idx < niveles.length ? niveles[idx] : '—';
  };

  const direccionObra = obra.numerosOficiales?.length
    ? obra.numerosOficiales.map((n: any) => `${n.calle || ''} ${n.numeroOficial || ''}`.trim()).filter(Boolean).join(', ')
    : obra.manzanaObra || obra.loteObra
      ? `Mza ${obra.manzanaObra || '—'} Lt ${obra.loteObra || '—'}`
      : '—';

  const coloniaObra = [obra.nombreColoniaObra, obra.idDensidadColoniaObra].filter(Boolean).join(' / ') || '—';
  const municipioObra = [obra.municipioPropietario, obra.entidadPropietario].filter(Boolean).join(' / ') || '—';
  const totalGeneral = conceptos.reduce((sum, c) => sum + Number(c.total ?? (c.costo_unitario ?? 0) * (c.cantidad ?? 0)), 0);

  const estadoObraLower = obra.estadoObra ? String(obra.estadoObra).toLowerCase() : '';
  const esEnviadoAPago = estadoObraLower === 'enviado a pago';

  const handleActualizarEstado = async () => {
    if (!nuevoEstado || nuevoEstado === obra.estadoObra) return;

    setActualizandoEstado(true);
    try {
      const res = await fetch(`${API_OBRAS}/${obraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoObra: nuevoEstado }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar el estado');
      }

      // Recargar los datos completos de la obra
      const resObra = await fetch(`${API_OBRAS}/${obraId}`);
      if (resObra.ok) {
        const obraActualizada = await resObra.json();
        setObra(obraActualizada);
        alert('Estado actualizado correctamente');
      } else {
        throw new Error('Error al recargar los datos');
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el estado');
    } finally {
      setActualizandoEstado(false);
    }
  };

  const handleGenerarPDF = async (tipo: string) => {
    try {
      if (!obra) return;

      // Preparar conceptos con información adicional
      const conceptosFormateados = conceptos.map((c: any) => {
        const conceptoNombre = c.conceptoPath && Array.isArray(c.conceptoPath)
          ? c.conceptoPath.map((n: { nombre: string }) => n.nombre).join(' , ')
          : c.concepto?.nombre || '—';
        
        return {
          ...c,
          conceptoNombre,
          // Usar observaciones del último concepto de la tabla conceptos (conceptoObservaciones)
          observaciones: c.conceptoObservaciones || undefined,
        };
      });

      const obraData = {
        consecutivo: obra.consecutivo || '',
        folioDeLaForma: obra.folioDeLaForma,
        fechaCaptura: obra.fechaCaptura,
        fechaIngreso: obra.fechaCaptura, // Por ahora usar fechaCaptura
        fechaDictamen: obra.fechaDictamen || obra.fechaCaptura, // Si existe fechaDictamen, usarla
        nombrePropietario: obra.nombrePropietario || '',
        tipoPropietario: obra.tipoPropietario,
        representanteLegal: obra.representanteLegal,
        identificacion: obra.identificacion,
        tipoIdentificacion: obra.tipoIdentificacion,
        domicilioPropietario: obra.domicilioPropietario,
        coloniaPropietario: obra.coloniaPropietario,
        codigoPostalPropietario: obra.codigoPostalPropietario,
        municipioPropietario: obra.municipioPropietario,
        entidadPropietario: obra.entidadPropietario,
        telefonoPropietario: obra.telefonoPropietario,
        rfcPropietario: obra.rfcPropietario,
        numerosOficiales: obra.numerosOficiales,
        nombreColoniaObra: obra.nombreColoniaObra,
        idDensidadColoniaObra: obra.idDensidadColoniaObra,
        entreCalle1Obra: obra.entreCalle1Obra,
        entreCalle2Obra: obra.entreCalle2Obra,
        descripcionProyecto: obra.descripcionProyecto,
        destinoActualProyeto: obra.destinoActualProyeto,
        destinoPropuestoProyecto: obra.destinoPropuestoProyecto,
        coeficienteOcupacion: obra.coeficienteOcupacion,
        coeficienteUtilizacion: obra.coeficienteUtilizacion,
        servidumbreFrontal: obra.servidumbreFrontal,
        servidumbreLateral: obra.servidumbreLateral,
        servidumbrePosterior: obra.servidumbrePosterior,
        vigencia: obra.vigencia,
        estadoVerificacion: obra.estadoVerificacion,
        // Director responsable (si existe idDirectorObra)
        directorNombre: obra.directorObra?.nombre_completo,
        directorFechaActualizacion: obra.directorObra?.fecha_actualizacion,
        directorDomicilio: obra.directorObra?.domicilio,
        directorColonia: obra.directorObra?.colonia,
        directorMunicipio: obra.directorObra?.municipio,
        directorTelefono: obra.directorObra?.telefono,
        // Bitácora viene de op_obras
        bitacoraObra: obra.bitacoraObra,
        direccionMedioAmbiente: obra.direccionMedioAmbiente,
        observaciones: obra.observaciones,
        verificador: obra.verificador,
        notaServidumbre: obra.notaServidumbre,
        conceptos: conceptosFormateados,
      };

      if (tipo === 'ALINEAMIENTO Y NUMERO OFICIAL') {
        await PDFObra.generarAlineamientoNumeroOficial(obraData);
      } else if (tipo === 'LICENCIA DE CONSTRUCCIÓN') {
        await PDFObra.generarLicenciaConstruccion(obraData);
      } else if (tipo === 'CERTIFICADO DE HABITABILIDAD') {
        await PDFObra.generarCertificadoHabitabilidad(obraData);
      }
    } catch (error: any) {
      console.error('Error al generar PDF:', error);
      alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Datos de la Obra */}
      <div className="border-b border-slate-200">
        <div className="bg-black text-white text-center py-2 font-semibold text-sm">
          Datos de la Obra
        </div>
        <div className="px-6 py-2 text-sm text-slate-600 border-b border-slate-100">
          {formatFecha(obra.fechaCaptura)} / ESTATUS DE LA OBRA: {obra.estadoObra || '—'} {obra.estadoPago ? `/ ${obra.estadoPago}` : ''}
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Datos del propietario */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">DATOS DEL PROPIETARIO</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="md:col-span-2">
                <dt className="inline font-medium text-slate-600">Nombre de Propietario: </dt>
                <dd className="inline text-slate-800">
                  {obra.nombrePropietario || '—'} / Tipo de Propietario: {obra.tipoPropietario || '—'} / Representante Legal: {obra.representanteLegal || 'Ninguno'}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-600">Identificación: </dt>
                <dd className="inline text-slate-800">{obra.identificacion || obra.tipoIdentificacion || '—'}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-600">Domicilio: </dt>
                <dd className="inline text-slate-800">
                  {obra.domicilioPropietario || '—'} / Colonia: {obra.coloniaPropietario || '—'} / C.P: {obra.codigoPostalPropietario || '—'}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-600">Municipio: </dt>
                <dd className="inline text-slate-800">{municipioObra}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-600">Teléfono: </dt>
                <dd className="inline text-slate-800">{obra.telefonoPropietario || '—'} / RFC: {obra.rfcPropietario || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Datos de la obra */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">DATOS DE LA OBRA</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="md:col-span-2">
                <dt className="inline font-medium text-slate-600">Calle(s) y Número(s) Oficial(es): </dt>
                <dd className="inline text-slate-800">{direccionObra}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-600">Colonia: </dt>
                <dd className="inline text-slate-800">{coloniaObra}</dd>
              </div>
            </dl>
          </div>

          {/* Datos del proyecto */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">DATOS DEL PROYECTO</h3>
            <dl className="text-sm">
              <dt className="font-medium text-slate-600 mb-1">Descripción del Proyecto:</dt>
              <dd className="text-slate-800 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100">
                {obra.descripcionProyecto || obra.destinoActualProyeto || '—'}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Conceptos */}
      <div>
        <div className="bg-black text-white text-center py-2 font-semibold text-sm">
          CONCEPTOS
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse bg-white">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr className="text-gray-700 uppercase">
                <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estatus</th>
                {NIVELES_LABELS.map((label) => (
                  <th key={label} className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">
                    Conceptos ({label})
                  </th>
                ))}
                <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Costo</th>
                <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Medición</th>
                <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Cantidad</th>
                <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Totales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conceptos.map((c) => {
                const niveles = path(c);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200">
                    <td className="px-4 py-3 border border-gray-300 text-gray-700">En Proceso</td>
                    {Array.from({ length: MAX_NIVELES }, (_, i) => (
                      <td key={i} className="px-4 py-3 border border-gray-300 text-gray-700">
                        {celdaNivel(niveles, i)}
                      </td>
                    ))}
                    <td className="px-4 py-3 border border-gray-300 text-gray-700">{Number(c.costo_unitario ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 border border-gray-300 text-gray-700">{c.medicion ?? '—'}</td>
                    <td className="px-4 py-3 border border-gray-300 text-gray-700">{c.cantidad}</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">
                      ${Number(c.total ?? (c.costo_unitario ?? 0) * (c.cantidad ?? 0)).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex justify-end border-t border-slate-200 bg-slate-50">
          <div className="text-right">
            <span className="text-sm text-slate-600 block">Total general</span>
            <span className="text-xl font-bold text-slate-800">${totalGeneral.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Mensaje si la obra está En Proceso */}
      {obra.estadoObra && String(obra.estadoObra).toLowerCase() === 'en proceso' && (
        <div className="mt-6 px-6 py-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium text-center">
            El estatus de la obra es EN PROCESO, para poder efectuar el pago debe estar en estatus VERIFICADO.
          </p>
        </div>
      )}

      {/* Sección cuando está Enviado a Pago */}
      {esEnviadoAPago && (
        <div className="mt-6 space-y-6">
          {/* Botones de PDF */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleGenerarPDF('ALINEAMIENTO Y NUMERO OFICIAL')}
              className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <Printer className="w-5 h-5 text-gray-700 shrink-0" />
              <span className="text-sm font-medium text-gray-800">ALINEAMIENTO Y NUMERO OFICIAL</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenerarPDF('LICENCIA DE CONSTRUCCIÓN')}
              className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <Printer className="w-5 h-5 text-gray-700 shrink-0" />
              <span className="text-sm font-medium text-gray-800">LICENCIA DE CONSTRUCCIÓN</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenerarPDF('CERTIFICADO DE HABITABILIDAD')}
              className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <Printer className="w-5 h-5 text-gray-700 shrink-0" />
              <span className="text-sm font-medium text-gray-800">CERTIFICADO DE HABITABILIDAD</span>
            </button>
          </div>

          {/* Panel Dar por concluida la obra */}
          <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dar por concluida la obra</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Enviado a Pago">Enviado a Pago</option>
                  <option value="Concluido">Concluido</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleActualizarEstado}
                  disabled={actualizandoEstado || !nuevoEstado || nuevoEstado === obra.estadoObra}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actualizandoEstado ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  type="button"
                  onClick={() => setNuevoEstado(obra.estadoObra)}
                  disabled={actualizandoEstado}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
