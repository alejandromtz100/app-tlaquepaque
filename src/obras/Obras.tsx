import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Copy, Printer, Paperclip, Plus } from "lucide-react";
import Menu from "../layout/menu";

interface Obra {
  id: number;
  consecutivo: string;
  captura: string;
  propietario: string;
  calle: string;
  noOficial: string;
  colonia: string;
  coloniaDensidad?: string;
  numerosPrediosContiguos?: string;
  estadoObra: string;
  estadoPago: string;
}

const API_OBRAS = "http://localhost:3001/op_obras/listado-filtrado";
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
  const filtrosRef = useRef({ consecutivo: "", fecha: "", nombrePropietario: "", calle: "", numerosPrediosContiguos: "" });
  
  // Verificar permisos del usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const puedeModificarObras = !esSupervisor; // SUPERVISOR solo puede leer
  const [filtros, setFiltros] = useState({
    consecutivo: "",
    fecha: "",
    nombrePropietario: "",
    calle: "",
    numerosPrediosContiguos: "",
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
      if (f.numerosPrediosContiguos.trim()) params.append("numerosPrediosContiguos", f.numerosPrediosContiguos.trim());

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
      numerosPrediosContiguos: "",
    });
    setPaginaActual(1);
    setError(null);
    setSearchTrigger((t) => t + 1); // Forzar recarga con filtros limpios
  }, []);

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Números Predios Contiguos
                </label>
                <input
                  type="text"
                  name="numerosPrediosContiguos"
                  placeholder="Buscar por prediales..."
                  value={filtros.numerosPrediosContiguos}
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
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
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
              <div className="min-w-full inline-block align-middle">
                <table className="min-w-full text-xs border-collapse bg-white">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr className="text-gray-700 uppercase">
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Consecutivo</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Captura</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Predios contiguos</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Propietario</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Números oficiales</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Colonia</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Pago</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Opciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visibles.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-base font-medium">No se encontraron obras para los filtros aplicados</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibles.map((o) => (
                        <tr
                          key={o.id}
                          className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200"
                        >
                          <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">{o.consecutivo}</td>
                          <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-gray-700">
                            {new Date(o.captura).toLocaleDateString("es-MX")}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{o.numerosPrediosContiguos || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{o.propietario}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">
                            {o.noOficial ? (
                              (() => {
                                const m = o.noOficial.match(/^(.*No\.\s*)(.+)$/);
                                return m ? <>{m[1]}<span className="text-gray-500">{m[2]}</span></> : o.noOficial;
                              })()
                            ) : "-"}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">
                            <div>{o.colonia}</div>
                            {o.coloniaDensidad && (
                              <div className="text-xs text-gray-500">{o.coloniaDensidad}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <span className={`px-2 py-1 rounded text-xs font-semibold
                              ${o.estadoObra === "Verificado"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"}`}>
                              {o.estadoObra}
                            </span>
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <span className={`px-2 py-1 rounded text-xs font-semibold
                              ${o.estadoPago === "Pagado"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"}`}>
                              {o.estadoPago}
                            </span>
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
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
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Copiar">
                                <Copy size={18} />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Imprimir">
                                <Printer size={18} />
                              </button>
                              {puedeModificarObras && (
                                <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Adjuntar">
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
              </div>
            )}
          </div>

          {/* PAGINACIÓN E INFORMACIÓN DE REGISTROS */}
          {!loading && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Mostrando <span className="font-semibold text-gray-900">
                    {totalRegistros > 0 ? inicio : 0}
                  </span> - <span className="font-semibold text-gray-900">
                    {totalRegistros > 0 ? Math.min(inicio + visibles.length - 1, totalRegistros) : 0}
                  </span> de <span className="font-semibold text-gray-900">{totalRegistros}</span> registros
                </div>

                {totalPaginas > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={paginaActual === 1}
                      onClick={() => setPaginaActual(1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ««
                    </button>
                    <button
                      disabled={paginaActual === 1}
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      &lt;
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                        const page = startPage + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setPaginaActual(page)}
                            className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              paginaActual === page
                                ? "bg-black text-white"
                                : "border border-gray-300 bg-white hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      &gt;
                    </button>
                    <button
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPaginaActual(totalPaginas)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      »»
                    </button>
                  </div>
                )}
              </div>
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
