/** Candidate country-specific icon policy; not activated by default. */
export const countryIconPolicy = {
  "pt-BR": {
    "status": "documented_use",
    "fontVisual": "A+ / A−",
    "asset": null
  },
  "en": {
    "status": "official_guidance",
    "fontVisual": "text_only",
    "asset": null
  },
  "es": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "de": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "it": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "fr": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "hi": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "zh": {
    "status": "documented_use",
    "fontVisual": "字号放大 / 字号缩小",
    "asset": null
  },
  "ar": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "ja": {
    "status": "official_guidance",
    "fontVisual": "text_label",
    "asset": null
  },
  "ru": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "ko": {
    "status": "needs_screenshot",
    "fontVisual": "text_label",
    "asset": null
  },
  "tr": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "nl": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "pl": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "sv": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "id": {
    "status": "documented_controls",
    "fontVisual": "Perbesar / Perkecil Teks",
    "asset": null
  },
  "vi": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  },
  "uk": {
    "status": "hold_visual_evidence",
    "fontVisual": null,
    "asset": null
  }
} as const;
export function canActivateCountryIcon(locale: keyof typeof countryIconPolicy): boolean {
  return false; // requires verified artwork, tests and explicit approval
}
