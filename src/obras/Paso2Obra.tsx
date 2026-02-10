import { useEffect, useState } from 'react';
import { getConceptosByObra } from '../services/obraConceptos.service';
import TablaConceptosObra from './TablaConceptosObra';
import FormAgregarConcepto from './FormAgregarConcepto';
import Menu from '../layout/menu';

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
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Cargando conceptos de la obra...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 🏛️ HEADER INSTITUCIONAL */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Sistema de Control de la Edificación ALCH
            </h1>
            <p className="text-sm text-gray-500">
              H. Ayuntamiento de Tlaquepaque
            </p>
          </div>
        </div>
      </header>

      {/* 🟢 MENU IMPORTADO */}
      <Menu />

      {/* 📄 CONTENIDO */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Paso 2 · Conceptos de la obra
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
      </main>

      {/* 🧾 FOOTER */}
      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
}
