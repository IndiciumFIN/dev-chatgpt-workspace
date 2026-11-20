# Execução da auditoria pública — v0.3.0

**Base única:** backup público parcialmente homologado enviado pelo proprietário. Sem merge, commit, crosswalk ou consulta adicional ao repositório Git.

## Alterações implementadas na cópia

1. `src/routes/ferramentas.$slug.tsx` e `src/routes/assinante.ferramentas.$slug.tsx`: removido fallback de publicação se catálogo administrativo falhar; rotas agora dependem de `row.published` explícito.
2. `src/lib/tools/engine.ts`: valida opções enumeradas nas escalas e rejeita `Infinity`/`NaN` nos campos numéricos.
3. `package.json`: build desacoplado da migração automática; hooks npm e registros de versionamento; comando de triagem de limpeza.
4. `scripts/version-register.mjs`: registros especializados e delta por execução; exclui `.vercel` e saídas geradas do inventário.
5. `scripts/audit-static.mjs`: validador atualizado para checar fallback de ambas as rotas.

## Gates executados

| Gate | Resultado | Evidência |
|---|---|---|
| Integridade do ZIP original | PASS | `unzip -t` sem erro; 204 entradas |
| Inventário inicial | PASS estrutural | 204 caminhos únicos com hashes; sem classificação de aprovação |
| Estático | 8 PASS / 3 FAIL | `node scripts/audit-static.mjs` |
| Typecheck | PASS | `npm run audit:run -- typecheck`, código 0 |
| Build de produção | PASS COM AVISOS | `npm run audit:run -- build`, código 0; deprecated `inputValidator`, avisos de bundling |
| Suíte total | FAIL | Testes exigem `.grok/skills/og/references`, indisponível no backup; demais falhas não quantificadas neste relatório |
| Prévia/visual | BLOCKED_ENV | Node/Vite: `uv_interface_addresses` erro de ambiente |
| Limpeza | DRY_RUN | 3 candidatos; zero exclusões |
| Homologação clínica/segurança/acessibilidade | NOT_RUN | exigem testes dedicados e revisão independente |

## FINDs abertos

- `FIND-001`: administração ainda não detém critérios clínicos, referências, seções e peças; não fechar até fonte total versionada.
- `FIND-006`: faltam testes clínicos de limites, casos-ouro e regressão independentes.
- `FIND-011`: backup não contém `.grok/skills/og/references` referenciado pelos testes; criar fixture compatível ou tornar suíte autocontida mediante validação.
- `FIND-012`: lockfile original incompatível com `npm ci` sob npm 11; `npm install --legacy-peer-deps` conseguiu instalar e atualizar lockfile; validar instalação limpa posterior.
- `FIND-013`: prévia visual impedida por `uv_interface_addresses` neste ambiente; repetir em executor com interfaces de rede disponíveis.
- `FIND-014`: registrador local não suporta escrita concorrente sem sincronização, nem selagem imutável remota.
- `FIND-015`: mapeamento de templates por rota e automação de menus/sitemap ainda incompletos.
- `FIND-016`: remoção de autenticação obrigatória local sem tornar endpoints administrativos públicos permanece pendente de contrato de autorização.

## Próximas operações, na ordem

1. Tornar os testes autocontidos e executar suíte completa de ponta a ponta.
2. Validar a fonte administrativa como autoridade exclusiva, inclusive em falha e despublicação.
3. Criar registro runtime de publicação (`route`, `templateId`, `contractVersion`, `locale`, `published`) e derivar menus, sitemap e breadcrumbs, com testes de rota órfã e redirect.
4. Implementar modo local com armazenamento apenas não sensível e controle de escrita remota independente de login.
5. Executar auditorias detalhadas por página/viewport, inclusive WCAG, SEO, JSON-LD, sustentabilidade e visual-diff.
6. Revisar todos os instrumentos clínicos contra casos-ouro, referências e licença; HOLD_HUMAN para conclusões clínicas.
7. Admission gate e remoção controlada de arquivos somente após garantia de restauração.
8. Homologação independente; crosswalk externo somente após fechamento desta frente e decisão do proprietário.

Não há homologação integral nem evidência de que todas as auditorias originalmente requeridas foram concluídas.
