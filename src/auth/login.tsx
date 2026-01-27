import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCargando(true);

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
        throw new Error("Tu usuario está inactivo. Contacta al administrador.");
      }

      const data = await response.json();

      /* ======================
         VALIDAR ESTADO
      ====================== */
      if (data.usuario.estado !== "Activo") {
        throw new Error("Tu usuario está inactivo. Contacta al administrador.");
      }

      /* ======================
         GUARDAR SESIÓN
      ====================== */
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      /* ======================
         REDIRECCIÓN
      ====================== */
      navigate("/home");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        {/* Logo y Título */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-black to-gray-800 p-4 rounded-full mb-4 shadow-lg">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Sistema de Control ALCH
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            H. Ayuntamiento de Tlaquepaque
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mt-3"></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuario */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                value={usuario}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUsuario(e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="Ingresa tu usuario"
                required
                disabled={cargando}
              />
            </div>
          </div>

          {/* Campo Clave */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarClave ? "text" : "password"}
                value={clave}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setClave(e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all pr-12"
                placeholder="Ingresa tu contraseña"
                required
                disabled={cargando}
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={cargando}
              >
                {mostrarClave ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Recordar y Mensaje de error */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={recordar}
                onChange={() => setRecordar(!recordar)}
                className="rounded border-gray-300 text-black focus:ring-black"
                disabled={cargando}
              />
              Recordarme
            </label>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Botón de entrar */}
          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              cargando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black hover:shadow-lg"
            } text-white`}
          >
            {cargando ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center mt-2">
            Versión 1.0 · © 2024 H. Ayuntamiento de Tlaquepaque
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;