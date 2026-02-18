import axios from 'axios';
import { PDFDirector } from '../services/pdfdirector';
import { WordDirector } from '../services/worddirector';
import type { PreviewTexts } from '../catalogos/PreviewDirectores';

export interface DirectorObra {
  id: number;
  clave_director?: string;
  nombre_completo: string;
  domicilio: string;
  colonia: string;
  municipio: string;
  codigo_postal?: string;
  telefono?: string;
  rfc: string;
  cedula_federal?: string;
  cedula_estatal?: string;
  oficio_autorizacion_ro?: string;
  oficio_autorizacion_rp?: string;
  oficio_autorizacion_pu?: string;
  ro_edificacion: boolean;
  ro_restauracion: boolean;
  ro_urbanizacion: boolean;
  ro_infraestructura: boolean;
  rp_edificacion: boolean;
  rp_restauracion: boolean;
  rp_urbanizacion: boolean;
  rp_infraestructura: boolean;
  imagen?: string | null;
  fecha_registro?: string;
  fecha_actualizacion?: string | null;
  fecha_baja?: string;
  activo: boolean;
}

export interface DirectorFormData extends Partial<DirectorObra> {
  imagenFile?: File;
}

// Base vacía = mismo origen; las peticiones pasan por el proxy de Vite al backend (dev)
// En producción puedes usar: VITE_API_URL=http://tu-backend
const API_BASE = import.meta.env.VITE_API_URL ?? '';
const API_URL = `${API_BASE}/directores-obra`;

// Placeholder cuando no hay imagen (data URL para no depender de /no-image.png)
const NO_IMAGE_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="#e5e7eb" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="10" font-family="sans-serif">Sin imagen</text></svg>'
  );

export const emptyForm: Partial<DirectorObra> = {
  clave_director: '',
  nombre_completo: '',
  domicilio: '',
  colonia: '',
  municipio: '',
  codigo_postal: '',
  telefono: '',
  rfc: '',
  cedula_federal: '',
  cedula_estatal: '',
  oficio_autorizacion_ro: '',
  oficio_autorizacion_rp: '',
  oficio_autorizacion_pu: '',
  ro_edificacion: false,
  ro_restauracion: false,
  ro_urbanizacion: false,
  ro_infraestructura: false,
  rp_edificacion: false,
  rp_restauracion: false,
  rp_urbanizacion: false,
  rp_infraestructura: false,
  imagen: '',
  fecha_actualizacion: null,
  activo: true,
};

export interface DirectoresPaginatedParams {
  page?: number;
  limit?: number;
  search?: string;
  statusFilter?: string;
}

export interface DirectoresPaginatedResponse {
  data: DirectorObra[];
  meta: { page: number; limit: number; totalRegistros: number; totalPaginas: number };
}

// Servicio para manejar todas las operaciones de directores
export const DirectoresService = {
  // Obtener directores paginados (carga rápida)
  async getPaginated(params: DirectoresPaginatedParams): Promise<DirectoresPaginatedResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.search) searchParams.set('search', params.search);
      if (params.statusFilter) searchParams.set('statusFilter', params.statusFilter);

      const url = `${API_URL}?${searchParams.toString()}`;
      console.log('Cargando directores desde:', url);
      const response = await axios.get(url);
      console.log('Respuesta del servidor:', response.data);
      
      // Asegurar que la respuesta tenga el formato correcto
      if (!response.data) {
        console.warn('Respuesta vacía del servidor');
        return { data: [], meta: { page: 1, limit: 10, totalRegistros: 0, totalPaginas: 1 } };
      }
      
      // Si la respuesta no tiene el formato esperado, intentar adaptarla
      if (Array.isArray(response.data)) {
        // Si viene como array directo, convertir al formato esperado
        return {
          data: response.data,
          meta: { page: 1, limit: response.data.length, totalRegistros: response.data.length, totalPaginas: 1 }
        };
      }
      
      // Si tiene data y meta, devolverlo tal cual
      if (response.data.data && response.data.meta) {
        return response.data;
      }
      
      console.warn('Formato de respuesta inesperado:', response.data);
      return { data: [], meta: { page: 1, limit: 10, totalRegistros: 0, totalPaginas: 1 } };
    } catch (error: any) {
      console.error('Error al cargar directores:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Error al cargar los directores');
    }
  },

  // Obtener todos los directores (lista simple, p. ej. para selects)
  async getAll(): Promise<DirectorObra[]> {
    return this.getAllFiltered({});
  },

  // Obtener todos con filtros (para exportación Excel)
  async getAllFiltered(params: { search?: string; statusFilter?: string }): Promise<DirectorObra[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.statusFilter) searchParams.set('statusFilter', params.statusFilter);
      const qs = searchParams.toString();
      const response = await axios.get(`${API_URL}/export-all${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error al cargar directores:', error);
      throw new Error('Error al cargar los directores');
    }
  },

  // Crear un nuevo director
  async create(formData: FormData): Promise<DirectorObra> {
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al crear director:', error);
      throw new Error(error.response?.data?.message || 'Error al crear director');
    }
  },

  // Actualizar un director existente
  async update(id: number, formData: FormData): Promise<DirectorObra> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar director:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar director');
    }
  },

  // Preparar FormData para enviar al servidor
  prepareFormData(form: Partial<DirectorObra>, imagenFile?: File | null): FormData {
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === 'fecha_actualizacion') {
        if (value && value !== '') {
          formData.append(key, String(value));
        } else {
          formData.append(key, ''); // Enviar vacío para null
        }
      } else if (key === 'imagen') {
        // Manejar eliminación de imagen
        if (value === '' || value === null) {
          formData.append('eliminar_imagen', 'true');
        }
        // No agregar el campo imagen al formData si es un string
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (value !== undefined && value !== null && value !== '') {
        // Para los oficios, enviar vacío como string vacío
        if (key.includes('oficio_autorizacion')) {
          formData.append(key, String(value));
        } else {
          formData.append(key, String(value));
        }
      } else if (value === '' && key.includes('oficio_autorizacion')) {
        // Enviar string vacío explícitamente para oficios
        formData.append(key, '');
      }
    });

    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }

    return formData;
  },

  // Preparar datos del formulario para edición
  prepareEditData(director: DirectorObra): Partial<DirectorObra> {
    // Función para extraer YYYY-MM-DD de cualquier fecha
    const extractYMD = (dateString: string | null | undefined): string | null => {
      if (!dateString) return null;
      
      try {
        const date = new Date(dateString);
        // Extraer componentes locales (no UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return null;
      }
    };

    return {
      clave_director: director.clave_director || '',
      nombre_completo: director.nombre_completo,
      domicilio: director.domicilio,
      colonia: director.colonia,
      municipio: director.municipio,
      codigo_postal: director.codigo_postal || '',
      telefono: director.telefono || '',
      rfc: director.rfc,
      cedula_federal: director.cedula_federal || '',
      cedula_estatal: director.cedula_estatal || '',
      
      // Manejar null para los oficios
      oficio_autorizacion_ro: director.oficio_autorizacion_ro || '',
      oficio_autorizacion_rp: director.oficio_autorizacion_rp || '',
      oficio_autorizacion_pu: director.oficio_autorizacion_pu || '',
      
      ro_edificacion: Boolean(director.ro_edificacion),
      ro_restauracion: Boolean(director.ro_restauracion),
      ro_urbanizacion: Boolean(director.ro_urbanizacion),
      ro_infraestructura: Boolean(director.ro_infraestructura),
      rp_edificacion: Boolean(director.rp_edificacion),
      rp_restauracion: Boolean(director.rp_restauracion),
      rp_urbanizacion: Boolean(director.rp_urbanizacion),
      rp_infraestructura: Boolean(director.rp_infraestructura),
      imagen: director.imagen || '',
      fecha_actualizacion: extractYMD(director.fecha_actualizacion),
      activo: Boolean(director.activo),
    };
  },

  // Obtener URL de imagen (usa endpoint del backend que sirve el archivo desde uploads/directores)
  getImagenUrl(imagenPath: string | null | undefined): string {
    if (!imagenPath) return NO_IMAGE_SRC;

    const normalized = imagenPath.replace(/^uploads[/\\]/i, '').replace(/^directores[/\\]/i, '').trim();
    if (!normalized) return NO_IMAGE_SRC;

    const filename = normalized.includes('/') ? normalized.split('/').pop()! : normalized;
    return `${API_BASE}/directores-obra/imagen/${encodeURIComponent(filename)}`;
  },

  // Validar imagen
  validateImage(file: File): { isValid: boolean; message?: string } {
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, message: 'La imagen es demasiado grande. Máximo 5MB.' };
    }
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { isValid: false, message: 'Formato de imagen no válido. Use JPG, PNG o GIF.' };
    }
    
    return { isValid: true };
  },

  // Crear URL de previsualización
  createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Filtrar directores
  filterDirectores(
    directores: DirectorObra[],
    search: string,
    statusFilter: string
  ): DirectorObra[] {
    return directores.filter(d => {
      const matchSearch = d.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
        (d.clave_director || '').toLowerCase().includes(search.toLowerCase());
      
      let matchStatus = true;
      if (statusFilter === 'ACTIVOS') matchStatus = d.activo === true;
      if (statusFilter === 'INACTIVOS') matchStatus = d.activo === false;
      
      return matchSearch && matchStatus;
    });
  },

  // Formatear fecha
  formatFecha(fechaString?: string | null): string {
    if (!fechaString) return '01/01/0000';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Formatear fecha para input type="date"
  formatFechaParaInput(fechaString?: string | null): string {
    if (!fechaString) return '';
    return String(fechaString);
  },

  // Obtener datos paginados
  getPaginatedData(
    data: DirectorObra[],
    currentPage: number,
    itemsPerPage: number
  ): { currentData: DirectorObra[]; totalPages: number } {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    return { currentData, totalPages };
  },

  // Obtener rango de páginas para paginación
  getPageRange(currentPage: number, totalPages: number, maxButtons: number = 5): { startPage: number; endPage: number } {
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return { startPage, endPage };
  },

  // Validar campos requeridos del formulario
  validateForm(form: Partial<DirectorObra>): boolean {
    const requiredFields = ['nombre_completo', 'domicilio', 'colonia', 'municipio', 'rfc'];
    return requiredFields.every(field => 
      form[field as keyof DirectorObra] !== undefined && 
      form[field as keyof DirectorObra] !== '' && 
      form[field as keyof DirectorObra] !== null
    );
  },

  // Función para imprimir formato de Responsable de Obra (con textos editables)
  imprimirResponsableObra: async (director: DirectorObra, texts?: PreviewTexts): Promise<void> => {
    try {
      await PDFDirector.generarResponsableObra(director, texts);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  },

  // Función para imprimir formato de Responsable de Proyecto (con textos editables)
  imprimirResponsableProyecto: async (director: DirectorObra, texts?: PreviewTexts): Promise<void> => {
    try {
      await PDFDirector.generarResponsableProyecto(director, texts);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  },

  // Nueva función para imprimir formato de Responsable de Planeación Urbana (con textos editables)
  imprimirResponsablePlaneacionUrbana: async (director: DirectorObra, texts?: PreviewTexts): Promise<void> => {
    try {
      await PDFDirector.generarResponsablePlaneacionUrbana(director, texts);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  },

  // Generar documento Word con constancia del director
  generarConstanciaWord: async (director: DirectorObra): Promise<void> => {
    try {
      await WordDirector.generarConstancia(director);
    } catch (error) {
      console.error('Error al generar Word:', error);
      alert('Error al generar el documento Word. Por favor, intente nuevamente.');
    }
  },

  // Verificar si tiene formatos de Responsable de Obra (MODIFICADO: solo requiere oficio)
  hasResponsableObra(director: DirectorObra): boolean {
    // Solo requiere que tenga oficio (no requiere checkboxes)
    return !!director.oficio_autorizacion_ro && 
           director.oficio_autorizacion_ro.trim() !== '';
  },

  // Verificar si tiene formatos de Responsable de Proyecto (MODIFICADO: solo requiere oficio)
  hasResponsableProyecto(director: DirectorObra): boolean {
    // Solo requiere que tenga oficio (no requiere checkboxes)
    return !!director.oficio_autorizacion_rp && 
           director.oficio_autorizacion_rp.trim() !== '';
  },

  // Verificar si tiene formato de Responsable de Planeación Urbana
  hasResponsablePlaneacionUrbana(director: DirectorObra): boolean {
    // Retorna true si tiene un oficio de autorización
    return !!director.oficio_autorizacion_pu && 
           director.oficio_autorizacion_pu.trim() !== '';
  },

  // Obtener texto de "en qué es responsable" para exportación
  getResponsableText(director: DirectorObra): string {
    const partes: string[] = [];

    if (this.hasResponsableObra(director)) {
      const roTipos: string[] = [];
      if (director.ro_edificacion) roTipos.push('Edificación');
      if (director.ro_restauracion) roTipos.push('Restauración');
      if (director.ro_urbanizacion) roTipos.push('Urbanización');
      if (director.ro_infraestructura) roTipos.push('Infraestructura');
      const roText = roTipos.length > 0 ? roTipos.join(', ') : 'Oficio';
      partes.push(`Responsable de Obra: ${roText}`);
    }

    if (this.hasResponsableProyecto(director)) {
      const rpTipos: string[] = [];
      if (director.rp_edificacion) rpTipos.push('Edificación');
      if (director.rp_restauracion) rpTipos.push('Restauración');
      if (director.rp_urbanizacion) rpTipos.push('Urbanización');
      if (director.rp_infraestructura) rpTipos.push('Infraestructura');
      const rpText = rpTipos.length > 0 ? rpTipos.join(', ') : 'Oficio';
      partes.push(`Responsable de Proyecto: ${rpText}`);
    }

    if (this.hasResponsablePlaneacionUrbana(director)) {
      partes.push('Responsable de Planeación Urbana');
    }

    return partes.length > 0 ? partes.join('; ') : '-';
  },
};

export default DirectoresService;  