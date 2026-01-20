import React, { useState } from "react";

import Menu from "../layout/menu";

interface Tramite {
  id: number;
  nombre: string;
  letra: string;
}

const Tramites: React.FC = () => {
  const [tramites, setTramites] = useState<Tramite[]>([
    { id: 1, nombre: "Alineamiento", letra: "A" },
    { id: 2, nombre: "AMPLIACION HABITACIONAL MENOR", letra: "L" },
    { id: 3, nombre: "Habitabilidad", letra: "H" },
    { id: 4, nombre: "Licencia Mayor", letra: "L" },
    { id: 5, nombre: "Licencia Menor", letra: "L" },
    { id: 6, nombre: "Licencia sin conceptos", letra: "L" },
    { id: 7, nombre: "Prueba", letra: "P" },
    { id: 8, nombre: "Trámite de Prueba", letra: "J" },
  ]);

  const [nombre, setNombre] = useState("");
  const [letra, setLetra] = useState("");

  const agregarTramite = () => {
    if (!nombre || !letra) return;

    setTramites([
      ...tramites,
      { id: Date.now(), nombre, letra },
    ]);

    setNombre("");
    setLetra("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* TABLA DE TRÁMITES */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Trámites
          </div>

          <div className="p-4 text-sm">
            <p className="mb-2 font-medium">
              Total de Registros: {tramites.length}
            </p>

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
                    <td className="border px-3 py-2 text-center">{t.letra}</td>
                    <td className="border px-3 py-2 text-blue-600 space-x-2">
                      <button className="hover:underline">
                        Modificar Trámite
                      </button>
                      /
                      <button className="hover:underline">
                        Definir Conceptos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AGREGAR / EDITAR */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Agregar / Editar Trámite
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
                onChange={(e) => setLetra(e.target.value.toUpperCase())}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={agregarTramite}
                className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setNombre("");
                  setLetra("");
                }}
                className="bg-gray-300 px-5 py-2 rounded-full text-sm hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
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

export default Tramites;
