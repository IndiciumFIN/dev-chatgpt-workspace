export type InstPage = { path: string; title: string; kicker: string; lead: string; kind: "hub" | "page"; specific: string[]; sections: { title: string; text: string }[]; children?: string[] };

export const institutionalPages: InstPage[] = [
  {
    "path": "acessibilidade/declaracao-de-acessibilidade",
    "title": "Declaração de Acessibilidade",
    "kicker": "Central de Acessibilidade Digital",
    "lead": "Nosso compromisso com a acessibilidade digital: o padrão que seguimos, os recursos disponíveis, como navegar pelo teclado e como reportar barreiras.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Nosso compromisso",
        "text": "Queremos que todas as pessoas consigam usar as calculadoras e conteúdos, inclusive com tecnologias assistivas. Adotamos como referência as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2, nível AA , com atenção a contraste, navegação por teclado, foco visível, nomes acessíveis, estrutura semântica e compatibi"
      },
      {
        "title": "2. Recursos disponíveis",
        "text": "Ajuste de tamanho de fonte, inversão de contraste e espaçamento de texto."
      },
      {
        "title": "3. Navegação pelo teclado",
        "text": ""
      },
      {
        "title": "4. Leitores de tela",
        "text": "Buscamos compatibilidade com os leitores de tela mais usados:"
      },
      {
        "title": "5. Limitações conhecidas",
        "text": "PENDENTE: listar as limitações conhecidas e o prazo previsto para cada correção."
      },
      {
        "title": "6. Encontrou uma barreira?",
        "text": "A acessibilidade é um trabalho contínuo. Se algo impedir você de usar uma calculadora ou conteúdo, escreva para ciadeenfermagem@gmail.com informando a página, o problema e, se possível, o navegador e a tecnologia assistiva usados. Analisamos e corrigimos com prioridade. Prazo de resposta: PENDENTE."
      }
    ]
  },
  {
    "path": "acessibilidade",
    "title": "Central de Acessibilidade Digital",
    "kicker": "Centrais institucionais",
    "lead": "Nível de conformidade, recursos disponíveis e como reportar barreiras.",
    "kind": "hub",
    "specific": [],
    "sections": [
      {
        "title": "Declaração de Acessibilidade",
        "text": "Nosso compromisso com a acessibilidade digital: o padrão que seguimos, os recursos disponíveis, como navegar pelo teclado e como reportar barreiras."
      }
    ],
    "children": [
      "acessibilidade/declaracao-de-acessibilidade"
    ]
  },
  {
    "path": "assinante/cancelamento-e-reembolso",
    "title": "Cancelamento e reembolso",
    "kicker": "Central do Assinante",
    "lead": "Como cancelar a assinatura Premium, quando você tem direito a reembolso e em quanto tempo o valor volta.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Direito de arrependimento: 7 dias",
        "text": "Ao assinar o Premium pela primeira vez, você pode desistir em até 7 (sete) dias a contar da contratação, sem precisar justificar. O reembolso observará esta política e a legislação aplicável. Eventuais taxas de processamento serão tratadas conforme as condições vigentes do meio de pagamento e a legislação aplicável."
      },
      {
        "title": "2. Reembolso em renovações",
        "text": ""
      },
      {
        "title": "3. Como pedir cancelamento ou reembolso",
        "text": "Informe o e-mail da conta e se o pedido é de cancelamento, reembolso ou ambos."
      },
      {
        "title": "4. Cancelamento da assinatura",
        "text": ""
      },
      {
        "title": "5. Prazos de devolução",
        "text": ""
      },
      {
        "title": "6. Mudanças nesta política",
        "text": "Mudanças nesta política serão comunicadas aos assinantes por e-mail com antecedência de PENDENTE dias. Ao assinar, você declara ter lido esta política e os Termos de Uso ."
      }
    ]
  },
  {
    "path": "assinante/condicoes-da-assinatura",
    "title": "Condições da assinatura Premium",
    "kicker": "Central do Assinante",
    "lead": "Como funciona a cobrança, a renovação, os reajustes e a liberação do acesso Premium.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Meios de pagamento",
        "text": "Formas aceitas (cartão, Pix, boleto): PENDENTE."
      },
      {
        "title": "2. Liberação do acesso",
        "text": "O acesso Premium é liberado após a confirmação do pagamento pelo processador. Prazo típico por forma de pagamento: PENDENTE."
      },
      {
        "title": "3. Renovação e reajuste",
        "text": ""
      },
      {
        "title": "4. Uso pessoal",
        "text": "A assinatura é pessoal e intransferível. O compartilhamento de conta pode levar à suspensão do acesso, conforme os Termos de Uso ."
      },
      {
        "title": "5. Recibos e nota fiscal",
        "text": "PENDENTE: o que é emitido em cada cobrança e como solicitar."
      },
      {
        "title": "6. Cancelamento e reembolso",
        "text": ""
      }
    ]
  },
  {
    "path": "assinante/conta-e-exclusao-de-dados",
    "title": "Sua conta e a exclusão de dados",
    "kicker": "Central do Assinante",
    "lead": "O que fica guardado na sua conta, como pedir a exclusão e o que precisamos manter por obrigação legal.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. O que fica na sua conta",
        "text": ""
      },
      {
        "title": "2. Como pedir a exclusão",
        "text": "Escreva para ciadeenfermagem@gmail.com a partir do e-mail da conta."
      },
      {
        "title": "3. O que mantemos por obrigação legal",
        "text": "Registros de pagamento e de cumprimento de pedidos podem ser mantidos pelo prazo exigido em lei, mesmo após a exclusão da conta. Prazos: PENDENTE."
      },
      {
        "title": "4. Dados no seu navegador",
        "text": "Favoritos, tamanho de fonte e tema ficam no seu aparelho. Para apagá-los, limpe os dados do site nas configurações do navegador."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "assinante",
    "title": "Central do Assinante",
    "kicker": "Centrais institucionais",
    "lead": "Planos, regras de uso, cobrança, cancelamento e reembolso.",
    "kind": "hub",
    "specific": [],
    "sections": [
      {
        "title": "Planos",
        "text": "O que você usa de graça, o que o Premium acrescenta e quanto custa."
      },
      {
        "title": "Termos de Uso",
        "text": "As regras para usar o site, suas ferramentas e conteúdos, nas modalidades gratuita e Premium."
      },
      {
        "title": "Condições da assinatura Premium",
        "text": "Como funciona a cobrança, a renovação, os reajustes e a liberação do acesso Premium."
      },
      {
        "title": "Cancelamento e reembolso",
        "text": "Como cancelar a assinatura Premium, quando você tem direito a reembolso e em quanto tempo o valor volta."
      },
      {
        "title": "Sua conta e a exclusão de dados",
        "text": "O que fica guardado na sua conta, como pedir a exclusão e o que precisamos manter por obrigação legal."
      },
      {
        "title": "Perguntas frequentes",
        "text": "Respostas rápidas sobre uso gratuito, assinatura Premium, cancelamento, privacidade e uso clínico das ferramentas."
      }
    ],
    "children": [
      "assinante/cancelamento-e-reembolso",
      "assinante/condicoes-da-assinatura",
      "assinante/conta-e-exclusao-de-dados",
      "assinante/perguntas-frequentes",
      "assinante/planos",
      "assinante/termos-de-uso"
    ]
  },
  {
    "path": "assinante/perguntas-frequentes",
    "title": "Perguntas frequentes",
    "kicker": "Central do Assinante",
    "lead": "Respostas rápidas sobre uso gratuito, assinatura Premium, cancelamento, privacidade e uso clínico das ferramentas.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Uso da plataforma",
        "text": ""
      },
      {
        "title": "2. Assinatura Premium",
        "text": ""
      },
      {
        "title": "3. Cancelamento e reembolso",
        "text": ""
      },
      {
        "title": "4. Privacidade",
        "text": ""
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "assinante/planos",
    "title": "Planos",
    "kicker": "Central do Assinante",
    "lead": "O que você usa de graça, o que o Premium acrescenta e quanto custa.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Gratuito e Premium",
        "text": ""
      },
      {
        "title": "2. Recurso por recurso",
        "text": ""
      },
      {
        "title": "3. Preço e condições",
        "text": ""
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "assinante/termos-de-uso",
    "title": "Termos de Uso",
    "kicker": "Central do Assinante",
    "lead": "As regras para usar o site, suas ferramentas e conteúdos, nas modalidades gratuita e Premium.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Definições",
        "text": ""
      },
      {
        "title": "2. O que estes termos regulam",
        "text": "Estes Termos regulam o uso do site e de suas ferramentas, conteúdos e serviços, sempre com caráter informativo, educativo e consultivo, em duas modalidades:"
      },
      {
        "title": "3. Público e uso adequado",
        "text": "A plataforma é voltada a profissionais e estudantes da área da saúde. As ferramentas não são indicadas para autodiagnóstico pelo público leigo. Os limites de uso clínico estão no Aviso clínico , que faz parte destes Termos."
      },
      {
        "title": "4. Compromissos do usuário",
        "text": ""
      },
      {
        "title": "5. Limites de uso",
        "text": "Os resultados são apoio educativo e conferência comparativa ao raciocínio clínico e não substituem a decisão profissional presencial e fundamentada. Não respondemos por decisões tomadas sem a validação profissional prevista no Aviso clínico , sem prejuízo dos direitos garantidos pela legislação de defesa do consumidor."
      },
      {
        "title": "6. Propriedade intelectual",
        "text": "Código-fonte, identidade visual, textos, logotipos, scripts e bases lógicas das calculadoras desenvolvidos pela equipe pertencem à Cia de Enfermagem e são protegidos pela Lei de Direitos Autorais (Lei nº 9.610/98) e pela legislação de propriedade industrial."
      }
    ]
  },
  {
    "path": "editorial/auditoria-governanca-regulatoria",
    "title": "Auditoria de Governança Regulatória",
    "kicker": "Central Editorial",
    "lead": "Método interno e periódico para verificar se conteúdos regulatórios, éticos, legais e clínicos têm fontes verificáveis, evidência adequada, classificação de risco e transparência editorial.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. O que é a Auditoria de Governança Regulatória",
        "text": "É o método interno adotado pelo Calculadoras de Enfermagem para verificar, de forma sistemática, se conteúdos regulatórios, éticos, legais e clínicos apresentam fontes verificáveis, evidências adequadas, classificação de risco e transparência editorial ."
      },
      {
        "title": "2. Periodicidade: duas auditorias ordinárias por ano",
        "text": "O método integra o ciclo permanente de governança editorial, com duas auditorias ordinárias por ano , para detectar alterações de vigência, mudanças regulatórias, referências desatualizadas, problemas de atribuição e divergências entre o conteúdo e suas fontes."
      },
      {
        "title": "3. Classificação de risco: HIGH, MEDIUM e LOW",
        "text": "Conteúdo normativo, regulatório, clínico ou legal cuja exatidão pode afetar interpretação profissional, conduta, direitos, deveres ou conformidade."
      },
      {
        "title": "4. Justiça nas fontes",
        "text": "“Justiça nas fontes” significa tratar cada referência de forma proporcional ao que ela realmente demonstra. Uma fonte não deve sustentar uma conclusão mais ampla do que seu próprio conteúdo permite."
      },
      {
        "title": "5. Respeito aos autores e às fontes",
        "text": "A atribuição correta é parte da qualidade da informação. Autores, instituições, órgãos reguladores e documentos oficiais são identificados de maneira compatível com a fonte utilizada."
      },
      {
        "title": "6. Uma governança voltada à prática de enfermagem",
        "text": "A plataforma é dedicada a profissionais de enfermagem : escalas, calculadoras, conteúdos clínicos e materiais de apoio à prática assistencial. Por isso, qualidade da informação não é só questão de redação ou de apresentação visual."
      }
    ]
  },
  {
    "path": "editorial/aviso-clinico",
    "title": "Aviso clínico e limites de uso",
    "kicker": "Central Editorial",
    "lead": "As calculadoras e escalas são apoio educativo e comparativo ao raciocínio clínico. Não substituem a avaliação, o julgamento nem a responsabilidade técnica do profissional.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Natureza das ferramentas",
        "text": "Os resultados das calculadoras e escalas se baseiam em fórmulas consagradas, literatura validada e protocolos amplamente aceitos. Mesmo assim, devem ser interpretados como apoio educativo ou conferência comparativa ao raciocínio clínico, nunca como decisão."
      },
      {
        "title": "2. Para quem as ferramentas são destinadas",
        "text": "As ferramentas são voltadas a profissionais e estudantes da área da saúde . Não são indicadas para autodiagnóstico pelo público leigo: o uso adequado exige conhecimento técnico, anatômico e farmacológico prévio para interpretar e aplicar os resultados."
      },
      {
        "title": "3. O que cabe a quem usa",
        "text": "Em caso de dúvida sobre a formulação ou o resultado de um cálculo, procure seu professor de enfermagem ou o enfermeiro responsável, habilitados para orientar o procedimento correto."
      },
      {
        "title": "4. O que fazemos do nosso lado",
        "text": "Cada ferramenta passa pelo fluxo descrito em Uso responsável de inteligência artificial e pela Auditoria de Governança Regulatória . Erros relatados são analisados e corrigidos."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "editorial/correcoes-e-erratas",
    "title": "Correções e erratas",
    "kicker": "Central Editorial",
    "lead": "Como reportar um erro, como tratamos cada relato conforme o risco e onde as correções ficam registradas.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Como reportar",
        "text": "Escreva para ciadeenfermagem@gmail.com ou use o formulário informando:"
      },
      {
        "title": "2. Como tratamos cada relato",
        "text": "O relato é registrado e classificado por risco."
      },
      {
        "title": "3. Registro de erratas",
        "text": "Correções de risco HIGH e MEDIUM ficam listadas aqui, além do histórico de cada página."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "editorial/fontes-e-evidencias",
    "title": "Fontes e evidências",
    "kicker": "Central Editorial",
    "lead": "Que fontes aceitamos, em que ordem de prioridade, como verificamos vigência e como citamos.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Ordem de prioridade",
        "text": ""
      },
      {
        "title": "2. O que não usamos como fonte",
        "text": ""
      },
      {
        "title": "3. Como verificamos cada fonte",
        "text": "O documento existe e corresponde exatamente ao citado."
      },
      {
        "title": "4. Quando as fontes divergem",
        "text": ""
      },
      {
        "title": "5. Como citamos",
        "text": "Toda página com conteúdo técnico tem a seção \"Referências e fontes\", com autor ou órgão, título, número e data do documento e link para a fonte oficial quando houver."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "editorial",
    "title": "Central Editorial",
    "kicker": "Centrais institucionais",
    "lead": "Como o conteúdo é produzido, verificado, auditado e corrigido — e os limites do seu uso clínico.",
    "kind": "hub",
    "specific": [],
    "sections": [
      {
        "title": "Uso responsável de inteligência artificial",
        "text": "Como produzimos, validamos e auditamos cada conteúdo: fontes oficiais como base, tripla checagem por IA, governança reforçada para conteúdo de alto risco e revisão final de enfermeiro habilitado."
      },
      {
        "title": "Auditoria de Governança Regulatória",
        "text": "Método interno e periódico para verificar se conteúdos regulatórios, éticos, legais e clínicos têm fontes verificáveis, evidência adequada, classificação de risco e transparência editorial."
      },
      {
        "title": "Aviso clínico e limites de uso",
        "text": "As calculadoras e escalas são apoio educativo e comparativo ao raciocínio clínico. Não substituem a avaliação, o julgamento nem a responsabilidade técnica do profissional."
      },
      {
        "title": "Política editorial",
        "text": "Os princípios que orientam o que publicamos, como escolhemos fontes, quem revisa, como atualizamos e como mantemos a independência do conteúdo."
      },
      {
        "title": "Fontes e evidências",
        "text": "Que fontes aceitamos, em que ordem de prioridade, como verificamos vigência e como citamos."
      },
      {
        "title": "Correções e erratas",
        "text": "Como reportar um erro, como tratamos cada relato conforme o risco e onde as correções ficam registradas."
      }
    ],
    "children": [
      "editorial/auditoria-governanca-regulatoria",
      "editorial/aviso-clinico",
      "editorial/correcoes-e-erratas",
      "editorial/fontes-e-evidencias",
      "editorial/politica-editorial",
      "editorial/uso-responsavel-de-ia"
    ]
  },
  {
    "path": "editorial/politica-editorial",
    "title": "Política editorial",
    "kicker": "Central Editorial",
    "lead": "Os princípios que orientam o que publicamos, como escolhemos fontes, quem revisa, como atualizamos e como mantemos a independência do conteúdo.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Princípios",
        "text": "Publicamos o que fontes oficiais, científicas e normativas sustentam, na medida do que elas demonstram."
      },
      {
        "title": "2. O que publicamos",
        "text": "Calculadoras, escalas, guias, simulados, artigos e conteúdos regulatórios voltados a profissionais e estudantes de enfermagem, sempre com caráter educativo e de apoio. Os limites de uso estão no Aviso clínico ."
      },
      {
        "title": "3. Fontes",
        "text": "Os critérios de aceitação e a hierarquia de fontes estão em Fontes e evidências . Nenhuma fonte recebe tratamento privilegiado só por ser citada."
      },
      {
        "title": "4. Classificação por risco",
        "text": ""
      },
      {
        "title": "5. Atualização",
        "text": "O conteúdo passa por duas auditorias ordinárias por ano e por auditoria extraordinária quando muda uma norma, uma diretriz ou quando uma fonte é contestada. Cada página mostra data de atualização, versão e histórico."
      },
      {
        "title": "6. Independência editorial",
        "text": "Anúncios e assinaturas financiam a plataforma, mas não definem o conteúdo clínico. Anunciantes não escolhem, revisam nem aprovam o que publicamos."
      }
    ]
  },
  {
    "path": "editorial/uso-responsavel-de-ia",
    "title": "Uso responsável de inteligência artificial",
    "kicker": "Central Editorial",
    "lead": "Como produzimos, validamos e auditamos cada conteúdo: fontes oficiais como base, tripla checagem por IA, governança reforçada para conteúdo de alto risco e revisão final de enfermeiro habilitado.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Nosso método de trabalho",
        "text": "Todo conteúdo publicado (calculadoras, escalas, guias, simulados, artigos e formulários) passa por um fluxo editorial estruturado . A inteligência artificial apoia a organização, a comparação e a identificação de inconsistências, mas não é a fonte do conteúdo : as fontes oficiais, científicas e normativas continuam sen"
      },
      {
        "title": "2. Governança de conteúdo de alto risco",
        "text": "Nem todo conteúdo tem o mesmo peso. Mantemos uma biblioteca de governança de conteúdo de alto risco , que classifica páginas, ferramentas e documentos pelo potencial de impacto clínico, regulatório e educacional."
      },
      {
        "title": "3. Tripla checagem por IA",
        "text": "São três camadas independentes , executadas em momentos e com propósitos distintos. Um erro precisa passar por três verificações diferentes para chegar à publicação."
      },
      {
        "title": "4. A revisão do enfermeiro",
        "text": "A automação termina antes da decisão final. Antes da publicação, páginas, documentos, artigos, calculadoras e escalas passam por revisão editorial de profissional de enfermagem habilitado e em atividade , registrada no fluxo interno."
      },
      {
        "title": "5. O que esses controles significam e o que não significam",
        "text": ""
      },
      {
        "title": "Referências e fontes",
        "text": ""
      }
    ]
  },
  {
    "path": "",
    "title": "Centrais institucionais",
    "kicker": "Institucional",
    "lead": "O que a plataforma busca oferecer, como produzimos e revisamos conteúdo, como tratamos dados e quais regras orientam o uso e a assinatura.",
    "kind": "hub",
    "specific": [],
    "sections": [
      {
        "title": "Central Institucional",
        "text": "Propósito, objetivos, missão, equipe, métricas públicas e canais de contato."
      },
      {
        "title": "Central Editorial",
        "text": "Como o conteúdo é produzido, verificado, auditado e corrigido — e os limites do seu uso clínico."
      },
      {
        "title": "Central de Privacidade",
        "text": "Que dados tratamos, por quê, com quem compartilhamos e como exercer seus direitos (LGPD)."
      },
      {
        "title": "Central de Acessibilidade Digital",
        "text": "Nível de conformidade, recursos disponíveis e como reportar barreiras."
      },
      {
        "title": "Central de Sustentabilidade Digital",
        "text": "Práticas de eficiência digital, como medimos e o que já alcançamos."
      },
      {
        "title": "Central do Assinante",
        "text": "Planos, regras de uso, cobrança, cancelamento e reembolso."
      }
    ],
    "children": [
      "acessibilidade",
      "assinante",
      "editorial",
      "privacidade",
      "sobre",
      "sustentabilidade"
    ]
  },
  {
    "path": "privacidade/cookies-e-consentimento",
    "title": "Cookies e consentimento",
    "kicker": "Central de Privacidade",
    "lead": "Que cookies e armazenamentos locais o site usa, para quê, por quanto tempo e como você controla cada categoria.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Em resumo",
        "text": "Mantêm o site funcionando e seguro. Não dependem de consentimento."
      },
      {
        "title": "2. O que usamos, categoria por categoria",
        "text": ""
      },
      {
        "title": "3. Como você controla",
        "text": ""
      },
      {
        "title": "4. E os dados das calculadoras?",
        "text": "Os valores digitados nas calculadoras são processados no seu navegador e não ficam salvos em cookies nem são enviados aos nossos servidores."
      },
      {
        "title": "Referências e fontes",
        "text": ""
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "privacidade",
    "title": "Central de Privacidade",
    "kicker": "Centrais institucionais",
    "lead": "Que dados tratamos, por quê, com quem compartilhamos e como exercer seus direitos (LGPD).",
    "kind": "hub",
    "specific": [],
    "sections": [
      {
        "title": "Política de Privacidade",
        "text": "Que dados pessoais tratamos, para quê, com base em qual hipótese legal, com quem compartilhamos e como você exerce seus direitos, conforme a LGPD."
      },
      {
        "title": "Cookies e consentimento",
        "text": "Que cookies e armazenamentos locais o site usa, para quê, por quanto tempo e como você controla cada categoria."
      }
    ],
    "children": [
      "privacidade/cookies-e-consentimento",
      "privacidade/politica-de-privacidade"
    ]
  },
  {
    "path": "privacidade/politica-de-privacidade",
    "title": "Política de Privacidade",
    "kicker": "Central de Privacidade",
    "lead": "Que dados pessoais tratamos, para quê, com base em qual hipótese legal, com quem compartilhamos e como você exerce seus direitos, conforme a LGPD.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Em resumo",
        "text": "Não exigimos cadastro para usar as calculadoras. Os dados clínicos digitados são processados no seu navegador e não são enviados aos nossos servidores."
      },
      {
        "title": "2. Quem é responsável pelos seus dados",
        "text": "Esta política se aplica ao site Calculadoras de Enfermagem. Para assuntos de privacidade e exercício de direitos, utilize o canal oficial abaixo."
      },
      {
        "title": "3. Conceitos usados nesta política",
        "text": ""
      },
      {
        "title": "4. Que dados tratamos, para quê e com que base legal",
        "text": ""
      },
      {
        "title": "5. Publicidade e Google AdSense",
        "text": "Exibimos anúncios para financiar a manutenção do site, inclusive para assinantes Premium. Por isso, o Google e outros parceiros podem ler e gravar cookies ou usar web beacons no seu navegador para veicular anúncios com base em visitas anteriores e para medir resultados."
      },
      {
        "title": "6. Compartilhamento e transferência internacional",
        "text": "Compartilhamos dados apenas com os fornecedores de tecnologia necessários para operar o site, listados na tabela acima."
      }
    ]
  },
  {
    "path": "sobre/equipe-e-autores",
    "title": "Equipe e autores",
    "kicker": "Central Institucional",
    "lead": "Quem desenvolve a plataforma, quem revisa o conteúdo de enfermagem e quem responde por ele.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Quem responde pelo conteúdo",
        "text": "Responsável técnico de enfermagem · formação: PENDENTE · COREN-UF PENDENTE"
      },
      {
        "title": "2. Como os papéis se dividem",
        "text": "Os detalhes do fluxo estão em Uso responsável de inteligência artificial e na Auditoria de Governança Regulatória ."
      },
      {
        "title": "3. Conflitos de interesse",
        "text": "PENDENTE: declarar vínculos que possam influenciar o conteúdo, ou que não há vínculos."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "sobre/fale-conosco",
    "title": "Fale conosco",
    "kicker": "Central Institucional",
    "lead": "Canais oficiais para dúvidas, sugestões, relatos de erro, pedidos sobre seus dados pessoais e suporte à assinatura.",
    "kind": "page",
    "specific": [
      "formulario"
    ],
    "sections": [
      {
        "title": "1. Canais oficiais",
        "text": "Prazo de resposta: até 48 horas úteis."
      },
      {
        "title": "2. Como agilizar seu atendimento",
        "text": "Informe a página (link), os valores usados e o resultado esperado."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      },
      {
        "title": "Envie sua mensagem",
        "text": "Ao enviar, seu aplicativo de e-mail será aberto com a mensagem preenchida."
      }
    ]
  },
  {
    "path": "sobre",
    "title": "Central Institucional",
    "kicker": "Centrais institucionais",
    "lead": "Propósito, objetivos, missão, equipe, métricas públicas e canais de contato.",
    "kind": "hub",
    "specific": [],
    "sections": [
      {
        "title": "Objetivos do site",
        "text": "O que a plataforma busca oferecer a profissionais e estudantes de enfermagem, com foco em apoio ao estudo, à prática, à gestão e ao uso responsável das ferramentas."
      },
      {
        "title": "Missão, Visão e Valores",
        "text": "Por que a plataforma existe, aonde queremos chegar e os princípios que orientam cada calculadora, escala e conteúdo publicado."
      },
      {
        "title": "Equipe e autores",
        "text": "Quem desenvolve a plataforma, quem revisa o conteúdo de enfermagem e quem responde por ele."
      },
      {
        "title": "Métricas públicas",
        "text": "Painel aberto de audiência com dados diretos do Google Analytics 4."
      },
      {
        "title": "Fale conosco",
        "text": "Canais oficiais para dúvidas, sugestões, relatos de erro, pedidos sobre seus dados pessoais e suporte à assinatura."
      }
    ],
    "children": [
      "sobre/equipe-e-autores",
      "sobre/fale-conosco",
      "sobre/missao-visao-valores",
      "sobre/objetivos-do-site"
    ]
  },
  {
    "path": "sobre/missao-visao-valores",
    "title": "Missão, Visão e Valores",
    "kicker": "Central Institucional",
    "lead": "Por que a plataforma existe, aonde queremos chegar e os princípios que orientam cada calculadora, escala e conteúdo publicado.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Quem somos",
        "text": "Nascemos da necessidade de oferecer aos profissionais de enfermagem uma base tecnológica confiável, rápida e de fácil acesso. O portal reúne escalas, scores de avaliação e cálculos de gotejamento e dosagem, reduzindo o tempo administrativo e o risco de erro na assistência."
      },
      {
        "title": "2. Missão e visão",
        "text": "Disponibilizar calculadoras e ferramentas de apoio clínico precisas e acessíveis, para otimizar o tempo e promover a segurança nas decisões e condutas da enfermagem."
      },
      {
        "title": "3. Valores",
        "text": "Foco absoluto na segurança do paciente."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "sobre/objetivos-do-site",
    "title": "Objetivos do site",
    "kicker": "Central Institucional",
    "lead": "O que a plataforma busca oferecer a profissionais e estudantes de enfermagem, com foco em apoio ao estudo, à prática, à gestão e ao uso responsável das ferramentas.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. O que oferecemos",
        "text": "Oferecemos a profissionais e estudantes de enfermagem ferramentas práticas para o cálculo de medicamentos e doses , a partir de prescrições, simulações ou questões de cursos: o usuário informa os dados solicitados e a calculadora aplica as fórmulas necessárias."
      },
      {
        "title": "2. Escalas a serviço da equipe multiprofissional",
        "text": "Na maioria das vezes, essas escalas são aplicadas pela equipe de enfermagem e orientam condutas de toda a equipe multiprofissional: técnicos de enfermagem, enfermeiros, médicos e fisioterapeutas. Em algumas, a atuação do enfermeiro é mais ativa; em outras, o instrumento serve de base de monitoramento para a decisão méd"
      },
      {
        "title": "3. Gestão e educação",
        "text": "Recursos para apoiar lideranças e instituições: dimensionamento de equipe de enfermagem, Escala de Fugulin (complexidade assistencial), classificação de pacientes de Perroca (SCP) e SBAR para passagem de plantão."
      },
      {
        "title": "4. Apoio, nunca substituição",
        "text": "Os cálculos têm caráter consultivo e didático , baseados em referências reconhecidas que devem ser consultadas para validação. Nenhum cálculo automatizado substitui a análise, o julgamento e a responsabilidade técnica do profissional de enfermagem."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "sustentabilidade/compromisso-e-praticas",
    "title": "Sustentabilidade digital — compromisso e práticas",
    "kicker": "Central de Sustentabilidade Digital",
    "lead": "Cada página carregada consome energia em servidores, redes e no seu aparelho. Estas são as práticas que adotamos para reduzir esse consumo sem perder qualidade.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Por que isso importa",
        "text": "A internet consome energia em data centers, redes e dispositivos. Páginas mais leves transferem menos dados, exigem menos processamento e gastam menos bateria do seu aparelho. Por isso tratamos desempenho como uma questão ambiental , além de experiência de uso."
      },
      {
        "title": "2. Práticas que adotamos",
        "text": "Evitamos bibliotecas pesadas e scripts desnecessários, exigindo menos do processador do seu aparelho."
      },
      {
        "title": "3. Como acompanhamos",
        "text": "Monitoramos o site com ferramentas públicas de desempenho e emissão estimada:"
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "sustentabilidade",
    "title": "Central de Sustentabilidade Digital",
    "kicker": "Centrais institucionais",
    "lead": "Práticas de eficiência digital, como medimos e o que já alcançamos.",
    "kind": "hub",
    "specific": [],
    "sections": [
      {
        "title": "Sustentabilidade digital — compromisso e práticas",
        "text": "Cada página carregada consome energia em servidores, redes e no seu aparelho. Estas são as práticas que adotamos para reduzir esse consumo sem perder qualidade."
      },
      {
        "title": "Metodologia de medição",
        "text": "O que medimos, com quais ferramentas, em quais páginas, com que frequência e quais são os limites dessas estimativas."
      },
      {
        "title": "Relatórios de sustentabilidade digital",
        "text": "Resultados medidos de eficiência digital da plataforma, publicados a cada ciclo de medição."
      }
    ],
    "children": [
      "sustentabilidade/compromisso-e-praticas",
      "sustentabilidade/metodologia-de-medicao",
      "sustentabilidade/relatorios-de-sustentabilidade"
    ]
  },
  {
    "path": "sustentabilidade/metodologia-de-medicao",
    "title": "Metodologia de medição",
    "kicker": "Central de Sustentabilidade Digital",
    "lead": "O que medimos, com quais ferramentas, em quais páginas, com que frequência e quais são os limites dessas estimativas.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. O que medimos",
        "text": ""
      },
      {
        "title": "2. Quais páginas e com que frequência",
        "text": "Amostra fixa: PENDENTE. Frequência: PENDENTE. Condições: mesma rede de teste, cache limpo, modo móvel e desktop."
      },
      {
        "title": "3. Limites das estimativas",
        "text": ""
      },
      {
        "title": "4. Como os resultados são publicados",
        "text": "Cada medição gera um relatório em Relatórios , com data, ferramenta e versão de cada número."
      },
      {
        "title": "Referências e fontes",
        "text": ""
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  },
  {
    "path": "sustentabilidade/relatorios-de-sustentabilidade",
    "title": "Relatórios de sustentabilidade digital",
    "kicker": "Central de Sustentabilidade Digital",
    "lead": "Resultados medidos de eficiência digital da plataforma, publicados a cada ciclo de medição.",
    "kind": "page",
    "specific": [],
    "sections": [
      {
        "title": "1. Relatórios publicados",
        "text": ""
      },
      {
        "title": "2. Como ler os relatórios",
        "text": "Os números são comparáveis entre relatórios porque seguem a mesma metodologia de medição . Estimativas de carbono servem para acompanhar a tendência, não como medida exata."
      },
      {
        "title": "Nota de transparência",
        "text": "Esta página descreve políticas e práticas institucionais do Calculadoras de Enfermagem. Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."
      }
    ]
  }
];

export function getInstitutional(path: string) {
  return institutionalPages.find((page) => page.path === path);
}
