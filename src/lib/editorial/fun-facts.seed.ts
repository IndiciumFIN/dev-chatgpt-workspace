/**
 * Dataset seed de curiosidades de enfermagem.
 *
 * Fontes primárias (fontes canônicas reais):
 *   - BRASIL. COFEN. História da Enfermagem. https://www.cofen.gov.br
 *   - ABEn — Associação Brasileira de Enfermagem.
 *   - OMS — Organização Mundial da Saúde.
 *   - RCN — Royal College of Nursing.
 *   - Wikipedia (para fatos biográficos com fonte cruzada).
 *
 * Esta é uma lista SEED — pode ser expandida. Cada item segue o schema
 * fun_fact.schema.json e está marcado como status SOURCE_QUALIFIED
 * quando a fonte é confiável; CANDIDATE quando precisa de revisão.
 */

import type { FunFact } from "./types";

export const FUN_FACTS_SEED: FunFact[] = [
  {
    schema_version: "0.1.0",
    canonical_id: "FF-001",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-HISTORIA"],
    title: "Florence Nightingale e a origem da enfermagem moderna",
    body_text: "Florence Nightingale (1820-1910) é considerada a fundadora da enfermagem moderna. Durante a Guerra da Crimeia (1853-1856), reduziu a mortalidade de soldados britânicos de 42% para 2% em seis meses, introduzindo medidas de higiene, ventilação e cuidado sistemático. Em 1860 fundou a primeira escola de enfermagem no St. Thomas' Hospital, em Londres, profissionalizando a atividade.",
    fact_type: "BIOGRAPHICAL",
    category: "PIONEERS",
    year_ref: 1860,
    person_ref: "Florence Nightingale",
    source_id: "SRC-COFEN-HISTORIA",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["florence-nightingale", "crimeia", "fundadora"],
    estimated_reading_seconds: 60,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-002",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-ABEN-HISTORIA"],
    title: "Anna Nery — a primeira enfermeira do Brasil",
    body_text: "Anna Justina Steiner Heger (1814-1880), conhecida como Anna Nery, é considerada a primeira enfermeira do Brasil. Em 1865, durante a Guerra do Paraguai, alistou-se como voluntária aos 51 anos para cuidar dos feridos brasileiros. Hoje seu nome batiza a maior escola de enfermagem da América Latina — Escola de Enfermagem Anna Nery (UFRJ).",
    fact_type: "BIOGRAPHICAL",
    category: "BRAZIL",
    year_ref: 1865,
    person_ref: "Anna Nery",
    source_id: "SRC-ABEN-HISTORIA",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["anna-nery", "guerra-do-paraguai", "ufrj"],
    estimated_reading_seconds: 50,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-003",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-LEI-7498-1986"],
    title: "Lei do Exercício Profissional da Enfermagem",
    body_text: "A Lei nº 7.498, de 25 de junho de 1986, é a Lei do Exercício Profissional da Enfermagem no Brasil. Ela regulamenta o exercício da enfermagem e define as atribuições do enfermeiro, do técnico de enfermagem e do auxiliar de enfermagem. É a lei de referência para toda a atuação da categoria.",
    fact_type: "PROFESSIONAL",
    category: "PROFESSION",
    year_ref: 1986,
    source_id: "SRC-LEI-7498-1986",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["lei-7498", "exercicio-profissional", "coren"],
    estimated_reading_seconds: 45,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-004",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-HISTORIA"],
    title: "Por que enfermeiros usam branco",
    body_text: "O branco entrou no uniforme de enfermagem no início do século XX como símbolo de assepsia. Florence Nightingale já defendia que o uniforme devia comunicar limpeza e cuidado. A cor branca tornou possível identificar rapidamente contaminação — algo essencial em uma era pré-antibióticos.",
    fact_type: "CULTURAL",
    category: "PROFESSION",
    year_ref: 1900,
    source_id: "SRC-COFEN-HISTORIA",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["uniforme", "branco", "assepsia"],
    estimated_reading_seconds: 30,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-005",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-OMS-ENFERMAGEM"],
    title: "Dia Internacional da Enfermagem — 12 de maio",
    body_text: "O Dia Internacional da Enfermagem é celebrado em 12 de maio, aniversário de Florence Nightingale. Foi instituído pelo Conselho Internacional de Enfermeiros (CIE) em 1965 e reconhecido pela OMS. No Brasil, a Semana da Enfermagem vai de 12 a 20 de maio — esta última homenageia a canonização de Santa Emília de Vialar (dia 20).",
    fact_type: "HISTORICAL",
    category: "PROFESSION",
    year_ref: 1965,
    source_id: "SRC-OMS-ENFERMAGEM",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["dia-12-maio", "semana-enfermagem", "oms"],
    estimated_reading_seconds: 40,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-006",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-HISTORIA"],
    title: "A origem da palavra 'enfermeiro'",
    body_text: "A palavra 'enfermeiro' deriva do latim 'infirmus' (fraco, doente). Originalmente designava quem cuidava dos enfermos. Em inglês, 'nurse' vem do latim 'nutrire' (nutrir, amamentar) — aponta para o cuidado materno como matriz da profissão.",
    fact_type: "ETYMOLOGICAL",
    category: "HISTORY",
    source_id: "SRC-COFEN-HISTORIA",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["etimologia", "latim"],
    estimated_reading_seconds: 30,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-007",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-OMS-ENFERMAGEM"],
    title: "Enfermagem é a maior profissão de saúde do mundo",
    body_text: "Segundo a OMS, existem aproximadamente 28 milhões de enfermeiros no mundo — mais da metade da força de trabalho global em saúde. No Brasil, são cerca de 2,5 milhões de profissionais registrados no COFEN, sendo a maior categoria da saúde.",
    fact_type: "STATISTICAL",
    category: "PROFESSION",
    year_ref: 2024,
    source_id: "SRC-OMS-ENFERMAGEM",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["estatistica", "oms", "forca-trabalho"],
    estimated_reading_seconds: 35,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-008",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-HISTORIA"],
    title: "O juramento de Florence Nightingale",
    body_text: "O Juramento de Florence Nightingale foi escrito em 1893 por uma comissão do Hospital Farrand, em Detroit (EUA), baseado no Juramento Hipocrático. É tradicionalmente recitado por formandos em enfermagem no mundo todo: 'Prometo solenemente, diante de Deus e na presença desta assembleia, levar uma vida pura e cumprir meus deveres profissionais com fidelidade...'",
    fact_type: "HISTORICAL",
    category: "PIONEERS",
    year_ref: 1893,
    person_ref: "Florence Nightingale",
    source_id: "SRC-COFEN-HISTORIA",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["juramento", "noitegale", "etica"],
    estimated_reading_seconds: 50,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-009",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-RES-543"],
    title: "Sistemática de Assistência de Enfermagem (SAE)",
    body_text: "A Sistematização da Assistência de Enfermagem (SAE) é obrigatória no Brasil desde 2002, conforme Resolução COFEN nº 272/2002 (atualizada pela Resolução nº 543/2017). Ela organiza o trabalho do enfermeiro em cinco etapas: histórico de enfermagem, diagnóstico de enfermagem, planejamento, implementação e avaliação.",
    fact_type: "PROFESSIONAL",
    category: "PROFESSION",
    year_ref: 2017,
    source_id: "SRC-COFEN-RES-543",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["sae", "processo-enfermagem", "resolucao-543"],
    estimated_reading_seconds: 50,
  },
  {
    schema_version: "0.1.0",
    canonical_id: "FF-010",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-HISTORIA"],
    title: "Mary Eliza Mahoney — primeira enfermeira negra dos EUA",
    body_text: "Mary Eliza Mahoney (1845-1926) foi a primeira enfermeira negra formada nos Estados Unidos. Formou-se pela New England Hospital for Women and Children em 1879. Foi também cofundadora da Associação Nacional de Enfermeiras Negras Graduadas (NACGN, 1908), lutando contra a segregação racial na profissão.",
    fact_type: "BIOGRAPHICAL",
    category: "PIONEERS",
    year_ref: 1879,
    person_ref: "Mary Eliza Mahoney",
    source_id: "SRC-COFEN-HISTORIA",
    rights_status: "PUBLIC_DOMAIN",
    tags: ["mary-mahoney", "negra", "raca"],
    estimated_reading_seconds: 45,
  },
];

/**
 * Para chegar aos 87 fatos previstos no template-catalog, cada fato real
 * cadastrado acima contém conteúdo completo. Os demais (11 a 87) ficam como
 * stubs CANDIDATE aguardando curadoria humana — exibidos na lista com badge
 * "rascunho", não no índice público.
 */
const SEED_COUNT = FUN_FACTS_SEED.length;
const TARGET_COUNT = 87;
for (let i = SEED_COUNT + 1; i <= TARGET_COUNT; i++) {
  FUN_FACTS_SEED.push({
    schema_version: "0.1.0",
    canonical_id: `FF-${String(i).padStart(3, "0")}`,
    version: "0.0.0-placeholder",
    status: "CANDIDATE",
    updated_at: "2026-11-01",
    provenance_refs: [],
    title: `[Curiosidade ${i} — a curar]`,
    body_text: "Conteúdo aguardando curadoria. Este slot foi reservado no template catalog original (87 slots).",
    fact_type: "OTHER",
    category: "OTHER",
    source_id: "SRC-A-QUALIFICAR",
    rights_status: "UNKNOWN",
    tags: ["rascunho"],
    estimated_reading_seconds: 30,
  });
}

export const FUN_FACTS_TOTAL = FUN_FACTS_SEED.length;
