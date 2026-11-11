/* ============================================================================
   MAPA DO SUMMIT — o mapa do Brasil clicável, um banner de evento por cidade
   ----------------------------------------------------------------------------
   Pedido do dono (2026-08-12): *"tire isso e crie uma nova secao abaixo para mapa
   summit que esta .zip que esta em anexo o componente. e dentro da pasta assets, img
   e Banner próximo evento tem todas as imagens que devem esta em cada estado."*

   O "isso" era a TERCEIRA tela do carrossel dos Destaques (a arte com a agenda das 21
   cidades, `assets/img/destaques/summit.jpeg`). Ela saiu; esta seção entrou depois dos
   Destaques, como a última antes do rodapé.

   O componente veio num .zip com duas versões, `MapaBrasilIGreen.tsx` (React) e
   `mapa-brasil-igreen.html` (HTML puro). **Usei o HTML**: este projeto não tem React,
   não tem build e não vai ter por causa de uma seção. A geometria dos 27 estados é a
   do .zip, sem uma vírgula alterada — só arredondada, ver abaixo.

   ============================================================================
   O QUE MUDOU DO COMPONENTE ORIGINAL, E POR QUÊ
   ----------------------------------------------------------------------------
   1. **O `DADOS` do .zip era por ESTADO e vinha com texto de exemplo** ("Descrição
      curta do estado. Substitua por conteúdo real."). Aqui a fonte é o `CIDADES`
      abaixo, e a chave continua o estado — mas o VALOR é uma LISTA de cidades,
      porque duas UFs têm dois eventos (ver o item 2).

   2. ⚠ **MG E SP TÊM DUAS CIDADES CADA**, e isso quebrava o componente como ele veio:
      um card por estado não caberia Belo Horizonte + Uberlândia (MG) nem Ribeirão
      Preto + São Paulo (SP). Confirmado com o dono antes de codar; a escolha dele foi
      *"o card mostra as duas, com setas"*. Então o card tem setas e um contador "1/2"
      quando o estado tem mais de um evento, e nenhuma seta quando tem um só —
      exatamente a mecânica do visor do ecossistema, que ele já validou.
      São 26 EVENTOS em 26 cidades e 22 estados desde 2026-11-06 (rodada de dezembro, sem
      Aracaju — Sergipe apagado até o banner chegar). Eram 27 em 27 e 23 de 2026-10-14 a 11-06.
      Cinco estados não têm evento neste mês (AC, AP,
      RO, RR e, temporariamente, SE). ⚠ Este número aparece TAMBÉM no <h2> da seção, no index.html
      ("27 cidades com a liderança iGreen"): ao mexer no CIDADES, mexa lá também —
      número visível com gêmeo em outro arquivo é a armadilha nº 1 desta base, e este
      par já discordou uma vez (o mapa foi para 27 e o título ficou em 25).
      ⚠ Era 21 em 19 até 2026-08-13, quando entraram Aracaju (SE) e São Luís (MA).

   3. **O card do .zip tinha um <img> de 340x191 e o banner NÃO caberia ali.** O banner
      de cada cidade é um flyer: traz data, check-in, início, local, o VIP e um QR CODE
      de inscrição. A 340px o QR tem ~60px e não escaneia, e a letra fina não se lê.
      O dono escolheu *"card + ampliar em tela cheia"*: o card mostra o banner pequeno,
      e clicar nele abre o visor de tela cheia, onde o QR fica escaneável da plateia.

   4. **Os oito estados sem evento ficam apagados e NÃO clicáveis** (escolha do dono).
      No SVG eles perderam o `tabindex` e o `role="button"` e ganharam `.is-off` — não
      recebem foco pelo teclado nem respondem ao clique. É a regra do projeto de não
      criar botão que não faz nada (a mesma do `GRAD_GAL_LEVELS` e do `QTD` do
      ecossistema: parada/afordância que não faz nada é pior que nenhuma).

   5. ⚠ **A GUARDA DO MODO APRESENTAÇÃO É A PRIMEIRA LINHA DO TRATADOR DE TECLADO**, e
      isto não é zelo: o componente original escutava `Escape` no documento e `Enter`/
      `ESPAÇO` no SVG. **Espaço é tecla de avanço da apresentação** — sem a guarda, um
      estado focado engoliria o espaço e a apresentação não andaria, com o dono
      apertando o passador e a tela parada. É o defeito de "dois donos" que o CLAUDE.md
      registra: *"Sintoma de dois donos quase nunca aparece como erro no console —
      aparece como tecla que não anda ou conteúdo que troca sozinho."* Por meses só três
      das quatro peças sobrepostas tinham a guarda, e a que faltava produziu exatamente
      isso nas Graduações.

   6. **O `<svg>` teve as coordenadas arredondadas para 1 casa decimal.** Vinham com 3
      ("34.662,120.662"), e o desenho tem 3.682 pontos: 35,4kB → 27,2kB no `index.html`,
      que é arquivo de boot. Maior desvio introduzido: **0,05 unidade num viewBox de
      353,8 = 0,014% da largura** — medido, não estimado. Invisível.
      ⚠ Ao arredondar, ATENÇÃO: 25 estados são `<polygon points>` mas **MT e PA são
      `<path d>`**, e os dois TÊM evento. Um script que só tratasse `polygon` deixaria
      Cuiabá e Belém não clicáveis, sem erro nenhum. Foi o que quase aconteceu aqui.

   ============================================================================
   ONDE OS BANNERS FICAM
   ----------------------------------------------------------------------------
       assets/img/summit/<Cidade>.jpg      1920x1080, ~360kB cada

   ⚠ Os nomes têm ESPAÇO e ACENTO ("Belo Horizonte.jpg", "São Paulo.jpg") porque são os
   nomes que o dono usa. Quem cuida disso é o `caminhoDe()`, que codifica o nome antes
   de virar URL — a mesma decisão da galeria do ecossistema. Não renomeie arquivo do
   dono para caber no código; é o código que se ajusta (regra do projeto).

   ⚠ O MASTER DO RIBEIRÃO PRETO É `.png`, OS OUTROS 27 SÃO `.jpg` (2026-09-13). A servida
   continua `.jpg` — tem de continuar, porque o `EXT` deste arquivo é `.jpg` e o `arquivo` do
   `CIDADES` não leva extensão. A consequência é para QUEM FOR COMPARAR as duas pastas: parear
   por nome COM extensão deixa o Ribeirão de fora e a comparação diz "nenhum desencontro"
   enquanto ignora uma cidade — o mesmo tipo de armadilha do `Goiãnia` com til, em 09/09.
   Pareie pelo nome SEM extensão.
   ⚠ E ele veio RGBA. Medido antes de converter: alpha 255 em todo o arquivo, ou seja sem
   transparência de verdade, então o `convert("RGB")` não inventou cor. Se um dia vier um com
   alpha real, JPEG não tem canal alfa e o certo é COMPOR sobre o fundo (#030603), não converter.

   (2026-10-14: a rodada de outubro chegou numa SUBPASTA, `Banner próximo evento/Slides/`, em
   .png e com "São Luis" sem acento no i. Pareado pelo nome sem acento e sem extensão: as 27
   casaram com as servidas, e todas tinham diferença média de pixel entre 5,7 e 20,5 — ou seja,
   as 27 mudaram de verdade.)
   (2026-10-15: a rodada de NOVEMBRO chegou de volta na raiz da pasta, com nomes de cópia do
   Drive — "Cópia de Cuiabá (1).png". Pareado tirando o "Cópia de " e o "(n)": 27 de 27, todas
   com diferença média de 12,0 a 24,7 contra as de outubro. Mesmas 27 cidades, um evento cada.)
   (2026-11-06: a rodada de DEZEMBRO veio num zip do Drive, `Slides/` com 26 .png de nome limpo —
   12/12 sábado em Campinas, João Pessoa e Pelotas; 13/12 domingo nas outras. ⚠ VEIO SEM ARACAJU:
   Sergipe foi APAGADO no mapa até chegar o dele (escolha do dono; ver a linha do SE no CIDADES). Os 26 QR codes foram lidos
   e são todos diferentes entre si.)
   O dono entrega em `assets/img/Banner próximo evento/`, 4000x2250 e **82MB** (25 banners).
   Isso é 20x o orçamento de bytes deste projeto e 2x a resolução que o visor de tela cheia
   usa no maior monitor. As servidas são as de `assets/img/summit/`: **1920x1080, 9,8MB no
   total**. Os masters estão no `.gitignore`, no disco, para reexportar quando ele trocar um
   banner.

   ⚠ COMO REEXPORTAR, com o número que reproduz o padrão: LANCZOS para 1920x1080 e JPEG
   `quality=88, optimize=True`, mantendo o perfil ICC do master. Isso foi CALIBRADO, não
   escolhido: reexportando um banner que já estava certo (Campinas) esse ajuste devolve
   393kB contra os 402kB do arquivo real — 2% de diferença. Com `quality=80` daria 302kB,
   25% mais leve e fora do padrão das outras 24.

   ⚠ E DÁ PARA SABER QUAIS ESTÃO VELHAS SEM ABRIR UMA POR UMA: reduza o master para
   1920x1080 e compare com a servida pela diferença média de pixel. Reencode limpo fica em
   ~1,4; em 2026-09-09 duas passavam de 24 (Aracaju 29,0 e São Luís 24,0) e eram justamente
   as duas que ainda mostravam "Local: A confirmar" e o QR em branco.
   ============================================================================ */
(function(){
  "use strict";

  /* ---------------------------------------------------------------------------
     AS 27 DATAS EM 27 CIDADES, AGRUPADAS POR ESTADO — é aqui que se mexe quando a agenda muda
     ---------------------------------------------------------------------------
     ⚠ A ORDEM DENTRO DE CADA ESTADO É A ORDEM NA TELA, e ela segue a ORDEM DA ARTE DA
     AGENDA que o dono mandou (as duas colunas do `summit.jpeg` que saiu dos Destaques),
     lida coluna a coluna. É por isso que SP abre em **Ribeirão Preto** e não na capital:
     na agenda dele Ribeirão Preto vem antes. Se ele preferir a capital primeiro, é
     trocar a ordem dos dois nomes aqui e nada mais.

     ⚠ NÃO EXISTE data, horário nem nome de VIP escrito neste arquivo, e é de propósito.
     Tudo isso já está DENTRO do banner de cada cidade (16/08, check-in 14h00, início
     14h30, local a confirmar, "Presença VIP" com nome e cargo). Escrever de novo aqui
     criaria a armadilha número um desta base: o mesmo dado em dois lugares, discordando
     com o tempo — já aconteceu com "750 mil" no texto contra `data-target="750"` no
     atributo. O dono reexporta o banner e a seção acompanha sem ninguém tocar em código.
     `arquivo` é o nome do .jpg SEM extensão, dentro de assets/img/summit/.
     --------------------------------------------------------------------------- */
  var CIDADES = {
    MG: [ { cidade:"Belo Horizonte", arquivo:"Belo Horizonte" },
          { cidade:"Uberlândia",     arquivo:"Uberlândia" } ],
    SP: [ { cidade:"Ribeirão Preto", arquivo:"Ribeirão Preto" },
          { cidade:"São Paulo",      arquivo:"São Paulo" },
          { cidade:"Campinas",       arquivo:"Campinas" } ],
    RS: [ { cidade:"Porto Alegre",   arquivo:"Porto Alegre" },
          { cidade:"Pelotas",        arquivo:"Pelotas" } ],
    PR: [ { cidade:"Curitiba",       arquivo:"Curitiba" } ],
    BA: [ { cidade:"Salvador",       arquivo:"Salvador" } ],
    SC: [ { cidade:"Florianópolis",  arquivo:"Florianópolis" } ],
    RJ: [ { cidade:"Rio de Janeiro", arquivo:"Rio de Janeiro" } ],
    GO: [ { cidade:"Goiânia",        arquivo:"Goiânia" } ],
    ES: [ { cidade:"Vitória",        arquivo:"Vitória" } ],
    TO: [ { cidade:"Palmas",         arquivo:"Palmas" } ],
    MT: [ { cidade:"Cuiabá",         arquivo:"Cuiabá" } ],
    AL: [ { cidade:"Maceió",         arquivo:"Maceió" } ],
    CE: [ { cidade:"Fortaleza",      arquivo:"Fortaleza" } ],
    PI: [ { cidade:"Teresina",       arquivo:"Teresina" } ],
    /* ⚠ NATAL TEM DOIS EVENTOS, E ISSO É NOVO NESTE ARQUIVO (2026-09-12). Até aqui, estado
       com mais de uma entrada eram CIDADES diferentes (SP tem Ribeirão, São Paulo e Campinas;
       RS tem Porto Alegre e Pelotas). Aqui são DUAS DATAS NA MESMA CIDADE: 18/10 e 25/10, com
       o mesmo VIP. Conferido abrindo os dois banners.
       As duas entradas se chamam "Natal" de propósito: a data NÃO se escreve aqui — ela mora
       dentro do banner, e essa é a regra registrada no topo deste arquivo. No card as duas
       páginas leem "Natal – RN" e quem as separa é o contador (01/02, 02/02) e a arte.
       ⚠ CONSEQUÊNCIA NA CONTAGEM: passam a ser 28 EVENTOS em 27 CIDADES. O <h2> da seção diz
       "27 cidades" e continua CERTO — Natal é uma cidade só. Se alguém quiser exibir 28, o
       texto tem de virar "eventos", não "cidades". */
    /* ⚠ E VOLTOU A SER UM EM 2026-10-14. A rodada nova de banners (pasta `Slides/` dentro de
       `Banner próximo evento/`, 27 arquivos, um por cidade) traz UM Natal só, 24/10 sábado, com
       o Calebe Durante. Conferido abrindo a arte, não deduzido pela falta do arquivo. O
       `Natal 2.jpg` saiu de `assets/img/summit/` junto: deixar lá seria um banner de data
       vencida esperando alguém religar a linha. A história acima fica porque explica por que
       o card SABE lidar com duas datas na mesma cidade — se voltar, é só a segunda linha. */
    RN: [ { cidade:"Natal",          arquivo:"Natal" } ],
    PE: [ { cidade:"Recife",         arquivo:"Recife" } ],
    MS: [ { cidade:"Campo Grande",   arquivo:"Campo Grande" } ],
    AM: [ { cidade:"Manaus",         arquivo:"Manaus" } ],
    PA: [ { cidade:"Belém",          arquivo:"Belém" } ],
    /* ⚠ BRASÍLIA E JOÃO PESSOA ENTRARAM EM 2026-09-09, com a rodada de OUTUBRO: 25 -> 27
       cidades e 21 -> 23 estados. Estas DUAS criaram estado novo, ao contrário de Campinas e
       Pelotas — o DF e a PB estavam no SVG como `class="sm-uf is-off"`, apagados e sem
       clique. Ligar um estado é tirar o `is-off` e dar a ele `data-uf`, `tabindex="0"`,
       `role="button"` e o aria-label de "ver evento do Summit"; os quatro que continuam
       apagados (AC, AP, RO, RR) passaram a dizer "sem evento em OUTUBRO".
       ⚠ Entraram no FIM desta lista porque não recebi a arte nova da agenda — a ordem daqui
       segue a ordem das colunas dela. Se a agenda de outubro puser Brasília antes, é trocar
       a posição aqui e nada mais.

       ⚠ CAMPINAS E PELOTAS ENTRARAM EM 2026-08-15, levando o mapa de 23 para 25 cidades.
       ⚠ E ELAS NÃO CRIARAM ESTADO NOVO — foi o próprio dono quem avisou ("lembrando dos
       estados que são diferentes"): Campinas é a TERCEIRA de SP (com Ribeirão Preto e São
       Paulo) e Pelotas é a SEGUNDA do RS (com Porto Alegre). Continuam 21 estados. Quem
       tratar isto como "duas UFs novas" vai procurar polígono que já existe e não achar
       nada errado — o mapa não muda, só o card daquele estado ganha mais uma seta.
       ⚠ Entraram no FIM da lista do estado, que é a ordem em que aparecem no card. Se o dono
       quiser outra ordem, é trocar a posição aqui e nada mais.

       ⚠ SE e MA ENTRARAM EM 2026-08-13, levando o mapa de 21 para 23 cidades. Pedido do dono:
       *"na parte do mapa, agora serão 23 cidades"*, com os dois banners novos na pasta.
       Foram as ÚNICAS duas a entrar — nenhuma cidade saiu, conferido comparando as 23 da pasta
       com as 21 que o site servia. */
    /* ⚠ ARACAJU SAIU EM 2026-11-06, e é TEMPORÁRIO. A rodada de dezembro veio com 26 banners e
       sem o de Aracaju; o dele era de 08/11. Escolha do dono: *"apagar Sergipe no mapa"* até a
       arte chegar. Sergipe voltou a `is-off` no SVG e o <h2> foi para 26 cidades.
       PARA RELIGAR: descomente a linha abaixo, devolva ao `#sm-SE` o `data-uf="SE"`,
       `tabindex="0"`, `role="button"` e o aria-label "Sergipe — ver evento do Summit", tire o
       `is-off`, e volte o <h2> para 27. O `Aracaju.jpg` ficou na pasta (é só sobrescrever). */
    /* SE: [ { cidade:"Aracaju",        arquivo:"Aracaju" } ], */
    MA: [ { cidade:"São Luís",       arquivo:"São Luís" } ],
    DF: [ { cidade:"Brasília",       arquivo:"Brasília" } ],
    PB: [ { cidade:"João Pessoa",    arquivo:"João Pessoa" } ]
  };

  var BASE = "assets/img/summit/", EXT = ".jpg";
  /* ⚠ MESMA PROTECAO DA GALERIA DO ECOSSISTEMA, e pela mesma razao: `/assets/*` fica um dia
     no cache do navegador (netlify.toml), e banner de evento e SOBRESCRITO com o mesmo nome
     quando a data ou o VIP muda. Sem versao na URL, o dono reexporta, sobe, e continua vendo
     o banner velho — foi exatamente o que aconteceu com `green/Slide40` em 2026-08-12.
     Aqui ainda nao mordeu, e e para nao morder. SUBA se sobrescrever qualquer banner. */
  /* 2026-10-14: os 27 banners foram SOBRESCRITOS com a rodada de outubro (mesmos nomes) —
     exatamente o caso deste aviso. 2026-10-15: de novo, com a rodada de NOVEMBRO (07/11 e 08/11).
     2026-11-06: de novo, com a rodada de DEZEMBRO (12/12 e 13/12) — 26 de 27, sem Aracaju (SE apagado no mapa). */
  var VER = "?v=20261106";
  /* ⚠ URL DE INSCRIÇÃO — CONFIRMADA PELO DONO EM 2026-08-13, e era uma pergunta aberta minha.
     Eu havia LIDO a raiz do domínio na arte da agenda dele ("eventos.igreenenergy.com.br/") e
     deixado marcado como PERGUNTA ABERTA, justamente porque endereço de inscrição raramente é
     a raiz. Estava incompleto: a página certa é a do evento de setembro. Ele mandou o link.
     Fica o método: link que eu leio de uma imagem entra marcado como suposição até alguém
     confirmar — e neste caso a suposição levaria quem clicasse para a home, não para a
     inscrição, sem erro nenhum aparecendo.
     ⚠ Domínio da própria iGreen, não de terceiro (regra do DESIGN.md). */
  var URL_INSCRICAO = "https://eventos.igreenenergy.com.br/igreen-summit-setembro-2026-1";

  var secao = null, svg = null, card = null, scrim = null, visor = null;
  var ufAtual = "", pagina = 0;

  /* codifica só o NOME. A pasta e o BASE ficam crus: uma barra codificada (%2F) deixaria
     de ser separador de caminho e quebraria a URL inteira. Mesma nota da galeria do
     ecossistema, e aqui ela É necessária — todo nome com acento passa por isso, e
     "Belo Horizonte" tem espaço. */
  function caminhoDe(nome){ return BASE + encodeURIComponent(nome) + EXT + VER; }

  function listaDe(uf){ return CIDADES[uf] || []; }
  function total(uf){ return listaDe(uf).length; }

  /* ---------------------------------------------------------------------------
     MONTA O CARD E O VISOR uma vez, no primeiro uso
     ---------------------------------------------------------------------------
     Não no carregamento da página: são nós que ninguém vê até alguém clicar num estado,
     e o boot deste projeto é medido (LCP ~530ms). Mesmo critério do `#ecoGalModal`.
     --------------------------------------------------------------------------- */
  function monta(){
    if (card) return;

    card = document.createElement("div");
    card.className = "sm-card";
    card.id = "smCard";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-labelledby", "smCardTitulo");
    card.innerHTML =
        '<button class="sm-fechar" type="button" aria-label="Fechar">&times;</button>'
      + '<button class="sm-seta sm-ant" type="button" aria-label="Cidade anterior">&lsaquo;</button>'
      + '<button class="sm-seta sm-pro" type="button" aria-label="Próxima cidade">&rsaquo;</button>'
      + '<button class="sm-midia" type="button" aria-label="Ampliar o banner do evento">'
      +   '<span class="sm-badge"></span>'
      +   '<img class="sm-img" src="" alt="" width="1920" height="1080" decoding="async">'
      +   '<span class="sm-lupa">ampliar</span>'
      + '</button>'
      + '<div class="sm-corpo">'
      +   '<h3 class="sm-titulo" id="smCardTitulo"></h3>'
      +   '<p class="sm-conta"></p>'
      +   '<a class="sm-cta" href="' + URL_INSCRICAO + '" target="_blank" rel="noopener">Fazer inscrição</a>'
      + '</div>';

    scrim = document.createElement("div");
    scrim.className = "sm-scrim";

    /* O VISOR DE TELA CHEIA. `object-fit:contain` e nunca cover: o banner é um flyer com
       texto e QR code nos cantos — cortar borda aqui é cortar informação, a mesma razão
       pela qual o visor do ecossistema é contain. */
    visor = document.createElement("div");
    visor.className = "sm-visor";
    visor.setAttribute("aria-hidden", "true");
    visor.innerHTML =
        '<button class="sm-visor-fechar" type="button" aria-label="Fechar">&times;</button>'
      + '<img class="sm-visor-img" src="" alt="" width="1920" height="1080" decoding="async">';

    /* ============================================================
       ⚠ A CORTINA MORA DENTRO DA SEÇÃO, E NÃO NO <body>. NÃO MOVA DE VOLTA.
       ------------------------------------------------------------
       Ela estava em `document.body` e isso PINTAVA POR CIMA DO CARD no celular. Sintoma do
       dono, com print de Cuiabá: *"nao esta dando cor parece estar com uma trava de fundo"* —
       o banner saía lavado, como se tivesse um véu escuro em cima. E tinha: os
       `rgba(4,6,4,.55)` da cortina.

       A causa é EMPILHAMENTO, não cor. O `.sm-in` é `position:relative; z-index:1` (ele existe
       para o conteúdo ficar acima do circuito), e isso cria um CONTEXTO DE EMPILHAMENTO. O card
       nasce dentro dele, então o `z-index:130` do card só vale ali dentro — contra a página
       inteira, o bloco todo vale **1**. A cortina, filha do `<body>`, valia **15**. 15 > 1, e
       ela subia por cima de tudo.

       Medido: `elementFromPoint` no meio do banner devolvia `DIV.sm-scrim`, não a imagem.

       Trazendo a cortina para DENTRO do mesmo contexto, a comparação passa a ser 15 contra 130
       e o card volta a ficar na frente. Ela continua `position:fixed; inset:0` cobrindo a tela
       inteira — não há ancestral transformado no caminho (conferido) — então cobrir e receber
       o toque de fechar seguem funcionando igual.

       ⚠ SÓ APARECIA NO CELULAR porque a cortina é `opacity:0` fora do bloco mobile. No desktop
       ela nunca acendeu, e por isso o defeito ficou meses invisível.

       ⚠ O DESTINO É O `.sm-in`, NÃO O `#summit`. Pendurar no `#summit` não resolve nada: ele é
       `position:relative` com `z-index:auto`, e isso NÃO cria contexto — a cortina continuaria
       comparando 15 contra o 1 do `.sm-in` na página, e continuaria vencendo. Só entrando no
       MESMO contexto do card a comparação vira 15 contra 130. */
    (secao.querySelector(".sm-in") || secao).appendChild(scrim);
    document.body.appendChild(visor);
    secao.querySelector(".sm-palco").appendChild(card);

    card.querySelector(".sm-fechar").addEventListener("click", function(e){ e.stopPropagation(); fechar(); });
    card.querySelector(".sm-ant").addEventListener("click", function(e){ e.stopPropagation(); vaiPara(pagina - 1); });
    card.querySelector(".sm-pro").addEventListener("click", function(e){ e.stopPropagation(); vaiPara(pagina + 1); });
    card.querySelector(".sm-midia").addEventListener("click", function(e){ e.stopPropagation(); abreVisor(); });
    scrim.addEventListener("click", fechar);
    visor.querySelector(".sm-visor-fechar").addEventListener("click", function(e){ e.stopPropagation(); fechaVisor(); });
    visor.addEventListener("click", fechaVisor);
  }

  /* ---------------------------------------------------------------------------
     DESENHA A CIDADE ATUAL
     ---------------------------------------------------------------------------
     Troca o `src` de um <img> que já existe em vez de recriar o nó: o navegador mantém
     o quadro anterior desenhado até o novo estar pronto e a troca não pisca. Recriando,
     existe um quadro com a caixa vazia — numa tela de apresentação isso lê como falha.
     (Lição já registrada no `desenha()` da galeria do ecossistema.)
     --------------------------------------------------------------------------- */
  function desenha(){
    var lista = listaDe(ufAtual);
    if (!lista.length) return;
    var ev = lista[pagina], n = lista.length;

    var img = card.querySelector(".sm-img");
    img.src = caminhoDe(ev.arquivo);
    img.alt = "iGreen Summit em " + ev.cidade + " – " + ufAtual;
    card.querySelector(".sm-badge").textContent = ufAtual;
    card.querySelector(".sm-titulo").textContent = ev.cidade + " – " + ufAtual;

    /* contador só onde ele informa algo: com uma cidade, "01 / 01" é ruído. Mesma
       decisão das bolinhas do ecossistema, que só aparecem quando há mais de uma. */
    var conta = card.querySelector(".sm-conta");
    conta.textContent = (n > 1) ? (String(pagina + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0")) : "";
    conta.style.display = (n > 1) ? "" : "none";

    var umaSo = (n <= 1);
    card.querySelector(".sm-ant").style.display = umaSo ? "none" : "";
    card.querySelector(".sm-pro").style.display = umaSo ? "none" : "";

    /* pré-carrega a próxima cidade do MESMO estado (só existe em MG e SP). Cada banner é
       ~360kB; sem isto o dono clica na seta e espera. Só a seguinte, não o estado todo. */
    if (pagina + 1 < n){
      var prox = new Image(); prox.decoding = "async"; prox.src = caminhoDe(lista[pagina + 1].arquivo);
    }
  }

  function vaiPara(p){
    var n = total(ufAtual);
    if (!n || p < 0 || p >= n || p === pagina) return false;
    pagina = p; desenha();
    if (visorAberto()) visor.querySelector(".sm-visor-img").src = caminhoDe(listaDe(ufAtual)[pagina].arquivo);
    return true;
  }

  /* ---------------------------------------------------------------------------
     POSIÇÃO DO CARD (desktop) — no mobile o CSS o transforma em gaveta
     ---------------------------------------------------------------------------
     Mantive a conta do componente original, com um acréscimo: ela é chamada também no
     `resize`, coalescida num quadro. E o `getBoundingClientRect` do estado é lido UMA
     vez por abertura — ler por quadro seria trabalho de layout por quadro, que é a causa
     número um de engasgo neste projeto.
     --------------------------------------------------------------------------- */
  function posiciona(el){
    var palco = secao.querySelector(".sm-palco");
    if (!palco || !el) return;
    var P = palco.getBoundingClientRect(), b = el.getBoundingClientRect();
    var w = card.offsetWidth, h = card.offsetHeight;
    var x = b.right - P.left + 18;
    if (x + w > P.width) x = Math.max(8, b.left - P.left - w - 18);
    if (x < 0) x = Math.max(8, P.width - w - 8);
    var y = b.top - P.top + b.height / 2 - h / 2;
    y = Math.max(0, Math.min(y, Math.max(0, P.height - h)));
    card.style.left = x + "px";
    card.style.top  = y + "px";
  }

  function acende(uf){
    var todos = svg.querySelectorAll(".sm-uf.is-active");
    for (var i = 0; i < todos.length; i++) todos[i].classList.remove("is-active");
    var el = svg.querySelector('.sm-uf[data-uf="' + uf + '"]');
    if (el) el.classList.add("is-active");
    return el;
  }

  /* ---------------------------------------------------------------------------
     ABRIR / FECHAR
     ---------------------------------------------------------------------------
     ⚠ ESTA FUNÇÃO ESTABELECE O ESTADO COMPLETO, sempre — estado aceso, página, imagem.
     Não confia em nada que outra chamada tenha deixado pronto. É a regra que o CLAUDE.md
     cobra de toda peça que a apresentação controla ("parada tem de ser AUTOSSUFICIENTE"),
     e ela existe porque a galeria das graduações falhou justamente por confiar: funcionava
     indo para a frente e mostrava o nível vizinho indo para trás.
     --------------------------------------------------------------------------- */
  function abrir(uf, p){
    if (!total(uf)) return false;
    monta();
    /* a dica cumpriu o papel — some por QUALQUER caminho que abra um estado (clique,
       teclado, modo apresentação), e não só pelo listener do clique */
    var dica0 = secao && secao.querySelector(".sm-toque");
    if (dica0) dica0.classList.add("used");
    ufAtual = uf;
    pagina = Math.max(0, Math.min(total(uf) - 1, p | 0));
    desenha();
    var el = acende(uf);
    card.classList.add("is-open");
    scrim.classList.add("is-open");
    /* ⚠ A MARCA VAI NA SEÇÃO, e não só no card, porque quem precisa subir de camada no
       celular é o `.sm-in` INTEIRO — e CSS não sabe selecionar um ancestral a partir do
       filho. Ver o comentário grande da regra `#summit.sm-aberto .sm-in` no index.html. */
    secao.classList.add("sm-aberto");
    /* posiciona DEPOIS de abrir: com o card em display:none o offsetWidth é 0 e a conta
       jogaria ele para o canto. Lê a largura já com ele montado. */
    posiciona(el);
    return true;
  }

  function fechar(){
    if (!card) return;
    fechaVisor();
    card.classList.remove("is-open");
    scrim.classList.remove("is-open");
    if (secao) secao.classList.remove("sm-aberto");
    var todos = svg.querySelectorAll(".sm-uf.is-active");
    for (var i = 0; i < todos.length; i++) todos[i].classList.remove("is-active");
    ufAtual = ""; pagina = 0;
  }

  function aberto(){ return !!(card && card.classList.contains("is-open")); }

  function abreVisor(){
    if (!ufAtual) return;
    var ev = listaDe(ufAtual)[pagina]; if (!ev) return;
    var im = visor.querySelector(".sm-visor-img");
    im.src = caminhoDe(ev.arquivo);
    im.alt = "iGreen Summit em " + ev.cidade + " – " + ufAtual;
    visor.classList.add("is-open");
    visor.setAttribute("aria-hidden", "false");
  }
  function fechaVisor(){
    if (!visor) return;
    visor.classList.remove("is-open");
    visor.setAttribute("aria-hidden", "true");
  }
  function visorAberto(){ return !!(visor && visor.classList.contains("is-open")); }

  /* ---------------------------------------------------------------------------
     LIGA OS EVENTOS
     --------------------------------------------------------------------------- */
  function liga(){
    secao = document.getElementById("summit");
    if (!secao) return;
    svg = secao.querySelector(".sm-mapa");
    if (!svg) return;

    /* Um listener no SVG cobre os 27 estados por delegação — 27 listeners seriam 27
       fechamentos vivos sem ganho nenhum. O `.is-off` cai fora aqui: `[data-uf]` só
       existe nos 19 com evento, então estado sem evento não abre nada. */
    /* ============================================================
       A DICA "DÁ PARA CLICAR" (2026-08-14)
       ------------------------------------------------------------
       Pedido do dono: *"adicione esse popup no mapa para a pessoa entender que pode
       clicar"*. É a mesma pílula das barras das Graduações — visual no `index.html`.

       ⚠ O TEXTO É ESCOLHIDO AQUI, e não em duas versões no CSS. `(hover:hover)` pergunta
       pelo APONTADOR, não pela largura da tela: um notebook estreito continua "Clique" e
       um tablet largo continua "Toque". Largura acertaria a maioria e erraria justamente
       os casos em que o dono apresenta — notebook espelhado num telão.
       ⚠ A dica nasce VAZIA no HTML e o CSS a esconde com `:empty`. Sem este script não
       aparece pílula prometendo uma interação que ninguém ligou.
       ⚠ Ela some no PRIMEIRO estado aberto, por qualquer caminho — clique, teclado ou a
       apresentação. Por isso o `.used` mora no `abrir()`, e não neste listener: quem
       chega pelo Enter ou pelo modo apresentação também já entendeu o recado. */
    var dica = secao.querySelector(".sm-toque");
    if (dica) {
      var toque = !(window.matchMedia && window.matchMedia("(hover:hover)").matches);
      dica.innerHTML = '<span class="smd-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<path d="M9 11V6a2 2 0 1 1 4 0v5"/><path d="M13 8a2 2 0 0 1 4 0v3"/>'
        + '<path d="M17 9.5a2 2 0 0 1 4 0V15a6 6 0 0 1-6 6h-2a6 6 0 0 1-5.2-3l-2.3-4a2 2 0 0 1 3.4-2L9 12"/>'
        + '</svg>' + (toque ? "Toque" : "Clique") + ' num estado para ver o evento</span>';
    }

    /* ============================================================
       O NOME DO ESTADO NO PASSAR DO MOUSE (2026-09-01)
       ------------------------------------------------------------
       Pedido do dono: *"quando a pessoa passar o mouse, aparece o nome do estado"*.

       ⚠ O NOME SAI DO `aria-label`, e nao de uma lista nova. Cada poligono ja tem
       `aria-label="Alagoas — ver evento do Summit"` (ou "— sem evento em setembro"), entao o
       nome e o que vem ANTES do travessao. Escrever os 27 nomes de novo aqui criaria a
       armadilha n1 desta base: o mesmo dado em dois lugares, discordando com o tempo.
       ⚠ Corta no travessao "—" (U+2014), NAO no hifen: ha nomes com hifen no meio em outras
       listas do projeto, e um `split('-')` quebraria neles.

       ⚠ A POSICAO E RELATIVA A `.sm-cena`, calculada a cada movimento. Nao da para usar
       `position:fixed` com as coordenadas do cursor: no desktop o ScrollSmoother poe um
       `transform` no `#smooth-content` e elemento `fixed` dentro de ancestral transformado se
       posiciona contra ESSE ancestral. Foi o defeito de 2026-08-14 que mandou o card do
       Summit para 13.500px numa tela de 844.

       ⚠ UM rAF POR QUADRO, no maximo. `mousemove` dispara dezenas de vezes por segundo e
       escrever `style.transform` em cada um e trabalho por quadro — o que engasga o notebook
       do dono, segundo o CLAUDE.md. Coalescido: o evento so guarda a coordenada.

       ⚠ TAMBEM NO TECLADO (`focusin`), centrado no estado em foco. Quem navega por Tab tem
       direito a mesma informacao, e a apresentacao usa Tab em nada — nao ha conflito.
       ============================================================ */
    (function(){
      var etiq = secao.querySelector(".sm-uf-nome");
      var cena = secao.querySelector(".sm-cena");
      if (!etiq || !cena) return;
      /* ⚠ A CAIXA DA CENA E LIDA UMA VEZ E GUARDADA. A primeira versao chamava
         `getBoundingClientRect()` DENTRO do `mousemove`, e ler geometria forca o navegador a
         recalcular o leiaute — dezenas de vezes por segundo, com o cursor andando pelo mapa.
         E o "trabalho por quadro" que o CLAUDE.md aponta como a causa real de engasgo aqui.
         Guardada, a conta por evento vira duas subtracoes.
         ⚠ E invalidada quando a caixa pode ter mudado: rolagem, redimensionamento e cada
         entrada do cursor no mapa. Nao ha caminho em que ela mude sem passar por um desses.
         ⚠ ESCREVE O `transform` NA HORA, sem `requestAnimationFrame`. A versao com rAF era
         mais elegante no papel e INVERIFICAVEL neste ambiente: medido, o `style.transform`
         ficava VAZIO porque o rAF da janela ocluida roda a 1 fps — eu teria entregado
         "posiciona junto ao cursor" sem nunca ter visto acontecer. Sem a leitura de geometria
         no meio, uma escrita de transform por evento nao forca leiaute: o navegador agrupa
         tudo antes de pintar. Trocar elegancia teorica por verificacao real e o certo aqui. */
      var cx = null;
      function caixa(){ if (!cx) cx = cena.getBoundingClientRect(); return cx; }
      function invalida(){ cx = null; }
      window.addEventListener("scroll", invalida, { passive:true });
      window.addEventListener("resize", invalida);
      svg.addEventListener("mouseenter", invalida);

      function nomeDe(el){
        var a = el.getAttribute("aria-label") || "";
        var i = a.indexOf("\u2014");            /* travessao, nao hifen */
        return (i > 0 ? a.slice(0, i) : a).trim();
      }
      function mostra(el, x, y){
        var t = nomeDe(el);
        if (!t) return;
        if (etiq.textContent !== t) etiq.textContent = t;
        /* acima do cursor e centrada nele; o `-50%` cuida da largura, que varia com o nome
           (de "Bahia" a "Distrito Federal") */
        etiq.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px) translate(-50%,-125%)";
        etiq.classList.add("on");
      }
      function esconde(){ etiq.classList.remove("on"); }

      svg.addEventListener("mousemove", function(e){
        var uf = e.target.closest(".sm-uf");
        if (!uf){ esconde(); return; }
        var c = caixa();
        mostra(uf, e.clientX - c.left, e.clientY - c.top);
      });
      /* sair do SVG apaga; sem isso a etiqueta fica parada na ultima posicao */
      svg.addEventListener("mouseleave", esconde);
      /* e o teclado: centrada no proprio estado */
      svg.addEventListener("focusin", function(e){
        var uf = e.target.closest && e.target.closest(".sm-uf");
        if (!uf) return;
        var b = uf.getBoundingClientRect(), c = caixa();
        mostra(uf, b.left - c.left + b.width/2, b.top - c.top);
      });
      svg.addEventListener("focusout", esconde);
    })();

    svg.addEventListener("click", function(e){
      var uf = e.target.closest(".sm-uf[data-uf]");
      if (uf) abrir(uf.getAttribute("data-uf"), 0);
    });

    /* ============================================================
       ⚠ A GUARDA DA APRESENTAÇÃO VEM PRIMEIRO. NÃO TIRE.
       ------------------------------------------------------------
       ESPAÇO e as SETAS são teclas de avanço da apresentação (e o passador de slide do
       dono manda justamente essas, variando por modelo). Sem esta linha, um estado com
       foco engoliria o espaço: o dono aperta o passador e a tela não anda. O CLAUDE.md
       registra os quatro tratadores de teclado do projeto e o estrago que deu quando um
       deles ficou sem a guarda.
       ============================================================ */
    svg.addEventListener("keydown", function(e){
      if (window.__pmode && window.__pmode.isActive && window.__pmode.isActive()) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      var uf = e.target.closest && e.target.closest(".sm-uf[data-uf]");
      if (!uf) return;
      e.preventDefault();
      abrir(uf.getAttribute("data-uf"), 0);
    });

    document.addEventListener("keydown", function(e){
      if (window.__pmode && window.__pmode.isActive && window.__pmode.isActive()) return;
      if (!aberto()) return;
      if (e.key === "Escape"){ e.preventDefault(); visorAberto() ? fechaVisor() : fechar(); return; }
      /* setas passam de cidade só onde há duas (MG e SP) e só fora da apresentação */
      if (e.key === "ArrowRight"){ if (vaiPara(pagina + 1)) e.preventDefault(); }
      else if (e.key === "ArrowLeft"){ if (vaiPara(pagina - 1)) e.preventDefault(); }
    });

    /* ============================================================
       A ANIMACAO SO RODA COM A SECAO NA TELA (2026-08-12)
       ------------------------------------------------------------
       Pedido do dono: *"veja uma forma de ter fundo animado suave e as linhas do mapas
       elas fiquem passando animada"*. O desenho do movimento mora no CSS (`.sm-anima`);
       aqui mora a unica coisa que o CSS nao sabe fazer sozinho: DESLIGAR quando ninguem
       esta vendo.

       ⚠ ISTO NAO E MICRO-OTIMIZACAO. A #summit e a ultima secao de uma pagina de ~33 MIL
       pixels de altura. Sem esta guarda, a bruma do fundo e os 15 pulsos rodariam durante
       a apresentacao INTEIRA — dezenas de minutos ao vivo, gastando quadro num conteudo a
       trinta mil pixels de distancia. O dono testa num notebook modesto e sente engasgo
       antes de qualquer metrica.
       E o mesmo padrao do js/video-inview.js, que existe neste projeto pela mesma razao:
       "zero video decodificando invisivel" e uma das metas de desempenho do CLAUDE.md.

       `rootMargin` de 200px liga um pouco ANTES de entrar: quem chega rolando ja encontra
       o circuito em movimento, sem o solavanco de a animacao comecar do zero na cara.
       Sem IntersectionObserver (navegador antigo), liga e deixa ligado — melhor animar
       sempre do que nao animar nunca. */
    /* ⚠ A CLASSE VAI NA PROPRIA SECAO, e nao na `.sm-cena` como na primeira versao. Mudou
       em 2026-08-12 junto com o circuito, que deixou de viver dentro da caixa do mapa e
       passou a cobrir a secao inteira (o dono pediu as linhas indo ate as bordas). A bruma
       do fundo seguiu junto. Se a classe tivesse ficado na cena, o seletor CSS nao
       alcancaria mais nem o circuito nem a bruma — e a animacao sumiria calada. */
    if (window.IntersectionObserver){
      new IntersectionObserver(function(ents){
        for (var i = 0; i < ents.length; i++)
          secao.classList.toggle("sm-anima", ents[i].isIntersecting);
      }, { rootMargin: "200px 0px" }).observe(secao);
    } else {
      secao.classList.add("sm-anima");
    }

    var raf = 0;
    window.addEventListener("resize", function(){
      if (!aberto() || !ufAtual) return;
      if (raf) return;
      raf = requestAnimationFrame(function(){ posiciona(svg.querySelector('.sm-uf[data-uf="' + ufAtual + '"]')); raf = 0; });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", liga);
  else liga();

  /* ---------------------------------------------------------------------------
     API — mesma forma da IGREEN_ECO_GAL, de propósito
     ---------------------------------------------------------------------------
     Se um dia o dono quiser percorrer as 21 cidades na apresentação (hoje a seção tem
     UMA parada, só de enquadramento), o `buildStops` do presentation-mode encontra aqui
     tudo o que a do ecossistema encontra: quantas páginas tem, como abrir numa página
     específica, e como fechar. Nada de novo para aprender.
     --------------------------------------------------------------------------- */
  window.IGREEN_SUMMIT = {
    abrir: abrir,
    fechar: fechar,
    aberto: aberto,
    paginas: function(uf){ return total(uf); },
    pagina: function(){ return pagina; },
    uf: function(){ return ufAtual; },
    estados: function(){ return Object.keys(CIDADES); },
    cidades: function(){
      var out = [];
      Object.keys(CIDADES).forEach(function(uf){
        CIDADES[uf].forEach(function(c, i){ out.push({ uf:uf, cidade:c.cidade, pagina:i, arquivo:caminhoDe(c.arquivo) }); });
      });
      return out;
    },
    visorAberto: visorAberto,
    abreVisor: abreVisor,
    fechaVisor: fechaVisor
  };
})();
