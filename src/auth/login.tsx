import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3001/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: usuario,
          clave: clave,
        }),
      });

      if (!response.ok) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      const data = await response.json();

      // 👉 Guardar sesión
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // 👉 Redirigir
      navigate("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsuario(e.target.value)
              }
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Clave</label>
            <input
              type="password"
              value={clave}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setClave(e.target.value)
              }
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-gray-600 text-sm">
            <input
              type="checkbox"
              checked={recordar}
              onChange={() => setRecordar(!recordar)}
            />
            Recordarme
          </label>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
