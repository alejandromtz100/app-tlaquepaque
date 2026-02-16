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
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
            <RepObrasTable
              data={data}
              loading={loading}
              meta={meta}
              onPageChange={onPageChange}
            />
          </div>

          {/* PAGINACIÓN */}
          {meta && meta.totalPaginas > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Mostrando <span className="font-semibold text-gray-900">
                    {(meta.page - 1) * meta.limit + 1}
                  </span> - <span className="font-semibold text-gray-900">
                    {Math.min(meta.page * meta.limit, meta.totalRegistros)}
                  </span> de <span className="font-semibold text-gray-900">{meta.totalRegistros}</span> registros
                </div>

                {meta.totalPaginas > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={meta.page <= 1}
                      onClick={() => onPageChange(1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ««
                    </button>
                    <button
                      disabled={meta.page <= 1}
                      onClick={() => onPageChange(meta.page - 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      &lt;
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, meta.totalPaginas) }, (_, i) => {
                        let pageNum: number;
                        if (meta.totalPaginas <= 5) {
                          pageNum = i + 1;
                        } else if (meta.page <= 3) {
                          pageNum = i + 1;
                        } else if (meta.page >= meta.totalPaginas - 2) {
                          pageNum = meta.totalPaginas - 4 + i;
                        } else {
                          pageNum = meta.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              meta.page === pageNum
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
                      disabled={meta.page >= meta.totalPaginas}
                      onClick={() => onPageChange(meta.page + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      &gt;
                    </button>
                    <button
                      disabled={meta.page >= meta.totalPaginas}
                      onClick={() => onPageChange(meta.totalPaginas)}
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

export default RepObrasPage;
