import type { DirectorObra } from './directores.service';
import { DirectoresService } from './directores.service';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  convertInchesToTwip,
  BorderStyle,
  TableLayoutType,
  UnderlineType,
} from 'docx';

const ARIAL = 'Arial';

/**
 * Genera un documento Word con el formato de constancia/certificado
 * de Director Responsable en Obra y Proyecto de Edificación.
 * Fuente Arial. Acomodo según el formato oficial del Ayuntamiento de Tlaquepaque.
 */
export class WordDirector {
  private static obtenerRolDirector(d: DirectorObra): string {
    const roles: string[] = [];
    if (DirectoresService.hasResponsableObra(d)) roles.push('OBRA');
    if (DirectoresService.hasResponsableProyecto(d)) roles.push('PROYECTO');
    if (DirectoresService.hasResponsablePlaneacionUrbana(d)) roles.push('PLANEACIÓN URBANA');
    if (roles.length === 0) return 'OBRA Y PROYECTO DE EDIFICACIÓN';
    if (roles.length === 1) return `${roles[0]} DE EDIFICACIÓN`;
    return roles.join(' Y ') + ' DE EDIFICACIÓN';
  }

  private static obtenerOficio(d: DirectorObra): string {
    return (
      d.oficio_autorizacion_ro ||
      d.oficio_autorizacion_rp ||
      d.oficio_autorizacion_pu ||
      'Sin número'
    );
  }

  private static formatFechaVigencia(): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `el día 30 de ${meses[8]} de 2027`;
  }

  private static formatFechaEmision(): { dia: number; mes: string; anio: number } {
    const d = new Date();
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return {
      dia: d.getDate(),
      mes: meses[d.getMonth()],
      anio: d.getFullYear(),
    };
  }

  private static async cargarImagenComoArrayBuffer(url: string): Promise<{ data: ArrayBuffer; type: 'jpg' | 'png' } | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      const data = await blob.arrayBuffer();
      const tipo = blob.type?.includes('png') ? 'png' : 'jpg';
      return { data, type: tipo };
    } catch {
      return null;
    }
  }

  static async generarConstancia(d: DirectorObra): Promise<void> {
    const rol = this.obtenerRolDirector(d);
    const oficio = this.obtenerOficio(d);
    const vigencia = this.formatFechaVigencia();
    const { dia, mes: mesEmision, anio } = this.formatFechaEmision();
    const nombreCompleto = (d.nombre_completo || '').toUpperCase();
    const clave = d.clave_director || 'Sin clave';

    // Intentar cargar la imagen del director
    let imageRun: ImageRun | null = null;
    if (d.imagen) {
      const imgUrl = DirectoresService.getImagenUrl(d.imagen);
      if (!imgUrl.startsWith('data:')) {
        const imgData = await this.cargarImagenComoArrayBuffer(imgUrl);
        if (imgData) {
          imageRun = new ImageRun({
            data: imgData.data,
            type: imgData.type,
            transformation: { width: 90, height: 120 },
            outline: { type: 'noFill' as const },
          });
        }
      }
    }

    const sz = 22;  // Tamaño base (mitad de puntos)
    const szSmall = 20;
    const tr = (opts: { text: string; bold?: boolean; size?: number; underline?: boolean }) =>
      new TextRun({
        text: opts.text,
        font: ARIAL,
        bold: opts.bold,
        size: opts.size ?? sz,
        underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
      });

    // Bloques según formato oficial - Encabezado más a la derecha, imagen abajo del encabezado
    const headerContent = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [tr({ text: 'SUBDIRECCIÓN DE CONTROL DE LA EDIFICACIÓN', bold: true, size: szSmall })],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [tr({ text: 'Y ORDENAMIENTO TERRITORIAL', bold: true, size: szSmall })],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [tr({ text: `OFICIO No. ${oficio}`, size: szSmall })],
      }),
      ...(imageRun
        ? [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [imageRun],
            }),
          ]
        : []),
    ];
    const noBorder = { style: BorderStyle.NONE as const };
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [convertInchesToTwip(4), convertInchesToTwip(2.5)],
      layout: TableLayoutType.FIXED,
      borders: {
        top: noBorder,
        bottom: noBorder,
        left: noBorder,
        right: noBorder,
        insideHorizontal: noBorder,
        insideVertical: noBorder,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: '' })], borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder } }),
            new TableCell({
              children: headerContent,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            }),
          ],
        }),
      ],
    });

    const bloques: (Paragraph | Table)[] = [
      headerTable,
      new Paragraph({ text: '' }),

      // 2. Cuerpo: intro con "Secretario" subrayado
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          tr({ text: 'Los suscritos Licenciado Ernesto Alejandro Alva Otero y Licenciada Erika Cecilia Ruvalcaba Corral, en nuestro carácter de ' }),
          tr({ text: 'Secretario', underline: true }),
          tr({ text: ' de Obras Públicas y Subdirectora de Control de la Edificación y Ordenamiento Territorial respectivamente, ambos del H. Ayuntamiento de San Pedro Tlaquepaque, hacemos constar que el ' }),
          tr({ text: nombreCompleto, bold: true }),
          tr({
            text: imageRun
              ? ' cuya fotografía inserta concuerda con los rasgos físicos del interesado; quedó registrado en los archivos de la Subdirección de Control de la Edificación y Ordenamiento Territorial de la Secretaría de Obras Públicas ante esta como '
              : '; quedó registrado en los archivos de la Subdirección de Control de la Edificación y Ordenamiento Territorial de la Secretaría de Obras Públicas ante esta como ',
          }),
          tr({ text: `DIRECTOR RESPONSABLE EN ${rol}`, bold: true }),
          tr({ text: `, con el número ${clave} dicho registro que cuenta con una vigencia hasta ${vigencia}. Lo anterior en virtud de haber cumplido con los requisitos correspondientes haber realizado el pago de derechos en la Hacienda Municipal mediante recibo oficial número ____________` }),
        ],
      }),
      new Paragraph({ text: '' }),

      // 3. Marco legal (justificado)
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          tr({
            text: 'Se expide la presente constancia con fundamento en lo dispuesto por los artículos 216 fracciones V, X del Reglamento del Gobierno y de la Administración Pública del Ayuntamiento Constitucional de San Pedro Tlaquepaque, los artículos 6 inciso k), 7, 10 y 11 del Reglamento de Construcciones en el Municipio de Tlaquepaque, Jalisco, en relación con los artículos 348, 349, 351 y 352 del Código Urbano para el Estado de Jalisco.',
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),

      // 4. Cierre formal (centrado)
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [tr({ text: 'Atentamente' })],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          tr({ text: `San Pedro Tlaquepaque, Jalisco, a ${dia} de `, size: szSmall }),
          tr({ text: mesEmision, size: szSmall, underline: true }),
          tr({ text: ` de ${anio}`, size: szSmall }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),

      // 5. Firmas: dos columnas con línea vertical separadora
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [convertInchesToTwip(3), convertInchesToTwip(0.05), convertInchesToTwip(3)],
        layout: TableLayoutType.FIXED,
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [tr({ text: '_________________________', size: szSmall })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [tr({ text: 'LIC. ERNESTO ALEJANDRO ALVA OTERO', bold: true, size: szSmall })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [tr({ text: 'Secretario de Obras Públicas', size: szSmall })],
                  }),
                ],
              }),
              new TableCell({
                borders: { left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                children: [new Paragraph({ text: '' })],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [tr({ text: '_________________________', size: szSmall })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [tr({ text: 'LIC. ERIKA CECILIA RUVALCABA CORRAL', bold: true, size: szSmall })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [tr({ text: 'Subdirectora de Control de la Edificación y Ordenamiento Territorial', size: szSmall })],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),

      // 6. Pie de página
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [tr({ text: 'Independencia No. 58 Tlaquepaque, Jalisco', size: 18 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [tr({ text: 'Tel: (33) 1057-6000  |  www.tlaquepaque.gob.mx', size: 18 })],
      }),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.5),
                right: convertInchesToTwip(0.75),
                bottom: convertInchesToTwip(0.5),
                left: convertInchesToTwip(0.75),
              },
            },
          },
          children: bloques,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Constancia_${nombreCompleto.replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
