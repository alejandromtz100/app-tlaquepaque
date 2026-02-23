import { useEffect, useState } from 'react';
import { getConceptosByObra } from '../services/obraConceptos.service';
import { Printer, AlertCircle, X } from 'lucide-react';
import { PDFObra } from '../services/pdfobra';

const API_OBRAS = 'http://localhost:3001/op_obras';
const API_LUGARES_RECIBIDOS = 'http://localhost:3001/lugares-recibidos';
const API_ALERTAS = 'http://localhost:3001/alertas';

interface AlertaPdf {
  idAlerta: number;
  idObra: number;
  tipoPdf: string;
  mensaje: string;
}
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
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const [obra, setObra] = useState<any>(null);
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [actualizandoEstado, setActualizandoEstado] = useState(false);
  const [recibidoSecretaria, setRecibidoSecretaria] = useState<string>('');
  const [recibidoPresidencia, setRecibidoPresidencia] = useState<string>('');
  const [recibidoPadron, setRecibidoPadron] = useState<string>('');
  const [guardandoRecibidos, setGuardandoRecibidos] = useState(false);
  const [alertasObra, setAlertasObra] = useState<AlertaPdf[]>([]);
  const [mostrarModalPDF, setMostrarModalPDF] = useState(false);
  const [tipoPDFSeleccionado, setTipoPDFSeleccionado] = useState<string>('');
  const [nombreAutorizacion, setNombreAutorizacion] = useState('C. JONATHAN TORRES SIFUENTES');
  const [rev, setRev] = useState('');
  const [cuant, setCuant] = useState('AFAI');
  const [tamanoFuente, setTamanoFuente] = useState<'normal' | 'pequeno' | 'muyPequeno'>('normal');

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

        try {
          const resLugares = await fetch(`${API_LUGARES_RECIBIDOS}/obra/${obraId}`);
          if (resLugares.ok) {
            const lugaresData = await resLugares.json();
            setRecibidoSecretaria(lugaresData.secretariaObrasPublicas || '');
            setRecibidoPresidencia(lugaresData.presidencia || '');
            setRecibidoPadron(lugaresData.padronLicencias || '');
          }
        } catch (err) {
          console.error('Error al cargar lugares recibidos:', err);
        }

        try {
          const resAlertas = await fetch(`${API_ALERTAS}/obra/${obraId}`);
          if (resAlertas.ok) {
            const dataAlertas = await resAlertas.json();
            setAlertasObra(Array.isArray(dataAlertas) ? dataAlertas : []);
          } else {
            setAlertasObra([]);
          }
        } catch (err) {
          console.error('Error al cargar alertas:', err);
          setAlertasObra([]);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [obraId]);

  // Inicializar nuevoEstado cuando la obra está "Enviado a Pago" o "Enviado a Firmas"
  useEffect(() => {
    if (!obra) return;
    const estadoLower = obra.estadoObra ? String(obra.estadoObra).toLowerCase() : '';
    if ((estadoLower === 'enviado a pago' || estadoLower === 'enviado a firmas') && !nuevoEstado) {
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

  // Alinear a la izquierda: Abuelo en col 0, Padre en col 1, Hijo en col 2, Nieto en col 3.
  const celdaNivel = (niveles: string[], colIndex: number): string => {
    return colIndex < niveles.length ? niveles[colIndex] : '—';
  };

  const direccionObra = obra.numerosOficiales?.length
    ? obra.numerosOficiales.map((n: any) => `${n.calle || ''} ${n.numeroOficial || ''}`.trim()).filter(Boolean).join(', ')
    : obra.manzanaObra || obra.loteObra
      ? `Mza ${obra.manzanaObra || '—'} Lt ${obra.loteObra || '—'}`
      : '—';

  const coloniaObra = [obra.nombreColoniaObra, obra.idDensidadColoniaObra].filter(Boolean).join(' / ') || '—';
  const municipioObra = [obra.municipioPropietario, obra.entidadPropietario].filter(Boolean).join(' / ') || '—';
  const totalGeneral = conceptos.reduce((sum, c) => sum + Number(c.total ?? (c.costo_unitario ?? 0) * (c.cantidad ?? 0)), 0);

  const estadoObraLower = obra.estadoObra ? String(obra.estadoObra).toLowerCase().trim() : '';
  const estadoPagoLower = obra.estadoPago ? String(obra.estadoPago).toLowerCase().trim() : '';
  const esVerificado = estadoObraLower === 'verificado';
  const esEnviadoAPago = estadoObraLower === 'enviado a pago' || estadoObraLower.includes('enviado a pago');
  const esEnviadoAFirmas = estadoObraLower === 'enviado a firmas' || estadoObraLower.includes('enviado a firmas');
  const esConcluido = estadoObraLower === 'concluido';
  const puedeGenerarPDFs = esEnviadoAPago || esEnviadoAFirmas || esConcluido;
  const mostrarLugaresYConcluir = esEnviadoAPago || esEnviadoAFirmas;
  const estadoSinPagar = estadoPagoLower === 'sin pagar' || estadoPagoLower.includes('sin pagar');
  const todosLugaresEnSi =
    recibidoSecretaria === 'Si' && recibidoPresidencia === 'Si' && recibidoPadron === 'Si';
  const faltanLugaresParaConcluir =
    esEnviadoAFirmas && nuevoEstado === 'Concluido' && !todosLugaresEnSi;

  const getAlertaPorTipo = (tipoPdf: string): AlertaPdf | null =>
    alertasObra.find((a) => a.tipoPdf === tipoPdf) || null;

  const handleGenerarPDFClick = (tipo: string) => {
    const alerta = getAlertaPorTipo(tipo);
    if (alerta) {
      alert(
        `No se puede imprimir este documento.\n\nMotivo: ${alerta.mensaje}\n\nPara poder imprimir, un administrador debe revisar el documento y quitar o modificar la alerta desde el menú Administradores → Alertas.`
      );
      return;
    }
    setTipoPDFSeleccionado(tipo);
    setMostrarModalPDF(true);
  };

  const handleCerrarModalPDF = () => {
    setMostrarModalPDF(false);
    setTipoPDFSeleccionado('');
  };

  const handleGuardarRecibidos = async () => {
    setGuardandoRecibidos(true);
    try {
      const res = await fetch(`${API_LUGARES_RECIBIDOS}/obra/${obraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretariaObrasPublicas: recibidoSecretaria,
          presidencia: recibidoPresidencia,
          padronLicencias: recibidoPadron,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar los datos');
      alert('Datos guardados correctamente');
    } catch (err: any) {
      alert(err.message || 'Error al guardar los datos');
    } finally {
      setGuardandoRecibidos(false);
    }
  };

  const handleEnviarAFirmas = async () => {
    const confirmar = window.confirm(
      '¿Está seguro de cambiar el estado de la obra de Verificado a Enviado a Firmas?'
    );
    if (!confirmar) return;

    setActualizandoEstado(true);
    try {
      const res = await fetch(`${API_OBRAS}/${obraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoObra: 'Enviado a Firmas' }),
      });
      if (!res.ok) throw new Error('Error al actualizar el estado');
      const resObra = await fetch(`${API_OBRAS}/${obraId}`);
      if (resObra.ok) {
        const obraActualizada = await resObra.json();
        setObra(obraActualizada);
        setNuevoEstado('Enviado a Firmas');
        alert('Estado actualizado correctamente. La obra ha sido enviada a firmas.');
      } else {
        throw new Error('Error al recargar los datos');
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el estado');
    } finally {
      setActualizandoEstado(false);
    }
  };

  const handleConcluidoAEnviadoAFirmas = async () => {
    const confirmar = window.confirm(
      '¿Está seguro de cambiar el estado de la obra de Concluido a Enviado a Firmas?'
    );
    if (!confirmar) return;

    setActualizandoEstado(true);
    try {
      const res = await fetch(`${API_OBRAS}/${obraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoObra: 'Enviado a Firmas' }),
      });
      if (!res.ok) throw new Error('Error al actualizar el estado');
      const resObra = await fetch(`${API_OBRAS}/${obraId}`);
      if (resObra.ok) {
        const obraActualizada = await resObra.json();
        setObra(obraActualizada);
        setNuevoEstado('Enviado a Firmas');
        alert('Estado actualizado correctamente. La obra ha vuelto a Enviado a Firmas.');
      } else {
        throw new Error('Error al recargar los datos');
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el estado');
    } finally {
      setActualizandoEstado(false);
    }
  };

  const handleActualizarEstado = async () => {
    if (!nuevoEstado || nuevoEstado === obra.estadoObra) return;

    if (nuevoEstado === 'Concluido') {
      const estadoActual = String(obra.estadoObra || '').toLowerCase().trim();
      const vieneDeEnviadoAFirmas = estadoActual === 'enviado a firmas' || estadoActual.includes('enviado a firmas');
      if (vieneDeEnviadoAFirmas) {
        if (!todosLugaresEnSi) {
          alert(
            'Para cambiar el estado a Concluido, todos los lugares que recibieron deben estar en "Sí" (Secretaría obras públicas, Presidencia, Padrón y licencias). Guarde los datos en "Lugares que recibieron" y vuelva a intentar.'
          );
          return;
        }
      }

      const resAlertas = await fetch(`${API_ALERTAS}/obra/${obraId}`);
      const alertasActuales = resAlertas.ok ? (await resAlertas.json()) || [] : [];
      if (alertasActuales.length > 0) {
        alert(
          'No se puede marcar la obra como concluida. Hay alertas pendientes en uno o más PDFs. Un administrador debe revisar cada documento con alerta en Administradores → Alertas, quitarlas o modificarlas, y luego podrá enviar a concluido.'
        );
        setAlertasObra(Array.isArray(alertasActuales) ? alertasActuales : []);
        return;
      }
      const confirmar = window.confirm('¿Estás seguro que quieres enviar el estado de la obra a concluido?');
      if (!confirmar) return;
    }

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
        observaciones: obra.nota || obra.observaciones,
        verificador: obra.verificador,
        notaServidumbre: obra.notaServidumbre,
        conceptos: conceptosFormateados,
        nombreAutorizacion,
        rev,
        cuant,
        tamanoFuente,
      };

      if (tipo === 'ALINEAMIENTO Y NUMERO OFICIAL') {
        await PDFObra.generarAlineamientoNumeroOficial(obraData);
      } else if (tipo === 'LICENCIA DE CONSTRUCCIÓN') {
        await PDFObra.generarLicenciaConstruccion(obraData);
      } else if (tipo === 'CERTIFICADO DE HABITABILIDAD') {
        await PDFObra.generarCertificadoHabitabilidad(obraData);
      }
      handleCerrarModalPDF();
    } catch (error: any) {
      console.error('Error al generar PDF:', error);
      alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Datos de la Obra */}
      <div className="border-b border-slate-200">
        <div className="bg-gray-800 text-white text-center py-3 font-semibold text-sm">
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
        <div className="bg-gray-800 text-white text-center py-3 font-semibold text-sm">
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

      {/* Solo cuando está Verificado: botón Enviar a Firmas (oculto para supervisor) */}
      {!esSupervisor && esVerificado && (
        <div className="mt-6 px-6 py-6 bg-white border-2 border-gray-300 rounded-xl">
          <p className="text-gray-700 mb-4">
            La obra está en estado <strong>Verificado</strong>. Envíe a firmas para poder generar los PDFs.
          </p>
          <button
            type="button"
            onClick={handleEnviarAFirmas}
            disabled={actualizandoEstado}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actualizandoEstado ? 'Enviando...' : 'Enviar a Firmas'}
          </button>
        </div>
      )}

      {/* Sección de PDFs y gestión de estado (solo cuando NO está Verificado) */}
      {!esVerificado && (
        <div className="mt-6 space-y-6">
          {/* Botones de PDF - solo cuando puede generar (Enviado a Firmas, Enviado a Pago, Concluido) */}
          {puedeGenerarPDFs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['ALINEAMIENTO Y NUMERO OFICIAL', 'LICENCIA DE CONSTRUCCIÓN', 'CERTIFICADO DE HABITABILIDAD'] as const).map((tipo) => {
                const tieneAlerta = !!getAlertaPorTipo(tipo);
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleGenerarPDFClick(tipo)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition text-left ${
                      tieneAlerta
                        ? 'bg-red-50 border-red-300 hover:border-red-500 hover:bg-red-100'
                        : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {tieneAlerta ? (
                      <span title="Este PDF tiene una alerta"><AlertCircle className="w-5 h-5 text-red-600 shrink-0" /></span>
                    ) : (
                      <Printer className="w-5 h-5 text-gray-700 shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${tieneAlerta ? 'text-red-800' : 'text-gray-800'}`}>
                      {tipo}
                      {tieneAlerta && ' (con alerta)'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Lugares que recibieron (oculto para supervisor) */}
          {!esSupervisor && mostrarLugaresYConcluir && (
            <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lugares que recibieron</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Secretaria obras públicas</span>
                  <select
                    value={recibidoSecretaria}
                    onChange={(e) => setRecibidoSecretaria(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Presidencia</span>
                  <select
                    value={recibidoPresidencia}
                    onChange={(e) => setRecibidoPresidencia(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Padron y licencias</span>
                  <select
                    value={recibidoPadron}
                    onChange={(e) => setRecibidoPadron(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleGuardarRecibidos}
                    disabled={guardandoRecibidos}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardandoRecibidos ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dar por concluida la obra (oculto para supervisor) */}
          {!esSupervisor && mostrarLugaresYConcluir && (
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
                    {esEnviadoAFirmas ? (
                      <>
                        <option value="Enviado a Firmas">Enviado a Firmas</option>
                        <option value="Concluido">Concluido</option>
                      </>
                    ) : (
                      <>
                        <option value="Enviado a Pago">Enviado a Pago</option>
                        <option value="Concluido">Concluido</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleActualizarEstado}
                    disabled={
                      actualizandoEstado ||
                      !nuevoEstado ||
                      nuevoEstado === obra.estadoObra ||
                      faltanLugaresParaConcluir
                    }
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      faltanLugaresParaConcluir
                        ? 'Para pasar a Concluido, todos los lugares que recibieron deben estar en "Sí"'
                        : undefined
                    }
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
          )}

          {/* Obra concluida (oculto para supervisor) */}
          {!esSupervisor && esConcluido && (
            <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Obra concluida</h3>
              {estadoSinPagar && (
                <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm font-medium">
                    La obra sigue estando <strong>Sin pagar</strong>. Para cambiar el estado a Pagado debe llenar en el Paso 3 los detalles del pago (recibo de pago, folio, fechas, etc.). Una vez guardado en el Paso 3, el estado de pago cambiará a &quot;Pagado&quot;.
                  </p>
                </div>
              )}
              <p className="text-gray-700 text-sm mb-4">
                Puede volver a enviar la obra a firmas si necesita realizar cambios.
              </p>
              <button
                type="button"
                onClick={handleConcluidoAEnviadoAFirmas}
                disabled={actualizandoEstado}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actualizandoEstado ? 'Cambiando...' : 'Cambiar a Enviado a Firmas'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal para editar información de autorización del PDF (solo visible cuando no es Verificado y se abre el modal) */}
      {mostrarModalPDF && tipoPDFSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Editar información de autorización
              </h3>
              <button
                type="button"
                onClick={handleCerrarModalPDF}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{tipoPDFSeleccionado}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de autorización
                </label>
                <input
                  type="text"
                  value={nombreAutorizacion}
                  onChange={(e) => setNombreAutorizacion(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="C. JONATHAN TORRES SIFUENTES"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rev
                </label>
                <input
                  type="text"
                  value={rev}
                  onChange={(e) => setRev(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Iniciales"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuant
                </label>
                <input
                  type="text"
                  value={cuant}
                  onChange={(e) => setCuant(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AFAI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño de fuente
                </label>
                <select
                  value={tamanoFuente}
                  onChange={(e) => setTamanoFuente(e.target.value as 'normal' | 'pequeno' | 'muyPequeno')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="normal">Normal (9pt) - Una hoja</option>
                  <option value="pequeno">Pequeño (8pt) - Si se pasa a dos hojas</option>
                  <option value="muyPequeno">Muy pequeño (7pt) - Para textos muy largos</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona un tamaño más pequeño si el texto se pasa a dos hojas
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCerrarModalPDF}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleGenerarPDF(tipoPDFSeleccionado)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
