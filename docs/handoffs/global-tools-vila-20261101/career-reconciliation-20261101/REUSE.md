# Regras anti-duplicidade — carreira

- Preferir `ce_platform.career_roles`, `career_paths`, `career_path_steps`, `skills`, `role_skills`, `opportunities`, `applications`, `credentials`, `selection_processes`, `courses`, `course_offerings`, `notifications`, `alert_rules`, `calendar_events` e raízes canônicas já existentes **depois de reconciliação campo a campo**.
- As 43 tabelas `career_*_candidate` são o esquema PGLite candidato de uma branch, não um conjunto de tabelas a implantar cegamente no Supabase.
- `CV`, carta, portfólio, PDI e capacidades de carreira são projeções de objetos/dados compartilhados; não criar cadastros de pessoa, skill, fontes, concurso, curso ou oportunidades concorrentes.
- Os simulados e provas devem usar a mesma origem canônica de concursos; os quatro cálculos de CLT permanecem no domínio jurídico-trabalhista, referenciados pela jornada de carreira.
- Jovens: exploração de interesses é **não psicométrica**; Big Five, Roda da Vida e demais instrumentos só com seus próprios critérios e limites.
- Mentoria de IA e mentoria humana são produtos diferentes, ambos sem autorização de release no catálogo candidato.
- Não declarar currículos/portfólios seguros para dados reais sem revisar persistência em localStorage, LGPD, base legal, cópias, autenticação e exclusão.
- Nenhuma DDL/DML, merge, main, alteração de Kernel ou promoção se segue deste registro.
