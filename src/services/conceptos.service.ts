// src/services/conceptos.service.ts
import type { Concepto } from "../types/concepto";

const API_URL = "http://localhost:3001/conceptos";

// 🌳 Árbol completo
export const getConceptosArbol = async (): Promise<Concepto[]> => {
  const res = await fetch(`${API_URL}/arbol`);
  if (!res.ok) throw new Error("Error al obtener árbol de conceptos");
  return res.json();
};

// 📋 Todos (admin / debug)
export const getConceptos = async (): Promise<Concepto[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener conceptos");
  return res.json();
};

// ➕ Crear concepto
export const createConcepto = async (
  data: Omit<
    Concepto,
    "id" | "children" | "nivel"
  >
): Promise<Concepto> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear concepto");
  return res.json();
};

// ✏️ Actualizar concepto
export const updateConcepto = async (
  id: number,
  data: Partial<Concepto>
): Promise<Concepto> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al actualizar concepto");
  return res.json();
};

// ❌ Eliminar concepto
export const deleteConcepto = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error al eliminar concepto");
};
