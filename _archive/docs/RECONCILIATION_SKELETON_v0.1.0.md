# Esqueleto canônico de reconciliação — v0.1.0

**Autoridade desta frente:** o backup da fonte pública parcialmente homologada recebido em 2026-10-19. Não reconciliar com GitHub neste ciclo; o proprietário produzirá o crosswalk ao final.

## Escopo e isolamento

- Base original ZIP: imutável.
- Cópia de trabalho: mudanças isoladas dentro de `ce-audit-work`.
- `audit/baseline/v0.1.0/file-register.json`: inventário de conteúdo por caminho, hash e tamanho.
- `audit/baseline/v0.1.0/route-register.json`: todas as rotas técnicas mapeadas, ainda sem atribuir template presumido.
- `audit/baseline/v0.1.0/template-register.json`: famílias existentes e regra de paridade.
- `archive/`: reservado conceitualmente; **não há movimentação ou exclusão autorizada** até admissão e evidência de integridade.

## Estados controlados

`UNREVIEWED → INVENTORIED → VALIDATED → CANDIDATE → PASS → ACTIVE`.

Alternativas: `FIND`, `CONFLICT`, `QUARANTINE`, `OBSOLETE_CANDIDATE`, `HOLD_HUMAN`. Nenhum estado terminal é atribuído por semelhança de nome.

## Gates

1. Identidade SHA-256 e proveniência por arquivo.
2. Auditoria de completude (arquivos, rotas, referências internas e assets).
3. Contratos canônicos e paridade de componentes por família.
4. Segurança, clínica, acessibilidade, SEO, compatibilidade, UX, performance e sustentabilidade.
5. Triagem: `FIND → política → validador → tarefa → WO → Kernel`.
6. Correção isolada, testes adversariais, auditoria independente, homologação.
7. Apenas após homologação: limpeza lógica da área ativa com archive remoto verificado.
8. Crosswalk GitHub somente na etapa final, sob nova decisão do proprietário.

## Evidências e limites

- O gerador registra **estrutura**, não atesta qualidade de conteúdo.
- Nenhuma rota pode ser declarada funcional por existir um arquivo TSX.
- Nenhuma família pode ser declarada visualmente paritária sem screenshots e comparação por viewport.
- Não armazenar dados de pacientes em localStorage, nem tornar escrita remota pública ao dispensar autenticação de desenvolvimento.
- Publicação exige estado explícito da fonte administrativa; indisponibilidade não significa publicado.

## Comando de reprodução

`node scripts/build-reconciliation-skeleton.mjs`

Depois: `node scripts/audit-static.mjs` (falhas são esperadas até correção).
