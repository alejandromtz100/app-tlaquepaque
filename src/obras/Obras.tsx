import { useEffect, useState } from "react";
import { Pencil, Copy, Printer, Paperclip } from "lucide-react";

interface Obra {
  id: number;
  consecutivo: string;
  captura: string;
  propietario: string;
  calle: string;
  noOficial: string;
  colonia: string;
  estadoObra: string;
  estadoPago: string;
}

export default function Obras() {

  const [obras, setObras] = useState<Obra[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const registrosPorPagina = 12;

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
    `${o.consecutivo} ${o.propietario} ${o.colonia}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // PAGINACIÓN
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const visibles = filtradas.slice(inicio, inicio + registrosPorPagina);
  const totalPaginas = Math.ceil(filtradas.length / registrosPorPagina);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="bg-white rounded-xl shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">

          <h2 className="text-xl font-semibold text-gray-700">
            Obras
          </h2>

          <input
            placeholder="Buscar..."
            className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-400"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        {/* TABLA CON SCROLL */}
        <div className="max-h-[500px] overflow-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 sticky top-0 shadow-sm">
              <tr className="text-gray-600 text-xs uppercase">
                <th className="p-2 text-left">Consecutivo</th>
                <th className="p-2">Captura</th>
                <th className="p-2 text-left">Propietario</th>
                <th className="p-2 text-left">Calle / No.</th>
                <th className="p-2 text-left">Colonia</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Pago</th>
                <th className="p-2">Opciones</th>
              </tr>
            </thead>

            <tbody>
              {visibles.map((o) => (
                <tr
                  key={o.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-2 font-medium">{o.consecutivo}</td>

                  <td className="p-2 text-center">
                    {new Date(o.captura).toLocaleDateString("es-MX")}
                  </td>

                  <td className="p-2">{o.propietario}</td>

                  <td className="p-2">
                    <div>{o.calle}</div>
                    <div className="text-xs text-gray-500">
                      {o.noOficial}
                    </div>
                  </td>

                  <td className="p-2">
                    {o.colonia}
                  </td>

                  {/* ESTADO OBRA */}
                  <td className="p-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${o.estadoObra === "Verificado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"}`}>
                      {o.estadoObra}
                    </span>
                  </td>

                  {/* ESTADO PAGO */}
                  <td className="p-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${o.estadoPago === "Pagado"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"}`}>
                      {o.estadoPago}
                    </span>
                  </td>

                  {/* OPCIONES ICONOS */}
                  <td className="p-2">
                    <div className="flex justify-center gap-2">

                      <button className="p-1 hover:bg-blue-100 rounded">
                        <Pencil size={18} />
                      </button>

                      <button className="p-1 hover:bg-green-100 rounded">
                        <Copy size={18} />
                      </button>

                      <button className="p-1 hover:bg-purple-100 rounded">
                        <Printer size={18} />
                      </button>

                      <button className="p-1 hover:bg-yellow-100 rounded">
                        <Paperclip size={18} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER PAGINACIÓN */}
        <div className="flex justify-between items-center p-3 border-t bg-gray-50 text-sm">

          <span>
            Registros: {filtradas.length}
          </span>

          <div className="flex gap-2">

            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ◀
            </button>

            <span>
              {paginaActual} / {totalPaginas}
            </span>

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ▶
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
