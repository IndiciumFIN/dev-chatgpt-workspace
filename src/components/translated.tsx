import { useEffect, useState } from "react";
import { useChrome } from "@/lib/chrome";
import { translateText } from "@/lib/translate";

export function Translated({ text }: { text: string }) {
  const { locale, consent } = useChrome();
  const [value, setValue] = useState(text);

  useEffect(() => {
    let live = true;
    setValue(text);
    if (locale === "pt-BR" || consent === "unknown" || !consent.translation) return;
    translateText(text, locale).then((next) => {
      if (live) setValue(next);
    });
    return () => {
      live = false;
    };
  }, [text, locale, consent]);

  const translated = locale !== "pt-BR" && value !== text;
  return <span lang={translated ? locale : "pt-BR"}>{value}</span>;
}
