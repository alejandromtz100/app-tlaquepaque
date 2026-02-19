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
  densidad: string | null; // Permitir null
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

  // Verificar permisos del usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const puedeModificar = !esSupervisor; // SUPERVISOR solo puede leer

  /* PAGINACIÓN */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newColonia, setNewColonia] = useState({
    nombre: "",
    densidad: null as string | null, // Inicializar como null
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
    // Verificar permisos: SUPERVISOR no puede crear/modificar
    if (esSupervisor) {
      alert("Los supervisores solo pueden visualizar información, no pueden crear o modificar colonias");
      return;
    }

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
        setNewColonia({ nombre: "", densidad: null }); // Resetear a null
      }, 1200);
    } catch {
      alert("Error al guardar colonia");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColonia = async (id: number) => {
    // Verificar permisos: SUPERVISOR no puede eliminar
    if (esSupervisor) {
      alert("Los supervisores solo pueden visualizar información, no pueden eliminar colonias");
      return;
    }

    if (!window.confirm("¿Seguro que deseas eliminar esta colonia?")) return;
    await deleteColonia(id);
    await cargarColonias();
  };

  /* FILTRO */
  const filteredColonias = colonias.filter((c) => {
    const matchNombre = c.nombre.toLowerCase().includes(search.toLowerCase());
    const matchDensidad = densidad === "TODAS" || 
                         (densidad === "NULL" && c.densidad === null) ||
                         c.densidad === densidad;
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

      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          {/* HEADER DEL REPORTE */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Colonias</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Catálogo de colonias
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de registros</div>
                <div className="text-2xl font-bold">{filteredColonias.length}</div>
              </div>
            </div>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
              {puedeModificar && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setIsEditing(false);
                    setNewColonia({ nombre: "", densidad: null });
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                >
                  + Agregar colonia
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar colonia</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Densidad</label>
                <select
                  value={densidad}
                  onChange={(e) => {
                    setDensidad(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                >
                  <option value="TODAS">Todas las densidades</option>
                  <option>Densidad alta</option>
                  <option>Densidad media</option>
                  <option>Densidad baja</option>
                  <option>Densidad mínima</option>
                  <option value="NULL">Sin densidad</option>
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Mostrando <span className="font-semibold">{filteredColonias.length}</span> registros
            </div>
          </div>

          {/* TABLA - Sin scroll interno, contenido completo con saltos de línea */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Densidad</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[140px]">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentColonias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-10 text-center text-slate-500 bg-slate-50/50">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium text-slate-600">No hay colonias registradas</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentColonias.map((c) => (
                    <tr key={c.id_colonia} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2 text-slate-700 align-top whitespace-nowrap">{c.id_colonia}</td>
                      <td className="px-3 py-2 text-slate-800 font-medium whitespace-normal break-words">{c.nombre}</td>
                      <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{c.densidad || "—"}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          {puedeModificar && (
                            <>
                              <button onClick={() => handleEditColonia(c)} className="text-sky-600 hover:text-sky-800 font-medium">Editar</button>
                              <span className="text-slate-300">|</span>
                              <button onClick={() => handleDeleteColonia(c.id_colonia)} className="text-rose-600 hover:text-rose-800 font-medium">Eliminar</button>
                            </>
                          )}
                          {!puedeModificar && (
                            <span className="text-slate-400 text-sm">Solo lectura</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-600 text-center sm:text-left order-2 sm:order-1">
              <span className="font-medium text-slate-800">{filteredColonias.length > 0 ? startIndex + 1 : 0}</span>
              <span className="mx-1">–</span>
              <span className="font-medium text-slate-800">{Math.min(endIndex, filteredColonias.length)}</span>
              <span className="mx-1">de</span>
              <span className="font-medium text-slate-800">{filteredColonias.length}</span>
              <span className="ml-1">registros</span>
            </p>
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 order-1 sm:order-2" aria-label="Paginación">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  aria-label="Primera página"
                >
                  <span className="sr-only">Primera</span>«
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <div className="flex items-center gap-0.5 mx-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? "bg-slate-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  aria-label="Siguiente"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  aria-label="Última página"
                >
                  »
                </button>
              </nav>
            )}
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
                value={newColonia.densidad || ""}
                onChange={(e) =>
                  setNewColonia({ 
                    ...newColonia, 
                    densidad: e.target.value === "" ? null : e.target.value 
                  })
                }
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
              >
                <option value="">Ninguna</option>
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