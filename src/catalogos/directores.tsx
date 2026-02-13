import React, { useEffect, useState } from 'react';
import Menu from '../layout/menu';

// Importar tipos por separado
import type { DirectorObra } from '../services/directores.service';
// Importar valores (no tipos)
import { DirectoresService, emptyForm } from '../services/directores.service';
import PreviewDirectores, { type PreviewTexts } from './PreviewDirectores';

const Directores: React.FC = () => {
  // Estados principales
  const [data, setData] = useState<DirectorObra[]>([]);
  const [selected, setSelected] = useState<DirectorObra | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados del formulario
  const [form, setForm] = useState<Partial<DirectorObra>>(emptyForm);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Estados de filtros y búsqueda
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para preview de PDF
  const [showPreview, setShowPreview] = useState(false);
  const [previewDirector, setPreviewDirector] = useState<DirectorObra | null>(null);
  const [previewFormato, setPreviewFormato] = useState<number>(1);

  // Cargar datos iniciales
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

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Datos filtrados y paginados
  const filtered = DirectoresService.filterDirectores(data, search, statusFilter);
  const { currentData, totalPages } = DirectoresService.getPaginatedData(
    filtered,
    currentPage,
    itemsPerPage
  );
  const { startPage, endPage } = DirectoresService.getPageRange(currentPage, totalPages);

  // ========== HANDLERS DEL FORMULARIO ==========

  const handleSave = async () => {
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

  const handleEdit = (director: DirectorObra) => {
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

  const handleToggle = (key: keyof DirectorObra) => {
    setForm(prev => ({
      ...prev,
      [key]: !Boolean(prev[key])
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = DirectoresService.validateImage(file);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    
    setImagenFile(file);
    // Limpiar la referencia de imagen anterior si existía
    setForm(prev => ({
      ...prev,
      imagen: '' // Limpiar referencia anterior
    }));
    
    try {
      const preview = await DirectoresService.createPreviewUrl(file);
      setPreviewUrl(preview);
    } catch (error) {
      console.error('Error al crear previsualización:', error);
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
      fecha_actualizacion: null,
    } as Partial<DirectorObra>);
    setSelected(null);
    setImagenFile(null);
    setPreviewUrl('');
    setShowForm(false);
  };

  const handleRemoveImage = () => {
    setImagenFile(null);
    setPreviewUrl('');
    // Marcar que se debe eliminar la imagen existente
    setForm(prev => ({
      ...prev,
      imagen: '' // Establecer como string vacío para indicar eliminación
    }));
  };

  const getImagenUrl = (imagenPath: string | null | undefined) => {
    return DirectoresService.getImagenUrl(imagenPath);
  };

  // Funciones para manejar el preview
  const handleOpenPreview = (director: DirectorObra, formato: number) => {
    setPreviewDirector(director);
    setPreviewFormato(formato);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewDirector(null);
  };

  const handleGeneratePDF = async (texts: PreviewTexts) => {
    if (!previewDirector) return;
    
    try {
      if (previewFormato === 1) {
        await DirectoresService.imprimirResponsableObra(previewDirector, texts);
      } else if (previewFormato === 2) {
        await DirectoresService.imprimirResponsableProyecto(previewDirector, texts);
      } else if (previewFormato === 3) {
        await DirectoresService.imprimirResponsablePlaneacionUrbana(previewDirector, texts);
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  };

  // ========== COMPONENTE PRINCIPAL ==========

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
        {/* BARRA DE BÚSQUEDA Y ACCIONES */}
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
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            + Nuevo Director
          </button>
        </div>

        {/* TABLA DE DIRECTORES */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-black text-white text-center py-2 font-semibold">
            Directores de Obra
          </div>

          <div className="p-4 text-sm">
            {/* TABLA */}
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
                  {currentData.map((director) => (
                    <tr key={director.id} className="hover:bg-gray-100 transition">
                      {/* COLUMNA 1: CLAVE */}
                      <td className="border px-3 py-2 align-top">
                        <div className="font-bold text-lg">
                          {director.clave_director || 'Sin clave'}
                        </div>
                      </td>
                      
                      {/* COLUMNA 2: FECHAS */}
                      <td className="border px-3 py-2 align-top">
                        <div className="space-y-2">
                          <div>
                            <div className="font-medium text-xs text-gray-500">Fecha Registro</div>
                            <div>{DirectoresService.formatFecha(director.fecha_registro)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-xs text-gray-500">Fecha Actualización</div>
                            <div>
                              {director.fecha_actualizacion 
                                ? DirectoresService.formatFecha(director.fecha_actualizacion)
                                : 'No actualizado'}
                            </div>
                          </div>
                          {!director.activo && director.fecha_baja && (
                            <div>
                              <div className="font-medium text-xs text-red-500">Fecha de Baja</div>
                              <div className="text-red-600">
                                {DirectoresService.formatFecha(director.fecha_baja)}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* COLUMNA 3: INFORMACIÓN DEL DIRECTOR */}
                      <td className="border px-3 py-2 align-top">
                        <div className="flex items-start gap-3">
                          {/* IMAGEN */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              {director.imagen ? "" : ""}
                            </div>
                            {director.imagen ? (
                              <img 
                                src={getImagenUrl(director.imagen)} 
                                className="w-20 h-20 object-cover border rounded" 
                                alt={`Foto de ${director.nombre_completo}`}
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
                          
                          {/* DATOS PERSONALES */}
                          <div>
                            <p className="font-bold uppercase text-sm">
                              {director.nombre_completo}
                            </p>
                            <p className="text-xs mt-1">
                              <span className="font-medium">Colonia:</span> {director.colonia}
                            </p>
                            <p className="text-xs">
                              <span className="font-medium">Municipio:</span> {director.municipio}
                            </p>
                            <p className="text-xs">
                              <span className="font-medium">Teléfono:</span> {director.telefono || "-"}
                            </p>
                            
                            {/* RESPONSABLE DE OBRA */}
                            {DirectoresService.hasResponsableObra(director) && (
                              <div className="mt-2">
                                <p className="font-bold text-xs">Responsable de Obra</p>
                                <p className="text-xs">
                                  <span className="font-medium">Oficio:</span> {director.oficio_autorizacion_ro || ""}
                                </p>
                              </div>
                            )}
                            
                            {/* RESPONSABLE DE PROYECTO */}
                            {DirectoresService.hasResponsableProyecto(director) && (
                              <div className="mt-1">
                                <p className="font-bold text-xs">Responsable de Proyecto</p>
                                <p className="text-xs">
                                  <span className="font-medium">Oficio:</span> {director.oficio_autorizacion_rp || ""}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* COLUMNA 4: IMPRIMIR FORMATO */}
                      <td className="border px-3 py-2 align-top">
                        <div className="space-y-2">
                          {/* Responsable de Obra */}
                          {DirectoresService.hasResponsableObra(director) && (
                            <button 
                              onClick={() => handleOpenPreview(director, 1)}
                              className="block w-full bg-gray-800 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-700 transition-colors"
                            >
                              - Responsable de Obra
                            </button>
                          )}
                          
                          {/* Responsable de Proyecto */}
                          {DirectoresService.hasResponsableProyecto(director) && (
                            <button 
                              onClick={() => handleOpenPreview(director, 2)}
                              className="block w-full bg-gray-800 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-700 transition-colors"
                            >
                              - Responsable de Proyecto
                            </button>
                          )}
                          
                          {/* Responsable de Planeación Urbana */}
                          {DirectoresService.hasResponsablePlaneacionUrbana(director) && (
                            <button 
                              onClick={() => handleOpenPreview(director, 3)}
                              className="block w-full bg-gray-800 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-700 transition-colors"
                            >
                              - Responsable de Planeación Urbana
                            </button>
                          )}
                          
                          {/* Sin formatos */}
                          {!DirectoresService.hasResponsableObra(director) && 
                           !DirectoresService.hasResponsableProyecto(director) && 
                           !DirectoresService.hasResponsablePlaneacionUrbana(director) && (
                            <p className="text-xs text-gray-500 text-center py-1">
                              Sin formatos
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* COLUMNA 5: OPCIONES */}
                      <td className="border px-3 py-2 align-top">
                        <button
                          onClick={() => handleEdit(director)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
              {/* INFORMACIÓN DE REGISTROS */}
              <span className="text-gray-600">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filtered.length)} de{" "}
                {filtered.length} registros
              </span>

              {/* CONTROLES DE PAGINACIÓN */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  «
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  ‹
                </button>

                {/* NÚMEROS DE PÁGINA */}
                {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                  const page = startPage + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg border transition-colors ${
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
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  ›
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-40 transition-colors"
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
          {/* HEADER DEL PANEL */}
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {selected ? "Editar Director" : "Nuevo Director"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-black text-xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* CONTENIDO DEL FORMULARIO */}
          <div className="p-6 space-y-4 flex-1">
            {/* MENSAJE DE ÉXITO */}
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded">
                Director guardado correctamente
              </div>
            )}

            {/* SECCIÓN DE IMAGEN */}
            <div className="mb-4 p-4 border rounded-lg">
              <h4 className="block text-sm font-medium mb-2">Imagen del Director</h4>
              <div className="flex items-center gap-4">
                {/* PREVIEW DE IMAGEN */}
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
                
                {/* CONTROLES DE IMAGEN */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex gap-2">
                    <label className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer text-sm transition-colors">
                      {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {(previewUrl || selected?.imagen) && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm transition-colors"
                      >
                        Eliminar imagen
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos: JPG, PNG, GIF, WebP. Máx: 5MB
                  </p>
                  {selected?.imagen && !previewUrl && !imagenFile && (
                    <p className="text-xs text-blue-600">
                      La imagen actual se conservará. Para eliminarla, haga clic en "Eliminar imagen".
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* INFORMACIÓN BÁSICA */}
            <div>
              <label className="block text-sm font-medium mb-1">Clave (opcional)</label>
              <input 
                type="text"
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Clave del director" 
                value={form.clave_director || ""} 
                onChange={e => setForm({ ...form, clave_director: e.target.value })} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
              <input 
                type="text"
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
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
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Domicilio" 
                value={form.domicilio || ""} 
                onChange={e => setForm({ ...form, domicilio: e.target.value })}
                required
              />
            </div>

            {/* DIRECCIÓN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Colonia *</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
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
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="Municipio" 
                  value={form.municipio || ""} 
                  onChange={e => setForm({ ...form, municipio: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* CONTACTO */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código Postal</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="Código Postal" 
                  value={form.codigo_postal || ""} 
                  onChange={e => setForm({ ...form, codigo_postal: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="Teléfono" 
                  value={form.telefono || ""} 
                  onChange={e => setForm({ ...form, telefono: e.target.value })} 
                />
              </div>
            </div>

            {/* DOCUMENTACIÓN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">RFC *</label>
                <input 
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
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
                  className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
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
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Cédula Estatal" 
                value={form.cedula_estatal || ""} 
                onChange={e => setForm({ ...form, cedula_estatal: e.target.value })} 
              />
            </div>

            {/* RESPONSABLE OBRA */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Director Responsable de Obra</h4>
              <input 
                className="border rounded-xl px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-black outline-none transition-all" 
                placeholder="Oficio Autorización (ej: S-07)" 
                value={form.oficio_autorizacion_ro || ""} 
                onChange={e => setForm({ ...form, oficio_autorizacion_ro: e.target.value })} 
              />
              <div className="grid grid-cols-2 gap-2">
                {['ro_edificacion', 'ro_restauracion', 'ro_urbanizacion', 'ro_infraestructura'].map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={!!form[key as keyof DirectorObra]} 
                      onChange={() => handleToggle(key as keyof DirectorObra)} 
                    /> 
                    {key.split('_')[1].charAt(0).toUpperCase() + key.split('_')[1].slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* RESPONSABLE PROYECTO */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Director Responsable de Proyecto</h4>
              <input 
                className="border rounded-xl px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-black outline-none transition-all" 
                placeholder="Oficio Autorización (ej: S-10)" 
                value={form.oficio_autorizacion_rp || ""} 
                onChange={e => setForm({ ...form, oficio_autorizacion_rp: e.target.value })} 
              />
              <div className="grid grid-cols-2 gap-2">
                {['rp_edificacion', 'rp_restauracion', 'rp_urbanizacion', 'rp_infraestructura'].map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={!!form[key as keyof DirectorObra]} 
                      onChange={() => handleToggle(key as keyof DirectorObra)} 
                    /> 
                    {key.split('_')[1].charAt(0).toUpperCase() + key.split('_')[1].slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* PLANEACION URBANA */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Director Responsable de Planeación Urbana</h4>
              <input 
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all" 
                placeholder="Oficio Autorización" 
                value={form.oficio_autorizacion_pu || ""} 
                onChange={e => setForm({ ...form, oficio_autorizacion_pu: e.target.value })} 
              />
            </div>

            {/* FECHA DE ACTUALIZACIÓN */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Fecha de Actualización</h4>
              <input 
                type="date"
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all"
                value={form.fecha_actualizacion || ''}
                onChange={e => {
                  setForm({ 
                    ...form, 
                    fecha_actualizacion: e.target.value || null 
                  });
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío para mantener sin fecha de actualización
              </p>
            </div>

            {/* ESTADO */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Estado</h4>
              <select 
                className="border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-black outline-none transition-all" 
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
                    <p className="text-sm">
                      {selected.fecha_actualizacion 
                        ? DirectoresService.formatFecha(selected.fecha_actualizacion)
                        : 'No actualizado'}
                    </p>
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

          {/* FOOTER DEL PANEL */}
          <div className="p-6 border-t flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded border hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !DirectoresService.validateForm(form)}
              className="bg-black text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? "Guardando..." : selected ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW DE PDF */}
      {showPreview && previewDirector && (
        <PreviewDirectores
          director={previewDirector}
          formato={previewFormato}
          onClose={handleClosePreview}
          onGeneratePDF={handleGeneratePDF}
        />
      )}

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Directores;  