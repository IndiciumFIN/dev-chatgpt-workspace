# Roadmap — área administrativa governada

Este registro acompanha o plano em [`docs/PLANO-ADMINISTRACAO-GOVERNADA.md`](docs/PLANO-ADMINISTRACAO-GOVERNADA.md). Os itens descrevem resultados do produto, não aprovam execução externa, alteração de registros de governança, uso de material protegido ou publicação clínica.

## Entregues nesta revisão de interface

- [x] **Plano e painel administrativo:** apresentar a arquitetura completa por jornada; usar contagens apenas quando derivadas de registros identificados; diferenciar dados versionados, somente leitura, persistência local e capacidade ainda não conectada; manter links para as telas que já existem.
- [x] **Navegação e UI responsiva:** agrupar Governança, Organização, Conhecimento, Publicação e Impacto; dar prioridade ao plano na entrada; preservar foco, teclado, alvos de toque, leitura em celular e linguagem clara.
- [x] **Documento de planejamento versionado:** manter no repositório a arquitetura funcional, o metamodelo proposto, os fluxos e a matriz de implementação atual versus planejada.

## Revisão do mockup Commander

- [x] **Commander coerente com o site:** adaptar monitor de OS/snapshot, contexto, composer local, gates, lanes e evidências ao `AdminConsole`/`PmoPanel`/`CommanderPanel` existentes; mostrar fonte e data do snapshot; deixar envio, despacho, aprovação e publicação realmente desabilitados e explicar o motivo fora de cada controle; não declarar run ou elegibilidade sem evidência.
- [x] **Design System oficial preservado:** usar os tokens congelados, tipografia, foco, raios e componentes canônicos do site; não importar a skin monocromática `NOT_HOMOLOGATED` nem reintroduzir cores rejeitadas; manter responsividade e alvos de toque.
- [x] **Crosswalk não inventado:** identificar que os 4 grupos/13 seções desta navegação são apenas a organização administrativa local; manter a matriz 7 macrogrupos/22 módulos em aberto até receber a fonte canônica, sem associar IDs ou destinos.
- [x] **Pacote candidato isolado:** não copiar seu `src/App.tsx` nem tratá-lo como autoridade de execução; a revisão de integridade encontrou 1 divergência entre 36 hashes declarados, e o pacote registra `review.approved=false` e `releaseAuthorized=false`.

## Entregues na revisão de 2026-10-31 (modo local, sem backend)

- [x] **Motor determinístico de impacto (biblioteca):** `src/lib/impact/impact-engine.ts` — grafo explícito com arestas validadas e versionadas (sugestões não propagam), classificação por regras (campo desconhecido = `indeterminada`), matriz de severidade **proposta** (`approved:false`), caminho e motivo por ativo, chave idempotente `evento+versão+ativo`, ledger com falha/retentativa, rascunhos de OS de triagem agrupados, validação da decisão humana (Maker ≠ Checker, justificativa e evidência por severidade) e cobertura com denominador. Verificado por `scripts/test-impact-engine.mjs` (17 cenários, incluindo os listados em "Controles de qualidade"). **Limite:** sem persistência, fila de eventos, dados reais nem tela de decisão; não cria OS, não altera nem suspende páginas.
- [x] **Shell global em modo local:** `AdminTopbar` com contexto, busca de módulos, ajuda, indicador de ambiente, sino e menu de perfil. O sino conta só ordens registradas em `HOLD_HUMAN`/`BLOCKED` (fonte e revisão exibidas; sem ler/adiar/resolver). O menu declara "sem identidade neste ambiente" e **Sair** fica desabilitado com motivo textual — não há usuário nem logout simulados.
- [x] **Listas (PMO):** busca por texto/ID sem acento, filtros visíveis de situação, chips removíveis, "Limpar tudo", ordenação, paginação, contagem com fonte/revisão e estado vazio (`src/lib/admin/list-query.ts`, `scripts/test-list-query.mjs`). Demais listas (fontes, templates, impactos, auditoria), colunas e preferências pessoais seguem abertos.

## Resultados ainda abertos — dependem de contratos, dados e autorização próprios

- [ ] **Governança central operacional:** mapear COSO, COSO para gestão de risco de IA (nome/edição a confirmar), COBIT, normas ISO e políticas a controles/evidências; distinguir OPA de referencial e só declarar integração/conformidade após prova.
- [ ] **Commander conectado:** receber objetivo e escopo, preparar plano, validar OS/políticas/manifesto no Kernel e encaminhar somente a agente/equipe registrada após autorização; registrar modelo, ferramentas, limites e evidências. O LLM não decide impacto clínico/legal nem aprova publicação.
- [ ] **Ordens, PMO e agenda duráveis:** criar/atribuir OS, separar responsável/aprovador, manter dependências, critérios, evidências e eventos; derivar agenda apenas de datas e SLAs aprovados.
- [ ] **Fontes, extração e átomos:** registrar identidade, direitos, edição, vigência, snapshot, diff, dispositivos e extrações; revisar átomos e vínculos antes de usá-los.
- [ ] **Composição e configuração do site:** administrar workflow, idioma, navegação, slug/rotas, SEO, JSON-LD, templates, manifesto, aprovação, preview, publicação, retirada e rollback por versões canônicas.
- [ ] **Detecção de impacto (integração):** o motor de biblioteca existe e está testado (ver acima); falta persistir o grafo (`dependencia_conteudo`, `versao_normativo`, `evento_mudanca`), fila durável/outbox, aprovação da matriz de severidade pelos donos, tela de comparação/decisão e painel de cobertura. Objetivo original: propagar mudanças por dependências versionadas e idempotentes; mostrar caminho e motivo por ativo; permitir decisão humana justificada e abrir/remediar OS sem reescrita automática.
- [ ] **Identidade, persistência e auditoria:** decidir explicitamente o modelo de acesso e backend; implementar trilha compartilhada/imútavel e autorização no servidor antes de habilitar mutações remotas. Autenticação e banco continuam desligados no baseline.

## Front-end administrativo completo — planejamento solicitado

- [ ] **Shell global e navegação (parcial — topbar local entregue):** faltam título/estado do dado/ação primária contextual por página e alertas reais com contador por evento. Escopo original: criar topbar compacta com marca/contexto, breadcrumb, busca global, ajuda, indicador de ambiente, sino de alertas com contador real e avatar/menu; manter sidebar agrupada no desktop e drawer acessível no mobile; dar título, estado do dado e ação primária contextual a cada página.
- [ ] **Perfil, configurações e saída (parcial — estado honesto entregue):** falta identidade real, preferências, sessões e logout efetivo, que dependem de backend/RBAC. Escopo original: prever avatar com identidade/equipe/papel, preferências pessoais, notificações, segurança/sessões e **Sair**; encerrar sessão real, proteger rascunhos não salvos e redirecionar. Separar preferências do usuário de configurações sistêmicas de Governança/Publicação. No modo local, não inventar usuário/sessão nem simular logout.
- [ ] **Listas, filtros e busca (parcial — PMO entregue):** faltam as demais listas, colunas e visualizações alternativas. Escopo original: fornecer busca por texto/ID, filtros visíveis e avançados, chips removíveis, limpar, contagem com fonte, ordenação, paginação, colunas, estados de carregamento/erro/vazio/sem permissão e ações por linha; adaptar os filtros aos campos reais de OS, fontes, átomos, templates/páginas, impactos e auditoria.
- [ ] **Visualizações adequadas ao dado:** oferecer tabela como padrão, cartões para resumo/mobile, quadro só com workflow canônico, calendário somente com datas registradas, timeline para eventos e grafo para dependências; permitir preferências pessoais de filtros/colunas sem alterar políticas globais.
- [ ] **Formulários e CRUD governado:** apresentar **Novo**, **Abrir/Visualizar**, **Editar**, **Duplicar como rascunho**, **Salvar**, **Cancelar/Descartar**, **Solicitar revisão**, **Arquivar/Retirar**, **Aprovar** e **Publicar** apenas quando válidos para o objeto, permissão e estado; labels sempre visíveis (placeholder nunca substitui label), obrigatório/opcional, ajuda, origem, validação inline e resumo com foco no primeiro erro; confirmar descarte e preservar rascunho. Versões normativas e evidências não são sobrescritas nem apagadas: preferir versionar, substituir, arquivar ou revogar conforme contrato.
- [ ] **Detalhes e abas contextuais:** mostrar ID, tipo, estado, versão, responsável e ações; organizar Visão geral, Dados, Relações, Workflow/Aprovações, Versões/Diff e Evidências/Auditoria; manter navegação por teclado, estado selecionado não dependente só de cor, URL compartilhável e retorno à lista com filtros preservados.
- [ ] **Central de alertas baseada em eventos:** distinguir severidade por texto/ícone, origem, data, responsável, estado e ação; permitir leitura/adiamento/resolução auditáveis somente quando houver eventos, prazos e persistência reais. Não fabricar avisos ou SLAs.
- [ ] **Permissão e ativação honesta:** toda mutação deve ser revalidada pelo backend; a UI não usa botão oculto ou `localStorage` como autorização. Enquanto identidade, RBAC, backend e workflow não existirem, não habilitar CRUD remoto, alertas sincronizados, avatar de usuário ou logout fictício; exibir modo local e motivo do bloqueio.

## Limite de leitura

O painel local de PMO, catálogo de templates, editor/publicação em `localStorage` e rascunho Commander em memória não equivalem aos resultados abertos acima. Manter essa distinção nas telas e nos relatos de progresso.
