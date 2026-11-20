# CE / Workspace — revisão semântica das seis colisões históricas (20/11/2026)

**Origem imutável:** `IndiciumFIN/calculadorasdeenfermagem@e0f62491b104f4a97c6025a6393cabc2e7ada30e`.
**Destino:** `IndiciumFIN/dev-chatgpt-workspace@main` com baseline anterior ao ajuste `3fb11fe7949bda47c3067dba1c1c420188265343`.
**Escopo:** comparação read-only da origem e do destino para os seis caminhos colidentes; somente a ampliação aditiva de regras seguras de `.gitignore` é proposta para a raiz. **Não substituir pacotes, framework, banco, arquivos de ambiente, deploy ou workflows.**

## Decisões por colisão

| Caminho | Blob origem | Blob canônico anterior | Diferença e decisão |
|---|---|---|---|
| `.env.example` | `26ef4719b4945c5b79047de090feaefc3d593e6a` | `03d514961a9778dc312ca4f8d9be93f22ded14fa` | Origem define `NEXT_PUBLIC_SUPABASE_*` e placeholders de chaves de serviço; destino mantém flags de preview/identidade e banco desativado. **KEEP_CANONICAL / HOLD_SECRET_REVIEW**. Não transplantar segredos, nem ativar Supabase por variável. |
| `.gitignore` | `f6cf09f6171af3519e9fb489d99e87010222d56f` | `0453de8f2f272cbed1e705f4f314516eacceb6a2` | Origem contém exclusões adicionais de `*.pem`, caches Python, `.venv`, `.next` e PnP. **MERGE_SAFE_PATTERNS_ONLY**: acrescentar essas exclusões sem retirar as regras de Vite/Grok. |
| `package.json` | `c34dea63000f29524e0e77d1b1f4c428236808e8` | `a6834d59c30429141ebd600c2fef328c11a5e1bd` | Origem é Next.js 15 / React 19; destino é Vite/TanStack e possui CI, auth, gates e SPA específicos. **HOLD_APP_ISOLATION**; não substituir nem mesclar dependências na raiz. |
| `package-lock.json` | `a0cc1e9fc7828eb96216e3f18fc0dc8cba159a6c` | `c2beea71660d7f44d647f3adb1195e4a75701d92` | Ambos lockfile v3; origem possui 377 entradas de pacotes, destino 469 na captura. **KEEP_CANONICAL** e refazer lock somente se um app independente for aprovado. |
| `README.md` | `16a39baae6d767bd9d92dd0b92f817a4961e624c` | `36f45e65e427365e6e330d19c693f019100e1735` | README antigo orienta criar projeto Supabase novo; contradiz `WORKSPACE.md` atual (banco Calculadoras-Smart único). **KEEP_CANONICAL / HISTORICAL_REFERENCE_ONLY**; não reproduzir instrução obsoleta. |
| `tsconfig.json` | `2aead53bd47286c1c87d4e092b10593a0c054a98` | `48d08c357f0890c7fab548577f493efb8a1d1aa1` | Configuração origem usa plugin Next e `.next/types`; destino usa `vite/client`, `checkJs` e inclui `server`. **KEEP_CANONICAL / HOLD_APP_ISOLATION**. |

## Segurança, homologação e fechamento

- A revisão semântica não altera o estado `COLLISION_MANUAL_RECONCILIATION` dos seis itens no manifesto, pois nenhum dos seis foi admitido como componente funcional ou substituiu sua configuração.
- O `.gitignore` é alterado somente por união de exclusões preventivas; não é prova de ausência de segredos no histórico, nem substitui secret scanning.
- O código Next.js e os workflows legados devem permanecer candidatos isolados até existir contrato de app, evidências de licença, comparação de rotas, imports e dados, testes offline, E2E e validação de gates.
- **Banco:** migrations históricas não autorizadas para execução; não criar banco novo, não alterar tabelas/credenciais de produção.
- **Publicação clínica:** nenhuma evidência histórica se converte em aprovação; exigir proveniência, licença, revisão clínica independente e segurança.
- Condição de saída por colisão: delta semântico explícito com caminho de destino, decisão `ADMIT` ou `REJECT`, prova de integridade, rollback, testes Node/TypeScript/Python e CI no SHA exato. Até então, **HOLD**.

Este relatório preserva decisões rastreáveis e não declara o fechamento das seis colisões.
