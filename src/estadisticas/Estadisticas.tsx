import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Menu from "../layout/menu";
import { FaChartBar, FaDollarSign, FaFileInvoiceDollar } from "react-icons/fa";

const API = "http://localhost:3001/estadisticas";

interface EstadisticaPago {
  estadoPago: string;
  cantidad: number;
  total: number;
}

interface EstadisticasResponse {
  estadisticas: EstadisticaPago[];
  totalGeneral: number;
  totalCantidad: number;
  fechaInicio?: string;
  fechaFin?: string;
}

const COLORS = {
  "Pagado": "#22c55e",
  "Sin Pagar": "#ef4444",
};

const Estadisticas: React.FC = () => {
  const navigate = useNavigate();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      navigate("/");
      return;
    }
    cargarEstadisticas();
  }, [navigate]);

  const cargarEstadisticas = async () => {
    setCargando(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);

      const res = await fetch(`${API}/pagos?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data: EstadisticasResponse = await res.json();
      setEstadisticas(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar estadísticas");
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(monto);
  };

  const datosGrafico = estadisticas?.estadisticas.map((e) => ({
    name: e.estadoPago,
    value: e.total,
    cantidad: e.cantidad,
  })) || [];

  const datosBarras = estadisticas?.estadisticas.map((e) => ({
    name: e.estadoPago,
    total: e.total,
    cantidad: e.cantidad,
  })) || [];

  const obtenerColor = (nombre: string) => {
    return COLORS[nombre as keyof typeof COLORS] || "#6b7280";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            Sistema de Control de la Edificación ALCH
          </h1>
          <p className="text-sm text-gray-500">H. Ayuntamiento de Tlaquepaque</p>
        </div>
      </header>

      <Menu />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Estadísticas de Pagos
          </h2>
          <p className="text-gray-600">
            Visualiza los ingresos pagados, no pagados y por pagar
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtros por fecha</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={cargarEstadisticas}
                disabled={cargando}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50"
              >
                {cargando ? "Consultando..." : "Consultar"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {estadisticas && (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <TarjetaResumen
                titulo="Total Pagado"
                valor={formatearMoneda(
                  estadisticas.estadisticas.find((e) => e.estadoPago === "Pagado")?.total || 0
                )}
                cantidad={
                  estadisticas.estadisticas.find((e) => e.estadoPago === "Pagado")?.cantidad || 0
                }
                color="green"
                icono={<FaDollarSign />}
              />
              <TarjetaResumen
                titulo="Sin Pagar"
                valor={formatearMoneda(
                  estadisticas.estadisticas.find((e) => e.estadoPago === "Sin Pagar")?.total || 0
                )}
                cantidad={
                  estadisticas.estadisticas.find((e) => e.estadoPago === "Sin Pagar")?.cantidad || 0
                }
                color="red"
                icono={<FaFileInvoiceDollar />}
              />
              <TarjetaResumen
                titulo="Total General"
                valor={formatearMoneda(estadisticas.totalGeneral)}
                cantidad={estadisticas.totalCantidad}
                color="blue"
                icono={<FaChartBar />}
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de pastel */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Distribución por Estado de Pago</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosGrafico}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={obtenerColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => formatearMoneda(value ?? 0)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de barras */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Comparativa de Totales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosBarras}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number | undefined) => formatearMoneda(value ?? 0)} />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total (MXN)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla de detalles */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Detalle por Estado</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-semibold">Estado de Pago</th>
                      <th className="text-right py-2 px-4 font-semibold">Cantidad</th>
                      <th className="text-right py-2 px-4 font-semibold">Total</th>
                      <th className="text-right py-2 px-4 font-semibold">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.estadisticas.map((est) => (
                      <tr key={est.estadoPago} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{est.estadoPago}</td>
                        <td className="text-right py-2 px-4">{est.cantidad}</td>
                        <td className="text-right py-2 px-4 font-medium">
                          {formatearMoneda(est.total)}
                        </td>
                        <td className="text-right py-2 px-4">
                          {estadisticas.totalGeneral > 0
                            ? ((est.total / estadisticas.totalGeneral) * 100).toFixed(2)
                            : "0.00"}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

const TarjetaResumen = ({
  titulo,
  valor,
  cantidad,
  color,
  icono,
}: {
  titulo: string;
  valor: string;
  cantidad: number;
  color: "green" | "red" | "yellow" | "blue";
  icono: React.ReactNode;
}) => {
  const colores = {
    green: "bg-green-50 border-green-200 text-green-800",
    red: "bg-red-50 border-red-200 text-red-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className={`${colores[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">{titulo}</h4>
        <span className="text-xl">{icono}</span>
      </div>
      <p className="text-2xl font-bold">{valor}</p>
      <p className="text-sm mt-1 opacity-75">{cantidad} obras</p>
    </div>
  );
};

export default Estadisticas;