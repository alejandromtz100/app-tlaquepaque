import jsPDF from 'jspdf';

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
    conceptoPath: Array<{ nombre: string }>;
    conceptoNombre?: string;
    observaciones?: string;
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
    const pdf = new jsPDF({ unit: 'mm', format: 'letter' });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const L = 15;
    const R = W - 15;
    let y = 18;

    // ——— 1. TÍTULO (centrado) + FOLIO (arriba a la derecha) ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(titulo.toUpperCase(), W / 2, y, { align: 'center' });
    if (obra.folioDeLaForma) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Folio: ${obra.folioDeLaForma}`, R, y, { align: 'right' });
    }
    y += 8;

    // ——— 2. FILA: DENSIDAD | USO DEL PREDIO | VIGENCIA | CLAVE (CLAVE = consecutivo) ———
    const densidad = (obra.idDensidadColoniaObra || '').toUpperCase() || '—';
    const usoPredio = (obra.destinoActualProyeto || obra.destinoPropuestoProyecto || '').toUpperCase() || '—';
    const vigencia = obra.vigencia || '—';
    const clave = obra.consecutivo || '—';

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DENSIDAD', L, y);
    pdf.text('USO DEL PREDIO', L + 38, y);
    pdf.text('VIGENCIA', L + 95, y);
    pdf.text('CLAVE', L + 145, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.text(densidad, L, y);
    pdf.text(usoPredio, L + 38, y);
    pdf.text(vigencia, L + 95, y);
    pdf.text(clave, L + 145, y);
    y += 10;

    // ——— 3. UBICACION DE LA OBRA ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('UBICACION DE LA OBRA', L, y);
    y += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`NOMBRE DEL PROPIETARIO ${(obra.nombrePropietario || '—').toUpperCase()}`, L, y);
    y += 5;

    const direccionObra = obra.numerosOficiales?.length
      ? obra.numerosOficiales.map(n => [n.calle, n.numeroOficial].filter(Boolean).join(' , ')).filter(Boolean).join(' , ')
      : '—';
    pdf.text(`CALLE/NUMERO OFICIAL ${direccionObra}`, L, y);
    y += 5;

    pdf.text(`COLONIA ${(obra.nombreColoniaObra || '—').toUpperCase()}`, L, y);
    y += 5;

    const entreCalles = [obra.entreCalle1Obra, obra.entreCalle2Obra].filter(Boolean).join(' Y ') || '—';
    pdf.text(`ENTRE LA CALLE Y LA CALLE ${entreCalles}`, L, y);
    y += 10;

    // ——— 4. DIRECTOR RESPONSABLE (solo si hay datos de director) ———
    const tieneDirector = !!(
      obra.directorNombre ||
      obra.directorFechaActualizacion ||
      obra.directorBitacora ||
      obra.directorDomicilio ||
      obra.directorColonia ||
      obra.directorMunicipio ||
      obra.directorTelefono
    );
    if (tieneDirector) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('DIRECTOR RESPONSABLE', L, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const col1X = L;
      const col2X = L + 95;

      if (obra.directorNombre) {
        pdf.text(`NOMBRE ${obra.directorNombre.toUpperCase()}`, col1X, y);
        y += 5;
      }
      if (obra.directorFechaActualizacion) {
        pdf.text(`REGISTRO Fecha de Actualizacion ${obra.directorFechaActualizacion}`, col1X, y);
        if (obra.directorBitacora) pdf.text(`BITACORA ${obra.directorBitacora}`, col2X, y);
        y += 5;
      }
      if (obra.directorDomicilio) {
        pdf.text(`DOMICILIO ${obra.directorDomicilio.toUpperCase()}`, col1X, y);
        if (obra.directorColonia) pdf.text(`COLONIA ${obra.directorColonia.toUpperCase()}`, col2X, y);
        y += 5;
      }
      if (obra.directorMunicipio || obra.directorTelefono) {
        pdf.text(`MUNICIPIO ${(obra.directorMunicipio || '').toUpperCase()}`, col1X, y);
        if (obra.directorTelefono) pdf.text(`TELEFONO ${obra.directorTelefono}`, col2X, y);
        y += 5;
      }
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(L, y, R, y);
      y += 8;
    }

    // ——— 5. DETALLES DE LA LICENCIA (título centrado con líneas) ———
    const yDetalle = y;
    pdf.line(L, y, R, y);
    y += 4;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('DETALLES DE LA LICENCIA', W / 2, y, { align: 'center' });
    y += 5;
    pdf.line(L, y, R, y);
    y += 6;

    // Tabla de conceptos (encabezado con fondo gris simulado con rectángulo)
    // Ajustar anchos: CONCEPTO más ancho, OBSERVACIONES más ancho, números alineados a la derecha
    const colWidths = [60, 35, 20, 20, 18, 22];
    const headers = ['CONCEPTO', 'LEY DE INGRESOS', 'COSTO', 'MEDICION', 'CANT.', 'TOTAL'];
    const tableLeft = L;
    const tableRight = L + colWidths.reduce((a, b) => a + b, 0);

    pdf.setFillColor(200, 200, 200);
    pdf.rect(tableLeft, y - 4, tableRight - tableLeft, 6, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
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
    y += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    let totalGeneral = 0;

    if (obra.conceptos && obra.conceptos.length > 0) {
      obra.conceptos.forEach((c) => {
        if (y > H - 35) {
          pdf.addPage();
          y = 18;
          pdf.setFillColor(200, 200, 200);
          pdf.rect(tableLeft, y - 4, tableRight - tableLeft, 6, 'F');
          x = L;
          pdf.setFont('helvetica', 'bold');
          headers.forEach((h, i) => {
            if (i === 0 || i === 1) {
              pdf.text(h, x + 2, y);
            } else if (i >= 2) {
              pdf.text(h, x + colWidths[i] - 2, y, { align: 'right' });
            }
            x += colWidths[i];
          });
          y += 6;
          pdf.setFont('helvetica', 'normal');
        }

        const conceptoNombre = c.conceptoNombre || (c.conceptoPath?.map((n: { nombre: string }) => n.nombre).join(' , ') || '—');
        const conceptoLines = pdf.splitTextToSize(conceptoNombre, colWidths[0] - 4);
        const observaciones = c.observaciones || '—';
        const observacionesLines = pdf.splitTextToSize(observaciones, colWidths[1] - 4);
        
        // Calcular altura de fila basada en el contenido más alto
        const rowH = Math.max(
          conceptoLines.length * 3.2,
          observacionesLines.length * 3.2,
          5
        );

        x = L;
        // CONCEPTO (izquierda)
        pdf.text(conceptoLines, x + 2, y);
        x += colWidths[0];
        
        // OBSERVACIONES (izquierda)
        pdf.text(observacionesLines, x + 2, y);
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
    pdf.setFontSize(10);
    const totalStr = `$${totalGeneral.toFixed(2)}`;
    pdf.text(totalStr, R, y, { align: 'right' });
    y += 12;

    // ——— 6. Parámetros técnicos (COS, CUS, SERVIDUMBRES) ———
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const cos = obra.coeficienteOcupacion ?? '—';
    const cus = obra.coeficienteUtilizacion ?? '—';
    pdf.text(`COS: ${cos} CUS: ${cus} SERVIDUMBRES FRONTAL: ${obra.servidumbreFrontal ?? '0'}mts LATERAL: ${obra.servidumbreLateral ?? '0'} POSTERIOR: ${obra.servidumbrePosterior ?? '0'}mts`, L, y);
    y += 6;
    if (obra.notaServidumbre) {
      pdf.setFontSize(8);
      pdf.text(`NOTA: ${obra.notaServidumbre}`, L, y);
      y += 6;
    }
    y += 4;

    // ——— 7. DESCRIPCION ———
    pdf.setFont('helvetica', 'bold');
    pdf.text('DESCRIPCION', L, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const descripcion = obra.descripcionProyecto || obra.destinoActualProyeto || '—';
    const descLines = pdf.splitTextToSize(descripcion, W - L - R);
    pdf.text(descLines, L, y);
    y += descLines.length * 4 + 4;

    if (obra.direccionMedioAmbiente) {
      pdf.text(`DIRECCION DE MEDIO AMBIENTE: ${obra.direccionMedioAmbiente}.`, L, y);
      y += 6;
    }
    y += 4;

    // ——— 8. OBSERVACIONES ———
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVACIONES', L, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    if (obra.observaciones) {
      const obsLines = pdf.splitTextToSize(obra.observaciones, W - L - R);
      pdf.text(obsLines, L, y);
      y += obsLines.length * 4 + 4;
    }
    if (obra.verificador) {
      pdf.text(`VERIFICADOR: ${obra.verificador.toUpperCase()}`, L, y);
      y += 5;
    }
    const autorizacion = 'SE AUTORIZA LA PRESENTE LICENCIA EN BASE A DATOS PROPORCIONADOS POR EL INTERESADO. CUALQUIER ANOMALIA PRESENTADA EN EL TRANSCURSO DE LA OBRA SE HARA ACREEDOR A LAS SANCIONES ESTIPULADAS EN EL REGLAMENTO DE CONSTRUCCION Y EN ESPECIAL AL ART. 200 DEL MISMO.';
    const autLines = pdf.splitTextToSize(autorizacion, W - L - R);
    pdf.text(autLines, L, y);
    y += autLines.length * 3.5 + 8;

    // ——— 9. AUTORIZACION (centrado) ———
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('AUTORIZACION', W / 2, y, { align: 'center' });
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('C. JONATHAN TORRES SIFUENTES', W / 2, y, { align: 'center' });
    y += 5;
    pdf.text('DIRECTOR PADRON Y LICENCIAS', W / 2, y, { align: 'center' });
    y += 5;
    pdf.text('AAJJ / PFM / MGR / EAAO / JLR', W / 2, y, { align: 'center' });
    y += 8;

    // ——— 10. Rev, Cuant, FECHAS ———
    pdf.setFontSize(8);
    pdf.text('Rev:', L, y);
    pdf.text('Cuant: AFAI', L + 25, y);
    const fechaIngreso = obra.fechaIngreso
      ? new Date(obra.fechaIngreso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : obra.fechaCaptura
        ? new Date(obra.fechaCaptura).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
    const fechaDictamen = obra.fechaDictamen
      ? new Date(obra.fechaDictamen).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';
    pdf.text(`FECHA DE INGRESO: ${fechaIngreso}`, L, y + 6);
    pdf.text(`FECHA DE DICTAMEN: ${fechaDictamen}`, R, y + 6, { align: 'right' });

    const nombreArchivo = titulo.replace(/\s+/g, '_').replace(/Ó/g, 'O').toUpperCase();
    pdf.save(`${nombreArchivo}_${obra.consecutivo || 'SIN_CONSECUTIVO'}.pdf`);
  }
}
