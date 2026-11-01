import { useEffect, useMemo, useState } from "react";
import { ModuleFrame, RecordToolbar, Status } from "@/components/admin/admin-layout";
import { commandGap, commandProposal } from "@/lib/command-gap";
import { readDictionary, type BusinessRuleRow, type DictionaryColumn, type DictionaryRelation, type DictionaryTerm } from "@/lib/dictionary.functions";
import { metamodel } from "@/lib/metamodel";

const groups = [
  ["Identidade", metamodel.identity],
  ["Acesso", metamodel.access],
  ["Processo", metamodel.process],
  ["Clínico", metamodel.clinical],
  ["Arquivo", metamodel.archive],
] as const;

export function ModelDesk() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [sort, setSort] = useState("nome");
  const [columns, setColumns] = useState<DictionaryColumn[]>([]);
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);
  const [relations, setRelations] = useState<DictionaryRelation[]>([]);
  const [rules, setRules] = useState<BusinessRuleRow[]>([]);
  const needle = search.trim().toLowerCase();
  const rows = useMemo(() => groups.flatMap(([label, items]) => items
    .filter((row) => group === "" || label === group)
    .filter((row) => `${row.entity} ${row.key} ${"stores" in row ? row.stores : ""}`.toLowerCase().includes(needle))
    .map((row) => ({ group: label, ...row }))), [group, needle]);
  const ordered = [...rows].sort((a, b) => (sort === "grupo" ? a.group.localeCompare(b.group, "pt") : a.entity.localeCompare(b.entity, "pt")));
  const total = groups.reduce((sum, [, items]) => sum + items.length, 0);
  const shownColumns = columns.filter((row) => `${row.entity} ${row.name} ${row.definition}`.toLowerCase().includes(needle));
  const shownTerms = terms.filter((row) => `${row.domain} ${row.code} ${row.label}`.toLowerCase().includes(needle));

  useEffect(() => {
    void readDictionary().then((dictionary) => {
      setColumns(dictionary.columns);
      setTerms(dictionary.terms);
      setRelations(dictionary.relations);
      setRules(dictionary.rules);
    }).catch(() => undefined);
  }, []);

  return (
    <ModuleFrame
      id="modelo"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar tabela"
          sort={sort}
          onSort={setSort}
          sorts={[{ value: "nome", label: "Tabela" }, { value: "grupo", label: "Grupo" }]}
          filters={[{ id: "grupo", label: "Grupo", value: group, onChange: setGroup, options: [{ value: "", label: "Todos" }, ...groups.map(([label]) => ({ value: label, label }))] }]}
        />
      )}
      list={(
        <>
          <p className="tool-help">{ordered.length} de {total} tabelas deste ambiente. A proposta de {commandProposal.date} fala em {commandProposal.tables} nomes. Aprovar o parecer não cria tabela.</p>
          {commandGap.map((row) => (
            <article key={row.area} className="model-card"><b>{row.area}</b><span><Status value={row.verdict} /></span><span>{row.detail}</span></article>
          ))}
          {ordered.map((row) => (
            <article key={`${row.group}-${row.entity}`} className="model-card">
              <b>{row.entity}</b>
              <span>{row.group} · chave {row.key}</span>
              {"stores" in row && row.stores ? <span>Guarda: {row.stores}</span> : null}
              {"links" in row && row.links ? <span>Liga: {row.links}</span> : null}
            </article>
          ))}
          {!ordered.length ? <p className="next-act">Nenhuma tabela com “{search.trim()}”.</p> : null}
          <h3>Dicionário</h3>
          <table className="admin-table">
            <thead><tr><th>Coluna</th><th>Tipo</th><th>Definição</th></tr></thead>
            <tbody>
              {shownColumns.map((row) => (
                <tr key={`${row.entity}.${row.name}`}>
                  <td data-label="Coluna">{row.entity}.{row.name}</td>
                  <td data-label="Tipo">{row.data_type}{row.required ? " · obrigatório" : ""}</td>
                  <td data-label="Definição">{row.definition} {row.syntax}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Relações</h3>
          <table className="admin-table">
            <thead><tr><th>De</th><th>Para</th><th>Cardinalidade</th></tr></thead>
            <tbody>
              {relations.filter((row) => `${row.from_entity} ${row.to_entity} ${row.definition}`.toLowerCase().includes(needle)).map((row) => (
                <tr key={`${row.from_entity}.${row.name}`}>
                  <td data-label="De">{row.from_entity}</td>
                  <td data-label="Para">{row.to_entity}</td>
                  <td data-label="Cardinalidade">{row.cardinality}. {row.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Regras de negócio</h3>
          <table className="admin-table">
            <thead><tr><th>Regra</th><th>Enunciado</th><th>Estado</th></tr></thead>
            <tbody>
              {rules.filter((row) => `${row.id} ${row.statement}`.toLowerCase().includes(needle)).map((row) => (
                <tr key={row.id}>
                  <td data-label="Regra">{row.from_entity} × {row.to_entity}</td>
                  <td data-label="Enunciado">{row.statement}</td>
                  <td data-label="Estado"><Status value={row.status === "aprovado" ? "Aprovado" : "Rascunho"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Vocabulário</h3>
          <table className="admin-table">
            <thead><tr><th>Domínio</th><th>Código</th><th>Nome</th></tr></thead>
            <tbody>
              {shownTerms.map((row) => (
                <tr key={`${row.domain}.${row.code}`}>
                  <td data-label="Domínio">{row.domain}</td>
                  <td data-label="Código">{row.code}</td>
                  <td data-label="Nome">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="next-act">Fora do banco: {metamodel.notStored.join(", ")}.</p>
        </>
      )}
    />
  );
}
