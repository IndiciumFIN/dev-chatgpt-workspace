# M08 — Conteúdo canônico e atômico (lote normativo v0.2)

**Data de produção:** 14/11/2026. **Frente principal:** PP06 (evidência e atomização) → PP08 (claims e conhecimento governado) → PP09 (projeção editorial). Esta entrega produz **conteúdo**, não apenas metadados de governança. Porém os objetos ainda são CANDIDATE/EVIDENCE_BOUND/HOLD, sem publicação ou revisão clínica.

## Pipeline efetivamente executado

```text
SOURCE M03 oficial
 → DOCUMENT HTML (SHA-256 validado)
 → EVIDENCE_ATOM (locator + SHA de trecho)
 → CLAIM CANDIDATE (proposição atômica própria)
 → KNOWLEDGE_ATOM CANDIDATE (ID próprio; unapproved)
 → CONTENT_MASTER DRAFT (uma redação reutilizável)
 → ARTICLE / QUIZ / FLASHCARD DRAFT (sem release)
```

**Origem exata:** `SRC-COFEN-736-2024`/`DOC-550c6f44b5147192` e `SRC-ANVISA-RDC36-2013`/`DOC-d5d348a024e19b30`; 33 IDs de átomos de texto M03 sustentam 34 afirmações (o mesmo art. 6º COFEN sustenta dois claims distintos). Os originais permanecem preservados no corpus SQLite protegido, com hash e localização.

## Entregas concretas

- 18 claims sobre **Processo de Enfermagem**, 16 sobre **Segurança do Paciente**; 34 knowledge atoms **candidatos**, 3 conteúdos mestres (Processo de Enfermagem; Segurança do Paciente; Segurança Perioperatória).
- 8 questões comentadas e 10 flashcards com referências às afirmações; não são avaliações oficiais nem protocolos.
- Inventário governado **completo de 28.001 evidence atoms** (metadados sem texto) e **9.102 vínculos topic/evidence CANDIDATE**: 4.142 candidatos ativos por índice, 1.670 condicionais por direitos e 3.290 bloqueados por direitos; 29 legacy claims indexados HOLD.
- Dos 28.001 átomos, 25.694 hashes de texto distintos, 2.307 ocorrências adicionais com hashes repetidos. Deduplicação exige contexto de documento/localizador; nada apagado.
- **Google Drive (protegido):** [M08 full corpus v0.2](https://drive.google.com/file/d/1cuXkb1bCg4lwtFtHL9B9aiANY1ioIhEk/view?usp=drivesdk), SHA `1663f80280684aa005aa58e029c1dabdeba3cd05fb8b15cefccb9abc5c9bfff4`. Inclui autoria derivada e índice completo.
- **GitHub PR #66:** [M08 README/manifest](https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/cko/cardiologia-corpus-editorial-20261114/cko/canonical-content/2026-11-14/m08/README.md) e 34 pares `Claim→Evidence`, sem replicar todo texto.
- **PMO Mestre:** 76 linhas adicionadas e conferidas: `CLAIM_LEDGER` 34; `EVIDENCE_ATOMS` 33; `CONTENT_REGISTER` 3; `SOURCE_REGISTER` 2; `DOCUMENT_REGISTER` 2; `CHANGE_IMPACT` 1; `PMO_MASTER` programa `PMO-014` 1.
- CI [M08 Actions #43575253083](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43575253083) **PASS estrutural de metadados/HOLD**, **não** de schema completo 2020-12 nem de revisão jurídica/clínica.

## O que ainda NÃO foi aprovado
- 0 claims com aprovação clínica/editorial formal, 0 knowledge atoms ASSURED, 0 publicações.
- Norma vigente e eventuais emendas precisam ser conferidas por artigo; em particular regras da RDC 36 art. 10 e obrigações correlatas.
- M03 `DEFAULT_ACTIVE` para texto oficial **não** equivale a autorização de TDM externo ou republicação livre.
- Associações temáticas múltiplas a Centro Cirúrgico/CME/Urgência/Cardiologia são projeções editoriais candidatas, sem currículo institucional homologado nem condutas de prática.
- As 9.102 relações tópico↔evidência foram **indexadas**, não validadas como 9.102 fatos clínicos.
- Os 29 claims legados ainda não foram reavaliados.

## Fila de trabalho concreta (governada)
1. **M08-QA01:** Revisão da vigência e correlação artigo→fragmento→claim para os 34 itens (dupla revisão clínica e legal quando aplicável).
2. **M08-QA02:** Conferir direitos por operação/locale/format de 2 fontes e 3 peças editoriais, inclusive redistribuição de figuras, caso existam.
3. **M08-QA03:** Verificar schema Draft2020-12 e relations `PART_OF/RELATED_TO`, reuso inter-especialidade por contexto e impedir colapso da mesma passagem em um único claim.
4. **M08-QA04:** Revisar 8 questões e 10 flashcards, acessibilidade, idioma e coerência das respostas com as afirmações.
5. **M09:** Planejar lote seguinte com evidência textual verificável para Centro Cirúrgico/CME/Trabalho — **não** inferir afirmações para 885 tópicos sem documentos e passagens vinculados.

**Estado:** B29/B30/B36/B37/B38/B40 em andamento ou draft, B31/B39 sem aprovação; nenhum UPSERT Supabase, nenhum deploy SOT, nenhum merge main.
