# Backup público — execução v1.1.0

**Escopo:** exclusivamente a cópia v1.0.0 do backup público; nenhum GitHub, Supabase ou outro repositório.

## Correções
- Corrigido cleanup de dois event listeners de publicação nas rotas pública e assinante de ferramentas.
- Criado `npm run audit:surfaces` e register canônico de vínculos estáticos de componentes.
- 23 arquivos de rotas inventariados; 6 contratos explícitos de imports verificados; 17 rotas aguardam contrato de componentes.

## Evidência e limitações
- Os testes de isolamento, contexto e contratos são estáticos e não homologam UI ou execução integral.
- Não há `node_modules` nesta cópia; typecheck e build não podem ser declarados PASS.
- Nenhuma comparação visual realizada; nenhuma integração remota habilitada.
- `localStorage` é específico de navegador/origem e não fornece auditoria inviolável.

## Próxima onda
Formalizar gradualmente os 17 vínculos restantes; testar compilação e renderização em ambiente instalável; comparar três áreas com capturas reais e checks de acessibilidade.
