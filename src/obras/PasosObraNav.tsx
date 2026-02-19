import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConceptosByObra } from "../services/obraConceptos.service";

const API_OBRAS = "http://localhost:3001/op_obras";

interface Props {
  obraId: number;
  pasoActual: 1 | 2 | 3 | 4;
}

export default function PasosObraNav({ obraId, pasoActual }: Props) {
  const navigate = useNavigate();
  const [tieneConceptos, setTieneConceptos] = useState(false);
  const [estadoVerificado, setEstadoVerificado] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [resObra, conceptos] = await Promise.all([
          fetch(`${API_OBRAS}/${obraId}`).then((r) => r.json()),
          getConceptosByObra(obraId).catch(() => []),
        ]);
        if (cancelled) return;
        setTieneConceptos(Array.isArray(conceptos) && conceptos.length > 0);
        setEstadoVerificado((resObra?.estadoVerificacion ?? "") === "Si");
      } catch {
        if (!cancelled) {
          setTieneConceptos(false);
          setEstadoVerificado(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [obraId]);

  const goToStep = (step: number) => {
    if (step === 1) {
      navigate("/obras/paso1", { state: { id: obraId } });
      return;
    }
    if (step === 3 && !tieneConceptos) return;
    if (step === 4 && !estadoVerificado) return;
    navigate(`/obras/paso${step}/${obraId}`);
  };

  const isStepAllowed = (step: number) => {
    if (step === 1 || step === 2) return true;
    if (step === 3) return tieneConceptos;
    if (step === 4) return estadoVerificado;
    return false;
  };

  return (
    <div className="flex flex-col items-center shrink-0 pt-8">
      {[1, 2, 3, 4].map((step) => {
        const isActive = step === pasoActual;
        const clickable = isStepAllowed(step);
        const isDisabled = !clickable;

        return (
          <div key={step} className="flex flex-col items-center">
            {isActive ? (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-black">
                {step}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => clickable && goToStep(step)}
                disabled={isDisabled}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm transition
                  ${isDisabled ? "bg-gray-300 cursor-not-allowed opacity-70" : "bg-gray-300 hover:bg-gray-500 cursor-pointer"}`}
              >
                {step}
              </button>
            )}
            {step < 4 && (
              <div className="w-0.5 h-8 flex-shrink-0 bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
