import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getConceptosByObra } from '../services/obraConceptos.service';
import TablaConceptosObra from './TablaConceptosObra';
import FormAgregarConcepto from './FormAgregarConcepto';

const API_OBRAS = 'http://localhost:3001/op_obras';

interface Props {
  obraId: number;
}

export default function Paso2Obra({ obraId }: Props) {
  const navigate = useNavigate();
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || 'null');
  const esSupervisor = usuarioLogueado?.rol === 'SUPERVISOR';
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConcepto, setEditingConcepto] = useState<any | null>(null);

  const cargarConceptos = async () => {
    setLoading(true);
    try {
      const data = await getConceptosByObra(obraId);
      setConceptos(data);

      // Actualizar total en obra solo si no es supervisor (no modificar)
      if (!esSupervisor) {
        const total = data.reduce(
          (sum: number, c: any) =>
            sum + Number(c.total ?? c.costo_unitario * c.cantidad),
          0,
        );
        try {
          const totalValue = Number(total.toFixed(2));
          await axios.put(`${API_OBRAS}/${obraId}/total-conceptos`, {
            totalCostoConceptos: totalValue,
          });
        } catch (error: any) {
          console.error('Error al actualizar totalCostoConceptos:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConceptos();
  }, [obraId]);

  const totalGeneral = conceptos.reduce(
    (sum, c) => sum + Number(c.total ?? c.costo_unitario * c.cantidad),
    0
  );

  const handleContinuar = () => {
    if (conceptos.length === 0) {
      alert('No puede avanzar al siguiente apartado sin tener al menos un concepto ingresado.');
      return;
    }
    navigate(`/obras/paso3/${obraId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando conceptos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Conceptos */}
      <div>
        <div className="bg-gray-800 text-white text-center py-3 font-semibold text-sm">
          CONCEPTOS
        </div>
        <div className="overflow-x-auto">
          <TablaConceptosObra
            conceptos={conceptos}
            onDelete={cargarConceptos}
            onEdit={esSupervisor ? undefined : (c) => setEditingConcepto(c)}
            soloLectura={esSupervisor}
          />
        </div>
        <div className="px-6 py-4 flex justify-end border-t border-slate-200 bg-slate-50">
          <div className="text-right">
            <span className="text-sm text-slate-600 block">Total general</span>
            <span className="text-xl font-bold text-slate-800">${totalGeneral.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botón Continuar (oculto para supervisor) */}
      {!esSupervisor && (
        <div className="p-6 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleContinuar}
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Formulario Agregar Concepto (oculto para supervisor) */}
      {!esSupervisor && (
        <div className="border-t border-gray-200">
          <FormAgregarConcepto
            obraId={obraId}
            onSuccess={() => {
              cargarConceptos();
              setEditingConcepto(null);
            }}
            editingConcepto={editingConcepto}
            onCancelEdit={() => setEditingConcepto(null)}
          />
        </div>
      )}
    </div>
  );
}
