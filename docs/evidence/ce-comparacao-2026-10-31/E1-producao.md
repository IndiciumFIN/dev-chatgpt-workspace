# E1 — Superfície de produção (www.calculadorasdeenfermagem.com.br)

## Estado da recolha (honesto)
- `web_fetch` direto do site **FALHOU por timeout** (15 s) em 3 tentativas (raiz, sem-www, sitemap.xml → "file load failed").
- A evidência abaixo vem de **extracção indexada pelo motor de busca** (mesmos URLs do site, conteúdo real das páginas) e de **nomes de branches do repositório público**. Portanto: o TEXTO das páginas é evidência real; a **medição em browser (a11y, layout, performance, funil real) é NOT_RUN**.
- Repo público do produto: `kauesp0007/calculadoras-de-enfermagem` (público, 30 branches). App privado da organização: `IndiciumFIN/calculadorasdeenfermagem` (private).

## O que a produção oferece hoje (extraído das páginas reais)
**Home** — "Conhecimento baseado em evidências, escalas, protocolos, calculadoras clínicas e recursos digitais".
- Biblioteca Digital: "+400 Conteúdos" (protocolos, artigos, PDFs, materiais clínicos).
- Escalas por Especialidade.
- Formulários de Escalas Assistenciais: "+60 escalas assistenciais em branco para imprimir".

**Calculadoras (16+ listadas na home)**: Balanço Hídrico · Dimensionamento de Enfermagem (Internação) · Dimensionamento (Todos os Setores) · Calculadora de Exames Laboratoriais · Gasometria Arterial · Cálculo de Gotejamento · Idade Gestacional e DPP · Cálculo de IMC · Cálculo de Insulina · Cálculo de Medicamentos · Vacinas da Criança · Doenças de Notificação Compulsória · Diagnósticos NANDA (2018) · NIC (intervenções, códigos) · Formulário SAEP · SBAR · Calculadora de Férias · Adicional Noturno · Horas Extras · Rescisão Contratual.

**Hub de calculadoras por categoria clínica** (12 categorias): Medicamentos · Gotejamento · Hemodinâmica · Ventilação Mecânica · Pediatria · Neonatologia · Obstetrícia · Nefrologia · Nutrição · Queimaduras · UTI · Emergência. (Exemplos citados: SOFA, APACHE II, PaO2/FiO2, driving pressure, Parkland, Wallace, NIHSS, Glasgow, FAST, Cincinnati, CURB-65.)

**Simulados (12+)** — 1º Simulado Técnicos (50q) · 1º Simulado Enfermeiros (50q) · 2º Simulado Enfermeiros (50q+) · Segurança do Paciente (50q, MS/IBSP/ANVISA/ISMP) · Doenças de Notificação Compulsória (30q, Portaria GM/MS 6.734/2025) · Vacinas (30q, MS+SBIM) · PCR (30q, Bancas/AHA/SBC) · Quiz interativo · Biblioteca de Provas · Simulados de Concurso por banca (IBAM Bebedouro 2024, Guarulhos 2024, Japaratuba/SE 2014) · NEWS (National Early Warning Score) · MEOWS.

**Outros**: "Escala Mensal de Plantão e Folga" (gestores, 4 escalas em tempo real, pré-estatística automatizada) · Métricas públicas do site (audiência, páginas, países) · Política de privacidade que promete **uso sem cadastro/login e sem dados pessoais** · CTA "Assine já" (Premium) · Login Google-only.

**Normativos visíveis na produção**: Parecer Normativo COFEN 01/2024 · Lei 7.498/86 · Lei 8.080/90 (SUS) · Lei 5.905/73 (Cofen/Core ns) · Resolução Cofen 736/2024 (processo de enfermagem) · Portaria GM/MS 6.734/2025 · NANDA-I (2018) · NIC · PNAB · SINAN · Código de Ética dos Profissionais de Enfermagem · AHA/SBC (PCR) · IBSP · ISMP · ANVISA.

## O que os nomes de branches revelam sobre a superfície real (30 branches)
`chatgpt/login-google-email-only-20261004` (login só Google) · `chatgpt/assinatura-layout-20261004` (checkout) · `chore/sync-asaas-checkout-v106` (pagamento via Asaas) · `audit/billing-ads-final-20260914` + 5 branches de billing/ads/concurrency · `codex/admin-developer-premium` (admin/developer) · `chatgpt/simulados-etapa-01-fundacao`, `-02-piloto`, `-02-piloto-execucao`, `plano-acao-melhoria-simulados` · `chatgpt/index-calculadoras-figma-20261004` (alinhamento Figma) · `chatgpt/index-extensoes-chrome-20261004` (extensões de navegador) · `chatgpt/guia-avancado-gotejamento-20261026` · `chatgpt/sync-menu-auth-layout-locales-20261004` · `audit/cwv-mobile-a11y-2026-09` (a11y mobile) · 6 branches `backup/*` (acessibilidade, menu-global-antes-icone, menus-19-antes-*, page-comments, pre-clinical-audit) · `base44/setup-*` (2) · `backup/acessibilidade-antes-revisao-20261026` (baseline antes da revisão).

## Perguntas que esta frente tem de responder
1. Que capacidades do esqueleto (201) **já existem em produção** e o esqueleto não modela?
2. Que promessas da produção (login Google, Premium, checkout Asaas, métricas, "sem cadastro") o esqueleto **contradiz** (guest-first sem backend) ou **ainda não cobre** (Account/Sync, Billing, Entitlement)?
3. Que surfaces existem que o blueprint **não menciona** (ads/billing, extensões Chrome, escalas em branco para imprimir, métricas públicas, gestão de escalas de plantão)?
