import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./auth/login";
import Home from "./inicio/home";
import Tramites from "./catalogos/tramites";
import Menu from "./layout/menu";
import Usuarios from "./usuarios/usuarios";
import Colonias from "./catalogos/Colonias";
import Asignaciones from "./usuarios/asignaciones";
import Directores from "./catalogos/directores";
import Conceptos from "./catalogos/conceptos";
import ListaConceptos from "./catalogos/ListaConceptos";
import Obras from './obras/Obras';
import Paso1Obra from './obras/paso1obra';
import Paso2ObraPage from './obras/Paso2ObraPage';
import ReporteNumeroOficialesObra from './reportes/ReporteNumeroOficialesObra';
import RepLicenciasPage from "./reportes/rep_Licencias/RepLicenciasPage";
import RepObrasPage from "./reportes/rep_obras/RepObrasPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />

        <Route path="/catalogos/tramites" element={<Tramites />} />
        <Route path="/catalogos/colonias" element={<Colonias />} />
        <Route path="/catalogos/conceptos" element={<Conceptos />} />

        <Route path="/menu" element={<Menu />} />

        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/usuarios/asignaciones" element={<Asignaciones />} />
        <Route path="/catalogos/directores" element={<Directores />} />
        <Route path="/catalogos/ListaConceptos" element={<ListaConceptos />}/>
        <Route path="/obras" element={<Obras />} />
        <Route path="/obras/paso1" element={<Paso1Obra />} />
        <Route path="/obras/paso2/:id" element={<Paso2ObraPage />} />

        <Route path="/reportes/numero-oficiales-obra" element={<ReporteNumeroOficialesObra />} />
        <Route path="/reportes/rep_Licencias/RepLicenciasPage" element={<RepLicenciasPage />} />
        <Route path="/reportes/rep_obras/RepObrasPage" element={<RepObrasPage />} />
      </Routes>
    </Router>
  );
};

export default App;
