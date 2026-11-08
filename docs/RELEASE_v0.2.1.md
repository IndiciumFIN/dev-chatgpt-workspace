# WU-TRIB — Correção de integridade v0.2.1

Ambiente: Vercel WU-TRIB independente, Git branch `wutrib/web-pilot-20261108`. Dados exclusivamente fictícios, sem conexão de aplicação ao Supabase e sem login.

## Defeito e risco
Na v0.2.0, reenviar uma EFD eliminava os erros anteriores de seleção parcial de XMLs (`selectionErrors=[]`). Isso permitia retomar o cruzamento com apenas parte dos XMLs e gerar falsos achados de ausência. A v0.2.1 separa `xmlErrors`/`efdErrors` e conserva `xmlSelectionCount` (número realmente selecionado). A leitura assíncrona usa controle de versão para que operações anteriores não sobrescrevam seleções mais recentes.

## Evidências e melhorias
- Contextos de achados incluem arquivo XML e/ou linha C100 quando presentes; isto é proveniência de entrada, não prova de causa-raiz.
- Períodos fictícios da fixture de XML/EFD foram alinhados.
- Regressão no Chromium: múltiplos XMLs contendo um arquivo rejeitado, substituição posterior da EFD válida, estado `LOTE INCOMPLETO` mantido, exportações desabilitadas.
- A suíte de browser é DOM injetado por restrição de rede do ambiente; prova de HTTPS existe no GitHub Actions para v0.2.0, mas *não prova o código do v0.2.1* até o novo deploy e uma nova verificação.
- Git `main` do repositório compartilhado permanece intocado; projeto Vercel exclusivo. Repositório exclusivo do WU-TRIB ainda pendente.

## Bloqueios remanescentes
Sem homologação fiscal/XSD, sem integração TOTVS, sem autenticação, sem persistência, sem dados empresariais reais. As regras permanecem informativas e não concluem conformidade fiscal.
