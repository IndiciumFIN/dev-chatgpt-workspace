# Parecer de compatibilidade EMOF/CMOF — CE, WO-CE-DB-SKELETON-001

**Versão:** proposta 1.0.0-candidate. **Status:** `PRE_CANONICAL / HOLD_HUMAN`. Não define um novo banco nem substitui os dicionários existentes.

## Inventário documental verificável
- Arquivo recebido: `formal-06-01-01.pdf`, original OMG **MOF 2.0**, janeiro de 2006, 88 páginas, SHA-256 `8c4486b83c3d204a3a8ae93113b6f7ab7e546ecf534aea915340eaf0d8df2cdc`.
- Referência principal vigente consultada: [OMG MOF 2.5.1](https://www.omg.org/spec/MOF/2.5.1), identificação oficial `formal/19-10-01`.
- Evidência da obtenção temporária dos bytes 2.5.1, XMI e OCL: `source-integrity/manifest.json` (hashes). Arquivos normativos completos não distribuídos no Git por direitos de reprodução.
- A gramática JSON Schema CKO M3 v0.3 e v1.0-rc3 é projeto próprio: **NÃO é** o modelo oficial MOF nem prova de conformidade EMOF/CMOF.

## Afirmações do texto recebido, avaliadas
| Afirmação | Parecer | Correção baseada em fonte |
|---|---|---|
| EMOF é opção menos extensa e facilita metamodelos simples | SUPORTADA | MOF 2.0 §12.1. |
| EMF = EMOF | REQUER AJUSTE | EMF usa Ecore (metamodelo próprio, MOF-like) e pode ler/escrever EMOF; não são sinônimos. Eclipse EMF Overview. |
| CMOF apenas para herança múltipla | INSUFICIENTE | MOF 2.0 §14 amplia elementos e semântica de associações, pacote, reflexão e modelo abstrato; avaliar casos concretos. |
| Quatro níveis rígidos obrigatórios | CONTRADITA PELO DOCUMENTO | MOF 2.0 §7.2 admite 2 ou mais metaníveis. M3/M2/M1/M0 é convenção útil do CE, não imposição física. |
| Enterprise Architect obrigatório para visualizar | NÃO | É ferramenta possível, não requisito da OMG nem do CE. |
| QVT/ATL como componente obrigatório | NÃO | Transformação entre metamodelos pode utilizar compiladores determinísticos existentes; adicionar QVT/ATL somente por evidência de necessidade e benefício. |
| 1FN como outra norma MOF | NÃO | Normalização relacional é avaliação ortogonal com dependências funcionais e semântica de dados. |

**Fontes**: PDF anexo §§2, 7.2, 9–11, 12.1–12.5, 13–15; https://www.omg.org/spec/MOF/2.5.1; https://help.eclipse.org/latest/topic/org.eclipse.emf.doc/references/overview/EMF.html; https://eclipse.dev/emf/markdown/?file=FAQ.md.

## Projeção real para a arquitetura CE
1. **M3**: registrar gramática, perfis, compatibilidade MOF e políticas de admissibilidade; não tratar `*.definition.json` como gramática M3 completa.
2. **M2**: famílias `Article`, `LibraryEntity`, `ClinicalTool`, `WorkOrder`, `NormativeReference` etc., cada uma com atributos, relações, invariantes e evidências; reutilizar tabelas `cko_governance.metadata_*` e `ce_platform.object_types/object_relations`.
3. **M1**: esquemas executáveis JSON Schema, SQL, TS, API; compilador determinístico em `scripts/ce-agents`; validações independentes.
4. **M0**: dados reais/instâncias no Supabase, com proveniência, status, autoria, direitos e aprovação; segregação planejamento, teste e produção.

**Critério de CMOF:** comprovar por testes de domínio a necessidade de pacote/associação complexos não reproduzíveis com o perfil simples; exigir transformação bidirecional e prevenção de perda semântica antes de mudar o núcleo.

## Gaps que continuam HOLD
- Diferenças cláusula a cláusula de MOF 2.0→2.5.1: **não auditadas**; referência mais recente governa novas propostas.
- Conformidade do M3 do projeto ao EMOF formal: **não validada**; faltam prova semântica/constraints OCL e round-trip XMI.
- Conteúdo clínico e licenças: precisam de fonte oficial e revisão competente.
- Os 562 schemas de aplicação estão estruturalmente espelhados em testes locais; ainda não há paridade integral de lógica, dados e permissões.
- Não criar estruturas duplicadas nem promover automaticamente para `main`.
