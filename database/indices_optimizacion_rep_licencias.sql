--
-- Índices para optimizar el reporte de licencias
-- Mejoran significativamente el rendimiento con ~150k registros
--

BEGIN;

-- Índice en obra_conceptos.IdObra (para JOIN con op_obras)
CREATE INDEX IF NOT EXISTS idx_obra_conceptos_idobra 
ON public.obra_conceptos("IdObra");

-- Índice en obra_conceptos.id_concepto (para JOIN con conceptos)
CREATE INDEX IF NOT EXISTS idx_obra_conceptos_id_concepto 
ON public.obra_conceptos(id_concepto);

-- Índice compuesto para filtros comunes
CREATE INDEX IF NOT EXISTS idx_obra_conceptos_obra_concepto 
ON public.obra_conceptos("IdObra", id_concepto);

-- Índice en op_obras.fechacaptura (para filtros de fecha)
CREATE INDEX IF NOT EXISTS idx_op_obras_fechacaptura 
ON public.op_obras("fechacaptura");

-- Índice en op_obras.consecutivo (para filtro de consecutivo)
CREATE INDEX IF NOT EXISTS idx_op_obras_consecutivo 
ON public.op_obras("consecutivo");

-- Índice en conceptos.parent_id (para JOINs de jerarquía)
CREATE INDEX IF NOT EXISTS idx_conceptos_parent_id 
ON public.conceptos(parent_id);

-- Índice compuesto en conceptos para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_conceptos_nombre 
ON public.conceptos(nombre) WHERE nombre IS NOT NULL;

COMMIT;
