import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DirectoresService } from "../services/directores.service";
import { PDFPreForma } from "../services/pdfPreForma";
import { getConceptosByObra } from "../services/obraConceptos.service";

const API_OBRAS = "http://localhost:3001/op_obras";

interface Props {
  obraId: number;
}

const NOTAS_OPCIONES = [
  {
    value: "nota1",
    label:
      "SE AUTORIZA LA PRESENTE LICENCIA EN BASE A DATOS PROPORCIONADOS POR EL INTERESADO. CUALQUIER ANOMALIA PRESENTADA EN EL TRANSCURSO DE LA OBRA SE HARA ACREEDOR A LAS SANCIONES ESTIPULADAS EN EL REGLAMENTO DE CONSTRUCCION Y EN ESPECIAL AL ART. 200 DEL MISMO.",
  },
  {
    value: "nota2",
    label:
      "CUANDO EL USO DEL PREDIO SEA DISTINTO AL HABITACIONAL UNIFAMILIAR DEBERA TRAMITAR DICTAMEN DE TRAZO, USO Y DESTINOS PREVIOS. ESTE DOCUMENTO NO ACREDITA LA PROPIEDAD.",
  },
  {
    value: "nota3",
    label:
      "ES RESPONSABILIDAD DEL PROPIETARIO REALIZAR LA TOTALIDAD DE LA OBRA CON SUS PROPIOS RECURSOS Y SOLICITAR LA SUSPENSIÓN EN OBRAS PÚBLICAS DURANTE LA EJECUCIÓN Y GARANTIZAR LA BUENA REALIZACIÓN DE LA MISMA.",
  },
];

const VIGENCIA_OPCIONES = [
  { value: "30", label: "30" },
  { value: "90", label: "90" },
  { value: "180", label: "180" },
  { value: "365", label: "365" },
  { value: "730", label: "730" },
];

const ESTADOS_ADJUNTOS = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

function toDateTimeLocal(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 19);
}

function toDateLocal(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function Paso3Obra({ obraId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directores, setDirectores] = useState<{ id: number; clave_director?: string; nombre_completo: string; activo?: boolean }[]>([]);
  const [obraCompleta, setObraCompleta] = useState<any>(null);

  const [form, setForm] = useState({
    idDirectorObra: "" as string | number,
    bitacoraObra: "",
    nota: "",
    verificacion: "",
    fechaVerificacion: "",
    estadoVerificacion: "No",
    vigencia: "365",
    fechaAprovacion: "",
    fechaPago: "",
    informacionAdicional: "",
    reciboDePago: "",
    folioDeLaForma: "",
    fechaPagoTesoreria: "",
    otrosRecibos: "",
  });

  const [estadoObra, setEstadoObra] = useState<string>("En Proceso");

  const [archivo, setArchivo] = useState<File | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [estadoAdjunto, setEstadoAdjunto] = useState("Activo");

  const [directorInputValue, setDirectorInputValue] = useState("");
  const [mostrarDirectorDropdown, setMostrarDirectorDropdown] = useState(false);
  const directorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    DirectoresService.getAll()
      .then((data) => setDirectores(data.filter((d) => d.activo !== false)))
      .catch(() => setDirectores([]));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_OBRAS}/${obraId}`)
      .then((res) => {
        const d = res.data;
        const estadoVerificacionValue = d.estadoVerificacion ?? "No";
        const estadoObraValue = d.estadoObra ?? "En Proceso";
        
        // Guardar la obra completa
        setObraCompleta(d);
        
        setForm({
          idDirectorObra: d.idDirectorObra ?? "",
          bitacoraObra: d.bitacoraObra ?? "",
          nota: d.nota ?? "",
          verificacion: d.verificacion ?? "",
          fechaVerificacion: toDateLocal(d.fechaVerificacion),
          estadoVerificacion: estadoVerificacionValue,
          vigencia: d.vigencia ?? "365",
          fechaAprovacion: toDateTimeLocal(d.fechaAprovacion),
          fechaPago: toDateTimeLocal(d.fechaPago),
          informacionAdicional: d.informacionAdicional ?? "",
          reciboDePago: d.reciboDePago ?? "",
          folioDeLaForma: d.folioDeLaForma ?? "",
          fechaPagoTesoreria: toDateLocal(d.fechaPagoTesoreria),
          otrosRecibos: d.otrosRecibos ?? "",
        });
        setDirectorInputValue(d.directorObraLabel ?? "");
        
        // Usar siempre el estado que viene del servidor (no sobrescribir Concluido/Enviado a Firmas con Verificado)
        setEstadoObra(estadoObraValue);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error al cargar la obra");
      })
      .finally(() => setLoading(false));
  }, [obraId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si se selecciona "Si" en obra inspeccionada, cambiar estado de obra a "Verificado"
    if (name === "estadoVerificacion") {
      if (value === "Si") {
        setEstadoObra("Verificado");
      } else if (value === "No") {
        // Si se cambia a "No", mantener el estado actual o volver a "En Proceso" si estaba en "Verificado"
        setEstadoObra((prev) => prev === "Verificado" ? "En Proceso" : prev);
      }
    }
    
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarCambios = async () => {
    setError(null);
    setGuardando(true);
    try {
      // No bajar de estado: si ya está Concluido, Enviado a Firmas o Enviado a Pago, mantenerlo
      const estadoActual = obraCompleta?.estadoObra ?? estadoObra;
      const estadosQueNoBajar = ["Concluido", "Enviado a Firmas", "Enviado a Pago"];
      const noBajarEstado = estadosQueNoBajar.some(
        (e) => String(estadoActual).trim().toLowerCase() === e.toLowerCase()
      );

      let nuevoEstadoObra: string;
      if (noBajarEstado) {
        nuevoEstadoObra = estadoActual;
      } else if (form.estadoVerificacion === "Si") {
        nuevoEstadoObra = "Verificado";
      } else {
        nuevoEstadoObra = estadoObra === "Verificado" ? "En Proceso" : estadoObra;
      }

      // Solo el campo Recibo de Pago define el estado: si tiene valor → Pagado, si no → Sin Pagar
      const estadoPago = form.reciboDePago?.trim() ? "Pagado" : "Sin Pagar";
      
      const payload: Record<string, unknown> = {
        idDirectorObra: form.idDirectorObra ? Number(form.idDirectorObra) : null,
        bitacoraObra: form.bitacoraObra || null,
        nota: form.nota || null,
        verificacion: form.verificacion || null,
        estadoVerificacion: form.estadoVerificacion || "No",
        vigencia: form.vigencia || "",
        informacionAdicional: form.informacionAdicional || null,
        reciboDePago: form.reciboDePago || null,
        folioDeLaForma: form.folioDeLaForma || null,
        otrosRecibos: form.otrosRecibos || null,
        estadoObra: nuevoEstadoObra,
        estadoPago,
      };
      // Manejar fechas: enviar null si están vacías para poder borrarlas
      payload.fechaVerificacion = form.fechaVerificacion ? new Date(form.fechaVerificacion) : null;
      payload.fechaAprovacion = form.fechaAprovacion ? new Date(form.fechaAprovacion) : null;
      payload.fechaPago = form.fechaPago ? new Date(form.fechaPago) : null;
      payload.fechaPagoTesoreria = form.fechaPagoTesoreria ? new Date(form.fechaPagoTesoreria) : null;

      const res = await axios.put(`${API_OBRAS}/${obraId}`, payload);
      // Actualizar el estado local después de guardar exitosamente
      setEstadoObra(nuevoEstadoObra);
      if (res.data) setObraCompleta((prev: any) => prev ? { ...prev, ...res.data } : res.data);
      alert("Datos guardados correctamente.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleGenerarPreForma = async () => {
    try {
      if (!obraCompleta) {
        alert("Error: No se encontraron los datos de la obra.");
        return;
      }

      // Obtener conceptos de la obra
      const conceptos = await getConceptosByObra(obraId);

      // Preparar conceptos con información adicional
      const conceptosFormateados = conceptos.map((c: any) => {
        const conceptoNombre = c.conceptoPath && Array.isArray(c.conceptoPath)
          ? c.conceptoPath.map((n: { nombre: string }) => n.nombre).join(' , ')
          : c.concepto?.nombre || '—';
        
        return {
          ...c,
          conceptoNombre,
          observaciones: c.observaciones || undefined,
        };
      });

      const obraData = {
        consecutivo: obraCompleta.consecutivo || '',
        folioDeLaForma: obraCompleta.folioDeLaForma || form.folioDeLaForma,
        fechaCaptura: obraCompleta.fechaCaptura,
        fechaIngreso: obraCompleta.fechaCaptura,
        fechaDictamen: obraCompleta.fechaDictamen || obraCompleta.fechaCaptura,
        nombrePropietario: obraCompleta.nombrePropietario || '',
        tipoPropietario: obraCompleta.tipoPropietario,
        representanteLegal: obraCompleta.representanteLegal,
        identificacion: obraCompleta.identificacion,
        tipoIdentificacion: obraCompleta.tipoIdentificacion,
        domicilioPropietario: obraCompleta.domicilioPropietario,
        coloniaPropietario: obraCompleta.coloniaPropietario,
        codigoPostalPropietario: obraCompleta.codigoPostalPropietario,
        municipioPropietario: obraCompleta.municipioPropietario,
        entidadPropietario: obraCompleta.entidadPropietario,
        telefonoPropietario: obraCompleta.telefonoPropietario,
        rfcPropietario: obraCompleta.rfcPropietario,
        numerosOficiales: obraCompleta.numerosOficiales,
        nombreColoniaObra: obraCompleta.nombreColoniaObra,
        idDensidadColoniaObra: obraCompleta.idDensidadColoniaObra,
        entreCalle1Obra: obraCompleta.entreCalle1Obra,
        entreCalle2Obra: obraCompleta.entreCalle2Obra,
        descripcionProyecto: obraCompleta.descripcionProyecto,
        destinoActualProyeto: obraCompleta.destinoActualProyeto,
        destinoPropuestoProyecto: obraCompleta.destinoPropuestoProyecto,
        coeficienteOcupacion: obraCompleta.coeficienteOcupacion,
        coeficienteUtilizacion: obraCompleta.coeficienteUtilizacion,
        servidumbreFrontal: obraCompleta.servidumbreFrontal,
        servidumbreLateral: obraCompleta.servidumbreLateral,
        servidumbrePosterior: obraCompleta.servidumbrePosterior,
        vigencia: obraCompleta.vigencia || form.vigencia,
        estadoVerificacion: obraCompleta.estadoVerificacion || form.estadoVerificacion,
        directorNombre: obraCompleta.directorObraLabel,
        directorBitacora: obraCompleta.bitacoraObra || form.bitacoraObra,
        observaciones: obraCompleta.observaciones,
        conceptos: conceptosFormateados,
      };

      await PDFPreForma.generar(obraData);
    } catch (error: any) {
      console.error('Error al generar Pre Forma:', error);
      alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    setArchivo(file ?? null);
  };

  const handleAgregarAdjunto = async () => {
    setError(null);
    if (!archivo) {
      setError("Por favor seleccione un archivo.");
      return;
    }
    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("descripcion", descripcion);
      formData.append("estado", estadoAdjunto);
      formData.append("idObra", String(obraId));
      const apiUrl = `http://localhost:3001/op_obras/${obraId}/adjuntos`;
      const response = await fetch(apiUrl, { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Error al agregar el adjunto.");
      }
      setArchivo(null);
      setDescripcion("");
      setEstadoAdjunto("Activo");
      (document.getElementById("archivo-adjunto") as HTMLInputElement).value = "";
    } catch (err: any) {
      setError(err.message || "Insuficientes permisos para transferir el archivo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarAdjunto = () => {
    setArchivo(null);
    setDescripcion("");
    setEstadoAdjunto("Activo");
    (document.getElementById("archivo-adjunto") as HTMLInputElement).value = "";
  };

  const formatDirectorLabel = (d: { clave_director?: string; nombre_completo: string }) => {
    const clave = d.clave_director?.trim();
    return clave ? `${clave}: ${d.nombre_completo}` : d.nombre_completo;
  };

  const directoresFiltrados = directorInputValue.trim()
    ? directores.filter((d) =>
        formatDirectorLabel(d).toLowerCase().includes(directorInputValue.trim().toLowerCase())
      )
    : directores;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (directorDropdownRef.current && !directorDropdownRef.current.contains(e.target as Node)) {
        setMostrarDirectorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDirector = (d: { id: number; clave_director?: string; nombre_completo: string }) => {
    setForm((prev) => ({ ...prev, idDirectorObra: d.id }));
    setDirectorInputValue(formatDirectorLabel(d));
    setMostrarDirectorDropdown(false);
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== DATOS DE ADICIONALES ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 text-white px-6 py-3 font-semibold text-sm">
          Datos de Adicionales
        </div>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Director de Obra / Bitácora */}
          <section>
            <h3 className="font-medium text-gray-800 mb-3">Director de Obra</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={directorDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Director de Obra</label>
                <input
                  type="text"
                  placeholder="Escriba para buscar y seleccionar director..."
                  value={directorInputValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDirectorInputValue(v);
                    setMostrarDirectorDropdown(true);
                    if (!v.trim()) {
                      setForm((prev) => ({ ...prev, idDirectorObra: "" }));
                    }
                  }}
                  onFocus={() => setMostrarDirectorDropdown(true)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                {mostrarDirectorDropdown && (
                  <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                    {directoresFiltrados.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-gray-500">No se encontraron directores</li>
                    ) : (
                      directoresFiltrados.map((d) => (
                        <li
                          key={d.id}
                          onClick={() => handleSelectDirector(d)}
                          className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          {formatDirectorLabel(d)}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitácora</label>
                <input
                  type="text"
                  name="bitacoraObra"
                  value={form.bitacoraObra}
                  onChange={handleChange}
                  placeholder="Ej: SIN BITACORA"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Notas */}
          <section>
            <h3 className="font-medium text-gray-800 mb-2">Notas</h3>
            <div className="space-y-2">
              {NOTAS_OPCIONES.map((opt) => (
                <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nota"
                    value={opt.label}
                    checked={form.nota === opt.label}
                    onChange={() => {
                      // Si ya está seleccionada, deseleccionar; si no, seleccionar
                      setForm((p) => ({ ...p, nota: p.nota === opt.label ? "" : opt.label }));
                    }}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Verificación de la Obra */}
          <section>
            <h3 className="font-medium text-gray-800 mb-3">Verificación de la Obra</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Obra inspeccionada</label>
                  <select
                    name="estadoVerificacion"
                    value={form.estadoVerificacion}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Seleccionar Valor</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Aprobación</label>
                  <input
                    type="datetime-local"
                    name="fechaAprovacion"
                    value={form.fechaAprovacion}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la verificación</label>
                  <input
                    type="date"
                    name="fechaVerificacion"
                    value={form.fechaVerificacion}
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datos de la verificación</label>
                <textarea
                  name="verificacion"
                  value={form.verificacion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ej: AL MOMENTO DE LA INSPECCIÓN OBRA NO INICIADA INSPECTOR: NOMBRE"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Información Adicional */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Información Adicional (Esta información no se imprime)
            </label>
            <textarea
              name="informacionAdicional"
              value={form.informacionAdicional}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </section>

          {/* Vigencia y Fecha envío a Pago */}
          <section>
            <h3 className="font-medium text-gray-800 mb-3">Vigencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia (días)</label>
                <select
                  name="vigencia"
                  value={form.vigencia}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {VIGENCIA_OPCIONES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de envío a Pago</label>
                <input
                  type="datetime-local"
                  name="fechaPago"
                  value={form.fechaPago}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Recibos y pago */}
          <section>
            <h3 className="font-medium text-gray-800 mb-3">Detalles de pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recibo de Pago</label>
                <input
                  type="text"
                  name="reciboDePago"
                  value={form.reciboDePago}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folio de la Forma</label>
                <input
                  type="text"
                  name="folioDeLaForma"
                  value={form.folioDeLaForma}
                  onChange={handleChange}
                  placeholder="Ej: 2679"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del pago realizado en Tesorería</label>
                <input
                  type="date"
                  name="fechaPagoTesoreria"
                  value={form.fechaPagoTesoreria}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Otros recibos de pago</label>
              <textarea
                name="otrosRecibos"
                value={form.otrosRecibos}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleGuardarCambios}
              disabled={guardando}
              className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/obras/paso4/${obraId}`)}
              disabled={form.estadoVerificacion !== "Si"}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Botón Pre Forma */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleGenerarPreForma}
          disabled={loading || !obraCompleta}
          className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-5 h-5 text-gray-700 shrink-0" />
          <span className="text-sm font-medium text-gray-800">PRE FORMA</span>
        </button>
      </div>

      {/* ===== AGREGAR/EDITAR DATOS ADJUNTOS ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 text-white px-6 py-3 font-semibold text-sm">Agregar/Editar Datos Adjuntos de la Obra</div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm">
                Seleccionar archivo
                <input id="archivo-adjunto" type="file" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-sm text-gray-500">{archivo ? archivo.name : "Sin archivos seleccionados"}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del archivo</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del archivo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estadoAdjunto}
              onChange={(e) => setEstadoAdjunto(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {ESTADOS_ADJUNTOS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCancelarAdjunto}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAgregarAdjunto}
              disabled={guardando}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
            >
              {guardando ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
