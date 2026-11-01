export type DeskModule = "inicio" | "modelo" | "fila" | "normas" | "politicas" | "dados" | "conteudo" | "instrumentos" | "pessoas" | "sistema";

export const deskModules: { id: DeskModule; label: string }[] = [
  { id: "inicio", label: "Central" },
  { id: "modelo", label: "Modelo de dados" },
  { id: "fila", label: "Fila normativa" },
  { id: "normas", label: "Normas" },
  { id: "politicas", label: "Políticas" },
  { id: "dados", label: "Dados" },
  { id: "conteudo", label: "Conteúdo" },
  { id: "instrumentos", label: "Instrumentos" },
  { id: "pessoas", label: "Pessoas" },
  { id: "sistema", label: "Sistema" },
];

export type StatusTone = "ok" | "stop" | "wait" | "muted";

export function statusTone(state: string): StatusTone {
  const value = state.toLowerCase();
  if (value === "não feito") return "stop";
  if (value === "definida") return "ok";
  if (/^desbloqueado$|^existe$|^reutilizar$|^pronta$|^concluida$|^aceito$|conferido|feito|aberta|aprovado|publicado/.test(value)) return "ok";
  if (/fechado|bloqueado|bloqueada|recusado|falhou|cancelada|exclu|não admit|não existe|desligado|não executado|sem texto/.test(value)) return "stop";
  if (/espera|ajust|homologada|em_curso|pausada|candidato|parcial|aberto|rascunho|na mesa|oculto/.test(value)) return "wait";
  return "muted";
}

export const deskGates = [
  { label: "Pacote atômico", state: "Hash conferido", detail: "61f3bc0a…912d91. O arquivo existe. Isso não admite o conteúdo." },
  { label: "Portão de publicação", state: "Fechado", detail: "Nada desta mesa vai a publicado. Aprovar um cartão não abre o portão." },
  { label: "Átomos COFEN", state: "Não admitidos", detail: "Resolução 545 cortada. Resolução 564 com cabeçalho do Diário Oficial." },
  { label: "Texto de ISO e ABNT", state: "Só metadado", detail: "Cláusula não está guardada e não é copiada." },
  { label: "Banco remoto", state: "Desligado", detail: "Esta mesa lê o que está aqui. Não é a fonte do repositório." },
] as const;

export const extractionQueue = [
  { id: "EXT-001", title: "Conferir o pacote", state: "Feito aqui", next: "Nenhuma. O hash externo fechou." },
  { id: "EXT-002", title: "674 PDFs de 10/10", state: "Excluídos", next: "Não baixar de novo. São a cartilha eleitoral." },
  { id: "EXT-003", title: "749 PDFs oficiais", state: "Não executado", next: "Baixar pela rota já mapeada, sem apagar o lote inválido." },
  { id: "EXT-004", title: "OCR da Resolução 545", state: "Espera humana", next: "Quatro páginas. A página 3 está vazia. Dois revisores." },
  { id: "EXT-005", title: "Metadado das 43 normas", state: "Na mesa", next: "Citar identificador. Não extrair cláusula." },
  { id: "EXT-006", title: "Schemas do pacote clínico", state: "Candidato", next: "Revalidar os registros. Ainda não foi feito nesta mesa." },
] as const;

export const lineageSteps = [
  { id: "fonte", title: "Fonte oficial", state: "Parcial", detail: "Há mapa de 3.421 URLs. Os 749 PDFs oficiais não foram baixados." },
  { id: "versao", title: "Versão", state: "Aberto", detail: "Ano e emenda ficam no registro. O identificador não carrega a edição." },
  { id: "atomo", title: "Átomo", state: "Bloqueado", detail: "Piloto de 3 átomos e 2 normas. Não é a cadeia das 674 resoluções." },
  { id: "requisito", title: "Requisito", state: "Não emitido", detail: "Claim derivado da 545 está inválido até a ementa inteira." },
  { id: "ferramenta", title: "Ferramenta", state: "No código", detail: "A fórmula ainda não nasce do átomo. A Aldrete segue fora do índice." },
] as const;

export const atomQueue = [
  { id: "ATOM-RES545-2017-EMENTA", state: "Bloqueado", detail: "A ementa para em “dispõe sobre a forma de”. Não republicar o trecho cortado." },
  { id: "ATOM-RES564-2017-EMENTA", state: "Bloqueado", detail: "O fragmento traz cabeçalho do Diário Oficial. A ementa oficial ainda não substituiu este átomo." },
  { id: "PILOTO-2-NORMAS", state: "Não é o acervo", detail: "30 elos para 2 normas. A matriz das 674 resoluções não existe." },
  { id: "ISO-METADADO", state: "Sem texto", detail: "Não há átomo de cláusula. O fundamento interno aponta o identificador e para aí." },
] as const;
