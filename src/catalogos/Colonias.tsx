import React, { useState } from "react";
import Menu from "../layout/menu";

interface Colonia {
  id_colonias: number;
  nombre: string;
  densidad: string;
}

const Colonias: React.FC = () => {
  const [search, setSearch] = useState("");
  const [densidad, setDensidad] = useState("TODAS");
  const [showModal, setShowModal] = useState(false);
  const [newColonia, setNewColonia] = useState({
  nombre: "",
  densidad: "Densidad alta",
});
const [isEditing, setIsEditing] = useState(false);
const [editingId, setEditingId] = useState<number | null>(null);


  // 🔹 Datos temporales (luego vendrán del backend)
  const [colonias, setColonias] = useState<Colonia[]>([
  { id_colonias: 1, nombre: "Centro", densidad: "Densidad alta" },
  { id_colonias: 2, nombre: "San Pedrito", densidad: "Densidad media" },
  { id_colonias: 3, nombre: "Miravalle", densidad: "Densidad baja" },
]);

const handleEditColonia = (colonia: Colonia) => {
  setNewColonia({
    nombre: colonia.nombre,
    densidad: colonia.densidad,
  });
  setEditingId(colonia.id_colonias);
  setIsEditing(true);
  setShowModal(true);
};

const handleSaveColonia = () => {
  if (!newColonia.nombre.trim()) return;

  if (isEditing && editingId !== null) {
    // ✏️ Editar
    setColonias(
      colonias.map((c) =>
        c.id_colonias === editingId
          ? { ...c, nombre: newColonia.nombre, densidad: newColonia.densidad }
          : c
      )
    );
  } else {
    // ➕ Crear
    const nueva: Colonia = {
      id_colonias: colonias.length + 1,
      nombre: newColonia.nombre,
      densidad: newColonia.densidad,
    };
    setColonias([...colonias, nueva]);
  }

  // Reset
  setNewColonia({ nombre: "", densidad: "Densidad alta" });
  setShowModal(false);
  setIsEditing(false);
  setEditingId(null);
};

const handleDeleteColonia = (id: number) => {
  if (!window.confirm("¿Seguro que deseas eliminar esta colonia?")) return;

  setColonias(colonias.filter((c) => c.id_colonias !== id));
};

  const filteredColonias = colonias.filter((c) => {
  const matchNombre = c.nombre
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchDensidad =
    densidad === "TODAS" || c.densidad === densidad;

  return matchNombre && matchDensidad;
});

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            Catálogo de Colonias
          </h1>
          <p className="text-sm text-gray-500">
            H. Ayuntamiento de Tlaquepaque
          </p>
        </div>
      </header>

      {/* Menu reutilizado */}
      <Menu />

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Buscador */}
         <div className="flex flex-wrap gap-4 items-center mb-4">
  {/* Buscar por nombre */}
  <input
    type="text"
    placeholder="Buscar Nombre colonia..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded-xl px-4 py-2 w-64 focus:outline-none focus:ring"
  />

  {/* Filtro por densidad */}
<select
  value={densidad}
  onChange={(e) => setDensidad(e.target.value)}
  className="border rounded-xl px-4 py-2 focus:outline-none focus:ring"
>
  <option value="TODAS">Todas las densidades</option>
  <option value="Densidad alta">Densidad alta</option>
  <option value="Densidad media">Densidad media</option>
  <option value="Densidad baja">Densidad baja</option>
  <option value="Densidad mínima">Densidad mínima</option>
</select>

{/* Botón agregar */}
<button
  onClick={() => setShowModal(true)}
  className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
>
  + Agregar colonia
</button>

</div>


          {/* Tabla */}
          <div className="overflow-x-auto">
           <table className="w-full border-collapse">
  <thead>
    <tr className="bg-gray-100 text-left text-sm">
      <th className="p-3 border">ID</th>
      <th className="p-3 border">Nombre</th>
      <th className="p-3 border">Densidad</th>
      <th className="p-3 border">Acciones</th>
    </tr>
  </thead>

             <tbody>
  {filteredColonias.map((colonia) => (
    <tr
      key={colonia.id_colonias}
      className="hover:bg-gray-50 text-sm"
    >
      <td className="p-3 border">{colonia.id_colonias}</td>
      <td className="p-3 border">{colonia.nombre}</td>
      <td className="p-3 border">{colonia.densidad}</td>
      <td className="p-3 border flex gap-2">
        <button
          onClick={() => handleEditColonia(colonia)}
          className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Editar
        </button>

        <button
          onClick={() => handleDeleteColonia(colonia.id_colonias)}
          className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
        >
          Eliminar
        </button>
      </td>
    </tr>
  ))}

  {filteredColonias.length === 0 && (
    <tr>
      <td colSpan={4} className="p-4 text-center text-gray-500">
        No se encontraron colonias
      </td>
    </tr>
  )}
</tbody>
</table>
</div>
          
</div>
        
 </main>
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
      <h2 className="text-lg font-bold mb-4">
  {isEditing ? "Editar colonia" : "Agregar colonia"}
</h2>


      <input
        type="text"
        placeholder="Nombre de la colonia"
        value={newColonia.nombre}
        onChange={(e) =>
          setNewColonia({ ...newColonia, nombre: e.target.value })
        }
        className="border rounded-xl px-4 py-2 w-full mb-4"
      />

      <select
        value={newColonia.densidad}
        onChange={(e) =>
          setNewColonia({ ...newColonia, densidad: e.target.value })
        }
        className="border rounded-xl px-4 py-2 w-full mb-6"
      >
        <option>Ninguna</option>
        <option>Densidad alta</option>
        <option>Densidad media</option>
        <option>Densidad baja</option>
        <option>Densidad mínima</option>
      </select>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-xl border hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
  onClick={handleSaveColonia}
  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
>
  {isEditing ? "Actualizar" : "Guardar"}
</button>
      </div>
    </div>
  </div>
)}


      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Colonias;
