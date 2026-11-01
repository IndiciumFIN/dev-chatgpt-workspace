# Auditoria do ecossistema

Isto não certifica ISO, COSO, WCAG nem COFEN. O escopo gravado em `governance_item` deixa certificado ISO de fora. A auditoria só cobra o que as tabelas e as políticas desta mesa já dizem.

## Bloqueio

Falha o teste. Não pode ir ao ar.

| Id | Norma interna | O que impede |
|---|---|---|
| PUB-CORPO | Política de dado | Texto publicado com corpo vazio |
| PUB-IDIOMA | Portão de publicação | Idioma diferente de pt-BR publicado, fora da home em en, es e fr |
| CLI-CAPA | Capa do instrumento | Cálculo aberto fora de Apgar, Braden, gotejamento, IMC e Morse |
| CLI-FORMULA | Fórmula | Capa publicada sem fórmula, critério ou campo |
| KER-PESSOA | Admissão | Aprovador com o valor `kernel` |
| LGPD-PACIENTE | Política de dado | Coluna de paciente, leito, prontuário ou CPF |

## Achado

O teste exige que os quatro achados atuais continuem visíveis até a causa fechar. Os dois de dicionário físico só aparecem se a paridade das 94 tabelas quebrar.

| Id | Norma citada | O que ainda não fecha |
|---|---|---|
| DIC-SINTAXE | Dicionário interno | Sintaxe do slug pede hífen e o banco usa sublinhado |
| I18N-HREFLANG | WCAG 3.1.1 | `languageLinks` anuncia en, es e fr sem texto publicado |
| MID-SEM-ALT | WCAG 1.1.1 | `media_asset` não tem texto alternativo |
| REG-RASCUNHO | Regra de negócio | `business_rule` ainda em rascunho |
| DIC-ENTIDADE-SEM-TABELA | Dicionário interno, não ISO 8000 | Entidade sem tabela. Hoje não dispara. |
| DIC-TABELA-SEM-ENTIDADE | Dicionário interno | Tabela sem entidade. Hoje não dispara. |

Fora deste conjunto: produto Schema.org, CPF, endereço, isolamento por empresa e estatística de tabela zumbi. Não há essas estruturas.

A execução está em [src/lib/ecosystem-audit.ts](../src/lib/ecosystem-audit.ts) e entra no `npm test`.
