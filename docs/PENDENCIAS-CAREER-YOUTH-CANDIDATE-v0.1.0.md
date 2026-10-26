# Pendências — Career + Youth DB-first Candidate v0.1.0

**Branch:** `feat/career-youth-db-first-20261026`  
**Base:** `main`  
**Estado:** CANDIDATE / HOLD_HUMAN  
**Kernel admission:** NOT_SUBMITTED

> Escopo exclusivo de Carreira + Portal do Jovem. Itens já materializados no banco/schema/runtime não devem ser reabertos sem novo FIND.

## P0 — bloqueios para promoção

### Admissão formal pelo Kernel
- `WO-CAREER-YOUTH-001` ainda não foi submetida/admitida.
- Critério: admissão pelo mecanismo autorizado, policy/validator/manifest resolvidos e evidência persistida.

### Revisão humana do domínio
- Revisar taxonomias de papéis, skills, trilhas, oportunidades, credenciais, linguagem para jovens e separação editorial/funcional.
- Critério: aceite humano registrado ou FINDs documentados.

### Fontes e aplicabilidade
- Qualificar requisitos profissionais, formação, credenciais, trabalhista e jurisdição.
- Não promover requisito genérico como regra universal.

## P1 — dados externos atuais

### Vagas, concursos, residências, estágios, bolsas, voluntariado e pesquisa
- Modelo de tipo + ocorrência + Source + Authority Binding + Ingestion Run concluído.
- Deduplicação, validade/expiração, provenance e validator de lote estão materializados.
- **Falta:** executar aquisição real a partir de fontes públicas elegíveis, qualificar cada fonte e operar atualização/expiração recorrente.
- Nenhuma oportunidade real deve ser inventada.

### Cursos e educação permanente
- Tipos + registros reais source-bound + dedupe/validade concluídos.
- **Falta:** aquisição real do catálogo atual com instituição, disponibilidade, modalidade, direitos/licença e fonte qualificada.

### Mercado e salários
- Sinal + `CareerMarketObservation` concluídos, separando `POSTED_SALARY`, `OFFICIAL_STATISTIC`, `SURVEY_ESTIMATE` e `MARKET_INDEX`.
- **Falta:** aquisição de fontes atuais por localidade/papel e revisão metodológica antes de promover valores.

### Carreira internacional
- Contrato de jurisdição concluído.
- Falta materializar país a país: idioma, reconhecimento de formação, registro/licenciamento e autorização de trabalho por fonte oficial.

## P1 — funções que dependem de governança adicional

### Networking e mentoria
- Capacidades modeladas em HOLD_HUMAN.
- Exigem identidade/autenticação, privacidade, moderação, denúncia, bloqueio, consentimento e controles contra abuso antes de runtime multiusuário.

### Ferramentas trabalhistas e escala
- Capacidades modeladas em HOLD_HUMAN.
- Exigem contratos normativos, regras temporais, jurisdição e vetores de teste próprios.

### Sala de descompressão / bem-estar
- Capacidade modelada em HOLD_HUMAN.
- Conteúdo deve ser educativo, não diagnóstico, com critérios seguros de encaminhamento.

## P1 — conteúdo editorial

Ainda precisam de conteúdo qualificado, revisão e templates de publicação:
- Meu Primeiro Plantão;
- Fui Aprovado;
- Valorização profissional;
- Carreira em Y;
- negociação e posicionamento;
- conteúdos de descoberta do Portal do Jovem;
- saúde para jovens;
- guias de formação, primeiro emprego, entrevistas, LinkedIn, portfólio e empreendedorismo.

Os registros candidatos existem no banco quando já definidos; texto final não deve ser inventado para preencher slots.

## P2 — experiências e outputs

- Contratos de projeção WEB/PDF/PRINT para currículo/carta/portfólio estão materializados e ligados aos schemas CKO de `projection` / `projection_request`; os gates A11y/Human continuam HOLD antes de habilitar exportação final. DOCX ainda requer contrato/canal específico.
- Jogos/quizzes do Portal do Jovem estão modelados; conteúdo/regras ainda precisam ser qualificados.
- Comparador já consome papéis/skills do banco; cobertura de requisitos por papel ainda é parcial.
- Passaporte profissional candidato é pseudônimo; produção exige decisão sobre persistência e identidade.
- Integração Carreira ↔ Research Hub deve ocorrer por contratos/refs, não por cópia de dados.
- Integração com cursos, simulados, biblioteca e certificações precisa usar bindings canônicos.

## QA antes de release candidato

- auditoria WCAG completa;
- revisão visual humana;
- threat model / abuso / spam;
- política de retenção e exportação;
- i18n e jurisdição;
- browser QA em preview implantado.

## Fechado nesta wave — não reabrir sem FIND

- banco candidato DB-first;
- projeções PROFESSIONAL e YOUTH no mesmo banco;
- separação funcional/editorial;
- passaporte pseudônimo;
- skill graph + gap;
- role/path graph;
- opportunity type graph;
- application tracker;
- credenciais;
- documentos como projeção do passaporte;
- sinais de mercado sem valores inventados;
- learning resource types;
- interview scenarios;
- network capability contracts;
- jurisdiction requirement contracts;
- worklife capability contracts;
- youth activity contracts;
- Portal do Jovem;
- reflexão educativa não psicométrica;
- rotas candidatas e estado de publicação;
- schemas/registry/gate/CI/E2E candidato;
- source/evidence acquisition layer;
- authority binding por campo;
- ingestion runs;
- objetos reais de oportunidade/curso/observação de mercado sem dados inventados;
- validator de lote com SHA-256, dedupe e validade;
- projection contracts ligados ao CKO;
- governança DB de identidade/consentimento/moderação/denúncia/bloqueio.
