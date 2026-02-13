// src/obras/Paso2ObraPage.tsx
import { useParams } from "react-router-dom";
import Menu from "../layout/menu";
import Paso2Obra from "./Paso2Obra";
import PasosObraNav from "./PasosObraNav";

export default function Paso2ObraPage() {
  const { id } = useParams();

  if (!id) {
    return <div>Obra no encontrada</div>;
  }

  const obraId = Number(id);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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

      <Menu />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex gap-6">
        <PasosObraNav obraId={obraId} pasoActual={2} />
        <div className="flex-1 min-w-0">
          <Paso2Obra obraId={obraId} />
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
}
