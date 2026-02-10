import { useEffect, useState } from 'react';
import { addConceptoToObra } from '../services/obraConceptos.service';

const API_CONCEPTOS = 'http://localhost:3001/conceptos/select';

export default function FormAgregarConcepto({
  obraId,
  onSuccess,
}: {
  obraId: number;
  onSuccess: () => void;
}) {
  const [niveles, setNiveles] = useState<any[][]>([[]]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  const [costo, setCosto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const cargarNivel = async (parentId?: number, index = 0) => {
    const url = parentId
      ? `${API_CONCEPTOS}?parent_id=${parentId}`
      : API_CONCEPTOS;

    const res = await fetch(url);
    const data = await res.json();

    const nuevos = niveles.slice(0, index + 1);
    nuevos[index] = data;
    setNiveles(nuevos);
  };

  useEffect(() => {
    cargarNivel();
  }, []);

  const seleccionar = (id: number, index: number) => {
    const nuevos = [...seleccionados];
    nuevos[index] = id;
    setSeleccionados(nuevos);
    cargarNivel(id, index + 1);
  };

  const submit = async () => {
    const concepto_id = seleccionados[seleccionados.length - 1];
    await addConceptoToObra({
      obra_id: obraId,
      concepto_id,
      costo_unitario: Number(costo),
      cantidad: Number(cantidad),
      descripcion_costo: descripcion,
    });
    onSuccess();
  };

  return (
    <div>
      <h3>Agregar concepto</h3>

      {niveles.map((nivel, i) =>
        nivel.length > 0 ? (
          <select key={i} onChange={(e) => seleccionar(Number(e.target.value), i)}>
            <option>Selecciona</option>
            {nivel.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        ) : null,
      )}

      <input
        placeholder="Costo unitario"
        value={costo}
        onChange={(e) => setCosto(e.target.value)}
      />
      <input
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
      />
      <input
        placeholder="Descripción del costo"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <button onClick={submit}>Agregar</button>
    </div>
  );
}
