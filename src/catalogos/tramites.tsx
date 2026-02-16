import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";
import { TramitesService } from "../services/tramites.service";
import type { Tramite } from "../services/tramites.service";
import TramiteConceptosPanel from "../components/TramiteConceptosPanel";
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
  const [tramiteConceptos, setTramiteConceptos] = useState<Tramite | null>(null);

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
  setTramiteConceptos(null); // 👈 importante
  setNombre(t.nombre);
  setLetra(t.letra);
  setEditingId(t.id);
  setIsEditing(true);
  setShowForm(true);
};

 const openConceptos = (t: Tramite) => {
  setTramiteConceptos(t);
  setShowForm(true);
  setIsEditing(false);
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
  const filteredTramites = tramites
  .filter((t) =>
    t.nombre.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
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

      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          {/* HEADER DEL REPORTE */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Trámites</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Catálogo de trámites
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de registros</div>
                <div className="text-2xl font-bold">{filteredTramites.length}</div>
              </div>
            </div>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
              <button
                onClick={() => {
                  setShowForm(true);
                  setIsEditing(false);
                  setTramiteConceptos(null);
                  setNombre("");
                  setLetra("");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
              >
                + Agregar trámite
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar trámite</label>
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
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Mostrando <span className="font-semibold">{filteredTramites.length}</span> registros
            </div>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full text-xs border-collapse bg-white">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr className="text-gray-700 uppercase">
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">ID</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Nombre</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Letra</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100 w-48">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentTramites.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-base font-medium">No hay trámites registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentTramites.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200">
                        <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-gray-700">{t.id}</td>
                        <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">{t.nombre}</td>
                        <td className="px-4 py-3 border border-gray-300 text-center text-gray-700">{t.letra}</td>
                        <td className="px-4 py-3 border border-gray-300 space-x-2 text-sm">
                          <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                          <span className="text-gray-400">|</span>
                          <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800 font-medium">Eliminar</button>
                          <span className="text-gray-400">|</span>
                          <button onClick={() => openConceptos(t)} className="text-green-600 hover:text-green-800 font-medium">Definir Conceptos</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINACIÓN */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                Mostrando <span className="font-semibold text-gray-900">{filteredTramites.length > 0 ? startIndex + 1 : 0}</span> - <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredTramites.length)}</span> de <span className="font-semibold text-gray-900">{filteredTramites.length}</span> registros
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">««</button>
                  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">&lt;</button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                      if (pageNum < 1) pageNum = i + 1;
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? "bg-black text-white" : "border border-gray-300 bg-white hover:bg-gray-100"}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">&gt;</button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">»»</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* PANEL LATERAL */}
     {showForm && (
  <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l">
    
    {/* HEADER */}
    <div className="px-6 py-4 border-b flex justify-between items-center">
      <h2 className="text-lg font-bold">
        {tramiteConceptos
          ? "Definir conceptos del trámite"
          : isEditing
          ? "Editar trámite"
          : "Nuevo trámite"}
      </h2>
      <button
        onClick={() => {
          setShowForm(false);
          setTramiteConceptos(null);
        }}
        className="text-gray-500 hover:text-black text-xl"
      >
        ✕
      </button>
    </div>

    {/* CONTENIDO */}
    <div className="flex-1 overflow-auto p-6">
      {tramiteConceptos ? (
        /* 🔹 PANEL DE CONCEPTOS */
        <TramiteConceptosPanel tramite={tramiteConceptos} />
      ) : (
        /* 🔹 FORMULARIO DE TRÁMITE */
        <>
          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
              Trámite guardado correctamente
            </div>
          )}

          <div className="space-y-4">
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
        </>
      )}
    </div>

    {/* FOOTER */}
    {!tramiteConceptos && (
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
    )}
  </div>
)}


      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Tramites;
