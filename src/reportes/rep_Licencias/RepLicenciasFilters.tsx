import { useEffect, useState, useRef } from "react";
import type { RepLicenciasFilters, RepLicenciasMeta } from "./types";

interface Props {
  onChange: (filters: Partial<RepLicenciasFilters>) => void;
  onExport: () => void;
  filters: RepLicenciasFilters;
  meta: RepLicenciasMeta | null;
}

const RepLicenciasFiltersForm: React.FC<Props> = ({ onChange, onExport, filters, meta }) => {
  const [localFilters, setLocalFilters] = useState<Partial<RepLicenciasFilters>>({});
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onChange({ ...filters, ...localFilters });
    }, 400);

    return () => clearTimeout(timeout);
  }, [localFilters]);

  const limpiarFiltros = () => {
    const filtrosLimpios = {
      ...filters,
      consecutivo: undefined,
      nombreConcepto: undefined,
      tipoLicencia: undefined,
      clasificacion: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
      page: 1,
    };
    setLocalFilters({});
    onChange(filtrosLimpios);
  };

  const totalRegistros = meta?.totalRegistros ?? 0;
  const puedeExportar = filters.fechaInicio && filters.fechaFin;

  return (
    <div>
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
            onClick={onExport}
            disabled={!puedeExportar}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar a Excel{totalRegistros > 0 ? ` (${totalRegistros} registros)` : ""}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Consecutivo</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            placeholder="Buscar consecutivo..."
            value={localFilters.consecutivo ?? filters.consecutivo ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                consecutivo: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre concepto</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            placeholder="Buscar concepto..."
            value={localFilters.nombreConcepto ?? filters.nombreConcepto ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                nombreConcepto: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo licencia</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            placeholder="Buscar tipo..."
            value={localFilters.tipoLicencia ?? filters.tipoLicencia ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                tipoLicencia: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            placeholder="Buscar clasificación..."
            value={localFilters.clasificacion ?? filters.clasificacion ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                clasificacion: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            value={localFilters.fechaInicio ?? filters.fechaInicio ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                fechaInicio: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            value={localFilters.fechaFin ?? filters.fechaFin ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                fechaFin: e.target.value || undefined,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          <span className="text-red-500">*</span> Campos requeridos: Fecha Inicio y Fecha Fin
        </p>
        {puedeExportar && meta && (
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{meta.totalRegistros}</span> registros
          </div>
        )}
      </div>
    </div>
  );
};

export default RepLicenciasFiltersForm;
