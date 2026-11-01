export type FooterCopy = {
  institutional: string;
  about: string;
  siteMap: string;
  terms: string;
  accessibilityPolicy: string;
  digitalSustainability: string;
  ourCommitment: string;
  impact: string;
  commitmentText: string;
  followUs: string;
  manageCookies: string;
  copyright: string;
};

export type HomeCard = { title: string; text: string };

export type TileText = { file: string; title: string; text: string };

export type HomeUi = {
  scrollUp: string;
  scrollDown: string;
  previousForm: string;
  nextForm: string;
  formAlt: string;
  formLabel: string;
};

export type HomeCopy = {
  platform: string;
  title: string;
  lead: string;
  library: string;
  resources: string;
  resourcesLead: string;
  specialtiesLabel: string;
  specialties: string[];
  cards: HomeCard[];
  resourcesCards: HomeCard[];
  formTitle: string;
  supportEyebrow: string;
  calculators: string;
  practical: string;
  bands: { kicker: string; title: string; sub: string }[];
  nurseAlt: string;
  braden: string;
  drip: string;
  gas: string;
  tiles: { calculators: TileText[]; simulations: TileText[]; scales: TileText[] };
  ui: HomeUi;
};

export function tileText(copy: HomeCopy, file: string | undefined) {
  if (!file) return undefined;
  const rows = [...copy.tiles.calculators, ...copy.tiles.simulations, ...copy.tiles.scales];
  return rows.find((row) => row.file === file);
}
