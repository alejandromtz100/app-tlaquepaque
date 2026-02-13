-- =============================================================================
-- Quitar FKs de obra_conceptos (ejecutar ANTES de importar si la tabla ya tenía FKs)
-- Después de importar, ejecuta: aplicar_fk_obra_conceptos.sql
-- =============================================================================

ALTER TABLE public.obra_conceptos
  DROP CONSTRAINT IF EXISTS fk_obra_conceptos_obra;

ALTER TABLE public.obra_conceptos
  DROP CONSTRAINT IF EXISTS fk_obra_conceptos_concepto;
