const API_URL = "http://localhost:3001/colonias";

export interface Colonia {
  id_colonia: number;
  nombre: string;
  densidad: string;
}

export const getColonias = async (): Promise<Colonia[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener colonias");
  return res.json();
};

export const createColonia = async (data: Omit<Colonia, "id_colonia">) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear colonia");
  return res.json();
};

export const updateColonia = async (
  id: number,
  data: Omit<Colonia, "id_colonia">
) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar colonia");
  return res.json();
};

export const deleteColonia = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar colonia");
};