import { useEffect, useState } from "react";
import { getReporteLicencias } from "../../services/repLicencias.service";
import type { RepLicencia, RepLicenciasFilters, RepLicenciasMeta } from "./types";
import RepLicenciasFiltersForm from "./RepLicenciasFilters";
import RepLicenciasTable from "./RepLicenciasTable";
import Menu from "../../layout/menu";

const RepLicenciasPage: React.FC = () => {
  const [filters, setFilters] = useState<RepLicenciasFilters>({
    page: 1,
    limit: 20,
  });

  const [data, setData] = useState<RepLicencia[]>([]);
  const [meta, setMeta] = useState<RepLicenciasMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    // Solo cargar si hay fecha inicio y fecha fin
    if (!filters.fechaInicio || !filters.fechaFin) {
      setData([]);
      setMeta(null);
      return;
    }

    setLoading(true);
    // Limpiar datos anteriores mientras carga para evitar mostrar datos de página anterior
    setData([]);
    
    try {
      const res = await getReporteLicencias(filters);
      setData(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error("Error cargando reporte de licencias", error);
      setData([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.fechaInicio, filters.fechaFin, filters.consecutivo, filters.nombreConcepto, filters.tipoLicencia, filters.clasificacion]);

  const onFilterChange = (newFilters: Partial<RepLicenciasFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const onPageChange = (page: number) => {
    // Validar que la página esté en el rango válido
    if (meta) {
      const pageNum = Number(page);
      if (pageNum < 1) return;
      if (pageNum > meta.totalPaginas) return;
    }
    setFilters((prev) => ({ ...prev, page }));
  };

  // Exportar Excel
  const exportExcel = async () => {
    if (!filters.fechaInicio || !filters.fechaFin) {
      alert("Por favor selecciona Fecha Inicio y Fecha Fin para exportar");
      return;
    }

    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, value.toString());
        }
      });

      const res = await fetch(
        `http://localhost:3001/reportes/licencias/export?${query.toString()}`,
        { method: "GET" }
      );

      if (!res.ok) throw new Error("Error al generar Excel");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const now = new Date();
      const tzMexico = "America/Mexico_City";
      const fecha = now.toLocaleDateString("en-CA", { timeZone: tzMexico });
      const hora = now.toLocaleTimeString("en-GB", {
        timeZone: tzMexico,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).replace(/:/g, "-");
      const nombreArchivo = `Reporte_Licencias_${fecha}_${hora}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Error al generar el Excel");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Sistema de Control de la Edificación ALCH
            </h1>
            <p className="text-sm text-gray-500">H. Ayuntamiento de Tlaquepaque</p>
          </div>
          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Exportar Excel
          </button>
        </div>
      </header>

      {/* Menu */}
      <Menu />

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <RepLicenciasFiltersForm onChange={onFilterChange} />
        
        {!filters.fechaInicio || !filters.fechaFin ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Selecciona un rango de fechas
              </h3>
              <p className="text-gray-500 text-sm">
                Por favor, selecciona <strong>Fecha Inicio</strong> y <strong>Fecha Fin</strong> para cargar el reporte de licencias.
              </p>
            </div>
          </div>
        ) : (
          <RepLicenciasTable
            data={data}
            loading={loading}
            meta={meta}
            onPageChange={onPageChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default RepLicenciasPage;
