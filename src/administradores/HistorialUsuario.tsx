import React, { useEffect, useState } from "react";
import { X, Calendar, FileEdit, Plus, Trash2, Search } from "lucide-react";
import { type Usuario } from "../services/usuarios.service";

interface AccionHistorial {
  id: number;
  fecha: string;
  hora: string;
  accion: string;
  tipo: "crear" | "modificar" | "eliminar" | "otro";
  entidad: string;
  detalles?: string;
  idEntidad?: number;
}

interface HistorialUsuarioProps {
  usuario: Usuario;
  onClose: () => void;
}

const HistorialUsuario: React.FC<HistorialUsuarioProps> = ({ usuario, onClose }) => {
  const [historial, setHistorial] = useState<AccionHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      // TODO: Conectar con endpoint del backend cuando esté disponible
      // Por ahora, simulamos datos de ejemplo
      // const response = await fetch(`http://localhost:3001/usuarios/${usuario.id_usuarios}/historial`);
      // const data = await response.json();
      // setHistorial(data);

      // Datos de ejemplo (eliminar cuando se conecte al backend)
      const datosEjemplo: AccionHistorial[] = [
        {
          id: 1,
          fecha: "2026-02-13",
          hora: "10:30:45",
          accion: "Creó una nueva obra",
          tipo: "crear",
          entidad: "Obra",
          detalles: "Obra ID: 123",
          idEntidad: 123,
        },
        {
          id: 2,
          fecha: "2026-02-13",
          hora: "09:15:22",
          accion: "Modificó datos de propietario",
          tipo: "modificar",
          entidad: "Obra",
          detalles: "Obra ID: 120",
          idEntidad: 120,
        },
        {
          id: 3,
          fecha: "2026-02-12",
          hora: "16:45:10",
          accion: "Registró nueva colonia",
          tipo: "crear",
          entidad: "Colonia",
          detalles: "Colonia: Centro",
        },
        {
          id: 4,
          fecha: "2026-02-12",
          hora: "14:20:33",
          accion: "Actualizó información de obra",
          tipo: "modificar",
          entidad: "Obra",
          detalles: "Obra ID: 115",
          idEntidad: 115,
        },
      ];

      setHistorial(datosEjemplo);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      alert("Error al cargar el historial del usuario");
    } finally {
      setLoading(false);
    }
  };

  const historialFiltrado = historial.filter((item) => {
    const matchBusqueda =
      item.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.entidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.detalles && item.detalles.toLowerCase().includes(busqueda.toLowerCase()));

    const matchTipo = filtroTipo === "TODOS" || item.tipo === filtroTipo;

    return matchBusqueda && matchTipo;
  });

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case "crear":
        return <Plus size={18} className="text-green-600" />;
      case "modificar":
        return <FileEdit size={18} className="text-blue-600" />;
      case "eliminar":
        return <Trash2 size={18} className="text-red-600" />;
      default:
        return <FileEdit size={18} className="text-gray-600" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case "crear":
        return "bg-green-100 text-green-700";
      case "modificar":
        return "bg-blue-100 text-blue-700";
      case "eliminar":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const nombreCompleto = `${usuario.nombre || ""} ${usuario.ap_paterno || ""} ${usuario.ap_materno || ""}`.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Historial de Usuario</h2>
            <p className="text-sm text-gray-300 mt-1">
              {nombreCompleto} ({usuario.usuario})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* FILTROS */}
        <div className="p-4 border-b flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar en historial..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="crear">Crear</option>
            <option value="modificar">Modificar</option>
            <option value="eliminar">Eliminar</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Cargando historial...
            </div>
          ) : historialFiltrado.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No se encontraron registros en el historial
            </div>
          ) : (
            <div className="space-y-4">
              {historialFiltrado.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getIconoTipo(item.tipo)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{item.accion}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getColorTipo(item.tipo)}`}
                        >
                          {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Entidad:</span> {item.entidad}
                        {item.idEntidad && ` (ID: ${item.idEntidad})`}
                      </div>
                      {item.detalles && (
                        <div className="text-sm text-gray-500 mb-2">{item.detalles}</div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        <span>
                          {new Date(item.fecha).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          a las {item.hora}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total de registros: {historialFiltrado.length}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialUsuario;
