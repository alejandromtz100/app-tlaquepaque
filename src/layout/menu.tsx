import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [permisos] = useState(() => {
    try {
      const usuarioData = localStorage.getItem("usuario");
      if (!usuarioData) return { esAdmin: false, puedeVerEstadisticas: false };
      const usuario = JSON.parse(usuarioData);
      const esAdminUser = usuario.rol === "ADMIN";
      return { esAdmin: esAdminUser, puedeVerEstadisticas: esAdminUser };
    } catch {
      return { esAdmin: false, puedeVerEstadisticas: false };
    }
  });
  const { esAdmin, puedeVerEstadisticas } = permisos;
  const navigate = useNavigate();

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const goTo = (path: string) => {
    navigate(path);
    setOpenMenu(null); // cierra el menú al navegar
  };

  return (
    <nav className="bg-black text-white relative">
      {/* Overlay para cerrar menús al hacer clic fuera */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}
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
            { label: "Buscar obra", path: "/buscar-obra" },
          ]}
          onSelect={goTo}
        />

        {/* Reportes */}
        <Dropdown
          title="Reportes"
          open={openMenu === "reportes"}
          onClick={() => toggleMenu("reportes")}
          items={[
            { label: "Reporte de número oficiales de obra", path: "/reportes/numero-oficiales-obra" },
            { label: "Reporte de licencias", path: "/reportes/rep_Licencias/RepLicenciasPage" },
            { label: "Reporte de obras", path: "/reportes/rep_obras/RepObrasPage" },
            ...(puedeVerEstadisticas ? [{ label: "Estadísticas de pagos", path: "/estadisticas" }] : []),
          ]}
          onSelect={goTo}
        />

        {/* Administradores - Solo visible para ADMIN */}
        {esAdmin && (
          <Dropdown
            title="Administradores"
            open={openMenu === "administradores"}
            onClick={() => toggleMenu("administradores")}
            items={[
              { label: "Gestión", path: "/administradores" },
              { label: "Alertas", path: "/alertas" },
            ]}
            onSelect={goTo}
          />
        )}
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
