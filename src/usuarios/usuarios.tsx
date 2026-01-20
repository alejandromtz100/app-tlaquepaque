import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";

interface Usuario {
  id_usuarios: number;
  nombre: string;
  ap_paterno: string;
  ap_materno?: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  funcion?: string;
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/usuarios")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar usuarios:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            Sistema de Control de la Edificación ALCH
          </h1>
          <p className="text-sm text-gray-500">
            H. Ayuntamiento de Tlaquepaque
          </p>
        </div>
      </header>

      {/* MENU */}
      <Menu />

      {/* CONTENIDO */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* TABLA DE USUARIOS */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Usuarios
          </div>

          <div className="p-4 text-sm">
            {loading ? (
              <p>Cargando usuarios...</p>
            ) : (
              <>
                <p className="mb-2 font-medium">
                  Total de Registros: {usuarios.length}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 text-left">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border px-3 py-2">Nombre</th>
                        <th className="border px-3 py-2">Teléfono</th>
                        <th className="border px-3 py-2">Rol</th>
                        <th className="border px-3 py-2">Estado</th>
                        <th className="border px-3 py-2">Función</th>
                        <th className="border px-3 py-2 w-40">Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr
                          key={u.id_usuarios}
                          className="hover:bg-gray-100"
                        >
                          <td className="border px-3 py-2">
                            {u.nombre} {u.ap_paterno} {u.ap_materno}
                          </td>
                          <td className="border px-3 py-2">
                            {u.telefono || "-"}
                          </td>
                          <td className="border px-3 py-2">
                            {u.rol || "-"}
                          </td>
                          <td className="border px-3 py-2">
                            {u.estado || "-"}
                          </td>
                          <td className="border px-3 py-2">
                            {u.funcion || "-"}
                          </td>
                          <td className="border px-3 py-2 text-blue-600 space-x-2">
                            <button className="hover:underline">
                              Editar
                            </button>
                            /
                            <button className="hover:underline text-red-600">
                              Desactivar
                            </button>
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
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Usuarios;
