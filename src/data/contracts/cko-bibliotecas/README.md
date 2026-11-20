# CKO — Bibliotecas — Estrutura Completa v1.1

## Correção

O pacote anterior era um **inventário de schemas da Biblioteca de Vacinas**.  
Por isso ele não mostrava arquivos específicos como `seringa-referencia.library.json` e `uti-emergencia.library.json`.

Esses arquivos **não são schemas diferentes**. São instâncias de `CKO.Library.schema.json`.

A estrutura completa é:

```text
CKO.Library.schema.json
    ↓
seringa-referencia.library.json
    ├── seringa-referencia.content.json
    ├── seringa-referencia.composition.json
    ├── seringa-referencia.assets.json
    └── seringa-referencia.provenance.json

CKO.Library.schema.json
    ↓
uti-emergencia.library.json
    ├── uti-emergencia.content.json
    ├── uti-emergencia.composition.json
    ├── uti-emergencia.assets.json
    └── uti-emergencia.provenance.json
```

## Inventário completo recuperado

- Libraries: **27**
- Content bindings: **27**
- Composition bindings: **27**
- Asset bindings: **27**
- Provenance bindings: **27**
- Schemas canônicos: **30**
- Schemas de suporte: **17**
- Object extension schemas: **11**

## Seringa

`entities/libraries/seringa-referencia.library.json`

- title: `Seringa`
- family: `device-library`
- archetype: `syringe_device_library`
- content_status: `authored`
- accepted_object_types: `[]`
- object_refs: `[]`

Logo: a **Library Seringa existe**, mas `SyringeObject` ainda não foi materializado como object extension canônica nesse baseline.

## UTI-Emergência

`entities/libraries/uti-emergencia.library.json`

- title: `UTI-Emergência`
- family: `knowledge-library`
- archetype: `critical_care_knowledge_library`
- content_status: `authored`
- accepted_object_types: `[]`
- object_refs: `[]`

Logo: a **Library UTI-Emergência existe** com conteúdo/composição/assets/proveniência, mas os seus cards ainda não foram promovidos a LibraryObjects específicos.

## 27 Libraries

- `anatomia-fisiologia` — Anatomia/Fisiologia
- `antissepticos` — Antissépticos
- `cateteres` — Cateteres
- `cme` — CME
- `curativos` — Curativos
- `doencas` — Doenças
- `epidemiologia` — Epidemiologia
- `exames-laboratoriais` — Exames laboratoriais
- `ferimentos` — Ferimentos
- `geriatria` — Geriatria
- `legislacao` — Legislação
- `luvas` — Luvas
- `materiais-cirurgicos` — Materiais Cirúrgicos
- `medicamentos` — Medicamentos
- `notificacao-compulsoria` — Doenças de Notificação Compulsória
- `nutricao-paciente` — Nutrição do paciente
- `pediatria` — Pediatria
- `protocolos-enfermagem` — Protocolos de enfermagem
- `sae` — SAE
- `saude-mental` — Saúde mental
- `seguranca-do-paciente` — Segurança do paciente
- `seringa-referencia` — Seringa
- `sinais-vitais` — Sinais vitais
- `sondas` — Sondas
- `uti-emergencia` — UTI-Emergência
- `vacinas` — Vacinas
- `ventilacao-mecanica` — Equipamentos de Ventilação Mecânica

## Regra semântica

`Library != LibraryObject != ContentPage`

Um card não vira objeto automaticamente. Pode ser objeto, categoria, tópico, procedimento, workflow ou recurso.
