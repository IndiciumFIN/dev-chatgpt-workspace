# Dois sistemas de contrato — qual é o quê

O projeto tem duas pastas com nomes parecidos e propósitos opostos. Confundi-las
já custou uma limpeza inteira, então a regra está escrita aqui.

## `contracts/` — invariante de runtime

Gerado a partir do código. **A aplicação depende destes arquivos**: `src/lib/contracts.ts`
importa o índice gerado e valida em tempo de carga. Se um contrato estiver errado
ou ausente, a aplicação não sobe (`ContractViolation`).

Nada aqui é escrito à mão. Para mudar um contrato, muda-se o código e roda-se:

    node scripts/generate-entity-contracts.mjs

Verificado por `scripts/check-contract-coverage.mjs`, que roda **antes** do build
e do teste. Ele bloqueia quando: uma entidade existe e não tem contrato, um contrato
cita algo que não existe, um id falta ou se repete, ou um contrato fica órfão.

| contrato | cobre |
|---|---|
| `CE-CONTRACT-ROUTES` | uma entrada por arquivo em `src/routes/` |
| `CE-CONTRACT-COMPONENTS` | um por componente em `src/components/site/` |
| `CE-CONTRACT-DESIGN-TOKENS` | paleta congelada e paleta recusada |
| `CE-CONTRACT-CHROME` | tokens das faixas de cabeçalho |
| `CE-CONTRACT-BRAND` | assets de marca, com `papel` e `status` |
| `CE-CONTRACT-CLINICAL-TOOLS` | slugs do catálogo clínico |
| `CE-CONTRACT-ARTICLES` | slugs do catálogo de artigos de fundo |

## `registers/` — evidência versionada

Histórico de auditoria. **Não é lido pela aplicação** — é lido por scripts de
auditoria e responde "o que foi decidido, quando, e com que evidência". Fica
versionado com o nome da versão no arquivo porque é um registro de estado, não
uma invariante viva.

`registers/i18n/country-icon-contract.v1.json` é a exceção: nasceu da fusão de
dois registros que descreviam a mesma entidade (decisão de política + gate de
aprovação). Passou a ser contrato único, não duas metades.

## A regra

- Afirmação sobre **o que o código faz agora** → vai em `contracts/`, gerada do código.
- Registro de **o que foi decidido e com que fonte** → vai em `registers/`.
- String solta em `.ts` que descreve estado controlado pelo código → sempre foi
  candidata a mentir. Derive do contrato.
