import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Trash2, X, Save, Search } from "lucide-react";
import Menu from "../layout/menu";

interface Obra {
  id: number;
  consecutivo: string;
  captura: string;
  propietario: string;
  estadoObra: string;
}

interface Alerta {
  idAlerta: number;
  idObra: number;
  tipoPdf: string;
  mensaje: string;
  fechaCreacion: string;
  fechaModificacion?: string;
}

const TIPOS_PDF = [
  "ALINEAMIENTO Y NUMERO OFICIAL",
  "LICENCIA DE CONSTRUCCIÓN",
  "CERTIFICADO DE HABITABILIDAD",
] as const;

const API_OBRAS = "http://localhost:3001/op_obras";
const API_ALERTAS = "http://localhost:3001/alertas";
const REGISTROS_POR_PAGINA = 10;

const Alertas: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [obraSeleccionada, setObraSeleccionada] = useState<number | null>(null);
  const [tipoPdfSeleccionado, setTipoPdfSeleccionado] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [alertaEditando, setAlertaEditando] = useState<Alerta | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtros, setFiltros] = useState({
    consecutivo: "",
    fecha: "",
    nombrePropietario: "",
    numerosPrediosContiguos: "",
  });

  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esAdmin = usuarioLogueado?.rol === "ADMIN";
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const puedeModificar = !esSupervisor;

  useEffect(() => {
    if (!esAdmin) {
      navigate("/home");
      return;
    }
    cargarAlertas();
  }, [esAdmin, navigate]);

  const cargarObras = useCallback(async (page?: number, filtrosActuales?: typeof filtros) => {
    if (!esAdmin) return;
    const p = page ?? paginaActual;
    const f = filtrosActuales ?? filtros;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(REGISTROS_POR_PAGINA));
      if (f.consecutivo.trim()) params.set("consecutivo", f.consecutivo.trim());
      if (f.fecha) params.set("fechaCaptura", f.fecha);
      if (f.nombrePropietario.trim()) params.set("nombrePropietario", f.nombrePropietario.trim());
      if (f.numerosPrediosContiguos.trim()) params.set("numerosPrediosContiguos", f.numerosPrediosContiguos.trim());
      const response = await fetch(`${API_OBRAS}/listado-filtrado-paginado?${params.toString()}`);
      if (!response.ok) throw new Error("Error al cargar obras");
      const { data, total } = await response.json();
      setObras(data || []);
      setTotalRegistros(total || 0);
    } catch (error) {
      console.error("Error al cargar obras:", error);
      setObras([]);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  }, [esAdmin, paginaActual, filtros]);

  useEffect(() => {
    if (esAdmin) cargarObras();
  }, [esAdmin, paginaActual]);

  const buscar = () => {
    setPaginaActual(1);
    cargarObras(1, filtros);
  };

  const limpiarFiltros = () => {
    const nuevosFiltros = {
      consecutivo: "",
      fecha: "",
      nombrePropietario: "",
      numerosPrediosContiguos: "",
    };
    setFiltros(nuevosFiltros);
    setPaginaActual(1);
    cargarObras(1, nuevosFiltros);
  };

  const cargarAlertas = async () => {
    try {
      const response = await fetch(API_ALERTAS);
      if (response.status === 404) {
        // Backend puede no tener la ruta /alertas si no se reinició después de agregar AlertasModule
        setAlertas([]);
        return;
      }
      if (!response.ok) throw new Error("Error al cargar alertas");
      const data = await response.json();
      setAlertas(data);
    } catch (error) {
      console.error("Error al cargar alertas:", error);
      setAlertas([]);
    }
  };

  const obtenerAlerta = (idObra: number, tipoPdf: string): Alerta | null => {
    return alertas.find(
      (a) => a.idObra === idObra && a.tipoPdf === tipoPdf
    ) || null;
  };

  const handleSeleccionarPdf = (idObra: number, tipoPdf: string) => {
    if (esSupervisor) {
      alert("Los supervisores solo pueden visualizar información");
      return;
    }
    setObraSeleccionada(idObra);
    setTipoPdfSeleccionado(tipoPdf);
    const alertaExistente = obtenerAlerta(idObra, tipoPdf);
    if (alertaExistente) {
      setAlertaEditando(alertaExistente);
      setMensajeAlerta(alertaExistente.mensaje);
    } else {
      setAlertaEditando(null);
      setMensajeAlerta("");
    }
    setMostrarFormulario(true);
  };

  const handleGuardarAlerta = async () => {
    if (!obraSeleccionada || !tipoPdfSeleccionado || !mensajeAlerta.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (esSupervisor) {
      alert("Los supervisores solo pueden visualizar información");
      return;
    }

    try {
      if (alertaEditando) {
        // Actualizar alerta existente
        const response = await fetch(`${API_ALERTAS}/${alertaEditando.idAlerta}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensaje: mensajeAlerta.trim(),
            idUsuario: usuarioLogueado?.id || null,
          }),
        });
        if (response.status === 404) {
          alert("El servicio de alertas no está disponible. Reinicia el backend (npm run start:dev) y vuelve a intentar.");
          return;
        }
        if (!response.ok) throw new Error("Error al actualizar la alerta");
      } else {
        // Crear nueva alerta
        const response = await fetch(API_ALERTAS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idObra: obraSeleccionada,
            tipoPdf: tipoPdfSeleccionado,
            mensaje: mensajeAlerta.trim(),
            idUsuario: usuarioLogueado?.id || null,
          }),
        });
        if (response.status === 404) {
          alert("El servicio de alertas no está disponible. Reinicia el backend (npm run start:dev) y vuelve a intentar.");
          return;
        }
        if (!response.ok) throw new Error("Error al crear la alerta");
      }

      await cargarAlertas();
      setMostrarFormulario(false);
      setMensajeAlerta("");
      setAlertaEditando(null);
      setObraSeleccionada(null);
      setTipoPdfSeleccionado(null);
      alert(alertaEditando ? "Alerta actualizada correctamente" : "Alerta creada correctamente");
    } catch (error: any) {
      console.error("Error al guardar alerta:", error);
      if (error.message?.includes("404") || error.name === "TypeError") {
        alert("El servicio de alertas no está disponible. Reinicia el backend (npm run start:dev) y vuelve a intentar.");
      } else {
        alert(`Error: ${error.message || "Error desconocido"}`);
      }
    }
  };

  const handleEliminarAlerta = async (idAlerta: number) => {
    if (esSupervisor) {
      alert("Los supervisores solo pueden visualizar información");
      return;
    }

    if (!confirm("¿Estás seguro de eliminar esta alerta?")) return;

    try {
      const response = await fetch(`${API_ALERTAS}/${idAlerta}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar la alerta");
      await cargarAlertas();
      alert("Alerta eliminada correctamente");
    } catch (error: any) {
      console.error("Error al eliminar alerta:", error);
      alert(`Error: ${error.message || "Error desconocido"}`);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setMensajeAlerta("");
    setAlertaEditando(null);
    setObraSeleccionada(null);
    setTipoPdfSeleccionado(null);
  };

  const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA) || 1;

  const irAPagina = (pag: number) => {
    if (pag < 1 || pag > totalPaginas) return;
    setPaginaActual(pag);
  };

  const formatearFecha = (fecha: string | Date) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Sistema de Control de la Edificación ALCH
            </h1>
            <p className="text-sm text-gray-500">
              H. Ayuntamiento de Tlaquepaque
            </p>
          </div>
        </div>
      </header>

      <Menu />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-[98%] mx-auto">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Alertas</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Gestión de alertas para PDFs de obras
                </p>
              </div>
            </div>
          </div>

          {/* FILTROS */}
          <div className="p-4 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Consecutivo</label>
                <input
                  type="text"
                  value={filtros.consecutivo}
                  onChange={(e) => setFiltros((f) => ({ ...f, consecutivo: e.target.value }))}
                  placeholder="Ej. 2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha captura</label>
                <input
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => setFiltros((f) => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre propietario</label>
                <input
                  type="text"
                  value={filtros.nombrePropietario}
                  onChange={(e) => setFiltros((f) => ({ ...f, nombrePropietario: e.target.value }))}
                  placeholder="Buscar por nombre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Números predios contiguos</label>
                <input
                  type="text"
                  value={filtros.numerosPrediosContiguos}
                  onChange={(e) => setFiltros((f) => ({ ...f, numerosPrediosContiguos: e.target.value }))}
                  placeholder="Ej. 123, 124"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={buscar}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                <Search size={16} />
                Buscar
              </button>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* FORMULARIO DE ALERTA */}
          {mostrarFormulario && (
            <div className="p-6 border-b bg-yellow-50">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {alertaEditando ? "Editar Alerta" : "Nueva Alerta"}
                  </h3>
                  <button
                    onClick={handleCancelar}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Obra
                    </label>
                    <input
                      type="text"
                      value={
                        obras.find((o) => o.id === obraSeleccionada)?.consecutivo ||
                        ""
                      }
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de PDF
                    </label>
                    <input
                      type="text"
                      value={tipoPdfSeleccionado || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje de Alerta <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={mensajeAlerta}
                      onChange={(e) => setMensajeAlerta(e.target.value)}
                      placeholder="Ingresa el motivo por el cual no se puede imprimir este PDF..."
                      rows={4}
                      disabled={esSupervisor}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleGuardarAlerta}
                      disabled={esSupervisor || !mensajeAlerta.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {alertaEditando ? "Actualizar" : "Guardar"}
                    </button>
                    <button
                      onClick={handleCancelar}
                      disabled={esSupervisor}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABLA DE OBRAS */}
          <div className="p-6">
            {loading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Cargando obras...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">
                          Consecutivo
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">
                          Propietario
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">
                          PDFs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {obras.map((obra) => (
                        <tr key={obra.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border border-gray-300 text-gray-700 font-medium">
                            {obra.consecutivo || "-"}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">
                            {formatearFecha(obra.captura)}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-gray-700">
                            {obra.propietario || "-"}
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                obra.estadoObra === "Verificado"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {obra.estadoObra}
                            </span>
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <div className="flex flex-col gap-2">
                              {TIPOS_PDF.map((tipoPdf) => {
                                const alerta = obtenerAlerta(obra.id, tipoPdf);
                                return (
                                  <div
                                    key={tipoPdf}
                                    className="flex items-center gap-2"
                                  >
                                    <button
                                      onClick={() =>
                                        handleSeleccionarPdf(obra.id, tipoPdf)
                                      }
                                      disabled={esSupervisor}
                                      className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                                        alerta
                                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      {alerta ? (
                                        <span className="flex items-center gap-2">
                                          <AlertCircle size={14} />
                                          {tipoPdf}
                                        </span>
                                      ) : (
                                        tipoPdf
                                      )}
                                    </button>
                                    {alerta && puedeModificar && (
                                      <button
                                        onClick={() =>
                                          handleEliminarAlerta(alerta.idAlerta)
                                        }
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                                        title="Eliminar alerta"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumen y paginación */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-gray-600">
                    {totalRegistros === 0
                      ? "0 resultados"
                      : `Mostrando ${(paginaActual - 1) * REGISTROS_POR_PAGINA + 1}–${Math.min(paginaActual * REGISTROS_POR_PAGINA, totalRegistros)} de ${totalRegistros} resultados`}
                  </p>
                </div>
                {totalPaginas > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => irAPagina(1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ««
                    </button>
                    <button
                      onClick={() => irAPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ‹
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Página {paginaActual} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => irAPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => irAPagina(totalPaginas)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      »»
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Alertas;
