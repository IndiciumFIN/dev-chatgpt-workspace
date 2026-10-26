export const fundamentosPacote = {
  arquivo: "CKO_WORKSPACE_FULL_ATOMICO_20261023.zip",
  sha256: "61f3bc0ae65267c118eba94eb44f380177462e47e25d0eaef9b1a4244a612d91",
  textoExatoGuardado: false,
} as const;

export type FundamentoNorma = {
  id: string;
  nome: string;
  dominio: string;
  direito: string;
  prioridade: string;
};

export const fundamentosNormas: FundamentoNorma[] = [
  { id: "SPEC-UCUM22", nome: "UCUM Specification 2.2", dominio: "Unidade de medida", direito: "Fonte aberta", prioridade: "P0" },
  { id: "STD-ABNT-NBR5891", nome: "ABNT NBR 5891:2014", dominio: "Arredondamento", direito: "Uso interno", prioridade: "P0" },
  { id: "STD-ISO-11179-1", nome: "ISO/IEC 11179-1:2023", dominio: "Registro de metadado", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-11179-3", nome: "ISO/IEC 11179-3:2023", dominio: "Registro de metadado", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-11179-31", nome: "ISO/IEC 11179-31:2023", dominio: "Especificação de dado", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-12207", nome: "ISO/IEC/IEEE 12207:2026", dominio: "Ciclo de vida de software", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-15489-1", nome: "ISO 15489-1:2016", dominio: "Gestão de registros", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-19011", nome: "ISO 19011:2026", dominio: "Auditoria", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-25010", nome: "ISO/IEC 25010:2023", dominio: "Qualidade de produto", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-31000", nome: "ISO 31000:2018", dominio: "Risco", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-38505-1", nome: "ISO/IEC 38505-1:2026", dominio: "Governança de dado", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-42010", nome: "ISO/IEC/IEEE 42010:2022", dominio: "Descrição de arquitetura", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-8000-100", nome: "ISO 8000-100", dominio: "Qualidade de dado", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-8000-110", nome: "ISO 8000-110:2021", dominio: "Dado mestre", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-8000-115", nome: "ISO 8000-115:2024", dominio: "Identificador de dado", direito: "Só metadado", prioridade: "P0" },
  { id: "STD-ISO-10007", nome: "ISO 10007:2017", dominio: "Gestão de configuração", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-10015", nome: "ISO 10015:2019", dominio: "Competência", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-25012", nome: "ISO/IEC 25012:2008", dominio: "Qualidade de dado", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-30401", nome: "ISO 30401:2018", dominio: "Gestão do conhecimento", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-37301", nome: "ISO 37301", dominio: "Compliance", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-8000-130", nome: "ISO 8000-130:2016", dominio: "Exatidão", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-8000-140", nome: "ISO 8000-140:2016", dominio: "Completude", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-80000-1", nome: "ISO 80000-1:2022", dominio: "Grandezas e unidades", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-ISO-9001", nome: "ISO 9001:2015 e emenda 1:2024", dominio: "Gestão da qualidade", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-IEC-31010", nome: "IEC 31010:2019", dominio: "Técnicas de risco", direito: "Só metadado", prioridade: "P1" },
  { id: "STD-IEEE-754", nome: "IEEE 754-2019", dominio: "Aritmética de máquina", direito: "Só metadado", prioridade: "P1" },
  { id: "FRAME-COSO-ERM", nome: "COSO ERM", dominio: "Risco empresarial", direito: "Só metadado", prioridade: "P2" },
  { id: "REF-ALCOA-PLUS", nome: "ALCOA+", dominio: "Integridade de registro", direito: "Família mista", prioridade: "P2" },
  { id: "STD-ISO-45001", nome: "ISO 45001", dominio: "Saúde ocupacional", direito: "Só metadado", prioridade: "P2" },
  { id: "STD-ASTM-E29", nome: "ASTM E29-22", dominio: "Dígitos significativos", direito: "Só metadado", prioridade: "P2" },
  { id: "FRAME-COBIT", nome: "COBIT", dominio: "Governança de TI", direito: "Só metadado", prioridade: "P3" },
  { id: "FRAME-ITIL", nome: "ITIL", dominio: "Gestão de serviço", direito: "Só metadado", prioridade: "P3" },
  { id: "FRAME-COPSOQ3", nome: "COPSOQ III", dominio: "Risco psicossocial", direito: "Só metadado", prioridade: "P3" },
  { id: "STD-ARCHIMATE", nome: "ArchiMate", dominio: "Notação de arquitetura", direito: "Só metadado", prioridade: "P3" },
  { id: "STD-TOGAF", nome: "TOGAF", dominio: "Arquitetura empresarial", direito: "Só metadado", prioridade: "P3" },
  { id: "STD-ZACHMAN", nome: "Zachman", dominio: "Arquitetura empresarial", direito: "Só metadado", prioridade: "P3" },
  { id: "WATCH-ISO-9001-ED6", nome: "ISO 9001 edição 6, em publicação", dominio: "Gestão da qualidade", direito: "Só metadado", prioridade: "Observação" },
  { id: "WATCH-ISO-31000-ED3", nome: "ISO 31000 edição 3, rascunho", dominio: "Risco", direito: "Só metadado", prioridade: "Observação" },
  { id: "WATCH-ISO-DIS-30401", nome: "ISO/DIS 30401", dominio: "Gestão do conhecimento", direito: "Só metadado", prioridade: "Observação" },
  { id: "STD-ISO-25964-1", nome: "ISO 25964-1:2011", dominio: "Vocabulário", direito: "Só metadado", prioridade: "Não avaliada" },
  { id: "STD-ISO-25964-2", nome: "ISO 25964-2:2013", dominio: "Vocabulário", direito: "Só metadado", prioridade: "Não avaliada" },
  { id: "STD-ISO-38500", nome: "ISO/IEC 38500:2024", dominio: "Governança de TI", direito: "Só metadado", prioridade: "Não avaliada" },
  { id: "STD-ISO-8000-61", nome: "ISO 8000-61:2016", dominio: "Processo de qualidade de dado", direito: "Só metadado", prioridade: "Não avaliada" },
];
