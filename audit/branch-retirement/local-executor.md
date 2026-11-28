# Executor local de aposentadoria técnica — lote prioritário

O conector GitHub atual não possui ação de exclusão de refs ou dispatch. O executor é para ambiente Git autenticado autorizado (Git + gh), **não** um bypass de proteção. Não executa quando os registros ainda forem CANDIDATE. O lote é restrito a archivamento, planning e fix/ce-admin-e2e-hierarchy-20261101.

Dry-run padrão, na raiz do checkout limpo e atualizado de main:

    python3 scripts/ce-retirement-executor.py --branch archivamento --branch planning --branch fix/ce-admin-e2e-hierarchy-20261101

Somente após os quatro gates comprovados, ledger elegível integrado, CI main concluída e autorização de execução registrada, o operador autorizado pode usar --execute com --execution-ref apontando para o comentário de execução na issue #33 e --receipt-dir para um diretório novo fora do checkout. O script revalida SHA remoto, ancestralidade, proteção individual, PRs, runs e CI main, e usa push atômico com leases explícitos. Não cria refs, não toca main/WU-TRIB, não altera Vercel ou DB. Receipts são locais, requerem revisão e integração posterior.

A prova de dependências externas, retenção e segurança não é fabricada pelo executor. Leases protegem os HEADs-alvo; não há transação Git que impeça a criação concorrente de uma PR ou alteração externa. Use janela operacional coordenada. Se houver erro após push, verificar estado remoto antes de qualquer repetição; nunca gerar recibo presumido. O estado atual segue CANDIDATE_ONLY, portanto nem dry-run elegível deve passar até a integração das evidências.

Teste de transporte Git isolado: em repositório bare temporário, lease incorreto rejeitou toda a exclusão atômica; leases corretos removeram duas refs fictícias, preservando main. Não houve operação no remoto real.
