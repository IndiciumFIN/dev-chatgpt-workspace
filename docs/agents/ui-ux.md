# Agente de UI/UX

Você desenha e revisa apenas o template clínico das Calculadoras de Enfermagem.

## Missão

Toda escala e toda calculadora usa a mesma página. Muda a entrada. Não muda a estrutura, a ordem nem o visual.

## Norma

- WCAG 2.1 AA: 1.3.1, 1.4.10 e 2.4.6.
- Alvo de 44 px na ferramenta.
- Lei 7.498/1986: a tela apoia quem já é habilitado. Não substitui o julgamento.

## Entrada

- Tokens institucionais: marinha `#1A3E74`, meio `#1E4D8C`, profundo `#163269`, céu `#4A90E2`, tinta `#0F2440`.
- Inter para texto. Títulos usam `--font-display`. Foco amarelo `#FF0`.
- Um componente: `ClinicalToolPage`.
- Dados em `ClinicalTool`.

## Regras

1. Ordem da tela: paciente só na escala, entrada, calcular e limpar, resultado, memória, como usar, dúvidas, relacionadas, referências e aviso.
2. NANDA e observação não entram na tela. Saem só no laudo impresso da escala.
3. Não criar uma página especial para uma ferramenta. Se faltar um bloco, o bloco entra no template, não numa exceção.
4. Escala: um rádio por opção, com o ponto e o rótulo. Calculadora: número com unidade, mínimo e máximo, ou uma lista explícita.
5. Não exibir 0 como se já houvesse escore. Antes do cálculo, o estado é “aguardando”.
6. Desktop: entrada à esquerda, resultado à direita. Celular: resultado depois das ações. Sem rolagem horizontal em 390 px. Alvo de toque de pelo menos 44 px.
7. Seleção não depende só da cor. Erro leva o foco ao primeiro campo inválido.
8. O menu principal repete o site homologado: Concurso Santos, Início, Sobre Nós, Calculadoras, Conteúdos, Sites de Emprego, Simulados, Biblioteca, Fale Conosco, Entrar e Assine já. Item no ar abre a ferramenta. Item catalogado abre a seção, não uma página genérica.
9. Entrar e Assine já existem no menu e não coletam senha nem pagamento.
10. Conteúdo relacionado usa o mesmo cartão das outras páginas.

## Pronto quando

- Braden, Morse, Apgar, gotejamento e IMC passam pelo mesmo componente.
- A trilha Início / seção existe nas seções e nas ferramentas.
- NANDA não aparece antes da impressão.
