import React from "react";
import type { RepLicencia, RepLicenciasMeta } from "./types";

interface Props {
  data: RepLicencia[];
  meta: RepLicenciasMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const RepLicenciasTabla: React.FC<Props> = ({
  data,
  meta,
  loading,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando licencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-full inline-block align-middle">
      <table className="min-w-full text-xs border-collapse bg-white">
        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
          <tr className="text-gray-700 uppercase">
            <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Consecutivo</th>
            <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Fecha Captura</th>
            <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Nombre Concepto</th>
            <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Tipo Licencia</th>
            <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Clasificación</th>
            <th className="px-4 py-3 text-right border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Cantidad</th>
            <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Medición</th>
            <th className="px-4 py-3 text-right border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Costo</th>
            <th className="px-4 py-3 text-right border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Total</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {data.map((licencia) => (
            <tr key={licencia.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200">
              <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">{licencia.consecutivo}</td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700">
                {new Date(licencia.fechaCaptura).toLocaleDateString("es-MX")}
              </td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700">{licencia.nombreConcepto}</td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700">{licencia.tipoLicencia || "—"}</td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700">{licencia.clasificacion || "—"}</td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700 text-right">
                {Number(licencia.cantidad).toFixed(2)}
              </td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700">{licencia.medicionConcepto || "—"}</td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700 text-right">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(licencia.costoConcepto))}
              </td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700 text-right font-semibold">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(licencia.total))}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
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
  );
};

export default RepLicenciasTabla;
