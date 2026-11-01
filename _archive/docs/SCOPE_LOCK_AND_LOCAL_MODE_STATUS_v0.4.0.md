# Scope Lock e auditorias locais — v0.4.0

**Fonte única:** ZIP do backup público parcialmente homologado. O repositório GitHub e o crosswalk futuro estão fora do escopo.

## Implementações

1. `AGENTS.project.md`: 10 invariantes anti-confusão e antialucinação. Evidências têm de ser locais; não reutilizar passes/WO/kernel de outras versões.
2. `scripts/check-context-invariants.mjs`: 7 controles de identidade e preservação do baseline, executados: 7 PASS.
3. `scripts/audit-navigation-contracts.mjs`: inventário estático de rotas, links literais e famílias de templates. Resultado: 21 rotas TSX, 17 links literais verificados, 0 literais irresolvidos; atribuições de template ainda NOT_VERIFIED.
4. `package.json`: comandos `audit:context` e `audit:navigation` adicionados.

## BLOQUEIO DE SEGURANÇA

A alteração proposta para deixar o modo sem autenticação ativo por padrão e dispensar guardas admin/member foi rejeitada por risco de exposição de operações privilegiadas em implantação. **O patch rejeitado não foi aplicado.** Não contornar a restrição com outro caminho.

Decisão necessária do proprietário: a aplicação em produção deverá preservar autenticação obrigatória para mutações administrativas, enquanto uma ferramenta **separada, exclusivamente local e sem endpoints privilegiados** poderá editar conteúdo de demonstração em `localStorage`? Sem confirmação, não alterar os guards.

## Situação

- `localStorage` administrativo: NÃO IMPLEMENTADO.
- Rotas/menu/sitemap completamente automáticos: NÃO IMPLEMENTADOS.
- Visual diffs, WCAG manual, performance em browser, testes clínicos independentes: NÃO CONCLUÍDOS.
- Nenhum acesso ou mudança ao GitHub nesta execução.

## Regras anti-alucinação operacionais

Uma resposta não pode dizer "PASS" por inspeção incompleta, assumir ambiente de produção equivalente ao local ou inferir aprovações antigas. Sempre reportar escopo, comando, resultado, limites e estado remanescente.
