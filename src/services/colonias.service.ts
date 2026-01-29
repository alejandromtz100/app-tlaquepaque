// colonias.service.ts
const API_URL = "http://localhost:3001/colonias";

export interface Colonia {
  id_colonia: number;
  nombre: string;
  densidad: string | null;
}

// Interfaz para el formulario (puede ser diferente)
export interface ColoniaFormData {
  nombre: string;
  densidad: string | null;
}

// Función para normalizar datos de la API
const normalizeColonia = (data: any): Colonia => ({
  id_colonia: data.id_colonia,
  nombre: data.nombre,
  densidad: data.densidad === null || data.densidad === undefined || data.densidad === "" 
    ? null 
    : data.densidad
});

// Función para preparar datos para enviar a la API
const prepareColoniaData = (data: ColoniaFormData): any => ({
  nombre: data.nombre.trim(),
  densidad: data.densidad === null || data.densidad === "" 
    ? null 
    : data.densidad
});

export const getColonias = async (): Promise<Colonia[]> => {
  try {
    const res = await fetch(API_URL);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.map(normalizeColonia);
  } catch (error) {
    console.error("Error al obtener colonias:", error);
    throw new Error("No se pudieron cargar las colonias. Verifica tu conexión.");
  }
};

export const createColonia = async (data: ColoniaFormData): Promise<Colonia> => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prepareColoniaData(data)),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const created = await res.json();
    return normalizeColonia(created);
  } catch (error) {
    console.error("Error al crear colonia:", error);
    throw new Error(`Error al crear colonia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

export const updateColonia = async (
  id: number,
  data: ColoniaFormData
): Promise<Colonia> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prepareColoniaData(data)),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const updated = await res.json();
    return normalizeColonia(updated);
  } catch (error) {
    console.error("Error al actualizar colonia:", error);
    throw new Error(`Error al actualizar colonia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

export const deleteColonia = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error al eliminar colonia:", error);
    throw new Error(`Error al eliminar colonia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Utilidad para mostrar densidad en la UI
export const getDensidadDisplay = (densidad: string | null): string => {
  if (!densidad) return "-";
  return densidad;
};

// Utilidad para opciones de densidad en selects
export const densidadOptions = [
  { value: null, label: "Ninguna" },
  { value: "Densidad alta", label: "Densidad alta" },
  { value: "Densidad media", label: "Densidad media" },
  { value: "Densidad baja", label: "Densidad baja" },
  { value: "Densidad mínima", label: "Densidad mínima" },
];