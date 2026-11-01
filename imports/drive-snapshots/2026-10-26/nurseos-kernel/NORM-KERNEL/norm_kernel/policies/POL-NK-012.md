# POL-NK-012 — Avaliação de Universo na Adoção de Normas/Regras/Padrões (v1.0.0)

**Aprovada por:** diretriz do Leivis (2026-09-29 14:59): "ao optar por alguma
norma/regra/padrão devemos avaliar o universo todo: bibliotecas, dicionários,
camadas, conflitos, nova estrutura etc."

## C1 — Nada é adotado sem avaliar o universo
Adotar qualquer norma/regra/padrão (técnico, normativo, framework de mercado)
exige um UNIVERSE SCAN documentado ANTES da adoção, registrado na CHG
(kind=adoption) e assinado por OS. A OS segue sendo o único ID bloqueante.

## C2 — Universo scan obrigatório (as 5 dimensões)
1. **bibliotecas**: o que existe no espaço (alternativas consideradas e por
   que esta); 2. **dicionários**: impacto no dicionário/metamodelo (termos
   novos? registro prévio POL-NK-006); 3. **camadas**: quais camadas toca
   (dados, kernel, front-end, infra, políticas); 4. **conflitos**: contradições
   com políticas/universais existentes (protocolo de contradição); 5.
   **nova estrutura**: mudanças estruturais necessárias (emendas, gates,
   migrações, rollback).

## C3 — ADR da adoção
Toda adoção produz um ADR (NK-ADR-NNNN) com a conclusão do scan: alternativa
escolhida, motivo, conflitos resolvidos, estrutura criada.

## C4 — Gate G14 estendido (bloqueante)
CHG com kind=adoption SEM universe_scan completo (5 dimensões) ou SEM adr_ref
= run BLOCKED. Adoção estrutural adicionalmente exige emenda (POL-NK-003 C8).

## C5 — Registro canônico
O padrão adotado entra no cânone (POL-NK-009/010) com fonte e licença
verificadas; análise ponto a ponto abre caminho à política formal.

state: Active; severity: blocking; enforcement: gate G14 (pipeline v0.7.3)
