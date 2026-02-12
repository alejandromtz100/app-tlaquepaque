--
-- Migración: usar catálogo colonias en op_obras
-- 1) Insertar en colonias las (nombre, densidad) que existen en op_obras y no están en el catálogo.
-- 2) Actualizar op_obras: idcoloniaobra = id_colonia, iddensidadcoloniaobra = densidad del catálogo.
--
-- Ejecutar en PostgreSQL. Recomendación: hacer backup y probar primero con BEGIN; ... ROLLBACK;
--

BEGIN;

-- ---------------------------------------------------------------------------
-- PASO 1: Insertar en colonias las combinaciones (nombre, densidad) que
--         aparecen en op_obras y no existen aún en colonias.
--         (Ignoramos filas con nombre de colonia vacío.)
-- ---------------------------------------------------------------------------
INSERT INTO public.colonias (nombre, densidad)
SELECT DISTINCT
  TRIM(o.nombrecoloniaobra) AS nombre,
  NULLIF(TRIM(o.iddensidadcoloniaobra), '') AS densidad
FROM public.op_obras o
WHERE TRIM(o.nombrecoloniaobra) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.colonias c
    WHERE c.nombre = TRIM(o.nombrecoloniaobra)
      AND (c.densidad IS NOT DISTINCT FROM NULLIF(TRIM(o.iddensidadcoloniaobra), ''))
  );

-- Ver cuántas filas se insertaron (opcional)
-- SELECT 'Colonias insertadas:', count(*) FROM colonias;

-- ---------------------------------------------------------------------------
-- PASO 2: Actualizar op_obras: asignar idcoloniaobra (id del catálogo) y
--         iddensidadcoloniaobra (densidad del catálogo) según nombre + densidad.
--         Si hay varias colonias con mismo (nombre, densidad), se toma la de menor id.
-- ---------------------------------------------------------------------------
UPDATE public.op_obras o
SET
  idcoloniaobra = (
    SELECT c.id_colonia
    FROM public.colonias c
    WHERE c.nombre = TRIM(o.nombrecoloniaobra)
      AND (c.densidad IS NOT DISTINCT FROM NULLIF(TRIM(o.iddensidadcoloniaobra), ''))
    ORDER BY c.id_colonia
    LIMIT 1
  ),
  iddensidadcoloniaobra = (
    SELECT COALESCE(c.densidad, '')
    FROM public.colonias c
    WHERE c.nombre = TRIM(o.nombrecoloniaobra)
      AND (c.densidad IS NOT DISTINCT FROM NULLIF(TRIM(o.iddensidadcoloniaobra), ''))
    ORDER BY c.id_colonia
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1
  FROM public.colonias c
  WHERE c.nombre = TRIM(o.nombrecoloniaobra)
    AND (c.densidad IS NOT DISTINCT FROM NULLIF(TRIM(o.iddensidadcoloniaobra), ''))
);

-- Ver cuántas filas se actualizaron (opcional)
-- SELECT 'Filas op_obras actualizadas:', count(*) FROM op_obras;

-- ---------------------------------------------------------------------------
-- PASO 2b: Corregir filas con idcoloniaobra = 0 o que no existan en colonias.
--          Se asigna id por (nombrecoloniaobra, iddensidadcoloniaobra); si no
--          hay match, se usa la colonia "Sin especificar".
-- ---------------------------------------------------------------------------
INSERT INTO public.colonias (nombre, densidad)
SELECT 'Sin especificar', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.colonias WHERE nombre = 'Sin especificar');

UPDATE public.op_obras o
SET
  idcoloniaobra = COALESCE(
    (
      SELECT c.id_colonia
      FROM public.colonias c
      WHERE c.nombre = TRIM(o.nombrecoloniaobra)
        AND (c.densidad IS NOT DISTINCT FROM NULLIF(TRIM(o.iddensidadcoloniaobra), ''))
      ORDER BY c.id_colonia
      LIMIT 1
    ),
    (SELECT id_colonia FROM public.colonias WHERE nombre = 'Sin especificar' LIMIT 1)
  ),
  iddensidadcoloniaobra = COALESCE(
    (
      SELECT c.densidad
      FROM public.colonias c
      WHERE c.nombre = TRIM(o.nombrecoloniaobra)
        AND (c.densidad IS NOT DISTINCT FROM NULLIF(TRIM(o.iddensidadcoloniaobra), ''))
      ORDER BY c.id_colonia
      LIMIT 1
    ),
    ''
  )
WHERE o.idcoloniaobra NOT IN (SELECT id_colonia FROM public.colonias);

-- ---------------------------------------------------------------------------
-- PASO 3: Crear FK op_obras.idcoloniaobra → colonias.id_colonia
--         (Solo si no existe; falla si algún idcoloniaobra no está en colonias.)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_op_obras_colonias'
  ) THEN
    ALTER TABLE public.op_obras
      ADD CONSTRAINT fk_op_obras_colonias
      FOREIGN KEY (idcoloniaobra) REFERENCES public.colonias(id_colonia);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Revisar resultado antes de confirmar:
--   SELECT idobra, idcoloniaobra, nombrecoloniaobra, iddensidadcoloniaobra
--   FROM op_obras LIMIT 20;
-- Si todo está bien: COMMIT; si no: ROLLBACK;
-- ---------------------------------------------------------------------------

COMMIT;
