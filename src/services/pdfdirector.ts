import type { DirectorObra } from './directores.service';
import { DirectoresService } from './directores.service';
import jsPDF from 'jspdf';
import fondoImagen from '../assets/directores_obras4.jpg';

export class PDFDirector {
  static async generarResponsableObra(d: DirectorObra) {
    await this.build(d, 1);
  }

  static async generarResponsableProyecto(d: DirectorObra) {
    await this.build(d, 2);
  }

  // Nuevo método para Planeación Urbana
  static async generarResponsablePlaneacionUrbana(d: DirectorObra) {
    await this.build(d, 3);
  }

  private static async build(d: DirectorObra, formato: number) {
    const pdf = new jsPDF({ unit: 'mm', format: 'letter' });

    await this.background(pdf);
    this.header(pdf, d, formato);
    this.body(pdf, d, formato);
    await this.foto(pdf, d);

    const tipo = formato === 1 ? 'Responsable_Obra' : 
                formato === 2 ? 'Responsable_Proyecto' : 
                'Responsable_Planeacion_Urbana';
    
    pdf.save(`${tipo}_${d.nombre_completo}.pdf`);
  }

  // ================= FONDO =================
  private static async background(pdf: jsPDF) {
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();

    const img = new Image();
    img.src = fondoImagen;
    await new Promise(res => (img.onload = res));

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, w, h);
  }

  // ================= HEADER =================
  private static header(pdf: jsPDF, d: DirectorObra, formato: number) {
    const W = pdf.internal.pageSize.getWidth();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(
      'DIRECCIÓN DE CONTROL DE LA EDIFICACIÓN',
      W - 20,
      20,
      { align: 'right' }
    );

    pdf.setFont('helvetica', 'normal');
    
    let oficio = '';
    if (formato === 1) {
      oficio = d.oficio_autorizacion_ro || 'Sin número';
    } else if (formato === 2) {
      oficio = d.oficio_autorizacion_rp || 'Sin número';
    } else {
      oficio = d.oficio_autorizacion_pu || 'Sin número';
    }

    pdf.text(`OFICIO No. ${oficio}`, W - 20, 26, { align: 'right' });
  }

  // ================= CUERPO =================
  private static body(pdf: jsPDF, d: DirectorObra, formato: number) {
    const L = 60;
    const W = 105;
    let y = 46;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const intro =
      `En atención a su solicitud y una vez entregada la documentación requerida por el Reglamento de Construcción en vigor, queda el interesado, registrado en esta dependencia con los siguientes datos:`;

    const introLines = pdf.splitTextToSize(intro, W);
    pdf.text(introLines, L, y);
    y += introLines.length * 5 + 6;

    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS REGISTRADO:', L, y);
    y += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`NOMBRE: ${d.nombre_completo.toUpperCase()}`, L, y);
    y += 6;

    pdf.text(`NÚMERO DE REGISTRO ASIGNADO: ${d.clave_director || 'Sin clave'}`, L, y);
    y += 6;

    pdf.text(`CEDULA FEDERAL NO: ${d.cedula_federal || 'Sin cédula'}`, L, y);
    y += 8;

    // Texto específico según el formato
    let titulo = '';
    if (formato === 1) {
      titulo = 'DIRECTOR RESPONSABLE DE OBRA';
    } else if (formato === 2) {
      titulo = 'DIRECTOR RESPONSABLE DE PROYECTO';
    } else {
      titulo = 'DIRECTOR RESPONSABLE DE PLANEACIÓN URBANA';
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text(titulo, L, y);
    y += 6;

    if (formato === 3) {
      // Para Planeación Urbana, contenido específico
      pdf.setFont('helvetica', 'normal');
      const descripcion = `El Director Responsable de Planeación Urbana está autorizado para realizar labores de planeación, diseño urbano y asesoría en materia de desarrollo urbano, de acuerdo con el oficio de autorización correspondiente.`;
      const descLines = pdf.splitTextToSize(descripcion, W);
      pdf.text(descLines, L, y);
      y += descLines.length * 5 + 6;
    } else if (formato === 1) {
      // Para Responsable de Obra
      pdf.setFont('helvetica', 'normal');
      const especialidades = this.getEspecialidades(d, formato);
      if (especialidades.trim() !== '') {
        pdf.setFont('helvetica', 'bold');
        pdf.text('ESPECIALIDADES:', L, y);
        y += 6;
        
        pdf.setFont('helvetica', 'normal');
        const especialidadesLines = especialidades.split('\n');
        pdf.text(especialidadesLines, L + 5, y);
        y += especialidadesLines.length * 5 + 6;
      } else {
        const descripcion = `Autorizado como Director Responsable de Obra de acuerdo con el oficio de autorización correspondiente.`;
        const descLines = pdf.splitTextToSize(descripcion, W);
        pdf.text(descLines, L, y);
        y += descLines.length * 5 + 6;
      }
    } else if (formato === 2) {
      // Para Responsable de Proyecto
      pdf.setFont('helvetica', 'normal');
      const especialidades = this.getEspecialidades(d, formato);
      if (especialidades.trim() !== '') {
        pdf.setFont('helvetica', 'bold');
        pdf.text('ESPECIALIDADES:', L, y);
        y += 6;
        
        pdf.setFont('helvetica', 'normal');
        const especialidadesLines = especialidades.split('\n');
        pdf.text(especialidadesLines, L + 5, y);
        y += especialidadesLines.length * 5 + 6;
      } else {
        const descripcion = `Autorizado como Director Responsable de Proyecto de acuerdo con el oficio de autorización correspondiente.`;
        const descLines = pdf.splitTextToSize(descripcion, W);
        pdf.text(descLines, L, y);
        y += descLines.length * 5 + 6;
      }
    }

    const parrafos = [
      `Como Profesional de la Ingeniería y la Arquitectura, estamos comprometidos en buena medida a que exista un ordenamiento urbano más acorde a la realidad que vivimos para coadyuvar a mejorar el deterioro social y humano por el crecimiento de nuestra ciudad.`,
      `De todo Director Responsable depende la buena ejecución de la Obra desde su inicio hasta la culminación de la misma, incluyendo el aviso de suspensión, reanudación y terminación ante esta Dependencia.`,
      `Usted como Director Responsable acepta intrínsecamente conocer, apegarse y cumplir plenamente el Código Urbano para el estado de Jalisco, el Reglamento de Construcciones en el Municipio de San Pedro Tlaquepaque y los instrumentos de planeación de este Municipio.`,
      `Esta constancia estará vigente hasta el término de la presente Administración, debiendo actualizarse durante el primer año de la siguiente Administración.`,
      `Cabe mencionar que los derechos fueron cubiertos de acuerdo a la Ley de Ingresos Municipal.`
    ];

    pdf.setFontSize(9);
    parrafos.forEach(p => {
      const lines = pdf.splitTextToSize(p, W);
      pdf.text(lines, L, y);
      y += lines.length * 4.5 + 3;
    });

    y += 8;
    const center = pdf.internal.pageSize.getWidth() / 2;

    pdf.setFontSize(10);
    pdf.text('A t e n t a m e n t e', center, y, { align: 'center' });

    y += 10;
    pdf.text('Arq. Ricardo Robles Gómez', center, y, { align: 'center' });

    y += 5;
    pdf.text(
      'Coordinador General de Gestión Integral de la Ciudad',
      center,
      y,
      { align: 'center' }
    );

    y += 6;
    pdf.setFontSize(8);
    pdf.text('c.c. Dirección de Control de la Edificación', center, y, { align: 'center' });
    y += 4;
    pdf.text('c.c. Archivo', center, y, { align: 'center' });
  }

  // ================= FOTO =================
  private static async foto(pdf: jsPDF, d: DirectorObra) {
    if (!d.imagen) {
      console.log('No hay imagen para el director:', d.nombre_completo);
      return;
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // USAR EL SERVICIO PARA OBTENER LA URL CORRECTA
      const imgUrl = DirectoresService.getImagenUrl(d.imagen);
      console.log('PDF - Cargando imagen desde:', imgUrl);
      
      img.src = imgUrl;
      
      // Esperar a que la imagen cargue con timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout cargando imagen para PDF'));
        }, 5000);
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.error('Error cargando imagen para PDF:', imgUrl);
          reject(new Error(`No se pudo cargar la imagen: ${imgUrl}`));
        };
      });
      
      // Agregar la imagen al PDF
      pdf.addImage(img, 'JPEG', 170, 72, 30, 40);
      console.log('Imagen agregada exitosamente al PDF');
      
    } catch (error) {
      console.warn('No se pudo cargar la imagen del director, omitiendo...', error);
      // No agregar imagen si falla - el PDF se generará sin foto
    }
  }

  // ================= ESPECIALIDADES =================
  private static getEspecialidades(d: DirectorObra, formato: number) {
    const e: string[] = [];

    if (formato === 1) {
      if (d.ro_edificacion) e.push('EDIFICACIÓN');
      if (d.ro_urbanizacion) e.push('URBANIZACIÓN');
      if (d.ro_restauracion) e.push('RESTAURACIÓN');
      if (d.ro_infraestructura) e.push('INFRAESTRUCTURA');
    } else if (formato === 2) {
      if (d.rp_edificacion) e.push('EDIFICACIÓN');
      if (d.rp_urbanizacion) e.push('URBANIZACIÓN');
      if (d.rp_restauracion) e.push('RESTAURACIÓN');
      if (d.rp_infraestructura) e.push('INFRAESTRUCTURA');
    }

    // Si no tiene especialidades, retornar vacío
    return e.join('\n');
  }
}