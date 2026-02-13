import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../layout/menu";
import usuariosService, { type Usuario } from "../services/usuarios.service";
import HistorialUsuario from "./HistorialUsuario";
import { History } from "lucide-react";

const Administradores: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    // Verificar si es administrador
    const usuarioData = localStorage.getItem("usuario");
    if (!usuarioData) {
      navigate("/");
      return;
    }

    const usuario = JSON.parse(usuarioData);
    if (usuario.rol !== "ADMIN") {
      navigate("/home");
      return;
    }

    cargarUsuarios();
  }, [navigate]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosService.obtenerTodosLosDatos();
      setUsuarios(data.usuarios);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const nombreCompleto = `${u.nombre || ""} ${u.ap_paterno || ""} ${u.ap_materno || ""}`.toLowerCase();
    const usuarioNombre = (u.usuario || "").toLowerCase();
    const busquedaLower = busqueda.toLowerCase();
    return nombreCompleto.includes(busquedaLower) || usuarioNombre.includes(busquedaLower);
  });

  const abrirHistorial = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarHistorial(true);
  };

  const cerrarHistorial = () => {
    setMostrarHistorial(false);
    setUsuarioSeleccionado(null);
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-4">
            <h1 className="text-xl md:text-2xl font-bold">Administradores</h1>
            <p className="text-sm text-gray-300 mt-1">
              Historial de actividades de usuarios
            </p>
          </div>

          {/* BUSCADOR */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Buscar usuario por nombre o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          {/* TABLA */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Cargando usuarios...
            </div>
          ) : (
            <div className="p-4">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-3 py-2 text-left">ID</th>
                    <th className="border px-3 py-2 text-left">Nombre</th>
                    <th className="border px-3 py-2 text-left">Usuario</th>
                    <th className="border px-3 py-2">Rol</th>
                    <th className="border px-3 py-2">Estado</th>
                    <th className="border px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border px-3 py-4 text-center text-gray-500">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id_usuarios} className="hover:bg-gray-50 transition">
                        <td className="border px-3 py-2">{usuario.id_usuarios}</td>
                        <td className="border px-3 py-2">
                          {`${usuario.nombre || ""} ${usuario.ap_paterno || ""} ${usuario.ap_materno || ""}`.trim()}
                        </td>
                        <td className="border px-3 py-2">{usuario.usuario || "-"}</td>
                        <td className="border px-3 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              usuario.rol === "ADMIN"
                                ? "bg-red-100 text-red-700"
                                : usuario.rol === "SUPERVISOR"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {usuario.rol || "USUARIO"}
                          </span>
                        </td>
                        <td className="border px-3 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              usuario.estado === "Activo"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {usuario.estado || "Inactivo"}
                          </span>
                        </td>
                        <td className="border px-3 py-2">
                          <button
                            onClick={() => abrirHistorial(usuario)}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm mx-auto"
                          >
                            <History size={16} />
                            Historial de usuario
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>

      {/* MODAL DE HISTORIAL */}
      {mostrarHistorial && usuarioSeleccionado && (
        <HistorialUsuario
          usuario={usuarioSeleccionado}
          onClose={cerrarHistorial}
        />
      )}
    </div>
  );
};

export default Administradores;
