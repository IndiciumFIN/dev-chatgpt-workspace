# Validação real OPA / Rego e assinatura de bundles — 26/10/2026

**Tipo:** evidência de CI e FIND de compilação · **Alcance:** branch `preview/central-comando-20261026` do backup isolado, não Kernel corporativo.

## Resultado comprovado

Executado no GitHub Actions `Verificar bibliotecas — sem deploy`, com a versão **OPA v1.21.4** (release de 23 de outubro de 2026) fixada por checksum SHA-256 do binário `opa_linux_amd64_static`:

`2ab571f367f293bb19523b76f92f1945bbf245003392c7f392903f95c2b9b630`

O CI executa:
- `opa check --strict --v1-compatible contracts/cko-governance/opa`
- `opa test --fail-on-empty --verbose contracts/cko-governance/opa`

As suítes cobrem o gate de admissão Kernel e autorização de leitura dos perfis de importação. O runner OPA real identificou erro de recursão em `data.cko.import_read`, invisível aos mocks TypeScript. FIND resolvido na branch separando dados confiáveis em `data.cko_trusted` e alterando fixtures para não substituir todo `data`.

**Não interpretar PASS como admissão do Kernel**: as políticas são candidatas e os inputs/identidades dos testes são sintéticos.

## Testes criptográficos de integração em CI

O pipeline também:
1. Cria chaves RSA temporárias no runner (não arquiva, envia ou reutiliza a chave privada).
2. Constrói um bundle com as políticas `import_read.rego` e `kernel_admission.rego`, assinando com a chave temporária.
3. Verifica a assinatura com a chave pública correspondente.
4. Testa a rejeição com chave pública incorreta.
5. Testa a rejeição de bundle sem assinatura quando a verificação é obrigatória.

Os testes provam apenas **função de verificação e falha segura do CLI**. Não comprovam distribuição, ativação, ciclo de vida ou identidade corporativa de uma chave.

## Fontes normativas técnicas e risco

- [OPA Release 1.21.4](https://github.com/open-policy-agent/opa/releases/tag/v1.21.4) — binário e verificação de integridade.
- [OPA management bundles / assinatura e verificação](https://www.openpolicyagent.org/docs/management-bundles) — `.signatures.json`, chaves externas, necessidade explícita de configuração `signing`.
- [OPA CLI](https://www.openpolicyagent.org/docs/cli) — comandos `check`, `test` e `build`.

**Risco relevante (FIND):** OPA v1.21.3 corrigiu formas de contornar a verificação de assinaturas de bundles. Fixar 1.21.4 evita essa versão vulnerável conhecida, mas não substitui gestão de patches, supply chain e revisão futura. Em produção, ativação exige `bundles[_].signing` com chave/escopo confiáveis, `allow_unsigned_delta_bundles=false` e monitoramento do status de ativação. Configurar apenas `keys` sem `signing` não obriga verificação de bundles não assinados.

## HOLDs restantes

- Não existe cluster/serviço OPA corporativo operacional neste PR.
- Não existe chave corporativa persistente autorizada, JWKS ou plano de rotação com auditoria.
- O contrato HTTP para importação segue **sem rota publicada** (criação bloqueada pela integração).
- O papel PostgreSQL de leitura não foi provisionado no Supabase real.
- A verificação de decisão/identidade no executor e integração Kernel/OPA/WO depende de ambiente autorizado e avaliação independente.
- Nenhuma migração foi aplicada ao Supabase; a `main` permanece intacta.

**Resultado do gate:** `OPA_TESTED_IN_CI` e `SIGNED_BUNDLE_CRYPTO_TESTED_IN_CI`. `OPA_PRODUCTION_NOT_CONFIGURED`, `KERNEL_ADMISSION_HOLD`.
