# VILA — banco de dados canônico candidato v0.3.0
Status: DESIGN_COMPLETE_CANDIDATE / NOT_APPLIED / KERNEL_HOLD.

## Fontes lidas
- contracts/vila/vila-navigation.v0.2.0.json — nove áreas.
- contracts/vila/vila-content.schema.json — apenas mission/story/emotion, cartão educacional.
- migrations/candidate/vila/0001_vila_candidate.sql — duas tabelas candidatas insuficientes.
- docs/viladocuidado/wo-candidate.v0.1.0.json — Kernel NOT_SUBMITTED, HOLD_HUMAN.

## Arquitetura proposta
O conteúdo é independente da apresentação. Fonte → objeto canônico → traduções, objetivos e evidências → atividade/mecânica → assets/personagens/templates → experiências → saídas WEB/PWA/PDF/impressos/slides.

A nova migration adiciona 21 tabelas no schema privado vila_canonical_candidate; nenhum usuário menor de idade, perfil infantil ou dado clínico é modelado. O progresso infantil permanece local e efêmero por padrão. Sem GRANT para anon/authenticated e com RLS ativa em todas as tabelas.

## Decisão de isolamento
O projeto Supabase acessível pgsybzggewhinaniybiy é Calculadoras-Smart, compartilhado. Sem Kernel WO admitida e designação formal de namespace/destino, não executar migração remota. O outro projeto listado está INACTIVE.

## Gaps funcionais
Esta migration documenta estrutura e chaves, não mecanismos de jogo executáveis, APIs públicas, revisões humanas ou prova de runtime. Campos JSON flexíveis necessitam JSON Schema específico e validação de aplicação antes da promoção. Storage de assets é apenas ponteiro; bytes, direitos, checksums e deploy exigem conciliação. Proibir liberar conteúdo sem evidências e decisão do Kernel.

## Próximos gates
1. Aceite governado da WO; escolha do Supabase/namespace.
2. Aplicar em staging isolado por migration rastreável.
3. Executar SQL para PK/FK, integridade, grants, RLS e CHECK.
4. Vincular conteúdos históricos e seus oito assets originais por SHA, sem inventar conteúdo.
5. Implementar views/API autorizadas, QA e contratos renderer.
