export interface Area {
  id_area: number;
  nombre: string;
}

export interface Cargo {
  idcargo?: number;
  nombre: string;
}

export interface Usuario {
  id_usuarios?: number;
  usuario?: string;
  nombre: string;
  ap_paterno?: string;
  ap_materno?: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  funcion?: string;
  area?: Area;
  cargo?: Cargo;
  clave?: string;
  fechaCreacion?: string;
}

const API_URL = "http://localhost:3001";

export const usuariosService = {
  obtenerUsuarios: async (): Promise<Usuario[]> => {
    const res = await fetch(`${API_URL}/usuarios`);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
  },

  obtenerAreas: async (): Promise<Area[]> => {
    const res = await fetch(`${API_URL}/areas`);
    if (!res.ok) throw new Error("Error al obtener áreas");
    return res.json();
  },

  crearUsuario: async (usuario: Usuario): Promise<Usuario> => {
    const payload = {
      ...usuario,
      area: usuario.area ? { id_area: usuario.area.id_area } : null,
      cargo: usuario.cargo?.nombre || null,
    };

    const res = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al crear usuario");
    return res.json();
  },

  actualizarUsuario: async (id: number, usuario: Usuario): Promise<Usuario> => {
    const payload = {
      ...usuario,
      area: usuario.area ? { id_area: usuario.area.id_area } : null,
      cargo: usuario.cargo?.nombre || null,
    };

    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al actualizar usuario");
    return res.json();
  },

  cambiarEstadoUsuario: async (id: number, estado: string): Promise<void> => {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });

    if (!res.ok) throw new Error("Error al cambiar estado");
  },

  eliminarUsuario: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar usuario");
  },
};
