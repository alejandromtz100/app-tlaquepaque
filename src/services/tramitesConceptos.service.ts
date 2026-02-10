const API_URL = "http://localhost:3001/tramites-conceptos";

/* ================================
   Tipos
================================ */

export interface TramiteConcepto {
  id: number;
  estado: boolean;
  created_at: string;
  concepto: {
    id: number;
    nombre: string;
    nivel: number;
    medicion?: string;
    costo?: number;
  };
}

/* ================================
   Obtener conceptos por trámite
================================ */

export const getConceptosByTramite = async (
  tramiteId: number
): Promise<TramiteConcepto[]> => {
  const res = await fetch(`${API_URL}/tramite/${tramiteId}`);

  if (!res.ok) {
    throw new Error("Error al obtener conceptos del trámite");
  }

  return res.json();
};

/* ================================
   Agregar concepto a trámite
================================ */

export const addConceptoToTramite = async (data: {
  tramite_id: number;
  concepto_id: number;
  estado?: boolean;
}): Promise<TramiteConcepto> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al agregar concepto al trámite");
  }

  return res.json();
};

/* ================================
   Quitar concepto de trámite
================================ */

export const removeConceptoFromTramite = async (
  tramiteConceptoId: number
): Promise<void> => {
  const res = await fetch(`${API_URL}/${tramiteConceptoId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al quitar concepto del trámite");
  }
};
