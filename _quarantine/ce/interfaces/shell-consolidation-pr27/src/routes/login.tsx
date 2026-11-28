import { createFileRoute, Navigate, retainSearchParams, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { SignInGate } from "@/lib/auth/gates";
import { parseLocale } from "@/lib/translate";

/**
 * A entrada é alcançada por mais de uma rota. `de` carrega a área que
 * redirecionou para cá e vira o rótulo do título, no mesmo vocabulário que a
 * área já usa na interface. Sem origem conhecida o título é o da própria tela.
 */
const ENTRADA_ROTULOS = {
  admin: "Entrada do administrador",
  assinante: "Entrada do assinante",
  assinatura: "Entrada para assinar",
} as const;

type EntradaOrigem = keyof typeof ENTRADA_ROTULOS;

/** Só as origens declaradas viram rótulo; qualquer outra cai no título base. */
function rotuloEntrada(de: unknown): string | undefined {
  if (typeof de !== "string" || !Object.prototype.hasOwnProperty.call(ENTRADA_ROTULOS, de)) return undefined;
  return ENTRADA_ROTULOS[de as EntradaOrigem];
}

export const Route = createFileRoute("/login")({
  search: {
    middlewares: [retainSearchParams(["lang", "de"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    const de = typeof search.de === "string" && search.de in ENTRADA_ROTULOS ? (search.de as EntradaOrigem) : undefined;
    return { ...(lang ? { lang } : null), ...(de ? { de } : null) };
  },
  component: LoginPage,
  head: ({ match }) => ({
    meta: [
      { title: rotuloEntrada(match.search?.de)
          ? `${rotuloEntrada(match.search?.de)} · Calculadoras de Enfermagem`
          : "Entrar · Calculadoras de Enfermagem" },
      { name: "description", content: "Entrada separada do site público. O papel define a tela seguinte." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="eyebrow">Entrada</p>
        <h1>Entrar</h1>
        <p>
          Esta tela não é o site público. Depois da entrada, o assinante abre só o que foi publicado e o administrador altera a fonte única.
        </p>
        <SignInGate fallback={<SignInPanel />}>
          <Navigate to="/sessao" />
        </SignInGate>
        <a className="login-back" href="/">
          Voltar ao site público
        </a>
      </div>
    </div>
  );
}

function SignInPanel() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onEmail(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result =
      mode === "criar"
        ? await authClient.signUp.email({ name, email, password, callbackURL: "/sessao" })
        : await authClient.signIn.email({ email, password, callbackURL: "/sessao" });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Não foi possível entrar.");
      return;
    }
    void navigate({ to: "/sessao" });
  }

  if (!authEnabled) return (
    <p role="status" aria-live="polite">
      A autenticação não está habilitada neste ambiente. O botão Entrar permite
      consultar esta página, mas não inicia sessão nem concede acesso.
      O acesso real depende da ativação governada do serviço de autenticação.
    </p>
  );

  return (
    <div className="login-panel">
      <div className="login-providers">
        {GROK_PROVIDERS.map((provider) => (
          <button
            key={provider.providerId}
            className="btn-navy"
            type="button"
            onClick={() => signIn(provider.providerId, { callbackURL: "/sessao" })}
          >
            Continuar com {provider.label}
          </button>
        ))}
      </div>
      <form className="login-form" onSubmit={onEmail}>
        {mode === "criar" ? (
          <label className="field">
            <span>Nome</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
          </label>
        ) : null}
        <label className="field">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete={mode === "criar" ? "new-password" : "current-password"}
          />
        </label>
        {error ? <p className="err">{error}</p> : null}
        <button className="btn-navy" type="submit" disabled={pending}>
          {pending ? "Aguarde" : mode === "criar" ? "Criar conta" : "Entrar"}
        </button>
      </form>
      <button className="linkish" type="button" onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}>
        {mode === "entrar" ? "Criar uma conta" : "Já tenho conta"}
      </button>
    </div>
  );
}
