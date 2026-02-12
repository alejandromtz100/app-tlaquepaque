import React, { useState } from "react";
import type { RepObra, RepObrasMeta } from "./types";
import RepObraDetalleModal from "./RepObraDetalleModal";

interface Props {
  data: RepObra[];
  meta: RepObrasMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const RepObrasTabla: React.FC<Props> = ({
  data,
  meta,
  loading,
  onPageChange,
}) => {
  const [detalleObraId, setDetalleObraId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center">
        Cargando obras...
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Consecutivo</th>
              <th className="px-4 py-2">Propietario</th>
              <th className="px-4 py-2">Colonia</th>
              <th className="px-4 py-2">Estado obra</th>
              <th className="px-4 py-2">Estado pago</th>
              <th className="px-4 py-2">Fecha captura</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {data.map((obra) => (
              <tr key={obra.idObra} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{obra.consecutivo}</td>
                <td className="px-4 py-2">{obra.nombrePropietario}</td>
                <td className="px-4 py-2">{obra.nombreColoniaObra}</td>
                <td className="px-4 py-2">{obra.estadoObra}</td>
                <td className="px-4 py-2">{obra.estadoPago}</td>
                <td className="px-4 py-2">
                  {new Date(obra.fechaCaptura).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {obra.totalCostoConceptos
                    ? new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(Number(obra.totalCostoConceptos))
                    : "$0.00"}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => setDetalleObraId(obra.idObra)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {meta && (
          <div className="flex justify-between items-center px-4 py-3 border-t">
            <span className="text-sm text-gray-600">
              Página {meta.page} de {meta.totalPaginas}
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => {
                  const nuevaPagina = Number(meta.page) - 1;
                  if (nuevaPagina >= 1) onPageChange(nuevaPagina);
                }}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                disabled={meta.page >= meta.totalPaginas || meta.totalPaginas === 0}
                onClick={() => {
                  const nuevaPagina = Number(meta.page) + 1;
                  if (meta.totalPaginas > 0 && nuevaPagina <= meta.totalPaginas) {
                    onPageChange(nuevaPagina);
                  }
                }}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {detalleObraId != null && (
        <RepObraDetalleModal
          obraId={detalleObraId}
          onClose={() => setDetalleObraId(null)}
        />
      )}
    </>
  );
};

export default RepObrasTabla;
