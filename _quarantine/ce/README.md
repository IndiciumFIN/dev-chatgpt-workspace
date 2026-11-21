# Quarentena transitória CE — código não operacional

Esta pasta **não é uma aplicação, pacote, módulo importável ou origem autorizada de publicação**. Guarda cópias byte-idênticas de **candidatos explicitamente qualificados** para permitir reduzir a dependência de branches antigas. A existência no Git não significa admissão, conformidade clínica, direitos de reprodução ou migração Supabase.

- Cada arquivo precisa constar em \`manifests/index.v1.json\` com repositório/ref/commit/path/blob/modo, estado e restrições.
- A cópia é inerte: Vercel exclui \`_quarantine/\`; scripts/ce-quarantine-guard.mjs falha diante de importação ou uso pelo runtime e divergência Git.
- Não colocar segredos, dados de pacientes, dados privados do Drive ou material sem direitos de reprodução na main **pública**. Para fontes privadas, manter somente registro sanitizado na governança e custódia privada autorizada.
- Um candidato só sai daqui com decisão comprovável, teste e SHA de incorporação/rejeição. Excluir a cópia na mesma PR da decisão, mantendo manifesto histórico em registers/governance.
- Fechar uma PR/branch de origem requer 100% do seu escopo classificado e destino comprovado: este **piloto de 1 arquivo não encerra a PR #78**. \`SOURCE_STAGED\` não equivale a \`SEALED_FOR_RELEASE\`.
- Migrations nesta pasta não são executáveis por migração automática.
- Governança e plano: issue #125; origem de inventário: PR #123; fase DEV, aprovação de release diferida.
