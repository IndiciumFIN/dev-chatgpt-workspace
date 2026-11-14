"""NORM-KERNEL atomizador v0.1.0 — calibração.

Segmenta texto normativo em átomos deônticos (R1) ou trechos explicitamente
classificados como não-normativos (R4/R5). 1 linha = 1 segmento.
Dívidas v0 (universo desconhecido declarado): multi-átomo por linha, OCR/PDF,
deôntica implícita sem modal explícito, condicionais aninhadas (R7 parcial).
"""
import hashlib
import re

VERSION = "atomizer-v0.1.1"

# (padrão, atom_type, modality, confiança_base) — avaliados em ordem, primeiro casa.
PT_RULES = [
    (r"\b(considera-se|entende-se)\b", "definition", "definition", 0.80),
    (r"\b(é vedado|é proibido|não poderá|vedado ao)\b", "prohibition", "shall_not", 0.95),
    (r"\b(fica obrigatório|é obrigatório|deverá)\b", "obligation", "shall", 0.95),
    (r"\bpoderá\b|\bé facultado\b", "permission", "may", 0.90),
    (r"\b(fica assegurado|é assegurado)\b", "right", "is_entitled", 0.90),
    (r"\bentra em vigor\b", "scope", "shall", 0.70),
]
RFC_RULES = [
    (r"are to be interpreted as", "definition", "definition", 0.75),
    (r"\bMUST NOT\b|\bSHALL NOT\b", "prohibition", "shall_not", 0.98),
    (r"\bSHOULD NOT\b", "prohibition", "should_not", 0.90),
    (r"\bMUST\b|\bREQUIRED\b|\bSHALL\b", "obligation", "shall", 0.98),
    (r"\bSHOULD\b", "obligation", "should", 0.90),
    (r"\bMAY\b|\bOPTIONAL\b", "permission", "may", 0.90),
]
NONNORM_REASONS = [
    (r"^\s*$", "blank"),
    (r"^PORTARIA", "header"),
    (r"resolve:?\s*$", "preamble"),
    (r"^\d+\. [A-Z]", "heading"),
    (r"END OF FIXTURE|FIXTURE|NÃO É NORMA REAL|SYNTHETIC|CALIBRATION|ATRIBUTED", "disclaimer"),
    (r"^[A-ZÀ-Ú][A-ZÀ-Ú \dºª.,']+$", "signature_block"),
    (r"^\d{1,2} de [a-zç]+ de \d{4}", "date_place"),
    (r"^[A-ZÀ-Ú][a-zà-ú]+, \d{1,2} de ", "date_place"),
]
SUBJECTS = ["fabricante", "importador", "paciente", "usuário", "prestador",
            "sender", "receiver", "implementation"]
ACTIONS = ["notificar", "comercializar", "solicitar", "acessar",
           "include", "send", "verify", "ignore"]
OBJECTS = ["evento adverso", "dispositivo clínico", "relatório de notificação",
           "Message-ID", "signature", "extensions", "prorrogação"]
AGENT_REQUIRED = {"obligation", "prohibition", "permission", "right"}


def sha(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _find(lexicon, text):
    for term in lexicon:
        if re.search(r"\b" + re.escape(term) + r"\b", text, re.IGNORECASE):
            return term
    return None


def parse_document(text: str, lang: str):
    """Retorna lista de segmentos em ordem, cada um com cobertura completa (R4/R5)."""
    rules = PT_RULES if lang == "pt" else RFC_RULES
    flags = re.IGNORECASE if lang == "pt" else 0
    compiled = [(re.compile(p, flags), t, m, c) for p, t, m, c in rules]
    nonnorm = [(re.compile(p, re.IGNORECASE), r) for p, r in NONNORM_REASONS]
    lines = text.split("\n")
    segments = []
    current_locator = ["preambulo"]
    for i, line in enumerate(lines, start=1):
        seg_text = line + "\n" if i < len(lines) else line
        locator = current_locator
        if lang == "pt":
            m = re.match(r"^Art\. ?(\d+)", line)
            if m:
                locator = ["art. " + m.group(1)]
        else:
            m = re.match(r"^(\d+)\. ", line)
            if m:
                current_locator = ["s. " + m.group(1)]
                locator = current_locator
        matched_rule = None
        for pattern, atom_type, modality, conf in compiled:
            if pattern.search(line):
                matched_rule = (atom_type, modality, conf)
                break
        if matched_rule:
            atom_type, modality, conf = matched_rule
            subject = _find(SUBJECTS, line)
            action = _find(ACTIONS, line)
            obj = _find(OBJECTS, line)
            if atom_type in AGENT_REQUIRED and (not subject or not action):
                conf = round(conf * 0.7, 3)
            dm = re.search(r"em até (\d+) (horas|dias)", line)
            segments.append({
                "kind": "atom",
                "line": i,
                "text": seg_text,
                "atom_type": atom_type,
                "modality": modality,
                "subject_raw": subject,
                "subject_canon": "DICT:agent:" + slug(subject) if subject else None,
                "action_raw": action,
                "action_canon": "DICT:action:" + slug(action) if action else None,
                "object_raw": obj,
                "object_canon": "DICT:object:" + slug(obj) if obj else None,
                "deadline_raw": dm.group(0) if dm else None,
                "locator_path": list(locator),
                "confidence": conf,
            })
        else:
            reason = "non_normative_other"
            for pattern, r in nonnorm:
                if pattern.search(line):
                    reason = r
                    break
            segments.append({"kind": "nonnorm", "line": i, "text": seg_text,
                             "reason": reason, "locator_path": list(locator)})
    return segments
