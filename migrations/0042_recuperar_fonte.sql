-- Recuperação do conteúdo perdido na extração (fonte confrontada com o banco).
--
-- A fonte é a verdade do texto publicado: o repositório de origem
-- (github.com/kauesp0007/calculadoras-de-enfermagem, commit fc608936deb2fee96e6deaad5f3ea6e1c7e0d6da) tem o texto íntegro das
-- páginas que o site publica. O banco foi semeado por uma extração com perda e
-- 34 das 142 seções institucionais ficaram sem corpo.
--
-- O que esta migration faz:
--   · devolve o texto LITERAL da fonte nas seções cuja correspondência está
--     declarada em mappings/recuperacao-fonte.json, com a proveniência
--     (arquivo, sha256, seção de origem e o motivo) no comentário;
--   · troca o gancho 'PENDENTE' do autor pelo marcador DERBY — o texto que
--     sobreviveu continua na frase, e a lacuna fica marcada;
--   · NÃO inventa: faixa clínica, número, artigo e prazo que não estejam na
--     fonte não entram aqui;
--   · NÃO toca nas seções sem correspondência: elas ficam com o marcador e
--     são nomeadas como achado em docs/fonte/CONFRONTO.md.
--
-- Idempotente: o texto só é escrito onde ainda está o marcador ou o gancho;
-- rodar duas vezes dá o mesmo resultado.

-- assinante/termos-de-uso · "1. Definições"
-- fonte: termos.html · sha256 3831a7edf8e51ff9148d2af9186a8c0c81bdef732829975d123b8ec1ecc1b145 · seção "1. Definições"
-- motivo: mesmo título e mesmo assunto: a definição de Site, Usuário e Ferramentas que os Termos regulam
update inst_section set body = 'Site: refere-se ao domínio www.calculadorasdeenfermagem.com.br e todos os seus subdomínios e páginas associadas espalhados globalmente. Usuário: qualquer pessoa física ou jurídica que acesse ou utilize o conteúdo do site e suas extensões. Ferramentas / Calculadoras: aplicações interativas baseadas em navegador que realizam cálculos clínicos, escoragens de escalas e avaliações com base em dados de entrada fornecidos exclusivamente pelo usuário ativo. Responsável: Plataforma Cia de Enfermagem – contato primário através de ciadeenfermagem@gmail.com.' where path = 'assinante/termos-de-uso' and position = 1 and (body = 'DERBY' or body like 'PENDENTE%');

-- assinante/termos-de-uso · "4. Compromissos do usuário"
-- fonte: termos.html · sha256 3831a7edf8e51ff9148d2af9186a8c0c81bdef732829975d123b8ec1ecc1b145 · seção "4. Direitos e Obrigações do Usuário"
-- motivo: mesmo assunto: o conjunto de compromissos que o usuário assume ao usar a plataforma
update inst_section set body = 'O usuário assume total e irrevogável compromisso perante as seguintes diretrizes ao utilizar as aplicações web: Utilizar as calculadoras e formulários de forma ética, responsável e condizente com a prática profissional preconizada pelos órgãos de classe; Validar e reavaliar de forma rigorosa os resultados obtidos antes de qualquer tomada de decisão clínica, preparação medicamentosa ou intervenção fisiológica; Notificar imediatamente o responsável administrativo sobre eventuais erros sistêmicos, falhas lógicas em cálculos ou inconsistências observadas; Não realizar engenharias reversas, reproduzir, copiar, realizar *scraping*, distribuir ou comercializar qualquer fragmento do conteúdo do site sem a prévia autorização documentada.' where path = 'assinante/termos-de-uso' and position = 4 and (body = 'DERBY' or body like 'PENDENTE%');

-- assinante/cancelamento-e-reembolso · "2. Reembolso em renovações"
-- fonte: reembolso.html · sha256 99a2ea6d2457d6c032e9ca8ba7122882f576e961c01a05447e2d500d52ea6854 · seção "3. Condições para Reembolso"
-- motivo: mesmo assunto: a condição de reembolso aplicável à renovação da assinatura
update inst_section set body = 'Reembolsos são concedidos apenas se você não tiver utilizado os recursos da plataforma após a renovação da assinatura. Não são concedidos reembolsos para assinaturas canceladas após o uso dos serviços no período cobrado. Em caso de cobrança duplicada ou erro de sistema, o reembolso será processado integralmente.' where path = 'assinante/cancelamento-e-reembolso' and position = 2 and (body = 'DERBY' or body like 'PENDENTE%');

-- assinante/cancelamento-e-reembolso · "4. Cancelamento da assinatura"
-- fonte: reembolso.html · sha256 99a2ea6d2457d6c032e9ca8ba7122882f576e961c01a05447e2d500d52ea6854 · seção "5. Cancelamento de Assinatura"
-- motivo: mesmo assunto: como cancelar a assinatura e o que o cancelamento impede
update inst_section set body = 'Você pode solicitar o cancelamento da sua assinatura a qualquer momento através do Fale Conosco ou pelo e-mail oficial ciadeenfermagem@gmail.com . O cancelamento impede cobranças futuras, mas não gera reembolso automático do período atual. Após o cancelamento, você terá acesso aos recursos até o final do período já pago.' where path = 'assinante/cancelamento-e-reembolso' and position = 4 and (body = 'DERBY' or body like 'PENDENTE%');

-- assinante/cancelamento-e-reembolso · "5. Prazos de devolução"
-- fonte: reembolso.html · sha256 99a2ea6d2457d6c032e9ca8ba7122882f576e961c01a05447e2d500d52ea6854 · seção "4. Processamento do Reembolso"
-- motivo: mesmo assunto: o prazo de processamento e a forma do crédito do valor
update inst_section set body = 'Após a aprovação, o reembolso será processado em até 5 (cinco) dias úteis . O valor será creditado no mesmo método de pagamento utilizado na compra. Você receberá um e-mail de confirmação quando o reembolso for processado.' where path = 'assinante/cancelamento-e-reembolso' and position = 5 and (body = 'DERBY' or body like 'PENDENTE%');

-- assinante/condicoes-da-assinatura · "6. Cancelamento e reembolso"
-- fonte: reembolso.html · sha256 99a2ea6d2457d6c032e9ca8ba7122882f576e961c01a05447e2d500d52ea6854 · seção "5. Cancelamento de Assinatura"
-- motivo: mesmo assunto: a política de cancelamento. O mesmo parágrafo serve às duas páginas irmãs — a política é uma só, e a procedência está declarada no comentário
update inst_section set body = 'Você pode solicitar o cancelamento da sua assinatura a qualquer momento através do Fale Conosco ou pelo e-mail oficial ciadeenfermagem@gmail.com . O cancelamento impede cobranças futuras, mas não gera reembolso automático do período atual. Após o cancelamento, você terá acesso aos recursos até o final do período já pago.' where path = 'assinante/condicoes-da-assinatura' and position = 6 and (body = 'DERBY' or body like 'PENDENTE%');

-- acessibilidade/declaracao-de-acessibilidade · "3. Navegação pelo teclado"
-- fonte: politica.html · sha256 3f88c4aa960e4d62c0bc1b2c10700665a646793bd748d72a17719363825d1863 · seção "3. Atalhos de Teclado e Navegação Sistêmica"
-- motivo: mesmo assunto: atalhos de teclado e navegação sistêmica, com o mesmo padrão WCAG citado
update inst_section set body = 'O site é desenvolvido com base nas Diretrizes WCAG 2.1, nível AA, buscando ser operável sem o uso do mouse. Para navegação rápida, disponibilizamos os seguintes comandos: Tab: Move o foco de forma sequencial entre elementos interativos (links, botões, inputs das calculadoras). Shift + Tab: Retorna o foco ao elemento anterior. Enter / Espaço: Ativa o botão, executa o cálculo ou abre o link focado. Esc (Escape): Fecha menus abertos, janelas modais ou caixas de seleção instantaneamente. Setas Direcionais: Utilizadas para navegar dentro de campos de formulários, abas ou listas suspensas.' where path = 'acessibilidade/declaracao-de-acessibilidade' and position = 3 and (body = 'DERBY' or body like 'PENDENTE%');

-- editorial/uso-responsavel-de-ia · "5. O que esses controles significam e o que não significam"
-- fonte: responsbilidade_inteligencia_artificial.html · sha256 7c67dfb19f8b7671a451c1d6b3dbe304c481ebed54ac9ab96a1220cd287bc88c · seção "O que esses controles significam — e o que não significam"
-- motivo: a fonte traz a seção com o mesmo título (com a travessão); é a mesma控制了 o que a automação não substitui
update inst_section set body = 'Os controles apoiam a conferência das fontes e do conteúdo — não substituem a fonte oficial. Hashes e evidências não constituem prova autônoma de vigência ou veracidade de fonte externa. O processo não representa certificação de conformidade com a LGPD ou normas internacionais, nem substitui orientação profissional. Nenhum conteúdo deste site dispensa a consulta à legislação vigente, às normas dos conselhos profissionais e às fontes oficiais.' where path = 'editorial/uso-responsavel-de-ia' and position = 5 and (body = 'DERBY' or body like 'PENDENTE%');

-- editorial/uso-responsavel-de-ia · "Referências e fontes"
-- fonte: responsbilidade_inteligencia_artificial.html · sha256 7c67dfb19f8b7671a451c1d6b3dbe304c481ebed54ac9ab96a1220cd287bc88c · seção "Referências Bibliográficas"
-- motivo: mesma seção de referências, na mesma página de origem
update inst_section set body = 'BRASIL. Lei nº 13.709, de 14 de agosto de 2018 . Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, 2018. Disponível em: planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm . CONSELHO FEDERAL DE ENFERMAGEM. Resolução COFEN nº 736/2024 . Regulamenta a implementação do Processo de Enfermagem. Brasília, 2024. Disponível em: cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024 . Fluxo editorial interno — Calculadoras de Enfermagem (documento de processo interno, registrado no fluxo do projeto). Esta página segue controles editoriais de governança para rastrear as fontes utilizadas. O processo verifica identificação, autoridade, URL, versão e data das referências, sinaliza divergências e, quando aplicável, preserva evidências técnicas de integridade. Esses controles apoiam a conferência, mas não substituem a fonte oficial nem constituem prova autônoma de vigência ou veracidade. Antes da publicação, páginas, documentos, artigos, calculadoras e escalas devem passar por revisão editorial de profissional de enfermagem habilitado e em atividade, registrada no fluxo interno. Recursos de IA podem auxiliar na organização, comparação e identificação de inconsistências, mas não substituem essa revisão humana, a fonte oficial, o julgamento clínico/jurídico ou a orientação profissional. O processo é projetado com princípios de minimização de dados, finalidade, transparência, rastreabilidade, acessibilidade e ética editorial. Busca apoiar boas práticas de privacidade e qualidade; não representa certificação de conformidade com a LGPD ou normas internacionais, nem substitui orientação profissional.' where path = 'editorial/uso-responsavel-de-ia' and position = 6 and (body = 'DERBY' or body like 'PENDENTE%');

-- editorial/fontes-e-evidencias · "2. O que não usamos como fonte"
-- fonte: auditoria_governanca_regulatoria.html · sha256 c62920cb99f2107554edde66f272a0b2357bad84556bd3244a2c165e0d2c5e59 · seção "O que deve ser evitado"
-- motivo: mesmo assunto: o que a governança proíbe atribuir a uma fonte
update inst_section set body = 'atribuir à fonte algo que ela não afirma; usar hash de entrega como prova de veracidade; confundir metadado com vigência normativa; ocultar incertezas relevantes; apresentar certificação ou conformidade sem prova.' where path = 'editorial/fontes-e-evidencias' and position = 2 and (body = 'DERBY' or body like 'PENDENTE%');

-- editorial/politica-editorial · "4. Classificação por risco"
-- fonte: auditoria_governanca_regulatoria.html · sha256 c62920cb99f2107554edde66f272a0b2357bad84556bd3244a2c165e0d2c5e59 · seção "HIGH · Alto" + "MEDIUM · Médio" + "LOW · Baixo"
-- motivo: a classificação por risco na fonte está nos três níveis (o h2 da classificação é um cabeçalho sem corpo); as três seções são o corpo dela
update inst_section set body = 'Conteúdo normativo, regulatório, clínico ou legal cuja exatidão pode afetar interpretação profissional, conduta, direitos, deveres ou conformidade.

MEDIUM · Médio
Conteúdo que exige referências e data de revisão, mas apresenta menor impacto regulatório direto.

LOW · Baixo
Conteúdo predominantemente editorial, sujeito aos controles usuais de qualidade, atribuição e transparência.' where path = 'editorial/politica-editorial' and position = 4 and (body = 'DERBY' or body like 'PENDENTE%');

-- privacidade/politica-de-privacidade · "3. Conceitos usados nesta política"
-- fonte: politica.html · sha256 3f88c4aa960e4d62c0bc1b2c10700665a646793bd748d72a17719363825d1863 · seção "1. Quadro Informativo"
-- motivo: mesmo assunto: o enquadramento e o alcance do documento, que é onde a política define os conceitos
update inst_section set body = 'Todas as disposições desta Política de Privacidade são extremamente importantes para a nossa relação com você. Para facilitar a sua leitura, preparamos o quadro abaixo com os principais termos que você deve se atentar.' where path = 'privacidade/politica-de-privacidade' and position = 3 and (body = 'DERBY' or body like 'PENDENTE%');

-- privacidade/politica-de-privacidade · "4. Que dados tratamos, para quê e com que base legal"
-- fonte: politica.html · sha256 3f88c4aa960e4d62c0bc1b2c10700665a646793bd748d72a17719363825d1863 · seção "4. Finalidade do tratamento dos dados" + "5.1. Matriz de Tratamento de Dados"
-- motivo: mesmo assunto: a finalidade do tratamento e a base legal de cada dado — a matriz é a base legal, e as duas seções juntas formam a resposta
update inst_section set body = 'Tratamos os seus dados pessoais com o objetivo principal de possibilitar a sua interação com o Site, bem como seu cadastro. As finalidades incluem: Possibilitar seu cadastro no Site e participação em campanhas; Enviar mensagens (push, SMS, e-mail) publicitárias ou institucionais; Identificação e prevenção de eventuais ameaças de segurança ou fraudes; Exercício regular de direitos da empresa, inclusive em processo judicial; Analytics - reconhecimento de perfis de uso para gerar dados estatísticos de melhoria do Site.

5.1. Matriz de Tratamento de Dados
Para garantir transparência, consolidamos abaixo o tratamento de dados do Site em uma matriz única, que serve de referência tanto para esta Política quanto para os Termos de Uso: Segurança: adotamos medidas técnicas e organizacionais adequadas (criptografia, controle de acesso e princípio da minimização) para proteger os dados. Consentimento: quando o tratamento se basear em consentimento, você pode revogá-lo a qualquer momento. Exclusão: você pode solicitar a eliminação ou anonimização dos seus dados pelo canal indicado nesta Política.' where path = 'privacidade/politica-de-privacidade' and position = 4 and (body = 'DERBY' or body like 'PENDENTE%');

-- privacidade/cookies-e-consentimento · "2. O que usamos, categoria por categoria"
-- fonte: politica.html · sha256 3f88c4aa960e4d62c0bc1b2c10700665a646793bd748d72a17719363825d1863 · seção "6. Publicidade e Google AdSense"
-- motivo: mesmo assunto: as categorias de publicidade e rastreamento que o site usa
update inst_section set body = 'Para financiar a manutenção deste Site e manter o acesso às ferramentas totalmente gratuito para a comunidade de enfermagem, exibimos anúncios de parceiros. Consequentemente, esta Política incorpora as exigências de nossos parceiros de publicidade, em especial o Google AdSense . Coleta e Uso de Dados pelo Google: Nosso site utiliza serviços do Google que coletam e usam dados para veiculação de anúncios e análises. Isso inclui seu endereço IP, informações do navegador e interações. Cookies de Terceiros: Terceiros, incluindo o Google, podem inserir e ler cookies nos navegadores ou usar web beacons para coletar informações, permitindo a veiculação de anúncios baseados em visitas anteriores. Personalização de Anúncios: O Google pode usar as informações coletadas para personalizar os anúncios que você vê, com base em seus interesses. Divulgação Obrigatória sobre o Uso de Dados pelo Google: Para cumprir a nossa obrigação de transparência, disponibilizamos o link oficial do Google que explica como as suas informações são utilizadas pelos parceiros de anúncios:' where path = 'privacidade/cookies-e-consentimento' and position = 2 and (body = 'DERBY' or body like 'PENDENTE%');

-- privacidade/cookies-e-consentimento · "3. Como você controla"
-- fonte: politicaapp.html · sha256 1f2d969bfe9131ce9957559e9de80d6eaa53b9113d1f6a6595f787b67f4dc500 · seção "c. Consentimento"
-- motivo: mesmo assunto: o consentimento e o controle do titular sobre cookies e rastreamento
update inst_section set body = 'Caso o aplicativo passe a utilizar cookies ou tecnologias de rastreamento para publicidade ou análise, solicitaremos seu consentimento explícito por meio de um banner ou tela informativa, em conformidade com a LGPD e as políticas do Google Play, permitindo que você aceite ou gerencie suas preferências.' where path = 'privacidade/cookies-e-consentimento' and position = 3 and (body = 'DERBY' or body like 'PENDENTE%');

-- sustentabilidade/metodologia-de-medicao · "1. O que medimos"
-- fonte: tecnologiaverde.html · sha256 4ec64215e81fbb433ed67a9cb6d58965f469874b3ffa3970bd6ef7a4c2a48374 · seção "Redução da Pegada de Carbono"
-- motivo: mesmo assunto: as métricas de pegada do próprio serviço, que é o que a página declara medir
update inst_section set body = 'A internet consome energia elétrica em massa. Tratamos as métricas de Core Web Vitals como pilares ecológicos. Sites rápidos processam menos dados nos provedores e gastam menos bateria do usuário. Através da compressão WebP e minificação de scripts, garantimos que cada acesso consuma o mínimo de eletricidade possível. Diminuição do peso em KB após a otimização.' where path = 'sustentabilidade/metodologia-de-medicao' and position = 1 and (body = 'DERBY' or body like 'PENDENTE%');

-- O gancho do autor dentro de um texto que sobreviveu: a frase continua, a
-- lacuna fica marcada. (A seção inteira em PENDENTE vira marcador acima.)
-- acessibilidade/declaracao-de-acessibilidade · "6. Encontrou uma barreira?"
update inst_section set body = replace(body, 'PENDENTE', 'DERBY') where path = 'acessibilidade/declaracao-de-acessibilidade' and position = 6 and body like '%PENDENTE%';
-- assinante/cancelamento-e-reembolso · "6. Mudanças nesta política"
update inst_section set body = replace(body, 'PENDENTE', 'DERBY') where path = 'assinante/cancelamento-e-reembolso' and position = 6 and body like '%PENDENTE%';
-- assinante/condicoes-da-assinatura · "1. Meios de pagamento"
update inst_section set body = replace(body, 'PENDENTE', 'DERBY') where path = 'assinante/condicoes-da-assinatura' and position = 1 and body like '%PENDENTE%';
-- assinante/condicoes-da-assinatura · "2. Liberação do acesso"
update inst_section set body = replace(body, 'PENDENTE', 'DERBY') where path = 'assinante/condicoes-da-assinatura' and position = 2 and body like '%PENDENTE%';
-- assinante/conta-e-exclusao-de-dados · "3. O que mantemos por obrigação legal"
update inst_section set body = replace(body, 'PENDENTE', 'DERBY') where path = 'assinante/conta-e-exclusao-de-dados' and position = 3 and body like '%PENDENTE%';
-- sobre/equipe-e-autores · "1. Quem responde pelo conteúdo"
update inst_section set body = replace(body, 'PENDENTE', 'DERBY') where path = 'sobre/equipe-e-autores' and position = 1 and body like '%PENDENTE%';
-- sustentabilidade/metodologia-de-medicao · "2. Quais páginas e com que frequência"
update inst_section set body = replace(body, 'PENDENTE', 'DERBY') where path = 'sustentabilidade/metodologia-de-medicao' and position = 2 and body like '%PENDENTE%';

-- Seção que era só o gancho do autor: fica com o marcador (achado nomeado).
update inst_section set body = 'DERBY' where path = 'acessibilidade/declaracao-de-acessibilidade' and position = 5 and body like 'PENDENTE%';
update inst_section set body = 'DERBY' where path = 'assinante/condicoes-da-assinatura' and position = 5 and body like 'PENDENTE%';
update inst_section set body = 'DERBY' where path = 'sobre/equipe-e-autores' and position = 3 and body like 'PENDENTE%';
