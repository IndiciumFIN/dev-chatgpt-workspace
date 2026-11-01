/**
 * Lista de doenças de notificação compulsória conforme
 * Portaria MS/GM nº 3.220/2024 (atualiza a Portaria nº 204/2016).
 *
 * Fonte primária:
 *   BRASIL. Ministério da Saúde. Portaria GM/MS nº 3.220, de 30 de dezembro de 2024.
 *   Dispõe sobre a relação de doenças, agravos e eventos em saúde pública de
 *   notificação compulsória. Diário Oficial da União, Brasília, DF, 31 dez. 2024.
 *
 * Atenção: esta lista deve ser revisada anualmente conforme atualizações do MS.
 * Última revisão: novembro/2026.
 */

export type PeriodicidadeNotificacao = "IMEDIATA" | "SEMANAL" | "MENSAL";

export type GrupoNotificacao = "I" | "II" | "III" | "IV";

export interface DoencaCompulsoria {
  id: string;
  nome: string;
  cid10?: string;
  grupo: GrupoNotificacao;
  periodicidade: PeriodicidadeNotificacao;
  descricao: string;
  /** Para Grupo I: tempo máximo para notificação (em horas) */
  prazoHoras?: number;
  /** Categoria temática para filtro */
  categoria: string;
  /** Se requer internação ou isolamento */
  medidasControle?: string[];
}

export const DOENCAS_COMPULSORIAS: DoencaCompulsoria[] = [
  // === GRUPO I — Notificação IMEDIATA (até 24h) ===
  { id: "dengue", nome: "Dengue", cid10: "A90", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral transmitida por Aedes aegypti. Febre alta, cefaleia, mialgia, exantema.", categoria: "Doenças transmissíveis", medidasControle: ["Notificar imediatamente", "Investigação epidemiológica", "Vigilância entomológica"] },
  { id: "zika", nome: "Febre Zika (Zika vírus)", cid10: "A92.8", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral transmitida por Aedes. Febre baixa, exantema maculopapular, artralgia.", categoria: "Doenças transmissíveis", medidasControle: ["Notificar imediatamente", "Vigilância entomológica"] },
  { id: "chikungunya", nome: "Febre Chikungunya", cid10: "A92.0", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral por Aedes. Febre alta, artralgia intensa, exantema.", categoria: "Doenças transmissíveis", medidasControle: ["Notificar imediatamente", "Vigilância entomológica"] },
  { id: "febreamarela", nome: "Febre Amarela", cid10: "A95", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral hemorrágica transmitida por mosquitos Haemagogus (silvestre) ou Aedes (urbana).", categoria: "Doenças transmissíveis", medidasControle: ["Notificar em até 24h", "Vacinação", "Vigilância entomológica"] },
  { id: "meningococcemia", nome: "Doença Meningocócica", cid10: "A39", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Meningite ou meningococcemia por Neisseria meningitidis. Letalidade elevada.", categoria: "Doenças transmissíveis", medidasControle: ["Quimioprofilaxia de contatos", "Vacinação"] },
  { id: "tetano-acidental", nome: "Tétano Acidental", cid10: "A35", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Infecção por Clostridium tetani através de ferimentos. Espasmos musculares.", categoria: "Doenças transmissíveis", medidasControle: ["Imunoglobulina antitetânica", "Vacinação"] },
  { id: "tetano-neonatal", nome: "Tétano Neonatal", cid10: "A33", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Tétano em recém-nascido por contaminação do coto umbilical.", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação materna", "Cuidados com coto umbilical"] },
  { id: "raiva-humana", nome: "Raiva Humana", cid10: "A82", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Encefalite viral por vírus da raiva. Letalidade ~100% após sintomas.", categoria: "Doenças transmissíveis", medidasControle: ["Profilaxia pós-exposição", "Vacinação animal"] },
  { id: "hanseniase", nome: "Hanseníase", cid10: "A30", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença crônica por Mycobacterium leprae. Lesões cutâneas e neuropatia.", categoria: "Doenças transmissíveis", medidasControle: ["Poliquimioterapia (PQT/OMS)", "Exame de contatos"] },
  { id: "tuberculose", nome: "Tuberculose", cid10: "A15-A19", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença por Mycobacterium tuberculosis. Pulmonar ou extrapulmonar.", categoria: "Doenças transmissíveis", medidasControle: ["Tratamento diretamente observado (TDO)", "Exame de contatos", "Baciloscopia"] },
  { id: "coqueluche", nome: "Coqueluche", cid10: "A37", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Infecção respiratória por Bordetella pertussis. Tosse paroxística.", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação", "Profilaxia de contatos"] },
  { id: "sarampo", nome: "Sarampo", cid10: "B05", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral exantemática altamente contagiosa. Manchas de Koplik.", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação", "Bloqueio vacinal de contatos", "Isolamento respiratório"] },
  { id: "rubéola", nome: "Rubéola", cid10: "B06", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral exantemática. Risco fetal em gestantes (SRC).", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação tríplice viral", "Investigação de gestantes"] },
  { id: "caxumba", nome: "Caxumba", cid10: "B26", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Infecção viral por paramyxovirus. Tumefação parotídea.", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação tríplice viral"] },
  { id: "poliomielite", nome: "Poliomielite", cid10: "A80", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral por poliovírus. Paralisia flácida aguda.", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação", "Investigação de PFA em < 15 anos"] },
  { id: "influenza-srag", nome: "Influenza Humana (SRAG)", cid10: "J10-J11", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Síndrome respiratória aguda grave por influenza.", categoria: "Doenças transmissíveis", medidasControle: ["Oseltamivir", "Isolamento respiratório", "Vacinação anual"] },
  { id: "covid19-srag", nome: "COVID-19 (SRAG)", cid10: "U04.9 / U07.1", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Síndrome respiratória aguda grave por SARS-CoV-2.", categoria: "Doenças transmissíveis", medidasControle: ["Isolamento", "Vacinação", "Notificar óbitos e SRAG"] },
  { id: "variola-dos-macacos", nome: "Mpox (Varíola dos Macacos)", cid10: "B04", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença viral por Orthopoxvirus. Exantema vesicular.", categoria: "Doenças transmissíveis", medidasControle: ["Isolamento", "Vigilância de contatos"] },
  { id: "febre-tifoide", nome: "Febre Tifoide", cid10: "A01.0", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Infecção bacteriana por Salmonella typhi. Febre prolongada.", categoria: "Doenças transmitidas por alimentos", medidasControle: ["Saneamento", "Coproscopia de manipuladores"] },
  { id: "hepatite-a", nome: "Hepatite A", cid10: "B15", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Hepatite viral por vírus A. Transmissão fecal-oral.", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação", "Saneamento"] },
  { id: "hepatite-b", nome: "Hepatite B", cid10: "B16-B18", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Hepatite viral por vírus B. Transmissão parenteral, sexual, vertical.", categoria: "Doenças transmissíveis", medidasControle: ["Vacinação", "Sorologia pré-natal", "Profilaxia vertical"] },
  { id: "hepatite-c", nome: "Hepatite C", cid10: "B17.1 / B18.2", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Hepatite viral por vírus C. Transmissão parenteral.", categoria: "Doenças transmissíveis", medidasControle: ["Sorologia", "Antivirais de ação direta"] },
  { id: "leptospirose", nome: "Leptospirose", cid10: "A27", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Zoonose por Leptospira. Exposição a água/urina de roedores.", categoria: "Doenças transmissíveis", medidasControle: ["Controle de roedores", "EPI em enchentes"] },
  { id: "esquistossomose", nome: "Esquistossomose", cid10: "B65", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença parasitária por Schistosoma mansoni. Caramujos vetores.", categoria: "Doenças transmissíveis", medidasControle: ["Controle de caramujos", "Tratamento em massa"] },
  { id: "chagas-agudo", nome: "Doença de Chagas (agudo)", cid10: "B57", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Fase aguda da tripanossomíase americana por Trypanosoma cruzi.", categoria: "Doenças transmissíveis", medidasControle: ["Controle de barbeiros", "Triagem hemoterápica"] },
  { id: "leishmaniose-visceral", nome: "Leishmaniose Visceral (Calazar)", cid10: "B55.0", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença parasitária grave por Leishmania. Vetor: flebotomíneo.", categoria: "Doenças transmissíveis", medidasControle: ["Controle de vetores", "Tratamento"] },
  { id: "leishmaniose-tegumentar", nome: "Leishmaniose Tegumentar", cid10: "B55.1-B55.2", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Forma cutânea/mucosa da leishmaniose.", categoria: "Doenças transmissíveis", medidasControle: ["Controle de vetores"] },
  { id: "malaria", nome: "Malária", cid10: "B50-B54", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Doença parasitária por Plasmodium. Vetor: Anopheles.", categoria: "Doenças transmissíveis", medidasControle: ["Gota espessa", "Tratamento específico", "Controle de vetores"] },
  { id: "febre-maculosa", nome: "Febre Maculosa", cid10: "A77", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Rickettsiose transmitida por carrapatos. Exantema petequial.", categoria: "Doenças transmissíveis", medidasControle: ["Doxiciclina", "Controle de carrapatos"] },
  { id: "hiv-aids", nome: "HIV/AIDS", cid10: "B20-B24", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Infecção pelo HIV. Aids é a fase sintomática.", categoria: "Doenças sexualmente transmissíveis", medidasControle: ["TARV", "Profilaxia pré-exposição (PrEP)", "Testagem"] },
  { id: "sifilis-adquirida", nome: "Sífilis Adquirida", cid10: "A51", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Infecção por Treponema pallidum. Úlcera genital, exantema.", categoria: "Doenças sexualmente transmissíveis", medidasControle: ["Penicilina", "Tratamento de parceiros"] },
  { id: "sifilis-gestacional", nome: "Sífilis em Gestante", cid10: "A51 / O98", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Sífilis durante gestação. Risco de transmissão vertical.", categoria: "Doenças sexualmente transmissíveis", medidasControle: ["Penicilina benzatina", "Tratamento de parceiros", "Notificação obrigatória"] },
  { id: "sifilis-congenita", nome: "Sífilis Congênita", cid10: "A50", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Sífilis transmitida da mãe para o feto. Risco de aborto, óbito fetal.", categoria: "Doenças sexualmente transmissíveis", medidasControle: ["Penicilina cristalina", "Acompanhamento pediátrico"] },
  { id: "gonorreia", nome: "Gonorreia", cid10: "A54", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Infecção por Neisseria gonorrhoeae. Uretrite, cervicite.", categoria: "Doenças sexualmente transmissíveis", medidasControle: ["Ceftriaxone + Azitromicina", "Tratamento de parceiros"] },
  { id: "aids-pediatrica", nome: "Aids pediátrica (< 13 anos)", cid10: "B20-B24", grupo: "I", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Aids em criança menor de 13 anos, geralmente por transmissão vertical.", categoria: "Doenças sexualmente transmissíveis", medidasControle: ["Profilaxia vertical", "TARV pediátrica"] },

  // === GRUPO II — Notificação SEMANAL ===
  { id: "eapv", nome: "Eventos adversos pós-vacinação (EAPV)", cid10: "T88.1 / Y59-Y60", grupo: "II", periodicidade: "SEMANAL", descricao: "Eventos adversos temporais à vacinação.", categoria: "Vigilância em saúde" },
  { id: "violencia", nome: "Violência interpessoal/autoprovocada", cid10: "X60-Y09 / Y87", grupo: "II", periodicidade: "SEMANAL", descricao: "Casos de violência doméstica, sexual e autoprovocada atendidos na rede.", categoria: "Vigilância de violências" },
  { id: "acidente-trabalho", nome: "Acidente de trabalho", cid10: "S00-T88 / W00-Y34", grupo: "II", periodicidade: "SEMANAL", descricao: "Acidentes do trabalho típicos, de trajeto e doenças profissionais.", categoria: "Saúde do trabalhador" },
  { id: "intoxicacao", nome: "Intoxicação exógena", cid10: "T36-T65", grupo: "II", periodicidade: "SEMANAL", descricao: "Intoxicações por medicamentos, pesticidas, metais, drogas de abuso, plantas.", categoria: "Vigilância toxicológica" },

  // === GRUPO III — Notificação MENSAL ===
  { id: "cancer", nome: "Câncer (RHC)", cid10: "C00-D48", grupo: "III", periodicidade: "MENSAL", descricao: "Casos de câncer para o Registro Hospitalar de Câncer (RHC) e Registro de Base Populacional (RBCP).", categoria: "Vigilância de câncer" },
  { id: "diabetes-gestacional", nome: "Diabetes mellitus gestacional", cid10: "O24", grupo: "III", periodicidade: "MENSAL", descricao: "Casos de diabetes mellitus diagnosticados durante a gestação.", categoria: "Saúde materno-infantil" },
  { id: "anomalia-congenita", nome: "Nascidos vivos com anomalia congênita", cid10: "Q00-Q99", grupo: "III", periodicidade: "MENSAL", descricao: "Anomalias congênitas detectadas ao nascer para vigilância de defeitos congênitos.", categoria: "Saúde materno-infantil" },

  // === GRUPO IV — Vigilância especial ===
  { id: "febre-recorrente", nome: "Febre recorrente (Borrelia)", cid10: "A68", grupo: "IV", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Febre recorrente transmitida por carrapatos e piolhos.", categoria: "Doenças transmissíveis" },
  { id: "tularemia", nome: "Tularemia", cid10: "A21", grupo: "IV", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Zoonose por Francisella tularensis. Rara no Brasil.", categoria: "Doenças transmissíveis" },
  { id: "peste", nome: "Peste", cid10: "A20", grupo: "IV", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Yersinia pestis. Transmissão por pulgas de roedores. Forma bubônica, pulmonar, septicêmica.", categoria: "Doenças transmissíveis" },
  { id: "carbunco", nome: "Carbúnculo (Antraz)", cid10: "A22", grupo: "IV", periodicidade: "IMEDIATA", prazoHoras: 24, descricao: "Bacillus anthracis. Zoonose de animais herbívoros. Forma cutânea, pulmonar, gastrointestinal.", categoria: "Doenças transmissíveis" },
];

export const GRUPO_LABELS: Record<GrupoNotificacao, string> = {
  I: "Grupo I — Notificação imediata (até 24h)",
  II: "Grupo II — Notificação semanal",
  III: "Grupo III — Notificação mensal",
  IV: "Grupo IV — Vigilância especial",
};

export const PERIODICIDADE_LABELS: Record<PeriodicidadeNotificacao, string> = {
  IMEDIATA: "Imediata",
  SEMANAL: "Semanal",
  MENSAL: "Mensal",
};
