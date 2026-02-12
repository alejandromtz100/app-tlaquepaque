-- Script para limpiar valores 'null' (string) y convertirlos a NULL real en op_obras
-- Ejecutar este script en tu base de datos PostgreSQL

-- Limpiar valores 'null' (string) y convertirlos a NULL real
UPDATE op_obras SET manzanaObra = NULL WHERE manzanaObra = 'null' OR manzanaObra = 'NULL' OR TRIM(manzanaObra) = '';
UPDATE op_obras SET loteObra = NULL WHERE loteObra = 'null' OR loteObra = 'NULL' OR TRIM(loteObra) = '';
UPDATE op_obras SET etapaObra = NULL WHERE etapaObra = 'null' OR etapaObra = 'NULL' OR TRIM(etapaObra) = '';
UPDATE op_obras SET condominioObra = NULL WHERE condominioObra = 'null' OR condominioObra = 'NULL' OR TRIM(condominioObra) = '';
UPDATE op_obras SET numerospredioscontiguosobra = NULL WHERE numerospredioscontiguosobra = 'null' OR numerospredioscontiguosobra = 'NULL' OR TRIM(numerospredioscontiguosobra) = '';
UPDATE op_obras SET entrecalle1obra = NULL WHERE entrecalle1obra = 'null' OR entrecalle1obra = 'NULL' OR TRIM(entrecalle1obra) = '';
UPDATE op_obras SET entrecalle2obra = NULL WHERE entrecalle2obra = 'null' OR entrecalle2obra = 'NULL' OR TRIM(entrecalle2obra) = '';

-- Verificar valores basura en condominioObra (debería ser numérico o NULL)
-- SELECT idobra, condominioObra
-- FROM op_obras
-- WHERE condominioObra IS NOT NULL
-- AND condominioObra !~ '^[0-9]+$';

-- Verificar valores basura en etapaObra (debería ser numérico o NULL)
-- SELECT idobra, etapaObra
-- FROM op_obras
-- WHERE etapaObra IS NOT NULL
-- AND etapaObra !~ '^[0-9]+$';
