// src/obras/Paso2ObraPage.tsx
import { useParams } from "react-router-dom";
import Menu from "../layout/menu";
import Paso2Obra from "./Paso2Obra";

export default function Paso2ObraPage() {
  const { id } = useParams();

  if (!id) {
    return <div>Obra no encontrada</div>;
  }

  return (
    <>
      <Menu />
      <Paso2Obra obraId={Number(id)} />
    </>
  );
}
