import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Copy, Printer, Paperclip, Plus } from "lucide-react";
import axios from "axios";
import Menu from "../layout/menu";
import { getConceptosByObra } from "../services/obraConceptos.service";

interface Obra {
  id: number;
  consecutivo: string;
  captura: string;
  propietario: string;
  calle: string;
  noOficial: string;
  colonia: string;
  coloniaDensidad?: string;
  estadoObra: string;
  estadoPago: string;
}

const API_OBRAS = "http://localhost:3001/op_obras/listado-filtrado";
const API_OBRA = "http://localhost:3001/op_obras";
const registrosPorPagina = 10;

const Obras: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ totalRegistros: number; totalPaginas: number } | null>(null);
  const [searchTrigger, setSearchTrigger] = useState(0); // Incrementar al hacer Buscar para forzar recarga
  const filtrosRef = useRef({ consecutivo: "", fecha: "", nombrePropietario: "", calle: "" });
  
  // Verificar permisos del usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const puedeModificarObras = !esSupervisor; // SUPERVISOR solo puede leer
  const [filtros, setFiltros] = useState({
    consecutivo: "",
    fecha: "",
    nombrePropietario: "",
    calle: "",
  });
  filtrosRef.current = filtros;

  const cargarDatos = useCallback(async (pageOverride?: number) => {
    try {
      setLoading(true);
      setError(null);
      setHaBuscado(true);

      const f = filtrosRef.current;
      const pageToUse = pageOverride ?? paginaActual;
      const params = new URLSearchParams();
      params.append("page", String(pageToUse));
      params.append("limit", String(registrosPorPagina));
      if (f.consecutivo.trim()) params.append("consecutivo", f.consecutivo.trim());
      if (f.fecha) params.append("fechaCaptura", f.fecha);
      if (f.nombrePropietario.trim()) params.append("nombrePropietario", f.nombrePropietario.trim());
      if (f.calle.trim()) params.append("calle", f.calle.trim());

      const response = await fetch(`${API_OBRAS}?${params.toString()}`);
      if (!response.ok) throw new Error("Error al cargar obras");
      const res = await response.json();
      
      setObras(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err) {
      console.error("Error al cargar obras:", err);
      setError("Error al cargar las obras");
      setObras([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [paginaActual, searchTrigger]);

  // Cargar al montar, al cambiar página o al hacer Buscar (no en cada tecla)
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = () => {
    setPaginaActual(1);
    setSearchTrigger((t) => t + 1); // Forzar recarga con filtros actuales
  };

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      consecutivo: "",
      fecha: "",
      nombrePropietario: "",
      calle: "",
    });
    setPaginaActual(1);
    setError(null);
    setSearchTrigger((t) => t + 1); // Forzar recarga con filtros limpios
  }, []);


  const handleCopiarObra = async (obraId: number) => {
    try {
      setLoading(true);
      
      // Obtener datos completos de la obra original
      const response = await axios.get(`${API_OBRA}/${obraId}`);
      const obraOriginal = response.data;

      // Obtener usuario logueado
      const usuarioData = localStorage.getItem("usuario");
      let idUsuarioLogueado: number | undefined;
      if (usuarioData) {
        try {
          const usuarioLogueado = JSON.parse(usuarioData);
          if (usuarioLogueado.id) {
            idUsuarioLogueado = usuarioLogueado.id;
          }
        } catch (error) {
          console.error('Error al parsear usuario de localStorage:', error);
        }
      }

      // Crear nueva obra copiando todos los campos del paso 1 EXCEPTO:
      // - numerosOficiales (no se copian)
      // - destinoActualProyecto
      // - destinoPropuestoProyecto
      // - descripcionProyecto
      // - revisor
      // - cuantificador
      const obraNueva: any = {
        // Datos del propietario
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
        
        // Datos de la obra
        idColoniaObra: obraOriginal.idColoniaObra || null,
        idDensidadColoniaObra: obraOriginal.idDensidadColoniaObra || "",
        manzanaObra: obraOriginal.manzanaObra || "",
        loteObra: obraOriginal.loteObra || "",
        etapaObra: obraOriginal.etapaObra || "",
        condominioObra: obraOriginal.condominioObra || "",
        numerosPrediosContiguosObra: obraOriginal.numerosPrediosContiguosObra || "",
        entreCalle1Obra: obraOriginal.entreCalle1Obra || "",
        entreCalle2Obra: obraOriginal.entreCalle2Obra || "",
        
        // Servicios
        aguaPotable: obraOriginal.aguaPotable || "Si",
        drenaje: obraOriginal.drenaje || "Si",
        electricidad: obraOriginal.electricidad || "Si",
        alumbradoPublico: obraOriginal.alumbradoPublico || "Si",
        machuelos: obraOriginal.machuelos || "Si",
        banquetas: obraOriginal.banquetas || "Si",
        pavimento: obraOriginal.pavimento || "No Definido",
        
        // Restricciones
        servidumbreFrontal: obraOriginal.servidumbreFrontal || "",
        servidumbreLateral: obraOriginal.servidumbreLateral || "",
        servidumbrePosterior: obraOriginal.servidumbrePosterior || "",
        coeficienteOcupacion: obraOriginal.coeficienteOcupacion || "",
        coeficienteUtilizacion: obraOriginal.coeficienteUtilizacion || "",
        
        // El consecutivo de la obra original va en idObraSuperior
        idObraSuperior: obraOriginal.consecutivo || "",
        
        // Campos que NO se copian (se dejan vacíos):
        // destinoActualProyecto: NO se copia
        // destinoPropuestoProyecto: NO se copia
        // descripcionProyecto: NO se copia
        // revisor: NO se copia
        // cuantificador: NO se copia
        
        // Campos del sistema
        consecutivo: "", // Se asignará después con el trámite
        fechaCaptura: new Date(),
        ultimaModificacion: new Date(),
        idUsuarioCapturador: idUsuarioLogueado,
      };

      // Crear la nueva obra
      const responseNueva = await axios.post(API_OBRA, obraNueva);
      const nuevaObraId = responseNueva.data.idObra || responseNueva.data.id;

      // Navegar al paso 1 de la nueva obra (el modal de trámite aparecerá cuando guarde)
      navigate("/obras/paso1", { state: { id: nuevaObraId, esCopia: true } });
    } catch (error: any) {
      console.error("Error al copiar obra:", error);
      alert(`Error al copiar la obra: ${error.response?.data?.message || error.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
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

  const totalRegistros = meta?.totalRegistros ?? 0;
  const totalPaginas = meta?.totalPaginas ?? 1;
  const visibles = obras;
  const inicio = totalRegistros > 0 ? (paginaActual - 1) * registrosPorPagina + 1 : 0;

  const maxButtons = 5;
  let startPage = Math.max(1, paginaActual - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;
  if (endPage > totalPaginas) {
    endPage = totalPaginas;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

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
                <h2 className="text-2xl font-bold">Obras</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Listado de obras registradas
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
                  onClick={handleBuscar}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  Buscar
                </button>
                {puedeModificarObras && (
                  <button
                    onClick={() => navigate("/obras/paso1")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <Plus size={18} />
                    Nueva obra
                  </button>
                )}
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
                  Fecha de Captura
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
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {haBuscado && totalRegistros > 0 && (
                <>Total: <span className="font-semibold">{totalRegistros}</span> obras</>
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
                  {visibles.length === 0 ? (
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
                    visibles.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap font-medium">{o.consecutivo || "—"}</td>
                        <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap">
                          {formatearFecha(o.captura)}
                        </td>
                        <td className="px-3 py-2 text-slate-800 font-medium whitespace-normal break-words">{o.propietario || "—"}</td>
                        <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">
                          <div>{o.calle || "—"}</div>
                          {o.noOficial && (() => {
                            // Si noOficial contiene la calle, extraer solo el número oficial
                            let numeroOficial = o.noOficial;
                            if (o.calle && numeroOficial.includes(o.calle)) {
                              numeroOficial = numeroOficial.replace(o.calle, '').trim();
                              // Limpiar separadores al inicio
                              numeroOficial = numeroOficial.replace(/^[\s,.-]+/, '').trim();
                            }
                            return numeroOficial ? (
                              <div className="text-xs text-slate-500">{numeroOficial}</div>
                            ) : null;
                          })()}
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">
                          <div>{o.colonia || "—"}</div>
                          {o.coloniaDensidad && (
                            <div className="text-xs text-slate-500">{o.coloniaDensidad}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            o.estadoObra === "Concluido"
                              ? "bg-emerald-100 text-emerald-700"
                              : o.estadoObra === "Enviado a Firmas"
                              ? "bg-blue-100 text-blue-700"
                              : o.estadoObra === "Enviado a Pago"
                              ? "bg-indigo-100 text-indigo-700"
                              : o.estadoObra === "Verificado"
                              ? "bg-green-100 text-green-700"
                              : o.estadoObra === "En Proceso"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {o.estadoObra || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            o.estadoPago === "Pagado"
                              ? "bg-blue-100 text-blue-700"
                              : o.estadoPago === "Sin Pagar"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {o.estadoPago || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex justify-center gap-2">
                            {puedeModificarObras && (
                              <button
                                onClick={() => navigate("/obras/paso1", { state: { id: o.id } })}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Editar"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                            {puedeModificarObras && (
                              <button 
                                onClick={() => handleCopiarObra(o.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors" 
                                title="Copiar"
                              >
                                <Copy size={18} />
                              </button>
                            )}
                            <button
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Imprimir"
                              onClick={() => {
                                if (o.estadoObra === "En Proceso") {
                                  alert("No se puede imprimir: la obra está en proceso. Debe estar verificada o en un estado posterior para acceder al paso 4 (Imprimir).");
                                  return;
                                }
                                navigate(`/obras/paso4/${o.id}`);
                              }}
                            >
                              <Printer size={18} />
                            </button>
                            {puedeModificarObras && (
                              <button
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Documentos"
                                onClick={async () => {
                                  try {
                                    const conceptos = await getConceptosByObra(o.id);
                                    if (!Array.isArray(conceptos) || conceptos.length === 0) {
                                      alert("No se puede acceder a Documentos: la obra no tiene conceptos registrados en el paso 2. Debe agregar al menos un concepto antes.");
                                      return;
                                    }
                                    navigate(`/obras/paso3/${o.id}`);
                                  } catch {
                                    alert("No se pudo verificar los datos de la obra. Intente de nuevo.");
                                  }
                                }}
                              >
                                <Paperclip size={18} />
                              </button>
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
          {!loading && (
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-slate-600 text-center sm:text-left order-2 sm:order-1">
                <span className="font-medium text-slate-800">{totalRegistros > 0 ? inicio : 0}</span>
                <span className="mx-1">–</span>
                <span className="font-medium text-slate-800">{totalRegistros > 0 ? Math.min(inicio + visibles.length - 1, totalRegistros) : 0}</span>
                <span className="mx-1">de</span>
                <span className="font-medium text-slate-800">{totalRegistros}</span>
                <span className="ml-1">registros</span>
              </p>
              {totalPaginas > 1 && (
                <nav className="flex items-center justify-center gap-1 order-1 sm:order-2" aria-label="Paginación">
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Primera página"
                  >
                    <span className="sr-only">Primera</span>«
                  </button>
                  <button
                    onClick={() => setPaginaActual(paginaActual - 1)}
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
                          onClick={() => setPaginaActual(pageNum)}
                          className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${paginaActual === pageNum ? "bg-slate-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
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

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Obras;
