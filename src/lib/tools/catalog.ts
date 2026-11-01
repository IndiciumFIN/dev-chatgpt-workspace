import type { ClinicalTool } from "@/lib/tools/types";
import { examesLaboratoriais } from "@/lib/tools/exames-laboratoriais";

const braden: ClinicalTool = {
  slug: "braden",
  kind: "escala",
  category: "Lesão por pressão",
  title: "Escala de Braden",
  lead: "Estima o risco de lesão por pressão a partir de seis fatores. O escore vai de 6 a 23. Quanto menor, maior o risco.",
  nandaMode: "sugerir",
  criteria: [
    {
      id: "sensorial",
      label: "Percepção sensorial",
      help: "Capacidade de reagir ao desconforto.",
      choices: [
        { value: 1, label: "Completamente limitada" },
        { value: 2, label: "Muito limitada" },
        { value: 3, label: "Levemente limitada" },
        { value: 4, label: "Nenhuma limitação" },
      ],
    },
    {
      id: "umidade",
      label: "Umidade",
      help: "Grau em que a pele fica exposta à umidade.",
      choices: [
        { value: 1, label: "Completamente molhada" },
        { value: 2, label: "Muito molhada" },
        { value: 3, label: "Ocasionalmente molhada" },
        { value: 4, label: "Raramente molhada" },
      ],
    },
    {
      id: "atividade",
      label: "Atividade",
      help: "Grau de atividade física.",
      choices: [
        { value: 1, label: "Acamado" },
        { value: 2, label: "Confinado à cadeira" },
        { value: 3, label: "Anda ocasionalmente" },
        { value: 4, label: "Anda frequentemente" },
      ],
    },
    {
      id: "mobilidade",
      label: "Mobilidade",
      help: "Capacidade de mudar e controlar a posição do corpo.",
      choices: [
        { value: 1, label: "Completamente imóvel" },
        { value: 2, label: "Muito limitado" },
        { value: 3, label: "Levemente limitado" },
        { value: 4, label: "Nenhuma limitação" },
      ],
    },
    {
      id: "nutricao",
      label: "Nutrição",
      help: "Padrão habitual de ingestão alimentar.",
      choices: [
        { value: 1, label: "Muito pobre" },
        { value: 2, label: "Provavelmente inadequada" },
        { value: 3, label: "Adequada" },
        { value: 4, label: "Excelente" },
      ],
    },
    {
      id: "friccao",
      label: "Fricção e cisalhamento",
      help: "Atrito da pele contra a superfície.",
      choices: [
        { value: 1, label: "Problema" },
        { value: 2, label: "Problema em potencial" },
        { value: 3, label: "Nenhum problema aparente" },
      ],
    },
  ],
  bands: [
    { min: 6, max: 9, label: "Risco muito alto", tone: "danger", note: "Reavalie com frequência e acione o protocolo institucional de prevenção.", nanda: ["Risco de lesão por pressão", "Mobilidade física prejudicada"] },
    { min: 10, max: 12, label: "Risco alto", tone: "danger", note: "Intensifique mudança de decúbito, proteção de proeminências e revisão da umidade.", nanda: ["Risco de lesão por pressão", "Integridade da pele prejudicada"] },
    { min: 13, max: 14, label: "Risco moderado", tone: "warn", note: "Mantenha o plano de prevenção e reavalie se o quadro mudar.", nanda: ["Risco de lesão por pressão"] },
    { min: 15, max: 18, label: "Risco baixo", tone: "info", note: "Risco presente, porém menor. Continue a inspeção da pele.", nanda: ["Risco de lesão por pressão"] },
    { min: 19, max: 23, label: "Sem risco", tone: "ok", note: "Sem risco pela Braden neste momento. Reavalie se houver piora clínica.", nanda: [] },
  ],
  howTo: [
    "Escolha um item em cada fator. Não deixe critério em branco.",
    "Some os pontos. O máximo é 23 e o mínimo é 6.",
    "Leia a faixa e registre o escore no prontuário, junto com a data e o setor.",
  ],
  faqs: [
    { q: "Um escore alto é melhor?", a: "Sim. Na Braden, quanto maior o escore, menor o risco." },
    { q: "Posso calcular com um critério faltando?", a: "Não. O template só mostra o escore quando os seis fatores estão preenchidos." },
  ],
  references: [
    "Braden B, Bergstrom N. A conceptual schema for the study of the etiology of pressure sores. Rehabilitation Nursing. 1987;12(1):8-12.",
    "Paranhos WY, Santos VLCG. Avaliação de risco para úlceras de pressão por meio da escala de Braden, na língua portuguesa. Rev Esc Enferm USP. 1999;33(esp):191-206.",
  ],
  related: ["morse", "gotejamento", "imc"],
};

const morse: ClinicalTool = {
  slug: "morse",
  kind: "escala",
  category: "Segurança do paciente",
  title: "Escala de Morse",
  lead: "Estima o risco de queda no adulto hospitalizado. Os pesos não são sequenciais: use o valor indicado em cada item.",
  nandaMode: "sugerir",
  criteria: [
    { id: "quedas", label: "Histórico de quedas", help: "Queda nos últimos 3 meses.", choices: [{ value: 0, label: "Não" }, { value: 25, label: "Sim" }] },
    { id: "diagnostico", label: "Diagnóstico secundário", help: "Mais de um diagnóstico médico.", choices: [{ value: 0, label: "Não" }, { value: 15, label: "Sim" }] },
    { id: "auxilio", label: "Auxílio na deambulação", help: "Como a pessoa se desloca.", choices: [{ value: 0, label: "Nenhum, acamado ou auxílio da enfermagem" }, { value: 15, label: "Muletas, bengala ou andador" }, { value: 30, label: "Apoia-se na mobília" }] },
    { id: "venoso", label: "Terapia endovenosa", help: "Acesso venoso ou dispositivo heparinizado.", choices: [{ value: 0, label: "Não" }, { value: 20, label: "Sim" }] },
    { id: "marcha", label: "Marcha", help: "Modo de andar.", choices: [{ value: 0, label: "Normal, acamado ou cadeira de rodas" }, { value: 10, label: "Fraca" }, { value: 20, label: "Comprometida" }] },
    { id: "mental", label: "Estado mental", help: "Percepção da própria capacidade.", choices: [{ value: 0, label: "Orientado quanto à capacidade" }, { value: 15, label: "Esquece as limitações" }] },
  ],
  bands: [
    { min: 0, max: 24, label: "Risco baixo", tone: "ok", note: "Mantenha as precauções básicas de queda.", nanda: [] },
    { min: 25, max: 44, label: "Risco médio", tone: "warn", note: "Reforce orientação, campainha ao alcance e ambiente livre.", nanda: ["Risco de queda"] },
    { min: 45, max: 125, label: "Risco alto", tone: "danger", note: "Aplique o protocolo institucional de alto risco de queda.", nanda: ["Risco de queda", "Mobilidade física prejudicada"] },
  ],
  howTo: [
    "Marque uma opção em cada item, com o peso já impresso.",
    "Some os pesos. O escore não vai de 1 em 1.",
    "Baixo: 0 a 24. Médio: 25 a 44. Alto: 45 ou mais.",
  ],
  faqs: [
    { q: "Por que os pontos pulam de 0 para 25?", a: "A Morse usa pesos diferentes por fator. Não converta para uma escala de 0 a 4." },
    { q: "Serve para criança?", a: "Não. Esta versão é a do adulto hospitalizado. Pediatria pede instrumento próprio." },
  ],
  references: [
    "Morse JM, Morse RM, Tylko SJ. Development of a scale to identify the fall-prone patient. Can J Aging. 1989;8(4):366-377.",
  ],
  related: ["braden", "apgar", "imc"],
};

const apgar: ClinicalTool = {
  slug: "apgar",
  kind: "escala",
  category: "Neonatologia",
  title: "Escala de Apgar",
  lead: "Avalia o recém-nascido no 1º e no 5º minuto. Cada sinal vale 0, 1 ou 2. O total vai de 0 a 10.",
  nandaMode: "sugerir",
  metaFields: [
    { id: "momento", label: "Momento", options: [{ value: "1", label: "1º minuto" }, { value: "5", label: "5º minuto" }, { value: "10", label: "10º minuto" }] },
  ],
  criteria: [
    { id: "fc", label: "Frequência cardíaca", help: "Batimentos por minuto.", choices: [{ value: 0, label: "Ausente" }, { value: 1, label: "Abaixo de 100" }, { value: 2, label: "100 ou mais" }] },
    { id: "resp", label: "Respiração", help: "Esforço respiratório.", choices: [{ value: 0, label: "Ausente" }, { value: 1, label: "Irregular ou lenta" }, { value: 2, label: "Regular, choro forte" }] },
    { id: "tonus", label: "Tônus muscular", help: "Atividade.", choices: [{ value: 0, label: "Flácido" }, { value: 1, label: "Alguma flexão" }, { value: 2, label: "Movimentos ativos" }] },
    { id: "reflexo", label: "Irritabilidade reflexa", help: "Resposta ao estímulo.", choices: [{ value: 0, label: "Sem resposta" }, { value: 1, label: "Careta" }, { value: 2, label: "Choro, tosse ou espirro" }] },
    { id: "cor", label: "Cor", help: "Coloração da pele.", choices: [{ value: 0, label: "Cianótico ou pálido" }, { value: 1, label: "Corpo róseo, extremidades cianóticas" }, { value: 2, label: "Totalmente róseo" }] },
  ],
  bands: [
    { min: 0, max: 3, label: "Depressão grave", tone: "danger", note: "Sinal de alerta. Siga o protocolo de reanimação neonatal da instituição.", nanda: ["Troca de gases prejudicada", "Padrão respiratório ineficaz"] },
    { min: 4, max: 6, label: "Depressão moderada", tone: "warn", note: "Necessita apoio e reavaliação no próximo minuto previsto.", nanda: ["Padrão respiratório ineficaz"] },
    { min: 7, max: 10, label: "Boa vitalidade", tone: "ok", note: "Boa adaptação neste momento. Mantenha a observação de rotina.", nanda: [] },
  ],
  howTo: [
    "Marque o momento da avaliação antes de pontuar.",
    "Dê 0, 1 ou 2 a cada um dos cinco sinais.",
    "Repita a escala no minuto seguinte quando o protocolo pedir. Não reaproveite o escore anterior.",
  ],
  faqs: [
    { q: "O Apgar decide sozinho a reanimação?", a: "Não. Ele descreve a condição. A conduta segue o protocolo neonatal e a equipe presente." },
    { q: "Por que o momento fica separado do escore?", a: "1º, 5º e 10º minuto são registros diferentes. O template não mistura esses valores." },
  ],
  references: [
    "Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.",
  ],
  related: ["braden", "imc", "morse"],
};

const gotejamento: ClinicalTool = {
  slug: "gotejamento",
  kind: "calculadora",
  category: "Terapia infusional",
  title: "Calculadora de gotejamento",
  lead: "Converte volume e tempo em mL/hora e em gotas por minuto, conforme o equipo escolhido.",
  nandaMode: "nao-fechar",
  fields: [
    { id: "volume", label: "Volume", unit: "mL", min: 1, max: 10000, step: 1 },
    { id: "horas", label: "Horas", unit: "h", min: 0, max: 168, step: 1 },
    { id: "minutos", label: "Minutos", unit: "min", min: 0, max: 59, step: 1 },
  ],
  selects: [
    { id: "fator", label: "Equipo", options: [{ value: 20, label: "Macrogotas (20 gotas/mL)" }, { value: 60, label: "Microgotas (60 gotas/mL)" }] },
  ],
  outputs: [
    { id: "mlh", label: "Velocidade", unit: "mL/h", digits: 1 },
    { id: "gotas", label: "Gotejamento", unit: "gotas/min", digits: 0 },
  ],
  howTo: [
    "Informe o volume prescrito e o tempo de infusão.",
    "Escolha o equipo que está na bancada. Macrogotas usa fator 20. Microgotas usa fator 60.",
    "Gotas por minuto = (volume × fator) ÷ minutos. mL/hora = volume ÷ horas.",
  ],
  faqs: [
    { q: "Posso trocar macro por micro sem recalcular?", a: "Não. O fator muda o número de gotas. Recalcule depois de trocar o equipo." },
    { q: "O resultado substitui a bomba?", a: "Não. Se a prescrição pede bomba de infusão, use a bomba. Este cálculo confere o gotejo gravitacional." },
  ],
  references: [
    "Fórmula clássica de gotejamento: gotas/min = (volume em mL × fator do equipo) / tempo em minutos.",
  ],
  related: ["imc", "braden", "morse"],
};

const imc: ClinicalTool = {
  slug: "imc",
  kind: "calculadora",
  category: "Antropometria",
  title: "Cálculo de IMC",
  lead: "Índice de massa corporal para adulto: peso dividido pelo quadrado da altura. Os cortes abaixo são os da Organização Mundial da Saúde para adultos.",
  nandaMode: "nao-fechar",
  fields: [
    { id: "peso", label: "Peso", unit: "kg", min: 1, max: 400, step: 0.1 },
    { id: "altura", label: "Altura", unit: "cm", min: 50, max: 250, step: 1 },
  ],
  outputs: [{ id: "imc", label: "IMC", unit: "kg/m²", digits: 1 }],
  bandFrom: "imc",
  bands: [
    { min: 0, max: 18.49, label: "Baixo peso", tone: "info", note: "Abaixo de 18,5 kg/m². Interprete junto com a avaliação clínica.", nanda: [] },
    { min: 18.5, max: 24.99, label: "Adequado", tone: "ok", note: "Faixa de 18,5 a 24,9 kg/m² para o adulto.", nanda: [] },
    { min: 25, max: 29.99, label: "Sobrepeso", tone: "warn", note: "Faixa de 25 a 29,9 kg/m².", nanda: [] },
    { min: 30, max: 34.99, label: "Obesidade I", tone: "warn", note: "Faixa de 30 a 34,9 kg/m².", nanda: [] },
    { min: 35, max: 39.99, label: "Obesidade II", tone: "danger", note: "Faixa de 35 a 39,9 kg/m².", nanda: [] },
    { min: 40, max: 200, label: "Obesidade III", tone: "danger", note: "Igual ou acima de 40 kg/m².", nanda: [] },
  ],
  howTo: [
    "Use peso em quilogramas e altura em centímetros.",
    "IMC = peso / (altura em metros)².",
    "Não use estes cortes em criança, gestante ou idoso sem a referência própria.",
  ],
  faqs: [
    { q: "O IMC fecha um diagnóstico de enfermagem?", a: "Não. Ele descreve a relação peso-altura. O template não sugere NANDA a partir só deste número." },
    { q: "E se a altura estiver em metros?", a: "Converta para centímetros. 1,70 m = 170 cm." },
  ],
  references: [
    "World Health Organization. Obesity: preventing and managing the global epidemic. Geneva: WHO; 2000. Cortes de IMC para adultos.",
  ],
  related: ["gotejamento", "braden", "apgar"],
};

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

export const tools: ClinicalTool[] = [braden, morse, apgar, gotejamento, imc];

/** Fora do menu e do sitemap. A branch de auditoria exige homologação humana antes do índice. */
export const candidateTools: ClinicalTool[] = [aldrete, examesLaboratoriais];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug) ?? candidateTools.find((tool) => tool.slug === slug);
}
