import { useEffect, useState, useRef } from "react";
import type { RepLicenciasFilters } from "./types";

interface Props {
  onChange: (filters: Partial<RepLicenciasFilters>) => void;
}

const RepLicenciasFiltersForm: React.FC<Props> = ({ onChange }) => {
  const [filters, setFilters] = useState<Partial<RepLicenciasFilters>>({});
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onChange(filters);
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="grid grid-cols-6 gap-3">
      {/* Consecutivo */}
      <input
        className="border px-2 py-1 rounded text-sm"
        placeholder="Consecutivo"
        value={filters.consecutivo ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            consecutivo: e.target.value || undefined,
          }))
        }
      />

      {/* Nombre Concepto */}
      <input
        className="border px-2 py-1 rounded text-sm"
        placeholder="Nombre concepto"
        value={filters.nombreConcepto ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            nombreConcepto: e.target.value || undefined,
          }))
        }
      />

      {/* Tipo Licencia */}
      <input
        className="border px-2 py-1 rounded text-sm"
        placeholder="Tipo licencia"
        value={filters.tipoLicencia ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            tipoLicencia: e.target.value || undefined,
          }))
        }
      />

      {/* Clasificación */}
      <input
        className="border px-2 py-1 rounded text-sm"
        placeholder="Clasificación"
        value={filters.clasificacion ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            clasificacion: e.target.value || undefined,
          }))
        }
      />

      {/* Fecha Inicio - Requerido */}
      <div>
        <input
          type="date"
          required
          className="border px-2 py-1 rounded text-sm w-full border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={filters.fechaInicio ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              fechaInicio: e.target.value || undefined,
            }))
          }
        />
        <label className="text-xs text-gray-500 mt-1 block">Fecha Inicio *</label>
      </div>

      {/* Fecha Fin - Requerido */}
      <div>
        <input
          type="date"
          required
          className="border px-2 py-1 rounded text-sm w-full border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={filters.fechaFin ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              fechaFin: e.target.value || undefined,
            }))
          }
        />
        <label className="text-xs text-gray-500 mt-1 block">Fecha Fin *</label>
      </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        <span className="text-red-500">*</span> Campos requeridos: Fecha Inicio y Fecha Fin
      </p>
    </div>
  );
};

export default RepLicenciasFiltersForm;
