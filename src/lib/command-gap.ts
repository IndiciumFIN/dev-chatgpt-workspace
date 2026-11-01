/** Parecer de reconciliação. Proposta de 26/10/2026. Não é DDL. */

export const commandProposal = {
  title: "Central de Comando e tabelas iniciais",
  version: "1.0",
  date: "26/10/2026",
  className: "Proposta, não homologada",
  tables: 215,
  base: 120,
  later: 95,
  groups: 7,
  modules: 22,
} as const;

export const commandGap = [
  { area: "Mesa atual", verdict: "Existe", detail: "Início, modelo, fila, normas, políticas, dados, conteúdo, instrumentos, pessoas e sistema. Não é a Central de Comando." },
  { area: "42 entidades", verdict: "Reutilizar", detail: "Identidade, acesso, processo, conteúdo e clínico, mais idioma, a linha, a sugestão e a rota do sitemap. Fórmula, paciente e escore continuam fora do banco." },
  { area: "auth.users", verdict: "Ajustar", detail: "A proposta manda usar o usuário do provedor e não guardar senha. Este ambiente tem tabela própria de conta. Não duplicar." },
  { area: "Governança", verdict: "Reutilizar", detail: "Item, especificação, versão e trilha já existem. Não cobrem os 24 nomes do domínio gov." },
  { area: "Quatro faixas", verdict: "Não existe", detail: "Monitor, comunicação, caixa de comando e ordens homologadas. O celular seria só consulta." },
  { area: "215 tabelas", verdict: "Espera", detail: "18 domínios, 120 de base e 95 posteriores. Nenhuma foi criada por esta proposta." },
  { area: "Ordem de serviço", verdict: "Não existe", detail: "Rascunho, revisão, homologada, pronta, em curso. Homologada não autoriza executar." },
  { area: "Executor", verdict: "Não existe", detail: "Lease, idempotência, evento ordenado e retomada depois da queda. Sem isso não há tempo real." },
] as const;
