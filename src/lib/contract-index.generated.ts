// GERADO por scripts/generate-entity-contracts.mjs — nao editar a mao.
// A fonte da verdade sao os JSON em contracts/entities/. Qualquer mudanca aqui
// e sobrescrita no proximo run e detectada pelo gate de cobertura.
export interface ContractItem { id: string; [k: string]: unknown }
export interface Contract<T> { contract: string; domain: string; items: T[] }

export const contractRoutes = [
  {
    "id": "CE-ROUTE-$",
    "file": "src/routes/$.tsx"
  },
  {
    "id": "CE-ROUTE-admin",
    "file": "src/routes/admin.tsx"
  },
  {
    "id": "CE-ROUTE-album",
    "file": "src/routes/album.tsx"
  },
  {
    "id": "CE-ROUTE-assinante.ferramentas.$slug",
    "file": "src/routes/assinante.ferramentas.$slug.tsx"
  },
  {
    "id": "CE-ROUTE-assinante",
    "file": "src/routes/assinante.tsx"
  },
  {
    "id": "CE-ROUTE-bibliotecas.$slug.$object",
    "file": "src/routes/bibliotecas.$slug.$object.tsx"
  },
  {
    "id": "CE-ROUTE-bibliotecas.$slug.index",
    "file": "src/routes/bibliotecas.$slug.index.tsx"
  },
  {
    "id": "CE-ROUTE-bibliotecas.$slug",
    "file": "src/routes/bibliotecas.$slug.tsx"
  },
  {
    "id": "CE-ROUTE-bibliotecas.index",
    "file": "src/routes/bibliotecas.index.tsx"
  },
  {
    "id": "CE-ROUTE-blog.$slug",
    "file": "src/routes/blog.$slug.tsx"
  },
  {
    "id": "CE-ROUTE-blog.index",
    "file": "src/routes/blog.index.tsx"
  },
  {
    "id": "CE-ROUTE-blog.mary-eliza-mahoney",
    "file": "src/routes/blog.mary-eliza-mahoney.tsx"
  },
  {
    "id": "CE-ROUTE-bolsas",
    "file": "src/routes/bolsas.tsx"
  },
  {
    "id": "CE-ROUTE-calculadoras-trabalhistas",
    "file": "src/routes/calculadoras-trabalhistas.tsx"
  },
  {
    "id": "CE-ROUTE-central-comando",
    "file": "src/routes/central-comando.tsx"
  },
  {
    "id": "CE-ROUTE-concurso",
    "file": "src/routes/concurso.tsx"
  },
  {
    "id": "CE-ROUTE-concursos",
    "file": "src/routes/concursos.tsx"
  },
  {
    "id": "CE-ROUTE-conta",
    "file": "src/routes/conta.tsx"
  },
  {
    "id": "CE-ROUTE-curiosidades",
    "file": "src/routes/curiosidades.tsx"
  },
  {
    "id": "CE-ROUTE-cursos-sus",
    "file": "src/routes/cursos-sus.tsx"
  },
  {
    "id": "CE-ROUTE-doencas-compulsorias",
    "file": "src/routes/doencas-compulsorias.tsx"
  },
  {
    "id": "CE-ROUTE-estudo",
    "file": "src/routes/estudo.tsx"
  },
  {
    "id": "CE-ROUTE-exames-laboratoriais",
    "file": "src/routes/exames-laboratoriais.tsx"
  },
  {
    "id": "CE-ROUTE-ferramentas-pesquisa",
    "file": "src/routes/ferramentas-pesquisa.tsx"
  },
  {
    "id": "CE-ROUTE-ferramentas.$slug",
    "file": "src/routes/ferramentas.$slug.tsx"
  },
  {
    "id": "CE-ROUTE-forum",
    "file": "src/routes/forum.tsx"
  },
  {
    "id": "CE-ROUTE-index",
    "file": "src/routes/index.tsx"
  },
  {
    "id": "CE-ROUTE-institucional.$hub.$page",
    "file": "src/routes/institucional.$hub.$page.tsx"
  },
  {
    "id": "CE-ROUTE-institucional.$hub.index",
    "file": "src/routes/institucional.$hub.index.tsx"
  },
  {
    "id": "CE-ROUTE-institucional.$hub",
    "file": "src/routes/institucional.$hub.tsx"
  },
  {
    "id": "CE-ROUTE-institucional.index",
    "file": "src/routes/institucional.index.tsx"
  },
  {
    "id": "CE-ROUTE-institucional",
    "file": "src/routes/institucional.tsx"
  },
  {
    "id": "CE-ROUTE-kids.$section",
    "file": "src/routes/kids.$section.tsx"
  },
  {
    "id": "CE-ROUTE-kids.colorir",
    "file": "src/routes/kids.colorir.tsx"
  },
  {
    "id": "CE-ROUTE-kids.index",
    "file": "src/routes/kids.index.tsx"
  },
  {
    "id": "CE-ROUTE-kids.jogos",
    "file": "src/routes/kids.jogos.tsx"
  },
  {
    "id": "CE-ROUTE-kids",
    "file": "src/routes/kids.tsx"
  },
  {
    "id": "CE-ROUTE-login",
    "file": "src/routes/login.tsx"
  },
  {
    "id": "CE-ROUTE-modelos.$id",
    "file": "src/routes/modelos.$id.tsx"
  },
  {
    "id": "CE-ROUTE-modelos.index",
    "file": "src/routes/modelos.index.tsx"
  },
  {
    "id": "CE-ROUTE-modelos",
    "file": "src/routes/modelos.tsx"
  },
  {
    "id": "CE-ROUTE-oficina-local",
    "file": "src/routes/oficina-local.tsx"
  },
  {
    "id": "CE-ROUTE-oportunidades",
    "file": "src/routes/oportunidades.tsx"
  },
  {
    "id": "CE-ROUTE-pacote",
    "file": "src/routes/pacote.tsx"
  },
  {
    "id": "CE-ROUTE-residencias",
    "file": "src/routes/residencias.tsx"
  },
  {
    "id": "CE-ROUTE-sbar",
    "file": "src/routes/sbar.tsx"
  },
  {
    "id": "CE-ROUTE-secao.$slug",
    "file": "src/routes/secao.$slug.tsx"
  },
  {
    "id": "CE-ROUTE-sessao",
    "file": "src/routes/sessao.tsx"
  },
  {
    "id": "CE-ROUTE-sistema",
    "file": "src/routes/sistema.tsx"
  },
  {
    "id": "CE-ROUTE-vagas",
    "file": "src/routes/vagas.tsx"
  },
  {
    "id": "CE-ROUTE-viladocuidado",
    "file": "src/routes/viladocuidado.tsx"
  }
] as const;
export const contractTools = [
  {
    "id": "CE-TOOL-braden",
    "slug": "braden"
  },
  {
    "id": "CE-TOOL-morse",
    "slug": "morse"
  },
  {
    "id": "CE-TOOL-apgar",
    "slug": "apgar"
  },
  {
    "id": "CE-TOOL-aldrete",
    "slug": "aldrete"
  },
  {
    "id": "CE-TOOL-gotejamento",
    "slug": "gotejamento"
  },
  {
    "id": "CE-TOOL-imc",
    "slug": "imc"
  },
  {
    "id": "CE-TOOL-exames-laboratoriais",
    "slug": "exames-laboratoriais"
  }
] as const;
export const contractComponents = [
  {
    "id": "CE-COMP-agent-roster",
    "file": "src/components/site/agent-roster.tsx"
  },
  {
    "id": "CE-COMP-app-link",
    "file": "src/components/site/app-link.tsx"
  },
  {
    "id": "CE-COMP-areas",
    "file": "src/components/site/areas.tsx"
  },
  {
    "id": "CE-COMP-breadcrumb",
    "file": "src/components/site/breadcrumb.tsx"
  },
  {
    "id": "CE-COMP-callout",
    "file": "src/components/site/callout.tsx"
  },
  {
    "id": "CE-COMP-command-center",
    "file": "src/components/site/command-center.tsx"
  },
  {
    "id": "CE-COMP-community",
    "file": "src/components/site/community.tsx"
  },
  {
    "id": "CE-COMP-home-page",
    "file": "src/components/site/home-page.tsx"
  },
  {
    "id": "CE-COMP-not-found",
    "file": "src/components/site/not-found.tsx"
  },
  {
    "id": "CE-COMP-page-hero",
    "file": "src/components/site/page-hero.tsx"
  },
  {
    "id": "CE-COMP-page-toc",
    "file": "src/components/site/page-toc.tsx"
  },
  {
    "id": "CE-COMP-page-tools",
    "file": "src/components/site/page-tools.tsx"
  },
  {
    "id": "CE-COMP-related-content",
    "file": "src/components/site/related-content.tsx"
  },
  {
    "id": "CE-COMP-section-page",
    "file": "src/components/site/section-page.tsx"
  },
  {
    "id": "CE-COMP-shell",
    "file": "src/components/site/shell.tsx"
  },
  {
    "id": "CE-COMP-site-nav",
    "file": "src/components/site/site-nav.tsx"
  },
  {
    "id": "CE-COMP-study",
    "file": "src/components/site/study.tsx"
  },
  {
    "id": "CE-COMP-subscription",
    "file": "src/components/site/subscription.tsx"
  },
  {
    "id": "CE-COMP-translated",
    "file": "src/components/site/translated.tsx"
  }
] as const;
export const contractTokens = [
  {
    "id": "CE-TOKEN-NAVY",
    "name": "Navy",
    "hex": "#1A3E74",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-NAVY-MID",
    "name": "Navy mid",
    "hex": "#1E4D8C",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-NAVY-DEEP",
    "name": "Navy deep",
    "hex": "#163269",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-SKY",
    "name": "Sky",
    "hex": "#4A90E2",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-INK",
    "name": "Ink",
    "hex": "#0F2440",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-SLATE",
    "name": "Slate",
    "hex": "#475569",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-MUTED",
    "name": "Muted",
    "hex": "#64748B",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-CANVAS",
    "name": "Canvas",
    "hex": "#F9FAFB",
    "role": "canonical"
  },
  {
    "id": "CE-TOKEN-SKY-500",
    "name": "Sky 500",
    "hex": "#0EA5E9",
    "role": "rejected"
  },
  {
    "id": "CE-TOKEN-INDIGO",
    "name": "Indigo",
    "hex": "#6366F1",
    "role": "rejected"
  },
  {
    "id": "CE-TOKEN-GRADIENTE-HERO",
    "name": "Gradiente hero",
    "hex": "#E0F2FE",
    "role": "rejected"
  }
] as const;
export const contractChrome = [
  {
    "id": "CE-CHROME-UTILITY",
    "value": "44px"
  },
  {
    "id": "CE-CHROME-HEADER",
    "value": "64px"
  },
  {
    "id": "CE-CHROME-TOTAL",
    "value": "calc(var(--chrome-utility) + var(--chrome-a11y) + var(--chrome-header))"
  },
  {
    "id": "CE-CHROME-TABLET",
    "value": "calc(var(--chrome-utility) + var(--chrome-header))"
  },
  {
    "id": "CE-CHROME-GAP",
    "value": "16px"
  },
  {
    "id": "CE-CHROME-RULE",
    "value": "rgba(255, 255, 255, 0.16)"
  },
  {
    "id": "CE-CHROME-CONTROL-BORDER",
    "value": "rgba(255, 255, 255, 0.34)"
  },
  {
    "id": "CE-CHROME-CONTROL-HOVER",
    "value": "rgba(255, 255, 255, 0.14)"
  },
  {
    "id": "CE-CHROME-CONTROL-SELECTED",
    "value": "rgba(255, 255, 255, 0.2)"
  },
  {
    "id": "CE-CHROME-EMPHASIS-BG",
    "value": "#ffffff"
  },
  {
    "id": "CE-CHROME-EMPHASIS-FG",
    "value": "#1a3e74"
  }
] as const;
export const contractArticles = [
  {
    "id": "CE-ARTICLE-MARY-ELIZA-MAHONEY",
    "slug": "mary-eliza-mahoney",
    "route": "/blog/mary-eliza-mahoney"
  }
] as const;
// Contrato universal de ferramenta — o vocabulario do CKO (canonical_id, nao id).
export const contractToolSources = [
  {
    "canonical_id": "SRC-CFM-PARECER-28-2020",
    "authority": "Conselho Federal de Medicina (CFM)",
    "jurisdiction": "BR",
    "source_type": "REGULATOR"
  },
  {
    "canonical_id": "SRC-REV-ENF-USP-BRADEN-1999",
    "authority": "Revista de Enfermagem da USP",
    "jurisdiction": "BR",
    "source_type": "PRIMARY_STUDY"
  },
  {
    "canonical_id": "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA",
    "authority": "CAPES/MEC",
    "jurisdiction": "BR",
    "source_type": "GUIDELINE"
  },
  {
    "canonical_id": "SRC-OMS-OBESIDADE-2000",
    "authority": "Organização Mundial da Saúde (OMS/WHO)",
    "jurisdiction": "INTERNACIONAL",
    "source_type": "GUIDELINE"
  },
  {
    "canonical_id": "SRC-APGAR-1953",
    "authority": "Current Researches in Anesthesia & Analgesia",
    "jurisdiction": "INTERNACIONAL",
    "source_type": "PRIMARY_STUDY"
  },
  {
    "canonical_id": "SRC-GOTEJAMENTO-FORMULA-CLASSICA",
    "authority": "Prática assistencial de gotejamento",
    "jurisdiction": "BR",
    "source_type": "INTERNAL_GOVERNED"
  }
] as const;
export const contractToolBindings = [
  {
    "canonical_id": "AB-ALDRETE-ATIVIDADE",
    "field_path": "tool.aldrete.criteria.atividade",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-ALDRETE-RESPIRACAO",
    "field_path": "tool.aldrete.criteria.respiracao",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-ALDRETE-CIRCULACAO",
    "field_path": "tool.aldrete.criteria.circulacao",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-ALDRETE-CONSCIENCIA",
    "field_path": "tool.aldrete.criteria.consciencia",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-ALDRETE-SATURACAO",
    "field_path": "tool.aldrete.criteria.saturacao",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-ALDRETE-BAND-OK",
    "field_path": "tool.aldrete.bands.ok",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-ALDRETE-BAND-WARN",
    "field_path": "tool.aldrete.bands.warn",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-ALDRETE-BAND-DANGER",
    "field_path": "tool.aldrete.bands.danger",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-SENSORIAL",
    "field_path": "tool.braden.criteria.sensorial",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-UMIDADE",
    "field_path": "tool.braden.criteria.umidade",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-ATIVIDADE",
    "field_path": "tool.braden.criteria.atividade",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-MOBILIDADE",
    "field_path": "tool.braden.criteria.mobilidade",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-NUTRICAO",
    "field_path": "tool.braden.criteria.nutricao",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-FRICCAO",
    "field_path": "tool.braden.criteria.friccao",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-MUITOALTO",
    "field_path": "tool.braden.bands.muitoAlto",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-ALTO",
    "field_path": "tool.braden.bands.alto",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-MODERADO",
    "field_path": "tool.braden.bands.moderado",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-BAIXO",
    "field_path": "tool.braden.bands.baixo",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-SEMRISCO",
    "field_path": "tool.braden.bands.semRisco",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-QUEDAS",
    "field_path": "tool.morse.criteria.quedas",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-DIAGNOSTICO",
    "field_path": "tool.morse.criteria.diagnostico",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-AUXILIO",
    "field_path": "tool.morse.criteria.auxilio",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-VENOSO",
    "field_path": "tool.morse.criteria.venoso",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-MARCHA",
    "field_path": "tool.morse.criteria.marcha",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-MENTAL",
    "field_path": "tool.morse.criteria.mental",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-BAND-BAIXO",
    "field_path": "tool.morse.bands.baixo",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-BAND-MEDIO",
    "field_path": "tool.morse.bands.medio",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-MORSE-BAND-ALTO",
    "field_path": "tool.morse.bands.alto",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-APARENCIA",
    "field_path": "tool.apgar.criteria.aparencia",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-PULSO",
    "field_path": "tool.apgar.criteria.pulso",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-REFLEXO",
    "field_path": "tool.apgar.criteria.reflexo",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-TONUS",
    "field_path": "tool.apgar.criteria.tonus",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-COR",
    "field_path": "tool.apgar.criteria.cor",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-BAND-NORMAL",
    "field_path": "tool.apgar.bands.normal",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-BAND-DEPRESSAO",
    "field_path": "tool.apgar.bands.depressao",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-APGAR-BAND-GRAVE",
    "field_path": "tool.apgar.bands.grave",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL_EVIDENCE",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-VOLUME",
    "field_path": "tool.gotejamento.fields.volume",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL_STANDARD",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-HORAS",
    "field_path": "tool.gotejamento.fields.horas",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL_STANDARD",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-MINUTOS",
    "field_path": "tool.gotejamento.fields.minutos",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL_STANDARD",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-FATOR",
    "field_path": "tool.gotejamento.fields.fator",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL_STANDARD",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-IMC-PESO",
    "field_path": "tool.imc.fields.peso",
    "source_ids": [
      "SRC-OMS-OBESIDADE-2000"
    ],
    "authority_class": "TECHNICAL_STANDARD",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-IMC-ALTURA",
    "field_path": "tool.imc.fields.altura",
    "source_ids": [
      "SRC-OMS-OBESIDADE-2000"
    ],
    "authority_class": "TECHNICAL_STANDARD",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-CTX-NOME",
    "field_path": "tool.contexto.nome",
    "source_ids": [],
    "authority_class": "INTERNAL_NONCLINICAL",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-CTX-IDADE",
    "field_path": "tool.contexto.idade",
    "source_ids": [],
    "authority_class": "INTERNAL_NONCLINICAL",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-CTX-SETOR",
    "field_path": "tool.contexto.setor",
    "source_ids": [],
    "authority_class": "INTERNAL_NONCLINICAL",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "AB-CTX-DATA",
    "field_path": "tool.contexto.data",
    "source_ids": [],
    "authority_class": "INTERNAL_NONCLINICAL",
    "decision": "HOLD_HUMAN"
  },
  {
    "canonical_id": "FD-ALDRETE-ATIVIDADE",
    "field_path": "tool.aldrete.criteria.atividade",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ALDRETE-RESPIRACAO",
    "field_path": "tool.aldrete.criteria.respiracao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ALDRETE-CIRCULACAO",
    "field_path": "tool.aldrete.criteria.circulacao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ALDRETE-CONSCIENCIA",
    "field_path": "tool.aldrete.criteria.consciencia",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ALDRETE-SATURACAO",
    "field_path": "tool.aldrete.criteria.saturacao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BRADEN-SENSORIAL",
    "field_path": "tool.braden.criteria.sensorial",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BRADEN-UMIDADE",
    "field_path": "tool.braden.criteria.umidade",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BRADEN-ATIVIDADE",
    "field_path": "tool.braden.criteria.atividade",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BRADEN-MOBILIDADE",
    "field_path": "tool.braden.criteria.mobilidade",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BRADEN-NUTRICAO",
    "field_path": "tool.braden.criteria.nutricao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BRADEN-FRICCAO",
    "field_path": "tool.braden.criteria.friccao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MORSE-QUEDAS",
    "field_path": "tool.morse.criteria.quedas",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MORSE-DIAGNOSTICO",
    "field_path": "tool.morse.criteria.diagnostico",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MORSE-AUXILIO",
    "field_path": "tool.morse.criteria.auxilio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MORSE-VENOSO",
    "field_path": "tool.morse.criteria.venoso",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MORSE-MARCHA",
    "field_path": "tool.morse.criteria.marcha",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MORSE-MENTAL",
    "field_path": "tool.morse.criteria.mental",
    "source_ids": []
  },
  {
    "canonical_id": "FD-APGAR-APARENCIA",
    "field_path": "tool.apgar.criteria.aparencia",
    "source_ids": []
  },
  {
    "canonical_id": "FD-APGAR-PULSO",
    "field_path": "tool.apgar.criteria.pulso",
    "source_ids": []
  },
  {
    "canonical_id": "FD-APGAR-REFLEXO",
    "field_path": "tool.apgar.criteria.reflexo",
    "source_ids": []
  },
  {
    "canonical_id": "FD-APGAR-TONUS",
    "field_path": "tool.apgar.criteria.tonus",
    "source_ids": []
  },
  {
    "canonical_id": "FD-APGAR-COR",
    "field_path": "tool.apgar.criteria.cor",
    "source_ids": []
  },
  {
    "canonical_id": "FD-GOTEJAMENTO-VOLUME",
    "field_path": "tool.gotejamento.fields.volume",
    "source_ids": []
  },
  {
    "canonical_id": "FD-GOTEJAMENTO-HORAS",
    "field_path": "tool.gotejamento.fields.horas",
    "source_ids": []
  },
  {
    "canonical_id": "FD-GOTEJAMENTO-MINUTOS",
    "field_path": "tool.gotejamento.fields.minutos",
    "source_ids": []
  },
  {
    "canonical_id": "FD-GOTEJAMENTO-FATOR",
    "field_path": "tool.gotejamento.fields.fator",
    "source_ids": []
  },
  {
    "canonical_id": "FD-IMC-PESO",
    "field_path": "tool.imc.fields.peso",
    "source_ids": []
  },
  {
    "canonical_id": "FD-IMC-ALTURA",
    "field_path": "tool.imc.fields.altura",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CTX-NOME",
    "field_path": "tool.contexto.nome",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CTX-IDADE",
    "field_path": "tool.contexto.idade",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CTX-SETOR",
    "field_path": "tool.contexto.setor",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CTX-DATA",
    "field_path": "tool.contexto.data",
    "source_ids": []
  }
] as const;
export const contractToolComponents = [
  {
    "id": "CE-COMP-agent-roster",
    "component_key": "agent-roster"
  },
  {
    "id": "CE-COMP-app-link",
    "component_key": "app-link"
  },
  {
    "id": "CE-COMP-areas",
    "component_key": "areas"
  },
  {
    "id": "CE-COMP-breadcrumb",
    "component_key": "breadcrumb"
  },
  {
    "id": "CE-COMP-callout",
    "component_key": "callout"
  },
  {
    "id": "CE-COMP-command-center",
    "component_key": "command-center"
  },
  {
    "id": "CE-COMP-community",
    "component_key": "community"
  },
  {
    "id": "CE-COMP-home-page",
    "component_key": "home-page"
  },
  {
    "id": "CE-COMP-not-found",
    "component_key": "not-found"
  },
  {
    "id": "CE-COMP-page-hero",
    "component_key": "page-hero"
  },
  {
    "id": "CE-COMP-page-toc",
    "component_key": "page-toc"
  },
  {
    "id": "CE-COMP-page-tools",
    "component_key": "page-tools"
  },
  {
    "id": "CE-COMP-related-content",
    "component_key": "related-content"
  },
  {
    "id": "CE-COMP-section-page",
    "component_key": "section-page"
  },
  {
    "id": "CE-COMP-shell",
    "component_key": "shell"
  },
  {
    "id": "CE-COMP-site-nav",
    "component_key": "site-nav"
  },
  {
    "id": "CE-COMP-study",
    "component_key": "study"
  },
  {
    "id": "CE-COMP-subscription",
    "component_key": "subscription"
  },
  {
    "id": "CE-COMP-translated",
    "component_key": "translated"
  }
] as const;
export const contractBrand = [
  {
    "id": "CE-BRAND-CALC-ICON-WEBP",
    "file": "public/brand/calc-icon.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-CHAPEU-WEBP",
    "file": "public/brand/chapeu.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-ENFERMEIRA-WEBP",
    "file": "public/brand/enfermeira.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-EXT-BRADEN-WEBP",
    "file": "public/brand/ext-braden.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-EXT-GASOMETRIA-WEBP",
    "file": "public/brand/ext-gasometria.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-EXT-GOTEJAMENTO-WEBP",
    "file": "public/brand/ext-gotejamento.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-FORM-001-WEBP",
    "file": "public/brand/form-001.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-LIVRO-WEBP",
    "file": "public/brand/livro.webp",
    "status": "live"
  },
  {
    "id": "CE-BRAND-LOGO-SVG",
    "file": "public/brand/logo.svg",
    "status": "live",
    "papel": "marca-primaria",
    "nota": "Vetor vetorial canônico usado no header. Mantém legibilidade em qualquer densidade de tela e evita distorção do raster anterior."
  },
  {
    "id": "CE-BRAND-LOGO-WEBP",
    "file": "public/brand/logo.webp",
    "status": "superseded",
    "supersededBy": "CE-BRAND-LOGO-SVG",
    "nota": "Raster legado, mantido apenas como referência e não utilizado pela aplicação."
  }
] as const;
