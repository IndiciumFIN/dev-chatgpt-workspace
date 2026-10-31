#!/usr/bin/env python3
"""
Motor de auditoria de dados — "Data Kernel" (read-only).

Reimplementa, de forma executável e amarrada a este repositório, os cenários
de auditoria descritos na spec genérica (Kernel/Metamodelo, Master Data &
Atomização, Policy-as-Code/Segurança, i18n, SEO, JSON-LD/Schema.org),
usando apenas a biblioteca padrão do Python.

Por que só stdlib: o CI deste repositório roda `npm ci` e não tem etapa de
instalação de dependências Python. Um motor que precisa de `pip install
psycopg[binary] yaml pandas pydantic` não roda no gate — vira código morto.
Por isso:
  * a política é JSON (não YAML);
  * o modo estático não usa NENHUMA dependência externa;
  * o modo PostgreSQL usa `psycopg` se existir, e falha com mensagem acionável
    se não existir (nunca com erro cru de módulo).

Modos:
  static    — auditoria sobre arquivos do repositório (SQL de migrações,
              JSON de conteúdo, registros). Não precisa de banco.
  postgres  — auditoria sobre um PostgreSQL real (read-only), via psycopg.
  auto      — static; tenta postgres apenas se DATABASE_URL existir.

Saída: JSON (default) ou Markdown, em stdout e/ou --report <arquivo>.

Exit codes:
  0 = sem erro (warnings permitidos)
  1 = erro(s) bloqueante(s) encontrado(s)
  2 = uso incorreto / insumo obrigatório ausente

Segurança: o motor é estritamente READ-ONLY. Nunca escreve no banco, nunca
aplica migração, nunca toca Supabase de produção. Modo postgres abre
transação READ ONLY e faz rollback no final.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Iterable

ENGINE_VERSION = "0.1.0"

DEFAULT_POLICY = "registers/governance/audit-policy.v1.json"
DEFAULT_CONTENT_GLOBS = ("src/lib/content/**/*.json",)
DEFAULT_MIGRATION_GLOBS = ("migrations/**/*.sql", "supabase/migrations/**/*.sql")

SLUG_RE = re.compile(r"^[a-z0-9-]+$")
IDENT_RE = re.compile(r"^[a-z_][a-z0-9_]*$")


# --------------------------------------------------------------------------
# modelo
# --------------------------------------------------------------------------
@dataclass
class Finding:
    rule: str
    severity: str          # error | warning | info
    message: str
    where: str = ""
    evidence: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Report:
    engine: str = f"data-kernel/{ENGINE_VERSION}"
    mode: str = "static"
    root: str = "."
    policy_version: str = "none"
    counts: dict[str, int] = field(default_factory=dict)
    findings: list[Finding] = field(default_factory=list)

    def add(self, f: Finding) -> None:
        self.findings.append(f)

    def finalize(self) -> None:
        c: dict[str, int] = {}
        for f in self.findings:
            c[f.severity] = c.get(f.severity, 0) + 1
        self.counts = c

    @property
    def errors(self) -> int:
        return self.counts.get("error", 0)

    def to_dict(self) -> dict[str, Any]:
        self.finalize()
        return {
            "engine": self.engine,
            "mode": self.mode,
            "root": self.root,
            "policyVersion": self.policy_version,
            "counts": self.counts,
            "findings": [f.to_dict() for f in self.findings],
        }


# --------------------------------------------------------------------------
# política (as code)
# --------------------------------------------------------------------------
def load_policy(root: Path, rel: str = DEFAULT_POLICY) -> dict[str, Any]:
    p = root / rel
    if not p.exists():
        raise FileNotFoundError(
            f"política ausente: {rel} — crie-a (task T2.2) ou aponte --policy"
        )
    return json.loads(p.read_text(encoding="utf-8"))


def iter_files(root: Path, patterns: Iterable[str]) -> list[Path]:
    seen: set[Path] = set()
    out: list[Path] = []
    for pat in patterns:
        for p in sorted(root.glob(pat)):
            if p.is_file() and p not in seen:
                seen.add(p)
                out.append(p)
    return out


# --------------------------------------------------------------------------
# modo estático
# --------------------------------------------------------------------------
def scan_content(root: Path, policy: dict[str, Any], report: Report) -> None:
    """SEO-01/02, I18N-01/02, JSD-01/02 sobre os JSON de conteúdo."""
    seo = policy.get("seo", {})
    title_min, title_max = seo.get("metaTitleMin", 30), seo.get("metaTitleMax", 60)
    desc_min, desc_max = seo.get("metaDescriptionMin", 120), seo.get("metaDescriptionMax", 160)
    required_locales = set(policy.get("i18n", {}).get("requiredLocales", []))
    slug_fields = set(seo.get("slugFields", ["slug", "url", "canonical"]))
    title_fields = set(seo.get("titleFields", ["metaTitle", "title", "meta_title"]))
    desc_fields = set(seo.get("descriptionFields", ["metaDescription", "description", "meta_description"]))

    seen_slugs: dict[str, str] = {}

    for path in iter_files(root, policy.get("contentGlobs", DEFAULT_CONTENT_GLOBS)):
        rel = str(path.relative_to(root))
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            report.add(Finding("JSON_INVALIDO", "error", f"JSON inválido: {e}", rel))
            continue
        if not isinstance(doc, dict):
            continue

        # SEO-02 — slug
        for field in slug_fields:
            value = doc.get(field)
            if isinstance(value, str) and value:
                slug = value.strip().strip("/")
                if not SLUG_RE.match(slug):
                    report.add(Finding("SEO-02", "error", f"slug inválido: {value!r}", rel, value))
                if slug in seen_slugs:
                    report.add(Finding("SEO-02", "error", f"slug duplicado com {seen_slugs[slug]}", rel, slug))
                else:
                    seen_slugs[slug] = rel

        # SEO-01 — meta title/description
        for field in title_fields:
            value = doc.get(field)
            if isinstance(value, str) and value.strip():
                n = len(value.strip())
                if not (title_min <= n <= title_max):
                    report.add(Finding("SEO-01", "warning", f"{field} com {n} caracteres (esperado {title_min}-{title_max})", rel))
        for field in desc_fields:
            value = doc.get(field)
            if isinstance(value, str) and value.strip():
                n = len(value.strip())
                if not (desc_min <= n <= desc_max):
                    report.add(Finding("SEO-01", "warning", f"{field} com {n} caracteres (esperado {desc_min}-{desc_max})", rel))

        # JSD-02 — coerência temporal
        pub, mod = doc.get("datePublished"), doc.get("dateModified")
        if isinstance(pub, str) and isinstance(mod, str) and pub and mod:
            if mod < pub:
                report.add(Finding("JSD-02", "error", f"dateModified {mod} anterior a datePublished {pub}", rel))

        # I18N-01/02 — paridade e traduções fantasma
        translations = doc.get("translations") or doc.get("i18n") or {}
        if isinstance(translations, dict) and translations:
            if required_locales:
                missing = sorted(required_locales - set(translations.keys()))
                if missing:
                    report.add(Finding("I18N-01", "warning", f"locales ausentes: {', '.join(missing)}", rel))
            source = doc.get("title") or doc.get("name") or ""
            for locale, text in translations.items():
                if not isinstance(text, str) or not text.strip():
                    report.add(Finding("I18N-02", "error", f"tradução vazia para {locale}", rel))
                elif isinstance(source, str) and source.strip() and text.strip() == source.strip() and locale != policy.get("i18n", {}).get("defaultLocale"):
                    report.add(Finding("I18N-02", "warning", f"tradução idêntica ao original em {locale}", rel))

        # JSD-01 — blocos de schema estruturado
        for key in ("jsonLd", "schema", "@type", "type"):
            value = doc.get(key)
            if isinstance(value, str) and value.strip() == "":
                report.add(Finding("JSD-01", "warning", f"campo de schema estruturado vazio: {key}", rel))


def scan_sql(root: Path, policy: dict[str, Any], report: Report) -> None:
    """KER-02, KER-03, MST-03 sobre os arquivos .sql de migração."""
    ddl = ""
    files = iter_files(root, policy.get("migrationGlobs", DEFAULT_MIGRATION_GLOBS))
    for path in files:
        rel = str(path.relative_to(root))
        text = path.read_text(encoding="utf-8", errors="replace")
        # strip de comentários para não contar DDL dentro de comentário
        stripped = re.sub(r"--[^\n]*", "", text)
        stripped = re.sub(r"/\*.*?\*/", "", stripped, flags=re.S)
        ddl += "\n" + stripped

        # KER-03 — mutabilidade indevida em tabelas declaradas STATIC/APPEND_ONLY
        for table in policy.get("tables", []):
            name = table.get("name")
            mutability = (table.get("mutability") or "").upper()
            if not name or mutability not in {"STATIC", "APPEND_ONLY"}:
                continue
            pattern = re.compile(rf"\b(UPDATE|DELETE\s+FROM)\s+{re.escape(name)}\b", re.I)
            for m in pattern.finditer(stripped):
                report.add(Finding("KER-03", "error", f"tabela {name} ({mutability}) sofre {m.group(1).upper()}", rel))

    # KER-02 — FKs lógicas declaradas x constraints físicas
    for rel in policy.get("logicalRelations", []):
        table = rel.get("table")
        column = rel.get("column")
        ref = rel.get("references", {})
        if not (table and column and ref.get("table") and ref.get("column")):
            continue
        fk_pat = re.compile(
            rf"(?:\bFOREIGN\s+KEY\s*\(\s*{re.escape(column)}\s*\)\s*)?"
            rf"\bREFERENCES\s+{re.escape(ref['table'])}\s*\(\s*{re.escape(ref['column'])}\s*\)",
            re.I,
        )
        if not fk_pat.search(ddl):
            report.add(
                Finding(
                    "KER-02",
                    "error",
                    f"FK lógica ausente no DDL: {table}.{column} → {ref['table']}.{ref['column']}",
                    "migrations/",
                )
            )

    # MST-03 — tipagem estrita
    for rule in policy.get("typedFields", []):
        table, column, expected = rule.get("table"), rule.get("column"), (rule.get("expected") or "").upper()
        if not (table and column and expected):
            continue
        col_pat = re.compile(
            rf"{re.escape(column)}\s+([A-Za-z][A-Za-z0-9_ ]*)", re.I
        )
        found = False
        for m in col_pat.finditer(ddl):
            found = True
            actual = m.group(1).strip().upper()
            if not actual.startswith(expected):
                report.add(
                    Finding("MST-03", "error", f"{table}.{column} declarado como {actual}, esperado {expected}", "migrations/")
                )
        if not found:
            report.add(Finding("MST-03", "warning", f"coluna {table}.{column} não encontrada no DDL", "migrations/"))


# --------------------------------------------------------------------------
# modo postgres (read-only)
# --------------------------------------------------------------------------
def resolve_pg_target(root: Path) -> tuple[str, str]:
    """
    Resolve o alvo do banco SEM quebrar com ENOENT.

    Falha observada em produção (31/10):
        ENOENT: no such file or directory, open '/var/task/_libs/pglite.data'

    Causa: o caminho do diretório de dados do PGlite foi tratado como
    pré-existente. A correção é materializar o diretório antes de abrir a
    base, e nunca depender de um caminho herdado do ambiente.

    Ordem de resolução:
      1. DATABASE_URL          → ("postgres", url)  (PostgreSQL real)
      2. PGLITE_DATA_DIR       → ("pglite", dir)    (diretório criado se faltar)
      3. padrão                → ("pglite", <root>/.tmp/pglite)
    """
    url = os.environ.get("DATABASE_URL", "").strip()
    if url:
        return "postgres", url
    data_dir = os.environ.get("PGLITE_DATA_DIR", "").strip()
    if not data_dir:
        data_dir = str((root / ".tmp" / "pglite").resolve())
    path = Path(data_dir)
    try:
        path.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        raise RuntimeError(
            f"não foi possível criar o diretório de dados do PGlite em {path}: {e}. "
            "Defina PGLITE_DATA_DIR para um caminho gravável ou DATABASE_URL para um PostgreSQL real."
        ) from e
    if not path.exists():
        raise RuntimeError(f"diretório de dados do PGlite ausente após criação: {path}")
    return "pglite", str(path)


PG_QUERIES = {
    # KER-01 — colunas sem descrição no catálogo
    "KER-01": """
        SELECT c.table_schema, c.table_name, c.column_name
        FROM information_schema.columns c
        JOIN pg_catalog.pg_namespace n ON n.nspname = c.table_schema
        JOIN pg_catalog.pg_class cl ON cl.relname = c.table_name AND cl.relnamespace = n.oid
        LEFT JOIN pg_catalog.pg_description d
          ON d.objoid = cl.oid AND d.objsubid = c.ordinal_position
        WHERE c.table_schema NOT IN ('pg_catalog','information_schema')
          AND d.description IS NULL
        ORDER BY 1,2,3
    """,
    # SEC-01 — privilégios de coluna
    "SEC-01": """
        SELECT table_schema, table_name, column_name, grantee, privilege_type
        FROM information_schema.column_privileges
        WHERE privilege_type = 'SELECT'
        ORDER BY 1,2,3,4
    """,
    # SEC-02 — RLS
    "SEC-02": """
        SELECT schemaname, tablename, rowsecurity
        FROM pg_catalog.pg_tables
        WHERE schemaname NOT IN ('pg_catalog','information_schema')
        ORDER BY 1,2
    """,
    # KER-03 — mutabilidade
    "KER-03": """
        SELECT schemaname, relname, n_tup_upd, n_tup_del, n_tup_ins
        FROM pg_catalog.pg_stat_user_tables
        ORDER BY 1,2
    """,
    # KER-02 — constraints
    "KER-02": """
        SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type
        FROM information_schema.table_constraints tc
        ORDER BY 1,2,3
    """,
}


def run_postgres(root: Path, policy: dict[str, Any], report: Report) -> None:
    kind, target = resolve_pg_target(root)
    if kind != "postgres":
        report.add(
            Finding(
                "DB_ALVO_INDISPONIVEL",
                "info",
                f"modo postgres requer PostgreSQL real (DATABASE_URL). Alvo local preparado: {target}",
                ".tmp/pglite",
            )
        )
        return
    try:
        import psycopg  # type: ignore
    except Exception as e:
        report.add(
            Finding(
                "DB_DRIVER_AUSENTE",
                "warning",
                "psycopg não está instalado; modo postgres indisponível neste ambiente. "
                "O modo estático continua válido. Para habilitar: pip install 'psycopg[binary]'.",
                "scripts/audit_data_kernel.py",
                str(e),
            )
        )
        return

    pii_columns = policy.get("security", {}).get("piiColumns", [])
    rls_tables = set(policy.get("security", {}).get("rlsRequiredTables", []))
    static_tables = {t.get("name"): (t.get("mutability") or "").upper() for t in policy.get("tables", [])}

    conn = psycopg.connect(target, autocommit=False)
    try:
        with conn.cursor() as cur:
            cur.execute("SET TRANSACTION READ ONLY")
            # KER-01
            cur.execute(PG_QUERIES["KER-01"])
            for schema, table, column in cur.fetchall():
                report.add(Finding("KER-01", "warning", f"coluna sem comentário: {schema}.{table}.{column}", "postgres"))
            # SEC-01
            cur.execute(PG_QUERIES["SEC-01"])
            for schema, table, column, grantee, priv in cur.fetchall():
                if column in pii_columns and not grantee.endswith("_admin"):
                    report.add(Finding("SEC-01", "error", f"PII acessível por {grantee}: {schema}.{table}.{column}", "postgres"))
            # SEC-02
            cur.execute(PG_QUERIES["SEC-02"])
            for schema, table, rowsecurity in cur.fetchall():
                if table in rls_tables and not rowsecurity:
                    report.add(Finding("SEC-02", "error", f"RLS desligada em {schema}.{table}", "postgres"))
            # KER-03
            cur.execute(PG_QUERIES["KER-03"])
            for schema, table, upd, dele, ins in cur.fetchall():
                mut = static_tables.get(table)
                if mut in {"STATIC", "APPEND_ONLY"} and (upd or dele):
                    report.add(Finding("KER-03", "error", f"{schema}.{table} ({mut}) com upd={upd} del={dele}", "postgres"))
    finally:
        conn.rollback()
        conn.close()


# --------------------------------------------------------------------------
# relatório
# --------------------------------------------------------------------------
def to_markdown(data: dict[str, Any]) -> str:
    lines = [
        f"# Auditoria Data Kernel — {data['engine']}",
        "",
        f"- modo: `{data['mode']}` · política: `{data['policyVersion']}`",
        f"- contagens: {data['counts']}",
        "",
        "| regra | severidade | onde | mensagem |",
        "|---|---|---|---|",
    ]
    for f in data["findings"]:
        lines.append(f"| {f['rule']} | {f['severity']} | {f['where']} | {f['message']} |")
    if not data["findings"]:
        lines.append("| — | — | — | nenhum achado |")
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Motor de auditoria de dados (read-only).")
    ap.add_argument("--root", default=".", help="raiz do repositório")
    ap.add_argument("--mode", default="auto", choices=["static", "postgres", "auto"])
    ap.add_argument("--policy", default=DEFAULT_POLICY)
    ap.add_argument("--report", default=None, help="arquivo de saída (JSON)")
    ap.add_argument("--markdown", default=None, help="arquivo de saída (Markdown)")
    ap.add_argument("--fail-on", default="error", choices=["error", "never"])
    args = ap.parse_args(argv)

    root = Path(args.root).resolve()
    report = Report(mode=args.mode, root=str(root))
    try:
        policy = load_policy(root, args.policy)
    except FileNotFoundError as e:
        print(f"[audit-data-kernel] {e}", file=sys.stderr)
        return 2
    report.policy_version = str(policy.get("schemaVersion", "none"))
    if (policy.get("populationStatus") or "").upper() != "COMPLETE":
        report.add(
            Finding(
                "POLITICA_NAO_POPULADA",
                "info",
                "política ainda em preenchimento: as regras com listas vazias não produzem achado "
                "(task T2.2). Ausência de item na política NÃO é conformidade.",
                args.policy,
            )
        )

    if args.mode in ("static", "auto"):
        scan_content(root, policy, report)
        scan_sql(root, policy, report)
    if args.mode == "postgres" or (args.mode == "auto" and os.environ.get("DATABASE_URL")):
        run_postgres(root, policy, report)

    data = report.to_dict()
    print(json.dumps(data, ensure_ascii=False, indent=2))
    if args.report:
        rp = root / args.report
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.markdown:
        mp = root / args.markdown
        mp.parent.mkdir(parents=True, exist_ok=True)
        mp.write_text(to_markdown(data), encoding="utf-8")

    if args.fail_on == "error" and report.errors:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
