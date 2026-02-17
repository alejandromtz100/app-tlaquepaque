import { useEffect, useState, useMemo, useCallback } from "react";
import Menu from "../layout/menu";
import type { ObraConNumerosOficiales } from "../services/numeros-oficiales.service";
import { NumerosOficialesService } from "../services/numeros-oficiales.service";
import * as XLSX from "xlsx";

interface FiltrosBusqueda {
  consecutivo: string;
  numeroOficial: string;
  calle: string;
}

const ReporteNumeroOficialesObra: React.FC = () => {
  const [obras, setObras] = useState<ObraConNumerosOficiales[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    consecutivo: "",
    numeroOficial: "",
    calle: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [haBuscado, setHaBuscado] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      setHaBuscado(true);
      
      const params = new URLSearchParams();
      if (filtros.consecutivo.trim()) params.append("consecutivo", filtros.consecutivo.trim());
      if (filtros.numeroOficial.trim()) params.append("numeroOficial", filtros.numeroOficial.trim());
      if (filtros.calle.trim()) params.append("calle", filtros.calle.trim());

      const data = await NumerosOficialesService.getReporte({
        consecutivo: filtros.consecutivo.trim() || undefined,
        numeroOficial: filtros.numeroOficial.trim() || undefined,
        calle: filtros.calle.trim() || undefined,
      });
      setObras(data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(`Error al cargar el reporte: ${errorMessage}`);
      setObras([]);
    } finally {
      setLoading(false);
    }
  };

  // Expandir obras: cada número oficial genera una fila (memoizado)
  const filasExpandidas = useMemo(() => {
    return obras.flatMap((obra) => {
      if (obra.numerosOficiales.length === 0) {
        // Si no tiene números oficiales, mostrar una fila con campos vacíos
        return [{
          ...obra,
          numeroOficial: "",
          calle: "",
        }];
      }
      return obra.numerosOficiales.map((num) => ({
        ...obra,
        numeroOficial: num.numerooficial,
        calle: num.calle || "",
      }));
    });
  }, [obras]);

  // Filtrar obras con filtros separados (solo consecutivo, número oficial y calle) - memoizado
  const filtradas = useMemo(() => {
    return filasExpandidas.filter((obra) => {
      const matchConsecutivo = !filtros.consecutivo || obra.consecutivo?.toLowerCase().includes(filtros.consecutivo.toLowerCase());
      const matchNumeroOficial = !filtros.numeroOficial || obra.numeroOficial?.toLowerCase().includes(filtros.numeroOficial.toLowerCase());
      const matchCalle = !filtros.calle || obra.calle?.toLowerCase().includes(filtros.calle.toLowerCase());

      return matchConsecutivo && matchNumeroOficial && matchCalle;
    });
  }, [filasExpandidas, filtros]);

  // Función para exportar a Excel
  const exportarAExcel = () => {
    const datosParaExcel = filtradas.map((obra) => {
      // Construir el domicilio del predio: Calle + Número Oficial + Colonia
      const partesDomicilio = [];
      if (obra.calle && obra.calle.trim() !== '') partesDomicilio.push(obra.calle);
      if (obra.numeroOficial && obra.numeroOficial.trim() !== '') partesDomicilio.push(`No. ${obra.numeroOficial}`);
      if (obra.nombreColoniaObra && obra.nombreColoniaObra.trim() !== '') partesDomicilio.push(obra.nombreColoniaObra);
      const domicilioPredio = partesDomicilio.length > 0 ? partesDomicilio.join(', ') : "-";

      return {
        "Fecha": formatearFecha(obra.fechaCaptura),
        "Consecutivo": obra.consecutivo || "-",
        "Número Oficial": obra.numeroOficial || "-",
        "Calle": obra.calle || "-",
        "Colonia": obra.nombreColoniaObra || "-",
        "Domicilio del Predio": domicilioPredio,
        "Tipo Propietario": obra.tipoPropietario || "-",
        "Propietario": obra.nombrePropietario || "-",
        "Predios Contiguos": obra.prediosContiguos && obra.prediosContiguos !== null && obra.prediosContiguos !== 'null' && obra.prediosContiguos.trim() !== '' ? obra.prediosContiguos : "-",
        "Condominio": obra.condominio && obra.condominio !== null && obra.condominio !== 'null' && obra.condominio.trim() !== '' ? obra.condominio : "-",
        "Etapa": obra.etapa && obra.etapa !== null && obra.etapa !== 'null' && obra.etapa.trim() !== '' ? obra.etapa : "-",
        "Lote": obra.loteObra && obra.loteObra !== null && obra.loteObra !== 'null' && obra.loteObra.trim() !== '' ? obra.loteObra : "-",
        "Manzana": obra.manzanaObra && obra.manzanaObra !== null && obra.manzanaObra !== 'null' && obra.manzanaObra.trim() !== '' ? obra.manzanaObra : "-",
        "Entre Calle": obra.entreCalle1 && obra.entreCalle1 !== null && obra.entreCalle1 !== 'null' && obra.entreCalle2 && obra.entreCalle2 !== null && obra.entreCalle2 !== 'null'
          ? `${obra.entreCalle1} / ${obra.entreCalle2}`
          : (obra.entreCalle1 && obra.entreCalle1 !== null && obra.entreCalle1 !== 'null') || (obra.entreCalle2 && obra.entreCalle2 !== null && obra.entreCalle2 !== 'null') ? (obra.entreCalle1 || obra.entreCalle2) : "-",
        "Destino Actual": obra.destinoActual || "-",
        "Destino Propuesto": obra.destinoPropuesto || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Números Oficiales");

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 20 }, // Fecha
      { wch: 15 }, // Consecutivo
      { wch: 15 }, // Número Oficial
      { wch: 25 }, // Calle
      { wch: 25 }, // Colonia
      { wch: 40 }, // Domicilio del Predio
      { wch: 18 }, // Tipo Propietario
      { wch: 35 }, // Propietario
      { wch: 18 }, // Predios Contiguos
      { wch: 15 }, // Condominio
      { wch: 10 }, // Etapa
      { wch: 10 }, // Lote
      { wch: 12 }, // Manzana
      { wch: 30 }, // Entre Calle
      { wch: 25 }, // Destino Actual
      { wch: 25 }, // Destino Propuesto
    ];
    worksheet['!cols'] = columnWidths;

    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reporte_Numeros_Oficiales_${fecha}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
  };

  // Función para limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      consecutivo: "",
      numeroOficial: "",
      calle: "",
    });
    setPaginaActual(1);
    setObras([]);
    setHaBuscado(false);
    setError(null);
  }, []);

  // Paginación para mejorar rendimiento - mostrar solo una porción de los datos
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10; // Mostrar 10 registros por página
  
  const visibles = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return filtradas.slice(inicio, inicio + registrosPorPagina);
  }, [filtradas, paginaActual]);
  
  const totalPaginas = Math.ceil(filtradas.length / registrosPorPagina);

  // Formatear fecha (memoizado con useCallback)
  const formatearFecha = useCallback((fecha: string | Date) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-xl font-bold text-gray-800">
              Sistema de Control de la Edificación ALCH
            </h1>
            <p className="text-sm text-gray-500">
              H. Ayuntamiento de Tlaquepaque
            </p>
          </div>
        </header>
        <Menu />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el reporte</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={cargarDatos}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
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
                <h2 className="text-2xl font-bold">Reporte de Números Oficiales de Obra</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Obras con sus números oficiales asignados
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de registros</div>
                <div className="text-2xl font-bold">{filasExpandidas.length}</div>
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
                  onClick={exportarAExcel}
                  disabled={filtradas.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar a Excel ({filtradas.length} registros)
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consecutivo</label>
                <input
                  type="text"
                  placeholder="Buscar consecutivo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  value={filtros.consecutivo}
                  onChange={(e) => {
                    setFiltros({ ...filtros, consecutivo: e.target.value });
                    setPaginaActual(1);
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Oficial</label>
                <input
                  type="text"
                  placeholder="Buscar número oficial..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  value={filtros.numeroOficial}
                  onChange={(e) => {
                    setFiltros({ ...filtros, numeroOficial: e.target.value });
                    setPaginaActual(1);
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                <input
                  type="text"
                  placeholder="Buscar calle..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  value={filtros.calle}
                  onChange={(e) => {
                    setFiltros({ ...filtros, calle: e.target.value });
                    setPaginaActual(1);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={cargarDatos}
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
            
            {haBuscado && !loading && (
              <div className="text-sm text-gray-600 mb-2">
                Mostrando <span className="font-semibold">{filtradas.length}</span> registro{filtradas.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* TABLA O ESTADO DE CARGA */}
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
            {!haBuscado ? (
              <div className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Ingresa los filtros de búsqueda
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Usa los filtros de arriba (Consecutivo, Número Oficial, Calle) y presiona <strong>"Buscar"</strong> para cargar el reporte.
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Buscando reporte...</p>
                </div>
              </div>
            ) : (
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full text-xs border-collapse bg-white">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr className="text-gray-700 uppercase">
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Fecha</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Consecutivo</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Número Oficial</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Calle</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Colonia</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Tipo Propietario</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Propietario</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Predios Contiguos</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Condominio</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Etapa</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Lote</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Manzana</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Entre Calle</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Destino Actual</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Destino Propuesto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visibles.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={15} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-base font-medium">
                            {(filtros.consecutivo || filtros.numeroOficial || filtros.calle)
                              ? "No se encontraron resultados para los filtros aplicados" 
                              : "No hay obras con números oficiales registrados"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibles.map((obra, index) => (
                      <tr
                        key={`${obra.idObra}-${obra.numeroOficial}-${index}`}
                        className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200"
                      >
                        <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-gray-700">
                          {formatearFecha(obra.fechaCaptura)}
                        </td>
                        <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">{obra.consecutivo || "-"}</td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.numeroOficial || "-"}</td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.calle || "-"}</td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.nombreColoniaObra || "-"}</td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.tipoPropietario || "-"}</td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.nombrePropietario || "-"}</td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">
                          {obra.prediosContiguos && obra.prediosContiguos !== null && obra.prediosContiguos !== 'null' && obra.prediosContiguos.trim() !== '' ? obra.prediosContiguos : "-"}
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">
                          {obra.condominio && obra.condominio !== null && obra.condominio !== 'null' && obra.condominio.trim() !== '' ? obra.condominio : "-"}
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">
                          {obra.etapa && obra.etapa !== null && obra.etapa !== 'null' && obra.etapa.trim() !== '' ? obra.etapa : "-"}
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">
                          {obra.loteObra && obra.loteObra !== null && obra.loteObra !== 'null' && obra.loteObra.trim() !== '' ? obra.loteObra : "-"}
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">
                          {obra.manzanaObra && obra.manzanaObra !== null && obra.manzanaObra !== 'null' && obra.manzanaObra.trim() !== '' ? obra.manzanaObra : "-"}
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">
                          {obra.entreCalle1 && obra.entreCalle1 !== null && obra.entreCalle1 !== 'null' && obra.entreCalle2 && obra.entreCalle2 !== null && obra.entreCalle2 !== 'null'
                            ? `${obra.entreCalle1} / ${obra.entreCalle2}`
                            : (obra.entreCalle1 && obra.entreCalle1 !== null && obra.entreCalle1 !== 'null') || (obra.entreCalle2 && obra.entreCalle2 !== null && obra.entreCalle2 !== 'null') 
                              ? (obra.entreCalle1 || obra.entreCalle2) 
                              : "-"}
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.destinoActual || "-"}</td>
                        <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.destinoPropuesto || "-"}</td>
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
                  {filtradas.length > 0 ? (paginaActual - 1) * registrosPorPagina + 1 : 0}
                </span> - <span className="font-semibold text-gray-900">
                  {Math.min(paginaActual * registrosPorPagina, filtradas.length)}
                </span> de <span className="font-semibold text-gray-900">{filtradas.length}</span> registros
                {filasExpandidas.length !== filtradas.length && (
                  <span className="text-gray-500"> (de {filasExpandidas.length} totales)</span>
                )}
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
                          className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            paginaActual === pageNum
                              ? "bg-black text-white"
                              : "border border-gray-300 bg-white hover:bg-gray-100"
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

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default ReporteNumeroOficialesObra;
