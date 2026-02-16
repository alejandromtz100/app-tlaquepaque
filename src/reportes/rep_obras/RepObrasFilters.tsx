import { useEffect, useState, useRef } from "react";
import type { RepObrasFilters, RepObrasMeta } from "./types";

interface Props {
  onChange: (filters: Partial<RepObrasFilters>) => void;
  onExport: () => void;
  filters: RepObrasFilters;
  meta: RepObrasMeta | null;
}

const RepObrasFiltersForm: React.FC<Props> = ({ onChange, onExport, filters, meta }) => {
  const [localFilters, setLocalFilters] = useState<Partial<RepObrasFilters>>({});
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
      nombrePropietario: undefined,
      consecutivo: undefined,
      estadoObra: undefined,
      estadoPago: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
      page: 1,
    };
    setLocalFilters({});
    onChange(filtrosLimpios);
  };

  const totalRegistros = meta?.totalRegistros ?? 0;

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre propietario</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            placeholder="Buscar propietario..."
            value={localFilters.nombrePropietario ?? filters.nombrePropietario ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                nombrePropietario: e.target.value || undefined,
              }))
            }
          />
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado obra</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            value={localFilters.estadoObra ?? filters.estadoObra ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                estadoObra: e.target.value || undefined,
              }))
            }
          >
            <option value="">Todos</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Enviado a Pago">Enviado a Pago</option>
            <option value="Concluido">Concluido</option>
            <option value="Verificado">Verificado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado pago</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            value={localFilters.estadoPago ?? filters.estadoPago ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                estadoPago: e.target.value || undefined,
              }))
            }
          >
            <option value="">Todos</option>
            <option value="Pagado">Pagado</option>
            <option value="Sin Pagar">Sin Pagar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input
            type="date"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            type="date"
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

      {meta && meta.totalRegistros > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Mostrando <span className="font-semibold">{meta.totalRegistros}</span> registros
        </div>
      )}
    </div>
  );
};

export default RepObrasFiltersForm;
