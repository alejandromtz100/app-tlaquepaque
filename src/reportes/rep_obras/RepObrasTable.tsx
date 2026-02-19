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
      <table className="min-w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Consecutivo</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Propietario</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Colonia</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado obra</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado pago</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Fecha captura</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Total</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[140px]">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-10 text-center text-slate-500 bg-slate-50/50">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium text-slate-600">No hay resultados</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((obra) => (
              <tr key={obra.idObra} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 text-slate-800 font-medium align-top whitespace-nowrap">{obra.consecutivo}</td>
                <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{obra.nombrePropietario}</td>
                <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{obra.nombreColoniaObra}</td>
                <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{obra.estadoObra}</td>
                <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{obra.estadoPago}</td>
                <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap">
                  {new Date(obra.fechaCaptura).toLocaleDateString("es-MX")}
                </td>
                <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap">
                  {obra.totalCostoConceptos
                    ? new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(Number(obra.totalCostoConceptos))
                    : "$0.00"}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setDetalleObraId(obra.idObra)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Ver detalle
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
