import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Menu from "../layout/menu";
import { Pencil, Copy, Printer, Paperclip, Eye } from "lucide-react";
import { getConceptosByObra } from "../services/obraConceptos.service";

interface Obra {
  id: number;
  idObra?: number; // Para compatibilidad
  consecutivo: string;
  captura: string;
  fechaCaptura?: string; // Para compatibilidad
  propietario: string;
  nombrePropietario?: string; // Para compatibilidad
  calle?: string;
  noOficial?: string;
  numeroOficial?: string; // Para compatibilidad
  colonia?: string | null;
  nombreColoniaObra?: string; // Para compatibilidad
  estadoObra?: string;
  estadoPago?: string;
  // Para obras con números oficiales
  numerosOficiales?: Array<{
    calle: string;
    numerooficial: string;
  }>;
}

const REGISTROS_POR_PAGINA = 10;
const API_OBRA = "http://localhost:3001/op_obras";
const ESTADOS_OBRA = [
  { value: "", label: "Todos" },
  { value: "En Proceso", label: "En Proceso" },
  { value: "Verificado", label: "Verificado" },
  { value: "Enviado a Firmas", label: "Enviado a Firmas" },
  { value: "Concluido", label: "Concluido" },
] as const;

const BuscarObra: React.FC = () => {
  const navigate = useNavigate();
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const [obras, setObras] = useState<Obra[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtros, setFiltros] = useState({
    consecutivo: "",
    fecha: "",
    nombrePropietario: "",
    calle: "",
    estado: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cargarDatos = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      setHaBuscado(true);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(REGISTROS_POR_PAGINA));
      if (filtros.consecutivo.trim()) params.set("consecutivo", filtros.consecutivo.trim());
      if (filtros.fecha) params.set("fechaCaptura", filtros.fecha);
      if (filtros.nombrePropietario.trim()) params.set("nombrePropietario", filtros.nombrePropietario.trim());
      if (filtros.estado.trim()) params.set("estadoObra", filtros.estado.trim());

      const url = `http://localhost:3001/op_obras/listado-filtrado-paginado?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar obras");
      const { data, total } = await response.json();

      const obrasTransformadas = (data || []).map((obra: any) => ({
        id: obra.id,
        idObra: obra.id,
        consecutivo: obra.consecutivo || "",
        captura: obra.captura || "",
        fechaCaptura: obra.captura || "",
        propietario: obra.propietario || "",
        nombrePropietario: obra.propietario || "",
        calle: obra.calle || "",
        noOficial: obra.noOficial || "",
        numeroOficial: obra.noOficial || "",
        colonia: obra.colonia || null,
        nombreColoniaObra: obra.colonia || null,
        estadoObra: obra.estadoObra || "",
        estadoPago: obra.estadoPago || "",
      }));

      setObras(obrasTransformadas);
      setTotalRegistros(total || 0);
      setPaginaActual(page);
    } catch (err) {
      console.error("Error al cargar obras:", err);
      setError("Error al cargar las obras");
      setObras([]);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
    }, [filtros.consecutivo, filtros.fecha, filtros.nombrePropietario, filtros.estado]);

  const buscar = () => cargarDatos(1);

  // Filtrar por calle en memoria (sobre la página actual)
  const resultados = useMemo(() => {
    if (!filtros.calle.trim()) return obras;
    return obras.filter((obra) =>
      obra.calle?.toLowerCase().includes(filtros.calle.toLowerCase())
    );
  }, [obras, filtros.calle]);

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      consecutivo: "",
      fecha: "",
      nombrePropietario: "",
      calle: "",
      estado: "",
    });
    setObras([]);
    setTotalRegistros(0);
    setHaBuscado(false);
    setError(null);
    setPaginaActual(1);
  }, []);

  const handleCopiarObra = async (obraId: number) => {
    try {
      // Solo obtener datos de la obra original; no se crea nada hasta que el usuario guarde en paso 1
      const response = await axios.get(`${API_OBRA}/${obraId}`);
      const obraOriginal = response.data;

      // Armar datos para precargar el formulario del paso 1 (sin crear obra en backend)
      const datosObraCopia: any = {
        tipoPropietario: obraOriginal.tipoPropietario || "",
        nombrePropietario: obraOriginal.nombrePropietario || "",
        representanteLegal: obraOriginal.representanteLegal || "",
        identificacion: obraOriginal.identificacion || "",
        tipoIdentificacion: obraOriginal.tipoIdentificacion || "",
        domicilioPropietario: obraOriginal.domicilioPropietario || "",
        coloniaPropietario: obraOriginal.coloniaPropietario || "",
        municipioPropietario: obraOriginal.municipioPropietario || "",
        entidadPropietario: obraOriginal.entidadPropietario || "",
        telefonoPropietario: obraOriginal.telefonoPropietario || "",
        rfcPropietario: obraOriginal.rfcPropietario || "",
        codigoPostalPropietario: obraOriginal.codigoPostalPropietario || "",
        documentoAcreditaPropiedad: obraOriginal.documentoAcreditaPropiedad || "",
        tipoDocumentoAcreditaPropiedad: obraOriginal.tipoDocumentoAcreditaPropiedad || "",
        documentosRequeridos: obraOriginal.documentosRequeridos || "",
        idColoniaObra: obraOriginal.idColoniaObra || null,
        nombreColoniaObra: obraOriginal.nombreColoniaObra || "",
        idDensidadColoniaObra: obraOriginal.idDensidadColoniaObra || "",
        manzanaObra: obraOriginal.manzanaObra || "",
        loteObra: obraOriginal.loteObra || "",
        etapaObra: obraOriginal.etapaObra || "",
        condominioObra: obraOriginal.condominioObra || "",
        numerosPrediosContiguosObra: obraOriginal.numerosPrediosContiguosObra || "",
        entreCalle1Obra: obraOriginal.entreCalle1Obra || "",
        entreCalle2Obra: obraOriginal.entreCalle2Obra || "",
        aguaPotable: obraOriginal.aguaPotable || "Si",
        drenaje: obraOriginal.drenaje || "Si",
        electricidad: obraOriginal.electricidad || "Si",
        alumbradoPublico: obraOriginal.alumbradoPublico || "Si",
        machuelos: obraOriginal.machuelos || "Si",
        banquetas: obraOriginal.banquetas || "Si",
        pavimento: obraOriginal.pavimento || "No Definido",
        servidumbreFrontal: obraOriginal.servidumbreFrontal || "",
        servidumbreLateral: obraOriginal.servidumbreLateral || "",
        servidumbrePosterior: obraOriginal.servidumbrePosterior || "",
        coeficienteOcupacion: obraOriginal.coeficienteOcupacion || "",
        coeficienteUtilizacion: obraOriginal.coeficienteUtilizacion || "",
        idObraSuperior: obraOriginal.consecutivo || "",
      };

      // Navegar al paso 1 con datos precargados; la obra solo se crea al hacer "Guardar cambios"
      navigate("/obras/paso1", { state: { esCopia: true, datosObraCopia } });
    } catch (error: any) {
      console.error("Error al cargar obra para copiar:", error);
      alert(`Error al cargar la obra: ${error.response?.data?.message || error.message || "Error desconocido"}`);
    }
  };

  const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA) || 1;
  const irAPagina = (pag: number) => {
    if (pag < 1 || pag > totalPaginas) return;
    cargarDatos(pag);
  };

  const formatearFecha = (fecha: string | Date) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Sistema de Control de la Edificación ALCH
            </h1>
            <p className="text-sm text-gray-500">
              H. Ayuntamiento de Tlaquepaque
            </p>
          </div>
        </div>
      </header>

      <Menu />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          {/* HEADER DEL REPORTE */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Buscar Obra</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Busca obras por consecutivo, fecha, nombre del propietario o calle
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de registros</div>
                <div className="text-2xl font-bold">{haBuscado ? totalRegistros : "-"}</div>
              </div>
            </div>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
              <div className="flex gap-2">
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={buscar}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  Buscar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consecutivo
                </label>
                <input
                  type="text"
                  name="consecutivo"
                  placeholder="Buscar por consecutivo..."
                  value={filtros.consecutivo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={filtros.fecha}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Propietario
                </label>
                <input
                  type="text"
                  name="nombrePropietario"
                  placeholder="Buscar por propietario..."
                  value={filtros.nombrePropietario}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calle
                </label>
                <input
                  type="text"
                  name="calle"
                  placeholder="Buscar por calle..."
                  value={filtros.calle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado (flujo de obra)
                </label>
                <select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm bg-white"
                >
                  {ESTADOS_OBRA.map((op) => (
                    <option key={op.value || "todos"} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {haBuscado && (
                totalRegistros === 0
                  ? "0 resultados"
                  : `Mostrando ${(paginaActual - 1) * REGISTROS_POR_PAGINA + 1}–${Math.min(paginaActual * REGISTROS_POR_PAGINA, totalRegistros)} de ${totalRegistros} resultados`
              )}
            </div>
          </div>

          {/* TABLA O ESTADO DE CARGA */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Buscando obras...</p>
                </div>
              </div>
            ) : !haBuscado ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700 mb-2">Ingresa los filtros de búsqueda</p>
                  <p className="text-sm text-gray-500">Usa los filtros de arriba para buscar obras por consecutivo, fecha de captura o propietario</p>
                </div>
              </div>
            ) : error ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Consecutivo</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Fecha Captura</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Propietario</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Calle / No. Oficial</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Colonia</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado Obra</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado Pago</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[140px]">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-slate-500 bg-slate-50/50">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="font-medium text-slate-600">No se encontraron obras para los filtros aplicados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    resultados.map((obra) => (
                      <tr key={obra.idObra || obra.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap font-medium">{obra.consecutivo || "—"}</td>
                        <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap">
                          {formatearFecha(obra.fechaCaptura || obra.captura)}
                        </td>
                        <td className="px-3 py-2 text-slate-800 font-medium whitespace-normal break-words">{obra.nombrePropietario || obra.propietario || "—"}</td>
                        <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">
                          <div>{obra.calle || "—"}</div>
                          {(obra.numeroOficial || obra.noOficial) && (
                            <div className="text-xs text-slate-500">No. {obra.numeroOficial || obra.noOficial}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{obra.nombreColoniaObra || obra.colonia || "—"}</td>
                        <td className="px-3 py-2 align-top">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            obra.estadoObra === "Concluido"
                              ? "bg-emerald-100 text-emerald-700"
                              : obra.estadoObra === "Enviado a Firmas"
                              ? "bg-blue-100 text-blue-700"
                              : obra.estadoObra === "Enviado a Pago"
                              ? "bg-indigo-100 text-indigo-700"
                              : obra.estadoObra === "Verificado"
                              ? "bg-green-100 text-green-700"
                              : obra.estadoObra === "En Proceso"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {obra.estadoObra || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            obra.estadoPago === "Pagado"
                              ? "bg-blue-100 text-blue-700"
                              : obra.estadoPago === "Sin Pagar"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {obra.estadoPago || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex justify-center gap-2">
                            {esSupervisor ? (
                              <button
                                onClick={() => navigate("/obras/paso1", { state: { id: obra.idObra || obra.id } })}
                                className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm font-medium"
                                title="Ver obra"
                              >
                                <Eye size={18} />
                                Ver obra
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate("/paso1obras", { state: { id: obra.idObra || obra.id } })}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button 
                                  onClick={() => handleCopiarObra(obra.idObra || obra.id)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors" 
                                  title="Copiar"
                                >
                                  <Copy size={18} />
                                </button>
                                <button
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Imprimir"
                                  onClick={() => {
                                    const id = obra.idObra ?? obra.id;
                                    if (obra.estadoObra === "En Proceso") {
                                      alert("No se puede imprimir: la obra está en proceso. Debe estar verificada o en un estado posterior para acceder al paso 4 (Imprimir).");
                                      return;
                                    }
                                    navigate(`/obras/paso4/${id}`);
                                  }}
                                >
                                  <Printer size={18} />
                                </button>
                                <button
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Documentos"
                                  onClick={async () => {
                                    const id = obra.idObra ?? obra.id;
                                    try {
                                      const conceptos = await getConceptosByObra(id);
                                      if (!Array.isArray(conceptos) || conceptos.length === 0) {
                                        alert("No se puede acceder a Documentos: la obra no tiene conceptos registrados en el paso 2. Debe agregar al menos un concepto antes.");
                                        return;
                                      }
                                      navigate(`/obras/paso3/${id}`);
                                    } catch {
                                      alert("No se pudo verificar los datos de la obra. Intente de nuevo.");
                                    }
                                  }}
                                >
                                  <Paperclip size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINACIÓN */}
          {!loading && haBuscado && (
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-slate-600 text-center sm:text-left order-2 sm:order-1">
                <span className="font-medium text-slate-800">{totalRegistros > 0 ? (paginaActual - 1) * REGISTROS_POR_PAGINA + 1 : 0}</span>
                <span className="mx-1">–</span>
                <span className="font-medium text-slate-800">{Math.min(paginaActual * REGISTROS_POR_PAGINA, totalRegistros)}</span>
                <span className="mx-1">de</span>
                <span className="font-medium text-slate-800">{totalRegistros}</span>
                <span className="ml-1">registros</span>
              </p>
              {totalPaginas > 1 && (
                <nav className="flex items-center justify-center gap-1 order-1 sm:order-2" aria-label="Paginación">
                  <button
                    onClick={() => irAPagina(1)}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Primera página"
                  >
                    <span className="sr-only">Primera</span>«
                  </button>
                  <button
                    onClick={() => irAPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                  <div className="flex items-center gap-0.5 mx-1">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      let pageNum = totalPaginas <= 5 ? i + 1 : paginaActual <= 3 ? i + 1 : paginaActual >= totalPaginas - 2 ? totalPaginas - 4 + i : paginaActual - 2 + i;
                      if (pageNum < 1) pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => irAPagina(pageNum)}
                          className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${paginaActual === pageNum ? "bg-slate-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => irAPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => irAPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Última página"
                  >
                    »
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default BuscarObra;
