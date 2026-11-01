/**
 * Gerador de currículo nos formatos canônicos.
 *
 * Implementa projeções para:
 *  - LATTES: formato Lattes (Lattes Platform - CNPq)
 *  - ABNT_14724: ABNT NBR 14724 (trabalho acadêmico)
 *
 * Cada projeção devolve texto markdown formatado, pronto para copiar/colar
 * no Word, no formulário Lattes ou em sistema de submissão.
 */

import type {
  Curriculum,
  Education,
  Experience,
  Certification,
  Language,
  Skill,
} from "./types";
import {
  DEGREE_LABELS,
  SKILL_CATEGORY_LABELS,
  SKILL_LEVEL_LABELS,
  LANGUAGE_PROFICIENCY_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_ROLE_LABELS,
  PROJECTION_TARGET_LABELS,
} from "./types";

// ============================================================
// Helpers
// ============================================================

/** Formata data ISO (YYYY-MM-DD) para "Mês/Ano" (ex.: "mar./2023"). */
function formatMonthYear(isoDate?: string): string {
  if (!isoDate) return "";
  const meses = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(isoDate);
  if (!match) return isoDate;
  const ano = match[1];
  const mes = parseInt(match[2], 10);
  if (mes < 1 || mes > 12) return isoDate;
  return `${meses[mes - 1]} ${ano}`;
}

/** Formata intervalo de datas (início - fim). */
function formatDateRange(start?: string, end?: string, ongoingLabel = "Atual"): string {
  const inicio = formatMonthYear(start);
  const fim = end ? formatMonthYear(end) : ongoingLabel;
  if (!inicio) return fim;
  return `${inicio} — ${fim}`;
}

/** Lista de nomes próprios para citação ABNT (SOBRENOME, Nome). */
function abntName(fullName: string): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase();
  const sobrenome = parts[parts.length - 1].toUpperCase();
  const nomes = parts.slice(0, -1).join(" ");
  return `${sobrenome}, ${nomes}`;
}

/** Quebra texto em parágrafos, respeitando quebras existentes. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// ============================================================
// Projeção Lattes (Plataforma Lattes - CNPq)
// ============================================================

export function projectLattes(cv: Curriculum): string {
  const lines: string[] = [];
  const owner = cv.owner;

  // Cabeçalho
  lines.push(`# ${owner.full_name || "[Nome completo]"}`);
  if (owner.preferred_name) {
    lines.push(`*Como citar:* ${abntName(owner.full_name)}`);
  }
  if (owner.professional_id) {
    lines.push(`**Registro profissional:** ${owner.professional_id}`);
  }
  if (owner.email || owner.phone) {
    const contato = [owner.email, owner.phone].filter(Boolean).join(" · ");
    lines.push(`**Contato:** ${contato}`);
  }
  if (owner.orcid) lines.push(`**ORCID:** ${owner.orcid}`);
  if (owner.lattes_id) lines.push(`**Lattes ID:** ${owner.lattes_id}`);
  if (owner.linkedin_url) lines.push(`**LinkedIn:** ${owner.linkedin_url}`);
  if (owner.address?.city) {
    const endereco = [
      owner.address.city,
      owner.address.state,
      owner.address.country || "Brasil",
    ].filter(Boolean).join(", ");
    lines.push(`**Endereço:** ${endereco}`);
  }
  lines.push("");

  // Resumo
  if (cv.summary) {
    lines.push("## Resumo");
    paragraphs(cv.summary).forEach((p) => lines.push(p));
    lines.push("");
  }

  // Formação acadêmica
  if (cv.education_refs.length > 0) {
    lines.push("## Formação Acadêmica");
    // Ordena por start_date desc
    [...cv.education_refs]
      .sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""))
      .forEach((e) => {
        lines.push(`### ${DEGREE_LABELS[e.degree]} em ${e.field}`);
        lines.push(`- **Instituição:** ${e.institution}`);
        lines.push(`- **Período:** ${formatDateRange(e.start_date, e.end_date, e.status === "ONGOING" ? "Em andamento" : "Concluído")}`);
        if (e.advisor) lines.push(`- **Orientador:** ${e.advisor}`);
        if (e.thesis_title) lines.push(`- **Título:** ${e.thesis_title}`);
        if (e.status === "ONGOING") lines.push(`- **Status:** Em andamento`);
        if (e.status === "COMPLETED") lines.push(`- **Status:** Concluído`);
        lines.push("");
      });
  }

  // Experiência profissional
  if (cv.experience_refs.length > 0) {
    lines.push("## Atuação Profissional");
    [...cv.experience_refs]
      .sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""))
      .forEach((e) => {
        lines.push(`### ${e.role}`);
        lines.push(`- **Instituição:** ${e.institution}`);
        if (e.department) lines.push(`- **Setor:** ${e.department}`);
        lines.push(`- **Período:** ${formatDateRange(e.start_date, e.end_date, "Atual")}`);
        if (e.workload_hours_week) lines.push(`- **Carga horária:** ${e.workload_hours_week}h/semana`);
        if (e.description) lines.push(`- **Atividades:** ${e.description}`);
        if (e.status === "CURRENT") lines.push(`- **Vínculo atual:** Ativo`);
        lines.push("");
      });
  }

  // Produções (vincula com bloco Pesquisa)
  if (cv.publication_refs.length > 0) {
    lines.push("## Produções");
    lines.push(`*${cv.publication_refs.length} produções bibliográficas cadastradas no Bloco Pesquisa.*`);
    cv.publication_refs.forEach((refId) => {
      lines.push(`- ${refId}`);
    });
    lines.push("");
  }

  // Certificações
  if (cv.certification_refs.length > 0) {
    lines.push("## Certificações e Títulos");
    cv.certification_refs.forEach((c) => {
      const periodo = c.expiry_date
        ? `${formatMonthYear(c.issue_date)} — válido até ${formatMonthYear(c.expiry_date)}`
        : formatMonthYear(c.issue_date);
      lines.push(`- **${c.title}** — ${c.issuer}, ${periodo}.` + (c.registry_number ? ` Registro: ${c.registry_number}.` : ""));
    });
    lines.push("");
  }

  // Competências
  if (cv.skill_refs.length > 0) {
    lines.push("## Áreas de Atuação e Competências");
    // Agrupa por categoria
    const byCategory = new Map<string, Skill[]>();
    cv.skill_refs.forEach((s) => {
      const list = byCategory.get(s.category) || [];
      list.push(s);
      byCategory.set(s.category, list);
    });
    byCategory.forEach((list, category) => {
      lines.push(`### ${SKILL_CATEGORY_LABELS[category as keyof typeof SKILL_CATEGORY_LABELS] || category}`);
      list.forEach((s) => {
        lines.push(`- ${s.name} (${SKILL_LEVEL_LABELS[s.level]})`);
      });
      lines.push("");
    });
  }

  // Idiomas
  if (cv.language_refs.length > 0) {
    lines.push("## Idiomas");
    cv.language_refs.forEach((l) => {
      lines.push(
        `- **${l.language}** — Fala: ${LANGUAGE_PROFICIENCY_LABELS[l.speaking]}, Leitura: ${LANGUAGE_PROFICIENCY_LABELS[l.reading]}, Escrita: ${LANGUAGE_PROFICIENCY_LABELS[l.writing]}`,
      );
    });
    lines.push("");
  }

  // Prêmios
  if (cv.award_refs && cv.award_refs.length > 0) {
    lines.push("## Prêmios e Títulos");
    cv.award_refs.forEach((a) => {
      lines.push(`- **${a.title}** — ${a.issuer}, ${formatMonthYear(a.date)}.` + (a.description ? ` ${a.description}` : ""));
    });
    lines.push("");
  }

  // Filiações
  if (cv.membership_refs && cv.membership_refs.length > 0) {
    lines.push("## Membro de Sociedades Profissionais");
    cv.membership_refs.forEach((m) => {
      lines.push(
        `- **${m.organization}** — ${m.role}, ${formatDateRange(m.start_date, m.end_date, "Atual")}.`,
      );
    });
    lines.push("");
  }

  // Eventos
  if (cv.event_participation_refs && cv.event_participation_refs.length > 0) {
    lines.push("## Participação em Eventos");
    cv.event_participation_refs.forEach((e) => {
      const tipo = e.event_type ? EVENT_TYPE_LABELS[e.event_type] : "Evento";
      const papel = EVENT_ROLE_LABELS[e.role];
      lines.push(
        `- **${e.event_name}** (${tipo}) — ${papel}, ${formatMonthYear(e.date)}.` +
          (e.workload_hours ? ` Carga horária: ${e.workload_hours}h.` : ""),
      );
    });
    lines.push("");
  }

  // Rodapé
  lines.push("---");
  lines.push(`*Currículo gerado em ${new Date().toLocaleDateString("pt-BR")} — formato de projeção: ${PROJECTION_TARGET_LABELS[cv.projection_target]}*`);
  lines.push(`*Status canônico: ${cv.status} · Versão: ${cv.version}*`);

  return lines.join("\n");
}

// ============================================================
// Projeção ABNT NBR 14724 (trabalho acadêmico)
// ============================================================

export function projectABNT14724(cv: Curriculum): string {
  const lines: string[] = [];
  const owner = cv.owner;

  // Folha de rosto (estilo trabalho acadêmico ABNT)
  lines.push("# CURRÍCULO PROFISSIONAL");
  lines.push("");
  lines.push(`**${owner.full_name || "[Nome completo]"}**`);
  lines.push("");
  if (owner.professional_id) {
    lines.push(`Registro profissional: ${owner.professional_id}`);
    lines.push("");
  }
  if (owner.address?.city) {
    const local = [
      owner.address.city,
      owner.address.state,
      owner.address.country || "Brasil",
    ].filter(Boolean).join(" — ");
    lines.push(local);
    lines.push(new Date().getFullYear().toString());
    lines.push("");
  }

  // Resumo (formato ABNT: parágrafo único com recuo)
  if (cv.summary) {
    lines.push("## RESUMO");
    lines.push("");
    paragraphs(cv.summary).forEach((p) => {
      lines.push(`> ${p}`);
      lines.push("");
    });
  }

  // Palavras-chave (geradas das tags/skills)
  if (cv.skill_refs.length > 0) {
    const palavrasChave = cv.skill_refs
      .slice(0, 5)
      .map((s) => s.name.toLowerCase())
      .join("; ");
    lines.push(`**Palavras-chave:** ${palavrasChave}.`);
    lines.push("");
  }

  // 1. DADOS PESSOAIS
  lines.push("## 1. DADOS PESSOAIS");
  lines.push("");
  if (owner.preferred_name) lines.push(`- Nome de citação: ${abntName(owner.full_name)}`);
  if (owner.email) lines.push(`- E-mail: ${owner.email}`);
  if (owner.phone) lines.push(`- Telefone: ${owner.phone}`);
  if (owner.orcid) lines.push(`- ORCID: ${owner.orcid}`);
  if (owner.lattes_id) lines.push(`- Lattes: ${owner.lattes_id}`);
  if (owner.linkedin_url) lines.push(`- LinkedIn: ${owner.linkedin_url}`);
  lines.push("");

  // 2. FORMAÇÃO ACADÊMICA
  if (cv.education_refs.length > 0) {
    lines.push("## 2. FORMAÇÃO ACADÊMICA");
    lines.push("");
    [...cv.education_refs]
      .sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""))
      .forEach((e) => {
        lines.push(`- ${DEGREE_LABELS[e.degree]} em ${e.field}, ${e.institution}.`);
        lines.push(
          `  ${formatDateRange(e.start_date, e.end_date, e.status === "ONGOING" ? "Em andamento" : "Concluído")}.`,
        );
        if (e.advisor && e.thesis_title) {
          lines.push(`  Orientador(a): ${e.advisor}.`);
          lines.push(`  Trabalho: "${e.thesis_title}".`);
        }
        lines.push("");
      });
  }

  // 3. EXPERIÊNCIA PROFISSIONAL
  if (cv.experience_refs.length > 0) {
    lines.push("## 3. EXPERIÊNCIA PROFISSIONAL");
    lines.push("");
    [...cv.experience_refs]
      .sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""))
      .forEach((e) => {
        lines.push(`- ${e.role}, ${e.institution}${e.department ? ` — ${e.department}` : ""}.`);
        lines.push(`  ${formatDateRange(e.start_date, e.end_date, "Atual")}.`);
        if (e.workload_hours_week) lines.push(`  Carga horária: ${e.workload_hours_week}h/semana.`);
        if (e.description) lines.push(`  Atividades: ${e.description}`);
        lines.push("");
      });
  }

  // 4. PRODUÇÕES BIBLIOGRÁFICAS
  if (cv.publication_refs.length > 0) {
    lines.push("## 4. PRODUÇÕES BIBLIOGRÁFICAS");
    lines.push("");
    lines.push("*Listagem das referências cadastradas no Bloco Pesquisa:*");
    lines.push("");
    cv.publication_refs.forEach((refId, i) => {
      lines.push(`${String(i + 1).padStart(2, "0")}. ${refId}`);
    });
    lines.push("");
  }

  // 5. CERTIFICAÇÕES
  if (cv.certification_refs.length > 0) {
    lines.push("## 5. CERTIFICAÇÕES E TÍTULOS");
    lines.push("");
    cv.certification_refs.forEach((c) => {
      const periodo = c.expiry_date
        ? `${formatMonthYear(c.issue_date)} — válido até ${formatMonthYear(c.expiry_date)}`
        : formatMonthYear(c.issue_date);
      lines.push(`- ${c.title}. ${c.issuer}, ${periodo}.`);
      if (c.registry_number) lines.push(`  Registro: ${c.registry_number}.`);
    });
    lines.push("");
  }

  // 6. ÁREAS DE ATUAÇÃO
  if (cv.skill_refs.length > 0) {
    lines.push("## 6. ÁREAS DE ATUAÇÃO E COMPETÊNCIAS");
    lines.push("");
    const byCategory = new Map<string, Skill[]>();
    cv.skill_refs.forEach((s) => {
      const list = byCategory.get(s.category) || [];
      list.push(s);
      byCategory.set(s.category, list);
    });
    byCategory.forEach((list, category) => {
      const catLabel = SKILL_CATEGORY_LABELS[category as keyof typeof SKILL_CATEGORY_LABELS] || category;
      lines.push(`**${catLabel}**`);
      list.forEach((s) => {
        lines.push(`- ${s.name} — nível ${SKILL_LEVEL_LABELS[s.level].toLowerCase()}`);
      });
      lines.push("");
    });
  }

  // 7. IDIOMAS
  if (cv.language_refs.length > 0) {
    lines.push("## 7. IDIOMAS");
    lines.push("");
    cv.language_refs.forEach((l) => {
      lines.push(
        `- ${l.language}: fala ${LANGUAGE_PROFICIENCY_LABELS[l.speaking].toLowerCase()}, leitura ${LANGUAGE_PROFICIENCY_LABELS[l.reading].toLowerCase()}, escrita ${LANGUAGE_PROFICIENCY_LABELS[l.writing].toLowerCase()}.`,
      );
    });
    lines.push("");
  }

  // 8. PRÊMIOS
  if (cv.award_refs && cv.award_refs.length > 0) {
    lines.push("## 8. PRÊMIOS E DISTINÇÕES");
    lines.push("");
    cv.award_refs.forEach((a) => {
      lines.push(`- ${a.title}. ${a.issuer}, ${formatMonthYear(a.date)}.`);
      if (a.description) lines.push(`  ${a.description}`);
    });
    lines.push("");
  }

  // 9. PARTICIPAÇÃO EM EVENTOS
  if (cv.event_participation_refs && cv.event_participation_refs.length > 0) {
    lines.push("## 9. PARTICIPAÇÃO EM EVENTOS");
    lines.push("");
    cv.event_participation_refs.forEach((e) => {
      const tipo = e.event_type ? EVENT_TYPE_LABELS[e.event_type] : "Evento";
      const papel = EVENT_ROLE_LABELS[e.role];
      lines.push(`- ${e.event_name} (${tipo}). ${papel}, ${formatMonthYear(e.date)}.`);
      if (e.workload_hours) lines.push(`  Carga horária: ${e.workload_hours}h.`);
    });
    lines.push("");
  }

  // 10. FILIAÇÕES
  if (cv.membership_refs && cv.membership_refs.length > 0) {
    lines.push("## 10. FILIAÇÕES A SOCIEDADES PROFISSIONAIS");
    lines.push("");
    cv.membership_refs.forEach((m) => {
      lines.push(`- ${m.organization}. ${m.role}, ${formatDateRange(m.start_date, m.end_date, "Atual")}.`);
    });
    lines.push("");
  }

  // Rodapé ABNT
  lines.push("---");
  lines.push("");
  lines.push(
    `Currículo formatado conforme ABNT NBR 14724:2011. Gerado em ${new Date().toLocaleDateString("pt-BR")}.`,
  );
  lines.push(`Status canônico: ${cv.status} · Versão: ${cv.version}.`);

  return lines.join("\n");
}

// ============================================================
// API pública — Dispatcher de projeção
// ============================================================

import type { ProjectionTarget } from "./types";

export function projectCV(cv: Curriculum, target?: ProjectionTarget): string {
  const t = target || cv.projection_target;
  switch (t) {
    case "LATTES":
      return projectLattes(cv);
    case "ABNT_14724":
    case "PRINT_PDF":
      return projectABNT14724(cv);
    case "LINKEDIN":
      // LinkedIn usa formato similar ao Lattes mas com seções curtas
      return projectLattes(cv);
    case "EINF":
      return projectLattes(cv);
    default:
      return projectLattes(cv);
  }
}
