export type Playbook = { id: string; title: string; when: string; steps: { title: string; detail: string; owner: string }[] };
/** Roteiros guiados (texto de processo, não decisão normativa). O progresso é marcado localmente. */
export const playbooks: Playbook[] = [
  { id: 'norma-revogada', title: 'Uma norma foi revogada', when: 'Fonte publicada passa a “revogada” ou perde vigência.', steps: [
    { title: 'Registrar a nova situação da fonte', detail: 'Atualize situação e vigência em Fontes e normas, com evidência.', owner: 'Curador' },
    { title: 'Registrar o evento de mudança', detail: 'Em Impacto, crie o evento (classe “revogação”) para a nova versão.', owner: 'Curador' },
    { title: 'Triar os candidatos', detail: 'Para cada ativo, decida impacta / não impacta / escalar com justificativa e evidência.', owner: 'Revisor (≠ autor)' },
    { title: 'Bloquear novas publicações dependentes', detail: 'Candidatos críticos bloqueiam publicação; suspensão de conteúdo vigente é decisão do workflow de emergência.', owner: 'Responsável autorizado' },
    { title: 'Remediar e revalidar', detail: 'Nova versão do átomo/página, testes de referência e revisão clínica antes de publicar.', owner: 'Equipe de conteúdo' },
    { title: 'Fechar com evidência', detail: 'Exporte o pacote de evidência e registre o encerramento.', owner: 'Auditor' },
  ] },
  { id: 'nova-edicao', title: 'Nova edição de uma fonte', when: 'Emissor publica nova edição/versão de norma já cadastrada.', steps: [
    { title: 'Cadastrar a nova versão', detail: 'Crie a fonte/edição nova; não sobrescreva a anterior.', owner: 'Curador' },
    { title: 'Comparar versões', detail: 'Registre o diff por dispositivo e classifique a mudança.', owner: 'Curador' },
    { title: 'Propagar impacto', detail: 'Processe o evento de mudança e triagem dos candidatos.', owner: 'Revisor' },
    { title: 'Atualizar átomos e páginas', detail: 'Revisão de extração e nova versão das páginas afetadas.', owner: 'Equipe de conteúdo' },
  ] },
  { id: 'nova-api', title: 'Integrar uma nova API de conteúdo', when: 'Um fornecedor externo passa a alimentar o acervo.', steps: [
    { title: 'Abrir o dossiê do fornecedor', detail: 'Direitos de uso, termos, SLA, contrato de dados e classificação.', owner: 'Governança' },
    { title: 'Entrar em modo sombra', detail: 'Rodar em paralelo, sem publicar, comparando com a fonte atual.', owner: 'Equipe técnica' },
    { title: 'Manter em quarentena', detail: 'Todo dado entra como candidato; nada vai ao índice sem revisão humana.', owner: 'Curador' },
    { title: 'Aprovar a ativação', detail: 'Só com direitos conhecidos e dossiê revisado.', owner: 'Aprovador (≠ responsável)' },
  ] },
  { id: 'emergencia', title: 'Suspensão de emergência de conteúdo', when: 'Risco imediato em página ou calculadora publicada.', steps: [
    { title: 'Registrar motivo e abrangência', detail: 'O que será suspenso, por quê e por quanto tempo.', owner: 'Responsável autorizado' },
    { title: 'Segunda aprovação', detail: 'Uma segunda pessoa confirma a suspensão.', owner: 'Aprovador' },
    { title: 'Exibir aviso padronizado', detail: 'Aviso de segurança no lugar do conteúdo, conforme política.', owner: 'Publicação' },
    { title: 'Plano de retorno', detail: 'Critérios de reabertura e rollback documentados.', owner: 'Revisor técnico' },
  ] },
];
