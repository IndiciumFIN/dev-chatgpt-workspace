# Esqueleto CE — Experience Platform + catálogo de serviços (local, 31/10/2026)

**Pedido:** "criar o esqueleto completo localmente incluindo todos os recursos que eu espero".
**Resposta curta:** sim — está feito e verificado. O esqueleto cobre **100% do blueprint** que enviaste, e **nada** dele se declara implementado.

## O que existe agora (medido, local)

| medida | valor | como foi verificado |
|---|---|---|
| famílias de serviço | **45** (36 de domínio + 9 transversais) | catálogo gerado do teu blueprint |
| serviços lógicos | **410** (274 DOMAIN · 97 PLATFORM · 39 CROSS_CUTTING) | `catalog/service-catalog.v1.json` |
| capabilities | **201** em 20 famílias | registo candidato da PR #21, copiado sem alteração |
| bindings por tipo de objeto | **16** | `object-capability-binding.candidate.v0.1.json` |
| schemas do piloto | **3** (Article, LibraryEntity, ClinicalTool) | `schemas/*.v1.json` |
| ficheiros gerados | **905** + núcleo do piloto | `node scripts/generate-skeleton.mjs` |
| testes | **70/70 verdes** (45 família · 20 capability · 5 piloto) | `node --experimental-strip-types --test …` |
| gate de estrutura | **8/8 verdes** | `node scripts/check-skeleton.mjs` |
| drift catálogo↔disco | **zero** | `node scripts/generate-skeleton.mjs --check` |

## A arquitetura da decisão: dados primeiro, código gerado

O erro fácil aqui seria escrever 410 pastas à mão e chamar-lhe "arquitetura". Em vez disso:

1. **O catálogo é a verdade.** `catalog/service-catalog.v1.json` é a fonte única; o código é *derivado* dele.
2. **O gerador é determinístico.** `scripts/generate-skeleton.mjs` reconstrói a árvore inteira e falha se houver drift (`--check`). Ninguém edita ficheiro gerado à mão — edita-se o catálogo.
3. **O gate é fail-closed.** `scripts/check-skeleton.mjs` reprova se: faltar um serviço do catálogo, existir serviço órfão no disco, alguma coisa declarar `PASS`/`APPROVED`/`ADMITTED` sem evidência, faltar capability, faltar binding, faltar schema do piloto, divergir a toolchain, ou as invariantes serem alteradas.
4. **O piloto é executável, o resto é declaração.** Só o piloto tem lógica: `CapabilityResolver` puro (16 tipos, sem UI, sem rede), `ExperienceState` guest-first, 3 schemas JSON. As 201 capabilities são **declarações** — coerentes com o próprio parecer da outra IA ("não codificar 201 capabilities").

## O que cada serviço gerado contém

`src/families/<família>/<serviço>/contract.ts` — id, camada, `status: 'CANDIDATE_HOLD'`, `evidence: null`.
`src/families/<família>/<serviço>/index.ts` — função que **lança** `NOT_IMPLEMENTED_CANDIDATE_HOLD` até existir admissão + evidência. Não há mock que finja sucesso.
`src/families/<família>/<família>.test.ts` — um teste por família que confirma HOLD + ausência de evidência.
`src/capabilities/<família>.ts` — as capabilities da família com `status: 'CANDIDATE'`, contrato de acessibilidade e telemetria obrigatórios.

## Limites (o que este esqueleto **não** é)

- **Não é implementação.** 410 serviços em HOLD; nada executa, nada persiste, nada chama rede.
- **Não é promoção.** `CANDIDATE_HOLD` em tudo; a promoção exige FIND → política → validador → WO → OPA → Kernel → testes → auditoria → decisão humana.
- **Não é o repo canónico.** Vive em `/workspace/ce-skeleton`. Toolchain fixada nos versões canónicas (vite 8.2.0 · react 19.2.0 · lucide-react 0.510.0 · typescript 5.7.0) para poder ser portado sem partir `npm audit --audit-level=high`.
- **Não Creates as 215 tabelas** da especificação DOCX — essa continua a ser proposta, não autorização.
- **Acessibilidade:** sem browser no sandbox ⇒ **NOT_RUN** para teclado/axe/WCAG real. Os contratos estão declarados (`accessibility_contract: REQUIRED`, `telemetry_contract: REQUIRED`), a medição não está feita.

## Como reproduzir

```bash
cd /workspace/ce-skeleton
node scripts/generate-skeleton.mjs        # reconstrói a árvore a partir do catálogo
node scripts/generate-skeleton.mjs --check # falha se houver drift
node scripts/check-skeleton.mjs            # gate fail-closed (8 checks)
node --experimental-strip-types --test $(find src tests -name "*.test.ts" | sort)
```

## O que fica em aberto (decisão do dono, não minha)

1. **Reduzir/mesclar o vocabulário** antes de implementation — o blueprint tem 410 serviços lógicos para 3 domínios maduros; vários sobrepõem-se (`Connector Registry` em Source & Acquisition **e** em Integrations; `Registry Management`/`Policy Registry`/`Workflow Engine` tocam domínios vizinhos). Recomendo fundir por layer antes de admitir qualquer WO.
2. **Qual camada entra primeiro.** A minha recomendação: `Governance` + `Audit & Assurance` + `Observability` (o esqueleto de registo que o próprio Kernel vai exigir), **depois** o piloto `Article`/`LibraryEntity`/`ClinicalTool`.
3. **Portar para o repo canónico ou manter local** até existir WO de admissão. Sem isso, o esqueleto regenera sempre a partir do catálogo e ninguém depende dele para executar.
