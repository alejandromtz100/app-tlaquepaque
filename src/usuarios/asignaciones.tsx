import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";

/* ======================
   INTERFACES
====================== */
interface Usuario {
  id_usuarios: number;
  nombre: string;
  ap_paterno: string;
  ap_materno?: string;
}

interface UsuarioAsignado extends Usuario {
  funcionEspecial?: {
    nombre: string;
  };
}

interface Funcion {
  id_funcion: number;
  nombre: string;
}

/* ======================
   COMPONENTE
====================== */
const Asignaciones: React.FC = () => {
  // usuarios con función asignada (tabla)
  const [usuariosAsignados, setUsuariosAsignados] = useState<UsuarioAsignado[]>([]);

  // todos los usuarios (select)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // funciones disponibles
  const [funciones, setFunciones] = useState<Funcion[]>([]);

  const [idUsuario, setIdUsuario] = useState<number | "">("");
  const [idFuncion, setIdFuncion] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  /* ======================
     CARGAR DATOS
  ====================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAsignados, resUsuarios, resFunciones] = await Promise.all([
          fetch("http://localhost:3001/asignaciones"),
          fetch("http://localhost:3001/usuarios"),
          fetch("http://localhost:3001/asignaciones/funciones"),
        ]);

        const asignadosData = await resAsignados.json();
        const usuariosData = await resUsuarios.json();
        const funcionesData = await resFunciones.json();

        setUsuariosAsignados(asignadosData);
        setUsuarios(usuariosData);
        setFunciones(funcionesData);

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ======================
     ASIGNAR FUNCIÓN
  ====================== */
  const asignarFuncion = async () => {
    if (!idUsuario || !idFuncion) {
      alert("Selecciona usuario y función");
      return;
    }

    await fetch("http://localhost:3001/asignaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: idUsuario,
        id_funcion: idFuncion,
      }),
    });

    // Recargar tabla
    const res = await fetch("http://localhost:3001/asignaciones");
    setUsuariosAsignados(await res.json());

    setIdUsuario("");
    setIdFuncion("");
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Menu />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-xl font-bold mb-6">
            Asignaciones Especiales
          </h1>

          {/* FORMULARIO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              className="border p-2 rounded"
              value={idUsuario}
              onChange={(e) => setIdUsuario(Number(e.target.value))}
            >
              <option value="">Selecciona usuario</option>
              {usuarios.map((u) => (
                <option key={u.id_usuarios} value={u.id_usuarios}>
                  {u.nombre} {u.ap_paterno}
                </option>
              ))}
            </select>

            <select
              className="border p-2 rounded"
              value={idFuncion}
              onChange={(e) => setIdFuncion(Number(e.target.value))}
            >
              <option value="">Selecciona función</option>
              {funciones.map((f) => (
                <option key={f.id_funcion} value={f.id_funcion}>
                  {f.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={asignarFuncion}
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            >
              Asignar
            </button>
          </div>

          {/* TABLA */}
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Usuario</th>
                  <th className="border px-3 py-2">Función</th>
                </tr>
              </thead>
              <tbody>
                {usuariosAsignados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      No hay usuarios con asignaciones
                    </td>
                  </tr>
                ) : (
                  usuariosAsignados.map((u) => (
                    <tr key={u.id_usuarios}>
                      <td className="border px-3 py-2">{u.id_usuarios}</td>
                      <td className="border px-3 py-2">
                        {u.nombre} {u.ap_paterno} {u.ap_materno}
                      </td>
                      <td className="border px-3 py-2">
                        {u.funcionEspecial?.nombre || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Asignaciones;
