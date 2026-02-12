import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const goTo = (path: string) => {
    navigate(path);
    setOpenMenu(null); // cierra el menú al navegar
  };

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-center gap-10 text-sm font-medium relative">
        {/* Inicio */}
        <span
          onClick={() => goTo("/home")}
          className="cursor-pointer hover:text-gray-300"
        >
          Inicio
        </span>

        {/* Catálogos */}
        <Dropdown
          title="Catálogos"
          open={openMenu === "catalogos"}
          onClick={() => toggleMenu("catalogos")}
          items={[
            { label: "Colonias", path: "/catalogos/Colonias" },
            { label: "Trámites", path: "/catalogos/tramites" },
            { label: "Conceptos", path: "/catalogos/conceptos" },
            { label: "Directores de obra", path: "/catalogos/directores" },
            { label: "Listado de conceptos", path: "/catalogos/ListaConceptos" },
          ]}
          onSelect={goTo}
        />

        {/* Usuarios */}
        <Dropdown
          title="Usuarios"
          open={openMenu === "usuarios"}
          onClick={() => toggleMenu("usuarios")}
          items={[
            { label: "Usuarios registrados", path: "/usuarios" },
            { label: "Asignaciones especiales", path: "/usuarios/asignaciones" },
          ]}
          onSelect={goTo}
        />

        {/* Obras */}
        <Dropdown
          title="Obras"
          open={openMenu === "obras"}
          onClick={() => toggleMenu("obras")}
          items={[
            { label: "Listado de obras registradas", path: "/obras" },
          ]}
          onSelect={goTo}
        />

        {/* Reportes */}
        <Dropdown
          title="Reportes"
          open={openMenu === "reportes"}
          onClick={() => toggleMenu("reportes")}
          items={[
            
          ]}
          onSelect={goTo}
        />
      </div>
    </nav>
  );
};

const Dropdown = ({
  title,
  open,
  onClick,
  items,
  onSelect,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  items: { label: string; path: string }[];
  onSelect: (path: string) => void;
}) => (
  <div className="relative">
    <button
      onClick={onClick}
      className="flex items-center gap-1 hover:text-gray-300"
    >
      {title} <FaChevronDown size={12} />
    </button>

    {open && (
      <div className="absolute top-8 left-0 bg-white text-black rounded-xl shadow-lg w-64 py-2 z-50">
        {items.map((item) => (
          <div
            key={item.path}
            onClick={() => onSelect(item.path)}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          >
            {item.label}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Menu;
