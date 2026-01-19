import { useState } from "react";
import { Lock } from "lucide-react";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [recordar, setRecordar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ usuario, clave, recordar });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-black p-4 rounded-full mb-3">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Sistema de Control ALCH
          </h1>
          <p className="text-sm text-gray-500">
            H. Ayuntamiento de Tlaquepaque
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Clave
            </label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="********"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={recordar}
                onChange={() => setRecordar(!recordar)}
                className="rounded"
              />
              Recordarme
            </label>

            <button type="button" className="text-black hover:underline">
              ¿Olvidaste tu clave?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Entrar
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Informática · H. Ayuntamiento de Tlaquepaque
        </p>
      </div>
    </div>
  );
}
