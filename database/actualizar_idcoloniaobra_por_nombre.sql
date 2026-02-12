--
-- Actualizar op_obras: asignar idcoloniaobra e iddensidadcoloniaobra según
-- el nombre (y densidad) de la colonia en el catálogo colonias.
-- Así cada obra queda con el id correcto de su colonia.
--

BEGIN;

-- Asegurar que existe "Sin especificar" por si alguna obra no hace match
INSERT INTO public.colonias (nombre, densidad)
SELECT 'Sin especificar', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.colonias WHERE nombre = 'Sin especificar');

-- Paso A: Asignar idcoloniaobra según nombre (primero nombre+densidad, luego solo nombre)
UPDATE public.op_obras o
SET idcoloniaobra = COALESCE(
  (
    SELECT c.id_colonia
    FROM public.colonias c
    WHERE c.nombre = TRIM(o.nombrecoloniaobra)
      AND (c.densidad IS NOT DISTINCT FROM NULLIF(TRIM(o.iddensidadcoloniaobra), ''))
    ORDER BY c.id_colonia
    LIMIT 1
  ),
  (
    SELECT c.id_colonia
    FROM public.colonias c
    WHERE c.nombre = TRIM(o.nombrecoloniaobra)
    ORDER BY c.id_colonia
    LIMIT 1
  ),
  (SELECT id_colonia FROM public.colonias WHERE nombre = 'Sin especificar' LIMIT 1)
);

-- Paso B: Llevar iddensidadcoloniaobra al valor del catálogo para esa colonia
UPDATE public.op_obras o
SET iddensidadcoloniaobra = COALESCE(
  (SELECT c.densidad FROM public.colonias c WHERE c.id_colonia = o.idcoloniaobra LIMIT 1),
  ''
);

-- Revisar: deberían verse distintos idcoloniaobra según la colonia
-- SELECT idcoloniaobra, nombrecoloniaobra, iddensidadcoloniaobra FROM op_obras LIMIT 30;

COMMIT;
