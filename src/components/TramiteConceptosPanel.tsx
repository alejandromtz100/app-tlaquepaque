import { useEffect, useState } from "react";
import {
  getConceptosByTramite,
  removeConceptoFromTramite,
} from "../services/tramitesConceptos.service";

interface Props {
  tramite: {
    id: number;
    nombre: string;
  };
}

export default function TramiteConceptosPanel({ tramite }: Props) {
  const [conceptos, setConceptos] = useState<any[]>([]);

  const cargar = async () => {
    const data = await getConceptosByTramite(tramite.id);
    setConceptos(data);
  };

  useEffect(() => {
    cargar();
  }, [tramite.id]);

  const quitar = async (id: number) => {
    if (!confirm("¿Quitar concepto del trámite?")) return;
    await removeConceptoFromTramite(id);
    cargar();
  };

  

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">
        Conceptos asignados
      </h3>

      {conceptos.length === 0 && (
        <p className="text-gray-500 text-sm">
          No hay conceptos asignados
        </p>
      )}

      {conceptos.map((tc) => (
        <div
          key={tc.id}
          className="border rounded-xl p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{tc.concepto.nombre}</p>
            <p className="text-xs text-gray-500">
              Medición: {tc.concepto.medicion || "-"} · $
              {tc.concepto.costo || 0}
            </p>
          </div>

          <button
            onClick={() => quitar(tc.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Quitar
          </button>
        </div>
      ))}

      {/* Luego aquí metemos el formulario para agregar */}
    </div>
  );
}
