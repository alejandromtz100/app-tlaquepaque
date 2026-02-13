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
      <div className="flex items-center justify-center py-16 text-slate-600">
        Cargando conceptos de la obra...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
         Conceptos de la obra
      </h2>

      <TablaConceptosObra conceptos={conceptos} onDelete={cargarConceptos} />

      <div className="mt-6 flex justify-end">
        <div className="bg-slate-100 rounded-lg px-4 py-2 text-right">
          <span className="text-sm text-slate-600 block">Total general</span>
          <span className="text-lg font-bold text-slate-800">
            ${totalGeneral.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <FormAgregarConcepto obraId={obraId} onSuccess={cargarConceptos} />
      </div>
    </div>
  );
}
