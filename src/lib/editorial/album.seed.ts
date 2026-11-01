/**
 * Tipos canônicos para o Álbum de Enfermagem.
 * Espelho direto de: src/data/contracts/cko-schemas/album_item.schema.json
 */

export type AlbumItemStatus =
  | "CANDIDATE" | "DRAFT" | "SOURCE_QUALIFIED" | "EVIDENCE_BOUND"
  | "REVIEW_REQUIRED" | "HOLD_HUMAN" | "ASSURED"
  | "ELIGIBLE_FOR_RELEASE" | "RELEASED" | "RETIRED";

export type AlbumSpecialty =
  | "GENERAL" | "ADULT_ICU" | "PEDIATRIC_ICU" | "NEONATAL" | "EMERGENCY"
  | "SURGERY" | "OBSTETRICS" | "PSYCHIATRY" | "COMMUNITY" | "MILITARY"
  | "HISTORY" | "EDUCATION" | "OTHER";

export type AlbumCategory =
  | "HISTORICAL" | "EQUIPMENT" | "PROCEDURE" | "PORTRAIT"
  | "ENVIRONMENT" | "EDUCATIONAL" | "COMMEMORATIVE";

export type AlbumRights = "UNKNOWN" | "CLEAR" | "LICENSED" | "HOLD" | "PUBLIC_DOMAIN";

export interface AlbumItem {
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: AlbumItemStatus;
  updated_at: string;
  provenance_refs: string[];
  title: string;
  caption: string;
  image_uri: string;
  image_alt?: string;
  image_width?: number;
  image_height?: number;
  period?: string;
  year?: number;
  specialty?: AlbumSpecialty;
  category: AlbumCategory;
  location?: string;
  country?: string;
  license_ref: string;
  rights_status: AlbumRights;
  source_id?: string;
  tags?: string[];
}

export const SPECIALTY_LABELS: Record<AlbumSpecialty, string> = {
  GENERAL: "Geral", ADULT_ICU: "UTI Adulto", PEDIATRIC_ICU: "UTI Pediátrica",
  NEONATAL: "Neonatologia", EMERGENCY: "Emergência", SURGERY: "Centro cirúrgico",
  OBSTETRICS: "Obstetrícia", PSYCHIATRY: "Psiquiatria", COMMUNITY: "Saúde coletiva",
  MILITARY: "Militar", HISTORY: "História", EDUCATION: "Educação", OTHER: "Outra",
};

export const CATEGORY_LABELS: Record<AlbumCategory, string> = {
  HISTORICAL: "Histórico",
  EQUIPMENT: "Equipamento",
  PROCEDURE: "Procedimento",
  PORTRAIT: "Retrato",
  ENVIRONMENT: "Ambiente",
  EDUCATIONAL: "Educacional",
  COMMEMORATIVE: "Comemorativo",
};

export const ALBUM_RIGHTS_LABELS: Record<AlbumRights, string> = {
  UNKNOWN: "Desconhecido", CLEAR: "Livre", LICENSED: "Licenciado",
  HOLD: "Em hold", PUBLIC_DOMAIN: "Domínio público",
};

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

/** Dataset seed com itens do álbum (URLs públicas de imagens). */
export const ALBUM_ITEMS_SEED: AlbumItem[] = [
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-001",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-HISTORIA"],
    title: "Florence Nightingale na Guerra da Crimeia",
    caption: "Retrato de Florence Nightingale (c. 1858), conhecida como 'A Dama da Lâmpada' por suas rondas noturnas no hospital de Scutari durante a Guerra da Crimeia.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Florence_Nightingale_%28H%29.png/440px-Florence_Nightingale_%28H%29.png",
    image_alt: "Retrato de Florence Nightingale em traje vitoriano",
    period: "século XIX",
    year: 1858,
    specialty: "HISTORY",
    category: "PORTRAIT",
    country: "Reino Unido",
    license_ref: "Domínio público (obra anterior a 1900)",
    rights_status: "PUBLIC_DOMAIN",
    source_id: "SRC-COFEN-HISTORIA",
    tags: ["florence-nightingale", "crimeia", "fundadora"],
  },
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-002",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-ABEN-HISTORIA"],
    title: "Anna Nery — primeira enfermeira brasileira",
    caption: "Anna Nery (1814-1880) foi a primeira enfermeira do Brasil. Voluntária na Guerra do Paraguai, é patrona da enfermagem brasileira.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Anna_Nery.jpg/440px-Anna_Nery.jpg",
    image_alt: "Retrato de Anna Nery",
    period: "século XIX",
    year: 1870,
    specialty: "HISTORY",
    category: "PORTRAIT",
    country: "Brasil",
    license_ref: "Domínio público",
    rights_status: "PUBLIC_DOMAIN",
    source_id: "SRC-ABEN-HISTORIA",
    tags: ["anna-nery", "brasil", "guerra-paraguai"],
  },
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-003",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-ABEN-HISTORIA"],
    title: "Seringa de insulina U-100",
    caption: "Seringa de insulina calibrada em unidades (UI) para aplicação precisa de insulina. Material essencial na enfermagem em endocrinologia.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/InsulinSyringe.jpg/440px-InsulinSyringe.jpg",
    image_alt: "Seringa de insulina descartável",
    period: "atual",
    year: 2024,
    specialty: "GENERAL",
    category: "EQUIPMENT",
    license_ref: "CC BY-SA 3.0",
    rights_status: "LICENSED",
    source_id: "SRC-WIKIPEDIA-SERINGA",
    tags: ["insulina", "seringa", "equipamento"],
  },
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-004",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-OMS-HISTORIA"],
    title: "Estetoscópio — símbolo da saúde",
    caption: "Estetoscópio moderno, símbolo universal da profissão em saúde. Inventado por René Laennec em 1816, é parte do uniforme clínico de enfermagem.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Einstethoskope.jpg/440px-Einstethoskope.jpg",
    image_alt: "Estetoscópio binaural",
    period: "atual",
    year: 2024,
    specialty: "GENERAL",
    category: "EQUIPMENT",
    license_ref: "Domínio público",
    rights_status: "PUBLIC_DOMAIN",
    source_id: "SRC-OMS-HISTORIA",
    tags: ["estetoscopio", "ausculta", "equipamento"],
  },
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-005",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-COFEN-HISTORIA"],
    title: "Mary Eliza Mahoney — primeira enfermeira negra dos EUA",
    caption: "Mary Eliza Mahoney (1845-1926), primeira enfermeira negra formada nos EUA (1879). Cofundadora da NACGN, pioneira na luta contra o racismo na enfermagem.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mary_Eliza_Mahoney.jpg/440px-Mary_Eliza_Mahoney.jpg",
    image_alt: "Retrato de Mary Eliza Mahoney",
    period: "século XIX-XX",
    year: 1900,
    specialty: "HISTORY",
    category: "PORTRAIT",
    country: "Estados Unidos",
    license_ref: "Domínio público",
    rights_status: "PUBLIC_DOMAIN",
    source_id: "SRC-COFEN-HISTORIA",
    tags: ["mary-mahoney", "raca", "pioneira"],
  },
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-006",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-WHO-HANDHYGIENE"],
    title: "Higienização das mãos — 5 momentos da OMS",
    caption: "Pôster da OMS sobre os 5 momentos da higienização das mãos. Campanha global lançada em 2009 pela Organização Mundial da Saúde.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/How_to_Handrub_-_Portuguese_-_WHO.jpg/440px-How_to_Handrub_-_Portuguese_-_WHO.jpg",
    image_alt: "Pôster OMS higienização das mãos",
    period: "atual",
    year: 2024,
    specialty: "EDUCATION",
    category: "EDUCATIONAL",
    country: "Internacional",
    license_ref: "CC BY-NC-SA 3.0 IGO (OMS)",
    rights_status: "LICENSED",
    source_id: "SRC-WHO-HANDHYGIENE",
    tags: ["oms", "5-momentos", "higienizacao", "assepsia"],
  },
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-007",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-WIKIPEDIA-CLARA"],
    title: "Clara Barton — fundadora da Cruz Vermelha Americana",
    caption: "Clarissa Harlowe Barton (1821-1912) fundou a Cruz Vermelha Americana em 1881. Conhecida como 'Anjo do Campo de Batalha' na Guerra Civil Americana.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Clara_Barton_%281821-1912%29_-_Project_Gutenberg_eText_16786.jpg/440px-Clara_Barton_%281821-1912%29_-_Project_Gutenberg_eText_16786.jpg",
    image_alt: "Retrato de Clara Barton",
    period: "século XIX-XX",
    year: 1904,
    specialty: "MILITARY",
    category: "PORTRAIT",
    country: "Estados Unidos",
    license_ref: "Domínio público",
    rights_status: "PUBLIC_DOMAIN",
    source_id: "SRC-WIKIPEDIA-CLARA",
    tags: ["clara-barton", "cruz-vermelha", "guerra-civil"],
  },
  {
    schema_version: "0.1.0",
    canonical_id: "ALB-008",
    version: "1.0.0",
    status: "RELEASED",
    updated_at: "2026-11-01",
    provenance_refs: ["SRC-WIKIPEDIA-LAMPS"],
    title: "A 'Dama da Lâmpada' — Florence e suas rondas noturnas",
    caption: "Ilustração vitoriana representando Florence Nightingale em ronda noturna pelo hospital de Scutari (Guerra da Crimeia, 1854-1856). Origem do apelido 'Lady with the Lamp'.",
    image_uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Florence_Nightingale.jpg/440px-Florence_Nightingale.jpg",
    image_alt: "Ilustração de Florence Nightingale com lâmpada",
    period: "século XIX",
    year: 1891,
    specialty: "HISTORY",
    category: "HISTORICAL",
    country: "Reino Unido",
    license_ref: "Domínio público",
    rights_status: "PUBLIC_DOMAIN",
    source_id: "SRC-WIKIPEDIA-LAMPS",
    tags: ["florence", "lampada", "crimeia", "historia"],
  },
];

export const ALBUM_TOTAL = ALBUM_ITEMS_SEED.length;
