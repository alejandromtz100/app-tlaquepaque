import React, { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import Menu from "../layout/menu";

/* ======================
   INTERFACES
====================== */
interface Area {
  id_area: number;
  nombre: string;
}

interface Cargo {
  idcargo?: number;
  nombre: string;
}

interface FuncionUsuario {
  id_funcion: number;
  nombre: string;
}

interface Usuario {
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

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [funciones, setFunciones] = useState<FuncionUsuario[]>([]);
  
  /* FILTROS Y BÚSQUEDA */
  const [search, setSearch] = useState("");
  const [filtroRol, setFiltroRol] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  
  /* PANEL LATERAL */
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  /* PAGINACIÓN */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  /* DATOS DEL USUARIO */
  const [nuevoUsuario, setNuevoUsuario] = useState<Usuario>({
    nombre: "",
    ap_paterno: "",
    ap_materno: "",
    telefono: "",
    usuario: "",
    clave: "",
    rol: "USUARIO",
    estado: "Activo",
    area: undefined,
    cargo: { nombre: "" },
    funcionEspecial: undefined,
  });

  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esAdmin = usuarioLogueado?.rol === "ADMIN";

  /* ======================
     CARGAR DATOS
  ====================== */
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filtroRol, filtroEstado]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resUsuarios, resAreas, resFunciones] = await Promise.all([
        fetch("http://localhost:3001/usuarios"),
        fetch("http://localhost:3001/areas"),
        fetch("http://localhost:3001/asignaciones/funciones"),
      ]);

      const dataUsuarios = await resUsuarios.json();
      const dataAreas = await resAreas.json();
      const dataFunciones = await resFunciones.json();

      setUsuarios(dataUsuarios);
      setAreas(dataAreas);
      setFunciones(dataFunciones);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     MANEJO DE FORMULARIO
  ====================== */
  const handleEditUsuario = (usuario: Usuario) => {
    setNuevoUsuario({
      nombre: usuario.nombre || "",
      ap_paterno: usuario.ap_paterno || "",
      ap_materno: usuario.ap_materno || "",
      telefono: usuario.telefono || "",
      usuario: usuario.usuario || "",
      clave: usuario.clave || "", // Aseguramos que sea string
      rol: usuario.rol || "USUARIO",
      estado: usuario.estado || "Activo",
      area: usuario.area,
      cargo: usuario.cargo || { nombre: "" },
      funcionEspecial: usuario.funcionEspecial,
    });
    setEditingId(usuario.id_usuarios || null);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSaveUsuario = async () => {
    // Validaciones
    const nombre = String(nuevoUsuario.nombre || "").trim();
    const usuario = String(nuevoUsuario.usuario || "").trim();
    const clave = String(nuevoUsuario.clave || "");

    if (!nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    if (!usuario) {
      alert("El nombre de usuario es obligatorio");
      return;
    }

    if (!isEditing && !clave.trim()) {
      alert("La clave es obligatoria para nuevos usuarios");
      return;
    }

    try {
      setLoading(true);
      
      // Preparar el payload
      const payload: any = {
        nombre: nombre,
        ap_paterno: String(nuevoUsuario.ap_paterno || ""),
        ap_materno: String(nuevoUsuario.ap_materno || ""),
        telefono: String(nuevoUsuario.telefono || ""),
        usuario: usuario,
        rol: nuevoUsuario.rol || "USUARIO",
        estado: nuevoUsuario.estado || "Activo",
        cargo: nuevoUsuario.cargo?.nombre || "",
      };

      // Solo incluir clave si está definida y no está vacía
      if (clave.trim()) {
        payload.clave = clave;
      }

      // Incluir área si existe
      if (nuevoUsuario.area?.id_area) {
        payload.area = { id_area: nuevoUsuario.area.id_area };
      }

      // Incluir función especial si existe
      if (nuevoUsuario.funcionEspecial?.id_funcion) {
        payload.funcionEspecial = { id_funcion: nuevoUsuario.funcionEspecial.id_funcion };
      }

      let url = "http://localhost:3001/usuarios";
      let method = "POST";

      if (isEditing && editingId !== null) {
        url = `http://localhost:3001/usuarios/${editingId}`;
        method = "PUT";
      }

      console.log("Enviando datos:", { url, method, payload });

      const response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Respuesta del servidor:", responseText);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText || "Error desconocido"}`);
      }

      // Verificar si la respuesta es JSON válido
      try {
        JSON.parse(responseText);
        console.log("Respuesta JSON válida");
      } catch {
        console.log("Respuesta no es JSON, pero fue exitosa");
      }

      // Recargar los datos
      await cargarDatos();
      setSuccess(true);

      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        setIsEditing(false);
        setEditingId(null);
        setNuevoUsuario({
          nombre: "",
          ap_paterno: "",
          ap_materno: "",
          telefono: "",
          usuario: "",
          clave: "",
          rol: "USUARIO",
          estado: "Activo",
          area: undefined,
          cargo: { nombre: "" },
          funcionEspecial: undefined,
        });
      }, 1200);
    } catch (error: any) {
      console.error("Error completo:", error);
      alert(`Error al guardar usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsuario = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    
    try {
      const response = await fetch(`http://localhost:3001/usuarios/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }
      
      await cargarDatos();
      alert("Usuario eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar usuario");
    }
  };

  const cambiarEstado = async (usuario: Usuario) => {
    const nuevoEstado = usuario.estado === "Activo" ? "Inactivo" : "Activo";
    const confirmacion = window.confirm(
      `¿Seguro que deseas ${nuevoEstado === "Activo" ? "activar" : "desactivar"} a ${usuario.nombre}?`
    );
    
    if (!confirmacion) return;
    
    try {
      const payload = {
        estado: nuevoEstado
      };
      
      const response = await fetch(`http://localhost:3001/usuarios/${usuario.id_usuarios}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al cambiar estado");
      }

      await cargarDatos();
      alert(`Estado de ${usuario.nombre} cambiado a ${nuevoEstado}`);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar estado");
    }
  };

  /* ======================
     FILTROS
  ====================== */
  const filteredUsuarios = usuarios.filter((u) => {
    const nombreCompleto = `${u.nombre} ${u.ap_paterno || ""} ${u.ap_materno || ""}`;
    const matchNombre = nombreCompleto
      .toLowerCase()
      .includes(search.toLowerCase());
    
    const matchRol = filtroRol === "TODOS" || u.rol === filtroRol;
    const matchEstado = filtroEstado === "TODOS" || u.estado === filtroEstado;
    
    return matchNombre && matchRol && matchEstado;
  });

  /* ======================
     PAGINACIÓN
  ====================== */
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(startIndex, endIndex);

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  /* ======================
     OBTENER ROLES Y ESTADOS ÚNICOS
  ====================== */
  const rolesUnicos = ["ADMIN", "SUPERVISOR", "USUARIO"];
  const estadosUnicos = ["Activo", "Inactivo"];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Sistema de Control de la Edificación ALCH
            </h1>
            <p className="text-sm text-gray-500">
              H. Ayuntamiento de Tlaquepaque
            </p>
          </div>

          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white transition">
            <FaSignOutAlt />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <Menu />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-6">
        {/* BUSCADOR + FILTROS */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-2 w-64"
          />

          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="border rounded-xl px-4 py-2"
          >
            <option value="TODOS">Todos los roles</option>
            {rolesUnicos.map(rol => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border rounded-xl px-4 py-2"
          >
            <option value="TODOS">Todos los estados</option>
            {estadosUnicos.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          {esAdmin && (
            <button
              onClick={() => {
                setShowForm(true);
                setIsEditing(false);
                setNuevoUsuario({
                  nombre: "",
                  ap_paterno: "",
                  ap_materno: "",
                  telefono: "",
                  usuario: "",
                  clave: "",
                  rol: "USUARIO",
                  estado: "Activo",
                  area: undefined,
                  cargo: { nombre: "" },
                  funcionEspecial: undefined,
                });
              }}
              className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
            >
              + Agregar usuario
            </button>
          )}
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Usuarios registrados
          </div>

          <div className="p-4 text-sm">
            {loading ? (
              <p className="text-center py-4">Cargando usuarios...</p>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-600">
                    Total de registros: {filteredUsuarios.length}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border px-3 py-2">ID</th>
                        <th className="border px-3 py-2">Nombre</th>
                        <th className="border px-3 py-2">Teléfono</th>
                        <th className="border px-3 py-2">Usuario</th>
                        <th className="border px-3 py-2">Rol</th>
                        <th className="border px-3 py-2">Estado</th>
                        <th className="border px-3 py-2">Área</th>
                        <th className="border px-3 py-2">Cargo</th>
                        <th className="border px-3 py-2">Función</th>
                        {esAdmin && <th className="border px-3 py-2 w-48">Opciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsuarios.length === 0 ? (
                        <tr>
                          <td colSpan={esAdmin ? 10 : 9} className="border px-3 py-4 text-center text-gray-500">
                            No se encontraron usuarios
                          </td>
                        </tr>
                      ) : (
                        currentUsuarios.map((u) => (
                          <tr key={u.id_usuarios} className="hover:bg-gray-50 transition">
                            <td className="border px-3 py-2">{u.id_usuarios}</td>
                            <td className="border px-3 py-2">
                              {u.nombre} {u.ap_paterno} {u.ap_materno}
                            </td>
                            <td className="border px-3 py-2">{u.telefono || "-"}</td>
                            <td className="border px-3 py-2">{u.usuario || "-"}</td>
                            <td className="border px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                u.rol === "ADMIN" 
                                  ? "bg-purple-100 text-purple-800" 
                                  : u.rol === "SUPERVISOR"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {u.rol || "-"}
                              </span>
                            </td>
                            <td className="border px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                u.estado === "Activo" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {u.estado || "-"}
                              </span>
                            </td>
                            <td className="border px-3 py-2">{u.area?.nombre || "-"}</td>
                            <td className="border px-3 py-2">{u.cargo?.nombre || "-"}</td>
                            <td className="border px-3 py-2">{u.funcionEspecial?.nombre || "-"}</td>
                            {esAdmin && (
                              <td className="border px-3 py-2 space-x-2 text-sm">
                                <button
                                  onClick={() => handleEditUsuario(u)}
                                  className="text-blue-600 hover:text-blue-800 font-medium px-1"
                                >
                                  Editar
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => cambiarEstado(u)}
                                  className="text-yellow-600 hover:text-yellow-800 font-medium px-1"
                                >
                                  {u.estado === "Activo" ? "Desactivar" : "Activar"}
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleDeleteUsuario(u.id_usuarios!)}
                                  className="text-red-600 hover:text-red-800 font-medium px-1"
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIÓN */}
                {filteredUsuarios.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
                    <span className="text-gray-600">
                      Mostrando {startIndex + 1} -{" "}
                      {Math.min(endIndex, filteredUsuarios.length)} de{" "}
                      {filteredUsuarios.length} registros
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                      >
                        «
                      </button>

                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                      >
                        ‹
                      </button>

                      {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                        const page = startPage + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg border transition ${
                              currentPage === page
                                ? "bg-black text-white border-black"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                      >
                        ›
                      </button>

                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                      >
                        »
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* PANEL LATERAL - FORMULARIO */}
      {showForm && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {isEditing ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-auto">
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded">
                ✔ Usuario guardado correctamente
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nuevoUsuario.nombre}
                  onChange={(e) =>
                    setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
                  }
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Ingrese el nombre"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido Paterno</label>
                  <input
                    type="text"
                    value={nuevoUsuario.ap_paterno || ""}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, ap_paterno: e.target.value })
                    }
                    className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                    placeholder="Apellido paterno"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Apellido Materno</label>
                  <input
                    type="text"
                    value={nuevoUsuario.ap_materno || ""}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, ap_materno: e.target.value })
                    }
                    className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                    placeholder="Apellido materno"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={nuevoUsuario.telefono || ""}
                  onChange={(e) =>
                    setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })
                  }
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nuevoUsuario.usuario || ""}
                  onChange={(e) =>
                    setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })
                  }
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Nombre de usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {isEditing ? "Nueva clave (dejar vacío para mantener)" : "Clave *"}
                </label>
                <input
                  type="password"
                  value={nuevoUsuario.clave || ""}
                  onChange={(e) =>
                    setNuevoUsuario({ ...nuevoUsuario, clave: e.target.value })
                  }
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder={isEditing ? "Dejar vacío para no cambiar" : "Contraseña"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    value={nuevoUsuario.rol}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
                    }
                    className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="USUARIO">Usuario</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={nuevoUsuario.estado}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, estado: e.target.value })
                    }
                    className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  type="text"
                  value={nuevoUsuario.cargo?.nombre || ""}
                  onChange={(e) =>
                    setNuevoUsuario({ 
                      ...nuevoUsuario, 
                      cargo: { nombre: e.target.value } 
                    })
                  }
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Cargo del usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Área</label>
                <select
                  value={nuevoUsuario.area?.id_area || ""}
                  onChange={(e) => {
                    const id_area = Number(e.target.value);
                    const areaSeleccionada = areas.find((a) => a.id_area === id_area);
                    setNuevoUsuario({ ...nuevoUsuario, area: areaSeleccionada });
                  }}
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                >
                  <option value="">Selecciona un área</option>
                  {areas.map((a) => (
                    <option key={a.id_area} value={a.id_area}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Función Especial</label>
                <select
                  value={nuevoUsuario.funcionEspecial?.id_funcion || ""}
                  onChange={(e) => {
                    const id_funcion = Number(e.target.value);
                    const funcion = funciones.find((f) => f.id_funcion === id_funcion);
                    setNuevoUsuario({ ...nuevoUsuario, funcionEspecial: funcion });
                  }}
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                >
                  <option value="">Selecciona una función</option>
                  {funciones.map((f) => (
                    <option key={f.id_funcion} value={f.id_funcion}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 border-t flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded border hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveUsuario}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Usuarios;