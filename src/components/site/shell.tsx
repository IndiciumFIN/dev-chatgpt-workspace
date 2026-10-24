import { Link } from "@tanstack/react-router";
import { Accessibility, ArrowUp, BookOpenText, ChevronDown, Contrast, Instagram, Keyboard, Linkedin, Menu, Moon, Search, X, Youtube } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MobileNav, SiteNav } from "@/components/site/site-nav";
import { brandLogo } from "@/lib/contracts";

import { useChrome, type FocusColor, type Locale, type OptionalConsent } from "@/lib/chrome";
import { navLabel } from "@/lib/translate";
import { headerWords, selectableLocales } from "@/lib/header-i18n";
import { authEnabled } from "@/lib/auth/client";
import { fontControlVisual } from "@/lib/country-icon-rendering";
import { focusColorName } from "@/lib/focus-color-i18n";

const focusColors: { id: FocusColor; hex: string }[] = [
  { id: "yellow", hex: "#ff0" },
  { id: "lime", hex: "#b6ff00" },
  { id: "cyan", hex: "#22d3ee" },
  { id: "magenta", hex: "#f0abfc" },
];

/** Caminho público derivado do contrato de marca (o prefixo `public/` sai fora). */
const brandLogoPublicPath = brandLogo?.file?.replace(/^public/, "") ?? "/brand/logo.svg";

export function Shell({ children }: { children: ReactNode }) {
