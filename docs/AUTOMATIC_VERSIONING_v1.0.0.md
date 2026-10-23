# Versionamento e registers automáticos — v1.0.0

**Escopo:** apenas a cópia de trabalho do backup público parcialmente homologado. Não faz crosswalk com GitHub, não altera o banco e não promove conteúdo.

## Funcionamento

Todos os scripts npm originais recebem `pre<script>` e `post<script>` para inventariar arquivos antes/depois. `npm run audit:run -- <script>` é a forma **recomendada**, pois registra também `exitCode` quando o script chamado falha; hooks `post` do npm, sozinhos, podem não ser executados após uma falha. Scripts criados futuramente devem ser adicionados aos hooks ou obrigatoriamente executados pelo wrapper.

### Registers sob `audit/registers/`

| Registro | Conteúdo | Política |
|---|---|---|
| `current.json` | inventário de todos os arquivos monitorados, SHA-256, tamanho, tipo e revisão | estado corrente, substituído atomicamente |
| `events.jsonl` | evento da execução, hora UTC, fase, script, delta, exitCode quando disponível, eventHash | append-only lógico |
| `file-changes.jsonl` | caminhos adicionados, modificados ou removidos por execução | append-only lógico |
| `routes-current.json` | arquivos de rotas | projeção atual |
| `templates-current.json` | componentes e contratos de template | projeção atual |
| `content-current.json` | catálogo clínico e conteúdo | projeção atual |
| `media-current.json` | arquivos de `public` | projeção atual |
| `application-current.json` | aplicação e servidor | projeção atual |
| `operations-current.json` | scripts, documentos, configuração etc. | projeção atual |

**Revisão:** avança somente quando o conjunto de arquivos monitorados muda. Execuções sem mudança ainda recebem um novo `id` e um evento, mas preservam a revisão.

## Comandos

```bash
npm run audit:snapshot
npm run audit:verify
npm run audit:run -- typecheck
npm run audit:run -- test
npm run audit:run -- build
npm run audit:run -- audit:clean:check
```

### Restrições intencionais

- A pasta `audit/` não entra no próprio inventário para evitar loops.
- `node_modules`, saídas de build e `.env*` não são registrados; os hashes não incluem conteúdo sensível.
- Esta é uma trilha local de evidências: o operador que pode editar o disco também pode alterar os logs. Portanto, **não constitui log imutável de auditoria independente**. Selagem externa (armazenamento WORM/assinatura, retenção e readback) é gate posterior.
- Múltiplas execuções npm simultâneas ainda não têm bloqueio transacional para o registro `current.json`; concorrência é `FIND` aberto e exige proteção antes de automação paralela.
- O controle coleta inventário e deltas, mas não atribui `PASS` clínico, visual, legal ou de segurança.
- Hooks são disparados apenas por `npm run` para os scripts configurados. Não interceptam `node script.js`, invocações `npx`, ou scripts npm introduzidos no futuro sem a política de cadastro.

## Critério para próximo gate

Testar alteração real, exclusão simulada em workspace de teste, falha de script, execução concorrente, detecção de adulteração e sincronização com storage remoto de evidências. Registrar FIND/WO/política/validador e obter admissão verificável antes de alterar fluxos produtivos.
