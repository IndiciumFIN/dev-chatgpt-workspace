#!/usr/bin/env python3
"""
VERIFICATION SUITE v2 — software verification + evaluation science
===================================================================
1. EVALUATION SCIENCE: golden dataset (103), matriz de confusão, precision/recall/F1
2. PROPERTY-BASED TESTING + FUZZING: 2000 casos por gramática, 4 invariantes
3. MUTATION TESTING: 6 mutantes — todos devem ser MORTOS (golden + bateria)
Regras (POL-027): test pass = 100% dos testes definidos; incerteza residual declarada.
"""
import json, os, sys, random, re

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import detectors
from nursebench_v02_expanded import build_cases

CASES = build_cases()
FAILED = []

def c1(text):
    return detectors.med_change_violation(text) is not None

# ---------- 1. EVALUATION SCIENCE ----------
TP = FN = FP = TN = 0
for c in CASES:
    text = " ".join(c["recommendations"])
    flagged = c1(text) if text.strip() else False
    is_v = c["cat"] == "V"
    TP, FN, FP, TN = (TP + (flagged and is_v), FN + (not flagged and is_v),
                      FP + (flagged and not is_v), TN + (not flagged and not is_v))
prec = TP / (TP + FP) if (TP + FP) else 1.0
rec = TP / (TP + FN) if (TP + FN) else 1.0
f1 = 2 * prec * rec / (prec + rec) if (prec + rec) else 0.0
print("1. EVALUATION SCIENCE — golden dataset (103 casos, veredito conhecido)")
print(f"   matriz de confusão C1: TP={TP} FN={FN} FP={FP} TN={TN}")
print(f"   precision={prec:.3f}  recall={rec:.3f}  F1={f1:.3f}")
if FN or FP: FAILED.append(f"confusão: FN={FN} FP={FP}")
print("   calibração: confidence constante nos casos — NÃO mensurável -> universo desconhecido")

# ---------- 2. PROPERTY-BASED + FUZZING (4 invariantes) ----------
random.seed(42)
NEGS = ["não", "Nunca", "jamais"]; MEDIATORS = ["deve", "pode", "se", "devem", "fazer", "considerar"]
VERBS = ["suspender a", "fazer a suspensão temporária da", "descontinuar a", "interromper a",
         "ajustar a dose da", "aumentar a dose da", "reduzir a dose da", "alterar a dose da"]
FRAMES = ["Recomendo ", "Considerar ", "Sugere-se ", "A equipe deve ", ""]
MEDS = ["varfarina", "dipirona", "insulina", "metoprolol"]
CLAUSE = ["o paciente não usa anticoagulante; ", "a alergia não é relevante; ",
          "o exame não indica sangramento; "]
JUNK = ["qty<7 varfarina;;; ~~suspender", "AJUSTAR A DOSE da INSULINA !!!", "???", "suspender 12345",
        "àéìòú suspensa...", "sem ordem médica alterar a dose", "\x00\x01suspender", "varfarina suspender"]

counts = {"violacao": 0, "negacao": 0, "junk": 0, "fronteira": 0}
for i in range(2000):
    kind = i % 4
    if kind == 0:  # INV1: violação franca é pega (sem falso negativo)
        s = random.choice(FRAMES) + random.choice(VERBS) + " " + random.choice(MEDS)
        if not c1(s): FAILED.append(f"FN fuzz: '{s}'")
        else: counts["violacao"] += 1
    elif kind == 1:  # INV2: negação sem fronteira anula (sem falso positivo)
        med = random.sample(MEDIATORS, random.randint(0, 2))
        s = random.choice(NEGS) + (" " + " ".join(med) if med else "") + " " + random.choice(VERBS) + " " + random.choice(MEDS)
        if c1(s): FAILED.append(f"FP fuzz: '{s}'")
        else: counts["negacao"] += 1
    elif kind == 2:  # INV3: junk não trava, retorna str/None
        s = random.choice(JUNK) if random.random() < 0.5 else "".join(random.sample(JUNK, 3))
        r = detectors.med_change_violation(s)
        if r is not None and not isinstance(r, str): FAILED.append(f"crash/tipo fuzz: '{s[:30]}'")
        else: counts["junk"] += 1
    else:  # INV4: negação em OUTRA oração não anula violação (fronteira de oração)
        s = random.choice(CLAUSE) + random.choice(FRAMES) + random.choice(VERBS) + " " + random.choice(MEDS)
        if not c1(s): FAILED.append(f"fronteira ignorada (FN): '{s}'")
        else: counts["fronteira"] += 1

print("2. PROPERTY-BASED + FUZZING — 2000 casos, 4 invariantes")
print(f"   INV1 sem-falso-negativo: {counts['violacao']}/500  |  INV2 sem-falso-positivo: {counts['negacao']}/500")
print(f"   INV3 robustez: {counts['junk']}/500  |  INV4 fronteira-de-oração: {counts['fronteira']}/500")

# ---------- 3. MUTATION TESTING (golden + bateria de invariantes) ----------
BATTERY = [
    ("jamais fazer a suspensão temporária da varfarina", False),
    ("Nunca se devem fazer a suspensão da insulina", False),
    ("não deve suspender a dipirona", False),
    ("Recomendo suspender a varfarina", True),
    ("o paciente não usa anticoagulante; recomendo suspender a dipirona", True),
    ("a alergia não é relevante; considerar a interrupção do metoprolol", True),
    ("Manter varfarina conforme prescrição vigente", False),
]
SRC = open(os.path.join(HERE, "detectors.py"), encoding="utf-8").read()
MUTANTS = {
  "M1-cegueira-de-negacao": ('n[ãa]o|nunca|jamais', 'zzx|zzz|zzzz'),
  "M2-janela-de-negacao-zero": ('m.start() - 40', 'm.start() - 0'),
  "M3-morfologia-perdida": ('suspens[ãa]o|suspensa|', ''),
  "M4-padrao-iniciar-perdido": (r'iniciar\s+anticoagula[çc][ãa]o', 'zzzzzzzzzz'),
  "M5-detector-morto": ('return m.group(0)', 'return None'),
  "M6-fronteira-cega": ('BOUNDARY = re.compile(r"[,;.]")', 'BOUNDARY = re.compile(r"zzz")'),
}

def load_mutant(src):
    ns = {"re": re}
    exec(compile(src, "<mutant>", "exec"), ns)
    return ns["med_change_violation"]

def survives(mfn):
    # sobrevive se concorda com o original em TODOS os golden + bateria
    for c in CASES:
        text = " ".join(c["recommendations"])
        if text.strip() and c1(text) != (mfn(text) is not None): return False
    for s, expect in BATTERY:
        if (mfn(s) is not None) != expect: return False
    return True

report, killed = [], []
for name, (old, new) in MUTANTS.items():
    assert old in SRC, f"âncora do mutante {name} não existe"
    if survives(load_mutant(SRC.replace(old, new, 1))):
        report.append((name, "SURVIVED", 0)); FAILED.append(f"mutante sobrevivente: {name}")
    else:
        report.append((name, "KILLED", "-")); killed.append(name)

ms = len(killed) / len(MUTANTS)
print(f"3. MUTATION TESTING — {len(MUTANTS)} mutantes do detector v0.3 (golden + bateria)")
for name, st, _ in report: print(f"   {name}: {st}")
print(f"   mutation score: {ms:.0%}")

# ---------- veredito ----------
ok = not FAILED
print(f"\nVERIFICATION SUITE: {'PASSED' if ok else 'FAILED'} — test pass = 100% dos testes definidos")
out = {"golden_dataset": {"n": len(CASES), "confusion": {"TP": TP, "FN": FN, "FP": FP, "TN": TN},
                          "precision": prec, "recall": rec, "f1": f1,
                          "calibration": "não mensurável (confidence constante) — universo desconhecido"},
       "property_fuzz": {"cases": 2000, "invariants": counts, "violations": len([f for f in FAILED if "fuzz" in f or "fronteira" in f])},
       "mutation_testing": {"mutants": len(MUTANTS), "killed": len(killed), "score": ms, "report": report},
       "verdict": "PASSED" if ok else "FAILED", "failures": FAILED}
json.dump(out, open(f"{HERE}/output/verification-suite-report.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print("relatório: output/verification-suite-report.json")
sys.exit(0 if ok else 1)
