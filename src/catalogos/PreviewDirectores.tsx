import React, { useState, useEffect } from 'react';
import type { DirectorObra } from '../services/directores.service';
import { DirectoresService } from '../services/directores.service';
import { PDFDirector } from '../services/pdfdirector';

// Función auxiliar para obtener especialidades
const getEspecialidades = (director: DirectorObra, formato: number): string[] => {
  const especialidades: string[] = [];
  if (formato === 1) {
    if (director.ro_edificacion) especialidades.push('EDIFICACIÓN');
    if (director.ro_urbanizacion) especialidades.push('URBANIZACIÓN');
    if (director.ro_restauracion) especialidades.push('RESTAURACIÓN');
    if (director.ro_infraestructura) especialidades.push('INFRAESTRUCTURA');
  } else if (formato === 2) {
    if (director.rp_edificacion) especialidades.push('EDIFICACIÓN');
    if (director.rp_urbanizacion) especialidades.push('URBANIZACIÓN');
    if (director.rp_restauracion) especialidades.push('RESTAURACIÓN');
    if (director.rp_infraestructura) especialidades.push('INFRAESTRUCTURA');
  }
  return especialidades;
};

interface PreviewTexts {
  introduccion: string;
  parrafo1: string;
  parrafo2: string;
  parrafo3: string;
  parrafo4: string;
  parrafo5: string;
  nombreFirmante: string;
  cargoFirmante: string;
  copia1: string;
  copia2: string;
  descripcionEspecifica?: string; // Para formato 3 o cuando no hay especialidades
}

interface PreviewDirectoresProps {
  director: DirectorObra;
  formato: number; // 1: Responsable de Obra, 2: Responsable de Proyecto, 3: Planeación Urbana
  onClose: () => void;
  onGeneratePDF: (texts: PreviewTexts) => Promise<void>;
}

const PreviewDirectores: React.FC<PreviewDirectoresProps> = ({
  director,
  formato,
  onClose,
  onGeneratePDF,
}) => {
  // Textos por defecto
  const getDefaultTexts = (): PreviewTexts => {
    const defaultTexts: PreviewTexts = {
      introduccion: 'En atención a su solicitud y una vez entregada la documentación requerida por el Reglamento de Construcción en vigor, queda el interesado, registrado en esta dependencia con los siguientes datos:',
      parrafo1: 'Como Profesional de la Ingeniería y la Arquitectura, estamos comprometidos en buena medida a que exista un ordenamiento urbano más acorde a la realidad que vivimos para coadyuvar a mejorar el deterioro social y humano por el crecimiento de nuestra ciudad.',
      parrafo2: 'De todo Director Responsable depende la buena ejecución de la Obra desde su inicio hasta la culminación de la misma, incluyendo el aviso de suspensión, reanudación y terminación ante esta Dependencia.',
      parrafo3: 'Usted como Director Responsable acepta intrínsecamente conocer, apegarse y cumplir plenamente el Código Urbano para el estado de Jalisco, el Reglamento de Construcciones en el Municipio de San Pedro Tlaquepaque y los instrumentos de planeación de este Municipio.',
      parrafo4: 'Esta constancia estará vigente hasta el término de la presente Administración, debiendo actualizarse durante el primer año de la siguiente Administración.',
      parrafo5: 'Cabe mencionar que los derechos fueron cubiertos de acuerdo a la Ley de Ingresos Municipal.',
      nombreFirmante: 'Arq. Ricardo Robles Gómez',
      cargoFirmante: 'Coordinador General de Gestión Integral de la Ciudad',
      copia1: 'c.c. Dirección de Control de la Edificación',
      copia2: 'c.c. Archivo',
    };

    // Agregar descripción específica según el formato
    if (formato === 3) {
      defaultTexts.descripcionEspecifica = 'El Director Responsable de Planeación Urbana está autorizado para realizar labores de planeación, diseño urbano y asesoría en materia de desarrollo urbano, de acuerdo con el oficio de autorización correspondiente.';
    } else {
      // Para formato 1 y 2, solo si no hay especialidades
      const especialidades = getEspecialidades(director, formato);
      if (especialidades.length === 0) {
        if (formato === 1) {
          defaultTexts.descripcionEspecifica = 'Autorizado como Director Responsable de Obra de acuerdo con el oficio de autorización correspondiente.';
        } else if (formato === 2) {
          defaultTexts.descripcionEspecifica = 'Autorizado como Director Responsable de Proyecto de acuerdo con el oficio de autorización correspondiente.';
        }
      }
    }

    return defaultTexts;
  };

  const [texts, setTexts] = useState<PreviewTexts>(getDefaultTexts());
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (director.imagen) {
      setPreviewUrl(DirectoresService.getImagenUrl(director.imagen));
    }
  }, [director]);

  const handleTextChange = (field: keyof PreviewTexts, value: string) => {
    setTexts(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = async () => {
    try {
      await onGeneratePDF(texts);
      onClose();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const getTituloFormato = () => {
    if (formato === 1) return 'DIRECTOR RESPONSABLE DE OBRA';
    if (formato === 2) return 'DIRECTOR RESPONSABLE DE PROYECTO';
    return 'DIRECTOR RESPONSABLE DE PLANEACIÓN URBANA';
  };

  const getOficio = () => {
    if (formato === 1) return director.oficio_autorizacion_ro || 'Sin número';
    if (formato === 2) return director.oficio_autorizacion_rp || 'Sin número';
    return director.oficio_autorizacion_pu || 'Sin número';
  };

  const especialidades = getEspecialidades(director, formato);
  const tieneEspecialidades = especialidades.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Vista Previa y Edición del PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Edición */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">Editar Textos</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Introducción</label>
                <textarea
                  value={texts.introduccion}
                  onChange={(e) => handleTextChange('introduccion', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              {texts.descripcionEspecifica && (
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción Específica</label>
                  <textarea
                    value={texts.descripcionEspecifica}
                    onChange={(e) => handleTextChange('descripcionEspecifica', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Párrafo 1</label>
                <textarea
                  value={texts.parrafo1}
                  onChange={(e) => handleTextChange('parrafo1', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Párrafo 2</label>
                <textarea
                  value={texts.parrafo2}
                  onChange={(e) => handleTextChange('parrafo2', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Párrafo 3</label>
                <textarea
                  value={texts.parrafo3}
                  onChange={(e) => handleTextChange('parrafo3', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Párrafo 4</label>
                <textarea
                  value={texts.parrafo4}
                  onChange={(e) => handleTextChange('parrafo4', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Párrafo 5</label>
                <textarea
                  value={texts.parrafo5}
                  onChange={(e) => handleTextChange('parrafo5', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Firmante</label>
                <input
                  type="text"
                  value={texts.nombreFirmante}
                  onChange={(e) => handleTextChange('nombreFirmante', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cargo del Firmante</label>
                <input
                  type="text"
                  value={texts.cargoFirmante}
                  onChange={(e) => handleTextChange('cargoFirmante', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Copia 1</label>
                <input
                  type="text"
                  value={texts.copia1}
                  onChange={(e) => handleTextChange('copia1', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Copia 2</label>
                <input
                  type="text"
                  value={texts.copia2}
                  onChange={(e) => handleTextChange('copia2', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Panel de Preview */}
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h3 className="font-bold text-lg mb-4">Vista Previa</h3>
              <div className="bg-white p-6 rounded shadow-sm space-y-4 text-sm" style={{ minHeight: '600px' }}>
                {/* Header */}
                <div className="text-right">
                  <div className="font-bold text-xs">DIRECCIÓN DE CONTROL DE LA EDIFICACIÓN</div>
                  <div className="text-xs mt-1">OFICIO No. {getOficio()}</div>
                </div>

                {/* Introducción */}
                <div className="mt-6">
                  <p className="text-xs leading-relaxed">{texts.introduccion}</p>
                </div>

                {/* Datos del Registrado */}
                <div className="mt-4">
                  <div className="font-bold text-xs mb-2">DATOS REGISTRADO:</div>
                  <div className="text-xs space-y-1">
                    <div>NOMBRE: {director.nombre_completo.toUpperCase()}</div>
                    <div>NÚMERO DE REGISTRO ASIGNADO: {director.clave_director || 'Sin clave'}</div>
                    <div>CEDULA FEDERAL NO: {director.cedula_federal || 'Sin cédula'}</div>
                  </div>
                </div>

                {/* Título del Formato */}
                <div className="mt-4">
                  <div className="font-bold text-xs">{getTituloFormato()}</div>
                </div>

                {/* Especialidades o Descripción Específica */}
                {tieneEspecialidades ? (
                  <div className="mt-4">
                    <div className="font-bold text-xs mb-2">ESPECIALIDADES:</div>
                    <div className="text-xs space-y-1 ml-4">
                      {especialidades.map((esp, idx) => (
                        <div key={idx}>{esp}</div>
                      ))}
                    </div>
                  </div>
                ) : texts.descripcionEspecifica ? (
                  <div className="mt-4">
                    <p className="text-xs leading-relaxed">{texts.descripcionEspecifica}</p>
                  </div>
                ) : null}

                {/* Párrafos */}
                <div className="mt-4 space-y-3">
                  <p className="text-xs leading-relaxed">{texts.parrafo1}</p>
                  <p className="text-xs leading-relaxed">{texts.parrafo2}</p>
                  <p className="text-xs leading-relaxed">{texts.parrafo3}</p>
                  <p className="text-xs leading-relaxed">{texts.parrafo4}</p>
                  <p className="text-xs leading-relaxed">{texts.parrafo5}</p>
                </div>

                {/* Firma */}
                <div className="mt-8 text-center">
                  <div className="text-xs mb-4">A t e n t a m e n t e</div>
                  <div className="text-xs font-semibold mb-2">{texts.nombreFirmante}</div>
                  <div className="text-xs">{texts.cargoFirmante}</div>
                  <div className="text-xs mt-4">{texts.copia1}</div>
                  <div className="text-xs">{texts.copia2}</div>
                </div>

                {/* Foto */}
                {previewUrl && (
                  <div className="relative float-right mr-6 mt-4">
                    <img
                      src={previewUrl}
                      alt="Foto del director"
                      className="w-24 h-32 object-cover border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGeneratePDF}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewDirectores;
export type { PreviewTexts };
