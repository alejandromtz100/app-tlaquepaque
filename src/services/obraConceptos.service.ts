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
  // Convertir snake_case a camelCase para el DTO del backend
  const dto = {
    obraId: data.obra_id,
    conceptoId: data.concepto_id,
    descripcion_costo: data.descripcion_costo,
    medicion: data.medicion,
    costo_unitario: data.costo_unitario,
    cantidad: data.cantidad,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al agregar concepto');
  }

  return res.json();
};

export const updateConceptoObra = async (
  id: number,
  data: {
    conceptoId?: number;
    costo_unitario: number;
    cantidad: number;
    descripcion_costo?: string;
  },
) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar concepto');
  }
  return res.json();
};

export const deleteConceptoObra = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Error al eliminar concepto');
};
