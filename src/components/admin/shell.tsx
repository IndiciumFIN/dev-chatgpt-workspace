import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-layout";
import { DataModule, NormsModule, PoliciesModule } from "@/components/admin/governance";
import { ModelDesk } from "@/components/admin/model-desk";
import { QueueDesk } from "@/components/admin/queue-desk";
import { ContentModule, InstrumentModule, PeopleModule, SystemModule } from "@/components/admin/registry";
import { CommandCenter } from "@/components/site/command-center";
import type { DeskModule } from "@/lib/normative-desk";
import { adminDesk, type SourcePerson, type SourceTool } from "@/lib/source.functions";

export function AdminDesk() {
  const [tools, setTools] = useState<SourceTool[]>([]);
  const [people, setPeople] = useState<SourcePerson[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [module, setModule] = useState<DeskModule>("inicio");

  function reload() {
    return adminDesk()
      .then((desk) => {
        setTools(desk.tools);
        setPeople(desk.people);
        setReady(true);
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <AdminShell module={module} onModule={setModule} error={error} ready={ready}>
      {module === "inicio" ? <CommandCenter /> : null}
      {module === "modelo" ? <ModelDesk /> : null}
      {module === "fila" ? <QueueDesk /> : null}
      {module === "normas" ? <NormsModule /> : null}
      {module === "politicas" ? <PoliciesModule onError={setError} /> : null}
      {module === "dados" ? <DataModule onError={setError} /> : null}
      {module === "conteudo" ? <ContentModule desk={tools} /> : null}
      {module === "sistema" ? <SystemModule /> : null}
      {module === "instrumentos" ? <InstrumentModule tools={tools} onSaved={reload} onError={setError} /> : null}
      {module === "pessoas" ? <PeopleModule people={people} onSaved={reload} onError={setError} /> : null}
    </AdminShell>
  );
}
