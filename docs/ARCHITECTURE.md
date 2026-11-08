# Arquitetura e governança — WU-TRIB v0.1.0

**Escopo:** piloto web isolado para teste de experiência, sem login e usando dados sintéticos. Não há integração com o PostgreSQL `SOT-10-09-2026.wutrib` nesta fase. O banco permanece privado (RLS e sem GRANT a clientes).

- `src/audit.js`: parser local de XML NF-e por DOMParser, leitor parcial de registro C100 e motor de cruzamento determinístico.
- `src/fixtures.js`: documentos de demonstração declarados fictícios.
- `src/ui.js`: interface, interação, filtros e exportações.
- `index.html` / `styles.css`: SPA estática e responsiva.
- `tests/engine.test.mjs`: regressão técnica positiva e adversarial.
- `vercel.json`: cabeçalhos de segurança; `connect-src 'none'` impede conexões por APIs web sob a CSP do navegador.

**Fonte legal e release:** não homologadas; nenhuma conclusão de conformidade fiscal. Síntese de produto segue o planejamento WU-TRIB v1.0 anteriormente documentado, com NF-e XML + EFD ICMS/IPI como primeiro G3.

**WO:** WUTRIB-WO-PLAN-010, protótipo funcional sem persistência e sem aprovação humana. Os gates de publicação de dados reais e conclusão fiscal continuam HOLD. Esta versão não modifica nenhum repositório CE, nem projeto Vercel CE, nem tabelas do banco legado.

**Critérios de aceite para demo:** 1) demo executa; 2) importação local; 3) achados explicam divergências, não concluem imposto; 4) CSV e JSON exportados; 5) testes negativos de tamanho, DTD e dados inválidos; 6) responsivo; 7) deployment Vercel preview independente.