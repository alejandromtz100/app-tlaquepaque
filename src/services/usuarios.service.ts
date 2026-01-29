/* ======================
   INTERFACES
====================== */
export interface Area {
  id_area: number;
  nombre: string;
}

export interface Cargo {
  idcargo?: number;
  nombre: string;
}

export interface FuncionUsuario {
  id_funcion: number;
  nombre: string;
}

export interface Usuario {
  id_usuarios?: number;
  nombre: string;
  ap_paterno?: string;
  ap_materno?: string;
  telefono?: string;
  usuario?: string;
  clave?: string;
  rol?: string;
  estado?: string;
  area?: Area;
  cargo?: Cargo;
  funcionEspecial?: FuncionUsuario;
  fechaCreacion?: string;
}

/* ======================
   USUARIOS SERVICE
====================== */
class UsuariosService {
  private baseUrl = "http://localhost:3001";

  // Obtener todos los usuarios
  async obtenerUsuarios(): Promise<Usuario[]> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  // Obtener todas las áreas
  async obtenerAreas(): Promise<Area[]> {
    try {
      const response = await fetch(`${this.baseUrl}/areas`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al obtener áreas:", error);
      throw error;
    }
  }

  // Obtener todas las funciones
  async obtenerFunciones(): Promise<FuncionUsuario[]> {
    try {
      const response = await fetch(`${this.baseUrl}/asignaciones/funciones`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al obtener funciones:", error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  async crearUsuario(usuario: Usuario): Promise<any> {
    try {
      const payload = this.prepararPayloadUsuario(usuario);
      
      const response = await fetch(`${this.baseUrl}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || "Error desconocido"}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  }

  // Actualizar un usuario existente
  async actualizarUsuario(id: number, usuario: Usuario): Promise<any> {
    try {
      const payload = this.prepararPayloadUsuario(usuario);
      
      const response = await fetch(`${this.baseUrl}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || "Error desconocido"}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  }

  // Eliminar un usuario
  async eliminarUsuario(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  }

  // Cambiar estado de usuario
  async cambiarEstadoUsuario(id: number, estado: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ estado })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      throw error;
    }
  }

  // Preparar payload para enviar al servidor
  private prepararPayloadUsuario(usuario: Usuario): any {
    const payload: any = {
      nombre: String(usuario.nombre || "").trim(),
      ap_paterno: String(usuario.ap_paterno || ""),
      ap_materno: String(usuario.ap_materno || ""),
      telefono: String(usuario.telefono || ""),
      usuario: String(usuario.usuario || "").trim(),
      rol: usuario.rol || "USUARIO",
      estado: usuario.estado || "Activo",
      cargo: usuario.cargo?.nombre || ""
    };

    // Solo incluir clave si está definida y no está vacía
    if (usuario.clave && usuario.clave.trim()) {
      payload.clave = usuario.clave;
    }

    // Incluir área si existe
    if (usuario.area?.id_area) {
      payload.area = { id_area: usuario.area.id_area };
    }

    // Incluir función especial si existe
    if (usuario.funcionEspecial?.id_funcion) {
      payload.funcionEspecial = { id_funcion: usuario.funcionEspecial.id_funcion };
    }

    return payload;
  }

  // Obtener todos los datos iniciales (usuarios, áreas, funciones)
  async obtenerTodosLosDatos(): Promise<{
    usuarios: Usuario[];
    areas: Area[];
    funciones: FuncionUsuario[];
  }> {
    try {
      const [usuarios, areas, funciones] = await Promise.all([
        this.obtenerUsuarios(),
        this.obtenerAreas(),
        this.obtenerFunciones()
      ]);

      return { usuarios, areas, funciones };
    } catch (error) {
      console.error("Error al cargar todos los datos:", error);
      throw error;
    }
  }
}

export default new UsuariosService();