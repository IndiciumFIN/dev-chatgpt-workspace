import { useEffect, useState } from "react";
import { listLocaleDrafts, publishObjectLocale, type LocaleDraft } from "@/lib/locale-publish.functions";

export function LocaleDesk({ search, onError }: { search: string; onError: (message: string) => void }) {
  const [locale, setLocale] = useState("");
  const [counts, setCounts] = useState<{ locale: string; objects: number }[]>([]);
  const [rows, setRows] = useState<LocaleDraft[]>([]);
  const [pending, setPending] = useState("");

  function load() {
    return listLocaleDrafts({ data: { locale, search } })
      .then((result) => {
        setCounts(result.counts);
        setRows(result.rows);
      })
      .catch((err: Error) => onError(err.message));
  }

  useEffect(() => {
    void load();
  }, [locale, search]);

  return (
    <>
      <label className="field">Idioma
        <select value={locale} onChange={(event) => setLocale(event.target.value)}>
          <option value="">Todos os rascunhos</option>
          {counts.map((item) => (
            <option key={item.locale} value={item.locale}>{item.locale} ({item.objects})</option>
          ))}
        </select>
      </label>
      <table className="admin-table">
        <thead><tr><th>Objeto</th><th>Idioma</th><th>Endereço</th><th></th></tr></thead>
        <tbody>
          {rows.map((row) => {
            const key = `${row.slug}:${row.locale}`;
            return (
              <tr key={key}>
                <td data-label="Objeto">{row.title}<br />{row.slug}</td>
                <td data-label="Idioma">{row.locale}</td>
                <td data-label="Endereço">{row.path}</td>
                <td>
                  <button
                    className="btn-navy btn-sm"
                    type="button"
                    disabled={pending === key}
                    onClick={() => {
                      setPending(key);
                      void publishObjectLocale({ data: { slug: row.slug, locale: row.locale } })
                        .then(() => load())
                        .catch((err: Error) => onError(err.message))
                        .finally(() => setPending(""));
                    }}
                  >
                    {pending === key ? "Publicando…" : "Publicar este idioma"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="tool-help">Nenhum rascunho neste filtro.</p> : null}
    </>
  );
}
