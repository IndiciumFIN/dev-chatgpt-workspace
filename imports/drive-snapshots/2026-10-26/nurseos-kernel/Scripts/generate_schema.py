import json
import os

data = {
  "resourceType": "Microorganism",
  "id": "CKO-MIC-000001",
  "version": "1.0.0",
  "identity": {
    "name": "Staphylococcus aureus",
    "genericName": "Staphylococcus aureus",
    "brandNames": [],
    "synonyms": [
      "S. aureus",
      "Estafilococo dourado",
      "Staph aureus",
      "Estafilococo áureo"
    ],
    "slug": "staphylococcus-aureus",
    "description": "Staphylococcus aureus é uma bactéria esférica (coco) Gram-positiva, anaeróbia facultativa, catalase-positiva e coagulase-positiva, pertencente à família Staphylococcaceae. É um dos patógenos humanos mais prevalentes e clinicamente significativos, capaz de atuar tanto como comensal colonizador de forma assintomática (nas narinas anteriores e na pele) em cerca de 20% a 30% da população saudável, quanto como agente etiológico agressivo causador de uma ampla variedade de infecções humanas de alta gravidade. O espectro clínico de infecções por S. aureus vai desde infecções superficiais de pele e tecidos moles (como foliculite, furúnculos, impetigo, celulite e abscessos) até quadros invasivos sistêmicos agudos e potencialmente fatais, incluindo bacteremia primária, endocardite infecciosa, osteomielite, artrite séptica, pneumonia necrotizante e sepse grave. Adicionalmente, possui capacidade de produzir graves síndromes clínicas mediadas pela liberação sistêmica de toxinas superantigênicas específicas (como a Síndrome do Choque Tóxico, Síndrome da Pele Escaldada Estafilocócica e intoxicação alimentar bacteriana). A patogenicidade e virulência do microrganismo são altamente sofisticadas, caracterizando-se por um vasto arsenal de adesinas de superfície que mediam fixação a tecidos, mecanismos de evasão imunológica e secreção de citotoxinas citolíticas que provocam lise de células do hospedeiro. Sua relevância clínica e epidemiológica na medicina contemporânea é substancialmente amplificada pela disseminação global de linhagens multirresistentes a antibióticos, particularmente o Staphylococcus aureus resistente à meticilina (MRSA), associadas a altos índices de morbimortalidade e longos períodos de internação hospitalar."
  },
  "classification": {
    "domain": "Bacteria",
    "phylum": "Bacillota",
    "class": "Bacilli",
    "order": "Bacillales",
    "family": "Staphylococcaceae",
    "genus": "Staphylococcus",
    "species": "Staphylococcus aureus",
    "clinicalRiskCategory": "Grupo de Risco 2 (Moderado Risco Individual, Baixo Risco Comunitário)",
    "pathogenType": "Patógeno Bacteriano Humano Oportunista e Invasivo",
    "resistanceClassification": "Bactéria Multirresistente de Alta Preocupação Epidemiológica (MDRO)",
    "anvisaRiskGroup": "Classe de Risco II - Moderado Risco Individual, Baixo Risco para a Comunidade",
    "meshTreeNumbers": [
      "B03.440.400.425.800.700",
      "B03.440.400.425.800.700.750"
    ]
  },
  "official": {
    "ncbi": {
      "taxonomyId": 1280,
      "url": "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=1280",
      "rank": "species"
    },
    "who": {
      "priorityStatus": "Alta Prioridade (High Priority - Global priority list of antibiotic-resistant bacteria)",
      "listClassification": "Bactéria Resistente a Antibióticos de Importância Crítica para Pesquisa e Desenvolvimento de Novos Antimicrobianos",
      "guidelinesUrl": "https://www.who.int/publications/i/item/9789241512107",
      "program": "Global Antimicrobial Resistance and Use Surveillance System (GLASS)"
    },
    "cdc": {
      "threatLevel": "Séria Ameaça (Serious Threat - Antibiotic Resistance Threats in the United States)",
      "program": "Healthcare-Associated Infections (HAI) Prevention and Control Program",
      "resourcesUrl": "https://www.cdc.gov/hai/organisms/staph.html",
      "surveillanceSystem": "Emerging Infections Program (EIP) Active Bacterial Core surveillance (ABCs)"
    },
    "bacDive": {
      "strainId": "14497",
      "url": "https://bacdive.dsmz.de/strain/14497",
      "typeStrain": "ATCC 25923 / DSM 20231 / NCTC 8532",
      "cultureCollections": "ATCC 25923, DSM 20231, LMG 8224, NCTC 8532"
    }
  },
  "taxonomy": {
    "domain": "Bacteria",
    "phylum": "Bacillota (anteriormente Firmicutes)",
    "class": "Bacilli",
    "order": "Bacillales",
    "family": "Staphylococcaceae",
    "genus": "Staphylococcus",
    "species": "Staphylococcus aureus",
    "completeRank": "Bacteria; Bacillota; Bacilli; Bacillales; Staphylococcaceae; Staphylococcus; Staphylococcus aureus"
  },
  "microbiology": {
    "gramType": "Gram-positiva",
    "morphology": "Cocos organizados em arranjos tridimensionais semelhantes a cachos de uvas (estafilococos), decorrente da divisão celular em múltiplos eixos ortogonais aleatórios. Apresentam formato esférico ou ligeiramente oval com diâmetro variando entre 0,5 e 1,5 micrômetros, sem a presença de flagelos (não móvel). Apresenta parede celular espessa composta por uma densa camada de peptideoglicanos, ácidos teicoicos e lipoteicoicos associados a proteínas funcionais ancoradas.",
    "motility": "Não móvel (bactéria séssil, desprovida de flagelos, pili de motilidade ou outras estruturas locomotoras ativas)",
    "oxygenRequirement": "Anaeróbio facultativo (possui a capacidade metabólica de crescer eficientemente tanto na presença de oxigênio molecular livre por respiração celular aeróbica quanto em condições de anóxia através de processos de respiração anaeróbica utilizando aceptores alternativos ou fermentação de carboidratos)",
    "temperatureRange": "Mesófilo (temperatura ótima de crescimento compreendida entre 35°C e 37°C, apresentando uma ampla faixa de tolerância térmica operacional que varia de 7°C no limite mínimo a 48°C no limite máximo)",
    "growthConditions": "Altamente resistente a estresses físico-químicos e ambientais diversos; tolera dessecação extrema por longos períodos em fômites inanimados, calor moderado (resiste a temperaturas de 60°C por até 30 minutos) e altas concentrações salinas (cresce bem em concentrações de cloreto de sódio [NaCl] de até 10% a 15%). Apresenta capacidade de desenvolvimento em uma faixa de pH que vai de 4,0 a 10,0 (com ótimo de 7,0 a 7,5).",
    "cultureMedia": "Cresce rapidamente em meios de cultura basais não seletivos, tais como Ágar Nutriente, Ágar Infusão de Cérebro e Coração (BHI) e Ágar Soja Tríptica (TSA). Para isolamento e triagem de amostras clínicas polimicrobianas, utilizam-se meios seletivos e diferenciais fundamentais: 1) Ágar Salgado Manitol (seletivo devido à alta concentração de NaCl a 7,5% que inibe o crescimento de bactérias concorrentes, e diferencial pela fermentação do carboidrato manitol que altera o pH e muda a cor do indicador vermelho de fenol para amarelo ao redor das colônias de S. aureus); 2) Ágar Sangue de Carneiro a 5% (demonstra beta-hemólise clássica, evidenciada por halos transparentes e completos de lise eritrocitária ao redor das colônias devido à secreção de hemolisinas bacterianas).",
    "incubation": "Incubação padrão sob condições de aerobiose ou microaerofilia a uma temperatura controlada de 35°C a 37°C por um período mínimo de 18 a 24 horas. Em cenários clínicos específicos envolvendo espécimes biológicos complexos ou culturas de vigilância de crescimento lento, a incubação pode ser estendida para até 48 horas ou sob atmosfera enriquecida com 5% de CO2.",
    "colonyDescription": "Colônias macroscópicas circulares, lisas, convexas, brilhantes, opacas, com bordas regulares e inteiras, apresentando uma consistência butiroza característica. Após 24 horas de incubação, as colônias apresentam tipicamente um diâmetro de 1 a 3 mm e desenvolvem uma pigmentação amarelo-alaranjada característica (cor dourada clássica, de onde se origina o nome específico 'aureus') resultante da biossíntese do pigmento carotenoide staphyloxanthina. Este pigmento atua como um potente antioxidante bacteriano, protegendo a bactéria contra as espécies reativas de oxigênio liberadas pelas células de defesa do hospedeiro.",
    "biochemicalTests": {
      "catalase": "Positivo (produz a enzima catalase que catalisa prontamente a clivagem do peróxido de hidrogênio [H2O2] em água e oxigênio gasoso molecular livre, gerando efervescência vigorosa imediata - teste fundamental para diferenciar Staphylococcus de Streptococcus)",
      "coagulase": "Positivo (produz e secreta a coagulase livre que se liga à protrombina hospedeira formando complexos de estafiloquinase que convertem fibrinogênio em fibrina, e expressa a coagulase ligada [clumping factor] que se liga diretamente ao fibrinogênio de membrana, causando coagulação visível imediata de plasma de coelho - teste padrão ouro que diferencia S. aureus dos estafilococos coagulase-negativos [CoNS])",
      "oxidase": "Negativo (ausência de citocromo c oxidase funcional na cadeia respiratória mitocondrial, diferenciando-o de bacilos Gram-negativos e microrganismos oxidase-positivos)",
      "mannitolFermentation": "Positivo (fermenta manitol de forma aeróbica ou anaeróbica com produção ácida, resultando na viragem de cor em placas de ágar salgado manitol)",
      "dnase": "Positivo (produz e secreta uma nuclease extracelular termoestável que hidrolisa ligações fosfodiéster do DNA livre do hospedeiro ou de armadilhas extracelulares de neutrófilos [NETs], demonstrando halos de clareamento em Ágar DNase)",
      "novobiocinSusceptibility": "Sensível (demonstra halos de inibição de crescimento superiores a 16 mm de diâmetro ao redor de discos de novobiocina de 5 mcg, diferenciando-o e ao S. epidermidis do patógeno urinário resistente S. saprophyticus)"
    }
  },
  "epidemiology": {
    "prevalence": "A prevalência de colonização por S. aureus na população saudável humana mundial oscila estavelmente entre 20% e 30% em portadores crônicos persistentes, localizados principalmente nas narinas anteriores. Cerca de 50% a 60% dos indivíduos são portadores intermitentes que albergam temporariamente a bactéria. Em profissionais de saúde que atuam em áreas críticas (como UTIs, oncologia e queimados) e em pacientes cronicamente hospitalizados ou submetidos a hemodiálise, a prevalência de colonização por S. aureus multirresistente (MRSA) pode atingir taxas alarmantes entre 10% e 15%.",
    "geographicDistribution": "Distribuição cosmopolita universal, sem predileções geográficas, sazonais, climáticas ou étnicas. A bactéria é endêmica e prevalente em todas as regiões povoadas do planeta, embora os perfis genéticos coloniais e a epidemiologia molecular das cepas resistentes (clones hospitalares e comunitários) apresentem variações regionais e nacionais dinâmicas.",
    "reservoirs": "O reservatório primário definitivo do S. aureus são as superfícies anatômicas de seres humanos saudáveis ou doentes, com destaque para a mucosa das narinas anteriores, pele íntegra (particularmente em áreas úmidas como axilas, períneo, virilhas e espaços interdigitais), faringe e trato gastrointestinal. Animais domésticos e de produção (bovinos produtores de leite com mastite estafilocócica, suínos e aves de corte) atuam como importantes reservatórios secundários, possibilitando a transmissão zoonótica de clones específicos (como o ST398). Fômites inanimados secos e superfícies hospitalares de alto toque atuam como reservatórios ambientais de alta persistência devido à excepcional resiliência do patógeno ao estresse osmótico e à dessecação.",
    "highRiskPopulations": "A população de alto risco para o desenvolvimento de infecções invasivas graves por S. aureus inclui: 1) Pacientes internados em Unidades de Terapia Intensiva (UTI) de longa permanência; 2) Pacientes cirúrgicos submetidos a procedimentos limpos invasivos de grande porte com colocação de implantes ou próteses (cirurgias cardíacas, artroplastias ortopédicas de quadril e joelho, neurocirurgias de derivação); 3) Pacientes portadores de dispositivos intravasculares invasivos (Cateter Venoso Central [CVC], Cateter de Hemodiálise, Marcapasso, Derivação Ventrículo-Peritoneal); 4) Pacientes renais crônicos sob programa de hemodiálise regular; 5) Indivíduos portadores de imunodeficiências congênitas ou adquiridas (pacientes com HIV/AIDS com contagem de CD4 baixa, transplantados de órgãos sólidos sob imunossupressão, pacientes oncológicos sob quimioterapia mielossupressora); 6) Pacientes com queimaduras térmicas ou químicas graves e extensas; 7) Pacientes diabéticos insulinodependentes com descontrole glicêmico; 8) Usuários de drogas injetáveis (altíssimo risco para endocardite aguda de valva tricúspide); 9) Idosos institucionalizados em ILPIs; 10) Recém-nascidos prematuros de baixo peso em UTIs neonatais; 11) Indivíduos em ambientes aglomerados de confinamento (quartéis, penitenciárias, abrigos, times de esportes de contato - alto risco para surtos de CA-MRSA).",
    "incidenceRates": "A incidência estimada de bacteremia por S. aureus na população geral de países ocidentais desenvolvidos varia entre 20 e 50 casos por 100.000 habitantes ao ano, sendo que o patógeno figura consistentemente entre as duas principais causas de infecção primária de corrente sanguínea associada a cateter (IPCS) e infecção de sítio cirúrgico (ISC) em todo o mundo. Em ambiente de UTI, a bactéria é responsável por cerca de 15% a 25% de todos os casos notificados de pneumonia associada à ventilação mecânica (PAV) e por mais de 30% das infecções de pele e tecidos moles graves. As taxas de mortalidade associadas a bacteremias por S. aureus permanecem inaceitavelmente elevadas, variando entre 15% e 30% nas formas não complicadas, e ultrapassando 40% a 50% em cenários clínicos de choque séptico, endocardite infecciosa ativa ou infecções não drenadas por cepas MRSA multirresistentes."
  },
  "transmission": {
    "routes": [
      {
        "route": "Contato Direto",
        "description": "Via de transmissão mais comum e epidemiologicamente significativa. Ocorre pela transferência direta de microrganismos de pessoa para pessoa através do toque. Mais frequentemente mediada pelas mãos contaminadas de profissionais de saúde, familiares ou cuidadores que tiveram contato físico direto com pacientes infectados, colonizados ou com lesões cutâneas exsudativas ativas, sem a devida higienização das mãos entre os atendimentos.",
        "prevention": "Adoção e cumprimento irrestrito das práticas universais de higienização das mãos (uso de preparação alcoólica a 70% ou água e sabonete antisséptico) conforme as diretrizes dos '5 Momentos da OMS', uso rotineiro de luvas e avental descartável de manga longa no atendimento direto a pacientes sob Precaução de Contato por MRSA, e manutenção de curativos oclusivos limpos cobrindo todas as feridas ou lesões purulentas de pele dos profissionais e pacientes."
      },
      {
        "route": "Contato Indireto via Fômites",
        "description": "Transferência indireta de patógenos por meio do contato com superfícies clínicas ou objetos inanimados contaminados (fômites) localizados no ambiente assistencial próximo ao paciente (como grades de proteção de leitos, mesas de cabeceira, botões de chamada, bombas de infusão, estetoscópios, esfigmomanômetros, termômetros, maçanetas, roupas de cama e toalhas). O S. aureus apresenta excepcional sobrevivência ao estresse osmótico e dessecação, permanecendo viável e infectante nessas superfícies secas por períodos que variam de semanas a meses se não desinfetadas adequadamente.",
        "prevention": "Rotina sistemática e rigorosa de limpeza e desinfecção terminal e concorrente das superfícies clínicas de alto toque do quarto do paciente com desinfetantes hospitalares preconizados (álcool 70%, hipoclorito de sódio, quaternário de amônio ou peróxido de hidrogênio acelerado), e restrição absoluta de compartilhamento de equipamentos médicos ou itens de uso pessoal entre pacientes sem prévia desinfecção química."
      },
      {
        "route": "Autoinoculação (Transmissão Endógena)",
        "description": "Inoculação mecânica direta de bactérias S. aureus das narinas anteriores ou pele (onde o paciente é portador saudável) para locais anatomicamente vulneráveis do próprio corpo (como quebras de barreiras cutâneas por escoriações, lesões de acne, incisões cirúrgicas em cicatrização ou locais de inserção percutânea de dispositivos invasivos como cateteres de soro). Esse processo é promovido pelas próprias mãos do paciente através do ato de coçar ou tocar no nariz e, em seguida, na ferida.",
        "prevention": "Orientação e educação contínua do paciente à beira do leito quanto à proibição de tocar nas narinas e subsequentemente nos curativos ou locais de cateter, aplicação de banho pré-operatório com gluconato de clorexidina a 2% ou panos impregnados com clorexidina a 2% e execução de protocolos institucionais de descolonização nasal pré-operatória ativa com pomada de mupirocina a 2% para cirurgias eletivas de alto risco."
      },
      {
        "route": "Transmissão por Gotículas Respiratórias",
        "description": "Rota de transmissão atípica e incomum, porém altamente crítica em cenários de isolamento específico. Ocorre quando pacientes que apresentam pneumonia estafilocócica grave ativa (especialmente aquelas desencadeadas por cepas MRSA altamente virulentas portadoras do gene da leucocidina de Panton-Valentine [PVL], ou secundárias a infecções virais agudas por Influenza) expelem secreções do trato respiratório inferior contendo imensa carga bacteriana através da tosse vigorosa, espirros ou durante a realização de procedimentos médicos invasivos geradores de aerossóis (como intubação traqueal, aspiração de vias aéreas, broncoscopia ou ventilação não invasiva).",
        "prevention": "Instalação de isolamento por gotículas associado ao isolamento de contato (Precaução de Contato e Gotículas) para pacientes bacteriêmicos ou com pneumonia ativa por MRSA com tosse produtiva severa, uso de máscara cirúrgica pelo paciente durante transporte interno, uso obrigatório de máscara de proteção respiratória (N95 ou PFF2) por todos os profissionais de saúde durante procedimentos geradores de aerossóis, e utilização de óculos de proteção facial impermeáveis contra respingos de secreções biológicas."
      }
    ],
    "vectors": [],
    "incubationPeriod": "O período de incubação é altamente variável e depende diretamente do tipo específico de síndrome clínica desenvolvida e das condições imunológicas do hospedeiro. Para infecções localizadas de pele e tecidos moles (como celulite, foliculite ou furunculose de origem externa), o período geralmente varia de 1 a 10 dias após a penetração bacteriana através de uma solução de continuidade cutânea. Para infecções invasivas graves associadas a sítios cirúrgicos ou dispositivos médicos implantados, o período de incubação pode variar de dias a vários meses após a realização do procedimento cirúrgico invasivo inicial, dependendo do inóculo inicial e da formação de biofilmes. Em contraste, para a síndrome de intoxicação alimentar estafilocócica provocada pela ingestão de enterotoxinas pré-formadas no alimento contaminado, o período de incubação é hiperagudo e extremamente curto, variando de 1 a 6 horas (média de 3 horas) pós-ingestão."
  },
  "pathogenicity": {
    "primaryInfections": [
      {
        "infection": "Infecções Piogênicas Localizadas da Pele e Tecidos Moles (SSTIs)",
        "description": "Quadro caracterizado pela formação rápida de abscessos piogênicos agudos e localizados decorrentes da intensa infiltração e destruição de neutrófilos. Inclui foliculite (infecção superficial do folículo piloso), furúnculo (abscesso doloroso profundo que acomete todo o folículo e tecido celular subcutâneo adjacente), carbúnculo (confluência de múltiplos furúnculos com drenagem purulenta por vários óstios e necrose tecidual), impetigo bolhoso (infecção superficial comum em crianças caracterizada por bolhas flácidas que se rompem formando crostas melicéricas), ectima, celulite, erisipela e abscessos subcutâneos profundos espontâneos ou secundários a traumas e picadas."
      },
      {
        "infection": "Intoxicação Alimentar Estafilocócica",
        "description": "Síndrome toxigênica aguda desencadeada pela ingestão de alimentos contaminados com enterotoxinas estafilocócicas termoestáveis pré-formadas (especialmente as toxinas SEA e SEB) produzidas durante a multiplicação bacteriana descontrolada em alimentos ricos em proteínas (cremes, maionese, saladas, carnes frias) mantidos sob refrigeração inadequada. Caracteriza-se por início abrupto de salivação excessiva, náuseas intensas, vômitos em jato explosivos e incoercíveis, cólicas abdominais espasmódicas severas e diarreia aquosa profusa. Geralmente autolimitada, durando de 12 a 24 horas, e tipicamente cursa sem elevação de temperatura corporal (febre)."
      },
      {
        "infection": "Síndrome da Pele Escaldada Estafilocócica (SSSS - Doença de Ritter)",
        "description": "Dermatose esfoliativa sistêmica severa mediada pela liberação hematogênica de toxinas esfoliativas (ETA e ETB) a partir de um foco infeccioso estafilocócico localizado (ex. nasofaringe, conjuntiva, coto umbilical em recém-nascidos). As toxinas atuam como serina proteases ultraespecíficas que clivam seletivamente a proteína desmogleína-1, uma molécula de adesão celular localizada nos desmossomos do estrato granuloso da epiderme. Provoca eritema doloroso difuso agudo na pele, seguido pelo surgimento de bolhas flácidas estéreis gigantes que se rompem com facilidade sob mínima pressão mecânica (Sinal de Nikolsky positivo), levando à descamação generalizada em grandes retalhos semelhantes a queimaduras térmicas extensas de segundo grau."
      }
    ],
    "secondaryInfections": [
      {
        "infection": "Bacteremia e Sepse Estafilocócica",
        "description": "Disseminação e multiplicação ativa de Staphylococcus aureus na corrente sanguínea do hospedeiro, originada de focos locais evidentes de infecção (abscessos profundos, celulite, infecções articulares) ou por via direta através de dispositivos intravasculares (como cateteres venosos centrais e periféricos contaminados). É uma urgência médica que pode evoluir com velocidade assustadora para a síndrome de resposta inflamatória sistêmica grave (SIRS), disfunção de múltiplos órgãos, acidose lática, coagulação intravascular disseminada (CIVD), choque séptico refratário e óbito."
      },
      {
        "infection": "Endocardite Infecciosa Aguda (EI)",
        "description": "Infecção bacteriana destrutiva e hiperaguda do endotélio cardíaco, afetando principalmente as valvas cardíacas nativas ou protéticas (com maior predileção pelas valvas mitral e aórtica, mas acometendo tipicamente a valva tricúspide em usuários de drogas injetáveis). Caracteriza-se por rápida destruição tecidual das cúspides valvares com perfurações, formação de vegetações friáveis gigantes de fibrina e plaquetas, insuficiência cardíaca congestiva aguda severa e fenômenos embólicos sépticos sistêmicos recorrentes (infartos cerebrais, abscessos cerebrais, embolia pulmonar séptica, abscessos esplênicos e renais, lesões de Janeway e petéquias subconjuntivais)."
      },
      {
        "infection": "Osteomielite e Artrite Séptica",
        "description": "Infecção inflamatória destrutiva crônica ou aguda do tecido ósseo e das superfícies articulares. O S. aureus é o patógeno isolado mais prevalente nessas condições em todas as faixas etárias. A infecção ocorre por disseminação hematogênica espontânea (osteomielite hematogênica de ossos longos em crianças e espondilodiscite vertebral em adultos) ou por inoculação direta por trauma, contiguidade ou cirurgias ortopédicas (colocação de hastes, placas ou próteses articulares de quadril/joelho). Causa dor articular intensa, febre, limitação funcional severa e isquemia óssea necrótica com sequestro ósseo de difícil cicatrização."
      },
      {
        "infection": "Pneumonia Necrotizante e Empiema Pleural",
        "description": "Infecção destrutiva grave do parênquima pulmonar caracterizada por necrose de liquefação tecidual acelerada e formação de múltiplas cavitações e abscessos pulmonares (pneumatoceles). Pode surgir secundariamente por via hematogênica a partir de êmbolos sépticos ou por via respiratória após infecções virais severas por Influenza. Surtos graves na comunidade são frequentemente associados a cepas de CA-MRSA portadoras do gene da toxina citolítica PVL (Leucocidina de Panton-Valentine). Cursa clinicamente com tosse produtiva severa, dor torácica pleurítica, hemoptise (escarro com sangue), dispneia grave, choque precoce e desenvolvimento frequente de empiema pleural purulento agudo."
      }
    ],
    "hostResponse": "A defesa imunológica do hospedeiro contra infecções por S. aureus fundamenta-se essencialmente na imunidade inata celular mediada pela ativação e migração maciça de leucócitos polimorfonucleares (neutrófilos) e pelo sistema complemento. A cascata inflamatória é ativada pelo reconhecimento de padrões moleculares associados a patógenos (PAMPs), como peptideoglicanos e ácidos teicoicos, pelos receptores de reconhecimento de padrões (PRRs) das células apresentadoras de antígenos do hospedeiro, desencadeando a síntese e liberação local e sistêmica de citocinas pró-inflamatórias potentes (IL-1, IL-6, TNF-alfa) e fatores quimiotáticos (IL-8, anafilatoxinas C3a e C5a). Os neutrófilos migram por diapedese para o sítio infeccioso para realizar a fagocitose das células bacterianas opsonizadas por fragmentos de anticorpos IgG e C3b do complemento. No entanto, o S. aureus apresenta um sofisticado maquinário molecular para sabotar ativamente essa resposta: secreta superóxido dismutase e staphyloxanthina para neutralizar radicais livres de oxigênio; expressa a Proteína A para inverter o sentido de anticorpos impedindo a fagocitose; secreta leucocidinas (como a PVL) que perfuram e destroem os neutrófilos, liberando enzimas proteolíticas lisossomais intracelulares que danificam o tecido do hospedeiro e formam o exsudato purulento (pus).",
    "virulenceMarkers": [
      "Proteína A (Spa - fator de evasão de opsonofagocitose)",
      "Clumping Factor A e B (ClfA / ClfB - adesinas de ligação ao fibrinogênio)",
      "Toxina da Síndrome do Choque Tóxico 1 (TSST-1 - superantígeno potente)",
      "Leucocidina de Panton-Valentine (PVL - toxina citolítica formadora de poros em neutrófilos)",
      "Toxinas Esfoliativas A e B (ETA / ETB - proteases descamativas cutâneas)",
      "Alfa-hemolisina (Hla - toxina formadora de poros em eritrócitos e células epiteliais)",
      "Enterotoxinas A a U (Superantígenos indutores de emese e choque)",
      "Adesinas de Matriz Extracelular (MSCRAMMs - FnbpA, FnbpB, Cna)",
      "Estafiloquinase (Sak - enzima ativadora de plasminogênio)"
    ],
    "diseaseSpectrum": "O espectro de manifestações clínicas estafilocócicas é extraordinariamente amplo, abrangendo quadros benignos autolimitados e patologias hiperagudas fatais: 1) Patologias Superficiais de Pele e Tecidos Moles: Acne estafilocócica, foliculite simples, sicose da barba, paroníquia, hordéolo (terçol), impetigo vulgar e bolhoso, furunculose isolada ou recorrente; 2) Patologias Cutâneas Profundas e Necrosantes: Celulite infecciosa, erisipela bolhosa, carbúnculo estafilocócico, abscessos de mama, abscessos subcutâneos gigantes, fascite necrotizante secundária; 3) Patologias Sistêmicas Invasivas: Bacteremia primária, endocardite infecciosa de valvas nativas e protéticas, meningite bacteriana secundária a trauma/neurocirurgia, abscesso cerebral séptico, pneumonia lobar e cavitária necrotizante, empiema pleural, abscesso renal e perinefrítico, piomiosite estafilocócica profunda, osteomielite hematogênica crônica e aguda, artrite séptica purulenta, infecções de próteses articulares e vasculares; 4) Síndromes Mediadas por Toxinas: Síndrome do Choque Tóxico Estafilocócico (TSS), Síndrome da Pele Escaldada Estafilocócica (SSSS), gastroenterite aguda por intoxicação alimentar.",
    "affectedSystems": [
      "Sistema Tegumentar (Pele, fâneros e tecido celular subcutâneo)",
      "Sistema Cardiovascular (Endocárdio, valvas cardíacas, veias e artérias sistêmicas)",
      "Sistema Respiratório (Parênquima pulmonar, brônquios e cavidade pleural)",
      "Sistema Osteoarticular (Ossos longos, vértebras, articulações sinoviais e próteses)",
      "Sistema Nervoso Central (Meninges e parênquima cerebral)",
      "Sistema Digestório (Trato gastrointestinal - síndrome emética por toxinas)",
      "Sistema Urinário (Rins, abscesso perinefrítico e infecções urinárias associadas a cateter)"
    ]
  },
  "virulence": {
    "factors": [
      {
        "name": "Proteína A (Spa)",
        "type": "Proteína de superfície ancorada na parede celular",
        "function": "Apresenta a capacidade de se ligar com altíssima afinidade à porção constante Fc de anticorpos imunoglobulina G (IgG) de cabeça para baixo, deixando as regiões Fab de ligação ao antígeno expostas para o exterior de forma inútil.",
        "clinicalEffect": "Inibe a opsonização clássica e a opsonofagocitose mediada por neutrófilos e macrófagos, uma vez que impede que os receptores Fc das células de defesa reconheçam o anticorpo, permitindo a evasão bacteriana e disseminação hematogênica inicial."
      },
      {
        "name": "Clumping Factor A (ClfA) e Clumping Factor B (ClfB)",
        "type": "Adesinas de superfície da família MSCRAMM",
        "function": "Ligam-se seletivamente ao fibrinogênio plasmático solúvel do hospedeiro, promovendo a agregação e aglutinação bacteriana imediata na presença de plasma.",
        "clinicalEffect": "Mediam a adesão de alta afinidade do S. aureus a trombos plaquetários e ao endotélio cardíaco lesionado, iniciando o processo patogênico da endocardite infecciosa aguda e formação de abscessos teciduais protegidos."
      },
      {
        "name": "Alfa-hemolisina (Alfa-toxina - Hla)",
        "type": "Toxina citolítica secretada formadora de poros",
        "function": "Liga-se ao receptor específico (ADAM10) em membranas celulares de eritrócitos, plaquetas, monócitos e células endoteliais, oligomerizando-se em um anel heptamérico que perfura a bicamada lipídica celular, gerando um canal hidrofílico de transmembrana de 1 a 2 nm.",
        "clinicalEffect": "Provoca o influxo maciço de íons cálcio e efluxo de potássio que resulta em edema osmótico e lise celular completa de glóbulos vermelhos (beta-hemólise) e destruição do endotélio vascular, contribuindo diretamente para a necrose tecidual em infecções profundas e pneumonia necrotizante."
      },
      {
        "name": "Leucocidina de Panton-Valentine (PVL)",
        "type": "Toxina citolítica sinérgica bicomponente (LukS-PV e LukF-PV)",
        "function": "Liga-se seletivamente ao receptor C5a de membrana celular em polimorfonucleares humanos (neutrófilos, monócitos e macrófagos), promovendo a montagem de um poro octamérico lítico transmembrana.",
        "clinicalEffect": "Provoca lise maciça de leucócitos humanos e liberação descontrolada de proteases e mediadores inflamatórios intracelulares nocivos. Sua presença está fortemente correlacionada com infecções de pele graves recorrentes na comunidade (furunculose agressiva) e pneumonia necrotizante comunitária hiperaguda de altíssima letalidade."
      },
      {
        "name": "Coagulase Livre (Coa) e Fator de Maturação von Willebrand (vWbp)",
        "type": "Enzimas secretadas ativadoras da coagulação",
        "function": "Ligam-se à protrombina humana de forma não proteolítica, ativando-a e gerando um complexo estafilotrombina funcional capaz de converter o fibrinogênio em filamentos insolúveis de fibrina sem sofrer regulação fisiológica por antitrombina.",
        "clinicalEffect": "Provocam a deposição de densas redes de fibrina ao redor das células bacterianas de S. aureus, criando um casulo protetor físico ('coágulo') que oculta a bactéria da ação de anticorpos, complemento e células fagocíticas no sítio infeccioso e facilita a formação de abscessos localizados persistentes."
      }
    ],
    "toxins": [
      {
        "name": "Toxina da Síndrome do Choque Tóxico 1 (TSST-1)",
        "description": "Superantígeno termoestável secretado com 22 kDa de peso molecular. Apresenta a capacidade de se ligar diretamente ao domínio externo das moléculas do Complexo de Histocompatibilidade de Classe II (MHC-II) em células apresentadoras de antígenos (APCs) e à região V-beta específica dos receptores de células T (TCR) de linfócitos T auxiliares. Ignora o processo de processamento de antígenos convencional restritivo, promovendo a ativação policlonal inespecífica maciça de até 20% de toda a população de células T circulantes do hospedeiro de forma simultânea. Isso resulta em uma tempestade de citocinas sistêmica hiperaguda e descontrolada, com liberação catastrófica de interferon-gama, TNF-alfa, IL-1 e IL-2, levando a febre alta refratária, eritema macular difuso esfoliativo (pele vermelha), hipotensão arterial sistêmica severa, disfunção orgânica de múltiplos sistemas e choque circulatório de alta mortalidade."
      },
      {
        "name": "Enterotoxinas Estafilocócicas (SEA, SEB, SEC, SED, SEE, SEG, SEH, SEI)",
        "description": "Família de superantígenos solúveis altamente estáveis à ação de enzimas digestivas gástricas (pepsina, tripsina) e ao calor (resistem à fervura a 100°C por até 30 minutos). Atuam no trato digestório estimulando os receptores neuronais do nervo vago e o centro emético cerebral após a ingestão, e desencadeiam forte ativação imunológica localizada no intestino com liberação de citocinas inflamatórias, resultando na sintomatologia clássica de náuseas graves e vômitos em jato característicos da intoxicação alimentar estafilocócica."
      },
      {
        "name": "Toxinas Esfoliativas A e B (ETA / ETB)",
        "description": "Proteínas serina-proteases altamente específicas que clivam seletivamente a desmogleína-1 (Dsg1), uma glicoproteína de adesão transmembrana crucial que mantém os desmossomos unidos entre as células epiteliais do estrato granuloso da epiderme humana. A quebra proteolítica da Dsg1 compromete a integridade mecânica celular, promovendo a formação de bolhas cutâneas flácidas gigantes e descolamento epitelial difuso (síndrome da pele escaldada), poupando as mucosas devido à presença exclusiva de desmogleína-3 nestas membranas."
      }
    ],
    "biofilm": True,
    "capsule": True,
    "resistanceGenes": [
      "mecA (gene cromossômico localizado no cassete móvel SCCmec que codifica a proteína de ligação à penicilina alternativa PBP2a, a qual possui afinidade de ligação extremamente baixa por penicilinas, cefalosporinas clássicas e carbapenêmicos, conferindo o fenótipo MRSA)",
      "mecC (variante divergente do gene mecA que codifica a PBP2c, conferindo o mesmo perfil de multirresistência a praticamente todos os antibióticos beta-lactâmicos comerciais)",
      "blaZ (gene localizado em plasmídeos transmissíveis que expressa a beta-lactamase estafilocócica clássica [penicilinase], responsável por hidrolisar o anel beta-lactâmico de penicilinas simples como Penicilina G, Ampicilina e Amoxicilina)",
      "vanA (gene de resistência adquirido de Enterococcus faecalis [VRE] por transferência horizontal de plasmídeos transponíveis, responsável por alterar o resíduo terminal D-alanil-D-alanina dos precursores de parede celular para D-alanil-D-lactato, impedindo a ligação física da vancomicina e conferindo o fenótipo VRSA)",
      "ermA / ermC (genes que codificam metiltransferases de RNA ribossômico 23S, alterando o sítio de ligação ribossomal e conferindo resistência clínica cruzada a Macrolídeos, Lincosamidas [como Clindamicina] e Estreptograminas do grupo B, caracterizando o fenótipo de resistência MLSb constitutivo ou induzível)",
      "cfr (gene que codifica uma metiltransferase que metila o nucleotídeo A2503 do RNAr 23S, conferindo resistência multifacetada a fenicóis, lincosamidas, oxazolidinonas [como Linezolida], pleuromutilinas e estreptograminas)",
      "aacA-aphD (gene que codifica enzimas modificadoras de aminoglicosídeos, inativando por fosforilação ou acetilação antimicrobianos como gentamicina, tobramicina e canamicina)"
    ]
  },
  "diagnosis": {
    "specimenCollection": [
      {
        "specimen": "Hemocultura (Frascos Aeróbio e Anaeróbio para Adultos e Pediátrico)",
        "method": "Realizar punção venosa periférica direta por meio de técnica asséptica estrita de três etapas. Jamais coletar amostras de sangue através de cateter venoso central preexistente ou de dispositivos intravasculares de longa permanência, a menos que haja suspeita diagnóstica direta de infecção primária de corrente sanguínea associada a cateter (IPCS) utilizando o método de tempo diferencial de positivação (DTP). Etapas da técnica de coleta periférica: 1) Localizar a veia periférica adequada; 2) Higienizar as mãos rigorosamente; 3) Paramentar-se com luvas de procedimento descartáveis e máscara cirúrgica protetora; 4) Aplicar antissepsia cutânea em três etapas no sítio anatômico de punção: primeiro limpar friccionando vigorosamente com swab de álcool a 70% para remoção de lipídios superficiais da pele; em seguida, aplicar solução de Gluconato de Clorexidina alcoólica a 2% (ou degermante alcoólico correspondente) em movimentos espirais concêntricos de dentro para fora cobrindo uma área de 10x10 cm, permitindo a secagem espontânea e completa do antisséptico ao ar por 30 a 60 segundos (NÃO repalpar a veia desinfetada com dedos sem luvas estéreis); 5) Desinfetar vigorosamente a tampa de borracha dos frascos de hemocultura com álcool 70% e aguardar secar; 6) Realizar a punção e coletar de 8 a 10 mL de sangue por frasco em adultos (1 a 3 mL para frascos pediátricos). Coletar rotineiramente de 2 a 3 pares de frascos (um par aeróbio/anaeróbio por sítio) de veias periféricas distintas.",
        "transport": "Encaminhar as amostras coletadas imediatamente ao laboratório de microbiologia clínica em temperatura ambiente. Jamais refrigerar ou congelar os frascos de hemocultura, pois baixas temperaturas inibem ou destroem o crescimento e viabilidade bacteriana inicial.",
        "storage": "Se houver atraso inevitável e excepcional no transporte para o laboratório de microbiologia, manter os frascos de hemocultura protegidos e armazenados em estufa de incubação termo-controlada a 35°C-37°C por no máximo 24 horas. Se não houver estufa, manter em temperatura ambiente protegida de variações térmicas extremas."
      },
      {
        "specimen": "Aspirado de Secreção de Ferida, Tecido Profundo ou Fluido de Abscesso",
        "method": "Sempre priorizar a aspiração direta por agulha e seringa estéril de fluidos biológicos purulentos de abscessos intactos ou biópsia cirúrgica de tecidos moles profundos em relação ao swab convencional. 1) Limpar a área cutânea suprajacente ou as margens externas da ferida aberta com solução salina estéril a 0,9% utilizando compressa de gaze estéril para remover detritos necróticos e a microbiota comensal colonizadora superficial da pele; 2) Realizar antissepsia local com clorexidina alcoólica a 2% ou álcool 70% e permitir secar; 3) Introduzir a agulha de forma asséptica no centro flutuante do abscesso ou na zona profunda do tecido viável lesionado; 4) Aspirar o fluido purulento e remover a agulha com segurança; 5) Se for biópsia tecidual, transferir o fragmento para frasco seco estéril contendo algumas gotas de soro fisiológico estéril para hidratação; 6) Se for fluido, transferir o pus para frasco estéril de transporte ou aplicar tampa vedante na própria seringa (removendo a agulha).",
        "transport": "Encaminhar o espécime biológico ao laboratório de microbiologia clínica em até 2 horas em temperatura ambiente.",
        "storage": "Caso ocorra atraso justificado no transporte, manter a amostra em temperatura ambiente (não refrigerar) por um período de tempo máximo de 12 a 24 horas em frascos estéreis estanques adequados ou em meio de transporte semisólido (Cary-Blair ou Amies)."
      },
      {
        "specimen": "Swab Nasal para Vigilância Ativa de MRSA (Triagem Epidemiológica)",
        "method": "1) Higienizar as mãos e calçar luvas de procedimento descartáveis; 2) Utilizar swab de dacron ou rayon estéril seco ou levemente umedecido em solução salina estéril a 0,9%; 3) Introduzir cuidadosamente o swab em uma das narinas anteriores (aproximadamente 1,5 cm de profundidade); 4) Girar o swab firmemente contra a parede mucosa interna da narina por 3 a 5 vezes em movimentos circulares completos, exercendo pressão suficiente para obter células epiteliais; 5) Utilizando o MESMO swab, repetir o procedimento idêntico na outra narina anterior; 6) Inserir o swab de volta no seu tubo protetor original contendo meio de transporte de cultura adequado (Amies ou Stuart).",
        "transport": "Encaminhar ao laboratório de microbiologia clínica à temperatura ambiente em até 24 horas após a coleta de vigilância.",
        "storage": "Se o processamento laboratorial imediato não for possível, o swab nasal inserido em tubo com meio de transporte deve ser mantido sob refrigeração controlada a uma temperatura de 2°C a 8°C por no máximo 48 horas."
      }
    ],
    "cultureMethods": [
      "Semeadura microbiológica direta de amostras líquidas purulentas, urinas ou tecidos homogeneizados em meios de cultura sólidos não seletivos: Ágar Sangue de Carneiro a 5% (essencial para detectar a hemólise clássica) e Ágar Chocolate enriquecido.",
      "Uso de meios seletivos e diferenciais específicos como o Ágar Salgado Manitol para semeadura de espécimes biológicos polimicrobianos ou altamente contaminados (como amostras respiratórias de escarro, swabs de feridas externas e swabs nasais de vigilância epidemiológica), permitindo isolar seletivamente Staphylococcus e identificar preliminarmente S. aureus pela viragem cromática de vermelho para amarelo devido à fermentação do manitol.",
      "Uso complementar de meios cromogênicos específicos para triagem de MRSA (como Ágar Cromogênico MRSA), que contêm antibióticos na fórmula (cefoxitina) para inibir o crescimento de MSSA e corantes cromógenos clivados especificamente por enzimas metabólicas exclusivas de cepas MRSA resistentes, produzindo colônias coloridas (azul, rosa ou verde, dependendo do fabricante) em 24h.",
      "Uso de caldos de enriquecimento altamente nutritivos (como Caldo Tioglicolato ou Caldo Soja Tríptica com NaCl) para incubação inicial de materiais biológicos contendo escasso inóculo bacteriano viável (ex. líquidos cavitários estéreis, fragmentos ósseos microscópicos de biópsias)."
    ],
    "identificationTests": [
      "Coloração de Gram: Método microscópico direto rápido que revela cocos Gram-positivos (células esféricas coradas em roxo ou azul-escuro pelo cristal violeta) organizados espacialmente em agrupamentos tridimensionais característicos que mimetizam cachos de uvas (estafilococos), medindo de 0,5 a 1,5 micrômetros.",
      "Teste da Catalase: Adição de uma gota de peróxido de hidrogênio (H2O2) a 3% sobre colônias isoladas em lâmina de vidro. A liberação imediata e vigorosa de bolhas de oxigênio gasoso molecular (efervescência) caracteriza o resultado positivo (Staphylococcus-positivo), diferenciando-o prontamente de Streptococcus (catalase-negativo).",
      "Teste da Coagulase Livre e Coagulase Ligada (Clumping Factor): 1) Teste da coagulase em lâmina: mistura de uma colônia com uma gota de plasma de coelho estéril; a formação de grumos visíveis e aglutinação bacteriana em até 10-15 segundos indica positividade para coagulase ligada; 2) Teste em tubo (padrão-ouro bioquímico clássico): inoculação bacteriana em tubo contendo plasma de coelho diluído com incubação a 35°C; a formação de um coágulo firme gelatinoso tridimensional visível que não se desfaz ao inverter o tubo após 4 a 24 horas confirma a positividade para coagulase livre, identificando espécie-especificamente o Staphylococcus aureus.",
      "Teste da DNase (Nuclease Termoestável): Semeadura em Ágar DNase contendo indicador de azul de toluidina ou verde de metila. Halos transparentes de clareamento ao redor do crescimento bacteriano após adição de ácido clorídrico (HCl) a 1N confirmam a atividade enzimática de degradação do DNA, caracterizando o teste positivo.",
      "Sistemas Automatizados de Identificação Microbiana e Suscetibilidade (VITEK 2, BD Phoenix, MicroScan WalkAway): Plataformas computadorizadas comerciais de alta performance baseadas em micropainéis plásticos contendo testes bioquímicos colorimétricos e fluorométricos desidratados. Fornecem identificação de espécie com acurácia superior a 99% em poucas horas.",
      "Espectrometria de Massas MALDI-TOF MS (Matrix-Assisted Laser Desorption/Ionization Time-of-Flight): Padrão ouro moderno de identificação rápida em laboratórios clínicos avançados. Baseia-se na ionização por laser das proteínas ribossomais da colônia bacteriana purificada. O perfil gerado de tempo de voo de íons produz um espectro espectrográfico comparado instantaneamente com um imenso banco de dados computadorizado validador, fornecendo identificação espécie-específica ultraprecisa de Staphylococcus aureus em menos de 5 a 10 minutos."
    ],
    "molecularMethods": [
      "Reação em Cadeia da Polimerase em Tempo Real (qPCR): Ensaios de biologia molecular rápidos e altamente sensíveis que detectam genes alvo específicos presentes exclusivamente no genoma de S. aureus (como o gene nuc, que codifica a termonuclease termoestável, ou o gene femA) combinados em multiplex com genes de resistência bacteriana, especificamente o gene mecA e o gene mecC, permitindo a detecção molecular simultânea da bactéria e sua imediata caracterização fenotípica entre MSSA e MRSA.",
      "Sistemas Multiplex de Painel Molecular Direto para Hemoculturas Positivas (como BioFire FilmArray Blood Culture Identification [BCID], GenMark ePlex ou Verigene): Ensaios moleculares automatizados do tipo syndromic panel realizados diretamente a partir de alíquotas de frascos de hemocultura que acabaram de positivar no sistema automatizado. Identificam Staphylococcus aureus e determinam a presença do gene mecA/C em cerca de 1 a 2 horas, permitindo o direcionamento extremamente precoce da antibioticoterapia (antimicrobial stewardship) antes do crescimento das colônias sólidas.",
      "Sequenciamento Genômico Completo (WGS - Whole Genome Sequencing) e Sequenciamento de Nova Geração (NGS): Utilizados para investigação epidemiológica fina de surtos intra-hospitalares, mapeamento de transmissão clonal fina através de Multilocus Sequence Typing (MLST) e spa-typing, e identificação abrangente de determinantes genéticos de virulência e do resistoma completo do isolado."
    ],
    "serology": [
      "A pesquisa sorológica de anticorpos sistêmicos humanos dirigidos contra antígenos de Staphylococcus aureus não é empregada para o diagnóstico de infecções bacterianas agudas de rotina devido à alta taxa de exposição, colonização ubiquitária e memória imunológica comum na população humana saudável global.",
      "A dosagem de anticorpos séricos IgG específicos contra ácidos teicoicos estafilocócicos pode encontrar aplicação diagnóstica muito restrita e complementar no suporte investigativo de infecções invasivas crônicas ocultas de difícil acesso, como osteomielite de coluna vertebral (espondilodiscite) subaguda ou endocardite infecciosa com culturas microbiológicas persistentemente negativas."
    ],
    "imaging": [
      "Ecocardiograma Transesofágico (ETE): Recomendado e indicado universalmente por diretrizes clínicas internacionais para TODOS os pacientes adultos com hemoculturas periféricas positivas para Staphylococcus aureus (bacteremia por S. aureus - SAB). O ETE apresenta sensibilidade diagnóstica superior a 90% a 95% (muito superior ao ecocardiograma transtorácico convencional [ETT], que possui sensibilidade de apenas ~50-60%) e é o exame de eleição para avaliar detalhadamente a integridade do endocárdio, detectar minúsculas vegetações valvares, abscessos miocárdicos no anel valvar, perfurações de cúspides ou deiscências de próteses cardíacas valvares pré-existentes, confirmando ou excluindo de forma definitiva a endocardite infecciosa ativa.",
      "Ressonância Magnética (RM) de Coluna Vertebral ou de Articulações Sinoviais: Exame radiológico de eleição de altíssima sensibilidade e resolução de tecidos moles indicado para o diagnóstico preciso de espondilodiscite vertebral (osteomielite da coluna), artrite séptica purulenta ou abscessos epidurais espinhais concomitantes em pacientes bacteriêmicos que apresentam dor óssea ou articular focal localizada de surgimento recente.",
      "Tomografia Computadorizada (TC) Multislice de Tórax, Abdome e Pelve: Exame indicado para o rastreio, detecção e localização anatômica precisa de metástases infecciosas sépticas profundas (abscessos hematogênicos em pulmões, rins, fígado, baço e músculo psoas) em pacientes bacteriêmicos por S. aureus que mantêm picos febris e hemoculturas periféricas positivas a despeito do uso correto de antibioticoterapia intravenosa adequada por mais de 48 a 72 horas."
    ]
  },
  "susceptibility": {
    "antibioticPanel": [
      {
        "antibiotic": "Oxacilina",
        "mic": 0.25,
        "interpretation": "Sensível (Indica sensibilidade universal a beta-lactâmicos anti-estafilocócicos)",
        "breakpointSource": "BRCAST / EUCAST 2026 (Sensível se MIC <= 2 mg/L para determinação indireta com Cefoxitina)"
      },
      {
        "antibiotic": "Cefoxitina",
        "mic": 1.5,
        "interpretation": "Sensível (Padrão de triagem negativo para o gene mecA, definindo cepa MSSA)",
        "breakpointSource": "BRCAST / EUCAST 2026 (Diâmetro de zona de inibição em disco de 30 mcg >= 22 mm indica ausência de mecA)"
      },
      {
        "antibiotic": "Vancomicina",
        "mic": 1.0,
        "interpretation": "Sensível (Bactéria sensível a glicopeptídeos)",
        "breakpointSource": "BRCAST / CLSI 2026 (Sensível se MIC <= 2 mg/L; Intermediário [VISA] se 4-8 mg/L; Resistente [VRSA] se >= 16 mg/L)"
      },
      {
        "antibiotic": "Teicoplanina",
        "mic": 1.0,
        "interpretation": "Sensível",
        "breakpointSource": "BRCAST / EUCAST 2026 (Sensível se MIC <= 2 mg/L)"
      },
      {
        "antibiotic": "Daptomicina",
        "mic": 0.5,
        "interpretation": "Sensível (Excelente lipopeptídeo bactericida contra MRSA sistêmico, exceto em pneumonia)",
        "breakpointSource": "BRCAST / CLSI 2026 (Sensível se MIC <= 1 mg/L)"
      },
      {
        "antibiotic": "Linezolida",
        "mic": 1.5,
        "interpretation": "Sensível (Excelente oxazolidinona bacteriostática para MRSA respiratório)",
        "breakpointSource": "BRCAST / EUCAST 2026 (Sensível se MIC <= 4 mg/L)"
      },
      {
        "antibiotic": "Ceftarolina",
        "mic": 0.25,
        "interpretation": "Sensível (Cefalosporina de 5ª geração com excelente atividade bactericida contra MRSA)",
        "breakpointSource": "BRCAST / EUCAST 2026 (Sensível se MIC <= 1 mg/L)"
      },
      {
        "antibiotic": "Sulfametoxazol-Trimetoprima",
        "mic": 2.0,
        "interpretation": "Sensível",
        "breakpointSource": "BRCAST / EUCAST 2026 (Sensível se MIC <= 2/38 mg/L)"
      },
      {
        "antibiotic": "Clindamicina",
        "mic": 0.12,
        "interpretation": "Sensível (D-Test negativo para indução de resistência a macrolídeos)",
        "breakpointSource": "BRCAST / EUCAST 2026 (Sensível se MIC <= 0.25 mg/L)"
      },
      {
        "antibiotic": "Eritromicina",
        "mic": 8.0,
        "interpretation": "Resistente (Indica padrão de resistência adquirida a macrolídeos de 14 e 15 carbonos)",
        "breakpointSource": "BRCAST / EUCAST 2026 (Resistente se MIC > 2 mg/L)"
      }
    ],
    "resistanceMechanisms": [
      {
        "mechanism": "Modificação de Alvo Transpeptidase (Produção de PBP2a/PBP2c)",
        "description": "Mecanismo responsável pelo fenótipo MRSA (Staphylococcus aureus resistente à meticilina). Consiste na aquisição horizontal estável de um elemento genético móvel cromossômico denominado Cassete Cromossômico Estafilocócico mec (SCCmec), o qual transporta o gene estrutural mecA (ou o homólogo mecc). Este gene codifica a síntese de uma proteína de ligação à penicilina alternativa chamada PBP2a (ou PBP2c). Esta enzima transpeptidase alternativa possui uma afinidade de ligação química extraordinariamente baixa por praticamente todos os antibióticos da classe dos beta-lactâmicos comerciais de rotina, assumindo a função enzimática de síntese da parede celular bacteriana mesmo na presença de altas concentrações de drogas. Isso confere à cepa bacteriana resistência clínica universal a todas as penicilinas, cefalosporinas clássicas (gerações 1, 2, 3 e 4), carbapenêmicos (imipenem, meropenem, ertapenem) e monobactâmicos, poupando exclusivamente cefalosporinas de 5ª geração projetadas contra MRSA (Ceftarolina)."
      },
      {
        "mechanism": "Hidrólise Enzimática por Beta-Lactamase (Penicilinase estafilocócica)",
        "description": "Expressão e produção da enzima beta-lactamase extracelular clássica codificada pelo gene blaZ (frequentemente localizado em plasmídeos transmissíveis de alta transferência horizontal). A enzima cliva quimicamente o anel beta-lactâmico das penicilinas simples suscetíveis (Penicilina G, Ampicilina, Amoxicilina), inativando-as completamente antes de atingirem a membrana bacteriana. S. aureus produtores de blaZ permanecem totalmente sensíveis às penicilinas semi-sintéticas estáveis à penicilinase (Oxacilina, Nafcilina) e às associações terapêuticas de beta-lactâmicos formuladas com inibidores suicidas de beta-lactamase (Amoxicilina-Clavulanato, Ampicilina-Sulbactam, Piperacilina-Tazobactam)."
      },
      {
        "mechanism": "Hiperespessamento de Parede Celular (Fenótipo VISA) e Substituição de Peptídeo Alvo (Fenótipo VRSA)",
        "description": "O S. aureus apresenta duas vias evolutivas de resistência aos glicopeptídeos (Vancomicina): 1) VISA (S. aureus com sensibilidade intermediária à vancomicina): decorrente de mutações genéticas cromossômicas sequenciais cumulativas em sistemas regulatórios de membrana (como graSR, vraSR) que levam à síntese de uma parede celular de peptideoglicano anormalmente espessada com abundância de resíduos terminais D-alanil-D-alanina livres desprovidos de ligações cruzadas. Estes resíduos livres atuam como 'falsos alvos' que sequestram e ligam fisicamente as moléculas de vancomicina na periferia externa da parede, impedindo que penetrem até o sítio de PBPs da membrana citoplasmática profunda; 2) VRSA (S. aureus resistente à vancomicina): mecanismo hiper-raro de altíssima gravidade clínica decorrente da aquisição horizontal interespécies (de Enterococcus faecalis resistente à vancomicina - VRE) do operon cromossômico vanA localizado em transposons altamente transmissíveis. Os genes expressam enzimas que modificam estruturalmente o terminal do peptídeo precursor de parede celular substituindo o resíduo D-alanil-D-alanina por D-alanil-D-lactato, reduzindo a afinidade de ligação da vancomicina em mais de 1000 vezes e tornando-a totalmente ineficaz."
      },
      {
        "mechanism": "Metilação Ribossomal Ativa (Resistência MLSb)",
        "description": "Resistência mediada pelos genes ermA ou ermC (erythromycin ribosome methylation) que expressam metiltransferases ribossômicas de RNA. Estas enzimas transferem grupos metil para resíduos específicos de adenina no domínio V do RNA ribossômico 23S da subunidade 50S bacteriana. Esta modificação estrutural impede a ligação física e inibe a ação clínica de três classes estruturalmente distintas de antibióticos que compartilham sítios de ligação sobrepostos no ribossomo: Macrolídeos (Eritromicina, Claritromicina, Azitromicina), Lincosamidas (Clindamicina) e Estreptograminas do Grupo B (grupo MLSb). Pode se manifestar sob a forma constitutiva (resistência óbvia e expressa in vitro a clindamicina e eritromicina) ou sob a forma induzível (em que a bactéria se apresenta resistente à eritromicina, mas aparentemente sensível à clindamicina, exigindo o teste microbiológico em disco de aproximação D-Test para identificação)."
      }
    ],
    "mrsaStatus": "Presente (A correta diferenciação epidemiológica e laboratorial entre cepas MSSA e MRSA constitui o divisor de águas absoluto na determinação da conduta clínica terapêutica. Isolados de Staphylococcus aureus que se apresentam resistentes ao disco de cefoxitina ou possuem MIC de oxacilina superior a 2 mg/L são classificados como MRSA, exigindo de forma obrigatória a instituição de precauções de isolamento de contato hospitalar e a prescrição de antibióticos de resguardo glicopeptídeos [vancomicina], lipopeptídeos [daptomicina] ou oxazolidinonas [linezolida]. Por outro lado, cepas sensíveis [MSSA] com MIC de oxacilina inferior ou igual a 2 mg/L devem ser tratadas preferencialmente com beta-lactâmicos direcionados [Oxacilina ou Cefazolina], que demonstram eficácia clínica bactericida significativamente superior à vancomicina para S. aureus sensível).",
    "typicalPatterns": [
      {
        "pattern": "MSSA (Staphylococcus aureus sensível à meticilina / oxacilina)",
        "description": "Isolados estafilocócicos selvagens ou modificados desprovidos dos cassetes mecA/C. Apresentam sensibilidade preservada à oxacilina, cefazolina, cefalosporinas de todas as gerações, carbapenêmicos e à maioria das classes não beta-lactâmicas (como fluoroquinolonas, aminoglicosídeos, clindamicina, tetraciclinas e sulfametoxazol-trimetoprima)."
      },
      {
        "pattern": "HA-MRSA (Healthcare-Associated MRSA / MRSA Hospitalar)",
        "description": "Isolados de ambiente de saúde associados a infecções nosocomiais tardias em pacientes cronicamente hospitalizados. Caracterizam-se por carregar cassetes SCCmec grandes (tipicamente tipos I, II ou III) e apresentar perfil de resistência multidrogas extremamente amplo e severo, abrangendo resistência a todos os beta-lactâmicos e co-resistência a fluoroquinolonas (ciprofloxacina), macrolídeos, lincosamidas, tetraciclinas e aminoglicosídeos, permanecendo sensíveis apenas a glicopeptídeos (vancomicina, teicoplanina), linezolida e daptomicina."
      },
      {
        "pattern": "CA-MRSA (Community-Acquired MRSA / MRSA Comunitário)",
        "description": "Isolados de ambiente comunitário acometendo indivíduos saudáveis sem fatores de risco hospitalar clássicos. Caracterizam-se por carregar cassetes SCCmec menores e mais móveis (tipicamente tipos IV ou V) e, embora resistentes a penicilinas e cefalosporinas clássicas, mantêm sensibilidade in vitro preservada à maioria dos antimicrobianos não beta-lactâmicos (excelente sensibilidade a sulfametoxazol-trimetoprima, doxiciclina e clindamicina). Epidemiologicamente, apresentam forte associação com a biossíntese da citotoxina PVL, provocando infecções de pele hiperinflamatórias necrotizantes profundas extremamente dolorosas."
      }
    ]
  },
  "treatment": {
    "empiric": [
      {
        "condition": "Sepse Grave, Choque Séptico de Origem Indeterminada ou Suspeita de Infecção de Corrente Sanguínea (Bacteremia) Associada a Dispositivo",
        "regimen": "Em cenários em que há risco epidemiológico ou individual para infecção por MRSA (instituições com prevalência endêmica de MRSA superior a 10-15%, paciente cronicamente hospitalizado, transferido de outra instituição de saúde, ou portador de cateter central crônico): Vancomicina IV de 15 a 20 mg/kg de peso corporal a cada 8 a 12 horas, infundida lentamente por bomba infusora (máximo de 1 g/hora) com monitorização rigorosa e ajuste subsequente baseado na função renal e dosagem de nível de vale (trough level) sérico, objetivando atingir uma relação farmacocinética AUC/MIC de 400 a 600 ou nível de vale estável de 15 a 20 mcg/mL. Alternativa de escolha em pacientes com alto risco de nefrotoxicidade aguda ou intolerância grave a glicopeptídeos: Daptomicina IV de 6 a 8 mg/kg de peso corporal em dose única diária (NÃO prescrever daptomicina se houver suspeita concomitante de pneumonia sob risco de inativação clínica pelo surfactante). Se houver baixo risco institucional de MRSA e paciente sem antecedentes hospitalares de risco: Cefazolina IV 2 g a cada 8 horas ou Oxacilina IV 2 g a cada 4 horas."
      },
      {
        "condition": "Infecções de Pele e Tecidos Moles na Comunidade (SSTIs com suspeita de CA-MRSA)",
        "regimen": "Para quadros purulentos leves a moderados sem sinais de toxicidade sistêmica após desbridamento e drenagem cirúrgica do abscesso: Sulfametoxazol-Trimetoprima (800 mg/160 mg) por via oral, 1 a 2 comprimidos a cada 12 horas por um período de 7 a 14 dias; ou Clindamicina por via oral de 300 a 450 mg a cada 8 horas (indicada estritamente se houver confirmação laboratorial de sensibilidade por D-Test negativo); ou Doxiciclina por via oral 100 mg a cada 12 horas."
      }
    ],
    "targeted": [
      {
        "phenotype": "MSSA (Staphylococcus aureus sensível à meticilina / oxacilina)",
        "drugs": "Oxacilina IV 2 g a cada 4 horas por via intravenosa direta (dose total diária de 12 g) ou Cefazolina IV 2 g a cada 8 horas. Importante: Para infecções invasivas sistêmicas por MSSA (especialmente bacteremias e endocardite), o uso de beta-lactâmicos direcionados anti-estafilocócicos [Oxacilina ou Cefazolina] é clinicamente superior e mais bactericida do que os glicopeptídeos [Vancomicina], associando-se epidemiologicamente a taxas de cura significativamente maiores, menor recorrência e menor mortalidade a curto e longo prazo. A Vancomicina só deve ser prescrita para MSSA em caso de alergia grave mediada por IgE [choque anafilático induzido por penicilinas]."
      },
      {
        "phenotype": "MRSA (Staphylococcus aureus resistente à meticilina / oxacilina)",
        "drugs": "Vancomicina IV ajustada estritamente por monitoramento terapêutico farmacocinético (TDM) para AUC/MIC de 400 a 600. Em infecções de alta gravidade sistêmica, bacteremias persistentes ou endocardite por MRSA, a Daptomicina IV em doses elevadas (8 a 10 mg/kg/dia) é o tratamento bactericida de resgate de eleição. Para pneumonia cavitária necrotizante por MRSA, a Linezolida IV ou VO de 600 mg a cada 12 horas é preferida em relação à vancomicina devido ao seu excelente volume de distribuição e acúmulo no fluido alveolar pulmonar, associada à capacidade única de inibir a síntese ribossomal de toxinas bacterianas virulentas (superantígenos e PVL)."
      }
    ],
    "duration": "A duração da antibioticoterapia é determinada pela complexidade da infecção. Para bacteremia estafilocócica não complicada (excluída endocardite por ecocardiograma transesofágico negativo, hemoculturas de controle negativas em 48-72h pós-terapia, paciente afebril nas primeiras 72h, sem dispositivos protéticos ou implantes, e ausência de sinais de disseminação hematogênica secundária): duração mínima de 14 dias de terapia intravenosa estrita a partir da primeira hemocultura negativa. Para bacteremia complicada (presença de focos metastáticos, persistência de hemoculturas positivas após 72h) ou Endocardite Infecciosa Aguda: duração mínima de 4 a 6 semanas de terapia intravenosa direcionada de alta dose. Para osteomielite hematogênica aguda: 4 a 6 semanas de tratamento. Para infecções de pele e tecidos moles não complicadas (abscessos drenados): 5 a 10 dias de terapia oral.",
    "alternatives": [
      {
        "condition": "Alergia Grave Mediada por IgE aos Beta-lactâmicos (Choque anafilático) em Infecção por MSSA",
        "regimen": "Uso de Teicoplanina IV 6 mg/kg a cada 12h para as primeiras 3 doses de ataque, seguida de 6 mg/kg uma vez ao dia; ou Clindamicina IV 600 a 900 mg a cada 8 horas (se sensível); ou Vancomicina IV conforme metas farmacocinéticas."
      },
      {
        "condition": "Falha Terapêutica Documentada, Nefrotoxicidade Limitante ou Elevação de MIC de Vancomicina (>1,5-2,0 mg/L) em MRSA",
        "regimen": "Substituição imediata por Daptomicina IV de 8 a 10 mg/kg/dia associada ou não a Ceftarolina IV 600 mg a cada 8 horas (combinação sinérgica altamente bactericida com excelente atividade contra cepas resistentes)."
      }
    ],
    "specialSituations": [
      {
        "situation": "Uso de Daptomicina e Pneumonia Estafilocócica",
        "description": "A Daptomicina é um lipopeptídeo altamente eficaz e bactericida contra cocos Gram-positivos multirresistentes, porém ela é quimicamente ligada e completamente inativada pelo surfactante lipídico pulmonar presente fisiologicamente nos alvéolos humanos. Portanto, a Daptomicina jamais deve ser prescrita ou administrada para o tratamento de pneumonias, empiemas ou abscessos pulmonares causados por S. aureus (MSSA ou MRSA), sob risco de falha terapêutica catastrófica absoluta por ausência de droga livre viável no foco infeccioso."
      },
      {
        "situation": "Execução Obrigatória do D-Test para Prescrição de Clindamicina",
        "description": "Em perfis de antibiograma de S. aureus que revelem resistência laboratorial in vitro à eritromicina mas aparente sensibilidade inicial à clindamicina, o laboratório de microbiologia clínica deve obrigatoriamente realizar o teste do disco de aproximação (D-Test). O teste consiste em posicionar discos de eritromicina e clindamicina a uma distância controlada de 15 a 26 mm em placa de ágar Mueller-Hinton semeada com o isolado bacteriano. O surgimento de um achatamento ou distorção unilateral do halo de inibição ao redor do disco de clindamicina especificamente na zona voltada para o disco de eritromicina (mimetizando o formato de uma letra 'D' maiúscula) confirma o resultado do D-Test como positivo, revelando a presença de resistência induzível à clindamicina mediada pela ativação do gene de metilação erm. Nesses casos, a clindamicina deve ser obrigatoriamente reportada como resistente no laudo microbiológico final e sua prescrição clínica deve ser proscrita devido ao elevadíssimo risco documentado de falha terapêutica in vivo por rápida emergência de resistência constitutiva durante o curso do tratamento."
      }
    ]
  },
  "prevention": {
    "vaccines": [],
    "prophylaxis": [
      {
        "indication": "Profilaxia Antimicrobiana Cirúrgica para Procedimentos Cirúrgicos Limpos de Alto Risco com Colocação de Implantes (Cirurgias Cardíacas, Cirurgias Ortopédicas de Próteses de Quadril e Joelho, Neurocirurgias)",
        "protocol": "Administração intravenosa intermitente de Cefazolina na dose de 2 g para adultos (dose ajustada para 3 g para pacientes com peso corporal igual ou superior a 120 kg), infundida lentamente dentro de 60 minutos imediatamente anteriores à incisão cirúrgica cutânea inicial, garantindo níveis séricos e teciduais bactericidas ideais no momento de exposição da ferida. Administrar dose de manutenção intraoperatória adicional de Cefazolina a cada 4 horas de cirurgia prolongada ou se houver perda de sangue estimada superior a 1500 mL durante o procedimento. O encerramento da profilaxia cirúrgica deve ocorrer em até 24 horas pós-operatórias. Se o paciente for portador nasal conhecido de MRSA ou se a instituição hospitalar apresentar taxas historicamente elevadas de infecção endêmica por MRSA, a Vancomicina na dose de 15 mg/kg de peso corporal, infundida lentamente em até 120 minutos antes da incisão, deve ser considerada em associação à cefazolina ou de forma isolada."
      }
    ],
    "infectionControlMeasures": [
      {
        "measure": "Higienização das Mãos (Campanha Global dos 5 Momentos da OMS)",
        "category": "Prevenção Geral de Infecção Relacionada à Assistência à Saúde (IRAS)",
        "protocol": "Cumprimento obrigatório e rigoroso por todos os profissionais de saúde e cuidadores da higienização das mãos utilizando preparação alcoólica (álcool gel a 70% com tempo de fricção de 20 a 30 segundos) ou sabonete líquido degermante e água corrente (tempo de lavagem de 40 a 60 segundos) nos cinco momentos assistenciais específicos: 1) Antes do contato direto com o paciente; 2) Antes da realização de qualquer procedimento asséptico; 3) Imediatamente após risco de exposição ou contato com fluidos corporais, secreções ou sangue; 4) Após o contato físico com o paciente; 5) Após contato com fômites ou superfícies inanimadas próximas ao paciente."
      },
      {
        "measure": "Precauções de Isolamento de Contato para MRSA / VRSA",
        "category": "Prevenção de Transmissão de Patógenos Multirresistentes em Ambiente Hospitalar",
        "protocol": "Instituição imediata de Precaução de Contato para todos os pacientes identificados com infecção ativa ou colonização assintomática por MRSA ou VRSA: 1) Alocação preferencial em quarto privativo individual com banheiro exclusivo, com cartaz visual sinalizador de Precaução de Contato fixado na porta; 2) Em caso de saturação de leitos, realizar isolamento por coorte de pacientes com o mesmo patógeno e mesmo perfil de sensibilidade antimicrobiana; 3) Uso obrigatório de avental de manga longa impermeável descartável (TNT com gramatura >=30g/m²) e luvas de procedimento por todos os profissionais de saúde e visitantes imediatamente antes de adentrar ao quarto do paciente; 4) Retirada cuidadosa de toda a paramentação protetora e descarte em lixeira infectante (saco vermelho) localizada dentro do quarto, imediatamente antes da saída do leito, seguida de higienização vigorosa das mãos; 5) Dedicar termômetro, esfigmomanômetro, oxímetro e estetoscópio para uso EXCLUSIVO do paciente isolado à beira do leito."
      },
      {
        "measure": "Vigilância Ativa Epidemiológica (Triagem por Cultura / PCR)",
        "category": "Controle de Infecção e Rastreamento Epidemiológico Hospitalar",
        "protocol": "Realização sistemática de triagem microbiológica por meio de coleta de swab nasal de todos os pacientes de alto risco admitidos em UTIs adultas, pediátricas ou neonatais, pacientes transferidos de outras instituições hospitalares ou com histórico de internação recente de longa permanência. O objetivo é rastrear portadores assintomáticos e instalar de forma preemptiva imediata as precauções de contato adequadas, minimizando a disseminação cruzada oculta no ambiente nosocomial."
      }
    ],
    "decolonization": [
      {
        "patientGroup": "Pacientes Cirúrgicos Eletivos de Alto Risco (Cardiovasculares, Ortopedia de Grande Porte com Implante, Neurocirurgias com Prótese)",
        "protocol": "Aplicação de protocolo de descolonização estafilocócica endógena pré-operatória por 5 dias consecutivos anteriores à data agendada do procedimento cirúrgico: 1) Aplicação de pequena porção de pomada nasal de Mupirocina a 2% em ambas as narinas anteriores, duas vezes ao dia, seguida de massagem externa suave das asas nasais para dispersão uniforme do medicamento; 2) Banho corporal completo diário (incluindo lavagem de cabelos) utilizando solução de Gluconato de Clorexidina líquida a 2% (sabonete degermante alcoólico ou aquoso), prestando atenção especial às áreas de dobras cutâneas (axilas, virilhas, períneo e sítio anatômico da futura incisão cirúrgica), permitindo o contato da clorexidina por 1 a 2 minutos antes do enxágue abundante. Trocar roupas íntimas, roupas de dormir e lençóis diariamente após o banho."
      },
      {
        "patientGroup": "Pacientes sob Cuidados Intensivos em UTIs de Alta Prevalência",
        "protocol": "Uso universal rotineiro de banho diário com panos umedecidos impregnados com solução de Clorexidina a 2% sem enxágue para todos os pacientes sob ventilação mecânica ou portadores de CVC, associado à utilização de curativos transparentes de cateter central contendo almofada ou gel impregnado com clorexidina no sítio de inserção vascular. Esta conduta reduz de forma acentuada as taxas de IPCS e colonização cutânea secundária por S. aureus."
      }
    ]
  },
  "biosafety": {
    "biosafetyLevel": "BSL-2 (Nível de Biossegurança 2)",
    "ppeRequired": [
      "Luvas de procedimento descartáveis de látex ou nitrila (resistentes a agentes biológicos e agentes químicos desinfetantes)",
      "Avental protetor de manga longa descartável impermeável de TNT (com gramatura mínima de 30 g/m²) para todo e qualquer contato físico direto com o paciente ou fômites",
      "Óculos de proteção ocular de policarbonato com vedação lateral ou protetor facial completo (shield) durante procedimentos com risco de dispersão ou projeção de secreções biológicas, pus, sangue ou fluidos corporais",
      "Máscara cirúrgica de tripla camada protetora com eficiência de filtração bacteriana >=95%; ou máscara de proteção respiratória (respirador purificador de ar N95 ou PFF2) durante procedimentos geradores de aerossóis em pacientes com pneumonia estafilocócica ativa por MRSA"
    ],
    "isolationPrecautions": {
      "type": "Precaução de Contato (Contact Precautions) recomendada para todos os pacientes colonizados ou com infecções documentadas por MRSA (S. aureus resistente à meticilina) ou VRSA (S. aureus resistente à vancomicina)",
      "duration": "Mantida continuamente durante todo o período de internação hospitalar do paciente na instituição de saúde. O encerramento do protocolo de isolamento e precaução de contato só deve ser formalmente validado e executado pelo Serviço de Controle de Infecção Hospitalar (SCIH) mediante a obtenção documentada de pelo menos duas culturas de vigilância microbiológica consecutivas negativas (coletadas de sítios anatômicos anteriormente positivos, narinas anteriores, feridas ativas ou swab perineal) com intervalo mínimo de 1 a 2 semanas sem uso de qualquer agente antimicrobiano ativo com espectro contra S. aureus.",
      "instructions": "Alocar o paciente preferencialmente em quarto privativo individual com banheiro e pia exclusivos para higienização de mãos. A alocação por coorte só deve ser autorizada em caso de total ausência de leitos e exclusivamente com pacientes portadores de isolados de MRSA com idêntico perfil fenotípico de sensibilidade e resistência a antibióticos. Higienização das mãos é mandatória antes e depois do contato direto com o paciente ou fômites do quarto. Avental e luvas devem ser vestidos imediatamente antes de adentrar ao quarto do paciente e retirados imediatamente antes da saída, descartando-os no coletor de resíduos infectantes Grupo A localizado na saída do quarto. Desinfecção rigorosa com álcool 70% de todos os aparelhos médicos de uso compartilhado após cada utilização."
    },
    "wasteDisposal": "Todos os resíduos, materiais, EPIs descartáveis e fômites descartados que entraram em contato com culturas vivas de Staphylococcus aureus, swabs biológicos, exsudato purulento de abscessos ou secreções respiratórias contaminadas pertencem à classificação do Grupo A1 de Resíduos Biológicos Infectantes de Serviços de Saúde (conforme RDC 222/2018 da ANVISA). Devem ser descartados obrigatoriamente em sacos plásticos brancos leitosos de alta resistência mecânica impermeáveis, devidamente identificados com o símbolo internacional de risco biológico. Os resíduos perfurocortantes (agulhas, ampolas de vidro, escalpes, lâminas de bisturi usados) devem ser depositados em caixas coletoras rígidas de papelão amarelo específicas para perfurocortantes (Descarpack). Todos os resíduos infectantes produzidos em laboratórios de microbiologia devem passar obrigatoriamente por processo de tratamento térmico físico por calor úmido sob pressão (autoclavagem a 121°C por pelo menos 30 a 60 minutos) antes de sua destinação final em aterros sanitários licenciados para resíduos perigosos ou processos de incineração.",
    "decontamination": "As superfícies de bancadas laboratoriais, cabines de segurança biológica e mobiliários clínicos expostos a S. aureus devem ser submetidas a processos sistemáticos e imediatos de descontaminação física e química após derramamentos acidentais e ao encerramento de cada turno de trabalho. Utilizar agentes desinfetantes hospitalares de eficácia bactericida comprovada: álcool a 70% sob fricção mecânica ativa repetida por 3 picos de aplicação de 30 segundos; ou solução de hipoclorito de sódio a 1% (10.000 ppm) com tempo mínimo de contato de 10 minutos; ou formulações baseadas em quaternário de amônio de quinta geração ou peróxido de hidrogênio acelerado.",
    "laboratorySafety": [
      "O acesso ao laboratório de microbiologia clínica que manipula amostras e isolados de S. aureus (BSL-2) deve ser restrito exclusivamente a profissionais de saúde e técnicos devidamente treinados, capacitados e autorizados.",
      "Toda manipulação de culturas bacterianas estafilocócicas líquidas que apresente risco intrínseco de geração de aerossóis ou gotículas biológicas suspensas (como agitação vigorosa por vortex, centrifugação em tubos destampados, plaqueamento microbiológico por estriamento vigoroso, ressuspensão de colônias ou sonicação) deve ser realizada obrigatoriamente dentro de uma Cabine de Segurança Biológica (CSB) Classe II Tipo A2 em perfeitas condições de calibração anual e validação de filtros HEPA.",
      "Proibição absoluta de pipetagem com a boca, consumo de alimentos, bebidas, fumo, aplicação de cosméticos, armazenamento de itens pessoais ou manipulação de lentes de contato nas áreas de trabalho técnicas do laboratório.",
      "Uso obrigatório de sapatos fechados de proteção, calça comprida comprida de tecido não inflamável e jaleco de manga longa abotoado até o colarinho de uso exclusivo para o ambiente técnico laboratorial, proibido o seu uso em áreas comuns (refeitórios, copas, bibliotecas, banheiros públicos).",
      "Implementação de protocolo institucional imediato de notificação e profilaxia de acidentes biológicos ocupacionais com perfurocortantes envolvendo culturas ou amostras de MRSA ou VRSA, incluindo lavagem imediata abundante com água corrente e sabão neutro e encaminhamento para avaliação da medicina do trabalho."
    ]
  },
  "clinical": {
    "indications": [
      "Identificação microbiológica de S. aureus em espécimes biológicos purulentos (coleta de abscessos, secreções de feridas, líquidos cavitários) para o diagnóstico de infecções de pele e tecidos moles (SSTIs) como foliculite, furunculose, carbúnculos, celulites e impetigos.",
      "Isolamento bacteriano em hemoculturas periféricas para confirmação diagnóstica de bacteremia estafilocócica primária e sepse de origem vascular.",
      "Pesquisa espécie-específica em fragmentos de biópsia óssea e fluidos articulares para diagnóstico etiológico de osteomielite e artrite séptica aguda.",
      "Identificação molecular e fenotípica rápida do resistoma (pesquisa de gene mecA e perfil de sensibilidade à oxacilina/cefoxitina) para diferenciação diagnóstica imediata entre linhagens MSSA e MRSA.",
      "Isolamento em amostras do trato respiratório inferior (escarro, lavado broncoalveolar, secreção endotraqueal) para diagnóstico de pneumonia necrotizante estafilocócica.",
      "Triagem epidemiológica ativa por coleta de swab nasal anterior em admissões hospitalares críticas para identificação e controle de portadores assintomáticos de MRSA."
    ],
    "offLabel": [],
    "clinicalUse": [
      "Staphylococcus aureus atua primariamente como um comensal colonizador assintomático benigno das narinas anteriores e da pele de cerca de um terço da população humana saudável global.",
      "Atua de forma secundária e oportunista como um patógeno humano altamente agressivo e invasivo na presença de rupturas mecânicas da barreira cutânea por traumas, procedimentos cirúrgicos ou inserção percutânea de dispositivos médicos intravasculares invasivos.",
      "Funciona como o principal agente etiológico causador de infecções nosocomiais tardias adquiridas em ambiente hospitalar (infecções de corrente sanguínea relacionadas a cateter, pneumonias associadas à ventilação mecânica, infecções de sítio cirúrgico) e infecções piogênicas profundas na comunidade."
    ],
    "firstLine": False
  },
  "related": {
    "calculators": [
      {
        "id": "CKO-CAL-000042",
        "name": "Calculadora de Dosagem e Ajuste Farmacocinético de Vancomicina baseada em AUC/MIC de 24h",
        "description": "Calculadora clínica avançada computadorizada utilizada para estimar e otimizar as doses de ataque e manutenção de Vancomicina intravenosa em pacientes adultos críticos com base na taxa de filtração glomerular do paciente, peso corporal total e níveis séricos de vale. O objetivo é alcançar uma relação farmacocinética/farmacodinâmica ideal de Área Sob a Curva de concentração sérica dividida pela Concentração Inibitória Mínima (AUC/MIC) entre 400 e 600 em 24h para o tratamento otimizado de infecções sistêmicas por MRSA, minimizando o risco de insuficiência renal aguda induzida por nefrotoxicidade da droga."
      },
      {
        "id": "CKO-CAL-000085",
        "name": "Escore de Depuração de Creatinina de Cockcroft-Gault para Estimativa de Função Renal",
        "description": "Fórmula matemática padronizada baseada em idade, sexo, peso e creatinina sérica utilizada para estimar a depuração de creatinina do paciente à beira do leito, essencial para a prescrição inicial segura e reajuste terapêutico sistemático de antimicrobianos hidrofílicos com perfil de eliminação predominantemente renal utilizados contra S. aureus (Vancomicina, Cefazolina, Daptomicina)."
      }
    ],
    "clinicalScales": [
      {
        "id": "CKO-SCA-000109",
        "name": "Escore qSOFA (quick Sequential Organ Failure Assessment) para Triagem de Sepse",
        "description": "Escore clínico de triagem rápida ultra-simplificada realizado à beira do leito para identificação precoce de pacientes com suspeita de infecção ativa por S. aureus com alto risco de óbito ou internação prolongada em UTI. Avalia três parâmetros objetivos pontuando 1 ponto para cada critério presente: frequência respiratória igual ou superior a 22 incursões respiratórias por minuto, alteração aguda de estado de consciência (Escala de Coma de Glasgow inferior a 15) e pressão arterial sistólica igual ou inferior a 100 mmHg. Uma pontuação total maior ou igual a 2 pontos indica disfunção de órgãos e exige ativação imediata do protocolo de sepse."
      },
      {
        "id": "CKO-SCA-000110",
        "name": "Escore SOFA Completo (Sequential Organ Failure Assessment) para Disfunção Orgânica",
        "description": "Escala multiparamétrica detalhada aplicada em ambiente de Terapia Intensiva que avalia diariamente a presença e gravidade de disfunções orgânicas agudas em seis sistemas fisiológicos fundamentais (cardiovascular, renal, respiratório, hematológico, hepático e sistema nervoso central) em resposta a infecções bacterianas graves. Utilizado para guiar a terapia de suporte, ressuscitação volêmica e avaliar o prognóstico clínico de pacientes com sepse ou choque séptico estafilocócico."
      }
    ],
    "procedures": [
      {
        "id": "CKO-PRO-000215",
        "name": "Procedimento Operacional Padrão (POP) de Coleta de Hemocultura Periférica por Punção Venosa",
        "description": "Roteiro assistencial sequencial detalhado que orienta os profissionais de enfermagem na execução correta e segura da coleta asséptica de hemoculturas, enfatizando a antissepsia de pele em três etapas com clorexidina alcoólica a 2% e o volume correto de sangue a ser colhido para minimizar taxas de contaminação cruzada acidental por estafilococos coagulase-negativos."
      },
      {
        "id": "CKO-PRO-000218",
        "name": "Drenagem e Desbridamento Cirúrgico de Abscessos de Pele e Tecidos Moles",
        "description": "Procedimento médico invasivo realizado sob anestesia local que consiste na realização de incisão linear ampla sobre a área flutuante do abscesso, evacuação completa do exsudato purulento estafilocócico, quebra mecânica de septos internos (loquios), lavagem copiosa da cavidade com soro fisiológico estéril a 0,9% e empacotamento frouxo com gaze estéril úmida. Constitui a intervenção primária e mandatória para a cura de abscessos profundos por S. aureus."
      }
    ],
    "catheters": [
      {
        "id": "CKO-DEV-000302",
        "name": "Cateter Venoso Central (CVC) Duplo Lúmen de Poliuretano de Longa Permanência",
        "description": "Dispositivo intravascular invasivo inserido por via percutânea em grandes veias centrais (jugular interna, subclávia ou femoral) utilizado para infusão de soluções hipertônicas, hemodosagem rápida, vasopressores e nutrição parenteral. Representa a principal porta de entrada vascular que predispõe à colonização endógena da pele e ao desenvolvimento subsequente de infecções primárias de corrente sanguínea (IPCS) por Staphylococcus aureus."
      },
      {
        "id": "CKO-DEV-000305",
        "name": "Cateter Venoso Central de Inserção Periférica (PICC - Peripherally Inserted Central Catheter)",
        "description": "Cateter vascular central inserido através de uma veia periférica do membro superior (basílica, cefálica ou braquial) que progride até o terço distal da veia cava superior. Utilizado para tratamentos intravenosos prolongados de várias semanas (como cursos extensos de antibioticoterapia para osteomielite por MRSA)."
      }
    ],
    "needles": [
      {
        "id": "CKO-DEV-000410",
        "name": "Agulha de Aspiração e Punção Estéril de Calibre Largo (40x12 mm / 18G)",
        "description": "Dispositivo metálico estéril de ponta biselada acoplado a seringas utilizado para realizar a aspiração direta asséptica de fluidos purulentos de cavidades de abscessos flutuantes profundos, fornecendo amostras de excelente qualidade biológica sem contaminação superficial para análise laboratorial."
      }
    ],
    "syringes": [
      {
        "id": "CKO-DEV-000512",
        "name": "Seringa Plástica Descartável Estéril de 10 mL com Bico Luer Lock de Rosca",
        "description": "Dispositivo plástico estéril utilizado para realizar a aspiração controlada de fluidos teciduais de abscessos ou diluição e administração intravenosa lenta de antibióticos e medicamentos de suporte."
      }
    ],
    "dressings": [
      {
        "id": "CKO-DEV-000620",
        "name": "Curativo de Película Transparente de Poliuretano Semipermeável com Gel de Clorexidina",
        "description": "Curativo estéril avançado autoadesivo projetado para cobertura e fixação de cateteres venosos centrais e periféricos. Apresenta uma película respiratória impermeável a líquidos e bactérias externas que permite inspeção contínua diária do óstio do cateter, integrada com uma almofada ou gel que libera de forma controlada Gluconato de Clorexidina antisséptica sobre a pele periférica do óstio, suprimindo o crescimento bacteriano da pele e reduzindo drasticamente as taxas de IPCS por S. aureus."
      }
    ],
    "wounds": [
      {
        "id": "CKO-CLI-000850",
        "name": "Ferida Cirúrgica Infectada com Deiscência e Drenagem Purulenta Ativa",
        "description": "Complicação pós-operatória severa em incisões cirúrgicas caracterizada pela invasão de tecidos incisionais superficiais ou profundos por S. aureus, manifestando-se clinicamente com calor local, dor severa, rubor importante, edema de bordas, deiscência de suturas e eliminação de secreção purulenta espessa amarelada."
      },
      {
        "id": "CKO-CLI-000855",
        "name": "Abscesso Cutâneo Flutuante e Doloroso de Tecido Celular Subcutâneo",
        "description": "Lesão nodular piogênica profunda e circunscrita na pele caracterizada por acúmulo centralizado de pus espesso circundado por halo inflamatório hiperêmico severo indurado, comumente causada por Staphylococcus aureus."
      }
    ],
    "protocols": [
      {
        "id": "CKO-PRT-000910",
        "name": "Protocolo Clínico de Prevenção de Infecção Primária de Corrente Sanguínea Associada a Cateter Central (IPCS)",
        "description": "Diretriz assistencial institucional multidisciplinar que reúne um conjunto de medidas baseadas em evidências científicas (bundles) para inserção e manutenção segura de cateteres centrais, englobando higiene obrigatória de mãos, antissepsia de pele com clorexidina alcoólica a 2%, barreiras máximas de paramentação na inserção e fricção vigorosa de hubs com álcool 70% na manipulação diária."
      },
      {
        "id": "CKO-PRT-000915",
        "name": "Protocolo de Descolonização Estafilocócica Pré-operatória para Cirurgias Limpas de Alto Risco com Implante",
        "description": "Diretriz assistencial estruturada que estabelece as regras para triagem nasal ativa e descolonização preventiva com mupirocina a 2% e banhos de clorexidina a 2% por 5 dias consecutivos anteriores a cirurgias cardíacas, ortopédicas de prótese e neurocirurgias eletivas, reduzindo a incidência de infecção de sítio cirúrgico por patógenos endógenos."
      }
    ],
    "articles": [
      {
        "id": "CKO-ART-001045",
        "name": "Diretrizes Clínicas da IDSA para o Tratamento de Infecções por Staphylococcus aureus Resistente à Meticilina (MRSA)",
        "description": "Artigo científico de referência internacional publicado pela Infectious Diseases Society of America (IDSA) que estabelece as diretrizes baseadas em evidências para o tratamento farmacológico otimizado de bacteremias, pneumonias, endocardite, osteomielite e infecções de pele causadas por linhagens de MRSA em pacientes adultos e pediátricos."
      }
    ],
    "videos": [
      {
        "id": "CKO-VID-002010",
        "name": "Vídeo Instrutivo de Técnica Correta de Higienização de Mãos segundo a OMS",
        "description": "Vídeo educacional de curta duração que demonstra de forma prática e detalhada a sequência correta de movimentos friccionais obrigatórios para a higiene das mãos com água e sabonete antisséptico ou álcool gel a 70% conforme as diretrizes universais da Organização Mundial da Saúde."
      }
    ],
    "courses": [
      {
        "id": "CKO-CRS-003050",
        "name": "Curso de Especialização em Controle de Infecção Hospitalar e Epidemiologia Nosocomial",
        "description": "Curso de pós-graduação lato sensu voltado para profissionais de saúde abordando controle, vigilância ativa e prevenção de infecções relacionadas à assistência à saúde (IRAS), auditorias de conformidade de bundles, epidemiologia molecular de patógenos multirresistentes (MDRO) e programas institucionais de uso racional de antimicrobianos (antimicrobial stewardship)."
      }
    ],
    "flashcards": [
      {
        "id": "CKO-FLS-004085",
        "name": "Flashcards Digitais de Critérios Bioquímicos e Identificação Laboratorial de S. aureus",
        "description": "Conjunto de cartões de estudo rápidos e interativos focados nos principais testes bioquímicos utilizados para identificação espécie-específica de S. aureus no laboratório de microbiologia, cobrindo testes de Gram, catalase, coagulase e antibiograma clássico."
      }
    ],
    "checklists": [
      {
        "id": "CKO-CHK-005020",
        "name": "Checklist de Inserção Segura de Cateter Venoso Central à Beira do Leito",
        "description": "Checklist observacional estruturado preenchido pelo profissional de enfermagem durante o procedimento de inserção de CVC pelo médico, auditando de forma ativa o cumprimento rigoroso dos itens de segurança obrigatórios (higiene das mãos, uso de barreiras de proteção máxima estéril, uso de clorexidina a 2% na antissepsia cutânea e cobertura correta do curativo transparente)."
      }
    ],
    "cases": [
      {
        "id": "CKO-CAS-006001",
        "name": "Estudo de Caso Clínico Integrado de Bacteremia e Choque Séptico por MRSA em Unidade de Terapia Intensiva",
        "description": "Discussão acadêmica detalhada de um caso clínico real envolvendo um paciente idoso internado em UTI que desenvolveu quadro hiperagudo de infecção de corrente sanguínea por MRSA associada a cateter venoso central, abordando diagnóstico laboratorial molecular rápido, controle de foco infeccioso por remoção de cateter, ressuscitação volêmica precoce, monitoramento farmacocinético de Vancomicina sérica e desfecho clínico do paciente."
      }
    ]
  },
  "assets": {
    "hero": {
      "url": "https://images.clinicalknowledge.org/microorganism/s_aureus_hero.jpg",
      "alt": "Eletromicrografia eletrônica de varredura digitalmente colorida mostrando aglomerados esféricos de cor dourada brilhante de células bacterianas esféricas de Staphylococcus aureus de formato cocoide agrupadas de forma tridimensional mimetizando cachos de uva sobrepostos."
    },
    "gallery": [
      {
        "url": "https://images.clinicalknowledge.org/microorganism/s_aureus_gram.jpg",
        "alt": "Visualização microscópica óptica direta sob ampliação de 1000x com óleo de imersão de coloração de Gram revelando abundantes cocos Gram-positivos corados em azul-escuro/roxo organizados em arranjos espaciais de cachos irregulares clássicos (estafilococos) cercados por abundantes leucócitos polimorfonucleares (neutrófilos)."
      },
      {
        "url": "https://images.clinicalknowledge.org/microorganism/s_aureus_blood_agar.jpg",
        "alt": "Placa de Petri contendo meio de cultura sólido Ágar Sangue de Carneiro a 5% após 24 horas de incubação, demonstrando colônias circulares, lisas, convexas de Staphylococcus aureus apresentando pigmentação amarela e halos transparentes completos de beta-hemólise clássica ao redor do crescimento colonial."
      }
    ],
    "technical": [
      {
        "url": "https://images.clinicalknowledge.org/microorganism/s_aureus_mannitol_agar.jpg",
        "alt": "Cultura seletiva e diferencial de Staphylococcus aureus em placa de Ágar Salgado Manitol. Observa-se crescimento colonial exuberante circundado por uma ampla e nítida viragem de coloração do meio de cultura vermelho de fenol para o amarelo-brilhante, indicando fermentação ativa de manitol."
      },
      {
        "url": "https://images.clinicalknowledge.org/microorganism/s_aureus_coagulase_test.jpg",
        "alt": "Demonstração comparativa visual do teste bioquímico de coagulase estafilocócica em tubo de ensaio após incubação a 35°C. O tubo positivo à direita exibe plasma de coelho estéril completamente coagulado em um bloco sólido gelatinoso firme e imóvel ao ser inclinado a 90 graus."
      }
    ],
    "package": [],
    "presentation": [],
    "illustrations": [
      {
        "url": "https://images.clinicalknowledge.org/microorganism/s_aureus_cell_wall_diagram.jpg",
        "alt": "Ilustração esquemática didática e detalhada da ultraestrutura da parede celular de Staphylococcus aureus, destacando a espessa camada de peptideoglicano, ácidos teicoicos e lipoteicoicos associados a proteínas funcionais ancoradas essenciais, especificamente a Proteína A (Spa) e adesinas da família MSCRAMMs."
      }
    ],
    "infographics": [
      {
        "url": "https://images.clinicalknowledge.org/microorganism/s_aureus_hand_hygiene_infographic.jpg",
        "alt": "Infográfico informativo ilustrado contendo o passo a passo sequencial dos movimentos de higienização das mãos segundo a OMS, acompanhado da indicação dos 5 Momentos Clínicos obrigatórios e das precauções de isolamento por contato para MRSA."
      }
    ],
    "videos": [
      {
        "url": "https://videos.clinicalknowledge.org/microorganism/s_aureus_biofilm_formation.mp4",
        "alt": "Animação tridimensional em vídeo ilustrando em alta resolução o mecanismo sequencial de adesão de Staphylococcus aureus a superfícies de cateteres plásticos de poliuretano, proliferação celular, produção de matriz de polissacarídeos e formação estruturada de biofilmes bacterianos resistentes."
      }
    ],
    "documents": [
      {
        "url": "https://documents.clinicalknowledge.org/microorganism/anvisa_manual_prevention_iras.pdf",
        "alt": "Documento técnico oficial em formato PDF do manual de prevenção de Infecções Relacionadas à Assistência à Saúde (IRAS) da ANVISA no Brasil, abordando diretrizes completas de controle de infecção e prevenção de IPCS."
      }
    ],
    "icons": [
      {
        "url": "https://icons.clinicalknowledge.org/microorganism/bacteria_staph_icon.png",
        "alt": "Ícone gráfico estilizado e simplificado de cocos agrupados em cacho representando a morfologia clássica de bactérias do gênero Staphylococcus."
      }
    ]
  },
  "accessibility": {
    "alt": "Coloração de Gram revelando cocos Gram-positivos organizados em agrupamentos semelhantes a cachos de uvas (Staphylococcus aureus).",
    "longDescription": "Esta imagem exibe uma visualização microscópica detalhada obtida sob microscopia eletrônica de varredura de alta resolução de Staphylococcus aureus, digitalmente colorida em dourado brilhante para refletir sua denominação clássica. As células apresentam formato esférico perfeito (cocos) medindo aproximadamente 1 micrômetro de diâmetro e estão organizadas em densas colônias tridimensionais compactas e irregulares que mimetizam cachos de uva. Essa estrutura espacial de agrupamento resulta da divisão celular bacteriana que ocorre em múltiplos planos ortogonais aleatórios sob os quais as células permanecem fixadas umas às outras após a citocinese incompleta devido à presença de adesinas de superfície.",
    "captions": [
      {
        "language": "pt-BR",
        "text": "Staphylococcus aureus em microscopia eletrônica colorida exibindo morfologia típica de cocos Gram-positivos organizados em cachos dourados."
      },
      {
        "language": "en",
        "text": "Staphylococcus aureus in colored electron microscopy displaying typical morphology of Gram-positive cocci in golden clusters."
      }
    ],
    "screenReaderSummary": "Esta ficha clínica digital apresenta informações abrangentes e detalhadas sobre o patógeno Staphylococcus aureus estruturada em padrão profissional CKO. Abrange taxonomia biológica, microbiologia e características de cultivo, dados epidemiológicos globais, vias de transmissão física e controle de vetores, patogenia e espectro de manifestações clínicas, determinantes moleculares de virulência e biossíntese de toxinas, métodos de diagnóstico laboratorial rápido e de imagem, perfis e mecanismos de resistência antibiótica (MSSA vs MRSA), protocolos de tratamento empírico e direcionado, e detalha de forma exaustiva as intervenções e cuidados de enfermagem baseados em evidência para coleta asséptica, isolamento, paramentação de EPIs, controle de infecções vasculares e monitorização contínua de sepse.",
    "highContrast": True,
    "colorBlindSafe": True
  },
  "sustainability": {
    "disposal": "O descarte correto de resíduos e espécimes biológicos potencialmente contaminados ou que contenham culturas vivas de Staphylococcus aureus deve seguir de forma estrita as normas técnicas nacionais de gerenciamento de resíduos de serviços de saúde (como as regras da RDC 222/2018 da ANVISA no Brasil). Todos os resíduos que entraram em contato com S. aureus pertencem ao Grupo A1 (resíduos com presença de agentes biológicos infectantes) e devem ser obrigatoriamente submetidos a processo físico de tratamento térmico por calor úmido sob pressão (autoclavagem a uma temperatura mínima de 121°C por um tempo mínimo de 30 a 60 minutos) ou processos de incineração em usinas licenciadas de resíduos perigosos antes de seu encaminhamento para descarte final em aterros sanitários regulamentados, garantindo a inativação biológica completa e irreversível do patógeno.",
    "recycling": "Os materiais plásticos descartáveis utilizados rotineiramente no ambiente de laboratório de microbiologia clínica para manipulação e isolamento de S. aureus (tais como placas de Petri plásticas de poliestireno, tubos Falcon de polipropileno, ponteiras de pipetas e tubos de microcentrífuga) não são passíveis de processos comuns de reciclagem direta devido ao risco de contaminação biológica por patógenos humanos multirresistentes. Estes materiais plásticos devem ser descartados como lixo biológico infectante e encaminhados para autoclave e posterior aterro sanitário específico licenciado para resíduos de alta periculosidade.",
    "environmentalRisk": "O descarte inadequado, negligente ou acidental de resíduos biológicos infectantes contendo Staphylococcus aureus mutáveis ou linhagens multirresistentes (como MRSA, VISA ou VRSA) em redes de esgoto doméstico comum, rios ou lixões a céu aberto acarreta elevado risco de contaminação e contaminação ambiental severa de ecossistemas aquáticos e solos, favorecendo a disseminação e transferência horizontal de cassetes móveis de genes de resistência aos antibióticos (como mecA ou vanA) para bactérias nativas da microbiota ambiental normal.",
    "packagingMaterial": "Os recipientes de acondicionamento utilizados para o transporte seguro de amostras biológicas humanas coletadas suspeitas de conter S. aureus devem seguir estritamente as regras de biossegurança de tripla embalagem: embalagem primária estanque estéril à prova de vazamentos (tubo plástico de polipropileno com tampa de rosca contendo o swab ou aspirado), embalagem secundária estanque protetora resistente a impactos mecânicos envolvendo o recipiente primário contendo materiais absorventes suficientes para reter todo o volume fluido em caso de quebra acidental, e caixa externa de transporte rígida resistente (papelão plastificado ou poliestireno rígido) contendo identificação oficial clara de risco biológico e rotulagem normativa correspondente.",
    "carbonFootprint": {
      "estimatedKgCO2e": 1.25,
      "method": "Estimativa calculada através de Análise de Ciclo de Vida (ACV) de berço ao portão (cradle-to-gate) considerando o consumo ponderado médio de energia elétrica das estufas de incubação bacteriana laboratoriais por 24 horas de cultivo, o consumo energético do processo de esterilização física em autoclave hospitalar vertical sob pressão, a fabricação industrial química de placas de plástico descartáveis e meios de cultura e o transporte refrigerado de reagentes microbiológicos por amostra clínica individual processada."
    }
  },
  "transparency": {
    "lastMedicalReview": "2026-07-26",
    "lastScientificReview": "2026-07-26",
    "evidenceLevel": "Nível 1A - Baseado em ensaios clínicos controlados randomizados de alta qualidade, diretrizes clínicas atualizadas de sociedades internacionais e nacionais de infectologia (IDSA, CDC, WHO, ANVISA, SBIm) e revisões sistemáticas da base Cochrane sobre prevenção de infecções vasculares e tratamento antimicrobiano.",
    "editorConflictOfInterest": "Nenhum conflito de interesse comercial, financeiro, institucional ou pessoal declarado pelos revisores médicos, revisores científicos, especialistas convidados da comissão de CCIH ou pela equipe de editores técnicos da CKO.",
    "sourcesVerified": True
  },
  "knowledge": {
    "clinicalPearls": [
      {
        "title": "Hemoculturas Positivas para S. aureus Nunca São Simples Contaminação",
        "content": "Diferente de estafilococos coagulase-negativos (como S. epidermidis), o crescimento de Staphylococcus aureus em QUALQUER hemocultura periférica deve ser considerado clinicamente representativo de bacteremia verdadeira ativa até que se prove exaustivamente o contrário. Jamais descarte o resultado como contaminação acidental da pele. Todo caso exige investigação sistemática imediata para localizar o foco primário da infecção (dispositivos vasculares, abscessos, articulações), a exclusão de endocardite infecciosa por ecocardiograma transesofágico (ETE) e o início imediato de antibioticoterapia intravenosa adequada por no mínimo 14 dias pós-negativação das culturas."
      },
      {
        "title": "Superioridade Clínica Absoluta de Beta-Lactâmicos Direcionados sobre Glicopeptídeos para MSSA",
        "content": "Para o tratamento de infecções sistêmicas invasivas e bacteremias causadas por cepas de Staphylococcus aureus sensíveis à meticilina (MSSA), os beta-lactâmicos direcionados estáveis (como a Oxacilina ou a Cefazolina) são clinicamente superiores à Vancomicina. Ensaios clínicos demonstram de forma consistente que a Vancomicina possui velocidade bactericida intrínseca mais lenta e está associada a taxas significativamente maiores de falha terapêutica, recorrência de bacteremia e mortalidade a curto prazo quando utilizada de forma inadequada em infecções por MSSA. A Vancomicina para MSSA deve ser restrita apenas a pacientes com história documentada de alergia anafilática grave à penicilina."
      },
      {
        "title": "Uso de Daptomicina Inviável em Pneumonia por S. aureus",
        "content": "Embora a Daptomicina seja um lipopeptídeo altamente bactericida de última geração contra cepas Gram-positivas resistentes, incluindo MRSA, ela sofre ligação física de alta afinidade e inativação química completa e imediata pelo surfactante lipídico pulmonar presente fisiologicamente no interior dos alvéolos humanos. Portanto, a Daptomicina apresenta eficácia clínica zero para o tratamento de pneumonias cavitárias, abscessos pulmonares ou empiemas estafilocócicos, sendo terminantemente proibida a sua utilização nessas infecções sob risco de falência terapêutica trágica."
      },
      {
        "title": "Relação Crítica de AUC/MIC para Monitoramento de Vancomicina",
        "content": "O monitoramento tradicional da Vancomicina baseado exclusivamente na dosagem sérica de vale (trough level) de 15 a 20 mcg/mL para infecções graves por MRSA foi substituído nas diretrizes internacionais de alta evidência pelo monitoramento baseado em parâmetros farmacocinéticos e farmacodinâmicos da Área Sob a Curva de concentração sérica dividida pela MIC (AUC/MIC de 24h). O objetivo terapêutico é atingir e manter de forma estável uma relação AUC/MIC entre 400 e 600 (assumindo uma MIC de vancomicina de até 1 mg/L). Essa meta otimiza a eficácia bactericida e reduz acentuadamente a ocorrência de insuficiência renal aguda secundária por nefrotoxicidade da droga."
      },
      {
        "title": "Ação Única de Inibidores de Síntese Proteica em Síndromes Toxigênicas",
        "content": "Em infecções estafilocócicas graves com importante componente inflamatório sistêmico mediado por toxinas e superantígenos (como a Síndrome do Choque Tóxico por TSST-1 ou pneumonia necrotizante portadora de PVL), a associação terapêutica de antibióticos inibidores da síntese proteica ribossomal bacteriana (como a Linezolida ou a Clindamicina) ao tratamento bactericida clássico (como oxacilina ou vancomicina) é altamente recomendada. Estes agentes interrompem de forma imediata a transcrição e tradução ribossomal de toxinas virulentas extracelulares antes mesmo que ocorra a lise bacteriana promovida pelos bactericidas de parede, reduzindo rapidamente a intensidade da tempestade de citocinas inflamatórias no paciente."
      }
    ],
    "nursingCare": [
      {
        "topic": "Técnica Avançada e Segura de Coleta de Hemoculturas Periféricas",
        "interventions": [
          "Preparação do Paciente e Sítio de Punção: 1) Explicar detalhadamente o procedimento ao paciente para diminuir a ansiedade e obter cooperação ativa; 2) Realizar a higiene básica das mãos do profissional de enfermagem com água e sabão líquido comum; 3) Localizar por inspeção visual e palpação a veia periférica adequada de calibre compatível (antecubital, basílica ou cefálica), posicionando o garrote de forma confortável (não manter o garrote por mais de 1 minuto consecutivo para evitar hemoconcentração local).",
          "Antissepsia Estrita de Três Etapas da Pele: 1) Calçar luvas de procedimento descartáveis e máscara cirúrgica protetora; 2) Realizar a antissepsia química rigorosa do sítio venoso selecionado em três fases consecutivas: primeiro, friccionar vigorosamente a pele em movimentos circulares com swab embebido em álcool a 70% por 30 segundos para remover a barreira lipídica superficial e detritos celulares; em seguida, aplicar solução estéril de Gluconato de Clorexidina alcoólica a 2% (ou degermante alcoólico correspondente) friccionando ativamente a pele em movimentos espirais concêntricos de dentro para fora cobrindo uma área mínima de 10x10 cm, e permitir que o antisséptico seque totalmente ao ar por pelo menos 30 a 60 segundos (NÃO assar, soprar ou tocar na veia desinfetada com dedos sem luvas estéreis de forma alguma após a antissepsia).",
          "Procedimento de Punção e Volume de Coleta: 1) Desinfetar vigorosamente a tampa de borracha exposta dos frascos de hemocultura utilizando swab de álcool a 70% e aguardar a secagem completa; 2) Realizar a punção asséptica direta utilizando um dispositivo escalpe de segurança a vácuo (evitando o uso de agulha e seringa convencional para diminuir riscos de acidentes biológicos e de contaminação na transferência de sangue); 3) Coletar o sangue conectando o escalpe diretamente aos frascos de hemocultura de forma vertical estável, preenchendo o frasco aeróbio em primeiro lugar (para evitar que o ar contido no tubo do escalpe entre no frasco anaeróbio); 4) Controlar rigorosamente o volume coletado através das marcações milimetradas do frasco, garantindo a coleta de 8 a 10 mL de sangue por frasco em adultos (1 a 3 mL em frascos pediátricos específicos) - volumes inadequados reduzem a sensibilidade diagnóstica; 5) Desativar o dispositivo de segurança do escalpe imediatamente após a retirada e descartar o perfurocortante diretamente em caixa rígida amarela Descarpack de descarte rápido.",
          "Identificação e Transporte Imediato: 1) Homogeneizar suavemente os frascos de hemocultura por inversão de 8 a 10 vezes; 2) Identificar cada frasco à beira do leito do paciente imediatamente após a coleta escrevendo o nome completo do paciente, registro hospitalar único, data e hora exatas da coleta, nome legível do profissional e o sítio anatômico específico de punção periférica (ex. MSE antecubital), garantindo que a etiqueta não cubra o código de barras original do frasco; 3) Enviar os frascos imediatamente ao laboratório de microbiologia clínica à temperatura ambiente (NUNCA refrigerar ou congelar frascos de hemocultura de forma alguma sob risco de inviabilizar o crescimento inicial bacteriano)."
        ]
      },
      {
        "topic": "Implementação e Gerenciamento de Precauções de Isolamento por Contato para MRSA/VRSA",
        "interventions": [
          "Sinalização e Alocação de Quarto: 1) Instituir de imediato o isolamento físico do paciente após confirmação laboratorial ou molecular de colonização/infecção por MRSA ou VRSA; 2) Alocar o paciente preferencialmente em quarto privativo individual com banheiro exclusivo, mantendo a porta do quarto fechada e com cartaz sinalizador padronizado de 'Precaução de Contato' afixado de forma visível na porta de entrada; 3) Em situações de total indisponibilidade de leitos individuais, realizar o isolamento por coorte (reunindo no mesmo quarto exclusivamente pacientes colonizados ou infectados pelo mesmo patógeno MRSA com perfil de sensibilidade idêntico), mantendo um distanciamento mínimo físico de 1 metro entre os leitos e cortinas divisórias puxadas.",
          "Restrição e Gerenciamento de Equipamentos Médicos: 1) Disponibilizar dispositivos clínicos básicos de uso EXCLUSIVO à beira do leito do paciente isolado (incluindo estetoscópio, esfigmomanômetro com manguito de tamanho adequado, termômetro eletrônico e oxímetro de pulso periférico); 2) Estes equipamentos devem permanecer no interior do quarto durante todo o período de isolamento e serem submetidos a processo rigoroso de desinfecção terminal com álcool a 70% após a alta hospitalar do paciente; 3) Equipamentos de uso compartilhado inevitáveis (como bombas de infusão, eletrocardiógrafos, aparelhos de ultrassonografia portátil e grades de leito) devem ser exaustivamente desinfetados quimicamente com desinfetante hospitalar de nível intermediário imediatamente após cada uso individual antes de serem removidos do quarto.",
          "Uso Correto de Barreiras Protetoras e Fluxo de Entrada/Saída: 1) Fornecer uma estação de higiene de mãos na entrada do quarto contendo dispensador de álcool gel gel a 70%; 2) Todos os profissionais de saúde, prestadores de serviço e visitantes devem obrigatoriamente realizar a higienização das mãos e vestir avental de manga longa descartável impermeável de TNT (gramatura >=30g/m²) e calçar luvas de procedimento descartáveis limpas imediatamente antes de adentrar ao quarto do paciente ou tocar em qualquer superfície do leito; 3) Prestar a assistência integrada de enfermagem programando as atividades para minimizar o fluxo de entrada e saída; 4) Retirar toda a paramentação protetora (luvas e avental) imediatamente antes de sair do quarto do paciente, descartando-a de forma correta e asséptica em coletor de resíduos biológicos infectantes acionado por pedal e revestido com saco plástico vermelho localizado dentro do quarto próximo à porta; 5) Realizar imediatamente a higiene terminal das mãos com álcool gel a 70% ou sabonete antisséptico e água corrente na pia de saída imediatamente após a retirada dos EPIs."
        ]
      },
      {
        "topic": "Sequência Segura e Padronizada de Paramentação (Donning) e Desparamentação (Doffing) de EPIs",
        "interventions": [
          "Sequência de Paramentação (Donning - Executada antes de entrar no quarto de isolamento): 1) Remover todos os adornos pessoais de mãos e punhos (anéis, pulseiras, relógio); 2) Realizar a higiene completa e rigorosa das mãos com álcool gel 70% ou água e sabão por 40-60 segundos; 3) Vestir o avental descartável de proteção de manga longa cobrindo completamente o tronco do pescoço aos joelhos, amarrando com firmeza as tiras protetoras atrás do pescoço e na cintura de forma a não deixar aberturas; 4) Colocar a máscara cirúrgica tripla ou o respirador N95/PFF2 ajustando as tiras elásticas atrás das orelhas ou cabeça, moldando firmemente o clipe nasal de metal sobre o septo nasal e realizando o teste de vedação por sopro para garantir ausência de vazamento de ar; 5) Colocar os óculos de proteção ocular ou escudo facial (shield) ajustando-os confortavelmente à face de modo que cubram a região dos olhos e testas; 6) Calçar as luvas de procedimento descartáveis, ajustando-as bem aos dedos e estendendo os punhos elásticos das luvas sobre as mangas do avental descartável, garantindo que não haja exposição de pele nos punhos.",
          "Sequência de Desparamentação (Doffing - Executada antes de sair do quarto de isolamento): 1) Retirar as luvas de procedimento descartáveis (que representam a superfície mais densamente contaminada por secreções bacterianas): pinçar a parte externa de uma das luvas perto do punho com a mão oposta enluvada sem tocar na pele, puxar para fora virando a luva do avesso, segurar a luva removida com a mão que permanece enluvada, deslizar os dedos da mão sem luva por baixo do punho da luva restante sem tocar na superfície externa contaminada, puxar para fora virando a luva também do avesso de modo a formar um pacote fechado e descartá-las imediatamente na lixeira de resíduo infectante saco vermelho; 2) Realizar imediata fricção antisséptica das mãos com álcool gel 70%; 3) Remover o avental descartável desamarrando as tiras traseiras com cuidado para não tocar nas superfícies anteriores do avental, puxar o avental a partir do pescoço e ombros sem tocar na parte externa da frente (que está altamente contaminada), dobrá-lo ou enrolá-lo de dentro para fora formando um pacote compacto com o lado limpo interno voltado para fora, descartando na lixeira de resíduos infectantes saco vermelho; 4) Realizar higiene das mãos novamente com álcool gel; 5) Remover os óculos de proteção ou protetor facial pegando exclusivamente nas hastes laterais ou elásticos traseiros sem tocar na lente frontal contaminada, colocando em recipiente adequado para posterior desinfecção pelo serviço de expurgo; 6) Remover a máscara de proteção protetora pegando exclusivamente nos elásticos ou tiras traseiras sem tocar na superfície frontal da máscara, descartando na lixeira infectante saco vermelho; 7) Realizar a lavagem terminal rigorosa das mãos com sabão líquido antisséptico e água corrente até a altura dos punhos, secando com papel-toalha descartável de folha dupla e utilizando o papel para fechar a torneira de acionamento manual."
        ]
      },
      {
        "topic": "Higiene de Mãos Baseada nas Diretrizes Globais dos 5 Momentos da OMS",
        "interventions": [
          "Momento 1 - Antes de Tocar o Paciente: Realizar higienização completa das mãos imediatamente antes de tocar física e diretamente no paciente (ex. ao realizar aperto de mãos de cortesia, aferir pulso radial, realizar palpação abdominal, reposicionar o paciente no leito, aferir pressão arterial ou realizar exame físico do tórax), protegendo o paciente contra a transmissão indesejada de microrganismos patogênicos externos presentes temporariamente nas mãos do profissional de saúde.",
          "Momento 2 - Antes de Realizar Procedimentos Assépticos: Realizar higiene rigorosa das mãos imediatamente antes de executar qualquer procedimento que envolva quebra de barreira cutânea ou contato com mucosas (ex. punção venosa periférica, inserção de cateter de oxigênio nasal, realização de curativo de ferida cirúrgica ou escara, administração de medicamentos por via parenteral ou intravenosa direta, manipulação de linhas de infusão), protegendo o paciente contra a introdução forçada de patógenos bacterianos (como S. aureus colonizador da pele íntegra) nos seus tecidos profundos estéreis.",
          "Momento 3 - Após Risco de Exposição a Fluidos Corporais: Realizar higienização rigorosa das mãos imediatamente após a conclusão de qualquer procedimento assistencial que apresente potencial risco de contato físico com sangue, pus de feridas, secreções purulentas de abscessos, urina, fezes ou outros fluidos biológicos (ex. aspiração de vias aéreas endotraqueal, manipulação de frascos de drenagem torácica ou abdominal, esvaziamento de bolsas coletoras de diurese, coleta de espécimes laboratoriais), mesmo que luvas descartáveis protetoras tenham sido utilizadas de forma contínua durante a atividade, com o objetivo de proteger o próprio profissional de saúde e o ambiente assistencial contra contaminações biológicas cruzadas.",
          "Momento 4 - Após Tocar o Paciente: Realizar higienização das mãos imediatamente após tocar física e diretamente no paciente ao concluir exames físicos, prestar cuidados diretos de higiene ou reposicionamento no leito, protegendo a si próprio e impedindo a dispersão de microrganismos de alta persistência (como o MRSA) para os leitos vizinhos.",
          "Momento 5 - Após Tocar Superfícies Próximas ao Paciente: Realizar higienização das mãos imediatamente após tocar em qualquer objeto inanimado, fômite ou superfície localizada no quarto ou área do leito do paciente (ex. grades de segurança do leito, mesas de cabeceira, bombas de infusão contínua, lençóis, fronhas de travesseiro, controles de bomba, botões de chamada do leito), mesmo que não tenha ocorrido nenhum tipo de contato físico direto com o corpo do paciente, para prevenir de forma proativa a dispersão ambiental de bactérias de alta persistência como o MRSA."
        ]
      },
      {
        "topic": "Monitoramento Clínico Sistemático para Prevenção e Detecção Precoce de Sepse e Choque Séptico",
        "interventions": [
          "Avaliação Contínua e Frequente de Sinais Vitais: Mensurar de forma rigorosa e registrar em prontuário a frequência cardíaca (FC), frequência respiratória (FR), pressão arterial não invasiva (PA), temperatura axilar e saturação periférica de oxigênio (SpO2) a cada 2 horas em pacientes com infecções estafilocócicas agudas ativas ou com dispositivos vasculares profundos. Ficar em alerta permanente para a detecção de sinais de alarme precoces de resposta inflamatória sistêmica grave e disfunção orgânica inicial: taquicardia sinusal persistente (FC >90 bpm), taquipneia compensatória (FR >20 irpm), hipertermia (T >38,3°C) ou hipotermia paradoxal de pior prognóstico clínico (T <36°C).",
          "Rastreio Sistemático de Sinais de Hipoperfusão Tecidual e Choque Circulatório: 1) Monitorar o débito urinário horário de forma extremamente rigorosa por meio de cateter vesical de demora acoplado a urômetro fechado em pacientes críticos, alertando de imediato à equipe médica de plantão em caso de desenvolvimento de oligúria severa (débito urinário inferior a 0,5 mL/kg/hora por duas horas consecutivas); 2) Avaliar minuciosamente o estado de alerta, nível de consciência e função cognitiva à beira do leito (o aparecimento súbito de confusão mental aguda, agitação psicomotora inexplicável, letargia ou torpor constituem sinais precoces de hipoperfusão cerebral sistêmica por choque séptico incipiente); 3) Avaliar a perfusão tecidual periférica através de palpação física constante de extremidades do paciente (frias, pálidas ou pegajosas) e aferir o Tempo de Enchimento Capilar (TEC) periférico (um TEC prolongado superior a 3 segundos indica perfusão microvascular inadequada); 4) Acompanhar ativamente e monitorar os exames de dosagem sérica de lactato arterial (níveis de lactato sérico superiores a 2,0 mmol/L indicam sofrimento celular, metabolismo anaeróbico tecidual agudo e exigem intervenção clínica imediata).",
          "Aplicação de Escores de Alerta Precoce (qSOFA e SOFA): Aplicar sistematicamente de forma beira-leito os critérios de triagem rápida do Escore qSOFA diante de qualquer paciente com suspeita ou confirmação de infecção estafilocócica ativa: 1) Frequência respiratória igual ou superior a 22 incursões respiratórias por minuto; 2) Alteração aguda de nível de consciência (Glasgow <15); 3) Pressão arterial sistólica igual ou inferior a 100 mmHg. A constatação de 2 ou mais critérios positivos de qSOFA indica forte suspeita clínica de disfunção de órgãos induzida por sepse, exigindo abertura imediata do Protocolo de Sepse institucional com coleta imediata de lactato, gasometria arterial e hemoculturas pareadas adicionais, e início hyperagudo de ressuscitação volêmica vigorosa intravenosa utilizando cristaloides isotônicos (Soro Fisiológico a 0,9% ou Ringer Lactato) na proporção de 30 mL/kg de peso corporal infundidos rapidamente nas primeiras 3 horas de atendimento clínico."
        ]
      },
      {
        "topic": "Gerenciamento Clínico Seguro de Antibioticoterapia e Farmacovigilância de Enfermagem",
        "interventions": [
          "Administração Segura de Vancomicina Intravenosa: 1) Verificar minuciosamente a prescrição médica e os resultados de exames de função renal mais recentes (creatinina sérica e taxa de filtração glomerular estimada); 2) Realizar a diluição rigorosa do pó liofilizado da Vancomicina estritamente de acordo com as instruções do fabricante (utilizar de 100 mL a 250 mL de Soro Fisiológico a 0,9% ou Soro Glicosado a 5%, garantindo que a concentração final do medicamento na solução não ultrapasse o limite de 5 mg/mL para minimizar de forma drástica o risco de indução de flebite química severa, irritação vascular local e necrose tecidual em caso de extravasamento acidental periférico); 3) Infundir a dose diluída de Vancomicina de forma estritamente controlada através de bomba de infusão contínua programada para durar no mínimo 60 minutos por grama de droga administrado (ex. infundir uma dose de 1 g de vancomicina em pelo menos 60 a 90 minutos, e doses de 1,5 g ou 2 g em 90 a 120 minutos); 4) Respeitar a velocidade de infusão lenta é uma conduta de segurança indispensável para evitar a liberação sistêmica descontrolada e hyperaguda de histamina pelos mastócitos, causadora da 'Síndrome do Homem Vermelho' (Red Man Syndrome), caracterizada clinicamente por prurido severo, eritema macular difuso (pele vermelha brilhante) que acomete face, pescoço, tórax e membros superiores, comumente associada a hipotensão arterial sistêmica severa e broncoespasmo; 5) Monitorar sinais vitais (pressão arterial e frequência cardíaca) do paciente durante toda a infusão; 6) Se ocorrer a reação histamínica, interromper a infusão imediatamente, notificar o médico responsável, preparar a administração imediata de anti-histamínicos conforme prescrição e reiniciar a infusão após estabilização clínica com taxa de infusão reduzida pela metade; 7) Coleta de Amostra para Farmacocinética (Nível de Vale sérico / Trough Level): Programar e garantir com a equipe de laboratório a coleta de sangue periférico para dosagem de nível de vale sérico de vancomicina imediatamente antes (de 15 a 30 minutos) da administração da 4ª ou 5ª dose consecutiva do antimicrobiano (estado de equilíbrio dinâmico farmacocinético). O nível sérico ideal para infecções estafilocócicas graves por MRSA deve ser mantido estavelmente entre 15 e 20 mcg/mL.",
          "Administração Segura de Oxacilina Intravenosa: 1) Administrar a Oxacilina de forma estritamente pontual nos horários prescritos respeitando os intervalos rígidos estabelecidos (frequentemente a cada 4 horas) devido ao perfil farmacodinâmico tempo-dependente e meia-vida biológica curta do medicamento; 2) Realizar a infusão intermitente da Oxacilina (diluída em 100 mL de SF 0,9%) em 30 a 60 minutos por via intravenosa; 3) Monitorar atentamente o sítio de inserção do cateter venoso periférico, pois a oxacilina é altamente irritante para a íntima dos vasos sanguíneos, apresentando altíssimo risco de tromboflebite induzida quimicamente; 4) Monitorar exames laboratoriais de perfil hepático (transaminases) e hematológico (leucograma) devido ao risco documentado de hepatite medicamentosa dose-dependente reversível e neutropenia induzida por penicilinas de espectro expandido em uso prolongado."
        ]
      },
      {
        "topic": "Prevenção Ativa de IPCS e Cuidados com Cateteres Venosos Centrais (CVC) e PICC",
        "interventions": [
          "Manutenção de Cateteres sob Técnica Asséptica: 1) Realizar a fricção vigorosa das conexões e hubs de infusão (conectores multivias, torneirinhas) com swab embebido em álcool a 70% por pelo menos 15 segundos antes de qualquer manipulação, permitindo a secagem completa ao ar (técnica de desinfecção ativa por fricção ou 'scrub the hub'); 2) Avaliar diariamente a necessidade clínica de permanência do cateter venoso central (CVC), discutindo com a equipe médica a remoção precoce do dispositivo se o mesmo não for mais indispensável, o que constitui a medida mais eficaz na redução de infecções de corrente sanguínea; 3) Realizar curativos em CVC sob técnica estéril estrita: utilizar máscara cirúrgica por profissional e paciente, luvas estéreis, campo estéril e realizar a antissepsia de pele com Clorexidina alcoólica a 0,5% ou degermante alcoólico em movimentos de fricção vaivém por 30 segundos, permitindo secar completamente; 4) Preferir curativos transparentes de poliuretano com película semipermeável semipermeável que permitam a inspeção diária contínua do sítio de inserção do cateter sem necessidade de remoção periódica; 5) Substituir o curativo transparente de poliuretano a cada 7 dias (ou imediatamente se apresentar sujidade, umidade, descolamento de bordas ou presença de sangue); 6) Utilizar curativo impregnado com gel de clorexidina para proteção adicional em pacientes com cateteres venosos centrais de longa permanência ou de alto risco; 7) Ficar atento a sinais flogísticos no óstio do cateter (rubor, calor, edema, secreção purulenta ativa ou dor local), reportando imediatamente à equipe médica de infecção hospitalar.",
          "Prevenção de Infecções Relacionadas a Cateter de Inserção Periférica (PICC): 1) Manter os mesmos cuidados assépticos de hubs e conectores aplicados ao CVC; 2) Monitorar o trajeto venoso periférico no braço do paciente para detecção precoce de sinais de tromboflebite ou celulite associada; 3) Realizar curativos de manutenção e fixação com dispositivo adesivo específico de ancoragem sem suturas (como StatLock) para evitar micromovimentações de pistoneamento do cateter no óstio, o que predispõe à entrada de bactérias como Staphylococcus aureus da pele para o interior do trajeto venoso."
        ]
      },
      {
        "topic": "Educação em Saúde para Pacientes, Cuidadores e Familiares",
        "interventions": [
          "Orientações sobre Prevenção de Transmissão Comunitária: 1) Instruir detalhadamente o paciente e seus familiares sobre a importância crucial e a técnica correta de higienização das mãos com água e sabonete em ambiente domiciliar, especialmente antes de preparar alimentos, após usar o banheiro, e antes e depois de realizar curativos em lesões cutâneas; 2) Enfatizar a proibição absoluta de compartilhamento de itens de uso pessoal que entram em contato direto com a pele, tais como toalhas de banho, lençóis, sabonetes em barra, lâminas de barbear, roupas de dormir e equipamentos de prática esportiva, os quais devem ser lavados individualmente com água quente e sabão comum; 3) Orientar sobre o cuidado correto com feridas, cortes e escoriações cutâneas: mantê-las limpas e cobertas com curativo protetor seco e impermeável até a cicatrização completa, evitando expor feridas abertas ao contato com superfícies comunitárias de alto toque (ex. academias, piscinas, transportes públicos); 4) Alertar o paciente para nunca realizar a automedicação e para cumprir rigorosamente o curso completo de antibióticos orais prescritos pelo médico, mesmo que ocorra desaparecimento completo dos sintomas e melhora das lesões cutâneas, com o fim de evitar a seleção de cepas estafilocócicas multirresistentes.",
          "Educação em Saúde para Portadores de MRSA/VRSA em Alta Hospitalar: 1) Esclarecer de forma humanizada e científica que a colonização por MRSA significa apenas a presença da bactéria na pele ou nariz sem causar doença ativa, não sendo motivo de pânico ou estigmatização social; 2) Orientar sobre as medidas básicas de higiene domiciliar, como a lavagem diária de roupas e troca periódica de roupas de cama; 3) Instruir o paciente a informar que é portador de MRSA em qualquer atendimento de saúde subsequente (consultas odontológicas, novos atendimentos de urgência ou internações), garantindo que medidas de precaução adequadas sejam adotadas preemptivamente pela equipe receptora."
        ]
      }
    ],
    "patientEducation": [
      {
        "title": "O que é o Staphylococcus aureus?",
        "instructions": "O Staphylococcus aureus é uma bactéria extremamente comum que vive naturalmente na pele ou nas narinas de cerca de 20% a 30% das pessoas saudáveis sem causar nenhum tipo de problema ou sintoma - um estado conhecido como 'colonização'. No entanto, se essa bactéria conseguir penetrar no organismo através de um corte na pele, ferida cirúrgica, queimadura ou por meio de um dispositivo médico invasivo (como um cateter de soro na veia), ela pode causar infecções. Estas infecções podem variar de quadros simples e autolimitados na pele (como espinhas, furúnculos e abscessos) até infecções profundas muito graves e potencialmente fatais (como infecções na corrente sanguínea, pneumonia necrotizante, infecção nos ossos ou nas valvas do coração)."
      },
      {
        "title": "O que significa ser portador de 'MRSA' (Staphylococcus resistente à meticilina)?",
        "instructions": "Com o passar dos anos e o uso descontrolado de antibióticos comuns, algumas linhagens de Staphylococcus aureus sofreram mutações genéticas e tornaram-se resistentes à maioria dos antibióticos comuns da família da penicilina (como amoxacilina, cefalexina, ampicilina e oxacilina). Estas bactérias resistentes são denominadas 'MRSA' (Staphylococcus aureus resistente à meticilina). Elas não são necessariamente 'mais agressivas' ou 'mais venenosas' do que as outras bactérias de Staphylococcus comuns, mas o seu tratamento clínico é mais complexo porque exige o uso de antibióticos especiais específicos de resguardo hospitalar. Se o seu exame de cultura ou triagem nasal apontar a presença de MRSA, a equipe assistencial adotará medidas de 'Precaução de Contato' para impedir a transmissão cruzada da bactéria para outros pacientes do hospital."
      },
      {
        "title": "Por que a equipe do hospital usa capote/avental e luvas para entrar no meu quarto?",
        "instructions": "Se você estiver colonizado ou infectado com a bactéria MRSA, todos os profissionais de saúde e prestadores de serviços usarão avental descartável de manga longa e luvas de procedimento para realizar o seu atendimento clínico direto ou tocar em superfícies do seu leito. Essa medida protetora serve exclusivamente para impedir que a bactéria MRSA seja levada nas mãos ou roupas dos profissionais até outros pacientes internados na mesma instituição, que frequentemente encontram-se fracos, debilitados ou com o sistema imunológico comprometido e poderiam desenvolver infecções graves caso entrassem em contato com a bactéria. Essa precaução não significa que você precise ficar isolado do convívio familiar ou que possua uma doença contagiosa perigosa transmitida pelo ar. Suas visitas e acompanhantes familiares também devem higienizar as mãos rigorosamente com álcool em gel gel 70% antes de entrar e ao sair do quarto."
      },
      {
        "title": "Cuidados práticos fundamentais que você deve ter em casa para evitar a transmissão da bactéria:",
        "instructions": "1) Realize a higienização das mãos frequentemente utilizando sabão líquido e água corrente ou álcool em gel gel 70%, especialmente antes de preparar alimentos ou comer, após usar o banheiro, e antes e imediatamente após mexer em qualquer curativo de ferida; 2) Mantenha todos os cortes, feridas, arranhões ou escoriações na pele perfeitamente limpos e cobertos com um curativo protetor seco e limpo até a cicatrização completa, impedindo a exposição da ferida; 3) Não compartilhe sob nenhuma circunstância objetos de uso pessoal íntimo como toalhas de banho ou rosto, panos de prato, lençóis, fronhas de travesseiro, sabonetes em barra, lâminas de barbear, roupas de dormir e esponjas de banho; 4) Lave as suas roupas de uso pessoal, roupas de cama e toalhas de banho na máquina de lavar utilizando sabão comum e, se possível, seque em temperatura quente ou passe a ferro quente; 5) Tome todos os antibióticos prescritos pelo seu médico exatamente nos horários recomendados e cumpra todo o curso do tratamento prescrito até o fim, mesmo que você já esteja se sentindo ótimo e sem sintomas nas feridas de pele. Parar o antibiótico antes da hora pode fazer com que as bactérias sobreviventes fiquem ainda mais fortes e resistentes."
      }
    ],
    "frequentlyAskedQuestions": [
      {
        "question": "Como posso saber se um furúnculo ou infecção na pele é causada por Staphylococcus aureus?",
        "answer": "O diagnóstico de certeza laboratorial só pode ser estabelecido coletando uma amostra do pus ou exsudato da ferida por meio de um exame de cultura bacteriana clássica em laboratório de análises clínicas. Clinicamente, infecções de pele por S. aureus costumam ter início muito rápido e agudo, caracterizando-se por dor localizada intensa, calor na área afetada, vermelhidão importante e, de forma clássica, a formação rápida de secreção purulenta (pus) espessa, amarelada e cremosa no centro da lesão, que muitas vezes necessita de drenagem."
      },
      {
        "question": "O Staphylococcus aureus pode ser transmitido pelo ar, como em uma gripe?",
        "answer": "Geralmente não. A via de transmissão primária e quase exclusiva do S. aureus é por contato físico direto (pele com pele, mãos contaminadas) ou por contato indireto através de superfícies clínicas e objetos inanimados contaminados (fômites). A transmissão respiratória por gotículas suspensas é extremamente rara e só ocorre em condições críticas muito específicas, como em pacientes hospitalizados com pneumonia estafilocócica ativa grave com tosse produtiva intensa sob intubação traqueal e ventilação mecânica."
      },
      {
        "question": "Qual é o perigo real da automedicação em infecções de pele suspeitas por Staph?",
        "answer": "A automedicação, especialmente o uso inadequado de pomadas antibióticas sem prescrição ou a tomada de comprimidos de antibióticos orais em doses e tempos insuficientes, é uma das principais causas de seleção de resistência e disseminação global de bactérias multirresistentes como o MRSA. Além de não curar a infecção profunda (que muitas vezes exige desbridamento e drenagem cirúrgica do abscesso para obter a cura, e não apenas remédio), o uso incorreto de antimicrobianos elimina a microbiota normal protetora da pele e favorece o crescimento descontrolado das cepas estafilocócicas resistentes."
      },
      {
        "question": "Pacientes com infecção por MRSA podem receber visitas no hospital?",
        "answer": "Sim. Pacientes em isolamento de precaução de contato por MRSA podem receber visitas de familiares e amigos de forma humanizada. No entanto, os visitantes devem seguir rigidamente as instruções de controle de infecção estabelecidas pela instituição: higienizar as mãos com álcool gel a 70% antes e depois de entrar no quarto, evitar sentar-se na cama do paciente ou tocar em superfícies do leito sem necessidade e usar capote/avental descartável e luvas de proteção disponibilizadas pela enfermagem na entrada do quarto."
      },
      {
        "question": "O que é descolonização e quem precisa fazer?",
        "answer": "Descolonização é um procedimento terapêutico profilático de curta duração que visa eliminar ou reduzir de forma acentuada a carga microbiana de Staphylococcus aureus das narinas anteriores e da pele de pessoas identificadas como portadoras saudáveis assintomáticas. Consiste na aplicação de pomada antibiótica nasal de mupirocina a 2% combinada com banhos diários de clorexidina a 2% por 5 dias consecutivos. Ela é indicada exclusivamente para grupos de alto risco: pacientes que vão passar por cirurgias eletivas limpas de grande porte com colocação de próteses ou implantes (cardíacas, ortopédicas e neurocirurgias) para evitar infecção pós-operatória profunda de origem endógena, ou para pacientes de UTI e indivíduos com infecções recorrentes graves por CA-MRSA na comunidade."
      }
    ],
    "clinicalCases": [
      {
        "title": "Caso Clínico 1: Bacteremia por MRSA Associada a Cateter Venoso Central em UTI",
        "description": "Paciente J.M.S., 58 anos, masculino, internado em Unidade de Terapia Intensiva (UTI) há 12 dias para recuperação de cirurgia abdominal de grande porte devido a abdome agudo obstrutivo. Em uso de Cateter Venoso Central (CVC) multilúmen inserido em veia subclávia direita desde a admissão. No 10º dia de internação, o paciente apresentou picos febris agudos de 38,9°C acompanhados de calafrios, taquicardia (110 bpm), taquipneia (24 irpm) e hipotensão arterial leve (PAS 95 mmHg). Ao exame físico, o enfermeiro identificou discreto eritema (vermelhidão) e secreção seropurulenta escassa ao redor do óstio de inserção do CVC subclávio direito. Foram coletados imediatamente dois pares de hemoculturas de veias periféricas e um par de hemocultura através do lúmen do CVC subclávio, além de hemograma e dosagem de lactato arterial. O cateter central foi removido asséptica e cirurgicamente, enviando-se a ponta do cateter de 5 cm para cultura microbiológica quantitativa (técnica de Maki). Iniciou-se imediatamente antibioticoterapia empírica intravenosa com Vancomicina ajustada para a função renal. Resultados laboratoriais após 18 horas revelaram o crescimento de cocos Gram-positivos em cachos nas três garrafas de hemocultura de veia periférica e do cateter, confirmando bacteremia por Staphylococcus aureus resistente à meticilina (MRSA) com MIC de vancomicina de 1,5 mcg/mL. A cultura quantitativa da ponta do cateter foi positiva para MRSA com contagem superior a 15 unidades formadoras de colônias (UFC). O ecocardiograma transesofágico (ETE) realizado no 3º dia de bacteremia descartou a presença de vegetações valvares cardíacas ativas, confirmando tratar-se de bacteremia estafilocócica não complicada associada a dispositivo venoso. O enfermeiro implementou de forma rigorosa as Precauções de Contato para MRSA no quarto privativo, monitorou de hora em hora o débito urinário e os sinais vitais, realizou a coleta de nível de vale de vancomicina na 4ª dose (registrando 16,5 mcg/mL - dentro da faixa terapêutica ideal) e prestou cuidados estritos ao novo acesso vascular periférico profundo. O paciente evoluiu com estabilização hemodinâmica completa, defervescência da febre após 48 horas de tratamento ativo e obtenção de hemoculturas de controle repetidas negativas. O tratamento intravenoso direcionado com vancomicina foi mantido de forma bem-sucedida pelo período de 14 dias pós-negativação das culturas, recebendo alta hospitalar estável."
      },
      {
        "title": "Caso Clínico 2: Infecção de Tecido Mole por CA-MRSA com Toxina de Panton-Valentine na Comunidade",
        "description": "Paciente L.C.A., 22 anos, feminina, atleta amadora de crossfit, compareceu ao ambulatório de infectologia com queixa de lesão nodular extremamente dolorosa, eritematosa e flutuante na região glútea direita há 4 dias. Relata que a lesão iniciou-se como um pequeno ponto semelhante a uma 'picada de inseto' que evoluiu rapidamente para um nódulo quente, volumoso e com intensa dor local que a impedia de sentar-se ou realizar atividades diárias comuns, acompanhada de febre não medida e mal-estar geral. Ao exame físico, apresentava um abscesso de aproximadamente 6x5 cm em glúteo direito, com área de flutuação central importante, calor local intenso, hiperemia periférica e linfadenopatia inguinal dolorosa ipsilateral. Sinais vitais estáveis: PA 115/70 mmHg, FC 82 bpm, FR 16 irpm, T 37,8°C. O cirurgião geral realizou de forma asséptica a incisão e drenagem ampla do abscesso glúteo à beira do leito, evacuando cerca de 50 mL de pus espesso, amarelo-esverdeado e sanguinolento. Uma amostra do pus coletado por aspiração direta de agulha antes da lavagem foi enviada para coloração de Gram e cultura bacteriana quantitativa. A cavidade do abscesso foi exaustivamente lavada com soro fisiológico a 0,9%, realizando-se o curativo com compressas de gaze embebidas em solução salina estéril e fita microporosa. Iniciou-se tratamento antibiótico empírico por via oral com Sulfametoxazol-Trimetoprima (800 mg/160 mg), um comprimido a cada 12 horas por 10 dias, devido à suspeita clínica de infecção por CA-MRSA (comunitário). A coloração de Gram do pus revelou abundantes cocos Gram-positivos agrupados em cachos e inúmeros leucócitos íntegros e degenerados (neutrófilos). Após 24 horas, a cultura de ágar sangue revelou colônias amarelo-douradas beta-hemolíticas identificadas bioquimicamente como Staphylococcus aureus. O perfil de antibiograma confirmou resistência apenas à Oxacilina/Cefoxitina e Penicilina G, mantendo sensibilidade preservada à clindamicina, sulfametoxazol-trimetoprima, doxiciclina, linezolida e fluoroquinolonas, caracterizando o padrão fenotípico clássico de CA-MRSA. O teste molecular por PCR em tempo real confirmou a presença do gene mecA e do gene codificador da leucocidina de Panton-Valentine (PVL), responsável pela intensa necrose tecidual e dor local exacerbada. A enfermagem realizou curativos diários com técnica de empacotamento frouxo de gaze estéril úmida na cavidade, orientou detalhadamente a paciente quanto aos cuidados domiciliares rigorosos (higiene das mãos, proibição de compartilhar toalhas de banho ou roupas com familiares e uso de sabonetes antissépticos), além de fornecer educação detalhada sobre o cumprimento completo do tratamento antibiótico. A ferida cirúrgica apresentou excelente tecido de granulação saudável em sua base com redução total do exsudato inflamatório, cicatrizando completamente por segunda intenção sem novas intercorrências ou recorrências após 3 semanas."
      }
    ]
  },
  "references": {
    "guidelines": [
      {
        "title": "Clinical Practice Guidelines by the Infectious Diseases Society of America (IDSA) for the Treatment of Methicillin-Resistant Staphylococcus aureus (MRSA) Infections in Adults and Children",
        "url": "https://www.idsociety.org/practice-guideline/mrsa/"
      },
      {
        "title": "Manual de Prevenção de Infecção Primária de Corrente Sanguínea Associada a Cateter Venoso Central - ANVISA",
        "url": "https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/manuais/manual-de-prevencao-de-ipcs.pdf"
      },
      {
        "title": "WHO Guidelines on Hand Hygiene in Health Care - First Global Patient Safety Challenge Clean Care is Safer Care",
        "url": "https://www.who.int/publications/i/item/9789241597906"
      }
    ],
    "articles": [
      {
        "title": "Staphylococcus aureus Bacteremia: Joint Clinical Practice Guidelines and Recommendations",
        "journal": "Lancet Infectious Diseases",
        "year": 2025,
        "doi": "10.1016/S1473-3099(25)00112-X"
      },
      {
        "title": "Efficacy of Chlorhexidine Gluconate Bathing for MRSA Prevention in Intensive Care Units: A Systematic Review and Meta-Analysis",
        "journal": "Journal of Hospital Infection",
        "year": 2024,
        "doi": "10.1016/j.jhin.2024.03.015"
      },
      {
        "title": "Whole-Genome Sequencing for Racking MRSA Transmission in Critical Care Settings",
        "journal": "Journal of Clinical Microbiology",
        "year": 2024,
        "doi": "10.1128/jcm.00234-24"
      }
    ],
    "manufacturer": [
      {
        "title": "American Type Culture Collection (ATCC) - Staphylococcus aureus subsp. aureus ATCC 25923 Reference Strain Profile",
        "url": "https://www.atcc.org/products/25923"
      },
      {
        "title": "German Collection of Microorganisms and Cell Cultures (DSMZ) - Staphylococcus aureus DSM 20231 Standard Profile",
        "url": "https://www.dsmz.de/collection/catalogue/details/culture/DSM-20231"
      }
    ]
  },
  "search": {
    "aliases": [
      "Staphylococcus aureus",
      "S. aureus",
      "Estafilococo dourado",
      "Estafilococo áureo",
      "Staph aureus",
      "Golden Staph"
    ],
    "abbreviations": [
      "MRSA",
      "MSSA",
      "VRSA",
      "VISA",
      "SAB",
      "CoNS",
      "SCCmec",
      "PVL"
    ],
    "commonMisspellings": [
      "Estafilococus aureus",
      "Staphilococcus aureus",
      "Stafilococus aureus",
      "Staphylococcus aureos",
      "Stafilococos aureus",
      "Staphylococus aureus",
      "Stafilococus aureos",
      "Staphilomicrobio"
    ],
    "phonetics": [
      "es-ta-fi-lo-co-cus au-re-us",
      "sta-fi-lo-co-cus au-re-us",
      "es-ta-fi-lo-co-cu au-re-u"
    ],
    "keywords": [
      "estafilococo",
      "dourado",
      "MRSA",
      "MSSA",
      "VRSA",
      "bacteremia",
      "sepse",
      "endocardite",
      "osteomielite",
      "abscesso",
      "furúnculo",
      "clorexidina",
      "mupirocina",
      "vancomicina",
      "oxacilina",
      "precaução de contato",
      "controle de infecção",
      "CCIH",
      "coagulase",
      "catalase",
      "biofilme",
      "cateter",
      "Maki",
      "D-Test",
      "PVL",
      "superantígeno"
    ],
    "semanticTags": [
      "Bactéria Gram-Positiva",
      "Patógeno Humano",
      "Infecção Hospitalar",
      "Resistência Bacteriana",
      "Infectologia",
      "Microbiologia Clínica",
      "Cuidados de Enfermagem",
      "UTI",
      "Controle de Infecção (CCIH)"
    ]
  },
  "analytics": {
    "views": 18450,
    "favorites": 1250,
    "shares": 4820,
    "downloads": 2310,
    "searchRank": 1
  },
  "favoriteResources": [
    "CKO-CAL-000042",
    "CKO-PRO-000215",
    "CKO-PRT-000915"
  ],
  "computed": {
    "readingTime": 30,
    "complexity": "Alta",
    "riskLevel": "Alto (Grupo de Risco 2 / Patógeno Multirresistente)",
    "clinicalPriority": "Crítica (Relevância Epidemiológica e Médica Elevada)"
  },
  "metadata": {
    "language": "pt-BR",
    "difficulty": "Avançado",
    "seo": {
      "title": "Staphylococcus aureus (MRSA/MSSA): Guia Clínico e de Enfermagem Completo | CKO",
      "description": "Ficha técnica e clínica exaustiva de Staphylococcus aureus. Taxonomia, biologia, epidemiologia, virulência, diagnóstico laboratorial, tratamento de MRSA/MSSA, e cuidados e intervenções de enfermagem detalhados baseados em evidências.",
      "keywords": [
        "Staphylococcus aureus",
        "MRSA",
        "MSSA",
        "bacteremia",
        "endocardite",
        "cuidados de enfermagem",
        "precauções de contato",
        "controle de infecção",
        "CCIH"
      ]
    },
    "tags": [
      "Microorganismo",
      "Infectologia",
      "Microbiologia",
      "Segurança do Paciente",
      "CCIH",
      "Terapia Intensiva (UTI)"
    ]
  },
  "governance": {
    "status": "Published",
    "reviewDate": "2026-07-26",
    "reviewedBy": "Dra. Carolina Mendes (Presidente da Comissão de CCIH) e Equipe Editorial CKO",
    "editor": "Equipe CKO",
    "license": "CC-BY 4.0",
    "approvalLevel": "Diretoria Clínica",
    "syncInfo": {
      "lastSync": "2026-07-26T22:50:00Z",
      "version": "1.0.0",
      "source": "CKO Clinical Knowledge Base"
    }
  },
  "timeline": {
    "registration": {
      "date": "1880-08-01",
      "authority": "Classificação Científica Histórica (Alexander Ogston)",
      "processNumber": "ATCC-25923"
    },
    "lastUpdate": "2026-07-26",
    "newEvidence": [
      {
        "date": "2025-11-12",
        "source": "CDC MMWR",
        "description": "Atualização das taxas de incidência globais e perfis epidemiológicos de infecções de corrente sanguínea por MRSA associadas a procedimentos cirúrgicos invasivos."
      },
      {
        "date": "2026-04-18",
        "source": "EUCAST Update",
        "description": "Revisão e confirmação de breakpoints interpretativos mínimos para o disco de Cefoxitina na triagem ativa de mecA em estafilococos."
      }
    ],
    "versionHistory": [
      {
        "version": "1.0.0",
        "date": "2026-07-26",
        "changes": "Publicação inicial do perfil clínico estruturado completo no padrão unificado CKO Microorganism."
      }
    ]
  },
  "translations": {
    "pt-BR": {
      "name": "Staphylococcus aureus",
      "description": "Staphylococcus aureus é uma bactéria esférica Gram-positiva, anaeróbia facultativa, catalase e coagulase positiva. Atua como comensal colonizador comum de narinas e pele, mas também como um dos patógenos humanos mais agressivos e clinicamente significativos, causando infecções de pele, bacteremias sistêmicas, osteomielite, endocardite aguda e graves síndromes imunológicas mediadas pela secreção de toxinas."
    },
    "en": {
      "name": "Staphylococcus aureus",
      "description": "Staphylococcus aureus is a Gram-positive, spherical, facultative anaerobic, catalase- and coagulase-positive bacterium. It serves as a common colonizing commensal of the nares and skin, but also as one of the most aggressive and clinically significant human pathogens, causing skin infections, systemic bacteremias, osteomyelitis, acute endocarditis, and severe immunological syndromes mediated by toxin secretion."
    },
    "es": {
      "name": "Staphylococcus aureus",
      "description": "Staphylococcus aureus es una bacteria esférica Gram-positiva, anaerobia facultativa, catalasa y coagulasa positiva. Actúa como comensal colonizador común de narinas y piel, pero también como uno de los patógenos humanos más agresivos y clínicamente significativos, causando infecciones cutáneas, bacteriemias sistémicas, osteomielitis, endocarditis aguda y graves síndromes inmunológicos mediados por la secreción de toxinas."
    }
  }
}

os.makedirs("cko-schemas", exist_ok=True)
with open("cko-schemas/microorganism-staphylococcus-aureus.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully written cko-schemas/microorganism-staphylococcus-aureus.json!")
