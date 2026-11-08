# WU-TRIB | Auditor Web — piloto 0.2.1

Piloto de auditoria **estrutural**, inteiramente no navegador, para arquivos **fictícios**. Plataforma planejada: motor fiscal independente de ERP, integrações posteriores com TOTVS Protheus.

## Executar

```sh
npm test
python3 -m http.server 4173
# abra http://localhost:4173
```

## O que realmente faz
- Demonstra NF-e XML sintética e registros C100 da EFD ICMS/IPI (dados de exemplo).
- Permite importar localmente até 10 XMLs (máx. 2 MB cada) e um TXT (máx. 4 MB).
- Extrai chave, número, total e informações elementares; cruza chave e valor com C100, com tolerância de R$ 0,01.
- Identifica ausências, divergências de valores e chaves duplicadas, com hipóteses de investigação.
- Pesquisa, filtra e seleciona achados; exporta CSV com mitigação de fórmula e dossiê JSON.

## Limitações obrigatórias
- NÃO transmite arquivos para servidor, NÃO usa Supabase, NÃO tem login nem persiste uploads.
- NÃO valida XSD oficial, checksum da chave, semântica fiscal, situação da NF-e, retificações, natureza tributária, CFOP ou layout EFD completo.
- NÃO comprova conformidade tributária nem causa-raiz. `fiscalConformity=NOT_EVALUATED` sempre.
- Somente dados sintéticos são permitidos neste ambiente público. Não importar dados reais/identificáveis da Würth.
- O parser XML rejeita DTD/ENTITY e XMLs acima de 2 MB; o browser faz parsing local via DOMParser.
- A branch está dentro do repositório genérico compartilhado; os arquivos da branch foram gerados em árvore separada da aplicação de enfermagem.
- Vercel é projeto novo independente. Nenhum token/URL de banco na aplicação.

## Próximas fases
1. Definir fluxo de login/autorizações e isolamento organizacional; dados empresariais não entram antes disso.
2. Backend de ingestão seguro, conformidade LGPD/localização e armazenamento privado no Supabase.
3. Validador por versão oficial XSD/EFD e regras com evidência por vigência.
4. Rastreamento de causa-raiz até cadastros, TES e CFGTRIB, mediante snapshot TOTVS autorizado.

## Gates determinísticos v0.2.0

`npm run check` executa os quatro agentes especializados (contratos fiscais, segurança, UX e release) e a suíte Node. `python tests/browser_e2e.py` valida as interações em Chromium com arquivos fictícios por injeção local. Consulte `docs/DETERMINISTIC_AGENTS.md` e `docs/WAVE_02_AUDIT.md`. Nenhuma regra fiscal certifica conformidade; lote incompleto não gera achados.

## Correções v0.2.1
- Falhas na seleção parcial de XML continuam bloqueantes mesmo depois de reenviar a EFD (sem apagar advertências de outra fonte).
- Leituras assíncronas de arquivos antigos não podem sobrepor seleção posterior.
- Achados apresentam nome de arquivo XML e linha de C100 quando disponíveis; são referências de lote, não provas de causa-raiz.
- Fixture usa períodos fictícios coerentes; nenhum arquivo foi enviado ao Supabase.
