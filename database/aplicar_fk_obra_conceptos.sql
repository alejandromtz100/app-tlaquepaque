-- =============================================================================
-- Aplicar FKs a obra_conceptos (ejecutar DESPUÉS de importar el CSV)
-- Si falla: hay filas con idobra o id_concepto que no existen en op_obras/conceptos.
-- Revisa con:
--   SELECT DISTINCT oc.idobra FROM obra_conceptos oc LEFT JOIN op_obras o ON o.idobra = oc.idobra WHERE o.idobra IS NULL;
--   SELECT DISTINCT oc.id_concepto FROM obra_conceptos oc LEFT JOIN conceptos c ON c.id = oc.id_concepto WHERE c.id IS NULL;
-- =============================================================================

ALTER TABLE public.obra_conceptos
  ADD CONSTRAINT fk_obra_conceptos_obra
  FOREIGN KEY (idobra) REFERENCES public.op_obras (idobra) ON DELETE RESTRICT;

ALTER TABLE public.obra_conceptos
  ADD CONSTRAINT fk_obra_conceptos_concepto
  FOREIGN KEY (id_concepto) REFERENCES public.conceptos (id) ON DELETE RESTRICT;
