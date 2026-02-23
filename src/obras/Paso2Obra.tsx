import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getConceptosByObra, addConceptoToObra } from '../services/obraConceptos.service';
import { getConceptosArbol } from '../services/conceptos.service';
import { getConceptosByTramite } from '../services/tramitesConceptos.service';
import TablaConceptosObra from './TablaConceptosObra';
import FormAgregarConcepto from './FormAgregarConcepto';

const API_OBRAS = 'http://localhost:3001/op_obras';

interface Props {
  obraId: number;
}

export default function Paso2Obra({ obraId }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || 'null');
  const idTramiteDesdeState = (location.state as { idTramite?: number } | null)?.idTramite;
  const esSupervisor = usuarioLogueado?.rol === 'SUPERVISOR';
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConcepto, setEditingConcepto] = useState<any | null>(null);
  const seedDesdeTramiteHecho = useRef(false);

  const flattenConceptos = (nodes: any[]) => {
    const map = new Map<number, any>();
    const walk = (arr: any[]) => {
      for (const n of arr) {
        if (n?.id != null) map.set(Number(n.id), n);
        if (Array.isArray(n?.children) && n.children.length > 0) walk(n.children);
      }
    };
    walk(nodes);
    return map;
  };

  const collectDescendantIds = (node: any): number[] => {
    const out: number[] = [];
    const walk = (n: any) => {
      const children = Array.isArray(n?.children) ? n.children : [];
      for (const c of children) {
        if (c?.id != null) out.push(Number(c.id));
        walk(c);
      }
    };
    walk(node);
    return out;
  };

  const cargarConceptos = async () => {
    setLoading(true);
    try {
      const data = await getConceptosByObra(obraId);
      setConceptos(data);

      // Actualizar total en obra solo si no es supervisor (no modificar)
      if (!esSupervisor) {
        const total = data.reduce(
          (sum: number, c: any) =>
            sum + Number(c.total ?? c.costo_unitario * c.cantidad),
          0,
        );
        try {
          const totalValue = Number(total.toFixed(2));
          await axios.put(`${API_OBRAS}/${obraId}/total-conceptos`, {
            totalCostoConceptos: totalValue,
          });
        } catch (error: any) {
          console.error('Error al actualizar totalCostoConceptos:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const data = await getConceptosByObra(obraId);
      if (cancelled) return;
      setConceptos(data);

      if (esSupervisor) {
        setLoading(false);
        return;
      }

      if (data.length > 0) {
        setLoading(false);
        return;
      }

      if (seedDesdeTramiteHecho.current) {
        setLoading(false);
        return;
      }

      let idTramite: number | null = idTramiteDesdeState ?? null;
      if (idTramite == null) {
        try {
          const resObra = await axios.get(`${API_OBRAS}/${obraId}`);
          const obra = resObra.data;
          idTramite = obra?.idTramite ?? obra?.idtramite ?? null;
        } catch {
          idTramite = null;
        }
      }
      if (!idTramite) {
        setLoading(false);
        return;
      }

      try {
        seedDesdeTramiteHecho.current = true;
        const conceptosTramite = await getConceptosByTramite(Number(idTramite));
        const arbol = await getConceptosArbol();
        const conceptosMap = flattenConceptos(arbol as any[]);

        const idsAAgregar = new Set<number>();
        for (const tc of conceptosTramite as any[]) {
          const c = tc?.concepto;
          const conceptoId = c?.id != null ? Number(c.id) : null;
          if (!conceptoId) continue;

          // Si el trámite está asociado a un concepto "abuelo" (parent_id null),
          // agregamos sus descendientes (padre/hijo/nieto) en lugar del abuelo,
          // porque el backend no permite insertar abuelos en obra_conceptos.
          const parentId = c?.parent_id ?? c?.parentId ?? null;
          if (parentId == null) {
            const nodo = conceptosMap.get(conceptoId);
            if (nodo) {
              for (const descId of collectDescendantIds(nodo)) idsAAgregar.add(descId);
            }
          } else {
            idsAAgregar.add(conceptoId);
          }
        }

        for (const conceptoId of idsAAgregar) {
          const nodo = conceptosMap.get(conceptoId);
          try {
            await addConceptoToObra({
              obra_id: obraId,
              concepto_id: conceptoId,
              costo_unitario: Number(nodo?.costo ?? 0),
              cantidad: 1,
              medicion: nodo?.medicion ?? undefined,
            });
          } catch {
            // Ignorar (ej. ya existe / no permitido)
          }
        }
      } catch {
        // Si falla obra o tramite, seguir sin sembrar
      }

      if (!cancelled) {
        const dataAfter = await getConceptosByObra(obraId);
        setConceptos(dataAfter);
        const total = dataAfter.reduce(
          (sum: number, c: any) =>
            sum + Number(c.total ?? c.costo_unitario * c.cantidad),
          0,
        );
        try {
          await axios.put(`${API_OBRAS}/${obraId}/total-conceptos`, {
            totalCostoConceptos: Number(total.toFixed(2)),
          });
        } catch {}
      }
      if (!cancelled) setLoading(false);
    };

    setLoading(true);
    load();
    return () => {
      cancelled = true;
    };
  }, [obraId, esSupervisor]);

  const totalGeneral = conceptos.reduce(
    (sum, c) => sum + Number(c.total ?? c.costo_unitario * c.cantidad),
    0
  );

  const handleContinuar = () => {
    if (conceptos.length === 0) {
      alert('No puede avanzar al siguiente apartado sin tener al menos un concepto ingresado.');
      return;
    }
    navigate(`/obras/paso3/${obraId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando conceptos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Conceptos */}
      <div>
        <div className="bg-gray-800 text-white text-center py-3 font-semibold text-sm">
          CONCEPTOS
        </div>
        <div className="overflow-x-auto">
          <TablaConceptosObra
            conceptos={conceptos}
            onDelete={cargarConceptos}
            onEdit={esSupervisor ? undefined : (c) => setEditingConcepto(c)}
            soloLectura={esSupervisor}
          />
        </div>
        <div className="px-6 py-4 flex justify-end border-t border-slate-200 bg-slate-50">
          <div className="text-right">
            <span className="text-sm text-slate-600 block">Total general</span>
            <span className="text-xl font-bold text-slate-800">${totalGeneral.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botón Continuar (oculto para supervisor) */}
      {!esSupervisor && (
        <div className="p-6 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleContinuar}
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Formulario Agregar Concepto (oculto para supervisor) */}
      {!esSupervisor && (
        <div className="border-t border-gray-200">
          <FormAgregarConcepto
            obraId={obraId}
            onSuccess={() => {
              cargarConceptos();
              setEditingConcepto(null);
            }}
            editingConcepto={editingConcepto}
            onCancelEdit={() => setEditingConcepto(null)}
          />
        </div>
      )}
    </div>
  );
}
