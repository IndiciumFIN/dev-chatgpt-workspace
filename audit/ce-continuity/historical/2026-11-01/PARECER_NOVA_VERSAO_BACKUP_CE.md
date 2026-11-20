# Auditoria comparativa — backup CE mais recente

**Origem**: `sandbox-backup-completo (1).tar.gz` — comparado contra `sandbox-backup-completo.tar.gz` em 1º/11/2026.
**Método**: enumeração e hashing SHA-256 de cada arquivo regular no TAR; análise estrutural, conferência dos contratos clínicos, leitura de código dos geradores P1, execução seletiva de gates e testes em cópia local.
**Escopo**: análise local dos dois arquivos. Nenhuma migração SQL, deploy, merge ou alteração remota foi feita. Não equivale a auditoria integral de 26 branches GitHub ou homologação clínica.

## 1. Integridade e mudanças

| Métrica | Anterior | Novo |
|---|---:|---:|
| Entradas TAR | 7.702 | 6.120 |
| Arquivos regulares | 6.632 | 5.203 |
| Bytes compactados | 95.241.405 | 49,777,062 |
| Arquivos idênticos no mesmo caminho | — | 4.133 |
| Arquivos alterados no mesmo caminho | — | 65 |
| Arquivos novos (caminho) | — | 1.005 |
| Arquivos ausentes no caminho antigo | — | 2.434 |

- SHA-256 arquivo antigo: `e642be5765089f47e060e69765bdc889637d5ec824f5d1f44a3b8f34f00fe935`.
- SHA-256 arquivo novo: `146353b81ea68f52cbec25468b8c235c62fd203d5824058737895329e1829edd`.
- Nenhum caminho TAR potencialmente perigoso identificado. 37 links simbólicos no novo pacote, não materializados na extração segura.
- **Relocação integral verificável**: os 865 arquivos de `src/families/` do backup anterior estão em `upload/ce-skeleton/ce-skeleton/src/families/` no novo, e seus SHA-256 são 865/865 iguais.
- 927 arquivos de build `.vercel/` ausentes nesta exportação; ausência de build não equivale à remoção do código de origem. 335 arquivos de `public/` e 160 de `audit/` saíram dos caminhos antigos, sem equivalência exaustiva confirmada para todos.
- A rota física `src/routes/api/auth/$.ts` foi removida, mas ainda há uma entrada no `route-contracts.v1.json`, produzindo falha na auditoria legada de bindings.

## 2. Catálogos preservados / modificados

- `upload/ce-skeleton/ce-skeleton/catalog/service-catalog.v1.json`: **410 serviços, 45 famílias**, todos stubs `CANDIDATE_HOLD`, sem implementação operacional do conjunto.
- `capability-registry.candidate.v0.1.json`: **201 capacidades**; `object-capability-binding.candidate.v0.1.json`: **16 bindings por tipo de objeto**; três schemas de piloto.
- `src/data/contracts/entities`: agora tem contratos clínicos novos: **78 fórmulas**, **78 contratos de resultado**, **79 regras de pontuação**, **83 registros etários**. O gate de cobertura independente reportou **1.643 entidades em 17 contratos**, versus **381 entidades e 15 contratos** na inspeção anterior.
- `tool-bindings.v1.json`: **1.031 itens**, dos quais **619 `AB-`** (bindings de autoridade) e **412 `FD-`** (definições de campo), todos rotulados `EVIDENCE_BOUND`. Os 619 AB não contêm `evidence_bundle_ids` nem `validator_ids`; quatro não têm `source_ids`.
- `migrations/`: **11 arquivos**, nenhuma alteração de conteúdo.

## 3. Achados prioritários

### CRÍTICO — Promoção de 78 ferramentas sem demonstração de homologação

- Antes: **5 publicadas, 78 candidatas**; agora: **83 com `publicacao: publicada`**.
- Ao mesmo tempo, **77/83 continuam `status: CANDIDATE`**, e **76/83 ainda mantêm HOLDs**.
- `scripts/p1-mark-published.py` e `scripts/p1-5-promote-and-bind.py` alteram marcações de publicação e testes de indexação. O novo teste das rotas (10/10 PASS) confirma consistência técnica com o novo estado, não validação clínica nem autorização do Kernel.
- **Recomendação**: exigir decisão de release versionada, bundle de evidências, aprovação clínica e WO admitida antes de qualquer mudança de `publicacao` e indexabilidade. Preservar os registros antigos para rastrear os HOLDs.

### CRÍTICO — Modelagem etária inconsistente / potencialmente insegura

- **54 registros** incluem bandas pediátricas/neonatais em `age_specific_ranges` embora `applies_to_age_groups` admita somente adultos. O gerador P1.6 faz isso deliberadamente para escalas adultas, replicando bandas entre idades.
- `AGE_GROUP_BOUNDS["neonatal"]` é `min_age=0, max_age=1`, interpretável como até 1 ano, enquanto o período neonatal clínico corresponde aos primeiros 28 dias (ICD-11/OMS).
- A escala Braden é tratada no gerador como universal, repetindo a mesma interpretação para adultos, crianças e neonatos; há instrumentos pediátricos específicos (Braden Q/Braden QD). **É necessária validação clínica por ferramenta, não cópia automática.**
- **Recomendação**: desativar projeção pública de faixas geradas até corrigir ontologia etária, aplicabilidade e fontes de evidência.

### ALTO — Fórmulas e resultados sem crosswalk de fontes suficientes

- **78/78** contratos de fórmula têm `source_binding_refs: []`, embora tragam três vetores de teste por fórmula (`min`, `max`, `typical`) e `provenance_refs` genéricas.
- Cobertura desigual: 5 ferramentas sem contrato de fórmula; 5 sem contrato de resultado; 4 sem regra de pontuação. As exceções podem ser justificáveis por tipo de ferramenta, mas precisam de uma decisão explícita.
- Os 619 bindings de autoridade `AB-` estão rotulados `EVIDENCE_BOUND`, porém **0 têm `evidence_bundle_ids` e 0 têm `validator_ids`**. Referência textual a fonte não equivale a validação do conteúdo de cada campo.

### ALTO — Gate divergente e pacote CKO incompleto

- `node scripts/audit-canonical-bindings.mjs`: **FAIL** com dez erros (nove rotas visuais sem binding e a rota de auth desaparecida).
- `node scripts/audit-surface-bindings-v2.mjs`: **PASS** para 50/50 arquivos, mas com zero homologações visuais. Os dois gates usam universos/contratos distintos; o PASS novo não resolve o FAIL antigo.
- `node scripts/check-cko-packages.mjs`: **FAIL** com 655 ausências no manifesto prefixado; o antigo também falhava (627 problemas), de modo que a falha precede o novo backup e não foi solucionada. O novo pacote passa no subconjunto de 30 checksums verificados.
- `audit/execution/execution-gates-latest.json`: **`releaseGate: BLOCKED`** mesmo com 12 testes estáticos/locais marcados `PASS` e três verificações de presença de pacotes binários (não equivalem a execução de build/E2E).

### ALTO — Autoridade do banco e integração remota

- `src/lib/db.ts`: `DB_ENABLED=true` em ambos os backups; na comparação pontual prévia, `main` e PR #30 tinham `false`. O gate de isolamento do novo pacote relata PGLite local ativo intencionalmente; **não presumir** que isso seja compatível com produção ou Supabase canônico.
- O novo pacote segue sem `.git`, `.github` e `node_modules`. Nada justifica promover o TAR diretamente para `main`.

## 4. Verificações executadas diretamente nesta auditoria

| Verificação | Resultado |
|---|---|
| Integridade/hashes do TAR | PASS: 5.203 arquivos |
| Esqueleto 410 serviços | PASS: 8/8 gates |
| Testes do esqueleto | PASS: 70/70 |
| Cobertura de contratos | PASS: 1.643 entidades/17 contratos |
| Frescor dos contratos gerados | PASS |
| Bindings legados | **FAIL: 10** |
| Bindings de superfície v2 | PASS: 50 contratos/0 achados/0 homologações visuais |
| Verificação pacotes CKO | **FAIL: 655 referências ausentes** |
| Registro de idiomas | PASS: 19 locales; SEO permanece bloqueado |
| Teste de registro de rotas | PASS: 10/10, mas ensaia o estado de publicação já alterado |
| Sintaxe dos 15 scripts Python P1 novos | PASS |
| Build integral, segurança RLS, E2E real e homologação visual | **NOT_RUN** |

## 5. Próximas decisões (ordem recomendada)

1. **Congelar publicação**: manter HOLD para 77 status CANDIDATE e restaurar vínculo entre `publicacao` e autorização clínica/governança. Reconciliar 78 mudanças de publicação com o histórico.
2. **Tabelas e fontes**: confrontar migrations existentes e registros com Supabase READ_ONLY e PRs/branches, preservando PK/FK/RLS e contratos.
3. **Contratos**: revisar regra por regra para 83 ferramentas; corrigir as 54 inconsistências etárias, neonatologia e Braden/Braden Q, sem inventar compatibilidade.
4. **Evidência**: ligar fórmulas e ABs a fontes exatas, validadores e bundles versionados; distinguir vínculo textual de homologação.
5. **Arquitetura**: escolher fonte única para `ce-skeleton`, não promover 410 stubs como serviços reais.
6. **Gates**: reconciliar auditores legados e v2, restaurar/justificar assets CKO, corrigir rota de autenticação perdida.
7. **Testes**: executar typecheck, testes, build, E2E e visual em CI com lockfile/ambiente controlado, sem aceitar `PRESENT` como prova de execução.
8. **Merge**: somente após diffs SHA a SHA nas branches e WO aprovada, por etapas da estrutura até o front-end.

**Parecer final**: **HOLD_HUMAN / MERGE_NOT_RECOMMENDED_NOW**. O novo arquivo incrementa substancialmente o registro de contratos, mas as marcações de publicação e as faixas etárias exigem correção prioritária. Nenhuma alteração remota executada.