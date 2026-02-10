import { useEffect, useState } from "react";
import {
  getConceptosByTramite,
  removeConceptoFromTramite,
  addConceptoToTramite,
  type TramiteConcepto,
} from "../services/tramitesConceptos.service";
import { getConceptos } from "../services/conceptos.service";
import type { Concepto } from "../types/concepto";

interface Props {
  tramite: {
    id: number;
    nombre: string;
  };
}

export default function TramiteConceptosPanel({ tramite }: Props) {
  const [conceptos, setConceptos] = useState<TramiteConcepto[]>([]);
  const [allConceptos, setAllConceptos] = useState<Concepto[]>([]);
  const [loading, setLoading] = useState(false);

  // niveles 1 a 4
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<
    (number | "")[]
  >([""]);

  /* ======================
     CARGAS
  ====================== */

  const cargar = async () => {
    const data = await getConceptosByTramite(tramite.id);
    setConceptos(data);
  };

  const cargarConceptosDisponibles = async () => {
    const data = await getConceptos();
    setAllConceptos(data);
  };

  useEffect(() => {
    cargar();
    cargarConceptosDisponibles();
  }, [tramite.id]);

  /* ======================
     QUITAR
  ====================== */

  const quitar = async (id: number) => {
    if (!confirm("¿Quitar concepto del trámite?")) return;
    await removeConceptoFromTramite(id);
    cargar();
  };

  /* ======================
     HELPERS
  ====================== */

  const conceptosAsignadosIds = conceptos.map(
    (c) => c.concepto.id
  );

  const getConceptosPorNivel = (
    nivel: number,
    parentId: number | null
  ) =>
    allConceptos.filter(
      (c) =>
        c.nivel === nivel &&
        c.parent_id === parentId &&
        !conceptosAsignadosIds.includes(c.id)
    );

  const handleNivelChange = (index: number, value: number | "") => {
    const nuevos = [...nivelesSeleccionados];
    nuevos[index] = value;

    // limpiar niveles siguientes
    for (let i = index + 1; i < nuevos.length; i++) {
      nuevos[i] = "";
    }

    setNivelesSeleccionados(nuevos);
  };

  const conceptoFinalId = [...nivelesSeleccionados]
    .reverse()
    .find((v) => v !== "");

  /* ======================
     AGREGAR
  ====================== */

  const agregar = async () => {
    if (!conceptoFinalId) return;

    const concepto = allConceptos.find(
      (c) => c.id === conceptoFinalId
    );

    // ❌ no permitir nivel 1
    if (concepto?.nivel === 1) {
      alert("No se puede agregar un concepto de primer nivel");
      return;
    }

    setLoading(true);
    try {
      await addConceptoToTramite({
        tramite_id: tramite.id,
        concepto_id: Number(conceptoFinalId),
      });

      setNivelesSeleccionados([""]);
      cargar();
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     RENDER
  ====================== */

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-700">
        Conceptos del trámite:{" "}
        <span className="font-bold">{tramite.nombre}</span>
      </h3>

      {/* LISTA */}
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
              Nivel {tc.concepto.nivel} · Medición:{" "}
              {tc.concepto.medicion || "-"} · $
              {tc.concepto.costo ?? 0}
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

      {/* AGREGAR */}
      <div className="border-t pt-4 space-y-3">
        <p className="text-sm font-medium text-gray-600">
          Agregar concepto (hasta 4 niveles)
        </p>

        {[1, 2, 3, 4].map((nivel, index) => {
          const parentId =
            index === 0
              ? null
              : Number(nivelesSeleccionados[index - 1]) || null;

          const opciones = getConceptosPorNivel(
            nivel,
            parentId
          );

          if (nivel > 1 && !nivelesSeleccionados[index - 1])
            return null;
          if (opciones.length === 0) return null;

          return (
            <select
              key={nivel}
              value={nivelesSeleccionados[index]}
              onChange={(e) =>
                handleNivelChange(
                  index,
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="border rounded-xl px-3 py-2 w-full"
            >
              <option value="">
                Selecciona nivel {nivel}
              </option>
              {opciones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          );
        })}

        <button
          onClick={agregar}
          disabled={!conceptoFinalId || loading}
          className="bg-black text-white px-4 py-2 rounded-xl w-full disabled:opacity-40"
        >
          {loading ? "Agregando..." : "Agregar concepto"}
        </button>
      </div>
    </div>
  );
}
