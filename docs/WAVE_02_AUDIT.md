# Auditoria incremental — WU-TRIB web v0.2.0 — 2026-11-08

## Contexto e objetivo

O piloto v0.1.0 tinha 16 testes Node PASS e build Vercel READY, mas a rota externa não pôde ser inspecionada do ambiente do ChatGPT. O usuário solicitou continuidade e verificadores especializados determinísticos. Esta onda fecha as lacunas mais importantes para o uso demonstrativo: falsos achados diante de entradas incompletas, navegação e barreiras de regressão.

## Correções de escopo

- `assessInputReadiness` impede executar cruzamento com XML parcial, EFD sem registro 0000, C100 inválido ou fonte ausente.
- `incompleteAuditReport` sinaliza `INCOMPLETE`, sem achados e sem correspondências; CSV e JSON desativados enquanto a análise estiver incompleta.
- Troca de arquivo inválida nunca preserva silenciosamente o conjunto fictício anterior no mesmo campo.
- Entradas inválidas (`NaN`, chave inadequada, tolerância negativa) não podem produzir correspondências.
- Identificadores dos achados usam a chave completa para evitar colisão de sufixos de 8 dígitos.
- Duplicidade no C100 sem XML não passa despercebida.
- Seletores de arquivo usam botões reais, botões de achado são acessíveis por teclado; menu móvel informa `aria-expanded` e fecha com Escape.
- Removidos os estilos inline incompatíveis com o CSP estrito; fontes pequenas receberam revisão inicial de legibilidade.
- Quatro scripts de verificação determinística, testes de regressão adicionais e workflow GitHub Actions restrito à branch do WU-TRIB.

## Gate externo independente

O ambiente de execução bloqueia DNS/HTTP externo e navegação HTTP de Chromium. O Vercel pode informar `READY`, mas essa evidência **não prova HTTP 200 nem que um usuário externo consegue testar o conteúdo**. Gate: `HOLD_EXTERNAL_HTTP` até confirmação por navegador externo ou método com acesso autorizado. Não classificar conformidade fiscal.
