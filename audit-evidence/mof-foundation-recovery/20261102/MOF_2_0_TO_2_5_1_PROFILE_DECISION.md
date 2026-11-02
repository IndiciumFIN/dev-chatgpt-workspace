# CE — Decisão técnica de modelagem: EMOF padrão mínimo, CMOF sob demanda
**WO:** `WO-CE-DB-SKELETON-001` • **status:** `PRE_CANONICAL / HOLD_HUMAN`. Não certifica conformidade OMG, não cria tabelas, não publica normativos licenciados, não altera `main`.

## Fontes verificadas
1. **Anexo fornecido pelo proprietário:** OMG *Meta Object Facility Core Specification*, **2.0** (jan. 2006), `formal/06-01-01`, 88 páginas, SHA-256 `8c4486b83c3d204a3a8ae93113b6f7ab7e546ecf534aea915340eaf0d8df2cdc`. Arquivo **não enviado ao Git** (ver termos de licença nas páginas 2–4).
2. **Referência principal já capturada:** OMG MOF **2.5.1**, `formal/2019-10-01`; PDF, XMI e OCL oficialmente obtidos em executor efêmero; seus hashes estão em `audit-evidence/mof-foundation-recovery/20261102/source-integrity/manifest.json`. Não reproduzir texto integral nem declarar conformidade sem verificações.
3. Eclipse EMF/Ecore: https://help.eclipse.org/latest/topic/org.eclipse.emf.doc/references/overview/EMF.html (Ecore é modelo semelhante ao EMOF, **não idêntico**).
4. OMG MOF: https://www.omg.org/spec/MOF/2.5.1.

## Correspondência com o PDF 2.0
- **§2 (p.1 / PDF p.13):** dois pontos distintos de conformidade, EMOF e CMOF.
- **§7.2 (p.8 / PDF p.20):** MOF permite **dois ou mais** metaníveis. Nosso M3→M2→M1→M0 é **convenção arquitetural**, não exigência rígida do padrão.
- **§9–11 (p.15–30 / PDF p.27–42):** reflexão, identificadores e extensões devem ser tratados como capacidades relacionadas, não simplesmente como tabelas extras.
- **§12.1/12.4 (p.31/p.35 / PDF p.43/p.47):** EMOF cobre metamodelagem mais simples e contratos específicos; **§12.1** registra que semântica abstrata detalhada de CMOF é opcional para EMOF.
- **§14/15 (p.45–64 / PDF p.57–76):** CMOF acrescenta elementos formais; só implementar quando houver requisito concreto, contrato e teste.
- **§16 (p.65):** regras de migração do MOF 1.4 para 2.0 são históricas, não instruções para migrar nossos dados Postgres automaticamente.

## Decisão candidata para o CE
- **Base técnica:** conservar Node/TypeScript, PostgreSQL/Supabase, JSON Schema e validadores determinísticos. Nenhum requisito de Java/Eclipse para o núcleo do sistema.
- **Metamodelagem:** **EMOF-inspirado como perfil mínimo de interoperabilidade** (sem alegar conformidade). CMOF apenas para recursos mais avançados cuja necessidade seja provada pelo catálogo, terminologias e contratos canônicos.
- **EMF/Ecore:** adaptador opcional de interoperabilidade; **Enterprise Architect:** editor visual opcional; **XMI/OCL:** formatos/validações condicionais; **QVT/ATL:** considerar após estabilizar entrada/saída M2 e a proveniência.
- **Governança:** MOF descreve metamodelos, não substitui `cko_governance.*`, dicionários, agentes, Kernel, WO ou regras de autorização.

## Ordem sem retrabalho
1. Recuperar metamodelos M3 anteriores e conciliar `M2/M1` com as 562 tabelas existentes, a biblioteca normativa e as **36 branches** auditadas.
2. Testar descritor versus gramática, IDs/URI, classes, propriedades, cardinalidade, composição, herança e versão.
3. Projetar e verificar geradores de esquema e validadores no Supabase local; demonstrar testes positivos e negativos.
4. Validar **eventuais** transformações XMI ou OCL em ambiente de teste isolado, sempre com origem normativa legal e hashes.
5. Submeter WO/Kernel, auditoria, homologação e só então mover para produção.

**Gates ausentes:** não se comprovou equivalência EMOF/CMOF, mapeamentos XMI, todas as funções/triggers/RLS, nem paridade integrada com produção. Manter `HOLD_HUMAN`.
