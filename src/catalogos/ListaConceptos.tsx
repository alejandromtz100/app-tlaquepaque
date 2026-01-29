import React, { useEffect, useState } from "react";
import axios from "axios";

/* =========================
   Interface
========================= */
interface Concepto {
  id: number;
  nombre: string;
  observaciones: string | null;
  medicion: string | null;
  costo: string | null;
  porcentaje: string | null;
  cuenta_tesoreria: string | null;
  estado: boolean;
  nivel: number;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

/* =========================
   Componente
========================= */
const ListaConceptos: React.FC = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔍 filtros
  const [filtroConcepto, setFiltroConcepto] = useState("");
  const [filtroCuenta, setFiltroCuenta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"" | "activo" | "inactivo">("");

  useEffect(() => {
    obtenerConceptos();
  }, []);

  const obtenerConceptos = async () => {
    try {
      const response = await axios.get("http://localhost:3001/conceptos");
      setConceptos(response.data);
    } catch (error) {
      console.error("Error al obtener conceptos:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTRO COMBINADO
  ========================= */
  const conceptosFiltrados = conceptos.filter((concepto) => {
    const coincideConcepto = concepto.nombre
      .toLowerCase()
      .includes(filtroConcepto.toLowerCase());

    const coincideCuenta = (concepto.cuenta_tesoreria ?? "")
      .toLowerCase()
      .includes(filtroCuenta.toLowerCase());

    const coincideEstado =
      filtroEstado === ""
        ? true
        : filtroEstado === "activo"
        ? concepto.estado
        : !concepto.estado;

    return coincideConcepto && coincideCuenta && coincideEstado;
  });

  if (loading) {
    return <div className="p-6">Cargando listado de conceptos...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Listado de Conceptos
      </h1>

      {/* 🔍 BUSCADOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por concepto"
          value={filtroConcepto}
          onChange={(e) => setFiltroConcepto(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
          type="text"
          placeholder="Buscar por cuenta tesorería"
          value={filtroCuenta}
          onChange={(e) => setFiltroCuenta(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <select
          value={filtroEstado}
          onChange={(e) =>
            setFiltroEstado(e.target.value as "" | "activo" | "inactivo")
          }
          className="border px-3 py-2 rounded"
        >
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* 📊 TABLA */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Concepto</th>
              <th className="border px-3 py-2">Observaciones</th>
              <th className="border px-3 py-2">Medición</th>
              <th className="border px-3 py-2">Costo</th>
              <th className="border px-3 py-2">Porcentaje</th>
              <th className="border px-3 py-2">Cuenta Tesorería</th>
              <th className="border px-3 py-2">Estado</th>
              <th className="border px-3 py-2">Creación</th>
              <th className="border px-3 py-2">Modificación</th>
            </tr>
          </thead>

          <tbody>
            {conceptosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="border px-3 py-4 text-center text-gray-500"
                >
                  No hay conceptos registrados
                </td>
              </tr>
            )}

            {conceptosFiltrados.map((concepto) => (
              <tr key={concepto.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2 text-center">
                  {concepto.id}
                </td>

                <td className="border px-3 py-2">
                  {concepto.nombre}
                </td>

                <td className="border px-3 py-2">
                  {concepto.observaciones ?? "-"}
                </td>

                <td className="border px-3 py-2 text-center">
                  {concepto.medicion ?? "-"}
                </td>

                <td className="border px-3 py-2 text-right">
                  {concepto.costo ?? "-"}
                </td>

                <td className="border px-3 py-2 text-right">
                  {concepto.porcentaje ?? "-"}
                </td>

                <td className="border px-3 py-2">
                  {concepto.cuenta_tesoreria ?? "-"}
                </td>

                <td className="border px-3 py-2 text-center">
                  {concepto.estado ? (
                    <span className="text-green-600 font-semibold">
                      Activo
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Inactivo
                    </span>
                  )}
                </td>

                <td className="border px-3 py-2">
                  {new Date(concepto.created_at).toLocaleDateString()}
                </td>

                <td className="border px-3 py-2">
                  {new Date(concepto.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaConceptos;
