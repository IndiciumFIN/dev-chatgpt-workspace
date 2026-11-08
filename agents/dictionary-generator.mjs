/**
 * Agente: dictionary-generator.mjs
 * Especialização: Dicionário canônico e master data
 * Suporte: D010, field-dictionary | COSO Information & Communication
 */
import { writeFileSync } from 'fs';

const dictionary = {
  schemaVersion: 'wutrib.dictionary.v1',
  status: 'TEMPLATE',
  approved_by: 'NONE',
  fields: [
    { name: 'document_key', type: 'text', precision: null, source: 'NF-e / EFD', validity: 'PENDENTE' },
    { name: 'tax_amount', type: 'numeric', precision: '20,6', source: 'Fiscal', validity: 'PENDENTE' }
  ],
  masterData: { cfop: 'PENDENTE', ncm: 'PENDENTE', cst: 'PENDENTE', tes: 'PENDENTE' },
  residualRisk: 'Master data não versionado'
};

writeFileSync('artifacts/dictionary.v1.json', JSON.stringify(dictionary, null, 2));
console.log(JSON.stringify({ agent: 'dictionary-generator', status: 'PASS', output: 'artifacts/dictionary.v1.json' }));
process.exit(0);
