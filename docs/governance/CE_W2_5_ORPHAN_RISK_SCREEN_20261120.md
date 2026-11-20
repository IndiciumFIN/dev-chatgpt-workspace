# CE/CKO/NCOS — W2.5: triagem preliminar das 23 branches órfãs

**20/11/2026 — Workspace `main` — somente avaliação e testes.**

O inventário estrutural W2.4 foi concluído e certificado em [índice único](../../registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json), incluindo os seis manifestos integrais, os 23 nomes de branch e os 22 SHAs distintos. Esta fase **não reexecuta árvores**: reutiliza os arquivos versionados, inclusive os SHAs de modo/tipo. Censo W2 histórico permanece imutável.

## Delimitação

- **36.591** ocorrências `E` (bytes Git e modo idênticos) requerem avaliação de pertinência/direitos, mas não recópia automática.
- **25.317** ocorrências `C` são exclusivas da `main` fixada; não reverter alterações atuais por força da branch.
- **30.551 ocorrências D/S/T** entre as 22 origens distintas (2.579 D + 23.335 S + 4.637 T) exigem decisão técnica ou descarte comprovado. São ocorrências repetidas entre fontes, **não arquivos globalmente distintos**.

O [motor W2.5](../../scripts/ce-w2-5-orphan-risk-screen.mjs) computa um resumo por SHA de origem, classificação P0/P1/P2, deduplicação de objetos `path+Git blob SHA+modo` e fila de menor volume. O [teste W2.5](../../scripts/ce-w2-5-orphan-risk-screen.test.mjs) confronta o resultado com as contagens W2.4 e bloqueia afirmações de `SEALED`.

Os critérios para a prioridade são **preliminares**, somente por caminho: P0 para credenciais/auth, Kernel/OPA, CI, migrations, RLS e documentos de evidência/licença; P1 para scripts, fontes, testes e contratos; P2 para ativos estáticos e histórico. Não há autorização de negócio, clínica, publicação, SQL remoto, merge ou descarte por esta triagem.

### Próxima revisão por conteúdo

Começar por branches de menor delta após filtrar P0, usando código/texto de origem e `main` realmente consultados (não decisão por nome). Prioridade de facilidade: `grook_10_26` (47), `fix/ce-route-component-contract-freshness-20261114` (56), `fix/ce-generated-contract-fresh-20261115` (57), `review/grook-na-main` (74). Para cada item registrar `WO`, SHA, licença, equivalência semântica, efeito na `main`, testes e revisão independente.

**Situação:** 23/23 `FULL_DELTA_INVENTORIED`; nenhuma das 48 branches CE/CKO/NCOS foi formalmente `SEALED`. Cross Supabase/Drive e prova de direitos permanecem pendentes. O W2.5 **não** substitui os gates da CE.BRANCH.CLOSURE.v1.
