import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001";

interface DirectorObra {
  id: number;
  clave_director: string;
  nombre_completo: string;
  domicilio: string;
  colonia: string;
  municipio: string;
  codigo_postal: string;
  telefono: string;
  rfc: string;
  cedula_federal: string;
  cedula_estatal: string;
  oficio_autorizacion_ro: string;
  oficio_autorizacion_rp: string;
  oficio_autorizacion_pu: string;
  ro_edificacion: boolean;
  ro_restauracion: boolean;
  ro_urbanizacion: boolean;
  ro_infraestructura: boolean;
  rp_edificacion: boolean;
  rp_restauracion: boolean;
  rp_urbanizacion: boolean;
  rp_infraestructura: boolean;
  imagen: string;
}

export default function Directores() {
  const [directores, setDirectores] = useState<DirectorObra[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDirectores = async () => {
    try {
      const res = await axios.get(`${API_URL}/directores-obra`);
      setDirectores(res.data);
    } catch (error) {
      console.error("Error al cargar directores", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDirectores();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Cargando directores...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Directores de Obra
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {directores.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border"
          >
            {/* IMAGEN */}
            <div className="flex justify-center p-4">
              <img
                src={`${API_URL}/uploads/directores/${d.imagen}`}
                alt={d.nombre_completo}
                className="w-36 h-36 object-cover rounded-full border"
              />
            </div>

            {/* INFO */}
            <div className="px-4 pb-4 space-y-1 text-sm">
              <h2 className="text-lg font-semibold text-center">
                {d.nombre_completo}
              </h2>

              <p><b>Clave:</b> {d.clave_director}</p>
              <p><b>RFC:</b> {d.rfc}</p>
              <p><b>Teléfono:</b> {d.telefono}</p>
              <p><b>Domicilio:</b> {d.domicilio}</p>
              <p><b>Colonia:</b> {d.colonia}</p>
              <p><b>Municipio:</b> {d.municipio}</p>
              <p><b>C.P:</b> {d.codigo_postal}</p>

              <hr className="my-2" />

              <p><b>Cédula Federal:</b> {d.cedula_federal}</p>
              <p><b>Cédula Estatal:</b> {d.cedula_estatal}</p>

              <hr className="my-2" />

              <p className="font-semibold">Responsable de Obra</p>
              <ul className="ml-4 list-disc">
                {d.ro_edificacion && <li>Edificación</li>}
                {d.ro_restauracion && <li>Restauración</li>}
                {d.ro_urbanizacion && <li>Urbanización</li>}
                {d.ro_infraestructura && <li>Infraestructura</li>}
              </ul>

              <p className="font-semibold mt-2">Responsable de Proyecto</p>
              <ul className="ml-4 list-disc">
                {d.rp_edificacion && <li>Edificación</li>}
                {d.rp_restauracion && <li>Restauración</li>}
                {d.rp_urbanizacion && <li>Urbanización</li>}
                {d.rp_infraestructura && <li>Infraestructura</li>}
              </ul>

              <hr className="my-2" />

              {/* PDFS */}
              <div className="flex gap-2 flex-wrap">
                {d.oficio_autorizacion_ro && (
                  <a
                    href={`${API_URL}/uploads/oficios/${d.oficio_autorizacion_ro}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    PDF RO
                  </a>
                )}

                {d.oficio_autorizacion_rp && (
                  <a
                    href={`${API_URL}/uploads/oficios/${d.oficio_autorizacion_rp}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    PDF RP
                  </a>
                )}

                {d.oficio_autorizacion_pu && (
                  <a
                    href={`${API_URL}/uploads/oficios/${d.oficio_autorizacion_pu}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    PDF PU
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
