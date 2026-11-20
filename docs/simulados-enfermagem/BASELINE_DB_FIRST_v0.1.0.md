# Simulados para Enfermagem — DB-first (branch isolada)

Status: CANDIDATE / NOT_APPLIED / KERNEL_NOT_ADMITTED

## Autoridades e escopo
- Projeto **independente** do Calculadoras de Enfermagem, identidade visual primária #1A3E74; não misturar dados, domínios nem credenciais.
- Fontes recuperadas: pasta Google Drive Provas Enfermagem (ID `1TVBjyoBWcSikL5gihG-k9zcGptsOJhNz`); `00_GOVERNANCA_EXTRACAO_PDF`, `01_LIBRARY_PROVAS_POR_BANCA`, `99_CONTROLE_FABRICA_EXTRACAO`, ZIP histórico de janeiro e pacote plataforma v1.4.0.
- História anterior identifica Supabase `bsawvgyideporzailnys` como projeto de simulados. **Não consta na lista de projetos acessíveis nesta execução. Não provisionar em `pgsybzggewhinaniybiy` (Calculadoras-Smart).**
- Repositório de trabalho autorizado nesta conversa: `IndiciumFIN/dev-chatgpt-workspace`; branch criada diretamente de `main`, separada de `viladocuidado`.
- Esta árvore é um backup independente e não representa automaticamente o repositório original de Simulados; reconciliação entre projetos requer fonte/versão verificável.

## Cadeia de dados
Source Document → Page/Extraction → Evidence → Question Candidate → Choice/Answer Key → Human Review → Qualified Question Version → Exam Version → Exam Item Order → Simulation Projection → Result (apenas se armazenamento autorizado separadamente).

## Invariantes
- Questão nunca é criada sem documento-fonte, página, checksum e cadeia de evidência.
- Gabarito não é inferido do enunciado; proveniência do gabarito deve ser distinta e verificável.
- O corpus histórico tinha cerca de 2.205 provas, mas muitos PDFs ausentes; contagem histórica **não** significa documentos recuperados ou questões homologadas.
- Nunca publicar conteúdo candidato, usar conteúdo protegido sem verificar direitos ou carregar dados de alunos sem base, retenção e controles.
- Tipagem: prova, versão, questão, alternativa, origem, evidence e resposta separados; múltiplas versões e auditoria de transformação.
- Banco candidato em schema privado `spe_candidate`, RLS habilitado, sem GRANT para anon/authenticated, sem dados pessoais.
- Sem executar migration, alterar produção, registrar PASS de DB, aprovar WO ou abrir PR sem gates.

## Gates
G0 source/rights; G1 schema compile; G2 invariantes SQL e teste de integridade; G3 importação de provas com SHA; G4 gabarito validado; G5 policy/human approval; G6 API/render; G7 acessibilidade/segurança/privacidade. Todos NOT_RUN.
