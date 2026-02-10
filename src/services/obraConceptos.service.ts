// src/services/obraConceptos.service.ts
const API_URL = 'http://localhost:3001/obra-conceptos';

export const getConceptosByObra = async (obraId: number) => {
  const res = await fetch(`${API_URL}/obra/${obraId}`);
  if (!res.ok) throw new Error('Error al obtener conceptos de la obra');
  return res.json();
};

export const addConceptoToObra = async (data: {
  obra_id: number;
  concepto_id: number;
  descripcion_costo?: string;
  medicion?: string;
  costo_unitario: number;
  cantidad: number;
}) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al agregar concepto');
  }

  return res.json();
};

export const deleteConceptoObra = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Error al eliminar concepto');
};
