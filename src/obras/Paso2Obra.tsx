import { useEffect, useState } from 'react';
import { getConceptosByObra } from '../services/obraConceptos.service';
import TablaConceptosObra from './TablaConceptosObra';
import FormAgregarConcepto from './FormAgregarConcepto';

interface Props {
  obraId: number;
}

export default function Paso2Obra({ obraId }: Props) {
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConcepto, setEditingConcepto] = useState<any | null>(null);

  const cargarConceptos = async () => {
    setLoading(true);
    const data = await getConceptosByObra(obraId);
    setConceptos(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarConceptos();
  }, [obraId]);

  const totalGeneral = conceptos.reduce(
    (sum, c) => sum + Number(c.total ?? c.costo_unitario * c.cantidad),
    0
  );

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
