# Vila do Cuidado — entrega para Git e Supabase Storage
Status: scripts and manifests versioned; archive binary import MUST be executed separately.

## Fontes
Master histórico: `Vila_do_Cuidado_CONSOLIDADO_MASTER_LOCAL_2026-08-26.zip`; verificar SHA/CRC da origem.
W04: `VILA-W04-pronto-para-incorporar-v0.3.0.zip`; contém oito PNGs e já há oito registros de mídia no Supabase.
Nenhum logo/ilustração deve ser regenerado; imagens iguais (SHA) mapeiam para arquivo único.

## Execução local para preparar commit real de imagens
```bash
python scripts/vila_publish_assets.py --archive /CAMINHO/Vila_do_Cuidado_CONSOLIDADO_MASTER_LOCAL_2026-08-26.zip --output public/vila/archive --manifest docs/viladocuidado/VILA_ASSET_MANIFEST_COMPLETE.json
git add public/vila/archive docs/viladocuidado/VILA_ASSET_MANIFEST_COMPLETE.json
git commit -m "assets(vila): import original unique hash-verified images"
git push origin viladocuidado
```

## Upload efetivo ao Supabase Storage
Somente depois de criar/reconciliar bucket privado `vila-do-cuidado` e executar com credenciais de serviço APENAS em máquina/CI seguro:
```bash
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<SECRET_NOT_IN_GIT>"
python scripts/vila_publish_assets.py --archive /CAMINHO/MASTER.zip --output public/vila/archive --manifest docs/viladocuidado/VILA_ASSET_UPLOAD_RESULT.json --upload
```
O script usa `upsert=false`; respostas 409 são divergências a investigar, NÃO são marcadas como sucesso. O retorno precisa ser confirmado por leitura do Storage e hash local. Não atualize storage_ref para uploads falhos.

## Escopo e gates
Sem duplicação de tabelas: reaproveitar `ce_platform.canonical_objects` e `ce_platform.media_assets`.
Os oito metadados prioritários já foram registrados no Supabase mas seus `storage_ref` seguem nulos.
Não registrar publicações/APPROVED sem autorização do Kernel. Importação não é homologação.
Restante do ZIP inclui outros arquivos não-mídia; preservar originais e inventariar antes de declarar migração completa.
