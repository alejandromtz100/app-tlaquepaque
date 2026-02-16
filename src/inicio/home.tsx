import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaKey,
  FaSearch,
  FaEdit,
  FaPlusCircle,
  FaSignOutAlt,
  FaUser,
  FaPhone,
  FaBriefcase,
  FaBuilding,
  FaShieldAlt,
  FaCalendarPlus,
  FaClock,
  FaPencilAlt,
} from "react-icons/fa";
import Menu from "../layout/menu";


interface Usuario {
  id: number;
  nombre: string;
  telefono: number | string;
  rol: string;
  estado: string;
  funcion?: string;
  cargo?: string;
  area?: string;
  fechaCreacion?: string | null;
  ultimoAcceso?: string | null;
  ultimaModificacion?: string | null;
}


const Home: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("usuario");

    if (!data) {
      navigate("/");
    } else {
      setUsuario(JSON.parse(data));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const formatFecha = (iso: string | null | undefined) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatFechaHora = (iso: string | null | undefined) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const permisoLabel =
    usuario?.rol === "ADMIN" ? "Administrador" : usuario?.rol === "USUARIO" ? "Usuario" : usuario?.rol ?? "—";

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white transition"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <Menu />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Encabezado con avatar e identidad */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-5 py-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold shrink-0">
              {usuario.nombre
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{usuario.nombre}</h2>
              <p className="text-gray-300 text-xs">{permisoLabel}</p>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DataRow icon={<FaUser className="text-gray-400" />} label="Nombre" value={usuario.nombre} />
            <DataRow icon={<FaPhone className="text-gray-400" />} label="Teléfono" value={usuario.telefono ?? "—"} />
            <DataRow icon={<FaBriefcase className="text-gray-400" />} label="Cargo" value={usuario.cargo ?? usuario.funcion ?? "—"} />
            <DataRow icon={<FaBuilding className="text-gray-400" />} label="Área" value={usuario.area ?? "—"} />
            <DataRow icon={<FaShieldAlt className="text-gray-400" />} label="Permiso" value={permisoLabel} />
            <DataRow icon={<FaCalendarPlus className="text-gray-400" />} label="Creación" value={formatFecha(usuario.fechaCreacion)} />
            <DataRow icon={<FaClock className="text-gray-400" />} label="Último acceso" value={formatFechaHora(usuario.ultimoAcceso)} />
            <DataRow icon={<FaPencilAlt className="text-gray-400" />} label="Última modif." value={usuario.ultimaModificacion ? formatFechaHora(usuario.ultimaModificacion) : "—"} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Encabezado similar al de datos del usuario */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-5 py-3">
            <h2 className="text-lg font-bold tracking-tight">¿Qué desea hacer?</h2>
            <p className="text-gray-300 text-xs mt-0.5">Acciones rápidas</p>
          </div>

          <div className="p-5 grid grid-cols-1 gap-4">
            <Action
              icon={<FaPlusCircle className="text-gray-400" />}
              text="Capturar obra"
              onClick={() => navigate("/paso1obras")}
            />
            <Action
              icon={<FaEdit className="text-gray-400" />}
              text="Modificar obra"
              onClick={() => navigate("/obras")}
            />
            <Action
              icon={<FaSearch className="text-gray-400" />}
              text="Buscar obra"
              onClick={() => navigate("/buscar-obra")}
            />
            <Action
              icon={<FaKey className="text-gray-400" />}
              text="Cambiar mi clave"
              onClick={() => navigate("/cambiar-clave")}
            />
          </div>
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

const DataRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="flex items-start gap-3 py-3.5 px-4 rounded-xl bg-gray-50 border border-gray-100 min-h-[4rem]">
    <span className="w-9 h-9 flex items-center justify-center shrink-0 text-lg rounded-lg bg-gray-100">{icon}</span>
    <div className="flex-1 min-w-0 pt-0.5">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

const Action = ({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 py-3.5 px-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition w-full text-left min-h-[3.5rem]"
  >
    <span className="w-9 h-9 flex items-center justify-center shrink-0 text-lg rounded-lg bg-gray-100">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-800 font-medium">{text}</p>
    </div>
  </button>
);

export default Home;
