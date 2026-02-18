import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../layout/menu";
import { Pencil, Copy, Printer, Paperclip } from "lucide-react";

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
const ESTADOS_OBRA = [
  { value: "", label: "Todos" },
  { value: "En Proceso", label: "En Proceso" },
  { value: "Verificado", label: "Verificado" },
  { value: "Enviado a Firmas", label: "Enviado a Firmas" },
  { value: "Concluido", label: "Concluido" },
] as const;

const BuscarObra: React.FC = () => {
  const navigate = useNavigate();
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
    numerosPrediosContiguos: "",
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
      if (filtros.numerosPrediosContiguos.trim()) params.set("numerosPrediosContiguos", filtros.numerosPrediosContiguos.trim());
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
  }, [filtros.consecutivo, filtros.fecha, filtros.nombrePropietario, filtros.numerosPrediosContiguos, filtros.estado]);

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
      numerosPrediosContiguos: "",
      estado: "",
    });
    setObras([]);
    setTotalRegistros(0);
    setHaBuscado(false);
    setError(null);
    setPaginaActual(1);
  }, []);

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
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
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
              <div className="min-w-full inline-block align-middle">
                <table className="min-w-full text-xs border-collapse bg-white">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr className="text-gray-700 uppercase">
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Consecutivo</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Fecha Captura</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Propietario</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Calle / No. Oficial</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Colonia</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado Obra</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado Pago</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Opciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {resultados.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-base font-medium">No se encontraron obras para los filtros aplicados</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      resultados.map((obra) => (
                        <tr
                          key={obra.idObra || obra.id}
                          className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200"
                        >
                          <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">{obra.consecutivo || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-gray-700">
                            {formatearFecha(obra.fechaCaptura || obra.captura)}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.nombrePropietario || obra.propietario || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">
                            <div>{obra.calle || "-"}</div>
                            {(obra.numeroOficial || obra.noOficial) && (
                              <div className="text-xs text-gray-500">No. {obra.numeroOficial || obra.noOficial}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.nombreColoniaObra || obra.colonia || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300">
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
                              {obra.estadoObra || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              obra.estadoPago === "Pagado"
                                ? "bg-blue-100 text-blue-700"
                                : obra.estadoPago === "Sin Pagar"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {obra.estadoPago || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => navigate("/paso1obras", { state: { id: obra.idObra || obra.id } })}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Editar"
                              >
                                <Pencil size={18} />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Copiar">
                                <Copy size={18} />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Imprimir">
                                <Printer size={18} />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Documentos">
                                <Paperclip size={18} />
                              </button>
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

          {/* PAGINACIÓN */}
          {!loading && haBuscado && totalRegistros > 0 && totalPaginas > 1 && (
            <div className="p-4 border-t bg-gray-50 flex flex-wrap justify-center items-center gap-2">
              <button
                type="button"
                onClick={() => irAPagina(1)}
                disabled={paginaActual === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                ««
              </button>
              <button
                type="button"
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                ‹
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => irAPagina(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                »»
              </button>
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
