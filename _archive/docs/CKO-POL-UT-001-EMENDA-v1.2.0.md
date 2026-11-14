# CKO-POL-UT-001 — Emenda v1.2.0

**Base:** CKO-POL-UT-001 v1.1.0 (22/08/2026) · **Emenda:** 22/10/2026
**Natureza:** decisão do dono do produto, registrada como emenda controlada.
**Escopo alterado:** §5 (Dados, contexto do paciente e interoperabilidade), §10 (Política de
não captura de dados sensíveis), §11 (Referências), Apêndice A **UTC-016**.
**Escopo preservado:** §1 (fluxo normativo), §2 (proibição de inline), §3 (binding em nível de
campo), §4 (segregação multiagente), §6 (engine/segurança), §7 (DS e templates),
§8–§9, §11–§14, §15 (aplicação por camadas), §16 (regra de implementação e gate atual).

---

## 1. Decisão

**Os campos de identificação do paciente passam de PROIBIDOS a OPCIONAIS**, desde que:

**(a) Máscara para proteção.** Todo valor de campo de identificação é exibido — em tela, em
ficha, em impressão e em PDF — **mascarado por padrão**. O valor íntegro só existe no estado
efêmero do formulário, durante a sessão, e nunca é renderizado em claro.

**(b) Captura de informação desabilitada para fins de LGPD.** Valores de campo de identificação
**não são capturados** para nenhuma finalidade de LGPD. Especificamente, não entram em:

- product analytics / telemetria;
- logs de produto e observabilidade de aplicação;
- publicidade, targeting, perfilamento e mensuração individual;
- publicidade contextual e elegibilidade de anúncio;
- persistência de user state e de qualquer storage do navegador;
- transmissão a servidor, a API ou a terceiro qualquer.

A permanência do valor é **efêmera e efêmera apenas**: nasce no formulário, vive na memória de
runtime da sessão e é destruído com a sessão.

---

## 2. Texto alterado

### 5. Dados, contexto do paciente e interoperabilidade — §5, parágrafo "Patient Context"

> **Patient Context (v1.2.0):** quando aplicável, a ferramenta pode oferecer campos de
> contexto assistencial — **todos opcionais**, nunca obrigatórios. Os campos de identificação
> direta (nome, registro, prontuário, leito) e os de identificação indireta (unidade, setor,
> data de atendimento) são **mascarados por padrão** na exibição, na ficha, na impressão e no
> PDF. Seu uso é **opcional** e do profissional; a ferramenta não os exige para calcular.
>
> Quando usados, os valores **não são capturados** para nenhuma finalidade de LGPD: não
> entram em analytics, logs de produto, publicidade, targeting, persistência de user state
> nem transmissão a servidor ou terceiro. A permanência é efêmera, limitada à sessão em
> memória de runtime, e encerrada ao fim dela. Valores clínicos necessários ao cálculo são
> **Observations efêmeras de runtime**, sem vínculo de identidade, sem persistência, sem
> analytics e sem publicidade.

> *Nota de versão:* a v1.1.0 proibia solicitar nome, CPF, prontuário, e-mail, telefone,
> endereço, geolocalização, identificador de dispositivo ou texto livre de paciente. A
> v1.2.0 **não reverte a proibição de coleta de dado sensível e de identidade** — mantém-na —
> e altera **apenas** a obrigatoriedade e a forma de exibição: opcionais, mascarados e sem
> captura LGPD.

### 10. Política de não captura de dados sensíveis — §10

> A plataforma pública opera com princípio **NO_SENSITIVE_CAPTURE**, acrescido de
> **NO_LGPD_CAPTURE** para valores de contexto assistencial.
>
> **Não são solicitados, coletados, persistidos, transmitidos ou registrados** dados pessoais
> sensíveis de pacientes. **Ferramentas não solicitam identificadores diretos ou indiretos e
> não possuem campos de texto livre clínico capazes de reidentificação.**
>
> **Contexto assistencial opcional (v1.2.0).** Quando o produto oferece campos de contexto —
> identificação direta e indireta — eles são:
>
> 1. **opcionais**, sem qualquer campo obrigatório por asterisco ou por regra;
> 2. **mascarados por padrão** em tela, ficha, impressão e PDF;
> 3. **não capturados** para fins de LGPD — vedados em analytics, logs de produto, publicidade,
>    targeting, mensuração individual, persistência de user state e transmissão a
>    servidor ou terceiro.
>
> A permanência é efêmera, de sessão, em memória de runtime.
>
> A SAE, o Tool Handoff, gráficos, PDF/print e memória de cálculo recebem apenas o mínimo
> necessário e respeitam a mesma política. Qualquer mudança futura que pretenda tratar dado
> pessoal ou sensível exige novo escopo, base legal, Privacy Impact Gate e revisão formal
> desta política antes da implementação.

### 11. Política de referências bibliográficas e citações — acréscimo

> **Citação de norma com pinpoint (v1.2.0).** Citação legal/normativa exige pinpoint
> obrigatório (art./§/inc./item) e apontamento de vigência/proveniência, preferindo a fonte
> oficial. A referência exibida ao usuário é redigida em linguagem humana, sem expor IDs
> internos de requisito, validator, evidence bundle ou hash. O **badge de mudança normativa** é
> exibição obrigatória sempre que houver edição superveniente aplicável.

---

## 3. Apêndice A — UTC-016 (reescrito)

| ID | Domínio | Camada primária | Requisito (v1.2.0) |
|---|---|---|---|
| UTC-016 | Patient context | Clinical Rules | Contexto assistencial é **opcional** e sempre exibido **mascarado**; valores não são capturados para finalidades de LGPD (analytics, logs, publicidade, targeting, persistência, transmissão); permanência efêmera de sessão; a ferramenta calcula sem ele. |

**Controles derivados:** UTC-002 (binding por campo, com `privacy_policy` por campo),
UTC-003 (proibição de inline), UTC-013 (privacy profile no contrato da ferramenta),
UTC-016 (aqui), UTC-051 (canonical por Route Registry), UTC-072 (E2E de privacidade),
UTC-092 (divulgação de conteúdo auxiliado por IA).

---

## 4. Efeitos no produto público

| Onde | Antes | Depois |
|---|---|---|
| `clinical-form.tsx` — painel "Dados do paciente" | 4 campos obrigatórios na prática (sem rótulo de opcional) | 4 campos **opcionais**, com aviso de máscara |
| `clinical-sheet.tsx` — ficha impressa/PDF | Nome, Idade, Unidade/leito, Data **em claro** | valores mascarados conforme a estratégia por campo (abaixo); "não informado" quando vazio |
| Analytics / telemetria | inexistente | continua inexistente; agora é **exigência declarada**, não acidente |
| `localStorage` | não guarda paciente | continua não guardando; prohibited explicitamente |
| Export/PDF | inclui identidade em claro | inclui **máscara** |

---

## 4.1 Estratégia de máscara por campo

A máscara protege **o que identifica**, não o que é clínico. Mascarar a idade para "••"
tornaria a ficha inútil — e a ficha é o motivo de o campo existir.

| Campo | Classe | Estratégia | Exemplo |
|---|---|---|---|
| `nome` | identificador **direto** | `FULL` | "Maria das Graças Silva" → **"M•••• S••••"** |
| `setor` (unidade/leito) | identificador **indireto** | `PARTIAL` | "UTI Leste - Leito 12" → **"UT••••••••12"** |
| `idade` | dado clínico | `NONE` | "67" → **"67"** |
| `data` | dado calendário | `NONE` | "2026-10-23" → **"2026-10-23"** |

A estratégia está **declarada no contrato** (`PRIVACY_PROFILE.optional_context_fields[].mask_strategy`),
não no código do componente. Trocar a decisão é mudar a tabela do contrato e regenerar — o
componente lê a estratégia, não decide sozinho.

> **Ponto em aberto para o dono:** se a leitura for "os quatro mascarados", a idade e a data
> passam a `FULL` e a ficha impressa perde o valor clínico. É uma linha na tabela do contrato.

---

## 5. O que esta emenda **não** faz

- **Não** permite coleta de dado sensível de paciente. Identificadores clínicos, texto livre
  clínico e qualquer campo com capacidade de reidentificação seguem vedados.
- **Não** reabilita `CPF`, `prontuário`, `e-mail`, `telefone`, `endereço`, `geolocalização` ou
  `identificador de dispositivo` no formulário público.
- **Não** reabre o gate de MD. O CKO-MD permanece sob remediação do gate de autoridade
  normativa em nível de família/campo, e **qualquer camada a jusante herda esse bloqueio**
  (nota de controle da v1.1.0, mantida).
- **Não** altera §1, §2, §3, §4, §6, §7, §15 ou §16.

---

## 6. Rastreabilidade

- Decisão do dono: 22/10/2026, nesta sessão.
- Emenda registrada **antes** da implementação, conforme §16 da v1.1.0
  ("Progredir pela sequência de camadas sem declarar 100% antes de evidence bundles,
  runtime/E2E e release gate").
- Alterações de código correspondentes e sua evidência de runtime: ver
  `registers/governance/find-register.v1.json` e o laudo de auditoria da branch.
