import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";

interface DirectorObra {
  id_director_obra: number;
  fecha_registro: string;
  clave_director: string;
  nombre: string;
  domicilio: string;
  colonia: string;
  municipio: string;
  codigo_postal: string;
  telefono: string;
  rfc: string;
  cedula_federal: string;
  cedula_estatal: string;
  director_responsable_obra: string[];
  oficio_autorizacion_obra: string;
  director_responsable_proyecto: string[];
  oficio_autorizacion_proyecto: string;
  director_planeacion_urbana: string[];
  oficio_autorizacion_planeacion: string;
  fecha_actualizacion: string;
  fecha_baja: string;
  estado_perito: string;
  imagen_url: string;
}

const AREAS = ["Edificación", "Restauración", "Urbanización", "Infraestructura"];

const Directores: React.FC = () => {
  const [directores, setDirectores] = useState<DirectorObra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAgregar, setShowAgregar] = useState(false);
  const [editDirector, setEditDirector] = useState<Partial<DirectorObra> | null>(null);

  const [nuevoDirector, setNuevoDirector] = useState<Omit<DirectorObra, "id_director_obra">>({
    fecha_registro: "",
    clave_director: "",
    nombre: "",
    domicilio: "",
    colonia: "",
    municipio: "",
    codigo_postal: "",
    telefono: "",
    rfc: "",
    cedula_federal: "",
    cedula_estatal: "",
    director_responsable_obra: [],
    oficio_autorizacion_obra: "",
    director_responsable_proyecto: [],
    oficio_autorizacion_proyecto: "",
    director_planeacion_urbana: [],
    oficio_autorizacion_planeacion: "",
    fecha_actualizacion: "",
    fecha_baja: "",
    estado_perito: "Activo",
    imagen_url: "",
  });

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current } as any);

  useEffect(() => {
    const fetchDirectores = async () => {
      try {
        const res = await axios.get("http://localhost:3001/directores-obra");
        setDirectores(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectores();
  }, []);

  if (loading) return <div className="p-4">Cargando...</div>;

  // ---------- FUNCIONES ----------
  const handleCheckboxChange = (
    field: "director_responsable_obra" | "director_responsable_proyecto" | "director_planeacion_urbana",
    value: string,
    isChecked: boolean
  ) => {
    setNuevoDirector(prev => ({
      ...prev,
      [field]: isChecked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(v => v !== value),
    }));
  };

  const handleCheckboxChangeEdit = (
    field: "director_responsable_obra" | "director_responsable_proyecto" | "director_planeacion_urbana",
    value: string,
    isChecked: boolean
  ) => {
    if (!editDirector) return;
    setEditDirector({
      ...editDirector,
      [field]: isChecked
        ? [...(editDirector[field] || []), value]
        : (editDirector[field] || []).filter(v => v !== value),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (isEdit && editDirector) {
        setEditDirector({ ...editDirector, imagen_url: reader.result as string });
      } else {
        setNuevoDirector({ ...nuevoDirector, imagen_url: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAgregarDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...nuevoDirector,
        oficio_autorizacion_obra: nuevoDirector.oficio_autorizacion_obra || "",
        oficio_autorizacion_proyecto: nuevoDirector.oficio_autorizacion_proyecto || "",
        oficio_autorizacion_planeacion: nuevoDirector.oficio_autorizacion_planeacion || "",
      };
      const res = await axios.post("http://localhost:3001/directores-obra", payload);
      setDirectores([...directores, res.data]);
      setShowAgregar(false);
      setNuevoDirector({
        fecha_registro: "",
        clave_director: "",
        nombre: "",
        domicilio: "",
        colonia: "",
        municipio: "",
        codigo_postal: "",
        telefono: "",
        rfc: "",
        cedula_federal: "",
        cedula_estatal: "",
        director_responsable_obra: [],
        oficio_autorizacion_obra: "",
        director_responsable_proyecto: [],
        oficio_autorizacion_proyecto: "",
        director_planeacion_urbana: [],
        oficio_autorizacion_planeacion: "",
        fecha_actualizacion: "",
        fecha_baja: "",
        estado_perito: "Activo",
        imagen_url: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleGuardarEdicion = async () => {
    if (!editDirector || !editDirector.id_director_obra) return;
    try {
      const payload = {
        ...editDirector,
        oficio_autorizacion_obra: editDirector.oficio_autorizacion_obra || "",
        oficio_autorizacion_proyecto: editDirector.oficio_autorizacion_proyecto || "",
        oficio_autorizacion_planeacion: editDirector.oficio_autorizacion_planeacion || "",
      };
      const res = await axios.put(`http://localhost:3001/directores-obra/${editDirector.id_director_obra}`, payload);
      setDirectores(directores.map(d => d.id_director_obra === editDirector.id_director_obra ? res.data : d));
      setEditDirector(null);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Directores de Obra</h1>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowAgregar(true)}
      >
        Agregar Director de Obra
      </button>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg mt-4">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b text-left">Clave</th>
              <th className="p-2 border-b text-left">Actualización</th>
              <th className="p-2 border-b text-left">Nombre y Datos</th>
              <th className="p-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {directores.map(d => (
              <tr key={`director-${d.id_director_obra}`} className="border-t hover:bg-gray-50">
                <td className="p-2">{d.clave_director}</td>
                <td className="p-2">{d.fecha_actualizacion}</td>
                <td className="p-2 flex items-start gap-4">
                  {d.imagen_url ? (
                    <img src={d.imagen_url} alt={d.nombre} className="w-16 h-16 rounded object-cover border" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-200 text-sm text-gray-500 border">
                      No Imagen
                    </div>
                  )}
                  <div className="space-y-1 text-sm">
                    <div className="font-bold">{d.nombre}</div>
                    <div>{d.colonia}, {d.municipio}</div>
                    <div>Tel: {d.telefono || "N/A"}</div>
                    <div><strong>Resp. Obra:</strong> {(d.director_responsable_obra || []).join(", ")}</div>
                    <div><strong>Resp. Proyecto:</strong> {(d.director_responsable_proyecto || []).join(", ")}</div>
                  </div>
                </td>
                <td className="p-2 flex flex-col gap-1">
                  <button className="text-blue-500 underline" onClick={() => setEditDirector(d)}>Editar</button>
                  <button className="text-green-500 underline" onClick={handlePrint}>PDF Obra</button>
                  <button className="text-purple-500 underline" onClick={handlePrint}>PDF Proyecto</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL AGREGAR */}
      {showAgregar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90%] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">Agregar Director de Obra</h2>
            <form onSubmit={handleAgregarDirector} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Clave" value={nuevoDirector.clave_director || ""} onChange={e => setNuevoDirector({...nuevoDirector, clave_director: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Nombre" value={nuevoDirector.nombre || ""} onChange={e => setNuevoDirector({...nuevoDirector, nombre: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Domicilio" value={nuevoDirector.domicilio || ""} onChange={e => setNuevoDirector({...nuevoDirector, domicilio: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Colonia" value={nuevoDirector.colonia || ""} onChange={e => setNuevoDirector({...nuevoDirector, colonia: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Municipio" value={nuevoDirector.municipio || ""} onChange={e => setNuevoDirector({...nuevoDirector, municipio: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Teléfono" value={nuevoDirector.telefono || ""} onChange={e => setNuevoDirector({...nuevoDirector, telefono: e.target.value})} className="border p-2 rounded" />
                <input type="date" placeholder="Fecha Actualización" value={nuevoDirector.fecha_actualizacion || ""} onChange={e => setNuevoDirector({...nuevoDirector, fecha_actualizacion: e.target.value})} className="border p-2 rounded" />
                <input type="date" placeholder="Fecha Baja" value={nuevoDirector.fecha_baja || ""} onChange={e => setNuevoDirector({...nuevoDirector, fecha_baja: e.target.value})} className="border p-2 rounded" />
                <select value={nuevoDirector.estado_perito || "Activo"} onChange={e => setNuevoDirector({...nuevoDirector, estado_perito: e.target.value})} className="border p-2 rounded">
                  <option value="Activo">Activo</option>
                  <option value="Baja">Baja</option>
                </select>
                <input type="file" onChange={e => handleFileChange(e)} className="border p-2 rounded col-span-2"/>
              </div>

              {["obra","proyecto","planeacion"].map(section => (
                <div key={section} className="border-t pt-2 mt-2 space-y-1">
                  <h3 className="font-semibold">{section === "obra" ? "Director Responsable de Obra" : section === "proyecto" ? "Director Responsable Proyecto" : "Director Responsable Planeación Urbana"}</h3>
                  <input type="text" placeholder="Oficio Autorización" value={(nuevoDirector as any)[`oficio_autorizacion_${section}`] || ""} onChange={e => setNuevoDirector({...nuevoDirector, [`oficio_autorizacion_${section}`]: e.target.value})} className="border p-2 rounded" />
                  <div className="flex gap-4">
                    {AREAS.map(area => (
                      <label key={`${section}-${area}`} className="flex items-center gap-1">
                        <input type="checkbox" checked={((nuevoDirector as any)[`director_responsable_${section}`] || []).includes(area)} onChange={e => handleCheckboxChange(`director_responsable_${section}` as any, area, e.target.checked)} />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Agregar</button>
                <button type="button" onClick={() => setShowAgregar(false)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editDirector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90%] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">Editar Director</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Clave" value={editDirector.clave_director || ""} onChange={e => setEditDirector({...editDirector, clave_director: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Nombre" value={editDirector.nombre || ""} onChange={e => setEditDirector({...editDirector, nombre: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Domicilio" value={editDirector.domicilio || ""} onChange={e => setEditDirector({...editDirector, domicilio: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Colonia" value={editDirector.colonia || ""} onChange={e => setEditDirector({...editDirector, colonia: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Municipio" value={editDirector.municipio || ""} onChange={e => setEditDirector({...editDirector, municipio: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Teléfono" value={editDirector.telefono || ""} onChange={e => setEditDirector({...editDirector, telefono: e.target.value})} className="border p-2 rounded" />
                <input type="date" placeholder="Fecha Actualización" value={editDirector.fecha_actualizacion || ""} onChange={e => setEditDirector({...editDirector, fecha_actualizacion: e.target.value})} className="border p-2 rounded" />
                <input type="date" placeholder="Fecha Baja" value={editDirector.fecha_baja || ""} onChange={e => setEditDirector({...editDirector, fecha_baja: e.target.value})} className="border p-2 rounded" />
                <select value={editDirector.estado_perito || "Activo"} onChange={e => setEditDirector({...editDirector, estado_perito: e.target.value})} className="border p-2 rounded">
                  <option value="Activo">Activo</option>
                  <option value="Baja">Baja</option>
                </select>
                <input type="file" onChange={e => handleFileChange(e, true)} className="border p-2 rounded col-span-2"/>
              </div>

              {["obra","proyecto","planeacion"].map(section => (
                <div key={section} className="border-t pt-2 mt-2 space-y-1">
                  <h3 className="font-semibold">{section === "obra" ? "Director Responsable de Obra" : section === "proyecto" ? "Director Responsable Proyecto" : "Director Responsable Planeación Urbana"}</h3>
                  <input type="text" placeholder="Oficio Autorización" value={(editDirector as any)[`oficio_autorizacion_${section}`] || ""} onChange={e => setEditDirector({...editDirector, [`oficio_autorizacion_${section}`]: e.target.value})} className="border p-2 rounded" />
                  <div className="flex gap-4">
                    {AREAS.map(area => (
                      <label key={`${section}-${area}`} className="flex items-center gap-1">
                        <input type="checkbox" checked={((editDirector as any)[`director_responsable_${section}`] || []).includes(area)} onChange={e => handleCheckboxChangeEdit(`director_responsable_${section}` as any, area, e.target.checked)} />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 mt-4">
                <button type="button" onClick={handleGuardarEdicion} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Guardar</button>
                <button type="button" onClick={() => setEditDirector(null)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directores;
