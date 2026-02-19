import React, { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
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

  // Verificar permisos del usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const puedeModificar = !esSupervisor; // SUPERVISOR solo puede leer

  // Estados del formulario
  const [form, setForm] = useState<Partial<DirectorObra>>(emptyForm);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Estados de filtros y búsqueda
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Estados de paginación (servidor)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [meta, setMeta] = useState<{ totalRegistros: number; totalPaginas: number; page: number; limit?: number } | null>(null);

  // Estados para preview de PDF
  const [showPreview, setShowPreview] = useState(false);
  const [previewDirector, setPreviewDirector] = useState<DirectorObra | null>(null);
  const [previewFormato, setPreviewFormato] = useState<number>(1);

  // Estado para exportación
  const [exportando, setExportando] = useState(false);

  // Cargar datos paginados desde servidor
  const load = async () => {
    try {
      setLoading(true);
      console.log('Cargando directores - página:', currentPage, 'búsqueda:', search, 'filtro:', statusFilter);
      const res = await DirectoresService.getPaginated({
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
        statusFilter: statusFilter !== 'TODOS' ? statusFilter : undefined,
      });
      console.log('Directores cargados:', res);
      console.log('Datos recibidos:', res.data);
      console.log('Meta recibida:', res.meta);
      
      // Asegurar que siempre tengamos arrays válidos
      setData(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta || { page: 1, limit: 10, totalRegistros: 0, totalPaginas: 1 });
    } catch (error: unknown) {
      console.error('Error al cargar directores:', error);
      const err = error as { response?: unknown; message?: string };
      console.error('Error completo:', err.response || error);
      setData([]);
      setMeta({ page: 1, limit: 10, totalRegistros: 0, totalPaginas: 1 });
      alert(err.message || 'Error al cargar los directores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentPage, search, statusFilter]);

  const totalPages = meta?.totalPaginas ?? 1;
  const totalRegistros = meta?.totalRegistros ?? 0;
  const currentData = data || [];

  // ========== HANDLERS DEL FORMULARIO ==========

  const handleSave = async () => {
    // Verificar permisos: SUPERVISOR no puede crear/modificar
    if (esSupervisor) {
      alert("Los supervisores solo pueden visualizar información, no pueden crear o modificar directores");
      return;
    }

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
    } catch (error: unknown) {
      console.error(error);
      alert((error as Error).message || 'Error al guardar');
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
      [key]: !prev[key]
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

  const limpiarFiltros = () => {
    setSearch('');
    setStatusFilter('TODOS');
    setCurrentPage(1);
    // load() se ejecutará automáticamente por el useEffect
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

  const fetchImageAsBase64 = async (url: string): Promise<{ base64: string; extension: string } | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
          if (match) resolve(match[2]);
          else reject(new Error('Invalid data URL'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const ext = (blob.type?.split('/')[1] || 'jpg').toLowerCase();
      return { base64, extension: ext === 'jpeg' ? 'jpeg' : ext };
    } catch {
      return null;
    }
  };

  const exportarAExcel = async () => {
    setExportando(true);
    try {
      const directoresParaExport = await DirectoresService.getAllFiltered({
        search: search || undefined,
        statusFilter: statusFilter !== 'TODOS' ? statusFilter : undefined,
      });

      const domicilioCompleto = (d: DirectorObra) => {
        const partes = [d.domicilio, d.colonia, d.municipio].filter(Boolean);
        return partes.length > 0 ? partes.join(', ') : '-';
      };

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Directores', { views: [{ state: 'frozen', ySplit: 1 }] });

      const IMG_SIZE = 50;
      worksheet.properties.defaultRowHeight = IMG_SIZE + 4;
      worksheet.columns = [
        { header: 'Clave', key: 'clave', width: 12 },
        { header: 'Imagen', key: 'imagen', width: 12 },
        { header: 'Nombre', key: 'nombre', width: 35 },
        { header: 'Domicilio (Colonia, Municipio)', key: 'domicilio', width: 45 },
        { header: 'Teléfono', key: 'telefono', width: 18 },
        { header: 'En qué es responsable', key: 'responsable', width: 55 },
      ];
      worksheet.getRow(1).font = { bold: true };

      for (let i = 0; i < directoresParaExport.length; i++) {
        const d = directoresParaExport[i];
        const row = worksheet.addRow({
          clave: d.clave_director || '-',
          imagen: d.imagen ? '' : 'Sin imagen',
          nombre: d.nombre_completo || '-',
          domicilio: domicilioCompleto(d),
          telefono: d.telefono || '-',
          responsable: DirectoresService.getResponsableText(d),
        });
        row.height = IMG_SIZE + 4;

        if (d.imagen) {
          const url = DirectoresService.getImagenUrl(d.imagen);
          if (!url.startsWith('data:')) {
            const imgData = await fetchImageAsBase64(url);
            if (imgData) {
              const imageId = workbook.addImage({
                base64: imgData.base64,
                extension: imgData.extension as 'jpeg' | 'png' | 'gif',
              });
              worksheet.addImage(imageId, {
                tl: { col: 1, row: i + 2 },
                ext: { width: IMG_SIZE, height: IMG_SIZE },
                editAs: 'oneCell',
              });
            } else {
              row.getCell(2).value = 'Error al cargar';
            }
          }
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fecha = new Date().toISOString().split('T')[0];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Directores_${fecha}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar a Excel. Por favor, intente de nuevo.');
    } finally {
      setExportando(false);
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

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          {/* HEADER DEL REPORTE */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Directores de Obra</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Catálogo de directores responsables
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Total de registros</div>
                <div className="text-2xl font-bold">{totalRegistros}</div>
              </div>
            </div>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
              <div className="flex gap-2">
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={exportarAExcel}
                  disabled={exportando || totalRegistros === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {exportando ? 'Exportando...' : `Exportar a Excel (${totalRegistros} registros)`}
                </button>
                {puedeModificar && (
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setSelected(null);
                      setForm(emptyForm);
                      setPreviewUrl('');
                      setImagenFile(null);
                    }}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium flex items-center gap-2"
                  >
                    + Nuevo Director
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre o clave..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="ACTIVOS">Activos</option>
                  <option value="INACTIVOS">Inactivos</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              Mostrando <span className="font-semibold">{totalRegistros}</span> registro{totalRegistros !== 1 ? 's' : ''}
            </div>
          </div>

          {/* TABLA - Sin scroll interno, contenido completo con saltos de línea */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="min-h-[200px] flex items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
              </div>
            ) : (
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Clave</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Fecha Actualización</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[280px]">Nombre</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[120px]">Imprimir Formato</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[100px]">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-slate-500 bg-slate-50/50">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="font-medium text-slate-600">No hay directores registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData.map((director) => (
                      <tr key={director.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 align-top">
                          <div className="font-semibold text-slate-800 whitespace-nowrap">
                            {director.clave_director || 'Sin clave'}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="space-y-1.5 text-xs min-w-[120px]">
                            <div>
                              <div className="font-medium text-slate-500 mb-0.5">Fecha de Registro</div>
                              <div className="text-slate-700 whitespace-nowrap">{DirectoresService.formatFecha(director.fecha_registro)}</div>
                            </div>
                            <div>
                              <div className="font-medium text-slate-500 mb-0.5">Fecha de Actualización</div>
                              <div className="text-slate-700 whitespace-nowrap">
                                {director.fecha_actualizacion ? DirectoresService.formatFecha(director.fecha_actualizacion) : 'No actualizado'}
                              </div>
                            </div>
                            {!director.activo && director.fecha_baja && (
                              <div>
                                <div className="font-medium text-rose-500 mb-0.5">Baja</div>
                                <div className="text-rose-600 whitespace-nowrap">{DirectoresService.formatFecha(director.fecha_baja)}</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex items-start gap-3 min-w-[280px]">
                            <div className="shrink-0">
                              {director.imagen ? (
                                <img
                                  src={getImagenUrl(director.imagen)}
                                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                                  alt={`Foto de ${director.nombre_completo}`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = DirectoresService.getImagenUrl(null);
                                  }}
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                  <span className="text-slate-400 text-xs text-center px-1">Sin imagen</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="font-semibold text-slate-800 text-sm leading-tight whitespace-normal break-words">
                                {director.nombre_completo}
                              </p>
                              <div className="text-xs text-slate-600 space-y-0.5">
                                <p className="whitespace-normal break-words"><span className="font-medium">Colonia:</span> {director.colonia || "—"}</p>
                                <p className="whitespace-normal break-words"><span className="font-medium">Municipio:</span> {director.municipio || "—"}</p>
                                <p className="whitespace-normal break-words"><span className="font-medium">Teléfono:</span> {director.telefono || "—"}</p>
                              </div>
                              <div className="mt-1.5 pt-1 space-y-1">
                                {DirectoresService.hasResponsableObra(director) && (
                                  <div>
                                    <p className="font-semibold text-xs text-slate-700">Responsable de Obra</p>
                                    <p className="text-xs text-slate-600 whitespace-normal break-words"><span className="font-medium">Oficio:</span> {director.oficio_autorizacion_ro || "—"}</p>
                                  </div>
                                )}
                                {DirectoresService.hasResponsableProyecto(director) && (
                                  <div>
                                    <p className="font-semibold text-xs text-slate-700">Responsable de Proyecto</p>
                                    <p className="text-xs text-slate-600 whitespace-normal break-words"><span className="font-medium">Oficio:</span> {director.oficio_autorizacion_rp || "—"}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-col gap-1.5 min-w-[140px]">
                            {DirectoresService.hasResponsableObra(director) && (
                              <button
                                onClick={() => handleOpenPreview(director, 1)}
                                className="w-full flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                                title="Vista previa e imprimir formato de Responsable de Obra"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Responsable de Obra</span>
                              </button>
                            )}
                            {DirectoresService.hasResponsableProyecto(director) && (
                              <button
                                onClick={() => handleOpenPreview(director, 2)}
                                className="w-full flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                                title="Vista previa e imprimir formato de Responsable de Proyecto"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Responsable de Proyecto</span>
                              </button>
                            )}
                            {DirectoresService.hasResponsablePlaneacionUrbana(director) && (
                              <button
                                onClick={() => handleOpenPreview(director, 3)}
                                className="w-full flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                                title="Vista previa e imprimir formato de Planeación Urbana"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Planeación Urbana</span>
                              </button>
                            )}
                            {!DirectoresService.hasResponsableObra(director) &&
                             !DirectoresService.hasResponsableProyecto(director) &&
                             !DirectoresService.hasResponsablePlaneacionUrbana(director) && (
                              <div className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-center">
                                <svg className="w-3.5 h-3.5 mx-auto mb-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-xs text-slate-500">Sin formatos</p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex items-center gap-x-2 text-sm whitespace-nowrap">
                            <button
                              onClick={() => DirectoresService.generarConstanciaWord(director)}
                              className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Word
                            </button>
                            {puedeModificar && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleEdit(director)}
                                  className="text-sky-600 hover:text-sky-800 font-medium transition-colors"
                                >
                                  Editar
                                </button>
                              </>
                            )}
                            {!puedeModificar && (
                              <span className="text-slate-400 text-sm">Solo lectura</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINACIÓN */}
          <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-600 text-center sm:text-left order-2 sm:order-1">
              <span className="font-medium text-slate-800">{totalRegistros > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>
              <span className="mx-1">–</span>
              <span className="font-medium text-slate-800">{Math.min(currentPage * itemsPerPage, totalRegistros)}</span>
              <span className="mx-1">de</span>
              <span className="font-medium text-slate-800">{totalRegistros}</span>
              <span className="ml-1">registros</span>
            </p>
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 order-1 sm:order-2" aria-label="Paginación">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors" aria-label="Primera página">«</button>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors" aria-label="Anterior">‹</button>
                <div className="flex items-center gap-0.5 mx-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? "bg-slate-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors" aria-label="Siguiente">›</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors" aria-label="Última página">»</button>
              </nav>
            )}
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