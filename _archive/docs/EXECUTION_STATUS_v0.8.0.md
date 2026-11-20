# Backup público v0.8.0 — isolado, NÃO homologado

## Escopo e proveniência
Única fonte: CE_PUBLIC_BACKUP_WORKTREE_v0.7.0.zip, derivada do backup anexado nesta conversa. GitHub, Supabase e outras frentes não participam; crosswalk suspenso.

## Mudanças
- Novo `src/lib/local-publication-register.ts`: slots `draft` e `published` separados; revisão monotonamente crescente; eventos `DRAFT_SAVED`/`PUBLISHED` com timestamps e ID; importação legada v1 somente como rascunho. Persistência no navegador, não compartilhada entre dispositivos.
- `src/lib/local-canonical.ts` lê exclusivamente o slot `published`.
- `/admin` e `/oficina-local`: botões separados Salvar rascunho / Publicar rascunho salvo, bloqueio de publicação de alterações não salvas, exportação de registro JSON.
- `/assinante` e rotas de ferramenta reagem a atualizações locais (além do evento `storage` entre abas).
- Novo `npm run audit:publication`: verificações estruturais e teste de comportamento em ambiente simulado.

## Evidências e limites
- `node scripts/check-local-publication.mjs`: 9/9 PASS, inspeção estática; não é teste E2E.
- `node --experimental-strip-types scripts/test-local-publication.mjs`: PASS, demonstra isolamento, promoção, log e migração legada.
- `node scripts/check-isolation.mjs`: 7/7 PASS.
- `node scripts/check-context-invariants.mjs`: 7/7 PASS.
- Build, typecheck, E2E visual, acessibilidade, testes clínicos: NÃO EXECUTADOS nesta onda (dependências npm ausentes). Não são PASS.
- Registros em localStorage são auditáveis localmente mas não são trilha inviolável: qualquer usuário do navegador pode alterar/apagar o storage. Não inserir PHI, segredos ou dados pessoais.
- Publicação local é expressa pelo administrador local; NÃO é homologação clínica ou publicação remota.
- O catálogo inicial mantém as ferramentas de base visíveis, como no pacote anterior; um rascunho legado não as sobrescreve até publicação explícita.
- O botão Publicar promove o último rascunho **salvo**. A importação só altera o formulário até salvar.

## FINDs pendentes
FIND-0801: falta gate de aprovação normativa/visual para publicação de conteúdo clínico (não atribuir homologação à promoção local).
FIND-0802: log local mutável; precisa de exportações assinadas/manifestos externos antes de alegar não repúdio.
FIND-0803: ausência de instalação de dependências e ambiente E2E, sem paridade visual verificada.
FIND-0804: nem todas as páginas do site consumem projeções do catálogo local, requer inventário e contratos por família.
