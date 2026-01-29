import axios from 'axios';

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
  fecha_actualizacion?: string;
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
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }

    return formData;
  },

  // Preparar datos del formulario para edición
  prepareEditData(director: DirectorObra): Partial<DirectorObra> {
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
      activo: Boolean(director.activo),
    };
  },

  // Obtener URL de imagen
  getImagenUrl(imagenPath: string | null | undefined): string {
    if (!imagenPath) return '/no-image.png';
    
    const path = imagenPath.startsWith('directores/') ? imagenPath : `directores/${imagenPath}`;
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
  formatFecha(fechaString?: string): string {
    if (!fechaString) return '01/01/0000';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
  imprimirResponsableObra(director: DirectorObra): void {
    alert(`Generando formato de Responsable de Obra para ${director.nombre_completo}`);
  },

  // Función para imprimir formato de Responsable de Proyecto
  imprimirResponsableProyecto(director: DirectorObra): void {
    alert(`Generando formato de Responsable de Proyecto para ${director.nombre_completo}`);
  },

  // Verificar si tiene formatos de Responsable de Obra
  hasResponsableObra(director: DirectorObra): boolean {
    return director.ro_edificacion || 
           director.ro_restauracion || 
           director.ro_urbanizacion || 
           director.ro_infraestructura;
  },

  // Verificar si tiene formatos de Responsable de Proyecto
  hasResponsableProyecto(director: DirectorObra): boolean {
    return director.rp_edificacion || 
           director.rp_restauracion || 
           director.rp_urbanizacion || 
           director.rp_infraestructura;
  },
};

export default DirectoresService;