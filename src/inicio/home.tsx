import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaKey,
  FaSearch,
  FaEdit,
  FaPlusCircle,
  FaSignOutAlt,
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Datos de la cuenta</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="font-semibold">Nombre</p>
            <p>{usuario.nombre}</p>
            <p className="font-semibold">Teléfono</p>
            <p>{usuario.telefono ?? "—"}</p>
            <p className="font-semibold">Cargo</p>
            <p>{usuario.cargo ?? usuario.funcion ?? "—"}</p>
            <p className="font-semibold">Área</p>
            <p>{usuario.area ?? "—"}</p>
            <p className="font-semibold">Permiso</p>
            <p>{permisoLabel}</p>
            <p className="font-semibold">Fecha de creación</p>
            <p>{formatFecha(usuario.fechaCreacion)}</p>
            <p className="font-semibold">Último acceso</p>
            <p>{formatFechaHora(usuario.ultimoAcceso)}</p>
            <p className="font-semibold">Última modificación</p>
            <p>{usuario.ultimaModificacion ? formatFechaHora(usuario.ultimaModificacion) : "—"}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-6 text-center">
            ¿Qué desea hacer?
          </h2>

          <div className="flex flex-col gap-4">
            <Action 
              icon={<FaPlusCircle />} 
              text="Capturar obra" 
              onClick={() => navigate("/paso1obras")}
            />
            <Action 
              icon={<FaEdit />} 
              text="Modificar obra" 
              onClick={() => navigate("/obras")}
            />
            <Action 
              icon={<FaSearch />} 
              text="Buscar obra" 
              onClick={() => navigate("/buscar-obra")}
            />
            <Action
              icon={<FaKey />}
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

const Action = ({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-100 transition w-full text-left"
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </button>
);

export default Home;
