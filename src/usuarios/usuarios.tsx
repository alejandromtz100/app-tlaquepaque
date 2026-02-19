import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";
import usuariosService, { 
  type Usuario, 
  type Area, 
  type FuncionUsuario 
} from "../services/usuarios.service";

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
  const puedeModificar = esAdmin; // Solo ADMIN puede crear/modificar/eliminar usuarios

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
      const data = await usuariosService.obtenerTodosLosDatos();
      setUsuarios(data.usuarios);
      setAreas(data.areas);
      setFunciones(data.funciones);
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
      clave: "", // No mostrar la clave actual por seguridad
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
    const usuarioNombre = String(nuevoUsuario.usuario || "").trim();
    const clave = String(nuevoUsuario.clave || "");

    if (!nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    if (!usuarioNombre) {
      alert("El nombre de usuario es obligatorio");
      return;
    }

    if (!isEditing && !clave.trim()) {
      alert("La clave es obligatoria para nuevos usuarios");
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && editingId !== null) {
        await usuariosService.actualizarUsuario(editingId, nuevoUsuario);
      } else {
        await usuariosService.crearUsuario(nuevoUsuario);
      }

      // Recargar los datos
      await cargarDatos();
      setSuccess(true);

      setTimeout(() => {
        resetForm();
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
      await usuariosService.eliminarUsuario(id);
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
    
    if (!confirmacion || !usuario.id_usuarios) return;
    
    try {
      await usuariosService.cambiarEstadoUsuario(usuario.id_usuarios, nuevoEstado);
      await cargarDatos();
      alert(`Estado de ${usuario.nombre} cambiado a ${nuevoEstado}`);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar estado");
    }
  };

  const resetForm = () => {
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

  const limpiarFiltros = () => {
    setSearch("");
    setFiltroRol("TODOS");
    setFiltroEstado("TODOS");
    setCurrentPage(1);
  };

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
        </div>
      </header>

      <Menu />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          {/* HEADER DEL REPORTE */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Usuarios registrados</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Gestión de usuarios del sistema
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de registros</div>
                <div className="text-2xl font-bold">{usuarios.length}</div>
              </div>
            </div>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
              <div className="flex gap-2">
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Limpiar Filtros
                </button>
                {puedeModificar && (
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
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar usuario
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                >
                  <option value="TODOS">Todos los roles</option>
                  {rolesUnicos.map((rol) => (
                    <option key={rol} value={rol}>{rol}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                >
                  <option value="TODOS">Todos los estados</option>
                  {estadosUnicos.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Mostrando <span className="font-semibold">{filteredUsuarios.length}</span> de <span className="font-semibold">{usuarios.length}</span> registros
            </div>
          </div>

          {/* TABLA O ESTADO DE CARGA */}
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
            {loading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Cargando usuarios...</p>
                </div>
              </div>
            ) : (
              <div className="min-w-full inline-block align-middle">
                <table className="min-w-full text-xs border-collapse bg-white">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr className="text-gray-700 uppercase">
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">ID</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Nombre</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Teléfono</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Usuario</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Rol</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Estado</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Área</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Cargo</th>
                      <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Función</th>
                      {esAdmin && <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100 w-48">Opciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentUsuarios.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={esAdmin ? 10 : 9} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-base font-medium">
                              {search || filtroRol !== "TODOS" || filtroEstado !== "TODOS"
                                ? "No se encontraron resultados para los filtros aplicados"
                                : "No hay usuarios registrados"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentUsuarios.map((u) => (
                        <tr
                          key={u.id_usuarios}
                          className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200"
                        >
                          <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-gray-700">{u.id_usuarios}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">
                            {u.nombre} {u.ap_paterno} {u.ap_materno}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{u.telefono || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{u.usuario || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300">
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
                          <td className="px-4 py-3 border border-gray-300">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              u.estado === "Activo"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {u.estado || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{u.area?.nombre || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{u.cargo?.nombre || "-"}</td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">{u.funcionEspecial?.nombre || "-"}</td>
                          {puedeModificar && (
                            <td className="px-4 py-3 border border-gray-300 space-x-2 text-sm">
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
                                onClick={() => u.id_usuarios && handleDeleteUsuario(u.id_usuarios)}
                                className="text-red-600 hover:text-red-800 font-medium px-1"
                              >
                                Eliminar
                              </button>
                            </td>
                          )}
                          {!puedeModificar && (
                            <td className="px-4 py-3 border border-gray-300 text-gray-400 text-sm">
                              Solo lectura
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGINACIÓN E INFORMACIÓN DE REGISTROS */}
          {!loading && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Mostrando <span className="font-semibold text-gray-900">
                    {filteredUsuarios.length > 0 ? startIndex + 1 : 0}
                  </span> - <span className="font-semibold text-gray-900">
                    {Math.min(endIndex, filteredUsuarios.length)}
                  </span> de <span className="font-semibold text-gray-900">{filteredUsuarios.length}</span> registros
                  {usuarios.length !== filteredUsuarios.length && (
                    <span className="text-gray-500"> (de {usuarios.length} totales)</span>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ««
                    </button>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      &lt;
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                        const page = startPage + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-black text-white"
                                : "border border-gray-300 bg-white hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      &gt;
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      »»
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
                 Usuario guardado correctamente
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