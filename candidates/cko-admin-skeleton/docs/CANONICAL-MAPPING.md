# Console × Design System canônico (CANDIDATO)

Fonte: *CKO Digital Schema Recovery & DesignOS Integration v2.1* — status `RECOVERED_RECONCILIATION_CANDIDATE`.
Validação estática dos schemas ≠ runtime/release PASS.

- **Hero oficial**: `src/ds/PageHero.tsx` é cópia fiel de `page-hero.tsx` (markup `inst-hero` / `inst-eyebrow` / `inst-lead`, badges). O CSS de `.inst-hero` **não veio no zip**; `admin.css` o estiliza com os tokens do hero da home. Ao integrar ao repositório, remova esse bloco e use o CSS oficial.
- **Mapeamento 37 componentes**: ver módulo *Design System* do console e `src/data/canonical-ds.ts` (1 oficial, 23 candidatos, 13 sem equivalente).
- **142 bindings ObjectFactory ↔ Component/TemplateMaster**: payload linha a linha **não recuperado**; **não reconstruído por inferência**. Próximo passo: recuperar `CKO-ObjectFactory-Bindings-v1.1.json` (hash preservado) e só então ligar módulos a templates.
- **Não verificado**: runtime, render, reperformance visual/E2E contra o site real.
