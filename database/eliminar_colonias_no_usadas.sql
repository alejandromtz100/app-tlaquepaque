--
-- Eliminar colonias del catálogo que no están siendo usadas en op_obras.
-- Solo se eliminan las que no tienen ninguna obra asociada.
-- La colonia "Sin especificar" se mantiene aunque no se use.
--

BEGIN;

-- Ver cuántas colonias se van a eliminar (opcional - descomentar para revisar)
-- SELECT 
--   c.id_colonia,
--   c.nombre,
--   c.densidad,
--   COUNT(o.idobra) AS obras_asociadas
-- FROM public.colonias c
-- LEFT JOIN public.op_obras o ON o.idcoloniaobra = c.id_colonia
-- GROUP BY c.id_colonia, c.nombre, c.densidad
-- HAVING COUNT(o.idobra) = 0
-- ORDER BY c.nombre, c.densidad;

-- Eliminar colonias que no tienen ninguna obra asociada
-- (excepto "Sin especificar" que se mantiene)
DELETE FROM public.colonias c
WHERE c.id_colonia NOT IN (
  SELECT DISTINCT idcoloniaobra 
  FROM public.op_obras 
  WHERE idcoloniaobra IS NOT NULL
)
AND c.nombre != 'Sin especificar';

-- Ver cuántas colonias quedaron (opcional)
-- SELECT COUNT(*) AS total_colonias FROM public.colonias;
-- SELECT nombre, COUNT(*) AS cantidad FROM public.colonias GROUP BY nombre ORDER BY nombre;

COMMIT;
