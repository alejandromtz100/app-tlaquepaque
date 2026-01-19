
import React from "react";

const Login: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <form style={{ padding: 20, border: "1px solid #ccc", borderRadius: 10 }}>
        <h2>Iniciar Sesión</h2>

        <input
          type="text"
          placeholder="Usuario"
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
