--
-- Corregir idcoloniaobra inválidos (ej. 0) y luego crear la FK.
-- Ejecutar si el PASO 3 falló con "Key (idcoloniaobra)=(0) is not present in table colonias".
--

BEGIN;

-- 1) Crear colonia "Sin especificar" si no existe
INSERT INTO public.colonias (nombre, densidad)
SELECT 'Sin especificar', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.colonias WHERE nombre = 'Sin especificar');

-- 2) Actualizar op_obras donde idcoloniaobra no existe en colonias:
--    asignar id por (nombrecoloniaobra, iddensidadcoloniaobra) o "Sin especificar"
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

-- 3) Crear la FK (si no existe)
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

COMMIT;
