import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Search, X } from "lucide-react";
import Menu from "../layout/menu";

interface ObraPredial {
  id: number;
  consecutivo: string;
  captura: string;
  propietario: string;
  calle: string;
  noOficial: string;
  colonia: string;
  numerosPrediosContiguos: string;
  estadoObra: string;
  estadoPago: string;
}

const Prediales: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<ObraPredial[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numerosPrediosContiguos, setNumerosPrediosContiguos] = useState("");

  // Verificar permisos del usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const puedeModificarObras = !esSupervisor;

  const registrosPorPagina = 10;

  const cargarDatos = useCallback(async () => {
    if (!numerosPrediosContiguos.trim()) {
      setError("Por favor ingresa los números predios contiguos para buscar");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHaBuscado(true);

      const params = new URLSearchParams();
      params.append('numerosPrediosContiguos', numerosPrediosContiguos.trim());

      const url = `http://localhost:3001/op_obras/listado-filtrado?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar obras");
      const data = await response.json();
      
      const ordenadas = data.sort(
        (a: ObraPredial, b: ObraPredial) =>
          new Date(b.captura).getTime() -
          new Date(a.captura).getTime()
      );
      
      setObras(ordenadas);
      setPaginaActual(1);
    } catch (err: any) {
      setError(err.message || "Error al cargar obras");
      setObras([]);
    } finally {
      setLoading(false);
    }
  }, [numerosPrediosContiguos]);

  const limpiarFiltros = useCallback(() => {
    setNumerosPrediosContiguos("");
    setObras([]);
    setHaBuscado(false);
    setError(null);
    setPaginaActual(1);
  }, []);

  // PAGINACIÓN
  const totalPaginas = Math.ceil(obras.length / registrosPorPagina);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const obrasPaginadas = obras.slice(inicio, fin);

  const formatearFecha = (fecha: string | Date) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "-";
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
                <h2 className="text-2xl font-bold">Prediales</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Búsqueda de obras por números predios contiguos
                </p>
              </div>
            </div>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Números Predios Contiguos
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingresa los números predios contiguos..."
                    value={numerosPrediosContiguos}
                    onChange={(e) => setNumerosPrediosContiguos(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        cargarDatos();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  />
                  <button
                    onClick={cargarDatos}
                    disabled={loading || !numerosPrediosContiguos.trim()}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search size={18} />
                    Buscar
                  </button>
                  {haBuscado && (
                    <button
                      onClick={limpiarFiltros}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium flex items-center gap-2"
                    >
                      <X size={18} />
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MENSAJE INICIAL O ERROR */}
          {!haBuscado && !error && (
            <div className="p-12 text-center text-gray-500 bg-gray-50">
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Ingresa los números predios contiguos para buscar obras</p>
              <p className="text-sm mt-2">Utiliza el campo de búsqueda arriba para comenzar</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* TABLA DE RESULTADOS */}
          {haBuscado && !loading && obras.length > 0 && (
            <>
              <div className="p-6">
                <div className="mb-4 text-sm text-gray-600">
                  Se encontraron <span className="font-semibold">{obras.length}</span> obra(s) con los números predios contiguos "{numerosPrediosContiguos}"
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Fecha</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Consecutivo</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Números Predios Contiguos</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Propietario</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Calle</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Número Oficial</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Colonia</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado Obra</th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado Pago</th>
                        {puedeModificarObras && (
                          <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100 w-48">Opciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {obrasPaginadas.map((obra) => (
                        <tr key={obra.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{formatearFecha(obra.captura)}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700 font-medium">{obra.consecutivo || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700 font-medium">{obra.numerosPrediosContiguos || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.propietario || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.calle || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.noOficial || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.colonia || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              obra.estadoObra === "Finalizada"
                                ? "bg-green-100 text-green-700"
                                : obra.estadoObra === "Cancelada"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {obra.estadoObra}
                            </span>
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              obra.estadoPago === "Pagado"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {obra.estadoPago}
                            </span>
                          </td>
                          {puedeModificarObras && (
                            <td className="px-4 py-3 border border-gray-300">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => navigate("/obras/paso1", { state: { id: obra.id } })}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={18} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIÓN */}
                {totalPaginas > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPaginaActual(1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ««
                    </button>
                    <button
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ‹
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Página {paginaActual} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => setPaginaActual(totalPaginas)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      »»
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {haBuscado && !loading && obras.length === 0 && (
            <div className="p-12 text-center text-gray-500 bg-gray-50">
              <p className="text-lg font-medium">No se encontraron obras</p>
              <p className="text-sm mt-2">No hay obras registradas con los números predios contiguos "{numerosPrediosContiguos}"</p>
            </div>
          )}

          {loading && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Buscando obras...</p>
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

export default Prediales;
