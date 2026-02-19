import jsPDF from 'jspdf';
import fondoLicencia from '../assets/fondo_licencia.jpg';

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
  directorNombre?: string;
  directorFechaActualizacion?: string;
  directorBitacora?: string;
  directorDomicilio?: string;
  directorColonia?: string;
  directorMunicipio?: string;
  directorTelefono?: string;
  direccionMedioAmbiente?: string;
  observaciones?: string;
  verificador?: string;
  notaServidumbre?: string;
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

// Función para cargar imagen de fondo
async function cargarFondo(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = fondoLicencia;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      // Aplicar transparencia al fondo
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve('');
  });
}

export class PDFPreForma {
  static async generar(obra: ObraData) {
    const pdf = new jsPDF({ unit: 'mm', format: 'letter' });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const L = 15;
    const R = W - 15;
    let y = 35; // Aumentado el margen superior para bajar el título

    // Cargar y agregar imagen de fondo
    try {
      const fondoBase64 = await cargarFondo();
      if (fondoBase64) {
        pdf.addImage(fondoBase64, 'JPEG', 0, 0, W, H);
      }
    } catch (error) {
      console.error('Error al agregar fondo:', error);
    }

    // ——— TÍTULO PRE FORMA ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('PRE FORMA', W / 2, y, { align: 'center' });
    y += 8;

    // ——— FILA: DENSIDAD | USO DEL PREDIO | VIGENCIA | CLAVE ———
    const densidad = obra.idDensidadColoniaObra || '—';
    const usoPredio = (obra.destinoActualProyeto || obra.destinoPropuestoProyecto || '').toUpperCase() || '—';
    const vigencia = obra.vigencia || '—';
    const clave = (obra.consecutivo || '—').toUpperCase();

    // Calcular fecha de vencimiento si hay vigencia
    let vigenciaLine1 = vigencia;
    let vigenciaLine2 = '';
    if (vigencia && vigencia !== '—' && obra.fechaCaptura) {
      try {
        const fechaCaptura = new Date(obra.fechaCaptura);
        const diasVigencia = parseInt(vigencia);
        if (!isNaN(diasVigencia)) {
          const fechaVencimiento = new Date(fechaCaptura);
          fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVigencia);
          const fechaVencimientoStr = fechaVencimiento.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
          vigenciaLine1 = `${vigencia} Dias`;
          vigenciaLine2 = `Vencimiento:${fechaVencimientoStr}`;
        }
      } catch (e) {
        // Si hay error, usar solo la vigencia
      }
    }

    // Dividir USO DEL PREDIO en líneas si es necesario
    const usoPredioLines = pdf.splitTextToSize(usoPredio, 40);

    const alturaEncabezado = 6;

    // Posiciones X de columnas
    const col1X = L;
    const col2X = L + 38;
    const col3X = L + 95;
    const col4X = L + 145;

    // Fila de encabezados con fondo gris
    pdf.setFillColor(220, 220, 220);
    pdf.rect(L, y - alturaEncabezado, W - (L * 2), alturaEncabezado, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('DENSIDAD', col1X + 2, y - 1);
    pdf.text('USO DEL PREDIO', col2X + 2, y - 1);
    pdf.text('VIGENCIA', col3X + 2, y - 1);
    pdf.text('CLAVE', col4X + 2, y - 1);
    y += 5; // Aumentado el espaciado entre encabezados y datos

    // Fila de datos con fondo blanco (ya está en blanco por defecto)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    // DENSIDAD (normal)
    pdf.text(densidad, col1X + 2, y);
    
    // USO DEL PREDIO (negrita, mayúsculas, múltiples líneas)
    pdf.setFont('helvetica', 'bold');
    let yUso = y;
    usoPredioLines.forEach((line: string) => {
      pdf.text(line.toUpperCase(), col2X + 2, yUso);
      yUso += 5;
    });
    pdf.setFont('helvetica', 'normal');
    
    // VIGENCIA (normal, múltiples líneas)
    let yVig = y;
    pdf.text(vigenciaLine1, col3X + 2, yVig);
    if (vigenciaLine2) {
      yVig += 5;
      pdf.text(vigenciaLine2, col3X + 2, yVig);
    }
    
    // CLAVE (negrita, mayúsculas)
    pdf.setFont('helvetica', 'bold');
    pdf.text(clave, col4X + 2, y);
    pdf.setFont('helvetica', 'normal');
    
    // Ajustar y según la altura máxima
    const maxDataHeight = Math.max(1, usoPredioLines.length, vigenciaLine2 ? 2 : 1) * 5;
    y += maxDataHeight + 8;

    // ——— UBICACION DE LA OBRA ———
    // Encabezado con fondo destacado
    pdf.setFillColor(240, 240, 240);
    pdf.rect(L, y - 3, W - (L * 2), 6, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('UBICACION DE LA OBRA', L + 2, y);
    y += 8;

    // Campos con formato: ETIQUETA valor (alineados)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const labelWidth = 50; // Ancho fijo para las etiquetas
    const valueStartX = L + labelWidth + 5; // Inicio de los valores
    
    // NOMBRE DEL PROPIETARIO
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOMBRE DEL PROPIETARIO:', L, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text((obra.nombrePropietario || '—').toUpperCase(), valueStartX, y);
    y += 5;

    // CALLE/NUMERO OFICIAL
    const direccionObra = obra.numerosOficiales?.length
      ? obra.numerosOficiales.map(n => {
          const partes = [n.calle, n.numeroOficial].filter(Boolean);
          return partes.length > 0 ? partes.join(', ') : '—';
        }).filter(Boolean).join(', ')
      : '—';
    pdf.setFont('helvetica', 'bold');
    pdf.text('CALLE/NUMERO OFICIAL:', L, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(direccionObra.toUpperCase(), valueStartX, y);
    y += 5;

    // COLONIA
    pdf.setFont('helvetica', 'bold');
    pdf.text('COLONIA:', L, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text((obra.nombreColoniaObra || '—').toUpperCase(), valueStartX, y);
    y += 5;

    // ENTRE LA CALLE
    pdf.setFont('helvetica', 'bold');
    pdf.text('ENTRE LA CALLE:', L, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text((obra.entreCalle1Obra || '—').toUpperCase(), valueStartX, y);
    y += 5;

    // Y LA CALLE
    pdf.setFont('helvetica', 'bold');
    pdf.text('Y LA CALLE:', L, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text((obra.entreCalle2Obra || '—').toUpperCase(), valueStartX, y);
    y += 8;

    // ——— DETALLES DE LA LICENCIA ———
    pdf.line(L, y, R, y);
    y += 4;
    // Fondo gris para el título
    pdf.setFillColor(220, 220, 220);
    const tituloHeight = 6;
    pdf.rect(L, y - tituloHeight / 2, W - (L * 2), tituloHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('DETALLES DE LA LICENCIA', W / 2, y, { align: 'center' });
    y += 5;
    pdf.line(L, y, R, y);
    y += 6;

    // Tabla de conceptos (encabezado con fondo gris oscuro y texto blanco)
    // Ajustar anchos: CONCEPTO mucho más ancho, columnas numéricas más compactas
    // Total: 95+30+15+15+12+18 = 185mm (columnas numéricas más ajustadas)
    const colWidths = [95, 30, 15, 15, 12, 18];
    const headers = ['CONCEPTO', 'LEY DE INGRESOS', 'COSTO', 'MEDICION', 'CANT.', 'TOTAL'];
    const tableLeft = L;
    const tableRight = L + colWidths.reduce((a, b) => a + b, 0);

    pdf.setFillColor(100, 100, 100);
    pdf.rect(tableLeft, y - 3, tableRight - tableLeft, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    let x = L;
    headers.forEach((h, i) => {
      // Todos los encabezados centrados
      const colCenter = x + colWidths[i] / 2;
      pdf.text(h, colCenter, y, { align: 'center' });
      x += colWidths[i];
    });
    pdf.setTextColor(0, 0, 0); // Restaurar color negro para el contenido
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    let totalGeneral = 0;

    if (obra.conceptos && obra.conceptos.length > 0) {
      // Cargar el fondo una vez antes del loop
      const fondoBase64 = await cargarFondo();
      
      obra.conceptos.forEach((c) => {
        if (y > H - 35) {
          pdf.addPage();
          // Agregar fondo en nueva página
          if (fondoBase64) {
            pdf.addImage(fondoBase64, 'JPEG', 0, 0, W, H);
          }
          y = 40;
          pdf.setFillColor(100, 100, 100);
          pdf.rect(tableLeft, y - 3, tableRight - tableLeft, 5, 'F');
          pdf.setTextColor(255, 255, 255);
          x = L;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          headers.forEach((h, i) => {
            // Todos los encabezados centrados
            const colCenter = x + colWidths[i] / 2;
            pdf.text(h, colCenter, y, { align: 'center' });
            x += colWidths[i];
          });
          pdf.setTextColor(0, 0, 0); // Restaurar color negro para el contenido
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
        
        // LEY DE INGRESOS (izquierda) - usar observaciones de obra_conceptos
        // Alinear desde la parte superior de la fila (y)
        // Renderizar cada línea de observaciones correctamente
        let obsY = y;
        observacionesLines.forEach((line: string) => {
          pdf.text(line, x + 2, obsY);
          obsY += 3.5;
        });
        x += colWidths[1];
        
        // Calcular posición vertical centrada para valores numéricos
        const yCentro = y + (rowH / 2) - 1.5;
        
        // COSTO (centrado horizontalmente y verticalmente)
        const costoStr = `$${Number(c.costo_unitario ?? 0).toFixed(2)}`;
        const costoX = x + colWidths[2] / 2;
        pdf.text(costoStr, costoX, yCentro, { align: 'center' });
        x += colWidths[2];
        
        // MEDICION (centrado horizontalmente y verticalmente)
        const medicionStr = c.medicion || '—';
        const medicionX = x + colWidths[3] / 2;
        pdf.text(medicionStr, medicionX, yCentro, { align: 'center' });
        x += colWidths[3];
        
        // CANTIDAD (centrado horizontalmente y verticalmente)
        const cantStr = String(c.cantidad);
        const cantX = x + colWidths[4] / 2;
        pdf.text(cantStr, cantX, yCentro, { align: 'center' });
        x += colWidths[4];
        
        // TOTAL (centrado horizontalmente y verticalmente)
        const total = Number(c.total ?? (c.costo_unitario ?? 0) * (c.cantidad ?? 0));
        totalGeneral += total;
        const totalStr = `$${total.toFixed(2)}`;
        const totalX = x + colWidths[5] / 2;
        pdf.text(totalStr, totalX, yCentro, { align: 'center' });
        
        y += rowH;
      });
    }

    // Total general (alineado a la derecha, más grande y destacado)
    y += 4;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    const totalStr = `$${totalGeneral.toFixed(2)}`;
    pdf.text(totalStr, R, y, { align: 'right' });
    y += 14;

    // ——— Parámetros técnicos (COS, CUS, SERVIDUMBRES) ———
    // Fondo gris para COS/CUS
    pdf.setFillColor(220, 220, 220);
    const cosCusHeight = 6;
    pdf.rect(L, y - cosCusHeight / 2, W - (L * 2), cosCusHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    const cos = obra.coeficienteOcupacion ?? '—';
    const cus = obra.coeficienteUtilizacion ?? '—';
    const servFrontal = obra.servidumbreFrontal ?? '0';
    const servLateral = obra.servidumbreLateral ?? '0';
    const servPosterior = obra.servidumbrePosterior ?? '0';
    pdf.text(`COS: ${cos} CUS: ${cus} SERVIDUMBRES FRONTAL: ${servFrontal}mts LATERAL: ${servLateral} POSTERIOR: ${servPosterior}mts`, L, y);
    y += 5;
    
    // Nota de servidumbre si existe
    if (obra.notaServidumbre) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`NOTA: ${obra.notaServidumbre}`, L, y);
      y += 6;
    }
    y += 6;

    // Calcular ancho disponible una sola vez
    const anchoDisponible = W - (L * 2); // Ancho total menos márgenes izquierdo y derecho

    // ——— DESCRIPCION ———
    // Fondo gris para DESCRIPCION
    pdf.setFillColor(220, 220, 220);
    const descHeight = 6;
    pdf.rect(L, y - descHeight / 2, W - (L * 2), descHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('DESCRIPCION', L, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const descripcion = obra.descripcionProyecto || obra.destinoActualProyeto || '—';
    const descLines = pdf.splitTextToSize(descripcion, anchoDisponible);
    pdf.text(descLines, L, y);
    y += descLines.length * 4 + 4;

    // ——— OBSERVACIONES ———
    // Fondo gris para OBSERVACIONES
    pdf.setFillColor(220, 220, 220);
    const obsHeight = 6;
    pdf.rect(L, y - obsHeight / 2, W - (L * 2), obsHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('OBSERVACIONES', L, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    if (obra.observaciones) {
      const obsLines = pdf.splitTextToSize(obra.observaciones, anchoDisponible);
      pdf.text(obsLines, L, y);
      y += obsLines.length * 4 + 4;
    }
    // Agregar verificador si existe
    if (obra.verificador) {
      pdf.text(obra.verificador.toUpperCase(), L, y);
      y += 5;
    }
    y += 4;

    // ——— Rev, Cuant, FECHAS ———
    pdf.setFontSize(8);
    pdf.text('Rev:', L, y);
    y += 5; // Cuant abajo de Rev
    pdf.text('Cuant: AFAI', L, y);
    y += 5;
    const fechaIngreso = obra.fechaIngreso
      ? new Date(obra.fechaIngreso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : obra.fechaCaptura
        ? new Date(obra.fechaCaptura).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
    const fechaDictamen = obra.fechaDictamen
      ? new Date(obra.fechaDictamen).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';
    pdf.text(`FECHA DE INGRESO: ${fechaIngreso}`, L, y);
    y += 5; // FECHA DE DICTAMEN abajo de INGRESO
    pdf.text(`FECHA DE DICTAMEN: ${fechaDictamen}`, L, y);
    y += 8;

    // ——— NOTA FINAL ———
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const notaFinal = 'NOTA: Esta calificacion es de caracter preparatoria, la calificacion definitiva esta condicionada al reporte de inspeccion. Se proporciona informacion sobre el avance de tramite comunicandose a los telefonos: 33-3562-7054, 33-3562-7055, 33-3562-7056, 33-3562-7058, 33-3562-7059, 33-3562-7060 ext. 2420 y 2435';
    const notaLines = pdf.splitTextToSize(notaFinal, anchoDisponible);
    pdf.text(notaLines, L, y);

    const nombreArchivo = 'PRE_FORMA';
    pdf.save(`${nombreArchivo}_${obra.consecutivo || 'SIN_CONSECUTIVO'}.pdf`);
  }
}
