import React, { useEffect, useState } from "react";
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
  id_usuarios?: number; // opcional para nuevo usuario
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
   COMPONENTE
====================== */
const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [funciones, setFunciones] = useState<FuncionUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [nuevoUsuario, setNuevoUsuario] = useState<Usuario | null>(null);

  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esAdmin = usuarioLogueado?.rol === "ADMIN";

  /* ======================
     CARGAR USUARIOS, AREAS Y FUNCIONES
  ====================== */
  useEffect(() => {
    const fetchDatos = async () => {
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
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  /* ======================
     CAMBIAR ESTADO
  ====================== */
  const cambiarEstado = async (u: Usuario) => {
    const nuevoEstado = u.estado === "Activo" ? "Inactivo" : "Activo";

    await fetch(`http://localhost:3001/usuarios/${u.id_usuarios}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    setUsuarios((prev) =>
      prev.map((x) =>
        x.id_usuarios === u.id_usuarios ? { ...x, estado: nuevoEstado } : x
      )
    );
  };

  /* ======================
     GUARDAR CAMBIOS DE EDICIÓN
  ====================== */
  const guardarCambios = async () => {
    if (!usuarioEditando) return;

    const payload = {
      ...usuarioEditando,
      usuario: usuarioEditando.usuario,
      clave: usuarioEditando.clave,
      area: usuarioEditando.area ? { id_area: usuarioEditando.area.id_area } : null,
      cargo: usuarioEditando.cargo?.nombre || null,
      funcionEspecial: usuarioEditando.funcionEspecial
        ? { id_funcion: usuarioEditando.funcionEspecial.id_funcion }
        : null,
    };

    const res = await fetch(
      `http://localhost:3001/usuarios/${usuarioEditando.id_usuarios}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    setUsuarios((prev) =>
      prev.map((u) =>
        u.id_usuarios === usuarioEditando.id_usuarios ? data : u
      )
    );

    setUsuarioEditando(null);
  };

  /* ======================
     GUARDAR NUEVO USUARIO
  ====================== */
  const guardarNuevoUsuario = async () => {
    if (!nuevoUsuario) return;

    const payload = {
      nombre: nuevoUsuario.nombre,
      ap_paterno: nuevoUsuario.ap_paterno,
      ap_materno: nuevoUsuario.ap_materno,
      telefono: nuevoUsuario.telefono,
      usuario: nuevoUsuario.usuario,
      clave: nuevoUsuario.clave,
      rol: nuevoUsuario.rol,
      estado: nuevoUsuario.estado,
      area: nuevoUsuario.area ? { id_area: nuevoUsuario.area.id_area } : null,
      cargo: nuevoUsuario.cargo?.nombre || null,
      funcionEspecial: nuevoUsuario.funcionEspecial
        ? { id_funcion: nuevoUsuario.funcionEspecial.id_funcion }
        : null,
    };

    const res = await fetch("http://localhost:3001/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setUsuarios([...usuarios, data]);
    setNuevoUsuario(null);
  };

  /* ======================
     ELIMINAR USUARIO
  ====================== */
  const borrarUsuario = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    await fetch(`http://localhost:3001/usuarios/${id}`, { method: "DELETE" });
    setUsuarios((prev) => prev.filter((u) => u.id_usuarios !== id));
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            Sistema de Control de la Edificación ALCH
          </h1>
          <p className="text-sm text-gray-500">H. Ayuntamiento de Tlaquepaque</p>
        </div>
      </header>

      <Menu />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Usuarios registrados
          </div>

          <div className="p-4 text-sm">
            {loading ? (
              <p>Cargando usuarios...</p>
            ) : (
              <>
                {esAdmin && (
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded mb-4"
                    onClick={() =>
                      setNuevoUsuario({
                        nombre: "",
                        ap_paterno: "",
                        ap_materno: "",
                        telefono: "",
                        usuario: "",
                        clave: "",
                        rol: "",
                        estado: "Activo",
                        area: undefined,
                        cargo: { nombre: "" },
                        funcionEspecial: undefined,
                      })
                    }
                  >
                    Agregar Usuario
                  </button>
                )}

                <p className="mb-2 font-medium">
                  Total de registros: {usuarios.length}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border px-3 py-2">Nombre</th>
                        <th className="border px-3 py-2">Teléfono</th>
                        <th className="border px-3 py-2">Rol</th>
                        <th className="border px-3 py-2">Estado</th>
                        <th className="border px-3 py-2">Área</th>
                        <th className="border px-3 py-2">Cargo</th>
                        <th className="border px-3 py-2">Función</th>
                        <th className="border px-3 py-2">Fecha Creación</th>
                        <th className="border px-3 py-2">Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u, index) => (
                        <tr key={u.id_usuarios ?? index}>
                          <td className="border px-3 py-2">
                            {u.nombre} {u.ap_paterno} {u.ap_materno}
                          </td>
                          <td className="border px-3 py-2">{u.telefono || "-"}</td>
                          <td className="border px-3 py-2">{u.rol}</td>
                          <td className="border px-3 py-2">{u.estado}</td>
                          <td className="border px-3 py-2">{u.area?.nombre || "-"}</td>
                          <td className="border px-3 py-2">{u.cargo?.nombre || "-"}</td>
                          <td className="border px-3 py-2">{u.funcionEspecial?.nombre || "-"}</td>
                          <td className="border px-3 py-2">
                            {u.fechaCreacion
                              ? new Date(u.fechaCreacion).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="border px-3 py-2 space-x-2">
                            {esAdmin && (
                              <>
                                <button
                                  className="text-blue-600 hover:underline"
                                  onClick={() => setUsuarioEditando(u)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="text-yellow-600 hover:underline"
                                  onClick={() => cambiarEstado(u)}
                                >
                                  {u.estado === "Activo" ? "Desactivar" : "Activar"}
                                </button>
                                <button
                                  className="text-red-600 hover:underline"
                                  onClick={() => borrarUsuario(u.id_usuarios!)}
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PANEL EDICIÓN */}
        {usuarioEditando && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">
              Editar usuario: {usuarioEditando.nombre}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["nombre", "ap_paterno", "ap_materno", "telefono"].map((field) => (
                <input
                  key={field}
                  className="border p-2 rounded"
                  placeholder={field.replace("_", " ")}
                  value={(usuarioEditando as any)[field] || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      [field]: e.target.value,
                    })
                  }
                />
              ))}

              <input
                className="border p-2 rounded"
                placeholder="Usuario"
                value={usuarioEditando.usuario || ""}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, usuario: e.target.value })
                }
              />

              <input
                type="password"
                className="border p-2 rounded"
                placeholder="Clave"
                value={usuarioEditando.clave || ""}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, clave: e.target.value })
                }
              />

              <input
                className="border p-2 rounded"
                placeholder="Cargo"
                value={usuarioEditando.cargo?.nombre || ""}
                onChange={(e) =>
                  setUsuarioEditando({
                    ...usuarioEditando,
                    cargo: { nombre: e.target.value },
                  })
                }
              />

              {/* Select rol */}
              <select
                className="border p-2 rounded"
                value={usuarioEditando.rol}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })
                }
              >
                <option value="">Selecciona un rol</option>
                <option value="ADMIN">Administrador</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="USUARIO">Usuario</option>
              </select>

              {/* Select estado */}
              <select
                className="border p-2 rounded"
                value={usuarioEditando.estado}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, estado: e.target.value })
                }
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>

              {/* Select área */}
              <select
                className="border p-2 rounded"
                value={usuarioEditando.area?.id_area || ""}
                onChange={(e) => {
                  const id_area = Number(e.target.value);
                  const areaSeleccionada = areas.find((a) => a.id_area === id_area);
                  setUsuarioEditando({ ...usuarioEditando, area: areaSeleccionada });
                }}
              >
                <option value="">Selecciona un área</option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area}>
                    {a.nombre}
                  </option>
                ))}
              </select>

              {/* Select función */}
              <select
                className="border p-2 rounded"
                value={usuarioEditando.funcionEspecial?.id_funcion || ""}
                onChange={(e) => {
                  const id_funcion = Number(e.target.value);
                  const funcion = funciones.find((f) => f.id_funcion === id_funcion);
                  setUsuarioEditando({ ...usuarioEditando, funcionEspecial: funcion });
                }}
              >
                <option value="">Selecciona una función</option>
                {funciones.map((f) => (
                  <option key={f.id_funcion} value={f.id_funcion}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={guardarCambios}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => setUsuarioEditando(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* PANEL NUEVO USUARIO */}
        {nuevoUsuario && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Agregar nuevo usuario</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["nombre", "ap_paterno", "ap_materno", "telefono"].map((field) => (
                <input
                  key={field}
                  className="border p-2 rounded"
                  placeholder={field.replace("_", " ")}
                  value={(nuevoUsuario as any)[field] || ""}
                  onChange={(e) =>
                    setNuevoUsuario({ ...nuevoUsuario, [field]: e.target.value })
                  }
                />
              ))}

              <input
                className="border p-2 rounded"
                placeholder="Usuario"
                value={nuevoUsuario.usuario || ""}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })
                }
              />

              <input
                type="password"
                className="border p-2 rounded"
                placeholder="Clave"
                value={nuevoUsuario.clave || ""}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, clave: e.target.value })
                }
              />

              <input
                className="border p-2 rounded"
                placeholder="Cargo"
                value={nuevoUsuario.cargo?.nombre || ""}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, cargo: { nombre: e.target.value } })
                }
              />

              {/* Select rol */}
              <select
                className="border p-2 rounded"
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
                }
              >
                <option value="">Selecciona un rol</option>
                <option value="ADMIN">Administrador</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="USUARIO">Usuario</option>
              </select>

              {/* Select estado */}
              <select
                className="border p-2 rounded"
                value={nuevoUsuario.estado}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, estado: e.target.value })
                }
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>

              {/* Select área */}
              <select
                className="border p-2 rounded"
                value={nuevoUsuario.area?.id_area || ""}
                onChange={(e) => {
                  const id_area = Number(e.target.value);
                  const areaSeleccionada = areas.find((a) => a.id_area === id_area);
                  setNuevoUsuario({ ...nuevoUsuario, area: areaSeleccionada });
                }}
              >
                <option value="">Selecciona un área</option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area}>
                    {a.nombre}
                  </option>
                ))}
              </select>

              {/* Select función */}
              <select
                className="border p-2 rounded"
                value={nuevoUsuario.funcionEspecial?.id_funcion || ""}
                onChange={(e) => {
                  const id_funcion = Number(e.target.value);
                  const funcion = funciones.find((f) => f.id_funcion === id_funcion);
                  setNuevoUsuario({ ...nuevoUsuario, funcionEspecial: funcion });
                }}
              >
                <option value="">Selecciona una función</option>
                {funciones.map((f) => (
                  <option key={f.id_funcion} value={f.id_funcion}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={guardarNuevoUsuario}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => setNuevoUsuario(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Usuarios;
