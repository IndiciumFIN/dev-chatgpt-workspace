# CKO / COFEN-COR — auditor de integridade local P0

**Situação:** evidência técnica em ambiente isolado, **sem autorização de publicação clínica/editorial**. Destino de versionamento autorizado pelo proprietário: `IndiciumFIN/dev-chatgpt-workspace`, branch `main`, diretório isolado `audit/cko/cofen-cor/p0-local-integrity-20261114/`.

## Escopo efetivamente verificado

- 23/23 cadeias de referência de claim, aquisição HTML, texto derivado, SHA do fragmento e localizador conferem **dentro do snapshot ZIP local pinado**.
- 20 identificadores distintos de evidência e quatro documentos normativos; quatro claims derivados da COFEN 429/2012 são **históricos** porque foi revogada pela COFEN 754/2024.
- 0/23 claims com confronto semântico **independente** contra a versão oficial autenticada; zero revisão clínica ou jurídica; zero promoção de claims.
- 7 testes adversariais sintéticos do módulo.

Referências externas como páginas oficiais, hashes de arquivo e links não equivalem a direitos de redistribuição, certificação, vigência ou aprovação clínica.

## Executar com os originais, que NÃO são publicados aqui

O verificador não faz requisições de rede nem reproduz textos de normas. Recebe o ZIP de captura e o CSV de crosswalk **localmente**, sob custódia do operador:

```bash
python audit/cko/cofen-cor/p0-local-integrity-20261114/verify_local_capture.py \
  --archive /local/CKO_P0_COFEN_COR_OFFLINE_G15_VALIDATED_CANDIDATE_20261114.zip \
  --crosswalk /local/P0_CKO_CLAIM_RIGHTS_CROSSWALK_23.csv \
  --archive-sha256 c364dcd10ad1ebb5831cb5ee8af001c1d67ead2cf3d61dcd2556f396ca5bbd05 \
  --crosswalk-sha256 94ff07d728db1e89d926ff29d3e38708360e55b9834553f69f247179c669e6c8 \
  --output-dir /local/cko-audit-output
python -m unittest discover -s audit/cko/cofen-cor/p0-local-integrity-20261114/tests -p 'test_verify_local_capture.py' -v
```

Dados reais não são necessários para os testes sintéticos. As saídas em `reports/` são metadados produzidos na auditoria local anterior: **não representam nova extração, conferência independente nem fonte oficial homologada**.

## Política do workspace público

Este conteúdo é colocado sob `audit/`, não altera rotas, banco, autenticação, design system, schemas canônicos ou gates existentes. Não inclui o ZIP com capturas normativas nem o crosswalk original. Claims, IDs de evidência e hashes são exclusivamente metadados de revisão. O repositório `IndiciumFIN/dev-chatgpt-workspace` foi consultado e, na verificação de 14/11/2026, GitHub informou visibilidade **pública**; revisar essa visibilidade antes de incluir qualquer fonte licenciada, dados pessoais ou relatório confidencial.

O próximo gate é obter recibos independentes de confronto da fonte primária, direitos por operação e revisão clínica. **Nenhum retorno `PASS` deste módulo pode promover conteúdo clínico ou liberar deploy.**
