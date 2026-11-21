/**
 * REVIEW-ONLY clinical candidates. Do not import from any public runtime.
 * Not authorized for clinical release; source kept for independent evaluation.
 * The separate /exames-laboratoriais public library is not a released clinical tool.
 */
import type { ClinicalTool, ComputeResult } from "@/lib/tools/types";
import { examesLaboratoriais, examePorIndice, interpretar } from "@/lib/tools/exames-laboratoriais";

const aldrete: ClinicalTool = {
  slug: "aldrete",
  kind: "escala",
  category: "Centro cirúrgico",
  title: "Escala de Aldrete",
  lead: "Avalia a recuperação pós-anestésica na sala de recuperação para apoiar a decisão de alta. Cinco critérios, escore de 0 a 10 pontos.",
  nandaMode: "sugerir",
  criteria: [
    { id: "atividade", label: "Atividade (motricidade)", help: "Capacidade de mover extremidades sob comando.", choices: [{ value: 2, label: "Move 4 extremidades voluntariamente ou sob comando" }, { value: 1, label: "Move 2 extremidades voluntariamente ou sob comando" }, { value: 0, label: "Incapaz de mover extremidades" }] },
    { id: "respiracao", label: "Respiração", help: "Avaliação do padrão respiratório e da tosse.", choices: [{ value: 2, label: "Capaz de respirar profundamente e tossir" }, { value: 1, label: "Dispneia ou limitação à respiração" }, { value: 0, label: "Apneia ou suporte ventilatório" }] },
    { id: "circulacao", label: "Circulação (PA)", help: "Variação da pressão arterial em relação ao nível pré-anestésico.", choices: [{ value: 2, label: "PA varia até 20% do nível pré-anestésico" }, { value: 1, label: "PA varia entre 20% e 49% do nível pré-anestésico" }, { value: 0, label: "PA varia 50% ou mais do nível pré-anestésico" }] },
    { id: "consciencia", label: "Nível de consciência", help: "Avaliação do despertar pós-anestésico.", choices: [{ value: 2, label: "Completamente acordado e lúcido" }, { value: 1, label: "Desperta ao chamado" }, { value: 0, label: "Não responde ou inconsciente" }] },
    { id: "saturacao", label: "Saturação de O₂ (SpO₂)", help: "Necessidade de oxigênio suplementar.", choices: [{ value: 2, label: "Mantém SpO₂ acima de 92% em ar ambiente" }, { value: 1, label: "Precisa de O₂ para manter SpO₂ acima de 90%" }, { value: 0, label: "SpO₂ abaixo de 90% mesmo com suplementação de O₂" }] },
  ],
  bands: [
    { min: 8, max: 10, label: "Critério de recuperação atingido", tone: "ok", note: "Critério de recuperação atingido. A decisão de alta cabe ao médico responsável, considerando o quadro clínico.", nanda: [] },
    { min: 7, max: 7, label: "Manter em observação", tone: "warn", note: "Manter em observação e reavaliar antes de considerar alta.", nanda: [] },
    { min: 0, max: 6, label: "Paciente instável", tone: "danger", note: "Critério de recuperação não atingido. Manter monitorização e acionar o protocolo institucional.", nanda: [] },
  ],
  howTo: [
    "Avalie cada um dos cinco critérios após a cirurgia, conferindo o paciente e o registro intraoperatório.",
    "Some os pontos: o escore vai de 0 a 10.",
    "Leia a faixa: 8 ou mais atinge o critério de recuperação; 7 pede observação; abaixo de 7 o paciente está instável.",
    "O resultado não autoriza alta de forma autônoma: a decisão considera o quadro clínico e a avaliação do médico responsável.",
  ],
  faqs: [
    { q: "Qual escore permite alta da sala de recuperação pós-anestésica?", a: "O critério de recuperação é atingido com 8 pontos ou mais. Com 7 pontos, a recomendação é manter em observação. Abaixo de 7, o paciente permanece instável. A alta é decisão do médico responsável, não do escore isolado." },
    { q: "Quais são os cinco critérios?", a: "Atividade (motricidade), respiração, circulação (pressão arterial em relação ao pré-anestésico), nível de consciência e saturação de O₂." },
    { q: "A escala substitui a avaliação do anestesiologista?", a: "Não. O escore apoia a decisão; a alta da SRPA depende do quadro clínico e da avaliação do médico responsável, conforme o Parecer nº 28/2020 do CFM." },
  ],
  references: [
    "CONSELHO FEDERAL DE MEDICINA. Parecer nº 28/2020. Assunto: Critérios para alta da sala de recuperação pós-anestésica. Brasília: CFM, 2020.",
  ],
  publicacao: "candidata",
  holds: [
    "UTC-003/UTC-071: externalizar toda verdade clinica do source da pagina para binding governado em runtime",
    "UTC-004: reconciliar identidade tecnica UUIDv5 legado com UUIDv7, sem duplicidade",
    "UTC-051: provar a derivacao de canonical/hreflang a partir do Route Registry em build/runtime",
    "UTC-053/UTC-056: recuperar dimensoes intrinsecas da imagem OG e perfil completo de direitos/hash",
    "UTC-072: E2E de browser",
    "UTC-080/081/082: verificador de ABNT/citacao/pinpoint",
    "UTC-097: decisao sobre aplicabilidade do disclaimer de emergencia",
  ],
  sourceIds: ["SRC-CFM-PARECER-28-2020"],
  related: ["braden", "morse", "apgar"],
  version: "1.0.0-piloto",
};

export const candidateTools: ClinicalTool[] = [aldrete, examesLaboratoriais];

const leituraExame: Record<string, string> = {
  indisponivel: "Faixa indisponível nesta base.",
  abaixo: "Abaixo da faixa de referência.",
  acima: "Acima da faixa de referência.",
  "na-faixa": "Dentro da faixa de referência.",
  "acima-do-minimo": "Acima do mínimo declarado. A base não traz máximo.",
};

/** Candidate-only formula retained for review, not connected to the public engine. */
export const candidateFormulas: Record<string, (values: Record<string, number>) => ComputeResult> = {
  "exames-laboratoriais": (values) => {
    const exame = examePorIndice(values.exame);
    if (!exame) return { error: "Escolha um exame da lista." };
    const genero = values.sexo === 1 ? "homem" : values.sexo === 2 ? "mulher" : "nao-informado";
    const leitura = interpretar(exame, values.valor, genero);
    return {
      outputs: { situacao: values.valor },
      texts: { situacao: `${exame.nome}: ${leituraExame[leitura.situacao]}` },
    };
  },
};
