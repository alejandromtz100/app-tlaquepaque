import React, { useState } from "react";
import type { RepObra, RepObrasMeta } from "./types";
import RepObraDetalleModal from "./RepObraDetalleModal";

interface Props {
  data: RepObra[];
  meta: RepObrasMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const RepObrasTabla: React.FC<Props> = ({ data, loading }) => {
  const [detalleObraId, setDetalleObraId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando obras...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-w-full inline-block align-middle">
        <table className="min-w-full text-xs border-collapse bg-white">
          <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
            <tr className="text-gray-700 uppercase">
              <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Consecutivo</th>
              <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Propietario</th>
              <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Colonia</th>
              <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado obra</th>
              <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado pago</th>
              <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Fecha captura</th>
              <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Total</th>
              <th className="px-4 py-3 text-center border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((obra) => (
              <tr key={obra.idObra} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200">
                <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">{obra.consecutivo}</td>
                <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.nombrePropietario}</td>
                <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.nombreColoniaObra}</td>
                <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.estadoObra}</td>
                <td className="px-4 py-3 border border-gray-300 text-gray-700">{obra.estadoPago}</td>
                <td className="px-4 py-3 border border-gray-300 text-gray-700">
                  {new Date(obra.fechaCaptura).toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-gray-700">
                  {obra.totalCostoConceptos
                    ? new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(Number(obra.totalCostoConceptos))
                    : "$0.00"}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-center">
                  <button
                    type="button"
                    onClick={() => setDetalleObraId(obra.idObra)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-base font-medium">No hay resultados</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
