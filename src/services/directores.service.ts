import axios from 'axios';
import { PDFDirector } from '../services/pdfdirector';

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

const API_BASE = 'http://localhost:3001';
const API_URL = `${API_BASE}/directores-obra`;
const UPLOADS_BASE = `${API_BASE}/uploads`;

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

// Servicio para manejar todas las operaciones de directores
export const DirectoresService = {
  // Obtener todos los directores
  async getAll(): Promise<DirectorObra[]> {
    try {
      const response = await axios.get(API_URL);
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

  // Obtener URL de imagen
  getImagenUrl(imagenPath: string | null | undefined): string {
    if (!imagenPath) return '/no-image.png';
    
    // Verificar si la ruta ya contiene "directores/"
    // Si la imagen ya viene con el prefijo "directores/", úsala tal cual
    // Si no, agregar el directorio "directores/"
    const path = imagenPath.startsWith('directores/') 
      ? imagenPath 
      : `directores/${imagenPath}`;
    
    return `${UPLOADS_BASE}/${path}`;
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

  // Función para imprimir formato de Responsable de Obra
  imprimirResponsableObra: async (director: DirectorObra): Promise<void> => {
    try {
      await PDFDirector.generarResponsableObra(director);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  },

  // Función para imprimir formato de Responsable de Proyecto
  imprimirResponsableProyecto: async (director: DirectorObra): Promise<void> => {
    try {
      await PDFDirector.generarResponsableProyecto(director);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  },

  // Nueva función para imprimir formato de Responsable de Planeación Urbana
  imprimirResponsablePlaneacionUrbana: async (director: DirectorObra): Promise<void> => {
    try {
      await PDFDirector.generarResponsablePlaneacionUrbana(director);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
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
};

export default DirectoresService;  