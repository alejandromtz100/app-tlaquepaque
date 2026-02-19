import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";


import { getColonias } from "../services/colonias.service";
import usuariosService from "../services/usuarios.service";
import { getConceptosByObra } from "../services/obraConceptos.service";
import { TramitesService } from "../services/tramites.service";
import type { Tramite } from "../services/tramites.service";

import Menu from "../layout/menu";

const api = "http://localhost:3001/op_obras";

// Componente Input reutilizable
const Input = ({ 
  name, 
  value, 
  onChange, 
  label, 
  required = false, 
  type = "text",
  placeholder = "",
  disabled = false
}: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

// Componente Select reutilizable
const Select = ({ 
  name, 
  value, 
  onChange, 
  label, 
  required = false, 
  options = [],
  placeholder = "Seleccionar Valor",
  disabled = false
}: any) => {
  const allOptions = [...options];
  if (value && !allOptions.some(opt => opt.value === value)) {
    allOptions.push({ value, label: value });
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
      >
        <option value="">{placeholder}</option>
        {allOptions.map((opt: any) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
};

// Componente Checkbox reutilizable
const Checkbox = ({ name, checked, onChange, label }: any) => (
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

// Componente para números oficiales
const NumerosOficiales = ({ numeros, onAdd, onRemove }: any) => {
  const [nuevoNumero, setNuevoNumero] = useState({ calle: "", numeroOficial: "" });

  const handleAdd = () => {
    if (nuevoNumero.calle && nuevoNumero.numeroOficial) {
      onAdd({ 
        calle: nuevoNumero.calle.trim(), 
        numeroOficial: nuevoNumero.numeroOficial.trim() 
      });
      setNuevoNumero({ calle: "", numeroOficial: "" });
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-800 mb-3">Calle y Número Oficial *</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Calle"
          value={nuevoNumero.calle}
          onChange={(e) => setNuevoNumero({ ...nuevoNumero, calle: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Número"
            value={nuevoNumero.numeroOficial}
            onChange={(e) => setNuevoNumero({ ...nuevoNumero, numeroOficial: e.target.value })}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {numeros?.map((num: any, index: number) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
            <span className="text-sm text-gray-700">
              {num.calle}, No. {num.numeroOficial}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para documentos adicionales
const DocumentosAdicionales = ({ documentos, onAdd, onRemove }: any) => {
  const [selectedDocument, setSelectedDocument] = useState("Seleccionar Valor");

  const handleAddFromSelect = () => {
    if (selectedDocument && selectedDocument !== "Seleccionar Valor") {
      onAdd(selectedDocument);
      setSelectedDocument("Seleccionar Valor");
    }
  };

  const opcionesDocumentos = [
    "Seleccionar Valor",
    "Acta Constitutiva",
    "Anuencia de Condominios",
    "Alineamiento",
    "Bitacora",
    "Calculo Estructural",
    "Carta Compromiso",
    "Carta de Colonos",
    "Carta de Poder",
    "Comprobante de domicilio",
    "Dictamen",
    "Dictamen de uso de suelos",
    "Ficha Técnica",
    "Fideicomiso",
    "Oficio",
    "Orden del SIAPA",
    "Permisos Anteriores",
    "Pago de negocios jurídicos",
    "Planos",
    "Predial"
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agregar Documento
          </label>
          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {opcionesDocumentos.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddFromSelect}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 h-10 text-sm font-medium"
        >
          Agregar
        </button>
      </div>

      <div className="space-y-2">
        {documentos?.map((doc: string, index: number) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
            <span className="text-sm text-gray-700">{doc}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Paso1Obra: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Verificar permisos del usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "null");
  const esSupervisor = usuarioLogueado?.rol === "SUPERVISOR";
  const id = location.state?.id || null;

  // Estado inicial solo con campos usados en el formulario
  const [form, setForm] = useState<any>({
    consecutivo: "",
    idObraSuperior: "",            // En creación no se muestra consecutivo; aquí va ID obra superior
    tipoPropietario: "",
    nombrePropietario: "",
    representanteLegal: "",
    identificacion: "",
    tipoIdentificacion: "",
    domicilioPropietario: "",
    coloniaPropietario: "",
    municipioPropietario: "",
    entidadPropietario: "",
    telefonoPropietario: "",
    rfcPropietario: "",
    codigoPostalPropietario: "",
    documentoAcreditaPropiedad: "",
    tipoDocumentoAcreditaPropiedad: "",
    idColoniaObra: "",
    nombreColoniaObra: "",
    idDensidadColoniaObra: "",
    manzanaObra: "",
    loteObra: "",
    etapaObra: "",
    condominioObra: "",
    numerosPrediosContiguosObra: "",
    entreCalle1Obra: "",
    entreCalle2Obra: "",
    destinoActualProyecto: "",
    destinoPropuestoProyecto: "",
    aguaPotable: "Si",
    drenaje: "Si",
    electricidad: "Si",
    alumbradoPublico: "Si",
    machuelos: "Si",
    banquetas: "Si",
    pavimento: "No Definido",
    servidumbreFrontal: "",
    servidumbreLateral: "",
    servidumbrePosterior: "",
    coeficienteOcupacion: "",
    coeficienteUtilizacion: "",
    descripcionProyecto: "",
    revisor: "",
    cuantificador: "",
  });

  const [loading, setLoading] = useState(!!id);
  const [numerosOficiales, setNumerosOficiales] = useState<any[]>([]);
  const [documentosAdicionales, setDocumentosAdicionales] = useState<string[]>([]);
  const [colonias, setColonias] = useState<{ id_colonia: number; nombre: string; densidad: string | null }[]>([]);
  const [coloniaBusqueda, setColoniaBusqueda] = useState("");
  const [mostrarColoniasDropdown, setMostrarColoniasDropdown] = useState(false);
  const coloniaDropdownRef = useRef<HTMLDivElement>(null);
  const [usuarioRevisorOptions, setUsuarioRevisorOptions] = useState<{ value: string; label: string }[]>([]);
  const [cuantificadorOptions, setCuantificadorOptions] = useState<{ value: string; label: string }[]>([]);
  const [tieneConceptosFromApi, setTieneConceptosFromApi] = useState(false);
  const tieneConceptos = id ? tieneConceptosFromApi : false;
  // Modal de trámite solo al crear obra: para armar consecutivo = letra-idObra
  const [showTramiteModal, setShowTramiteModal] = useState(false);
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [obraIdPendiente, setObraIdPendiente] = useState<number | null>(null);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState<Tramite | null>(null);

  useEffect(() => {
    getColonias().then(setColonias).catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) return;
    getConceptosByObra(Number(id))
      .then((list) => setTieneConceptosFromApi(Array.isArray(list) && list.length > 0))
      .catch(() => setTieneConceptosFromApi(false));
  }, [id]);

  // Cargar usuarios por función: value = id_usuarios para guardar IDs en BD; label = nombre completo para mostrar
  useEffect(() => {
    const cargarUsuariosPorFuncion = async () => {
      try {
        const { usuarios } = await usuariosService.obtenerTodosLosDatos();
        const nombreCompleto = (u: { nombre?: string; ap_paterno?: string; ap_materno?: string }) =>
          [u.nombre, u.ap_paterno, u.ap_materno].filter(Boolean).join(" ").trim();
        const recepcion = usuarios.filter(
          (u) =>
            u.funcionEspecial?.nombre &&
            /recepcion|recepción|documento/i.test(u.funcionEspecial.nombre)
        );
        const cuantificador = usuarios.filter(
          (u) =>
            u.funcionEspecial?.nombre &&
            /cuantificador/i.test(u.funcionEspecial.nombre)
        );
        setUsuarioRevisorOptions(
          recepcion.map((u) => ({ value: String(u.id_usuarios ?? ""), label: nombreCompleto(u) }))
        );
        setCuantificadorOptions(
          cuantificador.map((u) => ({ value: String(u.id_usuarios ?? ""), label: nombreCompleto(u) }))
        );
      } catch (e) {
        console.error("Error al cargar usuarios por función:", e);
      }
    };
    cargarUsuariosPorFuncion();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (coloniaDropdownRef.current && !coloniaDropdownRef.current.contains(e.target as Node)) {
        setMostrarColoniasDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Si" : "No") : value,
    }));
  };

  const handleAddNumero = (nuevoNumero: any) => {
    setNumerosOficiales([...numerosOficiales, nuevoNumero]);
  };

  const handleRemoveNumero = (index: number) => {
    setNumerosOficiales(numerosOficiales.filter((_, i) => i !== index));
  };

  const handleAddDocumento = (documento: string) => {
    const cleanedDoc = documento.trim();
    if (!documentosAdicionales.includes(cleanedDoc) && cleanedDoc !== "Seleccionar Valor") {
      setDocumentosAdicionales([...documentosAdicionales, cleanedDoc]);
    }
  };

  const handleRemoveDocumento = (index: number) => {
    setDocumentosAdicionales(documentosAdicionales.filter((_, i) => i !== index));
  };

  /** Al crear obra: usuario confirmó trámite → consecutivo = letra-idObra, actualizar obra y continuar */
  const confirmarTramite = async () => {
    if (!tramiteSeleccionado) return;
    const idObra = obraIdPendiente;
    if (idObra == null) return;
    try {
      // Solo actualizar el consecutivo (los números oficiales ya se guardaron antes del modal)
      const consecutivo = `${tramiteSeleccionado.letra}-${idObra}`;
      await axios.put(`${api}/${idObra}`, { consecutivo });
      
      setShowTramiteModal(false);
      setObraIdPendiente(null);
      setTramiteSeleccionado(null);
      alert("¡Obra guardada correctamente!");
      navigate(`/obras/paso2/${idObra}`);
    } catch (error: any) {
      console.error("Error al asignar consecutivo:", error);
      alert(`Error: ${error.response?.data?.message || error.message || "Error al asignar consecutivo"}`);
    }
  };

  const cerrarModalTramite = () => {
    setShowTramiteModal(false);
    setObraIdPendiente(null);
    setTramiteSeleccionado(null);
  };

  const handleSelectColonia = (colonia: { id_colonia: number; nombre: string; densidad: string | null }) => {
    setForm((prev: any) => ({
      ...prev,
      idColoniaObra: colonia.id_colonia,
      nombreColoniaObra: colonia.nombre,
      idDensidadColoniaObra: colonia.densidad || "",
    }));
    setColoniaBusqueda(colonia.nombre);
    setMostrarColoniasDropdown(false);
  };

  const coloniasFiltradas = colonias.filter(c =>
    c.nombre.toLowerCase().includes(coloniaBusqueda.toLowerCase())
  );

  // Cargar datos si es edición
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });
    axios.get(`${api}/${id}`)
        .then((res) => {
          const data = res.data;
          setForm((prev: any) => ({
            ...prev,
            ...data,
            idObraSuperior: (data.idObraSuperior ?? data.idobrasuperior ?? '').toString().trim(),
            destinoActualProyecto: (data.destinoActualProyecto ?? data.destinoActualProyeto ?? '').toString().trim(),
            destinoPropuestoProyecto: (data.destinoPropuestoProyecto ?? '').toString().trim(),
            aguaPotable: data.aguaPotable ?? prev.aguaPotable,
            drenaje: data.drenaje ?? prev.drenaje,
            electricidad: data.electricidad ?? prev.electricidad,
            alumbradoPublico: data.alumbradoPublico ?? prev.alumbradoPublico,
            machuelos: data.machuelos ?? prev.machuelos,
            banquetas: data.banquetas ?? prev.banquetas,
            pavimento: data.pavimento ?? prev.pavimento,
            revisor: data.revisor != null ? String(data.revisor) : prev.revisor,
            cuantificador: data.cuantificador != null ? String(data.cuantificador) : prev.cuantificador,
          }));
          if (data.numerosOficiales && Array.isArray(data.numerosOficiales)) {
            setNumerosOficiales(
              data.numerosOficiales.map((n: any) => ({
                calle: (n.calle ?? '').toString().trim(),
                numeroOficial: (n.numeroOficial ?? n.numerooficial ?? '').toString().trim(),
              }))
            );
          }
          if (data.nombreColoniaObra) {
            setColoniaBusqueda(data.nombreColoniaObra);
          }
          if (data.documentosRequeridos) {
            try {
              const docs = typeof data.documentosRequeridos === 'string'
                ? data.documentosRequeridos.split(',').map((d: string) => d.trim()).filter(Boolean)
                : data.documentosRequeridos;
              setDocumentosAdicionales(Array.isArray(docs) ? docs : []);
            } catch (error) {
              console.error("Error parsing documentosRequeridos:", error);
            }
          }
        })
        .catch(error => {
          console.error("Error cargando datos:", error);
          alert("Error al cargar los datos de la obra");
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // Inicializar formulario desde datos de copia (sin crear obra en backend hasta Guardar cambios)
  useEffect(() => {
    const esCopia = location.state?.esCopia && location.state?.datosObraCopia;
    if (id || !esCopia) return;
    const data = location.state.datosObraCopia as Record<string, unknown>;
    // Programar actualización fuera del flujo síncrono del effect para evitar cascadas de render
    queueMicrotask(() => {
      setForm((prev: Record<string, unknown>) => ({
        ...prev,
        ...data,
        idObraSuperior: (data.idObraSuperior ?? '').toString().trim(),
        destinoActualProyecto: prev.destinoActualProyecto,
        destinoPropuestoProyecto: prev.destinoPropuestoProyecto,
        descripcionProyecto: prev.descripcionProyecto,
        revisor: prev.revisor,
        cuantificador: prev.cuantificador,
        aguaPotable: data.aguaPotable ?? prev.aguaPotable,
        drenaje: data.drenaje ?? prev.drenaje,
        electricidad: data.electricidad ?? prev.electricidad,
        alumbradoPublico: data.alumbradoPublico ?? prev.alumbradoPublico,
        machuelos: data.machuelos ?? prev.machuelos,
        banquetas: data.banquetas ?? prev.banquetas,
        pavimento: data.pavimento ?? prev.pavimento,
      }));
      if (data.nombreColoniaObra) {
        setColoniaBusqueda(String(data.nombreColoniaObra));
      }
      if (data.documentosRequeridos) {
        try {
          const raw = data.documentosRequeridos;
          const docs = typeof raw === 'string'
            ? raw.split(',').map((d: string) => d.trim()).filter(Boolean)
            : Array.isArray(raw) ? raw : [];
          setDocumentosAdicionales(docs.map(String));
        } catch {
          setDocumentosAdicionales([]);
        }
      }
    });
    // numerosOficiales no se copian; el usuario debe agregar al menos uno
  }, [id, location.state?.esCopia, location.state?.datosObraCopia]);

  const handleSave = async () => {
    try {
      // Verificar permisos: SUPERVISOR no puede crear/modificar obras
      if (esSupervisor) {
        alert("Los supervisores solo pueden visualizar información, no pueden crear o modificar obras");
        return;
      }

      // Validar campos obligatorios (usar trim para ignorar solo espacios)
      const destinoActual = (form.destinoActualProyecto ?? form.destinoActualProyeto ?? "").toString().trim();
      const destinoPropuesto = (form.destinoPropuestoProyecto ?? "").toString().trim();
      if (!(form.nombrePropietario ?? "").toString().trim()) {
        alert("Por favor complete el campo obligatorio: Nombre del propietario");
        return;
      }
      if (!form.tipoPropietario) {
        alert("Por favor seleccione el Tipo de propietario");
        return;
      }
      if (!(form.nombreColoniaObra ?? "").toString().trim() || !form.idColoniaObra) {
        alert("Por favor seleccione la Colonia de la obra");
        return;
      }
      if (!destinoActual) {
        alert("Por favor complete el campo obligatorio: Destino actual del proyecto");
        return;
      }
      if (!destinoPropuesto) {
        alert("Por favor complete el campo obligatorio: Destino propuesto del proyecto");
        return;
      }
      if (numerosOficiales.length === 0) {
        alert("Por favor agregue al menos un Calle y Número oficial");
        return;
      }

      // Agregar ID del usuario logueado para el historial y como capturador
      const usuarioData = localStorage.getItem("usuario");
      let idUsuarioLogueado: number | undefined;
      if (usuarioData) {
        try {
          const usuarioLogueado = JSON.parse(usuarioData);
          if (usuarioLogueado.id) {
            idUsuarioLogueado = usuarioLogueado.id;
          }
        } catch (error) {
          console.error('Error al parsear usuario de localStorage:', error);
        }
      }

      // Construir obraData asegurando que destinoActualProyecto y destinoPropuestoProyecto se envíen explícitamente
      const obraData: any = {
        ...form,
        documentosRequeridos: documentosAdicionales.join(', '),
        fechaCaptura: id ? form.fechaCaptura : new Date(),
        ultimaModificacion: new Date(),
      };
      // Asignar explícitamente después del spread para asegurar que se sobrescriba cualquier valor del form
      obraData.destinoActualProyecto = destinoActual;
      obraData.destinoPropuestoProyecto = destinoPropuesto;
      // Asegurar que idObraSuperior se envíe con el nombre correcto para el backend
      if (form.idObraSuperior !== undefined && form.idObraSuperior !== null && form.idObraSuperior !== '') {
        obraData.idObraSuperior = form.idObraSuperior;
      }
      delete obraData.numerosOficiales;

      // Si es creación nueva: no enviar consecutivo (se asigna después con el trámite)
      if (!id) {
        obraData.consecutivo = "";
      }

      // Si es creación nueva y no tiene idUsuarioCapturador, usar el usuario logueado
      if (!id && idUsuarioLogueado && !obraData.idUsuarioCapturador) {
        obraData.idUsuarioCapturador = idUsuarioLogueado;
      }
      
      // Agregar idUsuarioLogueado para el historial en actualizaciones
      if (id && idUsuarioLogueado) {
        obraData.idUsuarioLogueado = idUsuarioLogueado;
      }

      // Debug: verificar que destinoActualProyecto se esté enviando
      console.log('Enviando obraData:', { 
        destinoActualProyecto: obraData.destinoActualProyecto,
        destinoPropuestoProyecto: obraData.destinoPropuestoProyecto 
      });

      let obraId = id;
      const esCopia = location.state?.esCopia || false;
      
      if (id) {
        await axios.put(`${api}/${id}`, obraData);
        
        // Si es una copia (sin consecutivo), mostrar modal de trámite
        // Verificar si el consecutivo está vacío en el form (después de cargar)
        const tieneConsecutivo = form.consecutivo && form.consecutivo.trim() !== '';
        if (esCopia && !tieneConsecutivo) {
          // Guardar números oficiales primero
          try {
            const usuarioData = localStorage.getItem("usuario");
            const payload: any = {
              numeros: numerosOficiales.map((n: any) => ({
                calle: (n.calle ?? '').toString().trim(),
                numeroOficial: (n.numeroOficial ?? n.numerooficial ?? '').toString().trim(),
              })),
            };
            if (usuarioData) {
              try {
                const usuarioLogueado = JSON.parse(usuarioData);
                if (usuarioLogueado?.id) payload.idUsuarioLogueado = usuarioLogueado.id;
              } catch (error) {
                console.error('Error al parsear usuario de localStorage:', error);
              }
            }
            await axios.post(`${api}/${obraId}/numeros-manual`, payload);
          } catch (error) {
            console.warn("No se pudieron guardar los números oficiales:", error);
          }
          
          // Guardar referencia para el modal de trámite
          setObraIdPendiente(obraId);
          setTramiteSeleccionado(null); // Resetear selección al abrir modal
          const list = await TramitesService.getAll().catch(() => []);
          setTramites(Array.isArray(list) ? list : []);
          setShowTramiteModal(true);
          return;
        }
      } else {
        const response = await axios.post(api, obraData);
        obraId = response.data.idObra || response.data.id;
        
        // Al crear: guardar números oficiales INMEDIATAMENTE después de crear la obra
        try {
          const usuarioData = localStorage.getItem("usuario");
          const numerosPayload: any = {
            numeros: numerosOficiales.map((n: any) => ({
              calle: (n.calle ?? '').toString().trim(),
              numeroOficial: (n.numeroOficial ?? n.numerooficial ?? '').toString().trim(),
            })),
          };
          if (usuarioData) {
            try {
              const usuarioLogueado = JSON.parse(usuarioData);
              if (usuarioLogueado?.id) numerosPayload.idUsuarioLogueado = usuarioLogueado.id;
            } catch (_) {}
          }
          await axios.post(`${api}/${obraId}/numeros-manual`, numerosPayload);
        } catch (error) {
          console.warn("No se pudieron guardar los números oficiales:", error);
        }
        
        // Guardar referencia para el modal de trámite
        setObraIdPendiente(obraId);
        setTramiteSeleccionado(null); // Resetear selección al abrir modal
        const list = await TramitesService.getAll().catch(() => []);
        setTramites(Array.isArray(list) ? list : []);
        setShowTramiteModal(true);
        return;
      }

      // Edición normal: sincronizar números oficiales y salir
      try {
        const usuarioData = localStorage.getItem("usuario");
        const payload: any = {
          numeros: numerosOficiales.map((n: any) => ({
            calle: (n.calle ?? '').toString().trim(),
            numeroOficial: (n.numeroOficial ?? n.numerooficial ?? '').toString().trim(),
          })),
        };
        if (usuarioData) {
          try {
            const usuarioLogueado = JSON.parse(usuarioData);
            if (usuarioLogueado?.id) payload.idUsuarioLogueado = usuarioLogueado.id;
          } catch (error) {
            console.error('Error al parsear usuario de localStorage:', error);
          }
        }
        await axios.post(`${api}/${obraId}/numeros-manual`, payload);
      } catch (error) {
        console.warn("No se pudieron guardar los números oficiales:", error);
      }

      alert("¡Obra guardada correctamente!");
      navigate(`/obras/paso2/${obraId}`);
    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert(`Error: ${error.response?.data?.message || error.message || "Error desconocido"}`);
    }
  };

  // Opciones para selects
  const tipoPropietarioOptions = [
    { value: "Fisica", label: "Persona Física" },
    { value: "Moral", label: "Persona Moral" },
  ];

  const tipoIdentificacionOptions = [
    { value: "IFE", label: "IFE" },
    { value: "INE", label: "INE" },
    { value: "PASAPORTE", label: "Pasaporte" },
    { value: "LICENCIA", label: "Licencia de conducir" },
    { value: "CEDULA", label: "Cédula profesional" },
    { value: "OTRO", label: "Otro" },
  ];

  const tipoDocumentoOptions = [
    { value: "ESCRITURA", label: "Escritura" },
    { value: "RESOLUCION", label: "Resolución" },
    { value: "CONTRATO", label: "Contrato" },
    { value: "CERTIFICADO", label: "Certificado" },
    { value: "TITULO_PROPIEDAD", label: "Título de Propiedad" },
  ];

  const pavimentoOptions = [
    { value: "No Definido", label: "No Definido" },
    { value: "Adoquin", label: "Adoquin" },
    { value: "Asfalto", label: "Asfalto" },
    { value: "Concreto Hidraulico", label: "Concreto Hidraulico" },
    { value: "Empedrado", label: "Empedrado" },
    { value: "Terracera", label: "Terracera" },
  ];

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
          {/* HEADER DEL REPORTE - igual que Obras.tsx */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-5">
            <div className="flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold">Obra</h2>
              <p className="text-sm text-gray-300 mt-1">
                Consecutivo: {id ? (form.consecutivo || '—') : 'Nueva obra'}
              </p>
            </div>
          </div>

      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Cargando datos...</p>
          </div>
        </div>
      ) : (
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex gap-6">
        {/* Stepper lateral */}
        <div className="flex flex-col items-center shrink-0 pt-8">
          {[1, 2, 3, 4].map((step) => {
            const isEditando = !!id;
            const paso2Permitido = isEditando && step === 2;
            const paso3Permitido = isEditando && step === 3 && tieneConceptos;
            const paso4Permitido = isEditando && step === 4 && (form.estadoVerificacion === "Si");
            const stepClickable =
              step === 1 ? false : (paso2Permitido || paso3Permitido || paso4Permitido);
            const isDisabled = !stepClickable;

            return (
              <div key={step} className="flex flex-col items-center">
                {step === 1 ? (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-black"
                  >
                    {step}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (step > 1 && id && stepClickable) navigate(`/obras/paso${step}/${id}`);
                    }}
                    disabled={!stepClickable}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm transition
                      ${isDisabled ? "bg-gray-300 cursor-not-allowed opacity-70" : "bg-gray-300 hover:bg-gray-500 cursor-pointer"}`}
                  >
                    {step}
                  </button>
                )}
                {step < 4 && (
                  <div className="w-0.5 h-8 flex-shrink-0 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-w-0 bg-white overflow-hidden">
          <p className="text-sm text-gray-500 px-6 pt-4 pb-2">
            Los campos requeridos están señalados con un asterisco *
          </p>

        <div className="px-6 pb-6 space-y-6">
          <div className={esSupervisor ? "pointer-events-none select-none opacity-95 space-y-6" : "space-y-6"}>
          {/* ===== 1. DATOS DEL PROPIETARIO ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-3 font-semibold text-sm">
              1. DATOS DEL PROPIETARIO
            </div>
            <div className="p-6 space-y-6">
              <Input
                label="Consecutivo anterior"
                name="idObraSuperior"
                value={form.idObraSuperior}
                onChange={handleChange}
                placeholder=""
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre *"
                  name="nombrePropietario"
                  value={form.nombrePropietario}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Tipo de Propietario *"
                  name="tipoPropietario"
                  value={form.tipoPropietario}
                  onChange={handleChange}
                  required
                  options={tipoPropietarioOptions}
                  placeholder="Seleccionar Valor"
                />
                <Input
                  label="Representante Legal"
                  name="representanteLegal"
                  value={form.representanteLegal}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Identificación"
                  name="identificacion"
                  value={form.identificacion}
                  onChange={handleChange}
                  placeholder="Número de identificación"
                />
                <Select
                  label="Tipo de Identificación"
                  name="tipoIdentificacion"
                  value={form.tipoIdentificacion}
                  onChange={handleChange}
                  options={tipoIdentificacionOptions}
                  placeholder="Seleccionar Valor"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Domicilio"
                  name="domicilioPropietario"
                  value={form.domicilioPropietario}
                  onChange={handleChange}
                  placeholder="Calle y número"
                />
                <Input
                  label="Colonia"
                  name="coloniaPropietario"
                  value={form.coloniaPropietario}
                  onChange={handleChange}
                />
                <Input
                  label="Código Postal"
                  name="codigoPostalPropietario"
                  value={form.codigoPostalPropietario}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Municipio"
                  name="municipioPropietario"
                  value={form.municipioPropietario}
                  onChange={handleChange}
                />
                <Input
                  label="Entidad Federativa"
                  name="entidadPropietario"
                  value={form.entidadPropietario}
                  onChange={handleChange}
                />
                <Input
                  label="Teléfono"
                  name="telefonoPropietario"
                  value={form.telefonoPropietario}
                  onChange={handleChange}
                  type="tel"
                />
              </div>

              <div>
                <Input
                  label="RFC"
                  name="rfcPropietario"
                  value={form.rfcPropietario}
                  onChange={handleChange}
                  disabled={esSupervisor}
                />
              </div>

              <section>
                <h3 className="font-medium text-gray-800 mb-3">DOCUMENTOS</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documento que Acredita la Propiedad
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="documentoAcreditaPropiedad"
                      value={form.documentoAcreditaPropiedad || ""}
                      onChange={handleChange}
                      placeholder="Ej: RESOLUCIÓN NO.12098TL"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Select
                      label="Tipo de Documento"
                      name="tipoDocumentoAcreditaPropiedad"
                      value={form.tipoDocumentoAcreditaPropiedad}
                      onChange={handleChange}
                      options={tipoDocumentoOptions}
                      placeholder="Seleccionar Valor"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Documentos Adicionales Requeridos</h4>
                  <DocumentosAdicionales
                    documentos={documentosAdicionales}
                    onAdd={handleAddDocumento}
                    onRemove={handleRemoveDocumento}
                  />
                </div>
              </section>
            </div>
          </div>

          {/* ===== 2. DATOS DE LA OBRA ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-3 font-semibold text-sm">
              2. DATOS DE LA OBRA
            </div>
            <div className="p-6 space-y-6">
              <NumerosOficiales
                numeros={numerosOficiales}
                onAdd={handleAddNumero}
                onRemove={handleRemoveNumero}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={coloniaDropdownRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colonia * <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar colonia..."
                    value={mostrarColoniasDropdown ? coloniaBusqueda : (form.nombreColoniaObra || coloniaBusqueda)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setColoniaBusqueda(v);
                      setMostrarColoniasDropdown(true);
                      if (!v.trim()) {
                        setForm((prev: any) => ({
                          ...prev,
                          idColoniaObra: "",
                          nombreColoniaObra: "",
                          idDensidadColoniaObra: "",
                        }));
                      }
                    }}
                    onFocus={() => setMostrarColoniasDropdown(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {mostrarColoniasDropdown && (
                    <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                      {coloniasFiltradas.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-gray-500">No se encontraron colonias</li>
                      ) : (
                        coloniasFiltradas.map((c) => (
                          <li
                            key={c.id_colonia}
                            onClick={() => handleSelectColonia(c)}
                            className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium">{c.nombre}</span>
                            {c.densidad && (
                              <span className="text-gray-600 ml-2">— {c.densidad}</span>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Densidad *
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={form.idDensidadColoniaObra || ""}
                    placeholder="Se muestra al seleccionar colonia"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se asigna automáticamente según la colonia seleccionada
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Manzana"
                  name="manzanaObra"
                  value={form.manzanaObra}
                  onChange={handleChange}
                  placeholder="Ej: 25"
                />
                <Input
                  label="Lote"
                  name="loteObra"
                  value={form.loteObra}
                  onChange={handleChange}
                  placeholder="Ej: 12"
                />
                <Input
                  label="Etapa"
                  name="etapaObra"
                  value={form.etapaObra}
                  onChange={handleChange}
                  placeholder="Ej: 1"
                />
                <Input
                  label="Condominio"
                  name="condominioObra"
                  value={form.condominioObra}
                  onChange={handleChange}
                  placeholder="Ej: A"
                />
              </div>

              <Input
                label="Números Predios Contiguos"
                name="numerosPrediosContiguosObra"
                value={form.numerosPrediosContiguosObra}
                onChange={handleChange}
                placeholder="Ej: 123, 124, 125"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Entre Calle"
                  name="entreCalle1Obra"
                  value={form.entreCalle1Obra}
                  onChange={handleChange}
                  placeholder="Primera calle de referencia"
                />
                <Input
                  label="Y Calle"
                  name="entreCalle2Obra"
                  value={form.entreCalle2Obra}
                  onChange={handleChange}
                  placeholder="Segunda calle de referencia"
                />
              </div>
            </div>
          </div>

          {/* ===== 3. DATOS DEL PROYECTO ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-3 font-semibold text-sm">
              3. DATOS DEL PROYECTO
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Destino Actual del Proyecto *"
                  name="destinoActualProyecto"
                  value={form.destinoActualProyecto ?? ""}
                  onChange={(e: any) => {
                    const v = e.target.value;
                    setForm((prev: any) => ({ ...prev, destinoActualProyecto: v }));
                  }}
                  required
                  placeholder="Ej: LOTE"
                />
                <Input
                  label="Destino Propuesto Proyecto *"
                  name="destinoPropuestoProyecto"
                  value={form.destinoPropuestoProyecto ?? ""}
                  onChange={(e: any) => {
                    const v = e.target.value;
                    setForm((prev: any) => ({ ...prev, destinoPropuestoProyecto: v }));
                  }}
                  required
                  placeholder="Ej: CONSTRUCCIÓN COMERCIAL"
                />
              </div>

              <section>
                <h3 className="font-medium text-gray-800 mb-3">Servicios</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Checkbox
                    name="aguaPotable"
                    checked={form.aguaPotable === "Si"}
                    onChange={handleChange}
                    label="Agua Potable"
                  />
                  <Checkbox
                    name="drenaje"
                    checked={form.drenaje === "Si"}
                    onChange={handleChange}
                    label="Drenaje"
                  />
                  <Checkbox
                    name="electricidad"
                    checked={form.electricidad === "Si"}
                    onChange={handleChange}
                    label="Electricidad"
                  />
                  <Checkbox
                    name="alumbradoPublico"
                    checked={form.alumbradoPublico === "Si"}
                    onChange={handleChange}
                    label="Alumbrado Público"
                  />
                  <Checkbox
                    name="machuelos"
                    checked={form.machuelos === "Si"}
                    onChange={handleChange}
                    label="Machuelos"
                  />
                  <Checkbox
                    name="banquetas"
                    checked={form.banquetas === "Si"}
                    onChange={handleChange}
                    label="Banquetas"
                  />
                </div>
                <div className="mt-4">
                  <Select
                    label="Pavimento"
                    name="pavimento"
                    value={form.pavimento}
                    onChange={handleChange}
                    options={pavimentoOptions}
                    placeholder="Seleccionar Valor"
                  />
                </div>
              </section>

              <section>
                <h3 className="font-medium text-gray-800 mb-3">RESTRICCIONES</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    label="Servidumbre Frontal (m)"
                    name="servidumbreFrontal"
                    value={form.servidumbreFrontal}
                    onChange={handleChange}
                    placeholder="2.0"
                  />
                  <Input
                    label="Servidumbre Lateral (m)"
                    name="servidumbreLateral"
                    value={form.servidumbreLateral}
                    onChange={handleChange}
                    placeholder="0.0"
                  />
                  <Input
                    label="Servidumbre Posterior (m)"
                    name="servidumbrePosterior"
                    value={form.servidumbrePosterior}
                    onChange={handleChange}
                    placeholder="3.0"
                  />
                  <div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Coeficiente Ocupación (COS)"
                    name="coeficienteOcupacion"
                    value={form.coeficienteOcupacion}
                    onChange={handleChange}
                    placeholder="0.8"
                  />
                  <Input
                    label="Coeficiente Utilización (CUS)"
                    name="coeficienteUtilizacion"
                    value={form.coeficienteUtilizacion}
                    onChange={handleChange}
                    placeholder="1.6"
                  />
                </div>
              </section>

              <section>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción Proyecto
                </label>
                <textarea
                  name="descripcionProyecto"
                  value={form.descripcionProyecto || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  placeholder="Describa el proyecto..."
                />
              </section>

              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Usuario que recibió documentación"
                    name="revisor"
                    value={form.revisor}
                    onChange={handleChange}
                    options={usuarioRevisorOptions}
                    placeholder="Seleccionar Valor"
                  />
                  <Select
                    label="Cuantificador"
                    name="cuantificador"
                    value={form.cuantificador}
                    onChange={handleChange}
                    options={cuantificadorOptions}
                    placeholder="Seleccionar Valor"
                  />
                </div>
              </section>
            </div>
          </div>
          </div>

          {/* ===== BOTONES ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row justify-end gap-3">
              <button
                onClick={() => navigate("/obras")}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                {esSupervisor ? "Volver" : "Cancelar"}
              </button>
              {!esSupervisor && (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl font-medium bg-black text-white hover:bg-gray-800"
                >
                  Guardar Cambios
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
      )}
      </div>
      </main>


      {/* Modal: elegir trámite para asignar consecutivo (solo al crear obra) */}
      {showTramiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">Seleccione el tramite a realizar</h3>
            </div>

            {/* Header de la tabla */}
            <div className="bg-gray-100 border-b border-gray-200 px-6 py-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Nombre Tramite</span>
                <span className="text-sm font-medium text-gray-600">
                  Total de tramites ({tramites.length})
                </span>
              </div>
            </div>

            {/* Lista de trámites */}
            <div className="max-h-96 overflow-y-auto">
              {tramites.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-500">No hay trámites disponibles.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {tramites.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTramiteSeleccionado(t)}
                      className={`w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors ${
                        tramiteSeleccionado?.id === t.id
                          ? "bg-blue-100 border-l-4 border-blue-600"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${
                          tramiteSeleccionado?.id === t.id
                            ? "font-semibold text-gray-900"
                            : "text-gray-700"
                        }`}>
                          {t.nombre}
                        </span>
                        {tramiteSeleccionado?.id === t.id && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModalTramite}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarTramite}
                disabled={!tramiteSeleccionado}
                className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  tramiteSeleccionado
                    ? "bg-gray-700 hover:bg-gray-800 shadow-sm"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}


      <footer className="bg-black text-white text-center py-3 text-sm">
        Informática · H. Ayuntamiento de Tlaquepaque
      </footer>
    </div>
  );
};

export default Paso1Obra;