import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Copy, Printer, Paperclip, Plus } from "lucide-react";
import Menu from "../layout/menu";

interface Obra {
  id: number;
  consecutivo: string;
  captura: string;
  propietario: string;
  calle: string;
  noOficial: string;
  colonia: string;
  coloniaDensidad?: string;
  estadoObra: string;
  estadoPago: string;
}

const Obras: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const registrosPorPagina = 5;

  useEffect(() => {
    fetch("http://localhost:3001/op_obras/listado")
      .then(res => res.json())
      .then(data => {
        const ordenadas = data.sort(
          (a: Obra, b: Obra) =>
            new Date(b.captura).getTime() -
            new Date(a.captura).getTime()
        );
        setObras(ordenadas);
      });
  }, []);

  // BUSCADOR
  const filtradas = obras.filter(o =>
    `${o.consecutivo} ${o.propietario} ${o.colonia} ${o.coloniaDensidad ?? ''}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // PAGINACIÓN
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const visibles = filtradas.slice(inicio, inicio + registrosPorPagina);
  const totalPaginas = Math.ceil(filtradas.length / registrosPorPagina);

  const maxButtons = 5;
  let startPage = Math.max(1, paginaActual - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;
  if (endPage > totalPaginas) {
    endPage = totalPaginas;
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
            placeholder="Buscar obra..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="border rounded-xl px-4 py-2 w-64"
          />
          <button
            onClick={() => navigate("/obras/paso1")}
            className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
          >
            <Plus size={18} />
            Nueva obra
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Obras
          </div>

          <div className="p-4 text-sm">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-3 py-2 text-left">Consecutivo</th>
                  <th className="border px-3 py-2">Captura</th>
                  <th className="border px-3 py-2 text-left">Propietario</th>
                  <th className="border px-3 py-2 text-left">Números oficiales</th>
                  <th className="border px-3 py-2 text-left">Colonia</th>
                  <th className="border px-3 py-2">Estado</th>
                  <th className="border px-3 py-2">Pago</th>
                  <th className="border px-3 py-2">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-100 transition">
                    <td className="border px-3 py-2 font-medium">{o.consecutivo}</td>
                    <td className="border px-3 py-2 text-center">
                      {new Date(o.captura).toLocaleDateString("es-MX")}
                    </td>
                    <td className="border px-3 py-2">{o.propietario}</td>
                    <td className="border px-3 py-2">
                      {o.noOficial ? (
                        (() => {
                          const m = o.noOficial.match(/^(.*No\.\s*)(.+)$/);
                          return m ? <>{m[1]}<span className="text-gray-500">{m[2]}</span></> : o.noOficial;
                        })()
                      ) : "-"}
                    </td>
                    <td className="border px-3 py-2">
                      <div>{o.colonia}</div>
                      {o.coloniaDensidad && (
                        <div className="text-xs text-gray-500">{o.coloniaDensidad}</div>
                      )}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${o.estadoObra === "Verificado"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"}`}>
                        {o.estadoObra}
                      </span>
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${o.estadoPago === "Pagado"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"}`}>
                        {o.estadoPago}
                      </span>
                    </td>
                    <td className="border px-3 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate("/obras/paso1", { state: { id: o.id } })}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Copy size={18} />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Printer size={18} />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Paperclip size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINACIÓN */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
              <span className="text-gray-600">
                Mostrando {inicio + 1} - {Math.min(inicio + visibles.length, filtradas.length)} de {filtradas.length} registros
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                  title="Primera página"
                >
                  ««
                </button>
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                  title="Anterior"
                >
                  ‹
                </button>
                {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                  const page = startPage + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setPaginaActual(page)}
                      className={`px-3 py-1 rounded-lg border transition ${
                        paginaActual === page ? "bg-black text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                  title="Siguiente"
                >
                  ›
                </button>
                <button
                  onClick={() => setPaginaActual(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                  title="Última página"
                >
                  »»
                </button>
              </div>
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

export default Obras;
