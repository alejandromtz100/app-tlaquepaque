import { useEffect, useState } from 'react';
import { addConceptoToObra, updateConceptoObra } from '../services/obraConceptos.service';
import { Plus, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

const API_CONCEPTOS = 'http://localhost:3001/conceptos/select';

const NIVELES_LABELS = ['Abuelo', 'Padre', 'Hijo', 'Nieto'];

export default function FormAgregarConcepto({
  obraId,
  onSuccess,
  editingConcepto,
  onCancelEdit,
}: {
  obraId: number;
  onSuccess: () => void;
  editingConcepto?: any | null;
  onCancelEdit?: () => void;
}) {
  const [niveles, setNiveles] = useState<any[][]>([[]]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [costo, setCosto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [medicion, setMedicion] = useState('');

  const cargarNivel = async (parentId?: number, index = 0): Promise<any[]> => {
    try {
      const url = parentId
        ? `${API_CONCEPTOS}?parent_id=${parentId}`
        : API_CONCEPTOS;

      const res = await fetch(url);
      const data = await res.json();

      const nuevos = niveles.slice(0, index + 1);
      nuevos[index] = data;
      setNiveles(nuevos);
      return data;
    } catch (err) {
      console.error('Error al cargar nivel:', err);
      return [];
    }
  };

  useEffect(() => {
    cargarNivel();
  }, []);

  useEffect(() => {
    if (editingConcepto) {
      setCosto(String(editingConcepto.costo_unitario ?? ''));
      setCantidad(String(editingConcepto.cantidad ?? ''));
      setDescripcion(editingConcepto.observaciones ?? '');
      setMedicion(editingConcepto.medicion ?? '');
      
      // Cargar la jerarquía del concepto actual para los selects
      if (editingConcepto.conceptoPath && editingConcepto.conceptoPath.length > 0) {
        const pathIds = editingConcepto.conceptoPath.map((p: { id: number }) => p.id);
        setSeleccionados(pathIds);
        
        // Cargar cada nivel de la jerarquía
        const cargarJerarquia = async () => {
          const nuevosNiveles: any[][] = [];
          for (let i = 0; i < pathIds.length; i++) {
            const parentId = i > 0 ? pathIds[i - 1] : undefined;
            const nivel = await cargarNivel(parentId, i);
            nuevosNiveles.push(nivel);
          }
          setNiveles(nuevosNiveles);
        };
        cargarJerarquia();
      }
    } else {
      // Limpiar cuando se sale del modo edición
      resetForm();
    }
  }, [editingConcepto]);

  const seleccionar = async (id: number, index: number) => {
    // Crear nuevo array con las selecciones actualizadas
    const nuevos = seleccionados.slice(0, index); // Mantener solo hasta el índice anterior
    nuevos[index] = id; // Agregar la nueva selección
    // No necesitamos splice porque ya cortamos el array
    setSeleccionados(nuevos);
    
    // Cargar el siguiente nivel
    const siguienteNivel = await cargarNivel(id, index + 1);
    
    // Si el siguiente nivel está vacío, es un concepto hoja (último nivel)
    // Obtener el concepto completo para obtener su costo
    if (!siguienteNivel || siguienteNivel.length === 0) {
      try {
        const res = await fetch(`http://localhost:3001/conceptos/${id}`);
        const conceptoCompleto = await res.json();
        
        // Si el concepto tiene costo, ponerlo automáticamente
        if (conceptoCompleto.costo && conceptoCompleto.costo > 0) {
          setCosto(conceptoCompleto.costo.toString());
        }
      } catch (err) {
        console.error('Error al obtener costo del concepto:', err);
      }
    }
  };

  const resetForm = () => {
    setSeleccionados([]);
    setCosto('');
    setCantidad('');
    setDescripcion('');
    setMedicion('');
    setNiveles([[]]);
    setError('');
    cargarNivel();
  };

  const isEditMode = !!editingConcepto;

  const validarFormulario = () => {
    if (seleccionados.length === 0 || !seleccionados[seleccionados.length - 1]) {
      setError('Debes seleccionar un concepto');
      return false;
    }
    if (!costo || Number(costo) <= 0) {
      setError('El costo unitario debe ser mayor a 0');
      return false;
    }
    if (!cantidad || Number(cantidad) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return false;
    }
    return true;
  };

  const submit = async () => {
    setError('');
    setSuccess(false);

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && editingConcepto) {
        const ultimoIndice = seleccionados.length - 1;
        const nuevoConceptoId = seleccionados[ultimoIndice];
        const conceptoIdOriginal = editingConcepto.concepto?.id;
        
        await updateConceptoObra(editingConcepto.id, {
          conceptoId: nuevoConceptoId !== conceptoIdOriginal ? nuevoConceptoId : undefined,
          costo_unitario: Number(costo),
          cantidad: Number(cantidad),
          descripcion_costo: descripcion,
        });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 1500);
      } else {
        const ultimoIndice = seleccionados.length - 1;
        const concepto_id = seleccionados[ultimoIndice];
        if (!concepto_id) {
          setError('Debes seleccionar un concepto válido');
          setLoading(false);
          return;
        }
        await addConceptoToObra({
          obra_id: obraId,
          concepto_id,
          costo_unitario: Number(costo),
          cantidad: Number(cantidad),
          descripcion_costo: descripcion,
        });
        setSuccess(true);
        resetForm();
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || (isEditMode ? 'Error al actualizar el concepto' : 'Error al agregar el concepto'));
    } finally {
      setLoading(false);
    }
  };

  const conceptoSeleccionado = seleccionados.length > 0;
  const totalCalculado = costo && cantidad 
    ? (Number(costo) * Number(cantidad)).toFixed(2)
    : '0.00';

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center gap-2 mb-6">
        {isEditMode ? (
          <Pencil className="w-5 h-5 text-blue-600" />
        ) : (
          <Plus className="w-5 h-5 text-gray-700" />
        )}
        <h3 className="text-lg font-semibold text-gray-800">
          {isEditMode ? 'Editar concepto' : 'Agregar nuevo concepto'}
        </h3>
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isEditMode ? 'Concepto actualizado correctamente' : 'Concepto agregado correctamente'}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        {/* Selección de conceptos jerárquicos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona el concepto <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {niveles.map((nivel, i) =>
              nivel.length > 0 ? (
                <div key={i} className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {NIVELES_LABELS[i] || `Nivel ${i + 1}`}
                  </label>
                  <select
                    value={seleccionados[i] || ''}
                    onChange={(e) => seleccionar(Number(e.target.value), i)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition shadow-sm hover:border-gray-400"
                  >
                    <option value="">Selecciona...</option>
                    {nivel.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null,
            )}
          </div>
          {conceptoSeleccionado && (
            <p className="mt-2 text-xs text-gray-500 italic">
              Concepto seleccionado: {seleccionados.map((id, idx) => {
                const nivel = niveles[idx];
                const concepto = nivel?.find((c: any) => c.id === id);
                return concepto?.nombre;
              }).filter(Boolean).join(' → ')}
            </p>
          )}
        </div>

        {/* Medición (solo lectura en modo edición) */}
        {isEditMode && medicion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medición</label>
            <div className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-sm">
              {medicion}
            </div>
            <p className="mt-1 text-xs text-gray-500">La medición no se puede modificar</p>
          </div>
        )}

        {/* Campos de costo y cantidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo unitario <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total calculado
            </label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800">
              ${totalCalculado}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del costo <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <textarea
            placeholder="Agrega una descripción adicional del costo..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={loading || !conceptoSeleccionado || !costo || !cantidad}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Limpiar
              </button>
              <button
                onClick={submit}
                disabled={loading || !conceptoSeleccionado || !costo || !cantidad}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Agregar concepto
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
