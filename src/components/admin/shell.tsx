import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-layout";
import { DataModule, NormsModule, PoliciesModule } from "@/components/admin/governance";
import { ModelDesk } from "@/components/admin/model-desk";
import { ModuleDirectory, PlannedModule } from "@/components/admin/module-board";
import { QueueDesk } from "@/components/admin/queue-desk";
import { ContentModule, InstrumentModule, PeopleModule, SystemModule } from "@/components/admin/registry";
import { CommandCenter } from "@/components/site/command-center";
import { adminModule, type AdminPick } from "@/lib/admin-catalog";
import { adminDesk, type SourcePerson, type SourceTool } from "@/lib/source.functions";

export function AdminDesk() {
  const [tools, setTools] = useState<SourceTool[]>([]);
  const [people, setPeople] = useState<SourcePerson[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState<AdminPick>("overview");
  const current = selection === "overview" ? null : adminModule(selection);
  const desk = current?.desk ?? null;

  function reload() {
    return adminDesk()
      .then((row) => {
        setTools(row.tools);
        setPeople(row.people);
        setReady(true);
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <AdminShell selection={selection} onSelect={setSelection} error={error} ready={ready}>
      {selection === "overview" ? <ModuleDirectory onOpen={setSelection} /> : null}
      {current && !current.desk ? <PlannedModule module={current} onOpen={setSelection} /> : null}
      {desk === "inicio" ? <CommandCenter /> : null}
      {desk === "modelo" ? <ModelDesk /> : null}
      {desk === "fila" ? <QueueDesk /> : null}
      {desk === "normas" ? <NormsModule /> : null}
      {desk === "politicas" ? <PoliciesModule onError={setError} /> : null}
      {desk === "dados" ? <DataModule onError={setError} /> : null}
      {desk === "conteudo" ? <ContentModule key={current?.id} desk={tools} tab={current?.focus} /> : null}
      {desk === "sistema" ? <SystemModule key={current?.id} tab={current?.focus} /> : null}
      {desk === "instrumentos" ? <InstrumentModule tools={tools} onSaved={reload} onError={setError} /> : null}
      {desk === "pessoas" ? <PeopleModule people={people} onSaved={reload} onError={setError} /> : null}
    </AdminShell>
  );
}