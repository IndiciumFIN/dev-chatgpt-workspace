/**
 * Tenant store — Zustand
 *
 * Mantém o tenant ativo (CE / Vila / Simulados).
 * Não muta fontes canônicas — apenas projeção de leitura.
 * Consome registers/tenants/*.v1.json.
 */
import { create } from "zustand";

export type TenantId = "PLAT-CE" | "PLAT-VILA" | "PLAT-SIMULADOS";

export interface Tenant {
  tenant_id: TenantId;
  slug: string;
  display_name: string;
  short_name: string;
  description: string;
  status: "operational" | "candidate" | "planned" | "deprecated";
  domains: string[];
}

import ceTenant from "@/data/registers/tenants/ce.v1.json";
import vilaTenant from "@/data/registers/tenants/vila.v1.json";
import simuladosTenant from "@/data/registers/tenants/simulados.v1.json";

export const TENANTS: Tenant[] = [
  ceTenant as Tenant,
  vilaTenant as Tenant,
  simuladosTenant as Tenant,
];

interface TenantState {
  activeTenant: TenantId;
  setTenant: (t: TenantId) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  activeTenant: "PLAT-CE",
  setTenant: (t) => set({ activeTenant: t }),
}));

export function getActiveTenant(): Tenant {
  const id = useTenantStore.getState().activeTenant;
  return TENANTS.find((t) => t.tenant_id === id) ?? TENANTS[0];
}
