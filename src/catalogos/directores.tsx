import React, { useEffect, useState } from 'react';
import Menu from '../layout/menu';

// Importar tipos por separado
import type { DirectorObra } from '../services/directores.service';
// Importar valores (no tipos)
import { DirectoresService, emptyForm } from '../services/directores.service';

const Directores: React.FC = () => {
  const [data, setData] = useState<DirectorObra[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [selected, setSelected] = useState<DirectorObra | null>(null);
  const [form, setForm] = useState<Partial<DirectorObra>>(emptyForm);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* PAGINACIÓN */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = async () => {
    try {
      const directores = await DirectoresService.getAll();
      setData(directores);
    } catch (error: any) {
      console.error('Error al cargar directores:', error);
      alert(error.message || 'Error al cargar los directores');
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filtered = DirectoresService.filterDirectores(data, search, statusFilter);
  const { currentData, totalPages } = DirectoresService.getPaginatedData(
    filtered,
    currentPage,
    itemsPerPage
  );
  const { startPage, endPage } = DirectoresService.getPageRange(currentPage, totalPages);

  const save = async () => {
    if (!DirectoresService.validateForm(form)) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      const formData = DirectoresService.prepareFormData(form, imagenFile);

      if (selected) {
        await DirectoresService.update(selected.id, formData);
      } else {
        await DirectoresService.create(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        handleCancel();
        load();
        setSuccess(false);
      }, 1200);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const edit = (director: DirectorObra) => {
    setSelected(director);
    setForm(DirectoresService.prepareEditData(director));
    
    if (director.imagen) {
      setPreviewUrl(DirectoresService.getImagenUrl(director.imagen));
    } else {
      setPreviewUrl('');
    }
    
    setImagenFile(null);
    setShowForm(true);
  };

  const toggle = (key: keyof DirectorObra) => {
    setForm(prev => ({
      ...prev,
      [key]: !Boolean(prev[key])
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = DirectoresService.validateImage(file);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }
      
      setImagenFile(file);
      
      try {
        const preview = await DirectoresService.createPreviewUrl(file);
        setPreviewUrl(preview);
      } catch (error) {
        console.error('Error al crear previsualización:', error);
      }
    }
  };

  const handleCancel = () => {
    setForm({
      ...emptyForm,
      ro_edificacion: false,
      ro_restauracion: false,
      ro_urbanizacion: false,
      ro_infraestructura: false,
      rp_edificacion: false,
      rp_restauracion: false,
      rp_urbanizacion: false,
      rp_infraestructura: false,
      activo: true,
    } as Partial<DirectorObra>);
    setSelected(null);
    setImagenFile(null);
    setPreviewUrl('');
    setShowForm(false);
  };

  const removeImage = () => {
    setImagenFile(null);
    setPreviewUrl('');
  };

  const getImagenUrl = (imagenPath: string | null | undefined) => {
    return DirectoresService.getImagenUrl(imagenPath);
  };

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

      <Menu />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
        {/* BUSCADOR + FILTRO */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-2 w-64"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-4 py-2"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVOS">Activos</option>
            <option value="INACTIVOS">Inactivos</option>
          </select>

          <button
            onClick={() => {
              setShowForm(true);
              setSelected(null);
              setForm(emptyForm);
              setPreviewUrl('');
              setImagenFile(null);
            }}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
          >
            + Nuevo Director
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Directores de Obra
          </div>

          <div className="p-4 text-sm">
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-3 py-2">Clave</th>
                    <th className="border px-3 py-2">Fecha Actualización</th>
                    <th className="border px-3 py-2">Nombre</th>
                    <th className="border px-3 py-2">Imprimir Formato</th>
                    <th className="border px-3 py-2">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map(d => (
                    <tr key={d.id} className="hover:bg-gray-100 transition">
                      {/* COLUMNA 1: CLAVE */}
                      <td className="border px-3 py-2 align-top">
                        <div className="font-bold text-lg">{d.clave_director || 'Sin clave'}</div>
                      </td>
                      
                      {/* COLUMNA 2: FECHAS */}
                      <td className="border px-3 py-2 align-top">
                        <div className="space-y-2">
                          <div>
                            <div className="font-medium text-xs text-gray-500">Fecha Registro</div>
                            <div>{DirectoresService.formatFecha(d.fecha_registro)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-xs text-gray-500">Fecha Actualización</div>
                            <div>{DirectoresService.formatFecha(d.fecha_actualizacion)}</div>
                          </div>
                          {!d.activo && d.fecha_baja && (
                            <div>
                              <div className="font-medium text-xs text-red-500">Fecha de Baja</div>
                              <div className="text-red-600">{DirectoresService.formatFecha(d.fecha_baja)}</div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* COLUMNA 3: INFORMACIÓN DEL DIRECTOR */}
                      <td className="border px-3 py-2 align-top">
                        <div className="flex items-start gap-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              {d.imagen ? "" : "Imagen No Disponible"}
                            </div>
                            {d.imagen ? (
                              <img 
                                src={getImagenUrl(d.imagen)} 
                                className="w-20 h-20 object-cover border rounded" 
                                alt={`Foto de ${d.nombre_completo}`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/no-image.png";
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 border rounded bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-xs text-center">Sin imagen</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <p className="font-bold uppercase text-sm">
                              {d.nombre_completo}
                            </p>
                            <p className="text-xs mt-1">
                              <span className="font-medium">Colonia:</span> {d.colonia}
                            </p>
                            <p className="text-xs">
                              <span className="font-medium">Municipio:</span> {d.municipio}
                            </p>
                            <p className="text-xs">
                              <span className="font-medium">Teléfono:</span> {d.telefono || "-"}
                            </p>
                            
                            {/* RESPONSABLE DE OBRA */}
                            {DirectoresService.hasResponsableObra(d) && (
                              <div className="mt-2">
                                <p className="font-bold text-xs">Responsable de Obra</p>
                                <p className="text-xs">
                                  <span className="font-medium">Oficio:</span> {d.oficio_autorizacion_ro || "S-07"}
                                </p>
                              </div>
                            )}
                            
                            {/* RESPONSABLE DE PROYECTO */}
                            {DirectoresService.hasResponsableProyecto(d) && (
                              <div className="mt-1">
                                <p className="font-bold text-xs">Responsable de Proyecto</p>
                                <p className="text-xs">
                                  <span className="font-medium">Oficio:</span> {d.oficio_autorizacion_rp || "S-10"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* COLUMNA 4: IMPRIMIR FORMATO */}
                      <td className="border px-3 py-2 align-top">
                        <div className="space-y-2">
                          {DirectoresService.hasResponsableObra(d) && (
                            <button 
                              onClick={() => DirectoresService.imprimirResponsableObra(d)}
                              className="block w-full bg-gray-800 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-700 transition-colors"
                            >
                              - Responsable de Obra
                            </button>
                          )}
                          
                          {DirectoresService.hasResponsableProyecto(d) && (
                            <button 
                              onClick={() => DirectoresService.imprimirResponsableProyecto(d)}
                              className="block w-full bg-gray-800 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-700 transition-colors"
                            >
                              - Responsable de Proyecto
                            </button>
                          )}
                          
                          {!DirectoresService.hasResponsableObra(d) && !DirectoresService.hasResponsableProyecto(d) && (
                            <p className="text-xs text-gray-500 text-center py-1">
                              Sin formatos
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* COLUMNA 5: OPCIONES */}
                      <td className="border px-3 py-2 align-top space-x-3 text-sm">
                        <button
                          onClick={() => edit(d)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
              <span className="text-gray-600">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filtered.length)} de{" "}
                {filtered.length} registros
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  «
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                  const page = startPage + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg border transition ${
                        currentPage === page
                          ? "bg-black text-white border-black"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  ›
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PANEL LATERAL DE FORMULARIO */}
      {showForm && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col border-l overflow-auto">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {selected ? "Editar Director" : "Nuevo Director"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded">
                 Director guardado correctamente
              </div>
            )}

            {/* SECCIÓN DE IMAGEN */}
            <div className="mb-4 p-4 border rounded-lg">
              <h4 className="block text-sm font-medium mb-2">Imagen del Director</h4>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Previsualización" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-xs">Sin imagen</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex gap-2">
                    <label className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer text-sm">
                      Seleccionar imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos: JPG, PNG, GIF, WebP. Máx: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN BÁSICA */}
            <div>
              <label className="block text-sm font-medium mb-1">Clave (opcional)</label>
              <input 
                type="text"
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                placeholder="Clave del director" 
                value={form.clave_director || ""} 
                onChange={e => setForm({ ...form, clave_director: e.target.value })} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
              <input 
                type="text"
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                placeholder="Nombre Completo" 
                value={form.nombre_completo || ""} 
                onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Domicilio *</label>
              <input 
                type="text"
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                placeholder="Domicilio" 
                value={form.domicilio || ""} 
                onChange={e => setForm({ ...form, domicilio: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Colonia *</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Colonia" 
                  value={form.colonia || ""} 
                  onChange={e => setForm({ ...form, colonia: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Municipio *</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Municipio" 
                  value={form.municipio || ""} 
                  onChange={e => setForm({ ...form, municipio: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código Postal</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Código Postal" 
                  value={form.codigo_postal || ""} 
                  onChange={e => setForm({ ...form, codigo_postal: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Teléfono" 
                  value={form.telefono || ""} 
                  onChange={e => setForm({ ...form, telefono: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">RFC *</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="RFC" 
                  value={form.rfc || ""} 
                  onChange={e => setForm({ ...form, rfc: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cédula Federal</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                  placeholder="Cédula Federal" 
                  value={form.cedula_federal || ""} 
                  onChange={e => setForm({ ...form, cedula_federal: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cédula Estatal</label>
              <input 
                type="text"
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none"
                placeholder="Cédula Estatal" 
                value={form.cedula_estatal || ""} 
                onChange={e => setForm({ ...form, cedula_estatal: e.target.value })} 
              />
            </div>

            {/* RESPONSABLE OBRA */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Director Responsable de Obra</h4>
              <input 
                className="border rounded-xl px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-black outline-none" 
                placeholder="Oficio Autorización (ej: S-07)" 
                value={form.oficio_autorizacion_ro || ""} 
                onChange={e => setForm({ ...form, oficio_autorizacion_ro: e.target.value })} 
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.ro_edificacion} 
                    onChange={() => toggle("ro_edificacion")} 
                  /> 
                  Edificación
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.ro_restauracion} 
                    onChange={() => toggle("ro_restauracion")} 
                  /> 
                  Restauración
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.ro_urbanizacion} 
                    onChange={() => toggle("ro_urbanizacion")} 
                  /> 
                  Urbanización
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.ro_infraestructura} 
                    onChange={() => toggle("ro_infraestructura")} 
                  /> 
                  Infraestructura
                </label>
              </div>
            </div>

            {/* RESPONSABLE PROYECTO */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Director Responsable de Proyecto</h4>
              <input 
                className="border rounded-xl px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-black outline-none" 
                placeholder="Oficio Autorización (ej: S-10)" 
                value={form.oficio_autorizacion_rp || ""} 
                onChange={e => setForm({ ...form, oficio_autorizacion_rp: e.target.value })} 
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.rp_edificacion} 
                    onChange={() => toggle("rp_edificacion")} 
                  /> 
                  Edificación
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.rp_restauracion} 
                    onChange={() => toggle("rp_restauracion")} 
                  /> 
                  Restauración
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.rp_urbanizacion} 
                    onChange={() => toggle("rp_urbanizacion")} 
                  /> 
                  Urbanización
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!form.rp_infraestructura} 
                    onChange={() => toggle("rp_infraestructura")} 
                  /> 
                  Infraestructura
                </label>
              </div>
            </div>

            {/* PLANEACION URBANA */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Director Responsable de Planeación Urbana</h4>
              <input 
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none" 
                placeholder="Oficio Autorización" 
                value={form.oficio_autorizacion_pu || ""} 
                onChange={e => setForm({ ...form, oficio_autorizacion_pu: e.target.value })} 
              />
            </div>

            {/* ESTADO */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Estado</h4>
              <select 
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none" 
                value={form.activo ? "1" : "0"} 
                onChange={e => setForm({ ...form, activo: e.target.value === "1" })}
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>

            {/* INFORMACIÓN DEL REGISTRO */}
            {selected && (
              <div className="mt-4 p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Información del Registro</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Fecha de Registro</p>
                    <p className="text-sm">{DirectoresService.formatFecha(selected.fecha_registro)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Última Actualización</p>
                    <p className="text-sm">{DirectoresService.formatFecha(selected.fecha_actualizacion)}</p>
                  </div>
                  {!selected.activo && selected.fecha_baja && (
                    <div>
                      <p className="text-xs font-medium text-red-600">Fecha de Baja</p>
                      <p className="text-sm">{DirectoresService.formatFecha(selected.fecha_baja)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded border hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={loading || !DirectoresService.validateForm(form)}
              className="bg-black text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {loading ? "Guardando..." : selected ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Directores;