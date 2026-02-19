import React from "react";
import type { RepLicencia, RepLicenciasMeta } from "./types";

interface Props {
  data: RepLicencia[];
  meta: RepLicenciasMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const RepLicenciasTabla: React.FC<Props> = ({ data, loading }) => {
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
    <table className="min-w-full border-collapse bg-white text-sm">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Consecutivo</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Fecha Captura</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre Concepto</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo Licencia</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Clasificación</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Cantidad</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Medición</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Costo</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.length === 0 ? (
          <tr>
            <td colSpan={9} className="px-3 py-10 text-center text-slate-500 bg-slate-50/50">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium text-slate-600">No hay resultados</p>
              </div>
            </td>
          </tr>
        ) : (
          data.map((licencia) => (
            <tr key={licencia.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
              <td className="px-3 py-2 text-slate-800 font-medium align-top whitespace-nowrap">{licencia.consecutivo}</td>
              <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap">
                {new Date(licencia.fechaCaptura).toLocaleDateString("es-MX")}
              </td>
              <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{licencia.nombreConcepto}</td>
              <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{licencia.tipoLicencia || "—"}</td>
              <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{licencia.clasificacion || "—"}</td>
              <td className="px-3 py-2 text-slate-700 text-right align-top whitespace-nowrap">
                {Number(licencia.cantidad).toFixed(2)}
              </td>
              <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{licencia.medicionConcepto || "—"}</td>
              <td className="px-3 py-2 text-slate-700 text-right align-top whitespace-nowrap">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(licencia.costoConcepto))}
              </td>
              <td className="px-3 py-2 text-slate-700 text-right font-semibold align-top whitespace-nowrap">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(licencia.total))}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default RepLicenciasTabla;
