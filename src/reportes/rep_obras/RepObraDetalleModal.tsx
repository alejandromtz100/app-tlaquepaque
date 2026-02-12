import React, { useEffect, useState } from "react";
import { getDetalleObra } from "../../services/repObras.service";
import type { RepObraDetalle } from "./types";

interface Props {
  obraId: number;
  onClose: () => void;
}

const formatDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("es-MX") : "—";

const formatMoney = (n: number | string | null | undefined) =>
  n != null
    ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(n))
    : "—";

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex gap-2 py-1 text-sm">
    <span className="text-gray-500 min-w-[180px]">{label}:</span>
    <span className="text-gray-800">{value ?? "—"}</span>
  </div>
);

export default function RepObraDetalleModal({ obraId, onClose }: Props) {
  const [obra, setObra] = useState<RepObraDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDetalleObra(obraId)
      .then((obraRes) => {
        if (cancelled) return;
        setObra(obraRes ?? null);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Error al cargar detalle");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [obraId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4">
          <p className="text-gray-600 text-center">Cargando detalle de la obra...</p>
        </div>
      </div>
    );
  }

  if (error || !obra) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <p className="text-red-600 mb-4">{error ?? "Obra no encontrada"}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Detalle de la obra · {obra.consecutivo}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Datos generales */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Datos generales
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-0">
              <Row label="Consecutivo" value={obra.consecutivo} />
              <Row label="Fecha captura" value={formatDate(obra.fechaCaptura)} />
              <Row label="Estado obra" value={obra.estadoObra} />
              <Row label="Estado pago" value={obra.estadoPago} />
              <Row label="Vigencia" value={obra.vigencia} />
              <Row label="Folio bitácora" value={obra.bitacora} />
              <Row label="Fecha verificación" value={formatDate(obra.fechaVerificacion)} />
              <Row label="Verificación" value={obra.verificacion} />
            </div>
          </section>

          {/* Propietario */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Propietario
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-0">
              <Row label="Tipo" value={obra.tipoPropietario} />
              <Row label="Nombre" value={obra.nombrePropietario} />
              <Row label="Representante legal" value={obra.representanteLegal} />
              <Row label="Domicilio" value={obra.domicilioPropietario} />
              <Row label="Colonia" value={obra.coloniaPropietario} />
              <Row label="Municipio" value={obra.municipioPropietario} />
              <Row label="Entidad" value={obra.entidadPropietario} />
              <Row label="Teléfono" value={obra.telefonoPropietario} />
              <Row label="RFC" value={obra.rfcPropietario} />
              <Row label="Código postal" value={obra.codigoPostalPropietario} />
              <Row label="Correo" value={obra.correoPropietario} />
              <Row label="Ocupación" value={obra.ocupacionPropietario} />
            </div>
          </section>

          {/* Ubicación de la obra */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Ubicación de la obra
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-0">
              <Row label="Colonia obra" value={obra.nombreColoniaObra} />
              <Row label="Densidad" value={obra.idDensidadColoniaObra} />
              <Row label="Manzana" value={obra.manzanaObra} />
              <Row label="Lote" value={obra.loteObra} />
              <Row label="Etapa" value={obra.etapaObra} />
              <Row label="Condominio" value={obra.condominioObra} />
              <Row label="Entre calle 1" value={obra.entreCalle1Obra} />
              <Row label="Entre calle 2" value={obra.entreCalle2Obra} />
              <Row label="Destino actual" value={obra.destinoActual} />
              <Row label="Destino propuesto" value={obra.destinoPropuesto} />
            </div>
          </section>

          {/* Servicios */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Servicios
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <Row label="Agua potable" value={obra.aguaPotable} />
              <Row label="Drenaje" value={obra.drenaje} />
              <Row label="Electricidad" value={obra.electricidad} />
              <Row label="Alumbrado público" value={obra.alumbradoPublico} />
              <Row label="Machuelos" value={obra.machuelos} />
              <Row label="Banquetas" value={obra.banquetas} />
              <Row label="Pavimento" value={obra.pavimento} />
            </div>
          </section>

          {/* Proyecto */}
          {(obra.descripcionProyecto || obra.informacionAdicional) && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                Proyecto
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                {obra.descripcionProyecto && (
                  <div>
                    <span className="text-gray-500 block mb-1">Descripción:</span>
                    <p className="text-gray-800 whitespace-pre-wrap">{obra.descripcionProyecto}</p>
                  </div>
                )}
                {obra.informacionAdicional && (
                  <div>
                    <span className="text-gray-500 block mb-1">Información adicional:</span>
                    <p className="text-gray-800 whitespace-pre-wrap">{obra.informacionAdicional}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Pago */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Pago
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-0">
              <Row label="Total costo conceptos" value={formatMoney(obra.totalCostoConceptos)} />
              <Row label="Fecha pago" value={formatDate(obra.fechaPago)} />
              <Row label="Recibo" value={obra.reciboDePago} />
              <Row label="Folio forma" value={obra.folioDeLaForma} />
            </div>
          </section>
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
