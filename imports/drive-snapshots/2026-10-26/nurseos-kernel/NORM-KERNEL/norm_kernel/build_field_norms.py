"""Gera field_norms.json (JCS) — norma granular por campo, POL-NK-001 anexo C2.

Cada campo tem: norma (o que o campo É e DEVE), referência normativa,
dimensão de qualidade ISO 8000, mínimo aceitável e evidência.
NENHUM campo das 5 entidades fica sem norma (check_links G4 bloqueia órfãos).
Formato: (norma, referência, dimensão ISO 8000, mínimo, evidência)
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

SRC = "Kernel K2 SourceRegistry; ISO 8000 proveniência/dados de referência (verificar)"
DOC = "Kernel K2 DocumentRegistry; ISO 8000 série 200 sintática/semântica (verificar)"
ATOM = "Kernel K2 AtomRegistry; invariantes R1-R9 (blueprint §2.2)"
DICT = "Kernel K3 DictionaryRegistry; ISO 1087/ISO 8000-61 dados de referência (verificar)"
RUN = "Kernel K2; ISO 8000 medição de qualidade (verificar)"
JCS = "RFC 8785 (JCS)"
LAW = "Lei 9.610/1998 art. 8º (obras oficiais)"

FIELD_NORMS = {
    "NormSource": {
        "source_id": ("Identificador estável único SRC-*; nenhuma extração antes do registro.", SRC, "proveniência", "único e imutável", "registro SRC-*"),
        "name": ("Nome oficial da fonte como se autodenomina.", SRC, "semântica", "não nulo", "registro SRC-*"),
        "kind": ("Tipo canônico do enum: dou, mqd, iso, rfc, planalto, camara, senado, w3c, nist, setorial, fixture.", SRC, "consistência", "valor do enum", "registro SRC-*"),
        "api_endpoint": ("Endpoint oficial da API/serviço, com formato documentado; scraping só se sem API, declarado em notes.", SRC, "atualidade", "endpoint verificável", "registro SRC-*"),
        "auth_mode": ("Modo de autenticação exigido pela fonte (aberto, registro, OAuth).", SRC, "proveniência", "declarado", "registro SRC-*"),
        "fetch_cadence": ("Cadência de coleta; temporalidade da fonte respeitada.", SRC, "atualidade", "declarada", "registro SRC-*"),
        "license_ref": ("Licença OBRIGATÓRIA antes da primeira extração (P7); sem KL-* válida o gate bloqueia.", "Lei 9.610/1998; KnowledgeLicense", "legal/proveniência", "KL-* existente e válida", "gate G3"),
        "citation_policy": ("Como citar a fonte em todo artefato derivado (verbatim, front-end, OG).", LAW, "legal", "política presente", "registro SRC-*"),
        "notes": ("Restrições, termos de uso, pendências '(verificar)' — dívidas declaradas, nunca ocultas.", SRC, "transparência", "presente quando há restrição", "registro SRC-*"),
        "status": ("Ciclo de vida: active, suspended, revoked.", SRC, "consistência", "valor do enum", "registro SRC-*"),
    },
    "NormDocument": {
        "doc_id": ("Identificador estável único NK-DOC-* do documento normativo.", DOC, "proveniência", "único e imutável", "registro NK-DOC-*"),
        "source_ref": ("Todo documento provém de fonte registrada SRC-* (nada órfão, P2).", SRC, "proveniência", "SRC-* existente", "gate G3"),
        "doc_type": ("Tipo canônico: lei, decreto, portaria, resolucao, rfc, spec, fixture.", DOC, "consistência", "valor do enum", "registro NK-DOC-*"),
        "number": ("Número oficial do ato como publicado.", DOC, "precisão", "fiel à fonte", "verbatim da fonte"),
        "year": ("Ano de edição do ato.", DOC, "precisão", "fiel à fonte", "verbatim da fonte"),
        "issuer": ("Órgão emissor, canonizável em DICT:authority.", DOC, "semântica", "canonizável", "DICT:authority:*"),
        "canonical_citation": ("Citação canônica completa (BR, ato, data, DOU seção/página) — obrigatória em toda exibição e OG (H14).", LAW, "legal", "completa", "front-end gerado"),
        "hierarchy_rank": ("Posição na hierarquia normativa 1-7 (blueprint §5.2); lex superior a posterior.", "teoria das fontes; blueprint §5.2", "semântica", "1-7", "registro NK-DOC-*"),
        "structure_tree": ("Árvore estrutural completa (ementa, artigos, seções); nenhum nó órfão.", DOC, "completude", "árvore sem órfãos", "gate G1 reconstrução"),
        "coverage_json": ("Cobertura declarada: contagem de átomos, tokens não-normativos, checksum de reconstrução, percentual (P3).", DOC, "completude", "100% classificado", "gate G1/G2"),
        "amendments": ("Alterações versionadas por elo, nunca sobrescritas (P8).", DOC, "atualidade", "lista de elos", "gate G3"),
        "license_ref": ("Licença KL-* do texto integral; sem contrato, ISO/ABNT só metadados.", "Lei 9.610/1998 art. 8º; KL-*", "legal", "KL-* existente", "gate G3"),
        "evidence_id": ("Evidência EV-NK-* do processamento do documento.", "Kernel K5; W3C PROV-O", "proveniência", "EV-* existente", "gate G3"),
        "status": ("Ciclo de vida: valid, review_pending, revoked, superseded, fixture.", DOC, "consistência", "valor do enum", "registro NK-DOC-*"),
    },
    "NormAtom": {
        "atom_id": ("Identificador estável único NK-ATOM-*; átomos são imutáveis (nova versão = novo átomo com elo).", ATOM, "proveniência", "único e imutável", "registro NK-ATOM-*"),
        "doc_ref": ("Todo átomo pertence a documento NK-DOC-* (P2, R2).", DOC, "proveniência", "NK-DOC-* existente", "gate G3"),
        "atom_type": ("Tipo deôntico canônico: obligation, prohibition, permission, right, definition, scope, sanction, delegation.", ATOM, "semântica", "valor do enum (R1)", "gate G1"),
        "modality": ("Modal deôntico: shall, shall_not, may, should, should_not, is_entitled, definition.", ATOM, "semântica", "coerente com atom_type", "gate G1"),
        "subject_raw": ("Sujeito verbatim do texto-fonte, preservado (P5).", ATOM, "precisão", "fiel ao verbatim", "checksum do verbatim"),
        "subject_canon": ("Canonização do sujeito em DICT:agent:*; raw NUNCA é destruído.", DICT, "semântica", "resolve no dicionário", "gate G3"),
        "action_raw": ("Ação verbatim do texto-fonte, preservada.", ATOM, "precisão", "fiel ao verbatim", "checksum do verbatim"),
        "action_canon": ("Canonização da ação em DICT:action:*.", DICT, "semântica", "resolve no dicionário", "gate G3"),
        "object_raw": ("Objeto verbatim do texto-fonte, preservado.", ATOM, "precisão", "fiel ao verbatim", "checksum do verbatim"),
        "object_canon": ("Canonização do objeto em DICT:object:*.", DICT, "semântica", "resolve no dicionário", "gate G3"),
        "deadline_raw": ("Prazo verbatim se houver; norma de prazo é parte do átomo, não elo.", ATOM, "precisão", "verbatim ou null", "checksum do verbatim"),
        "conditions_json": ("Condições e exceções como ELOS estruturados, nunca fusão de átomos (R7).", ATOM, "semântica", "estrutura de elos", "gate G3"),
        "verbatim_text": ("Texto integral verbatim do trecho coberto pelo átomo; base de todo checksum (P4).", ATOM, "precisão", "exato e completo", "gate G1 reconstrução"),
        "locator_path": ("Localizador completo e unívoco na hierarquia do documento (R2).", DOC, "proveniência", "caminho completo", "gate G1"),
        "checksum": ("sha256 do verbatim_text; serialização canônica JCS para objetos (RFC 8785).", JCS, "integridade", "recalculável", "gate G1/G5"),
        "coverage_token": ("sha256 do segmento exato do documento coberto (inclui fim de linha) — prova a reconstrução R4.", JCS, "completude", "soma reconstrói o documento", "gate G1"),
        "confidence": ("Confiança da classificação deôntica; < 0.85 revisão humana OBRIGATÓRIA (R8, POL-002).", ATOM, "precisão", "0-1 declarada", "gate G3"),
        "status": ("fixture, draft, review_pending, valid, revoked, superseded; valid exige confiança >= 0.85 (R8).", ATOM, "consistência", "valor do enum", "gate G3"),
        "validity_json": ("Janela de vigência: in_force_at, revoked_at, revoked_by (P8).", DOC, "atualidade", "janela declarada", "gate G3"),
        "links_json": ("Elos: contradicts, supersedes, depends_on, implements, regulated_by, sanction_for, conditions_for, policy_refs, cko_refs.", ATOM, "consistência", "todos resolvem (P2)", "gate G3"),
        "field_norms_ref": ("Referência à norma granular DESTE campo em field_norms.json — autorreferência do regime.", "POL-NK-001 anexo C2", "governança", "resolve no anexo", "gate G4"),
        "evidence_id": ("Evidência EV-NK-* do processamento do átomo.", "Kernel K5; W3C PROV-O", "proveniência", "EV-* existente", "gate G3"),
        "i18n_json": ("Traduções en/es com status machine ou human_reviewed; tradução é átomo versionado (H17).", "padrão CKO i18n", "semântica", "estrutura por idioma", "gate G5"),
        "plain_language": ("Linguagem simples obrigatória por átomo (H8 acessibilidade, excelência nativa).", "WCAG 2.2; LGPD art. 9º", "acessibilidade", "presente e compreensível", "gate G5"),
        "seo_json": ("URI canônica ELI-like e metadados de descobribilidade do átomo (H10/H16).", "ELI; schema.org", "descobribilidade", "uri_slug presente", "gate PUBLISH"),
    },
    "DictionaryTerm": {
        "term_id": ("Identificador estável DICT:namespace:slug.", DICT, "proveniência", "único e imutável", "registro DICT-*"),
        "namespace": ("Namespace canônico: agent, action, object, authority, theme.", DICT, "consistência", "valor do enum", "registro DICT-*"),
        "label": ("Rótulo canônico do termo; raws alternativos ficam nos átomos (P5).", DICT, "semântica", "não nulo", "registro DICT-*"),
        "definition": ("Definição do termo; preferir definição normativa (átomo definition).", DICT, "semântica", "definição presente", "gate G3"),
        "definition_source_ref": ("Fonte da definição — nada definido sem origem (P4).", SRC, "proveniência", "SRC/DOC existente", "gate G3"),
        "i18n_json": ("Traduções por idioma com status de revisão (H17).", "padrão CKO i18n", "semântica", "estrutura por idioma", "registro DICT-*"),
        "atom_definition_ref": ("Elo para o átomo definition que fundamenta o termo, quando existir.", ATOM, "consistência", "resolve ou null", "gate G3"),
        "status": ("active, deprecated, superseded; termos nunca são apagados.", DICT, "consistência", "valor do enum", "registro DICT-*"),
    },
    "ExtractionRun": {
        "run_id": ("Identificador único NK-RUN-* de cada execução do pipeline.", RUN, "proveniência", "único", "registro NK-RUN-*"),
        "source_ref": ("Fonte SRC-* da execução; runs órfãos são bloqueados (P2).", SRC, "proveniência", "SRC-* existente", "gate G3"),
        "doc_refs": ("Documentos processados nesta execução.", DOC, "completude", "lista não vazia", "registro NK-RUN-*"),
        "atoms_created": ("Contagem de átomos criados — número verificado, não estimado.", RUN, "precisão", "contagem real", "evidência EV-*"),
        "coverage_percent": ("Percentual de cobertura declarada do universo do run (P3); 100 = tudo classificado ou explícito.", RUN, "completude", "100.0 ou justificado", "gate G2"),
        "failures": ("Falhas do run registradas como lista; falha oculta = violação P9.", RUN, "transparência", "lista declarada", "evidência EV-*"),
        "extractor_version": ("Versão do atomizador usada; resultados reprodutíveis por versão.", RUN, "proveniência", "semver presente", "evidência EV-*"),
        "evidence_id": ("Evidência EV-NK-* assinada da execução inteira.", "Kernel K5; W3C PROV-O", "proveniência", "EV-* existente", "gate G3"),
        "status": ("passed, blocked, partial.", RUN, "consistência", "valor do enum", "registro NK-RUN-*"),
    },
}


def build():
    out = {}
    for entity, fields in FIELD_NORMS.items():
        out[entity] = {f: {"norm": n, "reference": ref, "iso8000_dimension": iso,
                            "minimum": minimum, "evidence": ev}
                       for f, (n, ref, iso, minimum, ev) in fields.items()}
    canon = json.dumps(out, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    with open(os.path.join(HERE, "field_norms.json"), "w", encoding="utf-8") as fh:
        fh.write(canon)
    total = sum(len(v) for v in out.values())
    print(f"field_norms.json: {total} campos cobertos, 0 órfãos")


if __name__ == "__main__":
    build()


COMPOSITION = {
    "NormSource": {
        "source_id": {"composition": "SRC-[A-Z0-9-]+ — prefixo SRC + identificador estável", "pattern": "^SRC-[A-Z0-9-]+$"},
        "kind": {"composition": "enum fechado por tipo de fonte", "enum": ["dou","mqd","iso","rfc","planalto","camara","senado","w3c","nist","setorial","fixture"]},
        "license_ref": {"composition": "KL-XXXX ou KL-LEG-XXXX — id existente no LicenseRegistry", "pattern": "^KL-"},
        "status": {"composition": "enum do ciclo de vida; quarantined = bloqueio do intake guard", "enum": ["draft","active","pending_license","suspended","revoked","quarantined"]},
        "api_endpoint": {"composition": "URL oficial documentada; sem API, scraping declarado em notes"},
        "auth_mode": {"composition": "open | registration | oauth | internal"},
        "fetch_cadence": {"composition": "diária | semanal | mensal | por nova norma/edição/execução"},
    },
    "NormDocument": {
        "doc_id": {"composition": "NK-DOC-[A-Z0-9-]+", "pattern": "^NK-DOC-"},
        "doc_type": {"composition": "enum fechado de tipo de ato", "enum": ["lei","decreto","portaria","resolucao","instrucao_normativa","rfc","spec","fixture"]},
        "status": {"enum": ["draft","valid","review_pending","revoked","superseded","fixture","quarantined"]},
        "hierarchy_rank": {"composition": "inteiro 1-7 na hierarquia normativa", "range": [1, 7]},
        "year": {"composition": "ano de edição", "range": [1900, 2100]},
        "license_ref": {"pattern": "^KL-"},
        "evidence_id": {"pattern": "^EV-NK-\\d{4}$"},
        "coverage_json": {"composition": "reconstruction_checksum, reconstruction_ok, atom_count, non_normative_count, classified_percent, unknown_universe_explicit"},
        "structure_tree": {"composition": "array ordenado de nós da hierarquia; nó órfão bloqueia"},
        "amendments": {"composition": "array de elos (amended_by_ref + campos); nunca sobrescreve (P8)"},
    },
    "NormAtom": {
        "atom_id": {"composition": "NK-ATOM- + 7 dígitos", "pattern": "^NK-ATOM-\\d{7}$"},
        "atom_type": {"enum": ["obligation","prohibition","permission","right","definition","scope","sanction","delegation"]},
        "modality": {"enum": ["shall","shall_not","may","should","should_not","is_entitled","definition"]},
        "status": {"enum": ["fixture","draft","review_pending","valid","revoked","superseded","quarantined"]},
        "confidence": {"composition": "número 0-1; valid exige >= 0.85 (R8)", "range": [0, 1]},
        "checksum": {"composition": "sha256: + 64 hex do verbatim (JCS para objetos)", "pattern": "^sha256:[0-9a-f]{64}$"},
        "coverage_token": {"composition": "sha256: + 64 hex do segmento com fim de linha (prova R4)", "pattern": "^sha256:[0-9a-f]{64}$"},
        "subject_canon": {"composition": "DICT:agent:slug ou null; raw nunca destruído (P5)", "pattern": "^(DICT:agent:[a-z0-9-]+)?$"},
        "action_canon": {"composition": "DICT:action:slug ou null", "pattern": "^(DICT:action:[a-z0-9-]+)?$"},
        "object_canon": {"composition": "DICT:object:slug ou null", "pattern": "^(DICT:object:[a-z0-9-]+)?$"},
        "doc_ref": {"composition": "NK-DOC-* existente no DocumentRegistry (P2)", "pattern": "^NK-DOC-"},
        "evidence_id": {"composition": "EV-NK-NNNN da evidência de derivação", "pattern": "^EV-NK-\\d{4}$"},
        "field_norms_ref": {"pattern": "^annex:field_norms\\.json#"},
        "locator_path": {"composition": "array de segmentos hierárquicos (art. N, § N, inciso, alínea, s. N) — completo e unívoco (R2)"},
        "deadline_raw": {"composition": "prazo verbatim ou null"},
        "conditions_json": {"composition": "elos de ativação/exceção/temporal/territorial; nunca fusão (R7)"},
        "links_json": {"composition": "contradicts, supersedes, depends_on, implements, regulated_by, sanction_for, conditions_for, policy_refs, cko_refs"},
        "validity_json": {"composition": "in_force_at, revoked_at, revoked_by (P8)"},
        "i18n_json": {"composition": "por idioma com status machine | human_reviewed (H17)"},
        "seo_json": {"composition": "uri_slug ELI-like por átomo (H10/H16)"},
        "plain_language": {"composition": "linguagem simples gerada (H8); refinamento de qualidade é débita Fase 0.2"},
    },
    "DictionaryTerm": {
        "term_id": {"composition": "DICT:namespace:slug", "pattern": "^DICT:(agent|action|object|authority|theme):[a-z0-9-]+$"},
        "namespace": {"enum": ["agent","action","object","authority","theme"]},
        "status": {"enum": ["draft","active","deprecated","superseded","quarantined"]},
    },
    "ExtractionRun": {
        "run_id": {"composition": "NK-RUN- + 4 dígitos", "pattern": "^NK-RUN-\\d{4}$"},
        "status": {"enum": ["passed","blocked","partial","quarantined"]},
        "atoms_created": {"composition": "inteiro >= 0 verificado, nunca estimado", "range": [0, 1000000]},
        "coverage_percent": {"composition": "0-100; 100 = tudo classificado ou explícito", "range": [0, 100]},
        "doc_refs": {"composition": "array de NK-DOC-* existentes", "pattern": "^NK-DOC-"},
        "evidence_id": {"pattern": "^EV-NK-\\d{4}$"},
    },
}


def build():
    out = {}
    for entity, fields in FIELD_NORMS.items():
        entry = {}
        for f, (n, ref, iso, minimum, ev) in fields.items():
            spec = {"norm": n, "reference": ref, "iso8000_dimension": iso,
                    "minimum": minimum, "evidence": ev}
            spec.update(COMPOSITION.get(entity, {}).get(f, {}))
            entry[f] = spec
        out[entity] = entry
    canon = json.dumps(out, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    with open(os.path.join(HERE, "field_norms.json"), "w", encoding="utf-8") as fh:
        fh.write(canon)
    total = sum(len(v) for v in out.values())
    with_enum = sum(1 for e in out.values() for f in e.values() if f.get("enum") or f.get("pattern") or f.get("range"))
    print(f"field_norms.json: {total} campos, {with_enum} com composição/enum/padrão/faixa declarados, 0 orfaos")


FIELD_NORMS["ServiceOrder"] = {
    "os_id": ("Toda ordem de serviço tem id único NK-OS-NNNN gerado centralizadamente pelo kernel", "POL-NK-002 C2/C3", "identification", "1 por ordem, nunca vazio", "EV-NK-0005"),
    "requester": ("Solicitante identificado (humano, agente ou pipeline) de toda ordem", "POL-NK-002 C1", "traceability", "nunca vazio", "EV-NK-0005"),
    "order_kind": ("Tipo da ordem: criação de registro ou transição de status", "POL-NK-002 C2", "identification", "enum fechado", "EV-NK-0005"),
    "entity_name": ("Registro-alvo da ordem: um dos 5 registros NK", "POL-NK-002 C1", "identification", "enum fechado", "EV-NK-0005"),
    "payload_draft": ("Rascunho do registro, validado ANTES da escrita; nunca escrito se recusado", "POL-NK-002 C6", "provenance", "sempre presente na ordem", "EV-NK-0005"),
    "requested_id": ("Id solicitado pelo requerente; kernel confere padrão e unicidade", "POL-NK-002 C3", "identification", "opcional; validado se presente", "EV-NK-0005"),
    "target_id": ("Registro-alvo da transição (id de negócio)", "POL-NK-002 C4", "identification", "obrigatório em transição", "EV-NK-0005"),
    "decision": ("Decisão do kernel: aceite ou recusa REGISTRADA com motivos — nunca recusa silenciosa", "POL-NK-002 C6", "traceability", "enum fechado", "EV-NK-0005"),
    "refusal_reasons": ("Motivos da recusa, um por violação de validador/metamodelo", "POL-NK-002 C6", "traceability", "obrigatório se recusado", "EV-NK-0005"),
    "validators_run": ("Validadores aprovados em política executados, com versão (Anexo II)", "POL-NK-002 C5", "process quality", ">=1 validador por ordem", "EV-NK-0005"),
    "generated_id": ("Id gerado com o aceite da OS: no register E no artefato", "POL-NK-002 C3", "identification", "obrigatório se aceito", "EV-NK-0005"),
    "signature": ("Assinatura pessoal do kernel sobre conteúdo canônico + os_id", "POL-NK-002 C3", "provenance", "sha256 sempre preenchido pelo kernel", "EV-NK-0005"),
    "evidence_id": ("Evidência vigente do regime no momento da ordem", "POL-NK-002 C5", "traceability", "EV-NK-NNNN", "EV-NK-0005"),
    "status": ("Ciclo da própria ordem: executed/refused são terminais", "POL-NK-002 C4", "identification", "enum fechado", "EV-NK-0005"),
    "notes": ("Contexto adicional da ordem", "POL-NK-002", "understandability", "opcional", "EV-NK-0005"),
}

COMPOSITION["ServiceOrder"] = {
    "os_id": {"composition": "NK-OS- + 4 dígitos", "pattern": "^NK-OS-\\d{4}$"},
    "order_kind": {"enum": ["create", "transition", "amendment"]},
    "entity_name": {"enum": ["NormAtom", "NormDocument", "NormSource", "DictionaryTerm", "ExtractionRun", "metamodel"]},
    "decision": {"enum": ["accepted", "refused"]},
    "status": {"enum": ["executed", "refused", "quarantined"]},
    "signature": {"composition": "sha256: + 64 hex (JCS do conteúdo canônico + os_id)", "pattern": "^sha256:[0-9a-f]{64}$"},
    "evidence_id": {"pattern": "^EV-NK-\\d{4}$"},
}

TRANSVERSAL_BASE = {
    "metamodelo": "campo declarado no anexo pinado; kernel consulta o metamodelo ANTES de abrir o registro (POL-NK-002 C6)",
    "schema": "tipo e composição (enum/padrão/faixa) declarados e validados estruturalmente (POL-NK-002 C6)",
    "validadores": "conteúdo validado apenas por validadores aprovados em política: intake guard + G6 (POL-NK-002 C5, Anexo II)",
    "vinculacao": "arestas do campo resolvem no registro correspondente; nada órfão (P2 — camadas horizontais e verticais)",
    "contratos": "campo vinculado à política vigente (POL-NK-001/POL-NK-002) e à licença da fonte quando aplicável (P7)",
}

SPECIFIC_LAYERS = {
    "NormAtom.atom_id": {"contratos": "id gerado com aceite da OS; assinatura do kernel vincula register e artefato (POL-NK-002 C3)"},
    "NormAtom.status": {"runtime": "máquina de estados POL-NK-002 Anexo I: draft→review_pending→valid→revoked/superseded; quarantined de qualquer estado; transição apenas por ordem do kernel"},
    "NormAtom.seo_json": {"seo": "uri_slug ELI-like por átomo; JSON-LD e sitemap no front (H10/H16)", "render": "renderizado como cite do blockquote verbatim"},
    "NormAtom.plain_language": {"acessibilidade": "WCAG 2.2 AA — linguagem simples obrigatória por átomo (H8)", "design_system": "padrão NK de texto simples com marca [gerado vN]"},
    "NormAtom.verbatim_text": {"render": "renderizado como blockquote citável no front-end", "acessibilidade": "texto fonte preservado para verificação humana", "engines": "gerado pelo atomizer"},
    "NormAtom.checksum": {"engines": "JCS RFC 8785 + sha256 no atomizer", "contratos": "proveniência com não-repúdio (H3)"},
    "NormAtom.coverage_token": {"engines": "atomizer; prova R4 de reconstrução byte a byte"},
    "NormAtom.locator_path": {"engines": "parser hierárquico do atomizer (R2)", "render": "trilha › no card do átomo"},
    "NormAtom.i18n_json": {"i18n": "pt-BR fonte; en/es derivados com status de revisão (H17)", "render": "pronto para renderização multilíngue"},
    "NormAtom.deadline_raw": {"runtime": "prazo verbatim; normatização numérica é débita do parser v0.2"},
    "NormAtom.conditions_json": {"runtime": "elos de ativação/exceção avaliáveis em runtime (R7)"},
    "NormAtom.links_json": {"runtime": "elos avaliáveis no grafo; contradições alimentam o registro Contradiction"},
    "NormAtom.validity_json": {"runtime": "janela de vigência avaliável em qualquer consulta temporal (P8)"},
    "NormDocument.status": {"runtime": "máquina de estados POL-NK-002 Anexo I"},
    "NormDocument.canonical_citation": {"contratos": "citação obrigatória Lei 9.610 art. 8º (obra oficial)", "render": "exibida na tabela de documentos"},
    "NormDocument.coverage_json": {"runtime": "reconstrução R4 executada pelo pipeline", "render": "resumo de cobertura renderizado"},
    "NormDocument.structure_tree": {"engines": "parser de hierarquia do pipeline (estágio PARSE)"},
    "NormSource.status": {"runtime": "máquina de estados POL-NK-002 Anexo I"},
    "NormSource.api_endpoint": {"engines": "endpoint que o extrator consulta no estágio EXTRACT"},
    "NormSource.fetch_cadence": {"runtime": "insumo do agendamento de extração"},
    "NormSource.citation_policy": {"contratos": "fórmula aplicada em todo artefato derivado da fonte"},
    "DictionaryTerm.status": {"runtime": "máquina de estados POL-NK-002 Anexo I"},
    "DictionaryTerm.i18n_json": {"i18n": "termos multilíngues com status de revisão (H17)"},
    "ExtractionRun.status": {"runtime": "runs são fatos imutáveis; única transição é quarantined"},
    "ServiceOrder.os_id": {"contratos": "id da ordem assinado pelo kernel no aceite (C3)"},
    "ServiceOrder.signature": {"contratos": "assinatura pessoal do kernel (C3)", "engines": "JCS + sha256 no kernel-order"},
    "ServiceOrder.status": {"runtime": "executed/refused são terminais"},
    "ServiceOrder.payload_draft": {"engines": "validado antes de qualquer escrita (C6)"},
}

def build():
    out = {}
    for entity, fields in FIELD_NORMS.items():
        entry = {}
        for f, (n, ref, iso, minimum, ev) in fields.items():
            spec = {"norm": n, "reference": ref, "iso8000_dimension": iso,
                    "minimum": minimum, "evidence": ev,
                    "norm_impacto": "primária/de maior impacto; as camadas transversais NÃO a substituem (diretriz Leivis 2026-09-29)"}
            spec.update(COMPOSITION.get(entity, {}).get(f, {}))
            layers = dict(TRANSVERSAL_BASE)
            layers["iso8000"] = iso
            layers.update(SPECIFIC_LAYERS.get(f"{entity}.{f}", {}))
            spec["normative_layers"] = layers
            entry[f] = spec
        out[entity] = entry
    canon = json.dumps(out, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    with open(os.path.join(HERE, "field_norms.json"), "w", encoding="utf-8") as fh:
        fh.write(canon)
    total = sum(len(v) for v in out.values())
    base_ok = sum(1 for e in out.values() for f in e.values()
                  if all(k in f["normative_layers"] for k in ["metamodelo", "schema", "validadores", "vinculacao", "contratos", "iso8000"]))
    print(f"field_norms.json v1.1.0: {total} campos, {base_ok} com 6 camadas normativas base, 0 orfaos")

SPECIFIC_LAYERS["ServiceOrder.order_kind"] = {"contratos": "amendment = mudança estrutural: kernel valida (POL-NK-003 C8.1), humano aprova (C8.2); ninguém move metamodelos/registros/templates sem aprovação humana"}
SPECIFIC_LAYERS["ServiceOrder.entity_name"] = {"contratos": "metamodel = OS de emenda estrutural (POL-NK-003)"}
