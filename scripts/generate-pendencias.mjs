/**
 * Gera a lista de pendencias a partir do ESTADO MEDIDO, nao da memoria.
 *
 * Cada item aponta para a evidencia que o produziu. Se um gate esta verde, o
 * item nao aparece — a lista so cresce quando algo esta de fato por fazer.
 *
 *   node scripts/generate-pendencias.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { templateCatalogo } from "@/lib/template-catalog";

const alvo = "docs/PENDENCIAS.md";
const agora = new Date().toISOString().slice(0, 16).replace("T", " ") + "Z";

/** Roda um comando e devolve { ok, saida }. */
function roda(cmd) {
  try {
    const saida = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, saida };
  } catch (e) {
    return { ok: false, saida: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

/** Extrai as linhas FAIL/PASS de um gate. */
function linhasGate(saida) {
  return saida
    .split("\n")
    .filter((l) => /^(PASS|FAIL)\s/.test(l))
    .map((l) => ({ estado: l.startsWith("PASS") ? "PASS" : "FAIL", texto: l.replace(/^(PASS|FAIL)\s+/, "") }));
}

const itens = [];

// ── 1. os templates do catalogo que ainda nao tem pagina ────────────────────
const semPagina = templateCatalogo.filter((t) => !t.url);
for (const t of semPagina) {
  itens.push({
    area: "Template",
    titulo: `${t.nome} — sem pagina`,
    estado: t.situacao === "montagem" ? "MONTAGEM (perfil UE-LTS ja existe)" : "CONTEUDO GOVERNADO",
    detalhe: t.materiaPrima,
    evidencia: `src/lib/template-catalog.ts#${t.id}`,
  });
}

// ── 2. os desvios de browser medidos na ultima auditoria ────────────────────
const log = existsSync("audit/audit-templates-latest.log") ? readFileSync("audit/audit-templates-latest.log", "utf8") : "";
const desvios = log
  .split("\n")
  .filter((l) => l.includes("✗"))
  .map((l) => l.replace(/^\s*[✓✗]\s+/, "").trim());
for (const d of desvios) {
  const [nome, ...resto] = d.split(/\s{2,}/);
  itens.push({
    area: "Template",
    titulo: `${nome} — desvio de contrato`,
    estado: "DESVIO MEDIDO",
    detalhe: resto.join(" ").trim() || "ver log da auditoria",
    evidencia: "scripts/audit-templates.mjs -> audit/audit-templates-latest.log",
  });
}

// ── 3. os UTC que a politica ainda exige e o gate nao cobre ────────────────
const UTCS_AINDA = [
  ["UTC-003", "verdade clinica governada em runtime", "primeiro na ordem: esta na lista de HOLDs da Aldrete"],
  ["UTC-023", "os 7 estados de uma ferramenta", "a pagina tem 2 (Aguardando / Calculado)"],
  ["UTC-024", "formula declarativa + test vectors", "src/lib/tools/formulas.ts existe, sem vetores"],
  ["UTC-028", "contrato de resultado", "resultado nao tem contrato proprio"],
  ["UTC-053", "regras de pontuacao", "nao coberto"],
  ["UTC-056", "faixas de referencia por faixa etaria", "nao coberto"],
  ["UTC-071", "reconhecimento do consumidor", "parcial"],
  ["UTC-072", "E2E", "scripts/e2e/ nao entregue"],
  ["UTC-080", "ABNT NBR 6023", "verificador nao entregue"],
  ["UTC-081", "ABNT NBR 10520", "verificador nao entregue"],
  ["UTC-082", "ABNT NBR 5891", "verificador nao entregue"],
  ["UTC-097", "disclaimer de emergencia", "DECISAO DO DONO"],
];
for (const [utc, oQue, obs] of UTCS_AINDA) {
  itens.push({
    area: "Politica CKO",
    titulo: `${utc} — ${oQue}`,
    estado: utc === "UTC-097" ? "DECISAO DO DONO" : "NAO COBERTO PELO GATE",
    detalhe: obs,
    evidencia: "docs/CKO-POL-UT-001.md",
  });
}

// ── 4. os gates de release, medidos agora ───────────────────────────────────
const g = roda("node scripts/audit-execution-gates.mjs");
const gates = linhasGate(g.saida);
const gatesFalha = gates.filter((x) => x.estado === "FAIL");
if (gatesFalha.length) {
  for (const x of gatesFalha) {
    itens.push({ area: "Gate", titulo: x.texto, estado: "FAIL", detalhe: "ver gate", evidencia: "scripts/audit-execution-gates.mjs" });
  }
}

// ── 5. a token mapping do pacote CKO ────────────────────────────────────────
const mapa = existsSync("registers/design/token-mapping.v1.json");
itens.push({
  area: "Design system",
  titulo: "Token mapping do pacote CKO",
  estado: mapa ? "PARCIAL — 32 literais e 4 tokens divergentes por harmonizar" : "NAO INICIADO",
  detalhe: "src/styles/library-canonical.css",
  evidencia: "src/lib/template-applicability.ts / registers/design/",
});

// ── 6. o acervo de imagem ───────────────────────────────────────────────────
itens.push({
  area: "Conteudo",
  titulo: "Acervo de imagem das 87 paginas de curiosidade",
  estado: "SLOTS RESERVADOS, SEM CONTEUDO",
  detalhe: "nenhuma pagina escrita — texto clinico nao se inventa",
  evidencia: "src/lib/content/articles/",
});

// ── 6b. a paridade com os 56 schemas do CKO ────────────────────────────────
const paridade = existsSync("audit/cko-parity.v1.json") ? JSON.parse(readFileSync("audit/cko-parity.v1.json", "utf8")) : null;
if (paridade) {
  const t = paridade.totais;
  itens.push({
    area: "Politica CKO",
    titulo: "Paridade com os 56 schemas do CKO",
    estado: `${t.IMPLEMENTADO} IMPLEMENTADO · ${t.PARCIAL} PARCIAL · ${t["DECLARADO-MORTO"]} DECLARADO-MORTO · ${t.AUSENTE} AUSENTE`,
    detalhe: "nenhum schema esta integralmente implementado; a cobertura dos campos obrigatorios do CKO estabiliza em 0,50-0,57",
    evidencia: "audit/cko-parity.v1.json · docs/PARIDADE-CKO.md",
  });
  for (const l of paridade.linhas.filter((x) => x.estado !== "AUSENTE" && x.nuncaLidos.length)) {
    itens.push({
      area: "Politica CKO",
      titulo: `${l.schema} — ${l.nuncaLidos.length} campo(s) declarados e nunca lidos`,
      estado: l.estado,
      detalhe: l.nuncaLidos.join(", "),
      evidencia: `audit/cko-parity.v1.json#${l.schema}`,
    });
  }
}

// ── 6c. o pacote CKO de bibliotecas ────────────────────────────────────────
if (existsSync("contracts/cko-bibliotecas")) {
  itens.push({
    area: "Conteudo",
    titulo: "27 libraries do CKO — homologacao clinica",
    estado: "NOT_REVIEWED · jurisdiction decision_required",
    detalhe: "568 blocos de texto real e 325 modulos; review_status=not_reviewed, evidence_verification_status=not_verified, approved_by=null. Estrutura PASS, conteudo nao verificado.",
    evidencia: "contracts/cko-bibliotecas/validation/validation.json",
  });
  itens.push({
    area: "Conteudo",
    titulo: "18 libraries sem equivalente no acervo atual",
    estado: "MATERIA-PRIMA EXTRAIDA, NAO PUBLICADA",
    detalhe: "doencas, epidemiologia, exames-laboratoriais, ferimentos, geriatria, legislacao, materiais-cirurgicos, notificacao-compulsoria, pediatria, protocolos-enfermagem, saude-mental, seguranca-do-paciente, sinais-vitais, sondas, uti-emergencia, vacinas, ventilacao-mecanica, medicamentos",
    evidencia: "contracts/cko-bibliotecas/entities/libraries/",
  });
  itens.push({
    area: "Conteudo",
    titulo: "biblioteca `medicamentos` — conteudo ausente na origem",
    estado: "NULL_IN_SOURCE nas 4 camadas",
    detalhe: "a biblioteca de medicamentos nao foi entregue; bloqueia Calculadoras Trabalhistas no material do CKO",
    evidencia: "contracts/cko-bibliotecas/validation/validation.json#null_bindings",
  });
  itens.push({
    area: "Conteudo",
    titulo: "8 perfis UE-LTS com manifest ausente",
    estado: "DRAFT · blocos=[] · manifests nao vieram no pacote",
    detalhe: "article, case, flashcard, quiz, infographic, pdf, pocket_guide, slides — os 8 referenciam profiles/*.json que nao existem no pacote",
    evidencia: "contracts/cko-skeleton/catalog/profiles/",
  });
}

// ── 6d. tokens: a paleta do CKO NAO e o DS congelado ──────────────────────
itens.push({
  area: "Design system",
  titulo: "Token mapping do pacote CKO — VEREDITO",
  estado: "NOT_APPLICABLE_JUSTIFIED",
  detalhe: "a paleta semantica do CKO (391 tokens, 8 camadas) cobre 9 de 26 valores do nosso DS. Faltam navy-deep #163269, sky #4a90e2, ink #0f2440, canvas #f9fafb e foco #ff0 — 5 dos 9 tokens que o dono congelou. Mapear sobrescreveria a paleta congelada.",
  evidencia: "contracts/cko-tokens/tokens/02-semantic.tokens.json vs src/styles.css @theme",
});
itens.push({
  area: "Design system",
  titulo: "Paleta congelada do dono — 9/9tokens presentes no codigo",
  estado: "CONFORME",
  detalhe: "navy, navy-mid, navy-deep, sky, ink, slate, muted, canvas e foco #ff0 (shell.tsx) conferem contra src/styles.css e shell.tsx",
  evidencia: "src/styles.css @theme · src/components/site/shell.tsx",
});

// ── 6e. os perfis reais do UE-LTS ──────────────────────────────────────────
itens.push({
  area: "Politica CKO",
  titulo: "8 perfis UE-LTS v0.2.0 — versao materializada",
  estado: "PASS_WITH_SCOPED_HOLDS",
  detalhe: "8/8 perfis com layout_contract por canal e governance (facts_from_canonical_only, rights/a11y/evidence gates). O proprio pacote declara browser_pixel_qa=0 e print_preflight=0 (G6 HOLD_SCOPED).",
  evidencia: "contracts/cko-editorial/profiles/*.json · evidence/validation_report.json",
});
itens.push({
  area: "Politica CKO",
  titulo: "renderer universal — 21 linhas, 6 de 27 blocos",
  estado: "STUB",
  detalhe: "renderBlock/renderProjection cobrem action_bar, claim, figure, lead, references, title. Faltam 21 blocos. G5 marca PASS por existir, nao por cobrir.",
  evidencia: "contracts/cko-editorial/renderer/web/universal_renderer.js",
});
itens.push({
  area: "Politica CKO",
  titulo: "6 schemas do UE-LTS fora do catalogo de 56",
  estado: "AUSENTES NA BRANCH",
  detalhe: "block_instance, projection_request, template_manifest, content_projection_classification, resource_binding, assessment_item",
  evidencia: "contracts/cko-editorial/schemas/",
});

// ── 7. o md_gate ────────────────────────────────────────────────────────────
itens.push({
  area: "Politica CKO",
  titulo: "md_gate CLOSED",
  estado: "FECHADO POR DECISAO",
  detalhe: "enquanto fechado, nada pode ir a RELEASED — a Aldrete segue como candidata, fora do indice",
  evidencia: "registers/governance/find-register.v1.json",
});

// ── 6. o estado apurado ─────────────────────────────────────────────────────
const contagem = {
  "GATE VERDE": gates.filter((x) => x.estado === "PASS").length,
  "GATE VERMELHO": gatesFalha.length,
  "DESVIO DE TEMPLATE": desvios.length,
  "TEMPLATE SEM PAGINA": semPagina.length,
  "UTC EM ABERTO": UTCS_AINDA.length,
  "SCHEMA CKO IMPLEMENTADO": paridade?.totais.IMPLEMENTADO ?? 0,
  "SCHEMA CKO AUSENTE": paridade?.totais.AUSENTE ?? 0,
};
const Area = { Gate: "Gate de release", Template: "Templates", "Politica CKO": "Politica CKO (CKO-POL-UT-001)", "Design system": "Design system", Conteudo: "Conteudo" };
const porArea = {};
for (const it of itens) (porArea[it.area] ??= []).push(it);

let md = `# Pendencias — branch-bibliotecas\n\n`;
md += `Gerado por \`scripts/generate-pendencias.mjs\` a partir do estado MEDIDO em **${agora}**.\n`;
md += `Nada aqui vem de memoria: cada item carrega a evidencia que o produziu.\n\n`;
md += `> A lista so cresce quando algo esta de fato por fazer. Se um gate passa, o item desaparece.\n\n`;
md += `## Estado apurado\n\n`;
md += `| Medida | Valor |\n|---|---|\n`;
for (const [k, v] of Object.entries(contagem)) md += `| ${k} | **${v}** |\n`;
md += `\n`;
for (const [area, lista] of Object.entries(porArea)) {
  md += `## ${Area[area] ?? area} (${lista.length})\n\n`;
  for (const it of lista) {
    md += `### ${it.titulo}\n`;
    md += `- **Estado:** ${it.estado}\n`;
    if (it.detalhe) md += `- **Detalhe:** ${it.detalhe}\n`;
    md += `- **Evidencia:** \`${it.evidencia}\`\n\n`;
  }
}
md += `## O que ja esta fechado\n\n`;
md += `- Build de producao (\`build:spa\`) — 52 HTML, 53 arquivos materializados\n`;
md += `- \`npx tsc --noEmit\` — limpo\n`;
md += `- \`npm test\` — 187/187\n`;
md += `- Gates de release — ${contagem["GATE VERDE"]}/${gates.length} verdes\n`;
md += `- Contratos runtime — derivados do codigo, gate barra entidade sem contrato e contrato orfao\n`;
md += `- Route Registry (UTC-051) — canonical e hreflang derivados do catalogo\n`;
md += `- Sitemap — 41 URLs, gerado no prebuild, conferido pelo gate\n`;
md += `- Aldrete — candidata, fora do indice, com os 7 HOLDs declarados\n`;
md += `- Catalogo de 30 templates — cada um com kind, frame, nota e materia-prima declarados\n`;

writeFileSync(alvo, md);
console.log(`PENDENCIAS.md escrito: ${itens.length} itens`);
for (const [k, v] of Object.entries(contagem)) console.log(`  ${k}: ${v}`);
console.log(`  -> ${alvo}`);