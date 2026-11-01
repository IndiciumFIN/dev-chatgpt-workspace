/** Projeção candidata transcrita do arquivo original vila_do_cuidado.page.json (schema 1.0.0).
 * Origem: consolidado 2026-08-26, hero/quick_access/featured_content/games/printables.
 * Status: SOURCE_VISIBLE; não equivale a revisão clínica nem publicação.
 */
export type VilaContentItem = { id:string;assetId:string;title:string;description:string;url:string };
export const vilaSourceHome = {
  hero: { title:"Bem-vindo à Vila do Cuidado", ribbon:"Nosso espaço de cuidado para crianças",body:"Histórias, brincadeiras e aprendizado para cuidar com carinho e segurança." },
  quick: [
    {id:"higiene-das-maos",assetId:"quick.higiene",title:"Higiene das Mãos",description:"Aprenda a lavar as mãos e ficar protegido.",url:"/kids/descubra"},
    {id:"vacinacao-sem-medo",assetId:"quick.vacinacao",title:"Vacinação sem Medo",description:"Entenda de forma divertida por que é importante.",url:"/kids/descubra"},
    {id:"visita-ao-hospital",assetId:"quick.hospital",title:"Visita ao Hospital",description:"Descubra o que acontece em uma visita ao hospital.",url:"/kids/descubra"},
    {id:"emocoes",assetId:"quick.emocoes",title:"Emoções",description:"Conheça e cuide das suas emoções.",url:"/kids/emocoes"},
    {id:"jogos-da-vila",assetId:"quick.jogos",title:"Jogos da Vila",description:"Brinque e aprenda com muitos jogos.",url:"/kids/jogos"},
    {id:"colorir",assetId:"quick.colorir",title:"Colorir",description:"Desenhos para soltar a criatividade.",url:"/kids/colorir"}
  ],
  featured:[
    {id:"lavar-maos-com-lia",assetId:"featured.maos_lia",title:"Lavar as mãos com a Lia",description:"A Lia vai te ensinar um jeito divertido de manter as mãos limpinhas!",url:"/kids/historias"},
    {id:"superpoder-pedir-ajuda",assetId:"featured.pedir_ajuda",title:"O superpoder de pedir ajuda",description:"Descubra como pedir ajuda é um ato de coragem e cuidado.",url:"/kids/historias"},
    {id:"primeira-visita-hospital",assetId:"featured.visita_hospital",title:"Minha primeira visita ao hospital",description:"Uma história para conhecer o hospital e se sentir mais tranquilo.",url:"/kids/historias"},
    {id:"cartoes-das-emocoes",assetId:"featured.cartoes_emocoes",title:"Cartões das emoções",description:"Aprenda a reconhecer e falar sobre o que você sente.",url:"/kids/emocoes"}
  ],
  games:[
    {id:"jogo-da-memoria",assetId:"game.memoria",title:"Jogo da Memória",description:"Encontre os pares e exercite sua memória.",url:"/kids/jogos"},
    {id:"quiz-do-cuidado",assetId:"game.quiz",title:"Quiz do Cuidado",description:"Responda perguntas e teste o que aprendeu.",url:"/kids/jogos"},
    {id:"missao-higiene",assetId:"game.higiene",title:"Missão Higiene",description:"Complete desafios e ajude a manter tudo limpinho!",url:"/kids/jogos"},
    {id:"monte-kit-do-cuidado",assetId:"game.kit",title:"Monte seu Kit do Cuidado",description:"Escolha os itens e monte seu kit especial.",url:"/kids/jogos"}
  ],
  printables:[
    {id:"desenhos-para-colorir",assetId:"print.colorir",title:"Desenhos para colorir",description:"Imprima e pinte seus desenhos favoritos.",url:"/kids/colorir"},
    {id:"labirinto",assetId:"print.labirinto",title:"Labirinto",description:"Encontre o caminho e ajude os amigos.",url:"/kids/colorir"},
    {id:"ligue-os-pontos",assetId:"print.pontos",title:"Ligue os pontos",description:"Ligue os pontos e descubra o desenho escondido.",url:"/kids/colorir"},
    {id:"adesivos-do-cuidado",assetId:"print.adesivos",title:"Adesivos do cuidado",description:"Imprima, recorte e cole para se divertir!",url:"/kids/colorir"},
    {id:"certificado-de-coragem",assetId:"print.certificado",title:"Certificado de coragem",description:"Parabéns por cuidar de você e dos seus amigos!",url:"/kids/colorir"}
  ],
  trust:[
    {title:"Sem imagens fortes",description:"Ambiente leve, acolhedor e adequado para crianças."},
    {title:"Com mediação de um adulto",description:"A participação de um adulto deixa tudo ainda melhor!"},
    {title:"Feito para crianças",description:"Linguagem simples, divertida e cheia de carinho."}
  ]
} as const;
