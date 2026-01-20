import React from "react";
import {
  FaKey,
  FaSearch,
  FaEdit,
  FaPlusCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import Menu from "../layout/menu";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
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
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white transition">
            <FaSignOutAlt />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Menu separado */}
      <Menu />

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Datos de la cuenta</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="font-semibold">Nombre:</p><p>Carlos Alvarado Saucedo</p>
            <p className="font-semibold">Teléfono:</p><p>3562-7060</p>
            <p className="font-semibold">Cargo:</p><p>Técnico Especializado</p>
            <p className="font-semibold">Área:</p><p>Licencias</p>
            <p className="font-semibold">Permiso:</p><p>Administrador</p>
            <p className="font-semibold">Fecha creación:</p><p>19/12/2008</p>
            <p className="font-semibold">Último acceso:</p><p>20/01/2026 09:34 a.m.</p>
            <p className="font-semibold">Última modificación:</p><p>16/08/2017 07:25 a.m.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-6 text-center">¿Qué desea hacer?</h2>
          <div className="flex flex-col gap-4">
            <Action icon={<FaPlusCircle />} text="Capturar obra" />
            <Action icon={<FaEdit />} text="Modificar obra" />
            <Action icon={<FaSearch />} text="Buscar obra" />
            <Action icon={<FaKey />} text="Cambiar mi clave" />
          </div>
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

const Action = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <button className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-100 transition">
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </button>
);

export default Home;
