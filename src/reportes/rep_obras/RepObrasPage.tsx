import { useEffect, useState } from "react";
import { getReporteObras } from "../../services/repObras.service";
import type { RepObra, RepObrasFilters, RepObrasMeta } from "./types";
import RepObrasFiltersForm from "./RepObrasFilters";
import RepObrasTable from "./RepObrasTable";
import Menu from "../../layout/menu"; // tu menu existente

const RepObrasPage: React.FC = () => {
  const [filters, setFilters] = useState<RepObrasFilters>({
    page: 1,
    limit: 10,
  });

  const [data, setData] = useState<RepObra[]>([]);
  const [meta, setMeta] = useState<RepObrasMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getReporteObras(filters);
      setData(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error("Error cargando reporte de obras", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const onFilterChange = (newFilters: Partial<RepObrasFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // reset page al filtrar
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
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, value.toString());
        }
      });

      const res = await fetch(
        `http://localhost:3001/reportes/obras/export?${query.toString()}`,
        { method: "GET" }
      );

      if (!res.ok) throw new Error("Error al generar Excel");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const now = new Date();
      const tzMexico = "America/Mexico_City";
      const fecha = now.toLocaleDateString("en-CA", { timeZone: tzMexico }); // YYYY-MM-DD
      const hora = now.toLocaleTimeString("en-GB", {
        timeZone: tzMexico,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).replace(/:/g, "-");
      const nombreArchivo = `Reporte_Obras_${fecha}_${hora}.xlsx`;

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
                <h2 className="text-2xl font-bold">Reporte de Obras</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Obras con estado, propietario y costos
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de registros</div>
                <div className="text-2xl font-bold">{meta?.totalRegistros ?? 0}</div>
              </div>
            </div>
          </div>

          {/* FILTROS */}
          <div className="p-6 border-b bg-gray-50">
            <RepObrasFiltersForm onChange={onFilterChange} onExport={exportExcel} filters={filters} meta={meta} />
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
            <RepObrasTable
              data={data}
              loading={loading}
              meta={meta}
              onPageChange={onPageChange}
            />
          </div>

          {/* PAGINACIÓN */}
          {meta && meta.totalPaginas > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-slate-600 text-center sm:text-left order-2 sm:order-1">
                <span className="font-medium text-slate-800">{meta.totalRegistros > 0 ? (meta.page - 1) * meta.limit + 1 : 0}</span>
                <span className="mx-1">–</span>
                <span className="font-medium text-slate-800">{Math.min(meta.page * meta.limit, meta.totalRegistros)}</span>
                <span className="mx-1">de</span>
                <span className="font-medium text-slate-800">{meta.totalRegistros}</span>
                <span className="ml-1">registros</span>
              </p>
              {meta.totalPaginas > 1 && (
                <nav className="flex items-center justify-center gap-1 order-1 sm:order-2" aria-label="Paginación">
                  <button
                    onClick={() => onPageChange(1)}
                    disabled={meta.page === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Primera página"
                  >
                    <span className="sr-only">Primera</span>«
                  </button>
                  <button
                    onClick={() => onPageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                  <div className="flex items-center gap-0.5 mx-1">
                    {Array.from({ length: Math.min(5, meta.totalPaginas) }, (_, i) => {
                      let pageNum = meta.totalPaginas <= 5 ? i + 1 : meta.page <= 3 ? i + 1 : meta.page >= meta.totalPaginas - 2 ? meta.totalPaginas - 4 + i : meta.page - 2 + i;
                      if (pageNum < 1) pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => onPageChange(pageNum)}
                          className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${meta.page === pageNum ? "bg-slate-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => onPageChange(meta.page + 1)}
                    disabled={meta.page === meta.totalPaginas}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => onPageChange(meta.totalPaginas)}
                    disabled={meta.page === meta.totalPaginas}
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

export default RepObrasPage;
