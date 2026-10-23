import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

/**
 * Regra: um idioma que NAO tem dicionario de interface nao pode se apresentar
 * ao buscador nem ao leitor de tela como se tivesse.
 *
 * Contexto medido (Chromium, 19 idiomas oficiais, build real):
 * - `src/lib/chrome.tsx` so tem `copy` em pt-BR/en/es/fr. Os outros 15 caem em
 *   `(copy[locale] ?? copy["pt-BR"])` e o visitante ve portugues.
 * - Antes desta regra, os 15 se auto-canonicalizavam: 15 copias byte-a-byte da
 *   mesma pagina pt-BR, todas indexaveis, competindo entre si.
 * - E o `html lang` declarava o idioma escolhido, nao o idioma do texto — o
 *   leitor de tela lia portugues com fonetica japonesa (WCAG 3.1.1).
 *
 * A verdade ja estava escrita em `src/lib/locale-registry.ts`
 * (`interfaceDictionary: "missing"`). Este teste trava o comportamento.
 */
const LOCALE_IDS = ['pt-BR', 'en', 'es', 'fr', 'de', 'it', 'hi', 'zh', 'ar', 'ja', 'ru', 'ko', 'tr', 'nl', 'pl', 'sv', 'id', 'vi', 'uk'];
const NO_DICT = LOCALE_IDS.filter((id) => !['pt-BR', 'en', 'es', 'fr'].includes(id));

// Tudo e resolvido dentro do processo filho: funcao nao sobrevive a JSON.
const payload = JSON.parse(
  execFileSync(
    process.execPath,
    [
      '--experimental-strip-types', '--import', './scripts/alias-hook.mjs',
      '-e',
      `Promise.all([
        import('./src/lib/locale-registry.ts'),
        import('./src/lib/seo.ts'),
        import('./src/lib/header-i18n.ts'),
      ]).then(([reg, seo, hdr]) => {
        const content = {};
        for (const id of ${JSON.stringify(LOCALE_IDS)}) content[id] = reg.contentLocale(id);
        const canonical = {};
        const alts = {};
        for (const id of ${JSON.stringify(LOCALE_IDS)}) {
          canonical[id] = seo.languageLinks('/', id).find((x) => x.rel === 'canonical').href;
          alts[id] = seo.languageLinks('/', id).filter((x) => x.rel === 'alternate').map((x) => x.hrefLang);
        }
        process.stdout.write(JSON.stringify({
          withInterface: reg.localesWithInterface,
          selectable: hdr.selectableLocales.map((x) => x.id),
          headerLocales: hdr.headerLocales.map((x) => x.id),
          content,
          canonical,
          alts,
        }));
      }).catch((e) => { process.stderr.write(String(e)); process.exit(1); })`,
    ],
    { encoding: 'utf8', cwd: root, stdio: ['ignore', 'pipe', 'inherit'] },
  ),
);

test('so 4 idiomas tem dicionario de interface', () => {
  assert.equal(payload.withInterface.join(','), 'pt-BR,en,es,fr');
});

test('contentLocale devolve o idioma do TEXTO, nao o escolhido', () => {
  assert.equal(payload.content['pt-BR'], 'pt-BR');
  assert.equal(payload.content.en, 'en');
  assert.equal(payload.content.es, 'es');
  assert.equal(payload.content.fr, 'fr');
  for (const id of NO_DICT) {
    assert.equal(payload.content[id], 'pt-BR', `${id} deveria resolver para pt-BR`);
  }
});

test('idioma sem dicionario canonicaliza para pt-BR, nao para si mesmo', () => {
  for (const id of NO_DICT) {
    const c = payload.canonical[id];
    assert.ok(!c.includes('lang='), `${id} canonicalizou para si mesmo: ${c}`);
    assert.ok(c.endsWith('/'), `${id} canonical deveria ser a raiz pt-BR: ${c}`);
  }
});

test('idioma com dicionario se auto-canonicaliza', () => {
  for (const id of ['en', 'es', 'fr']) {
    assert.ok(payload.canonical[id].includes(`lang=${id}`), `${id} deveria canonicalizar para si mesmo`);
  }
  assert.ok(!payload.canonical['pt-BR'].includes('lang='));
});

test('hreflang declara apenas os 4 reais + x-default', () => {
  const alts = payload.alts['pt-BR'];
  assert.equal(alts.length, 5);
  assert.deepEqual(alts.slice(0, 4).sort(), ['en', 'es', 'fr', 'pt-BR']);
  assert.equal(alts[4], 'x-default');
});

test('o seletor oferece so os idiomas que o site entrega', () => {
  // O seletor nao pode anunciar um idioma que devolve portugues. A lista vem
  // do REGISTRO (`interfaceDictionary`), nao e escrita a mao.
  assert.equal(payload.selectable.join(','), 'pt-BR,en,es,fr');
  // E o shell tem que usar essa lista, nao a lista completa.
  const shell = readFileSync(resolve(root, 'src/components/site/shell.tsx'), 'utf8');
  assert.match(shell, /selectableLocales\.map/);
  assert.doesNotMatch(shell, /headerLocales\.map/);
});

test('o vocabulario da barra de acessibilidade continua nos 19', () => {
  // O seletor reduziu, mas o vocabulario e a arte continuam prontos para quando
  // o dicionario de cada idioma existir. Nada se perde.
  assert.equal(payload.headerLocales.length, 19);
});
