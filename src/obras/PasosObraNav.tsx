import { useNavigate } from "react-router-dom";

interface Props {
  obraId: number;
  pasoActual: 1 | 2 | 3 | 4;
}

export default function PasosObraNav({ obraId, pasoActual }: Props) {
  const navigate = useNavigate();

  const goToStep = (step: number) => {
    if (step === 1) {
      navigate("/obras/paso1", { state: { id: obraId } });
      return;
    }
    navigate(`/obras/paso${step}/${obraId}`);
  };

  const exists = (step: number) => step <= 4;

  return (
    <div className="flex flex-col items-center shrink-0 pt-8">
      {[1, 2, 3, 4].map((step) => {
        const isActive = step === pasoActual;
        const clickable = exists(step);
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
