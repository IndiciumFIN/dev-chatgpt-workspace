// GERADO por scripts/generate-entity-contracts.mjs — nao editar a mao.
// A fonte da verdade sao os JSON em contracts/entities/. Qualquer mudanca aqui
// e sobrescrita no proximo run e detectada pelo gate de cobertura.
export interface ContractItem { id: string; [k: string]: unknown }
export interface Contract<T> { contract: string; domain: string; items: T[] }

export const contractRoutes = [
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
    "id": "CE-ROUTE-minha-area",
    "file": "src/routes/minha-area.tsx"
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
  },
  {
    "id": "CE-TOOL-ferias",
    "slug": "ferias"
  },
  {
    "id": "CE-TOOL-adicional-noturno",
    "slug": "adicional-noturno"
  },
  {
    "id": "CE-TOOL-horas-extras",
    "slug": "horas-extras"
  },
  {
    "id": "CE-TOOL-rescisao",
    "slug": "rescisao"
  },
  {
    "id": "CE-TOOL-sbar",
    "slug": "sbar"
  },
  {
    "id": "CE-TOOL-nanda-nic-noc",
    "slug": "nanda-nic-noc"
  },
  {
    "id": "CE-TOOL-doencas-compulsorias",
    "slug": "doencas-compulsorias"
  },
  {
    "id": "CE-TOOL-aspiracao-insulina",
    "slug": "aspiracao-insulina"
  },
  {
    "id": "CE-TOOL-balanco-hidrico",
    "slug": "balanco-hidrico"
  },
  {
    "id": "CE-TOOL-dimensionamento-cofen",
    "slug": "dimensionamento-cofen"
  },
  {
    "id": "CE-TOOL-gasometria-arterial",
    "slug": "gasometria-arterial"
  },
  {
    "id": "CE-TOOL-idade-gestacional",
    "slug": "idade-gestacional"
  },
  {
    "id": "CE-TOOL-medicamentos",
    "slug": "medicamentos"
  },
  {
    "id": "CE-TOOL-tabela-vacinas",
    "slug": "tabela-vacinas"
  },
  {
    "id": "CE-TOOL-aldrete-kroulik",
    "slug": "aldrete-kroulik"
  },
  {
    "id": "CE-TOOL-apache-ii",
    "slug": "apache-ii"
  },
  {
    "id": "CE-TOOL-asa",
    "slug": "asa"
  },
  {
    "id": "CE-TOOL-ballard",
    "slug": "ballard"
  },
  {
    "id": "CE-TOOL-barthel",
    "slug": "barthel"
  },
  {
    "id": "CE-TOOL-bps",
    "slug": "bps"
  },
  {
    "id": "CE-TOOL-berg",
    "slug": "berg"
  },
  {
    "id": "CE-TOOL-bishop",
    "slug": "bishop"
  },
  {
    "id": "CE-TOOL-cam-icu",
    "slug": "cam-icu"
  },
  {
    "id": "CE-TOOL-capurro",
    "slug": "capurro"
  },
  {
    "id": "CE-TOOL-cincinnati",
    "slug": "cincinnati"
  },
  {
    "id": "CE-TOOL-wifi-svs",
    "slug": "wifi-svs"
  },
  {
    "id": "CE-TOOL-copsoq-ii",
    "slug": "copsoq-ii"
  },
  {
    "id": "CE-TOOL-copsoq-iii",
    "slug": "copsoq-iii"
  },
  {
    "id": "CE-TOOL-cornell",
    "slug": "cornell"
  },
  {
    "id": "CE-TOOL-cries",
    "slug": "cries"
  },
  {
    "id": "CE-TOOL-curb-65",
    "slug": "curb-65"
  },
  {
    "id": "CE-TOOL-downton",
    "slug": "downton"
  },
  {
    "id": "CE-TOOL-elpo",
    "slug": "elpo"
  },
  {
    "id": "CE-TOOL-fast",
    "slug": "fast"
  },
  {
    "id": "CE-TOOL-flacc",
    "slug": "flacc"
  },
  {
    "id": "CE-TOOL-four",
    "slug": "four"
  },
  {
    "id": "CE-TOOL-fugulin",
    "slug": "fugulin"
  },
  {
    "id": "CE-TOOL-gds",
    "slug": "gds"
  },
  {
    "id": "CE-TOOL-glasgow",
    "slug": "glasgow"
  },
  {
    "id": "CE-TOOL-gosnell",
    "slug": "gosnell"
  },
  {
    "id": "CE-TOOL-hamilton",
    "slug": "hamilton"
  },
  {
    "id": "CE-TOOL-hendrich-ii",
    "slug": "hendrich-ii"
  },
  {
    "id": "CE-TOOL-humpty-dumpty",
    "slug": "humpty-dumpty"
  },
  {
    "id": "CE-TOOL-johns",
    "slug": "johns"
  },
  {
    "id": "CE-TOOL-jouvet",
    "slug": "jouvet"
  },
  {
    "id": "CE-TOOL-katz",
    "slug": "katz"
  },
  {
    "id": "CE-TOOL-lachs",
    "slug": "lachs"
  },
  {
    "id": "CE-TOOL-lanss",
    "slug": "lanss"
  },
  {
    "id": "CE-TOOL-lawton",
    "slug": "lawton"
  },
  {
    "id": "CE-TOOL-manchester",
    "slug": "manchester"
  },
  {
    "id": "CE-TOOL-meem",
    "slug": "meem"
  },
  {
    "id": "CE-TOOL-meows",
    "slug": "meows"
  },
  {
    "id": "CE-TOOL-moca",
    "slug": "moca"
  },
  {
    "id": "CE-TOOL-news",
    "slug": "news"
  },
  {
    "id": "CE-TOOL-nihss",
    "slug": "nihss"
  },
  {
    "id": "CE-TOOL-nips",
    "slug": "nips"
  },
  {
    "id": "CE-TOOL-norton",
    "slug": "norton"
  },
  {
    "id": "CE-TOOL-dor-numerica",
    "slug": "dor-numerica"
  },
  {
    "id": "CE-TOOL-ofras",
    "slug": "ofras"
  },
  {
    "id": "CE-TOOL-painad",
    "slug": "painad"
  },
  {
    "id": "CE-TOOL-pelod",
    "slug": "pelod"
  },
  {
    "id": "CE-TOOL-pews",
    "slug": "pews"
  },
  {
    "id": "CE-TOOL-perroca",
    "slug": "perroca"
  },
  {
    "id": "CE-TOOL-prism",
    "slug": "prism"
  },
  {
    "id": "CE-TOOL-qsofa",
    "slug": "qsofa"
  },
  {
    "id": "CE-TOOL-ramsay",
    "slug": "ramsay"
  },
  {
    "id": "CE-TOOL-rancho-los-amigos",
    "slug": "rancho-los-amigos"
  },
  {
    "id": "CE-TOOL-richmond",
    "slug": "richmond"
  },
  {
    "id": "CE-TOOL-saps-iii",
    "slug": "saps-iii"
  },
  {
    "id": "CE-TOOL-silverman-anderson",
    "slug": "silverman-anderson"
  },
  {
    "id": "CE-TOOL-sinbad",
    "slug": "sinbad"
  },
  {
    "id": "CE-TOOL-sofa",
    "slug": "sofa"
  },
  {
    "id": "CE-TOOL-tinetti",
    "slug": "tinetti"
  },
  {
    "id": "CE-TOOL-waterlow",
    "slug": "waterlow"
  },
  {
    "id": "CE-TOOL-wood-downes",
    "slug": "wood-downes"
  },
  {
    "id": "CE-TOOL-zarit",
    "slug": "zarit"
  }
] as const;
export const contractComponents = [
  {
    "id": "CE-COMP-admin-account-header",
    "file": "src/components/admin-account-header.tsx"
  },
  {
    "id": "CE-COMP-admin-bulk-import",
    "file": "src/components/admin-bulk-import.tsx"
  },
  {
    "id": "CE-COMP-admin-console",
    "file": "src/components/admin-console.tsx"
  },
  {
    "id": "CE-COMP-admin-module-workspace",
    "file": "src/components/admin-module-workspace.tsx"
  },
  {
    "id": "CE-COMP-admin-schema-editor",
    "file": "src/components/admin-schema-editor.tsx"
  },
  {
    "id": "CE-COMP-admin-sidebar-tree",
    "file": "src/components/admin-sidebar-tree.tsx"
  },
  {
    "id": "CE-COMP-app-link",
    "file": "src/components/app-link.tsx"
  },
  {
    "id": "CE-COMP-areas",
    "file": "src/components/areas.tsx"
  },
  {
    "id": "CE-COMP-article-icons",
    "file": "src/components/article-icons.tsx"
  },
  {
    "id": "CE-COMP-article-page",
    "file": "src/components/article-page.tsx"
  },
  {
    "id": "CE-COMP-article-pieces",
    "file": "src/components/article-pieces.tsx"
  },
  {
    "id": "CE-COMP-biography-view",
    "file": "src/components/biography-view.tsx"
  },
  {
    "id": "CE-COMP-breadcrumb",
    "file": "src/components/breadcrumb.tsx"
  },
  {
    "id": "CE-COMP-callout",
    "file": "src/components/callout.tsx"
  },
  {
    "id": "CE-COMP-clinical-form",
    "file": "src/components/clinical-form.tsx"
  },
  {
    "id": "CE-COMP-clinical-sheet",
    "file": "src/components/clinical-sheet.tsx"
  },
  {
    "id": "CE-COMP-clinical-tool",
    "file": "src/components/clinical-tool.tsx"
  },
  {
    "id": "CE-COMP-commander-panel",
    "file": "src/components/commander-panel.tsx"
  },
  {
    "id": "CE-COMP-community",
    "file": "src/components/community.tsx"
  },
  {
    "id": "CE-COMP-editorial-view",
    "file": "src/components/editorial-view.tsx"
  },
  {
    "id": "CE-COMP-form-view",
    "file": "src/components/form-view.tsx"
  },
  {
    "id": "CE-COMP-governance-panel",
    "file": "src/components/governance-panel.tsx"
  },
  {
    "id": "CE-COMP-guide-view",
    "file": "src/components/guide-view.tsx"
  },
  {
    "id": "CE-COMP-home-page",
    "file": "src/components/home-page.tsx"
  },
  {
    "id": "CE-COMP-institutional-template",
    "file": "src/components/institutional-template.tsx"
  },
  {
    "id": "CE-COMP-interface",
    "file": "src/components/interface.tsx"
  },
  {
    "id": "CE-COMP-library-canonical",
    "file": "src/components/library-canonical.tsx"
  },
  {
    "id": "CE-COMP-library-shelves",
    "file": "src/components/library-shelves.tsx"
  },
  {
    "id": "CE-COMP-library-view",
    "file": "src/components/library-view.tsx"
  },
  {
    "id": "CE-COMP-local-workbench-page",
    "file": "src/components/local-workbench-page.tsx"
  },
  {
    "id": "CE-COMP-module-directory",
    "file": "src/components/module-directory.tsx"
  },
  {
    "id": "CE-COMP-norm-view",
    "file": "src/components/norm-view.tsx"
  },
  {
    "id": "CE-COMP-not-found",
    "file": "src/components/not-found.tsx"
  },
  {
    "id": "CE-COMP-page-hero",
    "file": "src/components/page-hero.tsx"
  },
  {
    "id": "CE-COMP-page-toc",
    "file": "src/components/page-toc.tsx"
  },
  {
    "id": "CE-COMP-page-tools",
    "file": "src/components/page-tools.tsx"
  },
  {
    "id": "CE-COMP-pmo-panel",
    "file": "src/components/pmo-panel.tsx"
  },
  {
    "id": "CE-COMP-preview-host-bridge",
    "file": "src/components/preview-host-bridge.tsx"
  },
  {
    "id": "CE-COMP-related-content",
    "file": "src/components/related-content.tsx"
  },
  {
    "id": "CE-COMP-report-view",
    "file": "src/components/report-view.tsx"
  },
  {
    "id": "CE-COMP-section-page",
    "file": "src/components/section-page.tsx"
  },
  {
    "id": "CE-COMP-shell",
    "file": "src/components/shell.tsx"
  },
  {
    "id": "CE-COMP-site-nav",
    "file": "src/components/site-nav.tsx"
  },
  {
    "id": "CE-COMP-slide-deck",
    "file": "src/components/slide-deck.tsx"
  },
  {
    "id": "CE-COMP-study",
    "file": "src/components/study.tsx"
  },
  {
    "id": "CE-COMP-subscription",
    "file": "src/components/subscription.tsx"
  },
  {
    "id": "CE-COMP-tool-desk",
    "file": "src/components/tool-desk.tsx"
  },
  {
    "id": "CE-COMP-translated",
    "file": "src/components/translated.tsx"
  },
  {
    "id": "CE-COMP-vila-asset",
    "file": "src/components/vila-asset.tsx"
  },
  {
    "id": "CE-COMP-vila-hub",
    "file": "src/components/vila-hub.tsx"
  },
  {
    "id": "CE-COMP-vila-page",
    "file": "src/components/vila-page.tsx"
  },
  {
    "id": "CE-COMP-vila-source-home",
    "file": "src/components/vila-source-home.tsx"
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
    "source_type": "NORMATIVA"
  },
  {
    "canonical_id": "SRC-REV-ENF-USP-BRADEN-1999",
    "authority": "Revista de Enfermagem da USP",
    "jurisdiction": "BR",
    "source_type": "VALIDACAO"
  },
  {
    "canonical_id": "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA",
    "authority": "CAPES/MEC",
    "jurisdiction": "BR",
    "source_type": "GUIA"
  },
  {
    "canonical_id": "SRC-OMS-OBESIDADE-2000",
    "authority": "Organização Mundial da Saúde (OMS/WHO)",
    "jurisdiction": "INTERNACIONAL",
    "source_type": "NORMATIVA"
  },
  {
    "canonical_id": "SRC-APGAR-1953",
    "authority": "Current Researches in Anesthesia & Analgesia",
    "jurisdiction": "INTERNACIONAL",
    "source_type": "ARTIGO"
  },
  {
    "canonical_id": "SRC-GOTEJAMENTO-FORMULA-CLASSICA",
    "authority": "Prática assistencial de gotejamento",
    "jurisdiction": "BR",
    "source_type": "TECNICA"
  },
  {
    "canonical_id": "SRC-CLINICAL-PENDING",
    "authority": "PENDING_HUMAN_REVIEW",
    "jurisdiction": "BR",
    "source_type": "PROTOCOLO"
  },
  {
    "canonical_id": "SRC-CLINICAL-VALIDATED",
    "authority": "PENDING_HUMAN_REVIEW",
    "jurisdiction": "BR",
    "source_type": "PROTOCOLO"
  }
] as const;
export const contractToolBindings = [
  {
    "canonical_id": "AB-ALDRETE-ATIVIDADE",
    "field_path": "tool.aldrete.criteria.atividade",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-RESPIRACAO",
    "field_path": "tool.aldrete.criteria.respiracao",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-CIRCULACAO",
    "field_path": "tool.aldrete.criteria.circulacao",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-CONSCIENCIA",
    "field_path": "tool.aldrete.criteria.consciencia",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-SATURACAO",
    "field_path": "tool.aldrete.criteria.saturacao",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-BAND-OK",
    "field_path": "tool.aldrete.bands.ok",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-BAND-WARN",
    "field_path": "tool.aldrete.bands.warn",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-BAND-DANGER",
    "field_path": "tool.aldrete.bands.danger",
    "source_ids": [
      "SRC-CFM-PARECER-28-2020"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-SENSORIAL",
    "field_path": "tool.braden.criteria.sensorial",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-UMIDADE",
    "field_path": "tool.braden.criteria.umidade",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-ATIVIDADE",
    "field_path": "tool.braden.criteria.atividade",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-MOBILIDADE",
    "field_path": "tool.braden.criteria.mobilidade",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-NUTRICAO",
    "field_path": "tool.braden.criteria.nutricao",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-FRICCAO",
    "field_path": "tool.braden.criteria.friccao",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-MUITOALTO",
    "field_path": "tool.braden.bands.muitoAlto",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-ALTO",
    "field_path": "tool.braden.bands.alto",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-MODERADO",
    "field_path": "tool.braden.bands.moderado",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-BAIXO",
    "field_path": "tool.braden.bands.baixo",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BRADEN-BAND-SEMRISCO",
    "field_path": "tool.braden.bands.semRisco",
    "source_ids": [
      "SRC-REV-ENF-USP-BRADEN-1999"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-QUEDAS",
    "field_path": "tool.morse.criteria.quedas",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-DIAGNOSTICO",
    "field_path": "tool.morse.criteria.diagnostico",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-AUXILIO",
    "field_path": "tool.morse.criteria.auxilio",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-VENOSO",
    "field_path": "tool.morse.criteria.venoso",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-MARCHA",
    "field_path": "tool.morse.criteria.marcha",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-MENTAL",
    "field_path": "tool.morse.criteria.mental",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-BAND-BAIXO",
    "field_path": "tool.morse.bands.baixo",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-BAND-MEDIO",
    "field_path": "tool.morse.bands.medio",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MORSE-BAND-ALTO",
    "field_path": "tool.morse.bands.alto",
    "source_ids": [
      "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-APARENCIA",
    "field_path": "tool.apgar.criteria.aparencia",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-PULSO",
    "field_path": "tool.apgar.criteria.pulso",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-REFLEXO",
    "field_path": "tool.apgar.criteria.reflexo",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-TONUS",
    "field_path": "tool.apgar.criteria.tonus",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-COR",
    "field_path": "tool.apgar.criteria.cor",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-BAND-NORMAL",
    "field_path": "tool.apgar.bands.normal",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-BAND-DEPRESSAO",
    "field_path": "tool.apgar.bands.depressao",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APGAR-BAND-GRAVE",
    "field_path": "tool.apgar.bands.grave",
    "source_ids": [
      "SRC-APGAR-1953"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-VOLUME",
    "field_path": "tool.gotejamento.fields.volume",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-HORAS",
    "field_path": "tool.gotejamento.fields.horas",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-MINUTOS",
    "field_path": "tool.gotejamento.fields.minutos",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOTEJAMENTO-FATOR",
    "field_path": "tool.gotejamento.fields.fator",
    "source_ids": [
      "SRC-GOTEJAMENTO-FORMULA-CLASSICA"
    ],
    "authority_class": "TECHNICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-IMC-PESO",
    "field_path": "tool.imc.fields.peso",
    "source_ids": [
      "SRC-OMS-OBESIDADE-2000"
    ],
    "authority_class": "TECHNICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-IMC-ALTURA",
    "field_path": "tool.imc.fields.altura",
    "source_ids": [
      "SRC-OMS-OBESIDADE-2000"
    ],
    "authority_class": "TECHNICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CTX-NOME",
    "field_path": "tool.contexto.nome",
    "source_ids": [],
    "authority_class": "INTERNAL_CONFIG",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CTX-IDADE",
    "field_path": "tool.contexto.idade",
    "source_ids": [],
    "authority_class": "INTERNAL_CONFIG",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CTX-SETOR",
    "field_path": "tool.contexto.setor",
    "source_ids": [],
    "authority_class": "INTERNAL_CONFIG",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CTX-DATA",
    "field_path": "tool.contexto.data",
    "source_ids": [],
    "authority_class": "INTERNAL_CONFIG",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SBAR-SITUACAO",
    "field_path": "tool.sbar.criteria.situacao",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SBAR-BACKGROUND",
    "field_path": "tool.sbar.criteria.background",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SBAR-AVALIACAO",
    "field_path": "tool.sbar.criteria.avaliacao",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SBAR-RECOMENDACAO",
    "field_path": "tool.sbar.criteria.recomendacao",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SBAR-BAND-OK",
    "field_path": "tool.sbar.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NANDA-NIC-NOC-DIAGNOSTICO",
    "field_path": "tool.nanda-nic-noc.criteria.diagnostico",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NANDA-NIC-NOC-BAND-OK",
    "field_path": "tool.nanda-nic-noc.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-KROULIK-ATIVIDADE",
    "field_path": "tool.aldrete-kroulik.criteria.atividade",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-KROULIK-RESPIRACAO",
    "field_path": "tool.aldrete-kroulik.criteria.respiracao",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-KROULIK-CIRCULACAO",
    "field_path": "tool.aldrete-kroulik.criteria.circulacao",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-KROULIK-BAND-OK",
    "field_path": "tool.aldrete-kroulik.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-KROULIK-BAND-WARN",
    "field_path": "tool.aldrete-kroulik.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ALDRETE-KROULIK-BAND-DANGER",
    "field_path": "tool.aldrete-kroulik.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APACHE-II-TEMPERATURA",
    "field_path": "tool.apache-ii.criteria.temperatura",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APACHE-II-PA",
    "field_path": "tool.apache-ii.criteria.pa",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APACHE-II-BAND-OK",
    "field_path": "tool.apache-ii.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APACHE-II-BAND-WARN",
    "field_path": "tool.apache-ii.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-APACHE-II-BAND-DANGER",
    "field_path": "tool.apache-ii.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ASA-CLASSE",
    "field_path": "tool.asa.criteria.classe",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ASA-BAND-OK",
    "field_path": "tool.asa.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ASA-BAND-WARN",
    "field_path": "tool.asa.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ASA-BAND-DANGER",
    "field_path": "tool.asa.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BALLARD-NEUROMUSCULAR",
    "field_path": "tool.ballard.criteria.neuromuscular",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BALLARD-FISICO",
    "field_path": "tool.ballard.criteria.fisico",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BALLARD-BAND-OK",
    "field_path": "tool.ballard.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BALLARD-BAND-WARN",
    "field_path": "tool.ballard.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BARTHEL-ALIMENTACAO",
    "field_path": "tool.barthel.criteria.alimentacao",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BARTHEL-BANHEIRO",
    "field_path": "tool.barthel.criteria.banheiro",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BARTHEL-BAND-OK",
    "field_path": "tool.barthel.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BARTHEL-BAND-WARN",
    "field_path": "tool.barthel.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BPS-BEHAVIORAL",
    "field_path": "tool.bps.criteria.behavioral",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BPS-BAND-OK",
    "field_path": "tool.bps.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BPS-BAND-WARN",
    "field_path": "tool.bps.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BERG-CRITERIO",
    "field_path": "tool.berg.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BERG-BAND-OK",
    "field_path": "tool.berg.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BERG-BAND-WARN",
    "field_path": "tool.berg.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BERG-BAND-DANGER",
    "field_path": "tool.berg.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BISHOP-CRITERIO",
    "field_path": "tool.bishop.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BISHOP-BAND-OK",
    "field_path": "tool.bishop.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BISHOP-BAND-WARN",
    "field_path": "tool.bishop.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-BISHOP-BAND-DANGER",
    "field_path": "tool.bishop.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAM-ICU-CRITERIO",
    "field_path": "tool.cam-icu.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAM-ICU-BAND-OK",
    "field_path": "tool.cam-icu.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAM-ICU-BAND-WARN",
    "field_path": "tool.cam-icu.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAM-ICU-BAND-DANGER",
    "field_path": "tool.cam-icu.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAPURRO-CRITERIO",
    "field_path": "tool.capurro.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAPURRO-BAND-OK",
    "field_path": "tool.capurro.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAPURRO-BAND-WARN",
    "field_path": "tool.capurro.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CAPURRO-BAND-DANGER",
    "field_path": "tool.capurro.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CINCINNATI-CRITERIO",
    "field_path": "tool.cincinnati.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CINCINNATI-BAND-OK",
    "field_path": "tool.cincinnati.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CINCINNATI-BAND-WARN",
    "field_path": "tool.cincinnati.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CINCINNATI-BAND-DANGER",
    "field_path": "tool.cincinnati.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WIFI-SVS-CRITERIO",
    "field_path": "tool.wifi-svs.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WIFI-SVS-BAND-OK",
    "field_path": "tool.wifi-svs.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WIFI-SVS-BAND-WARN",
    "field_path": "tool.wifi-svs.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WIFI-SVS-BAND-DANGER",
    "field_path": "tool.wifi-svs.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-II-CRITERIO",
    "field_path": "tool.copsoq-ii.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-II-BAND-OK",
    "field_path": "tool.copsoq-ii.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-II-BAND-WARN",
    "field_path": "tool.copsoq-ii.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-II-BAND-DANGER",
    "field_path": "tool.copsoq-ii.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-III-CRITERIO",
    "field_path": "tool.copsoq-iii.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-III-BAND-OK",
    "field_path": "tool.copsoq-iii.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-III-BAND-WARN",
    "field_path": "tool.copsoq-iii.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-COPSOQ-III-BAND-DANGER",
    "field_path": "tool.copsoq-iii.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CORNELL-CRITERIO",
    "field_path": "tool.cornell.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CORNELL-BAND-OK",
    "field_path": "tool.cornell.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CORNELL-BAND-WARN",
    "field_path": "tool.cornell.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CORNELL-BAND-DANGER",
    "field_path": "tool.cornell.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CRIES-CRITERIO",
    "field_path": "tool.cries.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CRIES-BAND-OK",
    "field_path": "tool.cries.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CRIES-BAND-WARN",
    "field_path": "tool.cries.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CRIES-BAND-DANGER",
    "field_path": "tool.cries.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CURB-65-CRITERIO",
    "field_path": "tool.curb-65.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CURB-65-BAND-OK",
    "field_path": "tool.curb-65.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CURB-65-BAND-WARN",
    "field_path": "tool.curb-65.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-CURB-65-BAND-DANGER",
    "field_path": "tool.curb-65.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOWNTON-CRITERIO",
    "field_path": "tool.downton.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOWNTON-BAND-OK",
    "field_path": "tool.downton.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOWNTON-BAND-WARN",
    "field_path": "tool.downton.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOWNTON-BAND-DANGER",
    "field_path": "tool.downton.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ELPO-CRITERIO",
    "field_path": "tool.elpo.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ELPO-BAND-OK",
    "field_path": "tool.elpo.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ELPO-BAND-WARN",
    "field_path": "tool.elpo.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ELPO-BAND-DANGER",
    "field_path": "tool.elpo.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FAST-CRITERIO",
    "field_path": "tool.fast.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FAST-BAND-OK",
    "field_path": "tool.fast.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FAST-BAND-WARN",
    "field_path": "tool.fast.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FAST-BAND-DANGER",
    "field_path": "tool.fast.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FLACC-CRITERIO",
    "field_path": "tool.flacc.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FLACC-BAND-OK",
    "field_path": "tool.flacc.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FLACC-BAND-WARN",
    "field_path": "tool.flacc.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FLACC-BAND-DANGER",
    "field_path": "tool.flacc.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FOUR-CRITERIO",
    "field_path": "tool.four.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FOUR-BAND-OK",
    "field_path": "tool.four.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FOUR-BAND-WARN",
    "field_path": "tool.four.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FOUR-BAND-DANGER",
    "field_path": "tool.four.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FUGULIN-CRITERIO",
    "field_path": "tool.fugulin.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FUGULIN-BAND-OK",
    "field_path": "tool.fugulin.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FUGULIN-BAND-WARN",
    "field_path": "tool.fugulin.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-FUGULIN-BAND-DANGER",
    "field_path": "tool.fugulin.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GDS-CRITERIO",
    "field_path": "tool.gds.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GDS-BAND-OK",
    "field_path": "tool.gds.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GDS-BAND-WARN",
    "field_path": "tool.gds.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GDS-BAND-DANGER",
    "field_path": "tool.gds.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GLASGOW-CRITERIO",
    "field_path": "tool.glasgow.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GLASGOW-BAND-OK",
    "field_path": "tool.glasgow.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GLASGOW-BAND-WARN",
    "field_path": "tool.glasgow.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GLASGOW-BAND-DANGER",
    "field_path": "tool.glasgow.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOSNELL-CRITERIO",
    "field_path": "tool.gosnell.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOSNELL-BAND-OK",
    "field_path": "tool.gosnell.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOSNELL-BAND-WARN",
    "field_path": "tool.gosnell.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-GOSNELL-BAND-DANGER",
    "field_path": "tool.gosnell.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HAMILTON-CRITERIO",
    "field_path": "tool.hamilton.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HAMILTON-BAND-OK",
    "field_path": "tool.hamilton.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HAMILTON-BAND-WARN",
    "field_path": "tool.hamilton.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HAMILTON-BAND-DANGER",
    "field_path": "tool.hamilton.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HENDRICH-II-CRITERIO",
    "field_path": "tool.hendrich-ii.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HENDRICH-II-BAND-OK",
    "field_path": "tool.hendrich-ii.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HENDRICH-II-BAND-WARN",
    "field_path": "tool.hendrich-ii.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HENDRICH-II-BAND-DANGER",
    "field_path": "tool.hendrich-ii.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HUMPTY-DUMPTY-CRITERIO",
    "field_path": "tool.humpty-dumpty.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HUMPTY-DUMPTY-BAND-OK",
    "field_path": "tool.humpty-dumpty.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HUMPTY-DUMPTY-BAND-WARN",
    "field_path": "tool.humpty-dumpty.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-HUMPTY-DUMPTY-BAND-DANGER",
    "field_path": "tool.humpty-dumpty.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOHNS-CRITERIO",
    "field_path": "tool.johns.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOHNS-BAND-OK",
    "field_path": "tool.johns.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOHNS-BAND-WARN",
    "field_path": "tool.johns.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOHNS-BAND-DANGER",
    "field_path": "tool.johns.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOUVET-CRITERIO",
    "field_path": "tool.jouvet.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOUVET-BAND-OK",
    "field_path": "tool.jouvet.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOUVET-BAND-WARN",
    "field_path": "tool.jouvet.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-JOUVET-BAND-DANGER",
    "field_path": "tool.jouvet.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-KATZ-CRITERIO",
    "field_path": "tool.katz.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-KATZ-BAND-OK",
    "field_path": "tool.katz.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-KATZ-BAND-WARN",
    "field_path": "tool.katz.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-KATZ-BAND-DANGER",
    "field_path": "tool.katz.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LACHS-CRITERIO",
    "field_path": "tool.lachs.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LACHS-BAND-OK",
    "field_path": "tool.lachs.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LACHS-BAND-WARN",
    "field_path": "tool.lachs.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LACHS-BAND-DANGER",
    "field_path": "tool.lachs.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LANSS-CRITERIO",
    "field_path": "tool.lanss.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LANSS-BAND-OK",
    "field_path": "tool.lanss.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LANSS-BAND-WARN",
    "field_path": "tool.lanss.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LANSS-BAND-DANGER",
    "field_path": "tool.lanss.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LAWTON-CRITERIO",
    "field_path": "tool.lawton.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LAWTON-BAND-OK",
    "field_path": "tool.lawton.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LAWTON-BAND-WARN",
    "field_path": "tool.lawton.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-LAWTON-BAND-DANGER",
    "field_path": "tool.lawton.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MANCHESTER-CRITERIO",
    "field_path": "tool.manchester.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MANCHESTER-BAND-OK",
    "field_path": "tool.manchester.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MANCHESTER-BAND-WARN",
    "field_path": "tool.manchester.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MANCHESTER-BAND-DANGER",
    "field_path": "tool.manchester.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEEM-CRITERIO",
    "field_path": "tool.meem.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEEM-BAND-OK",
    "field_path": "tool.meem.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEEM-BAND-WARN",
    "field_path": "tool.meem.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEEM-BAND-DANGER",
    "field_path": "tool.meem.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEOWS-CRITERIO",
    "field_path": "tool.meows.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEOWS-BAND-OK",
    "field_path": "tool.meows.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEOWS-BAND-WARN",
    "field_path": "tool.meows.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MEOWS-BAND-DANGER",
    "field_path": "tool.meows.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MOCA-CRITERIO",
    "field_path": "tool.moca.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MOCA-BAND-OK",
    "field_path": "tool.moca.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MOCA-BAND-WARN",
    "field_path": "tool.moca.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-MOCA-BAND-DANGER",
    "field_path": "tool.moca.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NEWS-CRITERIO",
    "field_path": "tool.news.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NEWS-BAND-OK",
    "field_path": "tool.news.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NEWS-BAND-WARN",
    "field_path": "tool.news.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NEWS-BAND-DANGER",
    "field_path": "tool.news.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIHSS-CRITERIO",
    "field_path": "tool.nihss.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIHSS-BAND-OK",
    "field_path": "tool.nihss.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIHSS-BAND-WARN",
    "field_path": "tool.nihss.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIHSS-BAND-DANGER",
    "field_path": "tool.nihss.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIPS-CRITERIO",
    "field_path": "tool.nips.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIPS-BAND-OK",
    "field_path": "tool.nips.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIPS-BAND-WARN",
    "field_path": "tool.nips.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NIPS-BAND-DANGER",
    "field_path": "tool.nips.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NORTON-CRITERIO",
    "field_path": "tool.norton.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NORTON-BAND-OK",
    "field_path": "tool.norton.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NORTON-BAND-WARN",
    "field_path": "tool.norton.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-NORTON-BAND-DANGER",
    "field_path": "tool.norton.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOR-NUMERICA-CRITERIO",
    "field_path": "tool.dor-numerica.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOR-NUMERICA-BAND-OK",
    "field_path": "tool.dor-numerica.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOR-NUMERICA-BAND-WARN",
    "field_path": "tool.dor-numerica.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-DOR-NUMERICA-BAND-DANGER",
    "field_path": "tool.dor-numerica.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-OFRAS-CRITERIO",
    "field_path": "tool.ofras.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-OFRAS-BAND-OK",
    "field_path": "tool.ofras.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-OFRAS-BAND-WARN",
    "field_path": "tool.ofras.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-OFRAS-BAND-DANGER",
    "field_path": "tool.ofras.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PAINAD-CRITERIO",
    "field_path": "tool.painad.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PAINAD-BAND-OK",
    "field_path": "tool.painad.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PAINAD-BAND-WARN",
    "field_path": "tool.painad.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PAINAD-BAND-DANGER",
    "field_path": "tool.painad.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PELOD-CRITERIO",
    "field_path": "tool.pelod.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PELOD-BAND-OK",
    "field_path": "tool.pelod.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PELOD-BAND-WARN",
    "field_path": "tool.pelod.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PELOD-BAND-DANGER",
    "field_path": "tool.pelod.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PEWS-CRITERIO",
    "field_path": "tool.pews.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PEWS-BAND-OK",
    "field_path": "tool.pews.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PEWS-BAND-WARN",
    "field_path": "tool.pews.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PEWS-BAND-DANGER",
    "field_path": "tool.pews.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PERROCA-CRITERIO",
    "field_path": "tool.perroca.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PERROCA-BAND-OK",
    "field_path": "tool.perroca.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PERROCA-BAND-WARN",
    "field_path": "tool.perroca.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PERROCA-BAND-DANGER",
    "field_path": "tool.perroca.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PRISM-CRITERIO",
    "field_path": "tool.prism.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PRISM-BAND-OK",
    "field_path": "tool.prism.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PRISM-BAND-WARN",
    "field_path": "tool.prism.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-PRISM-BAND-DANGER",
    "field_path": "tool.prism.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-QSOFA-CRITERIO",
    "field_path": "tool.qsofa.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-QSOFA-BAND-OK",
    "field_path": "tool.qsofa.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-QSOFA-BAND-WARN",
    "field_path": "tool.qsofa.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-QSOFA-BAND-DANGER",
    "field_path": "tool.qsofa.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RAMSAY-CRITERIO",
    "field_path": "tool.ramsay.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RAMSAY-BAND-OK",
    "field_path": "tool.ramsay.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RAMSAY-BAND-WARN",
    "field_path": "tool.ramsay.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RAMSAY-BAND-DANGER",
    "field_path": "tool.ramsay.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RANCHO-LOS-AMIGOS-CRITERIO",
    "field_path": "tool.rancho-los-amigos.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RANCHO-LOS-AMIGOS-BAND-OK",
    "field_path": "tool.rancho-los-amigos.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RANCHO-LOS-AMIGOS-BAND-WARN",
    "field_path": "tool.rancho-los-amigos.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RANCHO-LOS-AMIGOS-BAND-DANGER",
    "field_path": "tool.rancho-los-amigos.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RICHMOND-CRITERIO",
    "field_path": "tool.richmond.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RICHMOND-BAND-OK",
    "field_path": "tool.richmond.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RICHMOND-BAND-WARN",
    "field_path": "tool.richmond.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-RICHMOND-BAND-DANGER",
    "field_path": "tool.richmond.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SAPS-III-CRITERIO",
    "field_path": "tool.saps-iii.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SAPS-III-BAND-OK",
    "field_path": "tool.saps-iii.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SAPS-III-BAND-WARN",
    "field_path": "tool.saps-iii.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SAPS-III-BAND-DANGER",
    "field_path": "tool.saps-iii.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SILVERMAN-ANDERSON-CRITERIO",
    "field_path": "tool.silverman-anderson.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SILVERMAN-ANDERSON-BAND-OK",
    "field_path": "tool.silverman-anderson.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SILVERMAN-ANDERSON-BAND-WARN",
    "field_path": "tool.silverman-anderson.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SILVERMAN-ANDERSON-BAND-DANGER",
    "field_path": "tool.silverman-anderson.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SINBAD-CRITERIO",
    "field_path": "tool.sinbad.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SINBAD-BAND-OK",
    "field_path": "tool.sinbad.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SINBAD-BAND-WARN",
    "field_path": "tool.sinbad.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SINBAD-BAND-DANGER",
    "field_path": "tool.sinbad.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SOFA-CRITERIO",
    "field_path": "tool.sofa.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SOFA-BAND-OK",
    "field_path": "tool.sofa.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SOFA-BAND-WARN",
    "field_path": "tool.sofa.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-SOFA-BAND-DANGER",
    "field_path": "tool.sofa.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-TINETTI-CRITERIO",
    "field_path": "tool.tinetti.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-TINETTI-BAND-OK",
    "field_path": "tool.tinetti.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-TINETTI-BAND-WARN",
    "field_path": "tool.tinetti.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-TINETTI-BAND-DANGER",
    "field_path": "tool.tinetti.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WATERLOW-CRITERIO",
    "field_path": "tool.waterlow.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WATERLOW-BAND-OK",
    "field_path": "tool.waterlow.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WATERLOW-BAND-WARN",
    "field_path": "tool.waterlow.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WATERLOW-BAND-DANGER",
    "field_path": "tool.waterlow.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WOOD-DOWNES-CRITERIO",
    "field_path": "tool.wood-downes.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WOOD-DOWNES-BAND-OK",
    "field_path": "tool.wood-downes.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WOOD-DOWNES-BAND-WARN",
    "field_path": "tool.wood-downes.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-WOOD-DOWNES-BAND-DANGER",
    "field_path": "tool.wood-downes.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ZARIT-CRITERIO",
    "field_path": "tool.zarit.criteria.criterio",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ZARIT-BAND-OK",
    "field_path": "tool.zarit.bands.ok",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ZARIT-BAND-WARN",
    "field_path": "tool.zarit.bands.warn",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
  },
  {
    "canonical_id": "AB-ZARIT-BAND-DANGER",
    "field_path": "tool.zarit.bands.danger",
    "source_ids": [
      "SRC-CLINICAL-PENDING"
    ],
    "authority_class": "CLINICAL",
    "decision": "BOUND"
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
    "canonical_id": "FD-SBAR-SITUACAO",
    "field_path": "tool.sbar.criteria.situacao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-SBAR-BACKGROUND",
    "field_path": "tool.sbar.criteria.background",
    "source_ids": []
  },
  {
    "canonical_id": "FD-SBAR-AVALIACAO",
    "field_path": "tool.sbar.criteria.avaliacao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-SBAR-RECOMENDACAO",
    "field_path": "tool.sbar.criteria.recomendacao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-NANDA-NIC-NOC-DIAGNOSTICO",
    "field_path": "tool.nanda-nic-noc.criteria.diagnostico",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ALDRETE-KROULIK-ATIVIDADE",
    "field_path": "tool.aldrete-kroulik.criteria.atividade",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ALDRETE-KROULIK-RESPIRACAO",
    "field_path": "tool.aldrete-kroulik.criteria.respiracao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ALDRETE-KROULIK-CIRCULACAO",
    "field_path": "tool.aldrete-kroulik.criteria.circulacao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-APACHE-II-TEMPERATURA",
    "field_path": "tool.apache-ii.criteria.temperatura",
    "source_ids": []
  },
  {
    "canonical_id": "FD-APACHE-II-PA",
    "field_path": "tool.apache-ii.criteria.pa",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ASA-CLASSE",
    "field_path": "tool.asa.criteria.classe",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BALLARD-NEUROMUSCULAR",
    "field_path": "tool.ballard.criteria.neuromuscular",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BALLARD-FISICO",
    "field_path": "tool.ballard.criteria.fisico",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BARTHEL-ALIMENTACAO",
    "field_path": "tool.barthel.criteria.alimentacao",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BARTHEL-BANHEIRO",
    "field_path": "tool.barthel.criteria.banheiro",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BPS-BEHAVIORAL",
    "field_path": "tool.bps.criteria.behavioral",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BERG-CRITERIO",
    "field_path": "tool.berg.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-BISHOP-CRITERIO",
    "field_path": "tool.bishop.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CAM-ICU-CRITERIO",
    "field_path": "tool.cam-icu.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CAPURRO-CRITERIO",
    "field_path": "tool.capurro.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CINCINNATI-CRITERIO",
    "field_path": "tool.cincinnati.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-WIFI-SVS-CRITERIO",
    "field_path": "tool.wifi-svs.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-COPSOQ-II-CRITERIO",
    "field_path": "tool.copsoq-ii.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-COPSOQ-III-CRITERIO",
    "field_path": "tool.copsoq-iii.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CORNELL-CRITERIO",
    "field_path": "tool.cornell.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CRIES-CRITERIO",
    "field_path": "tool.cries.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-CURB-65-CRITERIO",
    "field_path": "tool.curb-65.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-DOWNTON-CRITERIO",
    "field_path": "tool.downton.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ELPO-CRITERIO",
    "field_path": "tool.elpo.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-FAST-CRITERIO",
    "field_path": "tool.fast.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-FLACC-CRITERIO",
    "field_path": "tool.flacc.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-FOUR-CRITERIO",
    "field_path": "tool.four.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-FUGULIN-CRITERIO",
    "field_path": "tool.fugulin.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-GDS-CRITERIO",
    "field_path": "tool.gds.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-GLASGOW-CRITERIO",
    "field_path": "tool.glasgow.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-GOSNELL-CRITERIO",
    "field_path": "tool.gosnell.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-HAMILTON-CRITERIO",
    "field_path": "tool.hamilton.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-HENDRICH-II-CRITERIO",
    "field_path": "tool.hendrich-ii.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-HUMPTY-DUMPTY-CRITERIO",
    "field_path": "tool.humpty-dumpty.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-JOHNS-CRITERIO",
    "field_path": "tool.johns.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-JOUVET-CRITERIO",
    "field_path": "tool.jouvet.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-KATZ-CRITERIO",
    "field_path": "tool.katz.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-LACHS-CRITERIO",
    "field_path": "tool.lachs.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-LANSS-CRITERIO",
    "field_path": "tool.lanss.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-LAWTON-CRITERIO",
    "field_path": "tool.lawton.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MANCHESTER-CRITERIO",
    "field_path": "tool.manchester.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MEEM-CRITERIO",
    "field_path": "tool.meem.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MEOWS-CRITERIO",
    "field_path": "tool.meows.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-MOCA-CRITERIO",
    "field_path": "tool.moca.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-NEWS-CRITERIO",
    "field_path": "tool.news.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-NIHSS-CRITERIO",
    "field_path": "tool.nihss.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-NIPS-CRITERIO",
    "field_path": "tool.nips.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-NORTON-CRITERIO",
    "field_path": "tool.norton.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-DOR-NUMERICA-CRITERIO",
    "field_path": "tool.dor-numerica.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-OFRAS-CRITERIO",
    "field_path": "tool.ofras.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-PAINAD-CRITERIO",
    "field_path": "tool.painad.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-PELOD-CRITERIO",
    "field_path": "tool.pelod.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-PEWS-CRITERIO",
    "field_path": "tool.pews.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-PERROCA-CRITERIO",
    "field_path": "tool.perroca.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-PRISM-CRITERIO",
    "field_path": "tool.prism.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-QSOFA-CRITERIO",
    "field_path": "tool.qsofa.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-RAMSAY-CRITERIO",
    "field_path": "tool.ramsay.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-RANCHO-LOS-AMIGOS-CRITERIO",
    "field_path": "tool.rancho-los-amigos.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-RICHMOND-CRITERIO",
    "field_path": "tool.richmond.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-SAPS-III-CRITERIO",
    "field_path": "tool.saps-iii.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-SILVERMAN-ANDERSON-CRITERIO",
    "field_path": "tool.silverman-anderson.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-SINBAD-CRITERIO",
    "field_path": "tool.sinbad.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-SOFA-CRITERIO",
    "field_path": "tool.sofa.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-TINETTI-CRITERIO",
    "field_path": "tool.tinetti.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-WATERLOW-CRITERIO",
    "field_path": "tool.waterlow.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-WOOD-DOWNES-CRITERIO",
    "field_path": "tool.wood-downes.criteria.criterio",
    "source_ids": []
  },
  {
    "canonical_id": "FD-ZARIT-CRITERIO",
    "field_path": "tool.zarit.criteria.criterio",
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
    "id": "CE-COMP-admin-account-header",
    "component_key": "admin-account-header"
  },
  {
    "id": "CE-COMP-admin-bulk-import",
    "component_key": "admin-bulk-import"
  },
  {
    "id": "CE-COMP-admin-console",
    "component_key": "admin-console"
  },
  {
    "id": "CE-COMP-admin-module-workspace",
    "component_key": "admin-module-workspace"
  },
  {
    "id": "CE-COMP-admin-schema-editor",
    "component_key": "admin-schema-editor"
  },
  {
    "id": "CE-COMP-admin-sidebar-tree",
    "component_key": "admin-sidebar-tree"
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
    "id": "CE-COMP-article-icons",
    "component_key": "article-icons"
  },
  {
    "id": "CE-COMP-article-page",
    "component_key": "article-page"
  },
  {
    "id": "CE-COMP-article-pieces",
    "component_key": "article-pieces"
  },
  {
    "id": "CE-COMP-biography-view",
    "component_key": "biography-view"
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
    "id": "CE-COMP-clinical-form",
    "component_key": "clinical-form"
  },
  {
    "id": "CE-COMP-clinical-sheet",
    "component_key": "clinical-sheet"
  },
  {
    "id": "CE-COMP-clinical-tool",
    "component_key": "clinical-tool"
  },
  {
    "id": "CE-COMP-commander-panel",
    "component_key": "commander-panel"
  },
  {
    "id": "CE-COMP-community",
    "component_key": "community"
  },
  {
    "id": "CE-COMP-editorial-view",
    "component_key": "editorial-view"
  },
  {
    "id": "CE-COMP-form-view",
    "component_key": "form-view"
  },
  {
    "id": "CE-COMP-governance-panel",
    "component_key": "governance-panel"
  },
  {
    "id": "CE-COMP-guide-view",
    "component_key": "guide-view"
  },
  {
    "id": "CE-COMP-home-page",
    "component_key": "home-page"
  },
  {
    "id": "CE-COMP-institutional-template",
    "component_key": "institutional-template"
  },
  {
    "id": "CE-COMP-interface",
    "component_key": "interface"
  },
  {
    "id": "CE-COMP-library-canonical",
    "component_key": "library-canonical"
  },
  {
    "id": "CE-COMP-library-shelves",
    "component_key": "library-shelves"
  },
  {
    "id": "CE-COMP-library-view",
    "component_key": "library-view"
  },
  {
    "id": "CE-COMP-local-workbench-page",
    "component_key": "local-workbench-page"
  },
  {
    "id": "CE-COMP-module-directory",
    "component_key": "module-directory"
  },
  {
    "id": "CE-COMP-norm-view",
    "component_key": "norm-view"
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
    "id": "CE-COMP-pmo-panel",
    "component_key": "pmo-panel"
  },
  {
    "id": "CE-COMP-preview-host-bridge",
    "component_key": "preview-host-bridge"
  },
  {
    "id": "CE-COMP-related-content",
    "component_key": "related-content"
  },
  {
    "id": "CE-COMP-report-view",
    "component_key": "report-view"
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
    "id": "CE-COMP-slide-deck",
    "component_key": "slide-deck"
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
    "id": "CE-COMP-tool-desk",
    "component_key": "tool-desk"
  },
  {
    "id": "CE-COMP-translated",
    "component_key": "translated"
  },
  {
    "id": "CE-COMP-vila-asset",
    "component_key": "vila-asset"
  },
  {
    "id": "CE-COMP-vila-hub",
    "component_key": "vila-hub"
  },
  {
    "id": "CE-COMP-vila-page",
    "component_key": "vila-page"
  },
  {
    "id": "CE-COMP-vila-source-home",
    "component_key": "vila-source-home"
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
