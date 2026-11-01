export const contentKinds = ["instrumento", "biblioteca", "guia", "editorial", "norma", "institucional", "pagina", "simulado"] as const;

export type ContentKind = (typeof contentKinds)[number];

const instruments = new Set([
  "adicional-noturno", "aldrete", "apache", "apgar", "asa", "balancohidrico", "ballard", "barthel", "berg", "bishop",
  "bps", "braden", "calculo-de-ferias", "calculo-hora-extra", "calculo-rescisao", "cam", "capurro", "cincinnati",
  "classificacao_wifi", "copsoq", "copsoq-curta", "copsoq3", "cornell", "cries", "curb-65", "dimensionamento",
  "dimensionamento-cofen", "downes", "downton", "elpo", "escalanumerica", "exames_laboratoriais", "exames-laboratoriais", "fast", "flacc",
  "four", "fugulin", "gasometria", "gds", "gestacional", "glasgow", "gosnell", "gotejamento", "hamilton", "hendrich",
  "humpty", "imc", "insulina", "johns", "jouvet", "katz", "lachs", "lanss", "lawton", "manchester", "matriz-de-risco",
  "medicacao", "medicamentos", "meem", "meows", "moca", "morse", "news", "nihss", "nips", "norton", "ofras", "painad",
  "pelod", "perroca", "pews", "prism", "qsofa", "ramsay", "rancholosamigos", "richmond", "saps", "silverman",
  "sistema_sinbad", "sofa", "tinetti", "waterlow", "zarit",
]);

const institutional = new Set([
  "missao", "objetivo", "termos", "politica", "reembolso", "mapa-do-site", "fale", "tecnologiaverde",
  "responsbilidade_inteligencia_artificial", "auditoria_governanca_regulatoria", "boas_vindas_assinante",
  "conteudos-do-site", "conteudos_da_pagina",
]);

const dropped = new Set(["404", "header", "ativar-admin", "offline", "metricas", "centro-cirurgico.min"]);

const formToInstrument: Record<string, string> = {
  formulario_morse: "morse",
  formulario_bishop: "bishop",
  formulario_bps: "bps",
  formulario_cam: "cam",
  formulario_capurro: "capurro",
  formulario_de_fugulin: "fugulin",
  formulario_escala_cincinnati: "cincinnati",
  formulario_escala_curb65: "curb-65",
  formulario_meem: "meem",
  "formulario-de-meem": "meem",
  fotmulario_escala_de_perroca: "perroca",
};

for (const slug of instruments) {
  const compact = slug.replace(/-/g, "");
  formToInstrument[`formulario_escala_de_${slug}`] = slug;
  formToInstrument[`formulario_escala_de_${compact}`] = slug;
  formToInstrument[`formulario_${slug}`] = slug;
  formToInstrument[`formulario_${compact}`] = slug;
}

export function formViewOf(slug: string) {
  return formToInstrument[slug] ?? null;
}

export function classifySlug(slug: string): ContentKind | "fora" {
  if (dropped.has(slug) || slug.startsWith("conta/") || slug.startsWith("partials/")) return "fora";
  if (formViewOf(slug)) return "instrumento";
  if (instruments.has(slug)) return "instrumento";
  if (institutional.has(slug) || slug.startsWith("institucional")) return "institucional";
  if (slug.startsWith("simulado")) return "simulado";
  if (/^(codigo_de_etica|lei|nr\d|adequar-nr|normas-regulamentadoras|principios_sus|participacao_popular)/.test(slug)) return "norma";
  if (slug.startsWith("guia_") || slug.startsWith("integracoes_")) return "guia";
  if (slug.includes("biblioteca")) return "biblioteca";
  if (slug.startsWith("formulario")) return "guia";
  return "pagina";
}
