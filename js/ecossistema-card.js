/* ============================================================================
   POP-UP DO CARD DA CONEXÃO — modo apresentação
   ============================================================================
   PEDIDO DO DONO (2026-09-14): *"quando cair em cada uma das conexões, num
   próximo clique ele expande um pop-up do card da conexão para ficar mais
   visível. E aí depois num próximo clique ele sai e entra nas telas de
   apresentações caso eu tiver; caso não tiver, num próximo clique ele pula
   para a próxima conexão."*

   O PROBLEMA QUE ISSO RESOLVE: no baralho do ecossistema o card em foco tem
   `clamp(266px,18vw,430px)` de largura, e a lista de benefícios sai em 12,5px.
   Numa sala, projetado, ninguém do fundo lê. Este pop-up é o mesmo card, maior.

   O QUE ELE NÃO É: não é uma tela nova, e não tem conteúdo próprio. Ele CLONA o
   card que já está na seção. Isso é decisão de manutenção, não preguiça — quando
   o dono mudar um benefício no card, o pop-up muda junto, sozinho. Um segundo
   lugar com o mesmo texto seria um segundo lugar para esquecer de atualizar.

   ------------------------------------------------------------
   TRÊS DECISÕES QUE PARECEM DETALHE E NÃO SÃO
   ------------------------------------------------------------
   1. O VÍDEO TOCA — mas o modo leve fica com a imagem do poster.
      ⚠ ESTA DECISÃO JÁ FOI A CONTRÁRIA, no mesmo dia, e o texto que estava aqui
      dizia o oposto: "o clone troca <video> por <img> do poster", sempre.
      O raciocínio original continua válido e vale relê-lo: medido em 2026-09-14, o
      site é limitado por DESENHO e não por processador — num PC sem aceleração de
      vídeo ele cai a 14 fps justamente no ecossistema, onde já há 14 vídeos na tela,
      então clonar mais um decodificador é acrescentar carga onde já não cabe.
      O que faltava era o outro lado: o dono viu rodando e disse *"eu clico funciona
      normal mais o video ta pausado parece como imagem"*. Num card que ocupa a tela
      inteira, vídeo parado não lê como economia — lê como falha de carregamento.
      O acordo é por máquina, não por gosto: no modo completo o vídeo toca (+1
      decodificador, liberado ao fechar); com `data-perf=low` fica o poster.
      É o primeiro uso do modo leve para degradar CONTEÚDO em vez de só cortar
      enfeite — e a máquina que perde o vídeo é exatamente a que já travava aqui.

   2. O FUNDO NÃO TEM `backdrop-filter`.
      A galeria das graduações usa `blur(8px)` no fundo dela, e seria natural
      copiar. Não copiei: um desfoque de fundo de TELA CHEIA é o efeito mais caro
      que existe nessa mesma máquina que já está em 14 fps. Um preto translúcido
      a 92% esconde o fundo igual e não custa nada.

   3. NA APRESENTAÇÃO O POP-UP NÃO TEM BOTÃO DE FECHAR, NEM FECHA POR CLIQUE, NEM ESCUTA TECLA.
      ⚠ ATÉ 2026-10-08 ISTO VALIA SEMPRE, e o texto dizia só "o pop-up não tem botão de
      fechar". Desde então o cartão ampliado também abre FORA da apresentação (clique no
      cartão, pedido do dono trazido da APN Digital) — e fora dela ele PRECISA fechar: ganhou
      um ✕, o fundo e o Esc. Os três só existem fora da apresentação (o ✕ fica escondido pela
      classe `fora-da-apresentacao`, que o `abrir()` liga ou desliga), e quem trata os cliques
      e o Esc NÃO é este arquivo: é o `ligaCliques` do js/ecossistema-galeria.js, com a guarda
      do `__pmode` — um dono só para os cliques do ecossistema. Dentro da apresentação, vale
      tudo o que está escrito abaixo:
      Quem manda nele é a APRESENTAÇÃO, e só ela. Se ele pudesse ser fechado por
      fora, a apresentação continuaria achando que está na parada do pop-up e o
      clique seguinte iria para a galeria com a tela já limpa — o apresentador
      veria um clique "sumir". É a falha de dois donos descrita no CLAUDE.md, que
      nunca aparece como erro no console, só como comando que não anda.
      E não escutar tecla é o que dispensa a guarda `__pmode.isActive()` que as
      OUTRAS CINCO peças sobrepostas deste projeto precisam ter. A peça mais
      segura é a que não disputa o teclado com ninguém.
   ============================================================================ */
(function(){
  "use strict";

  var modal = null, palco = null, atual = -1;

  /* O baralho VIVO é o `#ecossistema2` (clone criado em index.html) — é ele que a
     apresentação percorre e é dele que o índice `i` vem. O `#ecossistema` original
     é o fallback do mobile, onde não existe clone. */
  function secao(){
    return document.getElementById("ecossistema2") || document.getElementById("ecossistema");
  }
  function cards(){
    var s = secao();
    return s ? s.querySelectorAll(".ecard") : [];
  }

  function monta(){
    if(modal) return modal;
    modal = document.createElement("div");
    modal.className = "eco-card-modal";
    modal.id = "ecoCardModal";
    modal.setAttribute("aria-hidden","true");
    /* o ✕ só aparece FORA da apresentação (ver a decisão 3 no cabeçalho). Sem listener aqui:
       quem trata o clique nele é o `ligaCliques` do js/ecossistema-galeria.js. */
    modal.innerHTML = '<div class="ecm-backdrop"></div><div class="ecm-palco"></div>'
      + '<button class="ecm-fechar" type="button" aria-label="Fechar">✕</button>';
    /* No BODY, não na seção. `position:fixed` dentro de `#smooth-content` resolveria
       contra o ancestral com transform em vez da janela, e o pop-up nasceria fora da
       tela. É a mesma solução que a galeria do ecossistema já usa. */
    document.body.appendChild(modal);
    palco = modal.querySelector(".ecm-palco");
    return modal;
  }

  function clonar(card){
    var c = card.cloneNode(true);
    /* o clone não pode ser um alvo de navegação nem receber foco: ele é figura */
    c.removeAttribute("data-pt-href");
    c.removeAttribute("role");
    c.removeAttribute("tabindex");
    c.removeAttribute("id");
    c.classList.add("ecm-card");

    /* ============================================================
       LIMPAR O style INLINE — sem isto o pop-up nasce FORA DA TELA
       ------------------------------------------------------------
       Medido em 2026-09-14, a 1920x946: o card clonado apareceu em x=-657, y=-181.
       A causa e que o GSAP do baralho escreve a posicao de cada card INLINE, e o
       cloneNode copia o atributo junto:
         transform: perspective(1400px) translate(-50%,-50%) translate(-1098px,0px);
         translate: 0px 2.9px; z-index: 16; opacity: 1; rotate: none; scale: none;
       Estilo inline VENCE folha de estilo, entao o `transform:none` que a regra
       `.eco-card-modal .ecm-card` declara simplesmente nao pegava — o card continuava
       obedecendo a coordenada que ele tem DENTRO do carrossel, num pop-up onde essa
       coordenada nao quer dizer nada.
       ⚠ E a mesma armadilha ja registrada no mapa da secao para a OPACIDADE (a regra
       `.etrack:has(.ecard.focus)` teve de usar `filter:opacity()` porque o `opacity`
       inline do GSAP vencia). Aqui da para resolver na raiz: o clone nao precisa de
       estilo inline nenhum.
       ⚠ Remover o atributo inteiro so e seguro porque foi MEDIDO que nenhum
       descendente do card tem style inline (7 cards, 0 descendentes com [style]).
       Se um dia o GSAP passar a animar algo DENTRO do card, esta linha deixa de
       bastar e o pop-up volta a herdar posicao de animacao.
       ============================================================ */
    c.removeAttribute("style");

    /* o brilho desfocado atrás do vídeo não vem junto: é enfeite caro e, parado
       sobre um poster, nem aparece */
    [].slice.call(c.querySelectorAll(".evid-glow")).forEach(function(g){
      if(g.parentNode) g.parentNode.removeChild(g);
    });

    /* ============================================================
       O VÍDEO TOCA NO POP-UP — menos no modo leve (2026-09-14, tarde)
       ------------------------------------------------------------
       A primeira versão trocava TODO <video> pela imagem do poster, para não somar
       decodificação justamente no ecossistema (medido na véspera: é onde um PC sem
       aceleração de vídeo cai a 14 fps). O dono viu rodando e corrigiu:
       *"eu clico funciona normal mais o video ta pausado parece como imagem"*.
       Ele tem razão: num card que ocupa a tela, vídeo parado lê como falha de
       carregamento — o custo de imagem virou um defeito aparente.
       O acordo: no modo completo o vídeo toca; com `data-perf=low` fica o poster.
       É o PRIMEIRO uso do modo leve para degradar CONTEÚDO e não só cortar enfeite, e
       é o lugar certo para isso — a máquina que não aguenta é exatamente a que já
       estava travando nesta seção.
       CUSTO, para ninguém precisar adivinhar depois: +1 decodificador enquanto o
       pop-up está aberto, liberado no fechar() e ao trocar de conexão.
       ⚠ MEDIDO que o clone nasce COM FONTE nas 7 conexões, e eu tinha escrito o
       contrário aqui: Livre, Placas, Solar e Pay trazem <source> filho; Green,
       Telecom e Seguros trazem `src` como ATRIBUTO (o rodízio do hero faz `v.src=...`,
       que reflete no atributo). O cloneNode leva os dois casos.
       ============================================================ */
    var leve = document.documentElement.getAttribute("data-perf") === "low";

    [].slice.call(c.querySelectorAll("video")).forEach(function(v){
      if(!leve && (v.getAttribute("src") || v.querySelector("source"))){
        /* o clone precisa tocar sozinho: sem som, em laço, sem abrir em tela cheia no
           iPhone. O `poster` FICA — é ele que aparece até o primeiro quadro pintar, e sem
           ele existe um instante de caixa preta que numa apresentação lê como erro. */
        v.muted = true; v.loop = true; v.playsInline = true; v.controls = false;
        v.setAttribute("muted",""); v.setAttribute("loop",""); v.setAttribute("playsinline","");
        v.setAttribute("preload","auto");
        /* o original é alvo do rodízio de vídeos do hero (`.evid[data-herovid]`); o clone
           não pode ser. Mesma limpeza que o `.evid-glow` do index.html já faz, pelo mesmo
           motivo — e ali está provado que ela é suficiente. */
        v.removeAttribute("data-herovid");
        v.classList.add("ecm-video");
        return;
      }
      /* daqui para baixo: modo leve, ou vídeo sem fonte nenhuma → fica a imagem */
      var poster = v.getAttribute("poster"), novo;
      if(poster){
        novo = document.createElement("img");
        novo.src = poster;
        novo.alt = "";
        /* dimensões declaradas: regra do projeto. Sem elas, imagem em container que
           tira a altura dela já apagou o fundo dos planos uma vez. */
        novo.setAttribute("width","430");
        novo.setAttribute("height","224");
      } else {
        /* ⚠ ESTE RAMO NUNCA FOI EXERCIDO, e o que eu escrevi aqui antes ESTAVA ERRADO.
           A versão anterior deste comentário afirmava que "Green, Telecom e Seguros usam
           data-herovid e não têm poster próprio". Medido em 2026-09-14, nas 7 conexões:
           as três TÊM poster e renderizam com naturalWidth > 0 (poster-green 1440,
           poster-telecom 1440, poster-seguros 640). Nenhuma capa ficou vazia.
           O ramo fica como rede de segurança para um card futuro sem poster: sem imagem,
           a moldura vazia é melhor que um buraco, porque mantém a altura do card e o
           desenho não pula. Mas ele é código NÃO EXERCITADO — se um dia importar, teste. */
        novo = document.createElement("div");
      }
      novo.className = "ecm-capa";
      if(v.parentNode) v.parentNode.replaceChild(novo, v);
    });
    emFormatoDeSlide(c);
    return c;
  }

  /* ============================================================
     FORMATO DE SLIDE (2026-10-24)
     ------------------------------------------------------------
     Pedido do dono: *"deixar os números em verde pra destacar, e ele abrir na horizontal ... no estilo slide
     mesmo, com os tópicos maiores e o ícone ao lado. Meio que parecido com aquele do Expansão"*. O CSS do
     formato está no index.html ("CARTÃO AMPLIADO EM FORMATO DE SLIDE"); aqui só o que o CSS sozinho não faz:
     1. junta tudo o que não é a mídia num `.ecm-lado` — vira a coluna da direita;
     2. a última palavra do título vai para um <b> (verde), como "Conexão <b>Expansão</b>";
     3. todo número do texto e da lista ganha `.ecm-num` (verde): 82%, R$7,00, 7kW, 5G, 2% GP...
     ⚠ Tudo isso acontece NA CÓPIA, nunca no cartão do baralho: o texto continua tendo um lugar só.
     ============================================================ */
  var NUMERO = /(R\$\s?\d(?:[\d.,]*\d)?|\d(?:[\d.,]*\d)?(?:\s?[–-]\s?\d(?:[\d.,]*\d)?)?(?:\s?(?:%|kWh|kW)|G(?![A-Za-zÀ-ÿ]))?)/g;
  function pintaNumeros(raiz){
    var andar = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null), nos = [], n;
    while((n = andar.nextNode())) if(/\d/.test(n.nodeValue)) nos.push(n);
    nos.forEach(function(no){
      var txt = no.nodeValue, frag = document.createDocumentFragment(), ult = 0, m;
      NUMERO.lastIndex = 0;
      while((m = NUMERO.exec(txt))){
        if(m.index > ult) frag.appendChild(document.createTextNode(txt.slice(ult, m.index)));
        var s = document.createElement("span"); s.className = "ecm-num"; s.textContent = m[0];
        frag.appendChild(s); ult = m.index + m[0].length;
      }
      if(ult < txt.length) frag.appendChild(document.createTextNode(txt.slice(ult)));
      no.parentNode.replaceChild(frag, no);
    });
  }
  function emFormatoDeSlide(c){
    var lado = document.createElement("div");
    lado.className = "ecm-lado";
    [].slice.call(c.children).forEach(function(el){
      if(!el.classList.contains("eimg")) lado.appendChild(el);
    });
    c.appendChild(lado);
    var h = lado.querySelector("h3");
    if(h && !h.querySelector("b")){
      var tx = h.textContent.trim(), k = tx.lastIndexOf(" ");
      if(k > 0){
        h.textContent = tx.slice(0, k + 1);
        var b = document.createElement("b"); b.textContent = tx.slice(k + 1); h.appendChild(b);
      }
    }
    /* o texto de cada tópico vira UM bloco antes de pintar os números: o `li` é flex, e cada <span> verde
       solto viraria um item da linha (quebras erradas, print do dono de 2026-10-24). O tópico de várias
       linhas do Mob já tem o seu bloco (`.emods-grupo`). */
    [].slice.call(lado.querySelectorAll(".emods > li")).forEach(function(li){
      if(li.querySelector(".emods-grupo")) return;
      var w = document.createElement("span"); w.className = "ecm-txt";
      while(li.firstChild) w.appendChild(li.firstChild);
      li.appendChild(w);
    });
    [].slice.call(lado.querySelectorAll("p, li")).forEach(pintaNumeros);
  }

  /* Pausa o vídeo do pop-up. Chamado ao FECHAR e também antes de trocar de conexão:
     um <video> arrancado do DOM enquanto toca pode seguir decodificando, e este projeto
     já pagou caro por decodificador invisível (os 7 brilhos do baralho, 2026-09-13).
     Pausar basta para o CUSTO POR QUADRO: vídeo pausado não decodifica nada.
     ⚠ PRECISÃO, porque a versão anterior deste comentário exagerava: o `fechar()` NÃO
     esvazia o palco. O <video> clonado continua no DOM, pausado e com readyState 4, até
     a próxima chamada de abrir() — é ela que faz `palco.innerHTML=""` e leva o nó junto
     com a memória dele. Medido em 2026-09-14 depois de uma travessia inteira:
     palcoVideos=1, palcoTocando=0. Ou seja, no máximo UM vídeo pausado fica de resto, e
     ele não custa quadro nenhum — mas dizer que "a memória sai ao fechar" era falso. */
  function soltarVideo(){
    if(!palco) return;
    [].slice.call(palco.querySelectorAll("video")).forEach(function(v){
      try{ v.pause(); }catch(e){}
    });
  }

  function abrir(i){
    var lista = cards();
    if(!lista || !lista.length) return false;
    i = +i;
    if(!(i >= 0) || i >= lista.length) return false;
    monta();
    soltarVideo();            /* o da conexão anterior, antes de sair do DOM */
    palco.innerHTML = "";
    palco.appendChild(clonar(lista[i]));
    atual = i;
    modal.setAttribute("aria-hidden","false");
    /* leitura forçada ENTRE trocar o conteúdo e ligar a classe: sem ela o navegador
       junta as duas no mesmo quadro e a transição vale para o salto, fazendo o card
       aparecer no meio do movimento. O projeto já pagou por esse detalhe uma vez,
       no pop-up das graduações. */
    /* fora da apresentação: mostra o ✕ e, quando a conexão tem galeria, a mãozinha no cartão
       (o clique nele leva às artes). Lido a cada abertura, porque a mesma peça abre dos dois
       jeitos e o estado da apresentação muda entre uma abertura e outra. */
    var naApres = !!(window.__pmode && window.__pmode.isActive && window.__pmode.isActive());
    var G = window.IGREEN_ECO_GAL;
    modal.classList.toggle("fora-da-apresentacao", !naApres);
    modal.classList.toggle("tem-galeria", !!(G && G.temGaleria && G.temGaleria(i)));
    void modal.offsetWidth;
    modal.classList.add("on");
    /* `play()` devolve promessa e ela PODE ser rejeitada (política de autoplay, aba sem
       gesto). Engolir é o certo: o poster continua à mostra e o pop-up não quebra. */
    var v = palco.querySelector("video.ecm-video");
    if(v){ try{ var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); }catch(e){} }
    return true;
  }

  function fechar(){
    if(!modal) return;
    soltarVideo();
    modal.classList.remove("on");
    modal.setAttribute("aria-hidden","true");
    atual = -1;
  }

  function aberto(){ return !!(modal && modal.classList.contains("on")); }

  /* ============================================================
     API PÚBLICA — consumida só pelo js/presentation-mode.js.
     `i` é a posição do card na seção, a MESMA que o buildStops da apresentação e a
     galeria já usam. Um índice próprio aqui criaria duas numerações para a mesma
     lista, que é como nasce o "abre a conexão errada".
     ============================================================ */
  window.IGREEN_ECO_CARD = {
    abrir:  abrir,
    fechar: fechar,
    aberto: aberto,
    indice: function(){ return atual; }
  };
})();
