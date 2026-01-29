import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";
import { TramitesService } from "../services/tramites.service";
import type { Tramite } from "../services/tramites.service";

const Tramites: React.FC = () => {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [nombre, setNombre] = useState("");
  const [letra, setLetra] = useState("");

  /* PAGINACIÓN */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    cargarTramites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const cargarTramites = async () => {
    const data = await TramitesService.getAll();
    setTramites(data);
  };

  const handleEdit = (t: Tramite) => {
    setNombre(t.nombre);
    setLetra(t.letra);
    setEditingId(t.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!nombre || !letra) return;

    try {
      setLoading(true);

      if (isEditing && editingId !== null) {
        await TramitesService.update(editingId, { nombre, letra });
      } else {
        await TramitesService.create({ nombre, letra });
      }

      await cargarTramites();
      setSuccess(true);

      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        setIsEditing(false);
        setEditingId(null);
        setNombre("");
        setLetra("");
      }, 1200);
    } catch {
      alert("Error al guardar trámite");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este trámite?")) return;
    await TramitesService.remove(id);
    await cargarTramites();
  };

  /* FILTRO */
  const filteredTramites = tramites.filter((t) =>
    t.nombre.toLowerCase().includes(search.toLowerCase())
  );

  /* PAGINACIÓN */
  const totalPages = Math.ceil(filteredTramites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTramites = filteredTramites.slice(startIndex, endIndex);

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
        {/* BUSCADOR */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar trámite..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-2 w-64"
          />

          <button
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setNombre("");
              setLetra("");
            }}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
          >
            + Agregar trámite
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Trámites
          </div>

          <div className="p-4 text-sm">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Nombre</th>
                  <th className="border px-3 py-2">Letra</th>
                  <th className="border px-3 py-2 w-48">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {currentTramites.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-100 transition">
                    <td className="border px-3 py-2">{t.id}</td>
                    <td className="border px-3 py-2">{t.nombre}</td>
                    <td className="border px-3 py-2 text-center">{t.letra}</td>
                    <td className="border px-3 py-2 space-x-3 text-sm">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                      |
                      <button
                        onClick={() => handleDelete(t.id)}
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
                {Math.min(endIndex, filteredTramites.length)} de{" "}
                {filteredTramites.length} registros
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  «
                </button>

                {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                  const page = startPage + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg border transition ${
                        currentPage === page
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
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
              {isEditing ? "Editar trámite" : "Nuevo trámite"}
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
                 Trámite guardado correctamente
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border rounded-xl px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Letra</label>
              <input
                type="text"
                maxLength={1}
                value={letra}
                onChange={(e) => setLetra(e.target.value.toUpperCase())}
                className="border rounded-xl px-3 py-2 w-full"
              />
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
              onClick={handleSave}
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

export default Tramites;
