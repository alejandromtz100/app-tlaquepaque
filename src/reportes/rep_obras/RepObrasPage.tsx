import { useEffect, useState } from "react";
import { getReporteObras } from "../../services/repObras.service";
import type { RepObra, RepObrasFilters, RepObrasMeta } from "./types";
import RepObrasFiltersForm from "./RepObrasFilters";
import RepObrasTable from "./RepObrasTable";
import Menu from "../../layout/menu"; // tu menu existente

const RepObrasPage: React.FC = () => {
  const [filters, setFilters] = useState<RepObrasFilters>({
    page: 1,
    limit: 20,
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
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sistema de Control de la Edificación ALCH</h1>
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
        <RepObrasFiltersForm onChange={onFilterChange} />
        <RepObrasTable
          data={data}
          loading={loading}
          meta={meta}
          onPageChange={onPageChange}
        />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default RepObrasPage;
