// Pilot: resolver de capabilities — PURO, sem UI, sem rede, sem efeitos colaterais.
// Fonte dos bindings: registers/canonical/object-capability-binding.candidate.v0.1.json (PR #21, CANDIDATE).
// Regra dura: resolver NUNCA devolve PASS. Devolve suporte e contexto; a promoção é humana.

export type SupportLevel = 'PROPOSED' | 'SUPPORTED' | 'BLOCKED';
export type Channel = 'WEB' | 'PWA' | 'PRINT' | 'EXPORT';

export type CapabilityBinding = {
  readonly capabilityId: string;
  readonly support: SupportLevel;
  readonly resolver: string;
  readonly channels: readonly Channel[];
  readonly guest: string;
  readonly authenticated: string;
};

export type ObjectBindings = {
  readonly objectType: string;
  readonly capabilities: readonly CapabilityBinding[];
};

export type ResolutionContext = {
  /** Guest-first: o baseline não exige autenticação. */
  readonly authenticated: boolean;
  readonly channel: Channel;
  readonly policyAllowsGuest: boolean;
};

export type ResolvedCapability = CapabilityBinding & {
  readonly available: boolean;
  readonly reason: string;
};

export const OBJECT_TYPES = [
  "Article",
  "Guide",
  "LibraryEntity",
  "ClinicalTool",
  "Course",
  "Trail",
  "JobOpportunity",
  "Competition",
  "Residency",
  "Question",
  "Simulation",
  "ResearchProject",
  "Norm",
  "CareerRole",
  "Organization",
  "MediaAsset"
] as const;
export type ObjectType = (typeof OBJECT_TYPES)[number];

const BINDINGS: readonly ObjectBindings[] = [
  {
    "objectType": "Article",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LATER",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COPY-LINK",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PRINT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COPY-CITATION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RECENTS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-HISTORY",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PROGRESS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RESUME",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-NOTE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-HIGHLIGHT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ANNOTATION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-TOOLTIP",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-INLINE-HELP",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Guide",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LATER",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PRINT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OFFLINE-PACKAGE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PROGRESS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RESUME",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-NOTE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-HIGHLIGHT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "LibraryEntity",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-DETAIL-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-GRID-VIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LIST-VIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-GALLERY-VIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FILTER",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SORT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RECENTS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-HISTORY",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PROGRESS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RELATED-CONTENT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "ClinicalTool",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PIN",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RECENTS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALC-HISTORY",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LAST-INPUTS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PRESETS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-EXAMPLE-DATA",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALC-STEPS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COPY-RESULT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SAVE-RESULT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SIMULATOR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CONVERTER",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SAFETY-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PRINT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-TOOLTIP",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FIELD-HELP",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FORMULA-HELP",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-TOUR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Course",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LATER",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SAVED-VIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FILTER",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALENDAR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PROGRESS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RESUME",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPLETION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LEARNING-HISTORY",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Trail",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LATER",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PIN",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PROGRESS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RESUME",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPLETION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-LEARNING-CHECKLIST",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALENDAR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "JobOpportunity",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SAVED-VIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SAVED-SEARCH",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-DEADLINE-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALENDAR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Competition",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SAVED-VIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CHANGE-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-DEADLINE-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALENDAR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Residency",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALENDAR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Question",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BOOKMARK",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-NOTE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-HIGHLIGHT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Simulation",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PROGRESS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RESUME",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SIMULATION-ATTEMPT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-HISTORY",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "ResearchProject",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-NOTE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ANNOTATION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CALENDAR",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Norm",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BOOKMARK",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SOURCE-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-REFERENCE-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPARE-VERSIONS",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-VERSION-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-DIFF-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-CHANGE-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COPY-CITATION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-OUTPUT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PRINT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "CareerRole",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COMPARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-PIN",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "Organization",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-FOLLOW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-QUICK-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ALERT",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  },
  {
    "objectType": "MediaAsset",
    "capabilities": [
      {
        "capabilityId": "CAP-FAVORITE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-COLLECTION",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-BASKET",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-ASSET-PREVIEW",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-DOWNLOAD",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-SHARE",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      },
      {
        "capabilityId": "CAP-RIGHTS-CHECK",
        "support": "PROPOSED",
        "resolver": "CONTEXT_REQUIRED",
        "channels": [
          "WEB",
          "PWA"
        ],
        "guest": "POLICY_DEFINED",
        "authenticated": "POLICY_DEFINED"
      }
    ]
  }
];

export function bindingsFor(objectType: string): readonly ObjectBindings[] {
  return BINDINGS.filter((b) => b.objectType === objectType);
}

/**
 * Resolve as capabilities de um tipo de objeto para um contexto.
 * Puro: mesma entrada -> mesma saída. Nunca-promoção: `available` true não significa PASS.
 */
export function resolveCapabilities(
  objectType: string,
  context: ResolutionContext,
): readonly ResolvedCapability[] {
  const groups = bindingsFor(objectType);
  if (groups.length === 0) return [];
  return groups.flatMap((group) =>
    group.capabilities.map((cap): ResolvedCapability => {
      const channelOk = cap.channels.includes(context.channel);
      const identityOk = context.authenticated ? cap.authenticated !== 'BLOCKED' : cap.guest !== 'BLOCKED';
      const policyOk = context.authenticated || context.policyAllowsGuest;
      const available = channelOk && identityOk && policyOk && cap.support !== 'BLOCKED';
      const reason = !channelOk
        ? `canal ${context.channel} fora do contrato da capability`
        : !identityOk
          ? 'identidade não permitida para esta capability'
          : !policyOk
            ? 'policy não permite guest para esta capability'
            : cap.support === 'BLOCKED'
              ? 'capability bloqueada na fonte'
              : 'disponível enquanto a fonte for CANDIDATE (sem promoção)';
      return { ...cap, available, reason };
    }),
  );
}
