import React, { useEffect, useState } from "react";
import Menu from "../layout/menu";
import { getConceptosArbol } from "../services/conceptos.service";
import type { Concepto } from "../types/concepto";
import { updateConcepto } from "../services/conceptos.service";
import { createConcepto } from "../services/conceptos.service";
import { deleteConcepto } from "../services/conceptos.service";



const Conceptos: React.FC = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [selected, setSelected] = useState<Concepto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Concepto>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [nuevo, setNuevo] = useState<Partial<Concepto>>({});
  const [deleting, setDeleting] = useState(false);

  // Verificar permisos del usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const puedeModificar = !esSupervisor; // SUPERVISOR solo puede leer



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

  // Verificar permisos: SUPERVISOR no puede modificar
  if (esSupervisor) {
    alert("Los supervisores solo pueden visualizar información, no pueden modificar conceptos");
    return;
  }

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

  const lower = texto.toLowerCase();

  return items
    .map((item) => {
      const coincide = item.nombre.toLowerCase().includes(lower);

      // Si el padre coincide → regresar TODO el subárbol
      if (coincide) {
        return item;
      }

      // Si no coincide, revisar hijos
      const hijosFiltrados = item.children
        ? filtrarArbol(item.children, texto)
        : [];

      if (hijosFiltrados.length > 0) {
        return {
          ...item,
          children: hijosFiltrados,
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
            setIsCreating(false);
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

  const crearConcepto = async () => {
  // Verificar permisos: SUPERVISOR no puede crear
  if (esSupervisor) {
    alert("Los supervisores solo pueden visualizar información, no pueden crear conceptos");
    return;
  }

  if (!nuevo.nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  try {
    setSaving(true);

    const creado = await createConcepto({
      nombre: nuevo.nombre,
      observaciones: nuevo.observaciones,
      medicion: nuevo.medicion,
      costo: nuevo.costo,
      porcentaje: nuevo.porcentaje,
      estado: nuevo.estado ?? true,
      parent_id: nuevo.parent_id,
      cuenta_tesoreria: nuevo.cuenta_tesoreria,
    });

    await cargarConceptos();
    setSelected(creado);
    setIsCreating(false);
    setNuevo({});
  } catch {
    alert("Error al crear concepto");
  } finally {
    setSaving(false);
  }
};

const eliminarConcepto = async () => {
  if (!selected) return;

  // Verificar permisos: SUPERVISOR no puede eliminar
  if (esSupervisor) {
    alert("Los supervisores solo pueden visualizar información, no pueden eliminar conceptos");
    return;
  }

  const confirmar = window.confirm(
    `¿Deseas eliminar el concepto "${selected.nombre}"?\n\nEsta acción no se puede deshacer.`
  );

  if (!confirmar) return;

  try {
    setDeleting(true);
    await deleteConcepto(selected.id);
    await cargarConceptos();

    setSelected(null);
    setIsEditing(false);
    setIsCreating(false);
  } catch {
    alert(
      "No se puede eliminar el concepto.\n\nVerifica que no tenga conceptos hijos."
    );
  } finally {
    setDeleting(false);
  }
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
        </div>
      </header>

      {/* MENU */}
      <Menu />

      {/* CONTENT */}
      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          {/* HEADER DEL REPORTE */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Conceptos</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Catálogo de conceptos
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de conceptos</div>
                <div className="text-2xl font-bold">{conceptos.length}</div>
              </div>
            </div>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
              {puedeModificar && (
                <button
                  onClick={() => {
                    setIsCreating(true);
                    setIsEditing(false);
                    setSelected(null);
                    setNuevo({
                      parent_id: undefined,
                      estado: true,
                    });
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                >
                  + Nuevo concepto
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar concepto</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Mostrando <span className="font-semibold">{conceptosFiltrados.length}</span> conceptos en el árbol
            </div>
          </div>

          {/* CONTENIDO: ÁRBOL + DETALLE */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Árbol */}
<div className="border border-gray-300 rounded-xl p-4 overflow-y-auto max-h-[600px] bg-gray-50/50">
  <h2 className="font-bold mb-3 text-gray-800">Árbol de conceptos</h2>

  {renderArbol(conceptosFiltrados)}
</div>
{/* DETALLE */}
<div className="md:col-span-2 border border-gray-300 rounded-xl p-6 bg-white">

  {/* ===== CREAR CONCEPTO ===== */}
  {isCreating && (
    <>
      <h2 className="text-xl font-bold mb-4">
        Nuevo concepto
      </h2>
      {nuevo.parent_id && selected && (
  <p className="mb-3 text-sm text-gray-600">
    Se creará como sub-concepto de:{" "}
    <span className="font-semibold">
      {selected.nombre}
    </span>
  </p>
)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

        <Campo
          label="Nombre"
          value={nuevo.nombre ?? ""}
          onChange={(v) =>
            setNuevo({ ...nuevo, nombre: v })
          }
        />

        <Campo
          label="Medición"
          value={nuevo.medicion ?? ""}
          onChange={(v) =>
            setNuevo({ ...nuevo, medicion: v })
          }
        />

        <Campo
          label="Costo"
          type="number"
          value={nuevo.costo ?? ""}
          onChange={(v) =>
            setNuevo({ ...nuevo, costo: Number(v) })
          }
        />

        <Campo
          label="Porcentaje"
          type="number"
          value={nuevo.porcentaje ?? ""}
          onChange={(v) =>
            setNuevo({ ...nuevo, porcentaje: Number(v) })
          }
        />

        <div className="md:col-span-2">
          <Campo
            label="Observaciones"
            textarea
            value={nuevo.observaciones ?? ""}
            onChange={(v) =>
              setNuevo({ ...nuevo, observaciones: v })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Estado
          </label>
          <select
            value={nuevo.estado ? "true" : "false"}
            onChange={(e) =>
              setNuevo({
                ...nuevo,
                estado: e.target.value === "true",
              })
            }
            className="border rounded-xl px-3 py-2 w-full"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            setIsCreating(false);
            setNuevo({});
          }}
          className="px-4 py-2 rounded-xl border"
        >
          Cancelar
        </button>

        <button
          disabled={saving}
          onClick={crearConcepto}
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
        >
          Crear concepto
        </button>
      </div>
    </>
  )}

  {/* ===== VER / EDITAR CONCEPTO ===== */}
  {!isCreating && selected && (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isEditing ? "Editar concepto" : selected.nombre}
        </h2>

        {!isEditing && puedeModificar && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Editar
          </button>
        )}
        {!isEditing && puedeModificar && (
    <button
      onClick={eliminarConcepto}
      disabled={deleting}
      className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
    >
      Eliminar
    </button>
  )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

        <Campo
          label="Nombre"
          value={form.nombre ?? ""}
          disabled={!isEditing}
          onChange={(v) =>
            setForm({ ...form, nombre: v })
          }
        />

        <Campo
          label="Medición"
          value={form.medicion ?? ""}
          disabled={!isEditing}
          onChange={(v) =>
            setForm({ ...form, medicion: v })
          }
        />

        <Campo
          label="Costo"
          type="number"
          value={form.costo ?? ""}
          disabled={!isEditing}
          onChange={(v) =>
            setForm({ ...form, costo: Number(v) })
          }
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

        <div className="md:col-span-2">
          <Campo
            label="Observaciones"
            textarea
            value={form.observaciones ?? ""}
            disabled={!isEditing}
            onChange={(v) =>
              setForm({ ...form, observaciones: v })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Estado
          </label>
          <select
            disabled={!isEditing}
            value={form.estado ? "true" : "false"}
            onChange={(e) =>
              setForm({
                ...form,
                estado: e.target.value === "true",
              })
            }
            className="border rounded-xl px-3 py-2 w-full disabled:bg-gray-100"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <button
  onClick={() => {
    setIsCreating(true);
    setIsEditing(false);

    setNuevo({
      parent_id: selected.id,
      estado: true,
    });
  }}
  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
>
  + Crear sub-concepto
</button>


      </div>

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

  {/* ===== NADA SELECCIONADO ===== */}
  {!isCreating && !selected && (
    <p className="text-gray-500">
      Selecciona un concepto o crea uno nuevo
    </p>
  )}

</div>

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
