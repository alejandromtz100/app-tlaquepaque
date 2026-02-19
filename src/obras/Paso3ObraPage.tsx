import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Menu from "../layout/menu";
import Paso3Obra from "./paso3obra";
import PasosObraNav from "./PasosObraNav";

const API_OBRAS = "http://localhost:3001/op_obras";

export default function Paso3ObraPage() {
  const { id } = useParams();
  const [consecutivo, setConsecutivo] = useState<string>("—");

  const obraId = id ? Number(id) : null;

  useEffect(() => {
    if (!obraId) return;
    fetch(`${API_OBRAS}/${obraId}`)
      .then((res) => res.json())
      .then((data) => setConsecutivo(data.consecutivo ?? "—"))
      .catch(() => setConsecutivo("—"));
  }, [obraId]);

  if (!id) {
    return <div>Obra no encontrada</div>;
  }

  const obraIdNum = Number(id);

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

      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Obra</h2>
                <p className="text-sm text-gray-300 mt-1">{consecutivo}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex gap-6">
            <PasosObraNav obraId={obraIdNum} pasoActual={3} />
            <div className="flex-1 min-w-0">
              <Paso3Obra obraId={obraIdNum} />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
}
