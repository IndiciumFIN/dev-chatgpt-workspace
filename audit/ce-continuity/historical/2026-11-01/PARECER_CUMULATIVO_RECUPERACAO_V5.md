# Auditoria cumulativa do `sandbox-completo (1).tar.gz` — recuperação de conteúdos pendentes

**Base de comparação:** `sandbox-completo.tar.gz`, `sandbox-backup-completo (2).tar.gz`, inventário transversal CE/Supabase anterior e auditorias anteriores. **Modo:** somente leitura, sem escrita remota, sem executar código não revisado. Esta é continuação do inventário anterior, não criação de nova demanda ou substituição dos registros existentes.

## 1. Conclusão física

O TAR atual tem **5.768 arquivos regulares**, exatamente **1.250 caminhos adicionais** frente aos 4.518 do anterior. **Todos os 4.518 arquivos anteriores possuem o mesmo SHA-256 no mesmo caminho**; não houve exclusão nem modificação nesse par de snapshots. O pacote contém 4574 hashes de conteúdo distintos. Dos 1.250 adicionados, 615 repetem bytes já existentes na exportação anterior e 635 têm hash não observado naquela exportação. Isso não significa 635 funcionalidades novas: há espelhamento de HTML, imagens, auditorias e novos pacotes de transporte.

Dos 933 caminhos registrados como ausentes da versão anterior à última exportação, **933/933 foram restituídos exatamente no mesmo caminho e com o hash original**. Destes, **318/318 eram efetivamente ausentes por hash no último TAR**; estão agora presentes. Classificação: 252 biblioteca visual, 59 templates, 3 auditorias, 2 arquivos `acoes/download`, 1 README e 1 schema CKO. No TAR v3, 5.221 caminhos estão no pacote atual; **11 arquivos têm bytes diferentes contra o v3** (10 de auditoria e o binding de superfícies), e os 11 hashes anteriores não estão na exportação atual. O v3 original deve ser preservado como histórico de versão; não declarar substituição dos relatórios antigos pela versão nova.

## 2. Recuperação por família

| Família | Evidência | Estado|
|---|---|---|
| Serviço `acoes.download` | `contract.ts` e `index.ts` restituídos; agora **410 index.ts + 410 contract.ts** sob `src/families` do pacote | **RECUPERADO fisicamente**; todos continuam candidatos `CANDIDATE_HOLD`|
| Biblioteca visual | 515 entradas históricas (251 HTML, 262 AVIF, 2 JSON), cópia de 251 HTML em `public/bibliotecas/catalog` | **PRESERVADO**; navegação do espelho precisa ajuste|
| Templates piloto | 59 artefatos (30 HTML, 29 PNG) em `_archive/download` e cópias byte a byte em `public/templates-piloto` | **PRESERVADO**; não homologado|
| CKO skeletons | 353 entradas históricas; 349 idênticas à réplica `src/data/contracts/cko-skeletons`; duas variações e dois schemas não estão nessa réplica | **DIVERGÊNCIA DE AUTORIDADE**, não perda de conteúdo|
| Contratos CKO | `curriculum` e `flashcard` existem integralmente em `src/data/contracts/cko-schemas`; `assessment_item` idêntico ao arquivo histórico; `learning_resource` semanticamente idêntico ao de `cko-schemas` | **REUSAR CANÔNICO EXISTENTE**, sem replicar cegamente|
| Material de comparação integrado | ZIP em `upload/` com **1027 arquivos regulares** (além de diretórios) | **MATERIAL DE EVIDÊNCIA/TRANSPORTE**, não nova branch nem produção|
| PMO × Kernel | Plano + **137 tasks** já presentes em `upload`, 22 tarefas no pacote de comparação com IDs incluídos nas mesmas 137 | **RECONCILIAR AO PMO EXISTENTE**, sem reabrir outra fila|
| Normativos | 38 itens no diretório de captura, incluindo 2 arquivos SHA256SUMS; **36/36 hashes verificados**. Inclui PDFs/textos COFEN e capturas da produção | **PROVENIÊNCIA FÍSICA**, não decisão clínica ou regulatória de validade|

## 3. Material que está somente no ZIP de comparação

Das 923 entradas do esqueleto no ZIP: **915 idênticas** aos arquivos soltos em `upload/ce-skeleton`; **2 diferentes** (scripts/check-skeleton.mjs e tests/pilot.test.ts) e **6 presentes apenas no ZIP**. As seis exclusivas da árvore solta são `GAPS-2026-10-31.md` e cinco módulos `src/core/experience/{metamodel,module-status,profile-contracts,resolver,state}.ts`. Esses módulos não existem no `src/core/experience/` da aplicação principal. Os 410 serviços e 201 capabilities documentados não demonstram implantação de runtime. Um relatório do ZIP informa lacunas de bindings entre serviços e capabilities; isso exige validação de integração, não criação de um catálogo paralelo.

## 4. Evidência de pendências no registro PMO (snapshot, não status vivo)

O plano `PLAN-TASKS-PMOKERNEL-v0.1.0 (4).json` contém **137 tarefas distintas**, com **111 PROPOSTO**, **16 BLOCKED**, **9 DONE** e **1 DELIVERED_PENDING_GATE**; `releaseGate: HOLD_HUMAN`. As 22 tarefas de `novas-tasks.json` estão **todas incluídas** nessas 137, logo **não devem ser adicionadas outra vez**. O arquivo é um snapshot: os estados `DONE` não foram revalidados em CI ou Kernel nesta rodada.

O relatório de comparação anexo aponta questões a reconciliar na fila existente: elo serviço→capability (`service_ref`), tipos de objeto sem schema, perfis de conta/entitlement, integração de evidências clínicas, controles de moderação, alegada diferença na interpretação de Aldrete e versão da lista de notificações. Esses pontos são **achados documentados no ZIP**, não alterações implementadas nem comprovação clínica final.

## 5. Problema real das páginas visuais recuperadas

Um auditor estático percorreu links literais (`href`/`src`) em páginas HTML sob `public/bibliotecas/catalog`, `public/templates-piloto` e `public/cko-audit`. Encontrou **5.520 ocorrências de destinos locais não resolvidos** em **251 páginas de catálogo** (1.920 usos de imagem e 3.600 links). Há 250 caminhos de destino distintos. **2.640 ocorrências** apontam para assets que existem quando retiramos o prefixo extra `catalog/`; outras **2.880 ocorrências** se concentram em apenas 10 caminhos de navegação relativos à pasta incorreta (como `index.html` e categorias). Ou seja: os HTML e as imagens foram recuperados, mas o espelho `public/bibliotecas/catalog` não é autocontido no layout atual. Isso é um achado **estático de caminhos do pacote**, não teste HTTP nem afirmação sobre o site live.

As cópias HTML mantêm `noindex`, o que indica visualizações de catálogo não destinadas automaticamente à indexação pública. O conjunto de templates não apresentou essa mesma categoria de quebra nos links literais analisados (não equivale a E2E).

## 6. Riscos anteriores que permanecem

- Os cinco aliases de raiz (`schemas`, `contracts`, `registers`, `audit-run`, `audit-evidence`) eram links simbólicos no TAR anterior, mas **não foram serializados como symlinks nem como arquivos** no novo TAR. A exportação atual não pode ser considerada uma reprodução fiel de todos os caminhos dependentes de aliases; o destino do sistema real deve ser reconciliado.
- `.env` foi preservado. O arquivo contém valores não vazios observados na auditoria anterior: **não incluir seus valores em relatórios, ZIPs de auditoria ou GitHub**; verificar credenciais e exposição.
- O relatório de execução atual mantém **20/21 cenários** e falha `MST-04`; recuperação física dos assets não altera esse resultado. O `releaseGate` segue **BLOCKED**.
- Nenhuma mudança em migrations, schemas ativos, banco Supabase, 83 ferramentas ou execução de 410 serviços foi comprovada por este pacote; a nova contribuição é majoritariamente restauração de fontes, espelhos e evidências. O índice anterior de 56% maturidade / 43% conclusão permanece **estimativa não recalculada**, não indicador comprovado por contagem de arquivos.

## 7. Registro e continuidade — sem demanda paralela

Usar o **inventário canônico transversal já existente**. Consolidar estados para os objetos atuais: `RECOVERED_EXACT`, `ARCHIVED_EVIDENCE`, `DUPLICATE_EXPORT`, `EMBEDDED_ONLY`, `SCHEMA_VARIANT`, `STATIC_PATH_BROKEN`, `PENDING_HOMOLOGATION`. Estes são **rótulos de auditoria**, não novas tabelas, ordens de trabalho ou autorizações. Não reimportar diretamente nem descartar `_archive`; preservar snapshots e SHA. A prioridade prática é realizar a reconciliação dos caminhos e versões já conhecidos, sem criar backlog adicional.

**Escopo da execução:** inspeção de TAR/ZIP e testes estáticos de conteúdo. Nenhuma alteração em `GitHub`, `Supabase`, `Vercel` ou site em produção.