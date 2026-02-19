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
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConcepto, setEditingConcepto] = useState<any | null>(null);

  const cargarConceptos = async () => {
    setLoading(true);
    try {
      const data = await getConceptosByObra(obraId);
      setConceptos(data);

      // Calcular el total y enviarlo a op_obras.totalCostoConceptos
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
        console.log('Total actualizado automáticamente:', totalValue);
      } catch (error: any) {
        console.error('Error al actualizar totalCostoConceptos:', error);
        console.error('Detalles del error:', error.response?.data);
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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
         Conceptos de la obra
      </h2>

      <div className="overflow-x-auto">
        <TablaConceptosObra
          conceptos={conceptos}
          onDelete={cargarConceptos}
          onEdit={(c) => setEditingConcepto(c)}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <div className="bg-gray-100 rounded-lg px-4 py-2 text-right">
          <span className="text-sm text-gray-600 block">Total general</span>
          <span className="text-lg font-bold text-gray-800">
            ${totalGeneral.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botón Continuar */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleContinuar}
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Continuar
        </button>
      </div>

      <div className="mt-8">
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
    </div>
  );
}
