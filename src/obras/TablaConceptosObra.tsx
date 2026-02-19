import { deleteConceptoObra } from '../services/obraConceptos.service';
import { Pencil, Trash2 } from 'lucide-react';

const NIVELES_LABELS = ['Abuelo', 'Padre', 'Hijo', 'Nieto'] as const;
const MAX_NIVELES = 4;

export default function TablaConceptosObra({
  conceptos,
  onDelete,
  onEdit,
  soloLectura = false,
}: {
  conceptos: any[];
  onDelete: () => void;
  onEdit?: (concepto: any) => void;
  soloLectura?: boolean;
}) {
  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar concepto?')) return;
    await deleteConceptoObra(id);
    onDelete();
  };

  const path = (c: any): string[] => {
    const arr = c.conceptoPath && Array.isArray(c.conceptoPath)
      ? c.conceptoPath.map((n: { nombre: string }) => n.nombre)
      : c.concepto?.nombre
        ? [c.concepto.nombre]
        : [];
    return arr;
  };

  // Alinear a la derecha: Abuelo en col 0, Nieto (hoja con costo) en col 3. Si hay 1 nivel va en Nieto.
  const celdaNivel = (niveles: string[], colIndex: number): string => {
    const offset = MAX_NIVELES - niveles.length;
    const idx = colIndex - offset;
    return idx >= 0 && idx < niveles.length ? niveles[idx] : '—';
  };

  return (
    <table className="min-w-full text-xs border-collapse bg-white">
      <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
        <tr className="text-gray-700 uppercase">
          {NIVELES_LABELS.map((label) => (
            <th key={label} className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">
              Conceptos ({label})
            </th>
          ))}
          <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Costo</th>
          <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Medición</th>
          <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Cantidad</th>
          <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100">Totales</th>
          {!soloLectura && (
            <th className="px-4 py-3 text-left border border-gray-300 font-semibold whitespace-nowrap bg-gray-100 w-24 text-center">Acciones</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {conceptos.map((c) => {
          const niveles = path(c);
          return (
            <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200">
              {Array.from({ length: MAX_NIVELES }, (_, i) => (
                <td key={i} className="px-4 py-3 border border-gray-300 text-gray-700">
                  {celdaNivel(niveles, i)}
                </td>
              ))}
              <td className="px-4 py-3 border border-gray-300 text-gray-700">{Number(c.costo_unitario ?? 0).toFixed(2)}</td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700">{c.medicion ?? '—'}</td>
              <td className="px-4 py-3 border border-gray-300 text-gray-700">{c.cantidad}</td>
              <td className="px-4 py-3 border border-gray-300 font-medium text-gray-900">
                ${Number(c.total ?? (c.costo_unitario ?? 0) * (c.cantidad ?? 0)).toFixed(2)}
              </td>
              {!soloLectura && (
                <td className="px-4 py-3 border border-gray-300">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => eliminar(c.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}