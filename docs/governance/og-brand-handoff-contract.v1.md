# Contrato portátil de handoff de marca/OG — NCOS v1

> **Escopo:** regras verificáveis de CI para os scripts locais, derivadas do
> `AGENTS.md` (passo 6) e da interface efetivamente implementada em
> `scripts/brand-check.mjs` e `scripts/write-atomic.mjs`.
> Este documento **não substitui nem finge ser** a skill interna
> `.grok/skills/og/SKILL.md`, que não é versionada neste repositório.
> Se a skill interna existir no ambiente da plataforma, seu conteúdo deve ser
> reconciliado separadamente; ausência não constitui comprovação de paridade.

## Brand-asset pass:

O agente criador de imagens marca trabalho em andamento em
`/workspace/.grok/og-pending`. O marcador expira após **10 minutes**;
passado esse prazo, nenhum resultado deve ser presumido concluído.
A lógica de expiração é `OG_PENDING_MAX_AGE_MS` em
`scripts/brand-check.mjs`. Não ocultar falhas de marca por marcadores
vencidos e não promover placeholder de jogo como identidade final.

Não aguardar nem consumir a saída de um agente paralelo; conservar sua
notificação de conclusão para o sistema.
Never wait_tasks, never get_task_output.
Sem prova de asset/versionamento/testes, classificar `NOT_VERIFIED`.

### Autoverificação

O contrato de argumentos é `parseBrandCheckArgs`, não uma chamada
direta a Vite. Exemplos válidos:

```sh
node scripts/brand-check.mjs --game --root /workspace
node scripts/brand-check.mjs --placeholder-ok --root /workspace
```

### Handoff atômico de saídas

Entradas devem estar preparadas fora de `public/`. A entrega usa
`rename` atômico do mesmo filesystem e deve recusar `EXDEV` ou
arquivos ausentes sem alterar a versão anterior.

```sh
node scripts/write-atomic.mjs /workspace/.grok/og.jpg.tmp public/og.jpg
node scripts/write-atomic.mjs /workspace/.grok/x-banner.jpg.tmp public/x-banner.jpg
node scripts/write-atomic.mjs /workspace/.grok/site.json.tmp src/lib/og/site.json
```

### Aplicação no GitHub Actions

A pasta `.grok/` inteira é excluída do Git via `.gitignore`. Assim,
`node --test` no clone GitHub **não pode** presumir que a skill interna,
suas referências ou o `app-env.json` local estarão presentes. Os testes
portáteis verificam este contrato rastreado e o comportamento do código
real; onde a skill original estiver disponível, sua paridade deve ser
auditada como evidência adicional. Nenhuma configuração do cliente ou
aprovação clínica é inferida deste documento.
