import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../layout/menu";
import { Eye, EyeOff, Lock, User } from "lucide-react";

interface UsuarioSesion {
  id: number;
  nombre: string;
  usuario?: string;
  telefono?: number;
  rol?: string;
  estado?: string;
  funcion?: string;
}

interface UsuarioCompleto {
  id_usuarios: number;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  usuario: string;
  telefono?: number;
  rol?: string;
  estado?: string;
}

const API = "http://localhost:3001/usuarios";

const CambiarClave: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Ver clave actual (solo admin, con su clave)
  const [claveAdminVer, setClaveAdminVer] = useState("");
  const [claveRevelada, setClaveRevelada] = useState<string | null>(null);
  const [mostrarClaveRevelada, setMostrarClaveRevelada] = useState(false);
  const [loadingRevelar, setLoadingRevelar] = useState(false);
  const [errorRevelar, setErrorRevelar] = useState("");

  // Cambiar clave
  const [claveAdminCambiar, setClaveAdminCambiar] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarNuevaClave, setConfirmarNuevaClave] = useState("");
  const [mostrarNuevaClave, setMostrarNuevaClave] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loadingCambiar, setLoadingCambiar] = useState(false);
  const [errorCambiar, setErrorCambiar] = useState("");
  const [exitoCambiar, setExitoCambiar] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (!data) {
      navigate("/");
      return;
    }
    const usuarioData = JSON.parse(data);
    setUsuario(usuarioData);
    setUsuarioSeleccionado(usuarioData.id);

    if (usuarioData.rol === "ADMIN") {
      cargarUsuarios();
    }
  }, [navigate]);

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsuarios(data || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const usuarioObjetivo =
    usuarioSeleccionado
      ? usuarios.find((u) => u.id_usuarios === usuarioSeleccionado) || null
      : null;

  const idUsuarioObjetivo = usuarioSeleccionado || usuario?.id || 0;
  const esAdminCambiandoOtro = usuario?.rol === "ADMIN" && usuarioSeleccionado !== usuario.id;

  const revelarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idUsuarioObjetivo || !usuario?.id) return;
    setErrorRevelar("");
    setClaveRevelada(null);
    setLoadingRevelar(true);
    try {
      const res = await fetch(`${API}/${idUsuarioObjetivo}/revelar-clave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idAdmin: usuario.id,
          claveAdmin: claveAdminVer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Clave de administrador incorrecta");
      
      // Siempre mostrar lo que devuelve el backend: texto plano o hash (solo admin puede ver)
      if (data.clave != null && String(data.clave).trim() !== '') {
        setClaveRevelada(data.clave);
        setErrorRevelar(data.mensaje || (data.estaHasheada ? "Contraseña hasheada (valor almacenado)." : ""));
      } else {
        setClaveRevelada(null);
        setErrorRevelar(data.mensaje || "El usuario no tiene contraseña asignada");
      }
      setClaveAdminVer("");
    } catch (err: any) {
      setErrorRevelar(err.message || "Clave de administrador incorrecta");
    } finally {
      setLoadingRevelar(false);
    }
  };

  const cambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idUsuarioObjetivo) return;
    setErrorCambiar("");
    setExitoCambiar(false);
    if (nuevaClave !== confirmarNuevaClave) {
      setErrorCambiar("La nueva clave y la confirmación no coinciden");
      return;
    }
    if (!nuevaClave.trim()) {
      setErrorCambiar("La nueva clave no puede estar vacía");
      return;
    }
    setLoadingCambiar(true);
    try {
      if (esAdminCambiandoOtro) {
        const res = await fetch(`${API}/${idUsuarioObjetivo}/clave-admin`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idAdmin: usuario.id,
            claveAdmin: claveAdminCambiar,
            nuevaClave: nuevaClave.trim(),
            confirmarNuevaClave: confirmarNuevaClave.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cambiar la clave");
        setExitoCambiar(true);
        setClaveAdminCambiar("");
        setNuevaClave("");
        setConfirmarNuevaClave("");
      } else {
        const res = await fetch(`${API}/${idUsuarioObjetivo}/clave`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            claveActual: claveAdminCambiar,
            nuevaClave: nuevaClave.trim(),
            confirmarNuevaClave: confirmarNuevaClave.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cambiar la clave");
        setExitoCambiar(true);
        setClaveAdminCambiar("");
        setNuevaClave("");
        setConfirmarNuevaClave("");
      }
    } catch (err: any) {
      setErrorCambiar(err.message || "Error al cambiar la clave");
    } finally {
      setLoadingCambiar(false);
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  const nombreCompleto =
    usuarioObjetivo
      ? `${usuarioObjetivo.nombre} ${usuarioObjetivo.ap_paterno} ${usuarioObjetivo.ap_materno}`.trim()
      : usuario.nombre || "-";
  const usuarioLogin = usuarioObjetivo?.usuario || usuario.usuario || "-";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            Sistema de Control de la Edificación ALCH
          </h1>
          <p className="text-sm text-gray-500">H. Ayuntamiento de Tlaquepaque</p>
        </div>
      </header>

      <Menu />

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold">Cambiar clave de usuario</h2>
                <p className="text-sm text-gray-300 mt-0.5">
                  Seleccione un usuario y cambie su contraseña
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. Selector de usuario */}
            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              {usuario.rol === "ADMIN" ? (
                loadingUsuarios ? (
                  <p className="text-sm text-gray-500">Cargando usuarios...</p>
                ) : (
                  <select
                    value={usuarioSeleccionado ?? ""}
                    onChange={(e) => {
                      setUsuarioSeleccionado(Number(e.target.value));
                      setClaveRevelada(null);
                      setErrorRevelar("");
                      setErrorCambiar("");
                      setExitoCambiar(false);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white text-gray-900"
                  >
                    {usuarios.map((u) => (
                      <option key={u.id_usuarios} value={u.id_usuarios}>
                        {u.nombre} {u.ap_paterno} {u.ap_materno} — {u.usuario}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                  <User size={18} className="text-gray-500" />
                  <span className="text-gray-900 font-medium">{usuario.nombre}</span>
                  {usuario.usuario && (
                    <span className="text-gray-500 text-sm">({usuario.usuario})</span>
                  )}
                </div>
              )}
            </section>

            {/* 2. Datos del usuario seleccionado */}
            <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Datos del usuario seleccionado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Nombre</label>
                  <p className="text-gray-900 font-medium mt-0.5">{nombreCompleto}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Usuario (login)</label>
                  <p className="text-gray-900 font-medium mt-0.5">{usuarioLogin}</p>
                </div>
              </div>
            </section>

            {/* 3. Ver clave actual (solo administrador) */}
            {usuario.rol === "ADMIN" && (
              <section className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Ver clave actual del usuario
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Solo el administrador puede ver la clave. Ingrese su propia clave de administrador para mostrarla.
                </p>
                <form onSubmit={revelarClave} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tu clave de administrador
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarClaveRevelada ? "text" : "password"}
                        value={claveAdminVer}
                        onChange={(e) => setClaveAdminVer(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none pr-10 bg-white"
                        placeholder="Ingresa tu clave"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarClaveRevelada(!mostrarClaveRevelada)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {mostrarClaveRevelada ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {errorRevelar && (
                    <div className={`p-3 rounded-lg ${
                      errorRevelar.includes('hasheada') || errorRevelar.includes('almacenada') || errorRevelar.includes('valor almacenado')
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm ${
                        errorRevelar.includes('hasheada') || errorRevelar.includes('almacenada') || errorRevelar.includes('valor almacenado')
                          ? 'text-blue-800'
                          : 'text-red-600'
                      }`}>
                        {errorRevelar}
                      </p>
                    </div>
                  )}
                  {claveRevelada !== null && claveRevelada !== '' && (
                    <div className="bg-white border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-800 mb-1">
                        Clave actual del usuario {errorRevelar && errorRevelar.includes('hasheada') ? '(valor hasheado almacenado)' : ''}
                      </p>
                      <p className="font-mono text-gray-900 break-all text-sm">{claveRevelada}</p>
                      {errorRevelar && errorRevelar.includes('texto plano') && (
                        <p className="text-xs text-amber-600 mt-2">
                          ⚠️ Esta contraseña será hasheada automáticamente en el próximo login del usuario
                        </p>
                      )}
                      {errorRevelar && (errorRevelar.includes('hasheada') || errorRevelar.includes('valor almacenado')) && !errorRevelar.includes('texto plano') && (
                        <p className="text-xs text-blue-600 mt-2">
                          La contraseña original no se puede recuperar. Use "Cambiar clave" para asignar una nueva.
                        </p>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loadingRevelar}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                  >
                    {loadingRevelar ? "Verificando..." : "Mostrar clave actual"}
                  </button>
                </form>
              </section>
            )}

            {/* 4. Cambiar clave */}
            <section className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Cambiar clave
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {esAdminCambiandoOtro
                  ? "Ingrese su clave de administrador y la nueva clave del usuario (dos veces)."
                  : "Ingrese su clave actual y la nueva clave (dos veces)."}
              </p>
              <form onSubmit={cambiarClave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {esAdminCambiandoOtro ? "Tu clave de administrador" : "Clave actual"}
                  </label>
                  <input
                    type="password"
                    value={claveAdminCambiar}
                    onChange={(e) => setClaveAdminCambiar(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                    placeholder={esAdminCambiandoOtro ? "Clave del admin" : "Tu clave actual"}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva clave
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarNuevaClave ? "text" : "password"}
                      value={nuevaClave}
                      onChange={(e) => setNuevaClave(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none pr-10 bg-white"
                      placeholder="Nueva clave"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNuevaClave(!mostrarNuevaClave)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarNuevaClave ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escribir nuevamente la nueva clave
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarConfirmar ? "text" : "password"}
                      value={confirmarNuevaClave}
                      onChange={(e) => setConfirmarNuevaClave(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none pr-10 bg-white"
                      placeholder="Repetir nueva clave"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {errorCambiar && (
                  <p className="text-sm text-red-600">{errorCambiar}</p>
                )}
                {exitoCambiar && (
                  <p className="text-sm text-green-600 font-medium">
                    Clave actualizada correctamente.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loadingCambiar}
                  className="w-full sm:w-auto px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                >
                  {loadingCambiar ? "Guardando..." : "Cambiar clave"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default CambiarClave;
