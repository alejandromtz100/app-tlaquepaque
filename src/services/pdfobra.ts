import jsPDF from 'jspdf';

// Función helper para dividir texto por palabras completas sin cortar palabras
function splitTextByWords(pdf: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      // La palabra no cabe, guardar la línea actual y empezar nueva
      lines.push(currentLine);
      currentLine = word;
    } else {
      // La palabra cabe, agregarla a la línea actual
      currentLine = testLine;
    }
  });

  // Agregar la última línea si tiene contenido
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

interface ObraData {
  consecutivo: string;
  folioDeLaForma?: string;
  fechaCaptura: string | Date;
  fechaIngreso?: string | Date;
  fechaDictamen?: string | Date;
  nombrePropietario: string;
  tipoPropietario?: string;
  representanteLegal?: string;
  identificacion?: string;
  tipoIdentificacion?: string;
  domicilioPropietario?: string;
  coloniaPropietario?: string;
  codigoPostalPropietario?: string;
  municipioPropietario?: string;
  entidadPropietario?: string;
  telefonoPropietario?: string;
  rfcPropietario?: string;
  numerosOficiales?: Array<{ calle?: string; numeroOficial?: string }>;
  nombreColoniaObra?: string;
  idDensidadColoniaObra?: string;
  entreCalle1Obra?: string;
  entreCalle2Obra?: string;
  descripcionProyecto?: string;
  destinoActualProyeto?: string;
  destinoPropuestoProyecto?: string;
  coeficienteOcupacion?: string;
  coeficienteUtilizacion?: string;
  servidumbreFrontal?: string;
  servidumbreLateral?: string;
  servidumbrePosterior?: string;
  vigencia?: string;
  estadoVerificacion?: string;
  // Datos del director (cuando existe idDirectorObra)
  directorNombre?: string;
  directorFechaActualizacion?: string | Date;
  directorDomicilio?: string;
  directorColonia?: string;
  directorMunicipio?: string;
  directorTelefono?: string;
  // Bitácora viene de op_obras, no del director
  bitacoraObra?: string;
  direccionMedioAmbiente?: string;
  observaciones?: string;
  verificador?: string;
  notaServidumbre?: string;
  // Campos editables para autorización
  nombreAutorizacion?: string;
  rev?: string;
  cuant?: string;
  conceptos?: Array<{
    conceptoPath: Array<{ nombre: string; id?: number }>;
    conceptoNombre?: string;
    observaciones?: string; // Observaciones de obra-conceptos
    conceptoObservaciones?: string; // Observaciones del concepto hijo
    costo_unitario: number;
    medicion?: string;
    cantidad: number;
    total: number;
  }>;
}

export class PDFObra {
  static async generarAlineamientoNumeroOficial(obra: ObraData) {
    await this.build(obra, 'ALINEAMIENTO Y NUMERO OFICIAL');
  }

  static async generarLicenciaConstruccion(obra: ObraData) {
    await this.build(obra, 'LICENCIA DE CONSTRUCCIÓN');
  }

  static async generarCertificadoHabitabilidad(obra: ObraData) {
    await this.build(obra, 'CERTIFICADO DE HABITABILIDAD');
  }

  private static async build(obra: ObraData, titulo: string) {
    // Tamaño personalizado: 216 × 356 mm (vertical)
    const pdf = new jsPDF({ unit: 'mm', format: [216, 356] });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const L = 8; // Margen izquierdo reducido (de 15 a 8mm)
    const R = W - 8; // Margen derecho claro y consistente (8mm desde el borde derecho)
    // Margen superior amplio para poder colocar un logo
    let y = 40;

    // ——— 1. TÍTULO (centrado) ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(titulo.toUpperCase(), W / 2, y, { align: 'center' });
    y += 6;

    // ——— 2. FILA: DENSIDAD | USO DEL PREDIO | VIGENCIA | CLAVE (CLAVE = consecutivo) ———
    const densidad = (obra.idDensidadColoniaObra || '').toUpperCase() || '—';
    const usoPredio = (obra.destinoPropuestoProyecto || '').toUpperCase() || '—';
    const vigencia = obra.vigencia || '—';
    const clave = obra.consecutivo || '—';

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DENSIDAD', L, y);
    pdf.text('USO DEL PREDIO', L + 38, y);
    pdf.text('VIGENCIA', L + 95, y);
    pdf.text('CLAVE', R, y, { align: 'right' }); // Alineado a la derecha con margen claro
    y += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.text(densidad, L, y);
    pdf.text(usoPredio, L + 38, y);
    pdf.text(vigencia, L + 95, y);
    pdf.text(clave, R, y, { align: 'right' }); // Alineado a la derecha con margen claro
    y += 8;

    // ——— 3. UBICACION DE LA OBRA ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('UBICACION DE LA OBRA', L, y);
    y += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text('NOMBRE DEL PROPIETARIO', L, y);
    pdf.text((obra.nombrePropietario || '—').toUpperCase(), L + 50, y);
    y += 4;

    const direccionObra = obra.numerosOficiales?.length
      ? obra.numerosOficiales.map(n => [n.calle, n.numeroOficial].filter(Boolean).join(' , ')).filter(Boolean).join(' , ')
      : '—';
    pdf.text('CALLE/NUMERO OFICIAL', L, y);
    pdf.text(direccionObra, L + 50, y);
    y += 4;

    pdf.text('COLONIA', L, y);
    pdf.text((obra.nombreColoniaObra || '—').toUpperCase(), L + 50, y);
    y += 4;

    const entreCalles = [obra.entreCalle1Obra, obra.entreCalle2Obra].filter(Boolean).join(' Y ') || '—';
    pdf.text('ENTRE LA CALLE Y LA CALLE', L, y);
    pdf.text(entreCalles, L + 50, y);
    y += 8;

    // ——— 4. DIRECTOR RESPONSABLE (solo si hay datos de director) ———
    const tieneDirector = !!(
      obra.directorNombre ||
      obra.directorFechaActualizacion ||
      obra.directorDomicilio ||
      obra.directorColonia ||
      obra.directorMunicipio ||
      obra.directorTelefono
    );
    if (tieneDirector) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('DIRECTOR RESPONSABLE', L, y);
      y += 4;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const col1X = L;
      const col2X = L + 95;

      if (obra.directorNombre) {
        pdf.text('NOMBRE', col1X, y);
        pdf.text(obra.directorNombre.toUpperCase(), col1X + 20, y);
        y += 4;
      }
      if (obra.directorFechaActualizacion) {
        const fechaActualizacion = obra.directorFechaActualizacion instanceof Date
          ? obra.directorFechaActualizacion.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : typeof obra.directorFechaActualizacion === 'string'
            ? new Date(obra.directorFechaActualizacion).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : obra.directorFechaActualizacion;
        pdf.text('REGISTRO', col1X, y);
        pdf.text(`Fecha de Actualizacion ${fechaActualizacion}`, col1X + 25, y);
        if (obra.bitacoraObra) {
          pdf.text('BITACORA', col2X, y);
          pdf.text(obra.bitacoraObra, col2X + 20, y);
        }
        y += 4;
      }
      if (obra.directorDomicilio) {
        pdf.text('DOMICILIO', col1X, y);
        pdf.text(obra.directorDomicilio.toUpperCase(), col1X + 20, y);
        if (obra.directorColonia) {
          pdf.text('COLONIA', col2X, y);
          pdf.text(obra.directorColonia.toUpperCase(), col2X + 20, y);
        }
        y += 4;
      }
      if (obra.directorMunicipio || obra.directorTelefono) {
        pdf.text('MUNICIPIO', col1X, y);
        pdf.text((obra.directorMunicipio || '').toUpperCase(), col1X + 20, y);
        if (obra.directorTelefono) {
          pdf.text('TELEFONO', col2X, y);
          pdf.text(obra.directorTelefono, col2X + 20, y);
        }
        y += 4;
      }
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(L, y, R, y);
      y += 8;
    }

    // ——— 5. DETALLES DE LA LICENCIA (título centrado con líneas) ———
    pdf.line(L, y, R, y);
    y += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('DETALLES DE LA LICENCIA', W / 2, y, { align: 'center' });
    y += 3;
    pdf.line(L, y, R, y);
    y += 4;

    // Tabla de conceptos (encabezado con fondo gris simulado con rectángulo)
    // Ajustar anchos: CONCEPTO mucho más ancho, otras columnas más cortas
    // La tabla debe llegar exactamente hasta el margen derecho R
    // Ancho total disponible: R - L = 216 - 8 - 8 = 200mm
    const colWidths = [98, 32, 18, 18, 15, 19]; // Total: 200mm (ajustado para llegar a R)
    const headers = ['CONCEPTO', 'OBSERVACIONES', 'COSTO', 'MEDICION', 'CANT.', 'TOTAL'];
    const tableLeft = L;
    const tableRight = R; // La tabla llega exactamente hasta el margen derecho

    pdf.setFillColor(200, 200, 200);
    pdf.rect(tableLeft, y - 3, tableRight - tableLeft, 5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    let x = L;
    headers.forEach((h, i) => {
      if (i === 0 || i === 1) {
        // CONCEPTO y OBSERVACIONES alineados a la izquierda
        pdf.text(h, x + 2, y);
      } else if (i >= 2) {
        // COSTO, MEDICION, CANT., TOTAL alineados a la derecha
        pdf.text(h, x + colWidths[i] - 2, y, { align: 'right' });
      }
      x += colWidths[i];
    });
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    let totalGeneral = 0;

    if (obra.conceptos && obra.conceptos.length > 0) {
      obra.conceptos.forEach((c) => {
        if (y > H - 35) {
          pdf.addPage();
          y = 40;
          pdf.setFillColor(200, 200, 200);
          pdf.rect(tableLeft, y - 3, tableRight - tableLeft, 5, 'F');
          x = L;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          headers.forEach((h, i) => {
            if (i === 0 || i === 1) {
              pdf.text(h, x + 2, y);
            } else if (i >= 2) {
              pdf.text(h, x + colWidths[i] - 2, y, { align: 'right' });
            }
            x += colWidths[i];
          });
          y += 5;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6);
        }

        // Mostrar hasta 4 generaciones de conceptos en la misma línea (Abuelo, Padre, Hijo, Nieto)
        const path = c.conceptoPath || [];
        const conceptosNombres = path.map((p: { nombre: string }) => p.nombre.toUpperCase()).filter(Boolean);
        
        // Usar observaciones del último concepto de la tabla conceptos (conceptoObservaciones)
        const observaciones = c.conceptoObservaciones || c.observaciones || null;
        const observacionesText = observaciones && observaciones.trim() !== '' ? observaciones.toUpperCase() : '—';
        // Dividir observaciones por palabras completas también
        const observacionesLines = splitTextByWords(pdf, observacionesText, colWidths[1] - 4);
        
        // Formato: todos los conceptos con ancho fijo y bien alineados
        const anchoTotalDisponible = colWidths[0] - 4;
        const espacioEntreConceptos = 3; // Espacio mínimo entre conceptos
        const maxConceptos = 4; // Máximo de 4 generaciones
        
        // Ancho fijo para cada concepto (todos tienen el mismo límite)
        // Esto asegura que todos se vean del mismo tamaño y bien alineados
        const espacioTotalEntreConceptos = espacioEntreConceptos * (maxConceptos - 1);
        const anchoFijoPorConcepto = (anchoTotalDisponible - espacioTotalEntreConceptos) / maxConceptos;
        
        // Dividir cada concepto en líneas según su ancho fijo asignado
        // Usar función personalizada para dividir por palabras completas
        const conceptosLines = conceptosNombres.map((nombre: string) => 
          splitTextByWords(pdf, nombre, anchoFijoPorConcepto)
        );
        
        x = L;
        // Todos los conceptos alineados desde arriba (mismo Y inicial)
        let maxHeight = 0;
        let currentX = x + 2;
        
        conceptosLines.forEach((lines: string[]) => {
          if (lines.length > 0) {
            // Renderizar cada línea del concepto horizontalmente, ajustando Y para cada línea
            let currentY = y;
            lines.forEach((line: string) => {
              pdf.text(line, currentX, currentY);
              currentY += 3.5; // Espacio entre líneas del mismo concepto
            });
            // Calcular altura máxima de este concepto
            const conceptoHeight = lines.length * 3.5;
            maxHeight = Math.max(maxHeight, conceptoHeight);
            // Avanzar X para el siguiente concepto con el ancho fijo
            currentX += anchoFijoPorConcepto + espacioEntreConceptos;
          }
        });
        
        // Calcular altura total de la fila (máximo entre concepto y observaciones)
        // Agregar más espacio vertical para mejor legibilidad
        const rowH = Math.max(
          maxHeight + 1, // +1mm de espacio extra
          observacionesLines.length * 3.5 + 1,
          6 // Mínimo de 6mm de altura
        );

        x += colWidths[0];
        
        // OBSERVACIONES (izquierda) - usar observaciones de obra_conceptos
        // Alinear desde la parte superior de la fila (y)
        // Renderizar cada línea de observaciones correctamente
        let obsY = y;
        observacionesLines.forEach((line: string) => {
          pdf.text(line, x + 2, obsY);
          obsY += 3.5;
        });
        x += colWidths[1];
        
        // COSTO (derecha)
        const costoStr = `$${Number(c.costo_unitario ?? 0).toFixed(2)}`;
        pdf.text(costoStr, x + colWidths[2] - 2, y, { align: 'right' });
        x += colWidths[2];
        
        // MEDICION (centro o derecha)
        pdf.text((c.medicion || '—'), x + colWidths[3] - 2, y, { align: 'right' });
        x += colWidths[3];
        
        // CANTIDAD (derecha)
        const cantStr = String(c.cantidad);
        pdf.text(cantStr, x + colWidths[4] - 2, y, { align: 'right' });
        x += colWidths[4];
        
        // TOTAL (derecha)
        const total = Number(c.total ?? (c.costo_unitario ?? 0) * (c.cantidad ?? 0));
        totalGeneral += total;
        const totalStr = `$${total.toFixed(2)}`;
        pdf.text(totalStr, x + colWidths[5] - 2, y, { align: 'right' });
        
        y += rowH;
      });
    }

    // Total general (arriba a la derecha, como en la captura)
    y += 2;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    const totalStr = `$${totalGeneral.toFixed(2)}`;
    pdf.text(totalStr, R, y, { align: 'right' });
    y += 8;

    // ——— 6. Parámetros técnicos (COS, CUS, SERVIDUMBRES) ———
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    const cos = obra.coeficienteOcupacion ?? '—';
    const cus = obra.coeficienteUtilizacion ?? '—';
    pdf.text(`COS: ${cos} CUS: ${cus} SERVIDUMBRES FRONTAL: ${obra.servidumbreFrontal ?? '0'}mts LATERAL: ${obra.servidumbreLateral ?? '0'} POSTERIOR: ${obra.servidumbrePosterior ?? '0'}mts`, L, y);
    y += 4;
    if (obra.notaServidumbre) {
      pdf.setFontSize(6);
      pdf.text(`NOTA: ${obra.notaServidumbre}`, L, y);
      y += 4;
    }
    y += 3;

    // ——— 7. DESCRIPCION ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('DESCRIPCION', L, y);
    y += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    const descripcion = obra.descripcionProyecto || obra.destinoActualProyeto || '—';
    const descLines = splitTextByWords(pdf, descripcion.toUpperCase(), R - L);
    descLines.forEach((line: string) => {
      pdf.text(line, L, y);
      y += 3.5;
    });
    y += 3;

    if (obra.direccionMedioAmbiente) {
      pdf.text(`DIRECCION DE MEDIO AMBIENTE: ${obra.direccionMedioAmbiente}.`, L, y);
      y += 5;
    }
    y += 3;

    // ——— 8. OBSERVACIONES ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('OBSERVACIONES', L, y);
    y += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    if (obra.observaciones) {
      const obsLines = splitTextByWords(pdf, obra.observaciones.toUpperCase(), R - L);
      obsLines.forEach((line: string) => {
        pdf.text(line, L, y);
        y += 3.5;
      });
      y += 3;
    }
    if (obra.verificador) {
      pdf.text(`VERIFICADOR: ${obra.verificador.toUpperCase()}`, L, y);
      y += 4;
    }
    // El texto de autorización ya no se muestra aquí, solo se muestra el contenido de observaciones (notas)
    y += 6;

    // ——— 9. AUTORIZACION (centrado, con espacio para firmas y sellos) ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('AUTORIZACION', W / 2, y, { align: 'center' });
    y += 15; // Más espacio después del título para bajar el bloque y dejar espacio para firmas/sellos
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9); // Texto más grande (de 8 a 9)
    const autorizacionX = L + 20; // Un poco más a la izquierda (20mm desde el margen izquierdo)
    const nombreAutorizacionTexto = obra.nombreAutorizacion || 'C. JONATHAN TORRES SIFUENTES';
    pdf.text(nombreAutorizacionTexto.toUpperCase(), autorizacionX, y);
    y += 3.5; // Espacio mínimo (pegado) entre nombre y título
    pdf.text('DIRECTOR PADRON Y LICENCIAS', autorizacionX, y);
    y += 12; // Más espacio entre título e iniciales (para sellos)
    
    // Iniciales según el tipo de documento
    let iniciales = '';
    if (titulo === 'ALINEAMIENTO Y NUMERO OFICIAL') {
      iniciales = 'PFM / MGR / EAAO / JLR';
    } else if (titulo === 'LICENCIA DE CONSTRUCCIÓN') {
      iniciales = 'AAJJ / MGR / EAAO / JLR';
    } else if (titulo === 'CERTIFICADO DE HABITABILIDAD') {
      iniciales = 'PFM / EAAO / JLR';
    } else {
      iniciales = 'AAJJ / PFM / MGR / EAAO / JLR'; // Por defecto
    }
    pdf.text(iniciales, autorizacionX, y);
    y += 10; // Más espacio antes de Rev/Cuant

    // ——— 10. Rev, Cuant, FECHAS ———
    pdf.setFontSize(7);
    const revTexto = obra.rev || '';
    const cuantTexto = obra.cuant || 'AFAI';
    if (revTexto) {
      pdf.text(`Rev: ${revTexto}`, L, y);
      y += 4; // Espacio para que Cuant esté abajo
    } else {
      pdf.text('Rev:', L, y);
      y += 4; // Espacio para que Cuant esté abajo
    }
    pdf.text(`Cuant: ${cuantTexto}`, L, y);
    y += 4;
    const fechaIngreso = obra.fechaIngreso
      ? new Date(obra.fechaIngreso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : obra.fechaCaptura
        ? new Date(obra.fechaCaptura).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
    const fechaDictamen = obra.fechaDictamen
      ? new Date(obra.fechaDictamen).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';
    pdf.text(`FECHA DE INGRESO: ${fechaIngreso}`, L, y);
    y += 4;
    pdf.text(`FECHA DE DICTAMEN: ${fechaDictamen}`, L, y); // Debajo de FECHA DE INGRESO, alineado a la izquierda

    const nombreArchivo = titulo.replace(/\s+/g, '_').replace(/Ó/g, 'O').toUpperCase();
    pdf.save(`${nombreArchivo}_${obra.consecutivo || 'SIN_CONSECUTIVO'}.pdf`);
  }
}
