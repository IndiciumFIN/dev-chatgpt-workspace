import { Link } from "@tanstack/react-router";
import { Eraser, FileDown, Flag } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ArticleIcon, iconPath } from "@/components/article/icons";
import { contractOf, type PageToolId, type TemplateKind } from "@/lib/template-contract";

export function PageTools({
  kind,
  pdfHref,
  scope = "[data-readable]",
  onDocx,
  onClear,
  extras,
}: {
  kind: TemplateKind;
  pdfHref?: string;
  scope?: string;
  onDocx?: () => void;
  onClear?: () => void;
  extras?: { href: string; label: string }[];
}) {
  const contract = contractOf(kind);
  const [favorite, setFavorite] = useState(false);
  const [listening, setListening] = useState(false);
  const [minutes, setMinutes] = useState(1);

  useEffect(() => {
    if (!contract.tools.includes("readingTime")) return;
    const words = document.querySelector(scope)?.textContent?.trim().split(/\s+/).length ?? 200;
    setMinutes(Math.max(1, Math.round(words / 200)));
  }, [contract.tools, scope]);

  function listen() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (listening) {
      synth.cancel();
      setListening(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(document.querySelector(scope)?.textContent ?? "");
    utterance.lang = "pt-BR";
    utterance.onend = () => setListening(false);
    synth.cancel();
    synth.speak(utterance);
    setListening(true);
  }

  if (contract.tools.length === 0 && !extras?.length) return null;

  const item: Record<PageToolId, ReactNode> = {
    favorite: (
      <button key="favorite" className="gt-tool" type="button" aria-pressed={favorite} title="Adicionar aos favoritos" onClick={() => setFavorite((value) => !value)}>
        <ArticleIcon d={iconPath.favorite} />
        <span className="gt-tool-label">{favorite ? "Nos favoritos desta visita" : "Favoritar"}</span>
      </button>
    ),
    print: (
      <button key="print" className="gt-tool" type="button" aria-label="Imprimir ou salvar como PDF" title="Imprimir ou salvar como PDF" onClick={() => window.print()}>
        <ArticleIcon d={iconPath.pdf} />
        <span className="gt-tool-label">Imprimir / PDF</span>
      </button>
    ),
    pdf: pdfHref ? (
      <a key="pdf" className="gt-tool" href={pdfHref} target="_blank" rel="noopener" title="Abrir versão em PDF">
        <ArticleIcon d={iconPath.pdf} />
        <span className="gt-tool-label">PDF</span>
      </a>
    ) : (
      <button key="pdf" className="gt-tool" type="button" aria-label="Imprimir ou salvar como PDF" title="Imprimir ou salvar como PDF" onClick={() => window.print()}>
        <ArticleIcon d={iconPath.pdf} />
        <span className="gt-tool-label">PDF</span>
      </button>
    ),
    readingTime: (
      <span key="reading" className="gt-tool gt-reading" title="Tempo estimado de leitura">
        <ArticleIcon d={iconPath.clock} viewBox="0 0 512 512" />
        <span>{minutes} min</span>
      </span>
    ),
    listen: (
      <button key="listen" className="gt-tool" type="button" aria-pressed={listening} title="Ouvir este conteúdo" onClick={listen}>
        <ArticleIcon d={iconPath.listen} viewBox="0 0 640 512" />
        <span className="gt-tool-label">{listening ? "Parar" : "Ouvir"}</span>
      </button>
    ),
    docx: (
      <button key="docx" className="gt-tool" type="button" aria-label="Baixar DOCX" title="Baixar DOCX" onClick={onDocx} disabled={!onDocx}>
        <FileDown size={16} aria-hidden="true" />
        <span className="gt-tool-label">DOCX</span>
      </button>
    ),
    clear: (
      <button key="clear" className="gt-tool" type="button" aria-label="Limpar" title="Limpar" onClick={onClear} disabled={!onClear}>
        <Eraser size={16} aria-hidden="true" />
        <span className="gt-tool-label">Limpar</span>
      </button>
    ),
    report: (
      <Link key="report" className="gt-tool" to="/secao/$slug" params={{ slug: "contato" }} aria-label="Reportar correção" title="Reportar correção">
        <Flag size={16} aria-hidden="true" />
        <span className="gt-tool-label">Reportar correção</span>
      </Link>
    ),
  };

  return (
    <div className={`gt-utilitybar no-print${contract.stickyTools ? " is-sticky" : ""}`} aria-label="Ferramentas da página">
      {contract.tools.map((id) => item[id])}
      {extras?.map((extra) => (
        <a key={extra.href} className="gt-tool" href={extra.href}>
          <span className="gt-tool-label">{extra.label}</span>
        </a>
      ))}
    </div>
  );
}
