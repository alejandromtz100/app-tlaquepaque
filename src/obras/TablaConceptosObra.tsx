import { deleteConceptoObra } from '../services/obraConceptos.service';

const NIVELES_LABELS = ['Abuelo', 'Padre', 'Hijo', 'Nieto'] as const;
const MAX_NIVELES = 4;

export default function TablaConceptosObra({
  conceptos,
  onDelete,
}: {
  conceptos: any[];
  onDelete: () => void;
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
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b bg-slate-100 text-left text-sm font-medium text-slate-700">
          {NIVELES_LABELS.map((label) => (
            <th key={label} className="p-3 whitespace-nowrap">
              Conceptos ({label})
            </th>
          ))}
          <th className="p-3">Costo</th>
          <th className="p-3">Medición</th>
          <th className="p-3">Cantidad</th>
          <th className="p-3">Total</th>
          <th className="p-3 w-12"></th>
        </tr>
      </thead>
      <tbody>
        {conceptos.map((c) => {
          const niveles = path(c);
          return (
            <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50">
              {Array.from({ length: MAX_NIVELES }, (_, i) => (
                <td key={i} className="p-3 text-slate-800">
                  {celdaNivel(niveles, i)}
                </td>
              ))}
              <td className="p-3 text-slate-700">
                ${Number(c.costo_unitario ?? 0).toFixed(2)}
              </td>
              <td className="p-3 text-slate-600">{c.medicion ?? '—'}</td>
              <td className="p-3 text-slate-700">{c.cantidad}</td>
              <td className="p-3 font-medium text-slate-800">
                ${Number(c.total ?? (c.costo_unitario ?? 0) * (c.cantidad ?? 0)).toFixed(2)}
              </td>
              <td className="p-3">
                <button
                  type="button"
                  onClick={() => eliminar(c.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  🗑
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}