/** Recusa gravar na publicação quando a autenticação foi desligada. A pré-visualização não entra nesta trava. */
export function assertProductionAuth(env: NodeJS.ProcessEnv = process.env) {
  if (env.VERCEL === "1" && env.VITE_AUTH_ENABLED === "false") {
    throw new Error("A publicação não grava com a autenticação desligada.");
  }
}

export function assertAdminRole(role: string | undefined) {
  if (role !== "admin") throw new Error("Somente o administrador altera a fonte.");
}
