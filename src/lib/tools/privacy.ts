/**
 * Privacidade do contexto assistencial — emenda CKO-POL-UT-001 v1.2.0.
 *
 * Os campos de contexto (nome, idade, unidade/leito, data) sao OPCIONAIS. O
 * profissional pode usa-los. Quando usados:
 *   - o valor e MASKADO por padrao em tela, ficha, impressao e PDF;
 *   - o valor NAO e capturado para nenhuma finalidade de LGPD: sem analytics,
 *     sem logs de produto, sem publicidade, sem targeting, sem persistencia e
 *     sem transmissao;
 *   - a permanencia e efemera: nasce no formulario, vive na memoria de runtime
 *     da sessao e e destruido com ela.
 *
 * A mascara e de APRESENTACAO, nao de criptografia: o valor integro continua no
 * estado do formulario enquanto a sessao dura — e e isso que o profissional
 * precisa para imprimir a ficha que ele mesmo montou.
 */

/** Mascara um nome: "Maria das Graças Silva" -> "M••• S•••". */
export function mascaraNome(valor: string): string {
  const partes = valor.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "";
  if (partes.length === 1) return mascararToken(partes[0]);
  return `${mascararToken(partes[0])} ${mascararToken(partes[partes.length - 1])}`;
}

function mascararToken(token: string): string {
  if (token.length <= 1) return "•";
  return `${token[0]}${"•".repeat(Math.min(token.length - 1, 4))}`;
}

/** Mascara um valor livre mantendo o inicio e o fim (setor, data,etc). */
export function mascaraValor(valor: string, manter = 2): string {
  const v = valor.trim();
  if (!v) return "";
  if (v.length <= manter * 2) return "•".repeat(v.length);
  return `${v.slice(0, manter)}${"•".repeat(Math.min(v.length - manter * 2, 8))}${v.slice(-manter)}`;
}

/**
 * Mascara um campo de contexto conforme a estrategia declarada no contrato.
 *
 *   nome  FULL    — "Maria das Graças Silva" -> "M•••• S••••"
 *   setor PARTIAL — "UTI Leste - Leito 12"   -> "UT••••••••12"
 *   idade NONE    — preservado: e dado clinico e nao identifica sozinho
 *   data  NONE    — preservada: e dado calendario, necessario ao registro
 */
export function mascaraContexto(campo: "nome" | "idade" | "setor" | "data", valor: string): string {
  if (!valor?.trim()) return "";
  if (campo === "nome") return mascaraNome(valor);
  if (campo === "setor") return mascaraValor(valor, 2);
  return valor.trim();
}

/** O texto que entra na ficha e no PDF. "Não informado" quando vazio. */
export function paraFicha(campo: "nome" | "idade" | "setor" | "data", valor: string): string {
  return valor?.trim() ? mascaraContexto(campo, valor) : "Não informado";
}
