import { useState, useEffect, useMemo } from "react";
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

const BuscarObra: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 50;
  const [filtros, setFiltros] = useState({
    consecutivo: "",
    fecha: "",
    nombrePropietario: "",
    calle: "",
  });

  // NO cargar todas las obras al inicio - solo cuando se busque
  // useEffect(() => {
  //   cargarObras();
  // }, []);

  const cargarObras = async () => {
    try {
      setLoading(true);
      // Usar el endpoint más rápido de listado básico
      const response = await fetch("http://localhost:3001/op_obras/listado");
      if (!response.ok) throw new Error("Error al cargar obras");
      const data = await response.json();
      
      // Transformar los datos al formato que necesitamos
      const obrasTransformadas = data.map((obra: any) => ({
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
      setResultados(obrasTransformadas);
    } catch (error) {
      console.error("Error al cargar obras:", error);
      alert("Error al cargar las obras");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buscarObras = async () => {
    // Si no hay obras cargadas, cargarlas primero
    if (obras.length === 0) {
      await cargarObras();
    }
    setPaginaActual(1); // Resetear a primera página al buscar
  };

  // Filtrar obras con useMemo para mejor rendimiento
  const resultados = useMemo(() => {
    let filtradas = obras;

    // Filtrar por consecutivo
    if (filtros.consecutivo.trim()) {
      filtradas = filtradas.filter((obra) =>
        obra.consecutivo?.toLowerCase().includes(filtros.consecutivo.toLowerCase())
      );
    }

    // Filtrar por fecha
    if (filtros.fecha) {
      const fechaBusqueda = new Date(filtros.fecha).toISOString().split("T")[0];
      filtradas = filtradas.filter((obra) => {
        const fechaObra = obra.fechaCaptura || obra.captura;
        if (!fechaObra) return false;
        const fechaObraFormateada = new Date(fechaObra).toISOString().split("T")[0];
        return fechaObraFormateada === fechaBusqueda;
      });
    }

    // Filtrar por nombre del propietario
    if (filtros.nombrePropietario.trim()) {
      filtradas = filtradas.filter((obra) => {
        const propietario = obra.nombrePropietario || obra.propietario || "";
        return propietario.toLowerCase().includes(filtros.nombrePropietario.toLowerCase());
      });
    }

    // Filtrar por calle
    if (filtros.calle.trim()) {
      filtradas = filtradas.filter((obra) =>
        obra.calle?.toLowerCase().includes(filtros.calle.toLowerCase())
      );
    }

    return filtradas;
  }, [obras, filtros]);

  // Paginación de resultados
  const resultadosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return resultados.slice(inicio, inicio + registrosPorPagina);
  }, [resultados, paginaActual]);

  const totalPaginas = Math.ceil(resultados.length / registrosPorPagina);

  const limpiarFiltros = () => {
    setFiltros({
      consecutivo: "",
      fecha: "",
      nombrePropietario: "",
      calle: "",
    });
    setPaginaActual(1);
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <h2 className="text-2xl font-bold">Buscar Obra</h2>
            <p className="text-sm text-gray-300 mt-1">
              Busca obras por consecutivo, fecha, nombre del propietario o calle
            </p>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
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
            </div>

            <div className="flex gap-2">
              <button
                onClick={buscarObras}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                Buscar
              </button>
              <button
                onClick={limpiarFiltros}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium"
              >
                Limpiar Filtros
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {obras.length === 0 ? (
                <span>Haz clic en "Buscar" para cargar las obras</span>
              ) : (
                <>
                  Mostrando <span className="font-semibold">{resultados.length}</span> de{" "}
                  <span className="font-semibold">{obras.length}</span> obras
                </>
              )}
            </div>
          </div>

          {/* TABLA DE RESULTADOS */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando obras...</p>
            </div>
          ) : obras.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No hay obras cargadas</p>
              <p className="text-sm mt-2">
                Haz clic en "Buscar" para cargar las obras
              </p>
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No se encontraron obras</p>
              <p className="text-sm mt-2">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0 shadow-sm">
                    <tr className="text-gray-700 text-xs uppercase">
                      <th className="p-3 text-left border border-gray-300 font-semibold">
                        Consecutivo
                      </th>
                      <th className="p-3 text-left border border-gray-300 font-semibold">
                        Fecha Captura
                      </th>
                      <th className="p-3 text-left border border-gray-300 font-semibold">
                        Propietario
                      </th>
                      <th className="p-3 text-left border border-gray-300 font-semibold">
                        Calle / No. Oficial
                      </th>
                      <th className="p-3 text-left border border-gray-300 font-semibold">
                        Colonia
                      </th>
                      <th className="p-3 text-center border border-gray-300 font-semibold">
                        Estado Obra
                      </th>
                      <th className="p-3 text-center border border-gray-300 font-semibold">
                        Estado Pago
                      </th>
                      <th className="p-3 text-center border border-gray-300 font-semibold">
                        Opciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosPaginados.map((obra) => (
                      <tr
                        key={obra.idObra || obra.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-3 border border-gray-300 font-medium">
                          {obra.consecutivo || "-"}
                        </td>
                        <td className="p-3 border border-gray-300">
                          {formatearFecha(obra.fechaCaptura || obra.captura)}
                        </td>
                        <td className="p-3 border border-gray-300">
                          {obra.nombrePropietario || obra.propietario || "-"}
                        </td>
                        <td className="p-3 border border-gray-300">
                          <div>{obra.calle || "-"}</div>
                          {(obra.numeroOficial || obra.noOficial) && (
                            <div className="text-xs text-gray-500">
                              No. {obra.numeroOficial || obra.noOficial}
                            </div>
                          )}
                        </td>
                        <td className="p-3 border border-gray-300">
                          {obra.nombreColoniaObra || obra.colonia || "-"}
                        </td>
                        <td className="p-3 border border-gray-300 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              obra.estadoObra === "Verificado"
                                ? "bg-green-100 text-green-700"
                                : obra.estadoObra === "En Proceso"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {obra.estadoObra || "-"}
                          </span>
                        </td>
                        <td className="p-3 border border-gray-300 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              obra.estadoPago === "Pagado"
                                ? "bg-blue-100 text-blue-700"
                                : obra.estadoPago === "Sin Pagar"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {obra.estadoPago || "-"}
                          </span>
                        </td>
                        <td className="p-3 border border-gray-300">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate("/paso1obras", {
                                  state: { id: obra.idObra || obra.id },
                                })
                              }
                              className="p-1 hover:bg-blue-100 rounded transition"
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              className="p-1 hover:bg-green-100 rounded transition"
                              title="Copiar"
                            >
                              <Copy size={18} />
                            </button>
                            <button
                              className="p-1 hover:bg-purple-100 rounded transition"
                              title="Imprimir"
                            >
                              <Printer size={18} />
                            </button>
                            <button
                              className="p-1 hover:bg-yellow-100 rounded transition"
                              title="Documentos"
                            >
                              <Paperclip size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50 gap-4">
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold">
                      {resultados.length > 0 ? (paginaActual - 1) * registrosPorPagina + 1 : 0}
                    </span> - <span className="font-semibold">
                      {Math.min(paginaActual * registrosPorPagina, resultados.length)}
                    </span> de <span className="font-semibold">{resultados.length}</span> resultados
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      disabled={paginaActual === 1}
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ◀ Anterior
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        let pageNum;
                        if (totalPaginas <= 5) {
                          pageNum = i + 1;
                        } else if (paginaActual <= 3) {
                          pageNum = i + 1;
                        } else if (paginaActual >= totalPaginas - 2) {
                          pageNum = totalPaginas - 4 + i;
                        } else {
                          pageNum = paginaActual - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPaginaActual(pageNum)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              paginaActual === pageNum
                                ? "bg-black text-white"
                                : "border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      Siguiente ▶
                    </button>
                  </div>
                </div>
              )}
            </>
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
