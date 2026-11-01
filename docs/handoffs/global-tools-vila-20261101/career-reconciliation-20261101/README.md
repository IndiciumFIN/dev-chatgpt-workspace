# Inventário Carreira e Portal do Jovem — reconciliação de 01/11/2026

**Preservado no Git; não confundir módulo candidato com aplicação homologada.**

A branch [`feat/career-youth-db-first-20261026`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/tree/feat/career-youth-db-first-20261026) @ `ad4c683890779eda3a096743b70cf6be2bfc4605` contém **24 módulos**, **43 tabelas PGLite candidatas em 4 arquivos SQL**, **31 contratos JSON Schema** e **17 documentos editoriais.** Também há o gerador de currículo em `src/components/career/curriculum-editor.tsx` e `projector.ts`. No cadastro da carreira as projeções são `/secao/carreira` e `/secao/jovens`.

Arquivos nesta pasta: `CAREER-INVENTORY.json` (24 módulos, 43 tabelas, refs canônicos *existentes*), `CAREER-UNVERIFIED.json` (38 detalhes planejados sem prova funcional), `REUSE.md` (decisões de não duplicação). **Nenhuma tabela nova ou ID canônico foi criado por esta auditoria.**

O próprio candidate declara `no_remote_database`, `CANDIDATE_HOLD`, `kernelAdmission=NOT_SUBMITTED`; existem **36 revisões** e **6 gates de release** pendentes. A PR [#21](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/21) continua Draft; o último workflow da branch no SHA consultado falhou em E2E browser (run [41237556550](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41237556550)). Não declarar aprovação de produção.

O conector Supabase não estava disponível durante esta rodada: versões, chaves e linhas do projeto `Calculadoras-Smart` **não foram reconsultadas**. As estruturas `ce_platform.career_*` observadas em leituras anteriores devem ser comparadas campo a campo antes de qualquer migração remota.

**A prova de 100% de armazenamento de TODOS os artefatos do ecossistema não foi estabelecida.** Neste recorte de Carreira, o código candidato, migrações e inventário dos conceitos verificados estão registrados em Git; a materialização/execução exige gates e readback independentes.
