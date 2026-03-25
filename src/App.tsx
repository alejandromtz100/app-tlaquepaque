import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./auth/login";
import { getSession, clearSession, refreshSessionExpiration } from "./auth/session";
import Home from "./inicio/home";
import Tramites from "./catalogos/tramites";
import Menu from "./layout/menu";
import Usuarios from "./usuarios/usuarios";
import Colonias from "./catalogos/Colonias";
import Directores from "./catalogos/directores";
import Conceptos from "./catalogos/conceptos";
import Obras from './obras/Obras';
import Paso1Obra from './obras/paso1obra';
import BuscarObra from './obras/BuscarObra';
import Paso2ObraPage from './obras/Paso2ObraPage';
import Paso3ObraPage from './obras/Paso3ObraPage';
import Paso4ObraPage from './obras/Paso4ObraPage';
import ReporteNumeroOficialesObra from './reportes/ReporteNumeroOficialesObra';
import RepLicenciasPage from "./reportes/rep_Licencias/RepLicenciasPage";
import RepObrasPage from "./reportes/rep_obras/RepObrasPage";
import CambiarClave from "./cuenta/CambiarClave";
import Administradores from "./administradores/Administradores";
import Estadisticas from "./estadisticas/Estadisticas";
import Alertas from "./alertas/Alertas";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usuarioData = getSession();

  if (!usuarioData) {
    return <Navigate to="/" replace />;
  }

  return <SessionChecker>{children}</SessionChecker>;
};

/** Verifica cada minuto si la sesión expiró (45 min inactividad) y redirige a login si aplica.
 * Además, escucha actividad del usuario para renovar la expiración.
 */
/** Evita escribir en localStorage en cada mousemove/scroll (cientos de veces/s); eso congela la UI. */
const SESSION_REFRESH_MIN_INTERVAL_MS = 30_000;

const SessionChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    let lastRefreshAt = 0;

    const bumpSessionIfDue = () => {
      const now = Date.now();
      if (now - lastRefreshAt < SESSION_REFRESH_MIN_INTERVAL_MS) return;
      lastRefreshAt = now;
      refreshSessionExpiration();
    };

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
    ];

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, bumpSessionIfDue, { passive: true })
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        lastRefreshAt = 0;
        refreshSessionExpiration();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(() => {
      const current = getSession();
      if (!current) {
        clearSession();
        navigate("/", { replace: true });
      }
    }, 60 * 1000);
    return () => {
      clearInterval(interval);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, bumpSessionIfDue)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  return <>{children}</>;
};

const App: React.FC = () => {
  const isAuthenticated = !!getSession();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/catalogos/tramites"
          element={
            <PrivateRoute>
              <Tramites />
            </PrivateRoute>
          }
        />
        <Route
          path="/catalogos/colonias"
          element={
            <PrivateRoute>
              <Colonias />
            </PrivateRoute>
          }
        />
        <Route
          path="/catalogos/conceptos"
          element={
            <PrivateRoute>
              <Conceptos />
            </PrivateRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Usuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/catalogos/directores"
          element={
            <PrivateRoute>
              <Directores />
            </PrivateRoute>
          }
        />
        <Route
          path="/obras"
          element={
            <PrivateRoute>
              <Obras />
            </PrivateRoute>
          }
        />
        <Route
          path="/obras/paso1"
          element={
            <PrivateRoute>
              <Paso1Obra />
            </PrivateRoute>
          }
        />
        <Route
          path="/paso1obra"
          element={
            <PrivateRoute>
              <Paso1Obra />
            </PrivateRoute>
          }
        />
        <Route
          path="/paso1obras"
          element={
            <PrivateRoute>
              <Paso1Obra />
            </PrivateRoute>
          }
        />
        <Route
          path="/obras/paso2/:id"
          element={
            <PrivateRoute>
              <Paso2ObraPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/obras/paso3/:id"
          element={
            <PrivateRoute>
              <Paso3ObraPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/obras/paso4/:id"
          element={
            <PrivateRoute>
              <Paso4ObraPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/reportes/numero-oficiales-obra"
          element={
            <PrivateRoute>
              <ReporteNumeroOficialesObra />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/rep_Licencias/RepLicenciasPage"
          element={
            <PrivateRoute>
              <RepLicenciasPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/rep_obras/RepObrasPage"
          element={
            <PrivateRoute>
              <RepObrasPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <PrivateRoute>
              <Estadisticas />
            </PrivateRoute>
          }
        />
        <Route
          path="/administradores"
          element={
            <PrivateRoute>
              <Administradores />
            </PrivateRoute>
          }
        />
        <Route
          path="/buscar-obra"
          element={
            <PrivateRoute>
              <BuscarObra />
            </PrivateRoute>
          }
        />
        <Route
          path="/cambiar-clave"
          element={
            <PrivateRoute>
              <CambiarClave />
            </PrivateRoute>
          }
        />
        <Route
          path="/alertas"
          element={
            <PrivateRoute>
              <Alertas />
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/home" : "/"} replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
