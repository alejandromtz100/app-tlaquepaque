--
-- Eliminar columnas redundantes de op_obras:
-- - nombrecoloniaobra (ya se obtiene desde colonias.nombre vía idcoloniaobra)
-- - iddensidadcoloniaobra (ya se obtiene desde colonias.densidad vía idcoloniaobra)
--
-- IMPORTANTE: Ejecutar SOLO después de actualizar el código del backend/frontend
-- para que usen JOIN con colonias en lugar de estos campos.
--

BEGIN;

-- Eliminar las columnas (PostgreSQL)
ALTER TABLE public.op_obras
  DROP COLUMN IF EXISTS nombrecoloniaobra,
  DROP COLUMN IF EXISTS iddensidadcoloniaobra;

-- Verificar que se eliminaron (opcional)
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'op_obras' AND column_name IN ('nombrecoloniaobra', 'iddensidadcoloniaobra');

COMMIT;


