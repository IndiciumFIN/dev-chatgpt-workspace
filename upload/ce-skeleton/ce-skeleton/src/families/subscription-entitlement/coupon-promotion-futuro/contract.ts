// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Coupon/Promotion futuro (família Subscription & Entitlement, camada PLATFORM). */
export interface couponPromotionFuturoContract {
  readonly serviceId: 'subscription-entitlement.coupon-promotion-futuro';
  readonly title: string;
  readonly layer: 'PLATFORM';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const couponPromotionFuturoContract = {
  serviceId: 'subscription-entitlement.coupon-promotion-futuro',
  title: 'Coupon/Promotion futuro',
  layer: 'PLATFORM',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;
