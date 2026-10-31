#!/usr/bin/env python3
"""
Testes do motor de auditoria de dados.

Rodar:  python3 -m unittest discover -s tests -p 'test_*.py' -q

Só biblioteca padrão: o CI deste repositório não instala dependências Python.
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import audit_data_kernel as adk  # noqa: E402


def write(root: Path, rel: str, content) -> Path:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, (dict, list)):
        p.write_text(json.dumps(content, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        p.write_text(content, encoding="utf-8")
    return p


BASE_POLICY = {
    "schemaVersion": "0.1.0",
    "populationStatus": "COMPLETE",
    "contentGlobs": ["content/**/*.json"],
    "migrationGlobs": ["migrations/**/*.sql"],
    "i18n": {"defaultLocale": "pt-BR", "requiredLocales": ["pt-BR", "en"]},
    "seo": {
        "metaTitleMin": 30,
        "metaTitleMax": 60,
        "metaDescriptionMin": 120,
        "metaDescriptionMax": 160,
        "slugFields": ["slug"],
        "titleFields": ["title"],
        "descriptionFields": ["description"],
    },
    "security": {"piiColumns": ["cpf"], "rlsRequiredTables": []},
    "tables": [{"name": "audit_log", "mutability": "APPEND_ONLY"}],
    "logicalRelations": [
        {"table": "review_item", "column": "source_id", "references": {"table": "source", "column": "id"}}
    ],
    "typedFields": [
        {"table": "source", "column": "published_at", "expected": "TIMESTAMPTZ"}
    ],
}


class AuditKernelBase(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="datakernel-"))
        write(self.tmp, "policy.json", BASE_POLICY)

    def report(self, mode: str = "static") -> adk.Report:
        policy = adk.load_policy(self.tmp, "policy.json")
        report = adk.Report(mode=mode, root=str(self.tmp))
        adk.scan_content(self.tmp, policy, report)
        adk.scan_sql(self.tmp, policy, report)
        report.finalize()
        return report

    def codes(self, report: adk.Report) -> list[str]:
        return [f.rule for f in report.findings]


class TestContentAudits(AuditKernelBase):
    def test_slug_invalido_erro(self):
        write(self.tmp, "content/a.json", {"slug": "Slug Inválido"})
        self.assertIn("SEO-02", self.codes(self.report()))

    def test_slug_duplicado_erro(self):
        write(self.tmp, "content/a.json", {"slug": "artigo-um"})
        write(self.tmp, "content/b.json", {"slug": "artigo-um"})
        self.assertIn("SEO-02", self.codes(self.report()))

    def test_meta_title_curto_warning(self):
        write(self.tmp, "content/a.json", {"slug": "artigo-um", "title": "Curto"})
        self.assertIn("SEO-01", self.codes(self.report()))

    def test_locale_ausente_warning(self):
        write(self.tmp, "content/a.json", {"slug": "artigo-um", "translations": {"pt-BR": "texto"}})
        self.assertIn("I18N-01", self.codes(self.report()))

    def test_traducao_vazia_erro(self):
        write(self.tmp, "content/a.json", {"slug": "artigo-um", "translations": {"pt-BR": "", "en": "text"}})
        self.assertIn("I18N-02", self.codes(self.report()))

    def test_traducao_identica_al_original_warning(self):
        write(self.tmp, "content/a.json", {"slug": "artigo-um", "title": "Mesmo", "translations": {"en": "Mesmo"}})
        self.assertIn("I18N-02", self.codes(self.report()))

    def test_data_modificada_anterior_a_publicada_erro(self):
        write(self.tmp, "content/a.json", {"slug": "artigo-um", "datePublished": "2026-10-20", "dateModified": "2026-10-01"})
        self.assertIn("JSD-02", self.codes(self.report()))

    def test_conteudo_valido_sem_achados(self):
        write(
            self.tmp,
            "content/a.json",
            {
                "slug": "artigo-um",
                "title": "Um título suficientemente longo para o gate",
                "description": "d" * 130,
                "datePublished": "2026-10-01",
                "dateModified": "2026-10-20",
                "translations": {"pt-BR": "Um título", "en": "A different title"},
            },
        )
        codes = self.codes(self.report())
        self.assertNotIn("SEO-02", codes)
        self.assertNotIn("I18N-01", codes)
        self.assertNotIn("JSD-02", codes)


class TestSqlAudits(AuditKernelBase):
    def test_fk_logica_ausente_erro(self):
        write(self.tmp, "migrations/0001.sql", "CREATE TABLE source (id uuid PRIMARY KEY);")
        self.assertIn("KER-02", self.codes(self.report()))

    def test_fk_logica_presente_ok(self):
        write(
            self.tmp,
            "migrations/0001.sql",
            "CREATE TABLE source (id uuid PRIMARY KEY);"
            "CREATE TABLE review_item (id uuid PRIMARY KEY, source_id uuid REFERENCES source(id));",
        )
        self.assertNotIn("KER-02", self.codes(self.report()))

    def test_update_em_tabela_append_only_erro(self):
        write(self.tmp, "migrations/0002.sql", "UPDATE audit_log SET status = 'x' WHERE id = 1;")
        self.assertIn("KER-03", self.codes(self.report()))

    def test_tipagem_incorreta_erro(self):
        write(self.tmp, "migrations/0003.sql", "CREATE TABLE source (id uuid, published_at VARCHAR(20));")
        self.assertIn("MST-03", self.codes(self.report()))


class TestPgTargetResolution(AuditKernelBase):
    def test_cria_diretorio_e_nao_quebra_com_enoent(self):
        target = self.tmp / "novo" / "pglite.data"
        os.environ["PGLITE_DATA_DIR"] = str(target)
        os.environ.pop("DATABASE_URL", None)
        try:
            kind, resolved = adk.resolve_pg_target(self.tmp)
            self.assertEqual(kind, "pglite")
            self.assertTrue(Path(resolved).is_dir(), "diretório de dados deve ser criado")
        finally:
            os.environ.pop("PGLITE_DATA_DIR", None)

    def test_database_url_tem_precedencia(self):
        os.environ["DATABASE_URL"] = "postgresql://localhost/db"
        try:
            kind, resolved = adk.resolve_pg_target(self.tmp)
            self.assertEqual(kind, "postgres")
            self.assertEqual(resolved, "postgresql://localhost/db")
        finally:
            os.environ.pop("DATABASE_URL", None)


class TestCli(AuditKernelBase):
    def setUp(self) -> None:
        super().setUp()
        write(
            self.tmp,
            "migrations/0001.sql",
            "CREATE TABLE source (id uuid PRIMARY KEY, published_at TIMESTAMPTZ);"
            "CREATE TABLE review_item (id uuid PRIMARY KEY, source_id uuid REFERENCES source(id));",
        )

    def test_politica_ausente_exit_2(self):
        code = adk.main(["--root", str(self.tmp), "--policy", "nao-existe.json"])
        self.assertEqual(code, 2)

    def test_exit_1_quando_ha_erro(self):
        write(self.tmp, "content/a.json", {"slug": "Slug Inválido"})
        code = adk.main(["--root", str(self.tmp), "--policy", "policy.json", "--mode", "static"])
        self.assertEqual(code, 1)

    def test_exit_0_sem_erro(self):
        code = adk.main(["--root", str(self.tmp), "--policy", "policy.json", "--mode", "static"])
        self.assertEqual(code, 0)


if __name__ == "__main__":
    unittest.main()
