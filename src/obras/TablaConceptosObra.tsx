import { deleteConceptoObra } from '../services/obraConceptos.service';

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

  return (
    <table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Medición</th>
          <th>Costo</th>
          <th>Cantidad</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {conceptos.map((c) => (
          <tr key={c.id}>
            <td>{c.concepto.nombre}</td>
            <td>{c.medicion}</td>
            <td>${c.costo_unitario}</td>
            <td>{c.cantidad}</td>
            <td>
              ${(c.total ?? c.costo_unitario * c.cantidad).toFixed(2)}
            </td>
            <td>
              <button onClick={() => eliminar(c.id)}>🗑</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}