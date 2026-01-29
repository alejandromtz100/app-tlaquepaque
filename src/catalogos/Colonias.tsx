import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";
import {
  getColonias,
  createColonia,
  updateColonia,
  deleteColonia,
} from "../services/colonias.service";

interface Colonia {
  id_colonia: number;
  nombre: string;
  densidad: string;
}

const Colonias: React.FC = () => {
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [search, setSearch] = useState("");
  const [densidad, setDensidad] = useState("TODAS");

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* PAGINACIÓN */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newColonia, setNewColonia] = useState({
    nombre: "",
    densidad: "Densidad alta",
  });

  useEffect(() => {
    cargarColonias();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, densidad]);

  const cargarColonias = async () => {
    const data = await getColonias();
    setColonias(data);
  };

  const handleEditColonia = (colonia: Colonia) => {
    setNewColonia({
      nombre: colonia.nombre,
      densidad: colonia.densidad,
    });
    setEditingId(colonia.id_colonia);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSaveColonia = async () => {
    if (!newColonia.nombre.trim()) return;

    try {
      setLoading(true);

      if (isEditing && editingId !== null) {
        await updateColonia(editingId, newColonia);
      } else {
        await createColonia(newColonia);
      }

      await cargarColonias();
      setSuccess(true);

      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        setIsEditing(false);
        setEditingId(null);
        setNewColonia({ nombre: "", densidad: "Densidad alta" });
      }, 1200);
    } catch {
      alert("Error al guardar colonia");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColonia = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta colonia?")) return;
    await deleteColonia(id);
    await cargarColonias();
  };

  /* FILTRO */
  const filteredColonias = colonias.filter((c) => {
    const matchNombre = c.nombre.toLowerCase().includes(search.toLowerCase());
    const matchDensidad = densidad === "TODAS" || c.densidad === densidad;
    return matchNombre && matchDensidad;
  });

  /* PAGINACIÓN */
  const totalPages = Math.ceil(filteredColonias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentColonias = filteredColonias.slice(startIndex, endIndex);

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

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

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-6">
        {/* BUSCADOR + FILTRO */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar colonia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-2 w-64"
          />

          <select
            value={densidad}
            onChange={(e) => setDensidad(e.target.value)}
            className="border rounded-xl px-4 py-2"
          >
            <option value="TODAS">Todas las densidades</option>
            <option>Densidad alta</option>
            <option>Densidad media</option>
            <option>Densidad baja</option>
            <option>Densidad mínima</option>
          </select>

          <button
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setNewColonia({ nombre: "", densidad: "Densidad alta" });
            }}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
          >
            + Agregar colonia
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Colonias
          </div>

          <div className="p-4 text-sm">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Nombre</th>
                  <th className="border px-3 py-2">Densidad</th>
                  <th className="border px-3 py-2 w-48">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {currentColonias.map((c) => (
                  <tr key={c.id_colonia} className="hover:bg-gray-100 transition">
                    <td className="border px-3 py-2">{c.id_colonia}</td>
                    <td className="border px-3 py-2">{c.nombre}</td>
                    <td className="border px-3 py-2">{c.densidad}</td>
                    <td className="border px-3 py-2 space-x-3 text-sm">
                      <button
                        onClick={() => handleEditColonia(c)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                      |
                      <button
                        onClick={() => handleDeleteColonia(c.id_colonia)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINACIÓN */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
              <span className="text-gray-600">
                Mostrando {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredColonias.length)} de{" "}
                {filteredColonias.length} registros
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
          </div>
        </div>
      </main>

      {/* PANEL LATERAL */}
      {showForm && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {isEditing ? "Editar colonia" : "Nueva colonia"}
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
                 Colonia guardada correctamente
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={newColonia.nombre}
                onChange={(e) =>
                  setNewColonia({ ...newColonia, nombre: e.target.value })
                }
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Densidad</label>
              <select
                value={newColonia.densidad}
                onChange={(e) =>
                  setNewColonia({ ...newColonia, densidad: e.target.value })
                }
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
              >
                <option>Densidad alta</option>
                <option>Densidad media</option>
                <option>Densidad baja</option>
                <option>Densidad mínima</option>
              </select>
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
              onClick={handleSaveColonia}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-xl"
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

export default Colonias;
