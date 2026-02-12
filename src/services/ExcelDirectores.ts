// services/ExcelDirectores.ts
import * as XLSX from 'xlsx';
import type { DirectorObra } from './directores.service';

export class ExcelDirectores {
  // Función para exportar todos los directores
  static exportAll(directores: DirectorObra[], filtroBusqueda: string = '', filtroEstado: string = '') {
    try {
      // Preparar datos para Excel
      const dataForExport = directores.map(director => {
        // Convertir booleanos a texto
        const roEspecialidades = [];
        if (director.ro_edificacion) roEspecialidades.push('Edificación');
        if (director.ro_restauracion) roEspecialidades.push('Restauración');
        if (director.ro_urbanizacion) roEspecialidades.push('Urbanización');
        if (director.ro_infraestructura) roEspecialidades.push('Infraestructura');
        
        const rpEspecialidades = [];
        if (director.rp_edificacion) rpEspecialidades.push('Edificación');
        if (director.rp_restauracion) rpEspecialidades.push('Restauración');
        if (director.rp_urbanizacion) rpEspecialidades.push('Urbanización');
        if (director.rp_infraestructura) rpEspecialidades.push('Infraestructura');

        return {
          'Clave': director.clave_director || 'Sin clave',
          'Nombre Completo': director.nombre_completo,
          'Domicilio': director.domicilio,
          'Colonia': director.colonia,
          'Municipio': director.municipio,
          'Código Postal': director.codigo_postal || '',
          'Teléfono': director.telefono || '',
          'RFC': director.rfc,
          'Cédula Federal': director.cedula_federal || '',
          'Cédula Estatal': director.cedula_estatal || '',
          'Responsable de Obra': director.oficio_autorizacion_ro ? 'Sí' : 'No',
          'Oficio RO': director.oficio_autorizacion_ro || '',
          'Especialidades RO': roEspecialidades.join(', ') || 'Ninguna',
          'Responsable de Proyecto': director.oficio_autorizacion_rp ? 'Sí' : 'No',
          'Oficio RP': director.oficio_autorizacion_rp || '',
          'Especialidades RP': rpEspecialidades.join(', ') || 'Ninguna',
          'Responsable Planeación Urbana': director.oficio_autorizacion_pu ? 'Sí' : 'No',
          'Oficio PU': director.oficio_autorizacion_pu || '',
          'Fecha Registro': this.formatDate(director.fecha_registro),
          'Fecha Actualización': this.formatDate(director.fecha_actualizacion),
          'Fecha Baja': this.formatDate(director.fecha_baja),
          'Estado': director.activo ? 'Activo' : 'Inactivo',
        };
      });

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataForExport);
      
      // Ajustar ancho de columnas
      const wscols = [
        { wch: 15 }, // Clave
        { wch: 30 }, // Nombre Completo
        { wch: 35 }, // Domicilio
        { wch: 25 }, // Colonia
        { wch: 20 }, // Municipio
        { wch: 15 }, // Código Postal
        { wch: 15 }, // Teléfono
        { wch: 18 }, // RFC
        { wch: 20 }, // Cédula Federal
        { wch: 20 }, // Cédula Estatal
        { wch: 20 }, // Responsable de Obra
        { wch: 15 }, // Oficio RO
        { wch: 30 }, // Especialidades RO
        { wch: 22 }, // Responsable de Proyecto
        { wch: 15 }, // Oficio RP
        { wch: 30 }, // Especialidades RP
        { wch: 25 }, // Responsable Planeación Urbana
        { wch: 15 }, // Oficio PU
        { wch: 15 }, // Fecha Registro
        { wch: 20 }, // Fecha Actualización
        { wch: 15 }, // Fecha Baja
        { wch: 10 }, // Estado
      ];
      ws['!cols'] = wscols;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Directores de Obra');

      // Generar nombre del archivo con fecha y filtros aplicados
      const dateStr = new Date().toISOString().slice(0, 10);
      let fileName = `Directores_${dateStr}`;
      
      if (filtroBusqueda) {
        fileName += `_busqueda_${filtroBusqueda}`;
      }
      if (filtroEstado && filtroEstado !== 'TODOS') {
        fileName += `_${filtroEstado.toLowerCase()}`;
      }
      fileName += '.xlsx';

      // Descargar archivo
      XLSX.writeFile(wb, fileName);
      
      return true;
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('No se pudo exportar el archivo Excel');
    }
  }

  // Función para exportar un solo director
  static exportOne(director: DirectorObra) {
    try {
      // Preparar datos para el director específico
      const roEspecialidades = [];
      if (director.ro_edificacion) roEspecialidades.push('Edificación');
      if (director.ro_restauracion) roEspecialidades.push('Restauración');
      if (director.ro_urbanizacion) roEspecialidades.push('Urbanización');
      if (director.ro_infraestructura) roEspecialidades.push('Infraestructura');
      
      const rpEspecialidades = [];
      if (director.rp_edificacion) rpEspecialidades.push('Edificación');
      if (director.rp_restauracion) rpEspecialidades.push('Restauración');
      if (director.rp_urbanizacion) rpEspecialidades.push('Urbanización');
      if (director.rp_infraestructura) rpEspecialidades.push('Infraestructura');

      const directorData = {
        'Clave': director.clave_director || 'Sin clave',
        'Nombre Completo': director.nombre_completo,
        'Domicilio': director.domicilio,
        'Colonia': director.colonia,
        'Municipio': director.municipio,
        'Código Postal': director.codigo_postal || '',
        'Teléfono': director.telefono || '',
        'RFC': director.rfc,
        'Cédula Federal': director.cedula_federal || '',
        'Cédula Estatal': director.cedula_estatal || '',
        'Responsable de Obra': director.oficio_autorizacion_ro ? 'Sí' : 'No',
        'Oficio RO': director.oficio_autorizacion_ro || '',
        'Especialidades RO': roEspecialidades.join(', ') || 'Ninguna',
        'Responsable de Proyecto': director.oficio_autorizacion_rp ? 'Sí' : 'No',
        'Oficio RP': director.oficio_autorizacion_rp || '',
        'Especialidades RP': rpEspecialidades.join(', ') || 'Ninguna',
        'Responsable Planeación Urbana': director.oficio_autorizacion_pu ? 'Sí' : 'No',
        'Oficio PU': director.oficio_autorizacion_pu || '',
        'Fecha Registro': this.formatDate(director.fecha_registro),
        'Fecha Actualización': this.formatDate(director.fecha_actualizacion),
        'Fecha Baja': this.formatDate(director.fecha_baja),
        'Estado': director.activo ? 'Activo' : 'Inactivo',
      };

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      
      // Crear nombre de hoja seguro (eliminar caracteres inválidos)
      const nombreHoja = this.crearNombreHojaSeguro(
        director.clave_director || `Director_${director.id}`
      );
      
      const ws = XLSX.utils.json_to_sheet([directorData]);
      
      // Ajustar ancho de columnas
      const wscols = [
        { wch: 15 }, // Clave
        { wch: 30 }, // Nombre Completo
        { wch: 35 }, // Domicilio
        { wch: 25 }, // Colonia
        { wch: 20 }, // Municipio
        { wch: 15 }, // Código Postal
        { wch: 15 }, // Teléfono
        { wch: 18 }, // RFC
        { wch: 20 }, // Cédula Federal
        { wch: 20 }, // Cédula Estatal
        { wch: 20 }, // Responsable de Obra
        { wch: 15 }, // Oficio RO
        { wch: 30 }, // Especialidades RO
        { wch: 22 }, // Responsable de Proyecto
        { wch: 15 }, // Oficio RP
        { wch: 30 }, // Especialidades RP
        { wch: 25 }, // Responsable Planeación Urbana
        { wch: 15 }, // Oficio PU
        { wch: 15 }, // Fecha Registro
        { wch: 20 }, // Fecha Actualización
        { wch: 15 }, // Fecha Baja
        { wch: 10 }, // Estado
      ];
      ws['!cols'] = wscols;

      // Agregar hoja al libro con nombre seguro
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

      // Generar nombre del archivo seguro (sin caracteres inválidos)
      const dateStr = new Date().toISOString().slice(0, 10);
      const nombreArchivo = this.crearNombreArchivoSeguro(
        `Director_${director.clave_director || director.id}_${dateStr}`
      ) + '.xlsx';

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);
      
      return true;
    } catch (error) {
      console.error('Error al exportar director a Excel:', error);
      throw new Error('No se pudo exportar el director a Excel');
    }
  }

  // Función para crear nombre de hoja seguro (sin caracteres inválidos)
  private static crearNombreHojaSeguro(nombre: string): string {
    // Caracteres inválidos para nombres de hojas en Excel: : \ / ? * [ ]
    const caracteresInvalidos = /[:\\\/\?\*\[\]]/g;
    
    // Reemplazar caracteres inválidos con guión bajo
    let nombreSeguro = nombre.replace(caracteresInvalidos, '_');
    
    // Limitar longitud a 31 caracteres (máximo permitido en Excel)
    nombreSeguro = nombreSeguro.substring(0, 31);
    
    // Si el nombre está vacío después de limpiar, usar un nombre por defecto
    if (!nombreSeguro.trim()) {
      nombreSeguro = 'Director';
    }
    
    return nombreSeguro;
  }

  // Función para crear nombre de archivo seguro
  private static crearNombreArchivoSeguro(nombre: string): string {
    // Caracteres inválidos para nombres de archivo en Windows: < > : " / \ | ? *
    const caracteresInvalidos = /[<>:"\/\\|?*]/g;
    
    // Reemplazar caracteres inválidos con guión bajo
    let nombreSeguro = nombre.replace(caracteresInvalidos, '_');
    
    // Si el nombre está vacío después de limpiar, usar un nombre por defecto
    if (!nombreSeguro.trim()) {
      nombreSeguro = 'Director_Exportado';
    }
    
    return nombreSeguro;
  }

  // Función para formatear fecha
  private static formatDate(dateString?: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

export default ExcelDirectores;