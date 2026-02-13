-- =============================================================================
-- Importar obras_conceptos.csv a la tabla obra_conceptos (PostgreSQL)
-- =============================================================================
-- El CSV puede tener 6 o 7 columnas SIN encabezado:
--   6 columnas: idobra, id_concepto, cantidad, medicion, costo, total  → observaciones = NULL
--   7 columnas: + observaciones (generado con generar_obras_conceptos_csv.js)
--
-- Elige UNA de las dos opciones de carga (2a o 2b) según tu archivo.
-- =============================================================================

-- 1) Tabla temporal (sirve para 6 y 7 columnas: observaciones puede quedar NULL)
DROP TABLE IF EXISTS staging_obras_conceptos;

CREATE TEMP TABLE staging_obras_conceptos (
  idobra        integer NOT NULL,
  id_concepto   integer NOT NULL,
  cantidad      numeric(15,2) NOT NULL,
  medicion      varchar(100),
  costo         numeric(15,2) NOT NULL,
  total         numeric(15,2) NOT NULL,
  observaciones text
);

-- 2a) CSV con 6 columnas (idobra, id_concepto, cantidad, medicion, costo, total) – SIN observaciones
\copy staging_obras_conceptos (idobra, id_concepto, cantidad, medicion, costo, total) FROM 'obras_conceptos.csv' WITH (FORMAT csv, HEADER false, QUOTE '"', NULL '')

-- 2b) CSV con 7 columnas (incluye observaciones). COMENTA la línea 2a y DESCOMENTA la siguiente:
-- \copy staging_obras_conceptos (idobra, id_concepto, cantidad, medicion, costo, total, observaciones) FROM 'obras_conceptos.csv' WITH (FORMAT csv, HEADER false, QUOTE '"', NULL '')

-- Si hay líneas vacías al final:
DELETE FROM staging_obras_conceptos WHERE idobra IS NULL;

-- 3a) Insertar solo los que NO existan (evita duplicados)
INSERT INTO public.obra_conceptos (
  idobra, id_concepto, cantidad, medicion, costo, total,
  observaciones, fecha_creacion, id_usuario_creacion, estado
)
SELECT
  s.idobra, s.id_concepto, s.cantidad, s.medicion, s.costo, s.total,
  NULLIF(TRIM(COALESCE(s.observaciones, '')), ''), NOW(), 1, 1
FROM staging_obras_conceptos s
WHERE NOT EXISTS (
  SELECT 1 FROM public.obra_conceptos oc
  WHERE oc.idobra = s.idobra
    AND oc.id_concepto = s.id_concepto
    AND oc.cantidad = s.cantidad
    AND oc.costo = s.costo
    AND oc.total = s.total
);

-- 3b) Reemplazar TODO (solo si quieres). COMENTA el INSERT 3a y DESCOMENTA las 3 líneas siguientes:
-- TRUNCATE TABLE public.obra_conceptos RESTART IDENTITY CASCADE;
-- INSERT INTO public.obra_conceptos (idobra, id_concepto, cantidad, medicion, costo, total, observaciones, fecha_creacion, id_usuario_creacion, estado)
-- SELECT idobra, id_concepto, cantidad, medicion, costo, total, NULLIF(TRIM(COALESCE(observaciones, '')), ''), NOW(), 1, 1 FROM staging_obras_conceptos WHERE idobra IS NOT NULL;

-- 4) Limpiar
DROP TABLE IF EXISTS staging_obras_conceptos;
