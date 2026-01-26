import React, { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import Menu from "../layout/menu";
import { getConceptosArbol } from "../services/conceptos.service";
import type { Concepto } from "../types/concepto";
import { updateConcepto } from "../services/conceptos.service";

const Conceptos: React.FC = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [selected, setSelected] = useState<Concepto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Concepto>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    cargarConceptos();
  }, []);

  const ordenarArbol = (items: Concepto[]): Concepto[] => {
    return items
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
      .map((item) => ({
        ...item,
        children: item.children ? ordenarArbol(item.children) : [],
      }));
  };

  const cargarConceptos = async () => {
    const data = await getConceptosArbol();
    setConceptos(ordenarArbol(data));
  };

  const guardarCambios = async () => {
  if (!selected) return;

  try {
    setSaving(true);
    await updateConcepto(selected.id, form);
    await cargarConceptos();

    setSelected({ ...selected, ...form });
    setIsEditing(false);
  } catch {
    alert("Error al guardar cambios");
  } finally {
    setSaving(false);
  }
};

const filtrarArbol = (
  items: Concepto[],
  texto: string
): Concepto[] => {
  if (!texto) return items;

  return items
    .map((item) => {
      const hijos = item.children
        ? filtrarArbol(item.children, texto)
        : [];

      const coincide = item.nombre
        .toLowerCase()
        .includes(texto.toLowerCase());

      if (coincide || hijos.length > 0) {
        return {
          ...item,
          children: hijos,
        };
      }

      return null;
    })
    .filter(Boolean) as Concepto[];
};


  const renderArbol = (items: Concepto[], nivel = 0) => {
    return items.map((c) => (
      <div key={c.id}>
        <div
         onClick={() => {
           setSelected(c);
            setIsEditing(false);
            setForm(c);
            }}
          className={`cursor-pointer px-3 py-1 rounded-xl text-sm
            ${
              selected?.id === c.id
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          style={{ paddingLeft: `${nivel * 20 + 12}px` }}
        >
          {c.nombre}
        </div>

        {c.children && renderArbol(c.children, nivel + 1)}
      </div>
    ));
  };

const conceptosFiltrados = filtrarArbol(conceptos, search);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
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

      {/* MENU */}
      <Menu />

      {/* CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Árbol */}
          <div className="border rounded-xl p-4 overflow-y-auto max-h-[600px]">
  <h2 className="font-bold mb-3">Conceptos</h2>

  <input
    type="text"
    placeholder="Buscar concepto..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="mb-3 w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
  />

  {renderArbol(conceptosFiltrados)}
</div>

          {/* Detalle */}
          <div className="md:col-span-2 border rounded-xl p-6">
  {!selected ? (
    <p className="text-gray-500">
      Selecciona un concepto para ver su información
    </p>
  ) : (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isEditing ? "Editar concepto" : selected.nombre}
        </h2>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Editar
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

        <Campo
          label="Nombre"
          value={form.nombre ?? ""}
          disabled={!isEditing}
          onChange={(v) => setForm({ ...form, nombre: v })}
        />

        <Campo
          label="Medición"
          value={form.medicion ?? ""}
          disabled={!isEditing}
          onChange={(v) => setForm({ ...form, medicion: v })}
        />

        <Campo
          label="Costo"
          type="number"
          value={form.costo ?? ""}
          disabled={!isEditing}
          onChange={(v) => setForm({ ...form, costo: Number(v) })}
        />

        <Campo
          label="Porcentaje"
          type="number"
          value={form.porcentaje ?? ""}
          disabled={!isEditing}
          onChange={(v) =>
            setForm({ ...form, porcentaje: Number(v) })
          }
        />

        <Campo
          label="Observaciones"
          textarea
          value={form.observaciones ?? ""}
          disabled={!isEditing}
          onChange={(v) =>
            setForm({ ...form, observaciones: v })
          }
        />

        <div>
          <label className="block text-xs font-semibold mb-1">
            Estado
          </label>
          <select
            disabled={!isEditing}
            value={form.estado ?? "ACTIVO"}
            onChange={(e) =>
              setForm({ ...form, estado: e.target.value as any })
            }
            className="border rounded-xl px-3 py-2 w-full disabled:bg-gray-100"
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>

      {/* BOTONES */}
      {isEditing && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setIsEditing(false);
              setForm(selected);
            }}
            className="px-4 py-2 rounded-xl border"
          >
            Cancelar
          </button>

          <button
            disabled={saving}
            onClick={guardarCambios}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
          >
            Guardar cambios
          </button>
        </div>
      )}
    </>
  )}
</div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

interface CampoProps {
  label: string;
  value: any;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
  textarea?: boolean;
}

const Campo: React.FC<CampoProps> = ({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  textarea,
}) => (
  <div>
    <label className="block text-xs font-semibold mb-1">
      {label}
    </label>

    {textarea ? (
      <textarea
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-xl px-3 py-2 w-full disabled:bg-gray-100"
      />
    ) : (
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-xl px-3 py-2 w-full disabled:bg-gray-100"
      />
    )}
  </div>
);


export default Conceptos;
