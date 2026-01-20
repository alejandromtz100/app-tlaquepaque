import { useEffect, useState } from "react";

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

export default function Usuarios() {
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

  if (loading) {
    return <p className="p-4">Cargando usuarios...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Usuarios registrados</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-3 py-2">Nombre</th>
              <th className="border px-3 py-2">Teléfono</th>
              <th className="border px-3 py-2">Rol</th>
              <th className="border px-3 py-2">Estado</th>
              <th className="border px-3 py-2">Función</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id_usuarios} className="hover:bg-gray-100">
                <td className="border px-3 py-2">
                  {u.nombre} {u.ap_paterno} {u.ap_materno}
                </td>
                <td className="border px-3 py-2">{u.telefono}</td>
                <td className="border px-3 py-2">{u.rol}</td>
                <td className="border px-3 py-2">{u.estado}</td>
                <td className="border px-3 py-2">{u.funcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
