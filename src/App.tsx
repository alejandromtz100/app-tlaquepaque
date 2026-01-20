import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./auth/login";
import Home from "./inicio/home";
import Tramites from "./catalogos/tramites";
import Menu from "./layout/menu";

 
 


import Usuarios from "./usuarios/usuarios";
import Colonias from "./catalogos/Colonias"







const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        
        <Route path="/catalogos/tramites" element={<Tramites />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/layout/menu" element={<Menu />} />

        <Route path="/catalogos/colonias" element={<Colonias />} />
        <Route path="/layout/menu" element={<Menu />} />
      </Routes>
    </Router>
  );
};

export default App;

