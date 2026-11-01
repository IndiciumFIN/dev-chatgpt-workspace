import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { myPlan, requestPlan, type PlanStatus } from "@/lib/community.functions";

export function SubscriptionPanel() {
  const { user, isPending } = useCurrentUserState();
  const [status, setStatus] = useState<PlanStatus | null | "loading">("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setStatus(null);
      return;
    }
    myPlan()
      .then((plan) => setStatus(plan.status))
      .catch(() => setStatus(null));
  }, [isPending, user?.id]);

  return (
    <section className="paper tool-block">
      <h2>Plano da comunidade</h2>
      <p>
        Não há cartão nem cobrança. A assinatura só abre o quadro da comunidade na área do assinante. As calculadoras e escalas públicas continuam livres.
      </p>
      {isPending || status === "loading" ? <p className="tool-help">Consultando a conta…</p> : null}
      {!isPending && !user ? (
        <Link to="/login" className="btn-assine">
          Entrar para pedir
        </Link>
      ) : null}
      {user && status === null ? (
        <button
          className="btn-assine"
          type="button"
          disabled={pending}
          onClick={() => {
            setPending(true);
            requestPlan()
              .then((plan) => setStatus(plan.status))
              .catch((err: Error) => setError(err.message))
              .finally(() => setPending(false));
          }}
        >
          {pending ? "Enviando…" : "Pedir assinatura"}
        </button>
      ) : null}
      {status === "pedido" ? <p>Pedido enviado. O administrador libera o quadro. As calculadoras seguem abertas.</p> : null}
      {status === "ativo" ? (
        <p>
          Assinatura ativa. O quadro está na <Link to="/assinante">área do assinante</Link>.
        </p>
      ) : null}
      {status === "recusado" ? (
        <button
          className="btn-ghost"
          type="button"
          disabled={pending}
          onClick={() => {
            setPending(true);
            requestPlan()
              .then((plan) => setStatus(plan.status))
              .catch((err: Error) => setError(err.message))
              .finally(() => setPending(false));
          }}
        >
          Pedir de novo
        </button>
      ) : null}
      {error ? <p className="err">{error}</p> : null}
    </section>
  );
}
