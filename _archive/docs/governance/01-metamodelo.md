# Metamodelo de governança

## Definição

O metamodelo define as entidades, estados, tipos e relações que governam o
sistema. Ele não é um CMS e não é UI; ele é a base de verdade de domínio.

## Entidades fundamentais

- WorkOrder
- PolicyRule
- Normative
- Manifest
- EvidenceRecord
- ApprovalRecord
- CanonicalEntity
- DictionaryEntry
- MasterDataRecord
- TemplateContract
- SchemaContract
- PreviewBundle
- DeployRecord

## Estados

- raw
- extracted
- normalized
- validation_pending
- rejected
- admitted
- staged
- preview_approved
- release_approved
- deployed
- revoked

## Regras

- toda entidade tem id
- toda entidade tem versão
- toda entidade tem origem
- toda entidade tem estado
- toda entidade tem dependências
- toda entidade tem evidência
