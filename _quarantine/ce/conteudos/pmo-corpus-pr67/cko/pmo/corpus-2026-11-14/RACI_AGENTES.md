# RACI e células especializadas (papéis, não agentes implantados)

| Capacidade | Responsável operacional | Aprovador | Consultados | Informados |
|---|---|---|---|---|
| Inventário Git, diff, PRs | GitAudit (determinístico) | PMO | Arquitectura | Revisor clínico |
| Hash/ZIP/SQLite/CSV | DataQA (determinístico) | PMO | Security | ClinicalReview |
| Fontes e vigência | Authority/Rights (especialista) | Revisor normativo | ClinicalReview | PMO |
| Trilha de carreira (com UCs/ementas-fonte) | CareerPath / fonte curricular | Coordenação da instituição | ClinicalReview, Editorial | PMO |
| Claims/evidence | Evidence (especialista) | ClinicalReview (humano) | Rights/Authority | PMO |
| Ontologia e reuso | Ontology (especialista) | Knowledge Owner | CareerPath/Clinical | Editorial |
| Conteúdo editorial | Editorial/Education (especialista) | ClinicalReview | Accessibility | PMO |
| Segurança e privacidade | Security (determinístico) | Segurança humana | Rights | PMO |
| CI/testes | CI/DataQA (determinístico) | Revisor independente | Developer | PMO |
| Publicação | Release | Aprovação humana clínica e jurídica | QA/PMO | Usuários |

**Regras:** agents propõem, produzem e verificam; **não autoaprovam** claims, licenças, protocolos, efeitos de drogas ou renumeração curricular. Detecção e validação são ações separadas; veto de segurança e clínica independentes. Comunicação via manifestos de arquivos, exit code e resultados reexecutáveis, não mensagens vagas.
