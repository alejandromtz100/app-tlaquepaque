import { useEffect, useState, useRef } from "react";
import type { RepObrasFilters } from "./types";

interface Props {
  onChange: (filters: Partial<RepObrasFilters>) => void;
}

const RepObrasFiltersForm: React.FC<Props> = ({ onChange }) => {
  const [filters, setFilters] = useState<Partial<RepObrasFilters>>({});
  const isFirstRender = useRef(true);

  useEffect(() => {
    // ⛔ Evitar ejecución inicial
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onChange(filters);
    }, 400); // Debounce

    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="bg-white rounded-xl shadow p-4 grid grid-cols-6 gap-3">
      {/* Nombre Propietario */}
      <input
        className="border px-2 py-1 rounded"
        placeholder="Nombre del propietario"
        value={filters.nombrePropietario ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            nombrePropietario: e.target.value || undefined,
          }))
        }
      />

      {/* Consecutivo */}
      <input
        className="border px-2 py-1 rounded"
        placeholder="Consecutivo"
        value={filters.consecutivo ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            consecutivo: e.target.value || undefined,
          }))
        }
      />

      {/* Estado Obra */}
      <select
        value={filters.estadoObra ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            estadoObra: e.target.value || undefined,
          }))
        }
      >
        <option value="">Estado obra</option>
        <option value="En Proceso">En Proceso</option>
        <option value="Enviado a Pago">Enviado a Pago</option>
        <option value="Concluido">Concluido</option>
        <option value="Verificado">Verificado</option>
      </select>

      {/* Estado Pago */}
      <select
        value={filters.estadoPago ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            estadoPago: e.target.value || undefined,
          }))
        }
      >
        <option value="">Estado pago</option>
        <option value="Pagado">Pagado</option>
        <option value="Sin Pagar">Sin Pagar</option>
      </select>

      {/* Fecha Inicio */}
      <input
        type="date"
        className="border px-2 py-1 rounded"
        value={ filters.fechaInicio ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            fechaInicio: e.target.value || undefined,
          }))
        }
      />

      {/* Fecha Fin */}
      <input
        type="date"
        className="border px-2 py-1 rounded"
        value={filters.fechaFin ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            fechaFin: e.target.value || undefined,
          }))
        }
      />
    </div>
  );
};

export default RepObrasFiltersForm;
