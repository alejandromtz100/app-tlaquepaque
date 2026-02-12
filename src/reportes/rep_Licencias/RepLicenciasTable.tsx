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
      <div className="bg-white rounded-xl shadow p-6 text-center">
        Cargando licencias...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Consecutivo</th>
            <th className="px-4 py-2">Fecha Captura</th>
            <th className="px-4 py-2">Nombre Concepto</th>
            <th className="px-4 py-2">Tipo Licencia</th>
            <th className="px-4 py-2">Clasificación</th>
            <th className="px-4 py-2 text-right">Cantidad</th>
            <th className="px-4 py-2">Medición</th>
            <th className="px-4 py-2 text-right">Costo</th>
            <th className="px-4 py-2 text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {data.map((licencia) => (
            <tr key={licencia.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{licencia.consecutivo}</td>
              <td className="px-4 py-2">
                {new Date(licencia.fechaCaptura).toLocaleDateString("es-MX")}
              </td>
              <td className="px-4 py-2">{licencia.nombreConcepto}</td>
              <td className="px-4 py-2">{licencia.tipoLicencia || "—"}</td>
              <td className="px-4 py-2">{licencia.clasificacion || "—"}</td>
              <td className="px-4 py-2 text-right">
                {Number(licencia.cantidad).toFixed(2)}
              </td>
              <td className="px-4 py-2">{licencia.medicionConcepto || "—"}</td>
              <td className="px-4 py-2 text-right">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(licencia.costoConcepto))}
              </td>
              <td className="px-4 py-2 text-right font-semibold">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(licencia.total))}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-6 text-gray-500">
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
  );
};

export default RepLicenciasTabla;
