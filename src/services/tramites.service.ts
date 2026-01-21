// src/services/tramites.service.ts

export interface Tramite {
  id: number;
  nombre: string;
  letra: string;
  estado?: boolean;
  created_at?: string;
}

const API_URL = "http://localhost:3001/tramites";

export const TramitesService = {
  async getAll(): Promise<Tramite[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener trámites");
    return res.json();
  },

  async create(
    data: Pick<Tramite, "nombre" | "letra">
  ): Promise<Tramite> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al crear trámite");
    return res.json();
  },

  async update(
    id: number,
    data: Partial<Pick<Tramite, "nombre" | "letra">>
  ): Promise<Tramite> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar trámite");
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar trámite");
  },

  async toggleEstado(id: number): Promise<Tramite> {
    const res = await fetch(`${API_URL}/${id}/estado`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Error al cambiar estado");
    return res.json();
  },
};
