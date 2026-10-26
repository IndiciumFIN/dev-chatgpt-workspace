import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { SignInGate } from "@/lib/auth/gates";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar · Calculadoras de Enfermagem" },
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
        {authEnabled ? (
          <SignInGate fallback={<SignInPanel />}>
            <Navigate to="/sessao" />
          </SignInGate>
        ) : (
          <AuthOffPanel />
        )}
        <a className="login-back" href="/">
          Voltar ao site público
        </a>
      </div>
    </div>
  );
}

function AuthOffPanel() {
  const navigate = useNavigate();
  return (
    <div className="login-panel">
      <p>A autenticação está desligada neste ambiente. O site público abre sem entrar.</p>
      <button className="btn-navy" type="button" onClick={() => void navigate({ to: "/" })}>
        Continuar sem entrar
      </button>
      <button className="linkish" type="button" onClick={() => void navigate({ to: "/assinante" })}>
        Abrir a área do assinante
      </button>
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
