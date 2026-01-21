import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";
import { TramitesService } from "../services/tramites.service";
import type { Tramite } from "../services/tramites.service";

const Tramites: React.FC = () => {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [nombre, setNombre] = useState("");
  const [letra, setLetra] = useState("");
  const [loading, setLoading] = useState(true);
  const [tramiteEditando, setTramiteEditando] = useState<Tramite | null>(null);

  useEffect(() => {
    cargarTramites();
  }, []);

  const cargarTramites = async () => {
    try {
      const data = await TramitesService.getAll();
      setTramites(data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar trámites");
    } finally {
      setLoading(false);
    }
  };

  const editarTramite = (tramite: Tramite) => {
    setTramiteEditando(tramite);
    setNombre(tramite.nombre);
    setLetra(tramite.letra);
  };

  const guardarTramite = async () => {
    if (!nombre || !letra) return;

    try {
      if (tramiteEditando) {
        const actualizado = await TramitesService.update(tramiteEditando.id, {
          nombre,
          letra,
        });

        setTramites(
          tramites.map((t) =>
            t.id === actualizado.id ? actualizado : t
          )
        );
      } else {
        const nuevo = await TramitesService.create({ nombre, letra });
        setTramites([nuevo, ...tramites]);
      }

      setNombre("");
      setLetra("");
      setTramiteEditando(null);
    } catch (error) {
      console.error(error);
      alert("Error al guardar trámite");
    }
  };

  const eliminarTramite = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este trámite?")) return;

    try {
      await TramitesService.remove(id);
      setTramites(tramites.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar trámite");
    }
  };

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

      <Menu />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Trámites
          </div>

          <div className="p-4 text-sm">
            <p className="mb-2 font-medium">
              Total de Registros: {tramites.length}
            </p>

            {loading ? (
              <p>Cargando...</p>
            ) : (
              <table className="w-full border border-gray-300 text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-3 py-2">Trámite</th>
                    <th className="border px-3 py-2 w-20">Letra</th>
                    <th className="border px-3 py-2 w-64">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tramites.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-100">
                      <td className="border px-3 py-2">{t.nombre}</td>
                      <td className="border px-3 py-2 text-center">
                        {t.letra}
                      </td>
                      <td className="border px-3 py-2 space-x-2 text-sm">
  <button
    onClick={() => editarTramite(t)}
    className="text-blue-600 hover:underline"
  >
    Modificar Trámite
  </button>

  /

  <button
    className="text-green-600 hover:underline"
  >
    Definir Conceptos
  </button>

  /

  <button
    onClick={() => eliminarTramite(t.id)}
    className="text-red-600 hover:underline"
  >
    Eliminar
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            {tramiteEditando ? "Editar Trámite" : "Agregar Trámite"}
          </div>

          <div className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-4 gap-4 items-center">
              <label className="font-medium">Nombre del Trámite</label>
              <input
                type="text"
                className="col-span-3 border rounded px-3 py-2"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <label className="font-medium">Letra</label>
              <input
                type="text"
                maxLength={1}
                className="w-20 border rounded px-3 py-2"
                value={letra}
                onChange={(e) =>
                  setLetra(e.target.value.toUpperCase())
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={guardarTramite}
                className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800"
              >
                {tramiteEditando ? "Actualizar" : "Agregar"}
              </button>

              <button
                onClick={() => {
                  setNombre("");
                  setLetra("");
                  setTramiteEditando(null);
                }}
                className="bg-gray-300 px-5 py-2 rounded-full text-sm hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Tramites;
