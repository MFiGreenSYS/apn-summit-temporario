/* ============================================================================
   DESTAQUES — carrossel horizontal de 3 telas, abaixo da agenda
   ----------------------------------------------------------------------------
   Pedido do dono (2026-08-10): "adicione uma nova seção abaixo da agenda, onde
   será um carrossel que passará por clique e no modo apresentação também...
   rolado na horizontal. E depois que passar a última ela continua para a última
   seção."

   As três telas são arte pronta — iGreen Creator, Escritório Virtual e iGreen
   Summit. Ele disse "que será em si a seção": a imagem é o conteúdo, sem título
   nem texto do site por cima. O HTML e o CSS moram no `index.html`, junto da
   seção; aqui fica só o comportamento.

   ============================================================================
   COMO ELE ANDA
   ----------------------------------------------------------------------------
   Três caminhos, um só lugar de decisão (`vaiPara`):
     - clique na seta, ou nas bolinhas;
     - clique/toque na própria arte (avança; com Shift, volta);
     - modo apresentação: uma parada por tela, todas no MESMO y da seção.
   O `avancar()` devolve **false** quando não há próxima tela. É esse false que
   faz a apresentação seguir para a seção seguinte em vez de ficar presa aqui —
   o "depois que passar a última ela continua" do pedido. O contrário (dar a
   volta para a primeira) prenderia a apresentação num laço.

   ⚠ NÃO EXISTE `overflow-x:scroll` aqui. O "rolado na horizontal" é feito com
   `transform:translateX` no trilho, e é de propósito: barra de rolagem nativa
   dentro de uma página com ScrollSmoother dá duas mecânicas disputando o gesto,
   que neste projeto sempre acabou em briga (ver as armadilhas de scroll no
   CLAUDE.md). Com transform, quem manda no passo é sempre o mesmo código.
   ============================================================================ */
(function(){
  "use strict";

  var secao = null, trilho = null, telas = [], pontos = [], atual = 0;

  function total(){ return telas.length; }

  /* tira o `loading="lazy"` da imagem `i`, para o navegador ir buscá-la agora */
  function liberaImagem(i){
    if(i < 0 || i >= telas.length) return;
    var im = telas[i].querySelector("img");
    if(im && im.getAttribute("loading")) im.removeAttribute("loading");
  }
  /* pré-carrega a seguinte sem tocar no DOM: quem chega nela encontra pronta */
  function preCarrega(i){
    if(i < 0 || i >= telas.length) return;
    var im = telas[i].querySelector("img");
    if(!im) return;
    var p = new Image(); p.decoding = "async"; p.src = im.getAttribute("src");
  }

  function pinta(){
    if(!trilho) return;
    trilho.style.transform = "translateX(" + (-atual * 100) + "%)";
    for(var i=0;i<pontos.length;i++){
      pontos[i].classList.toggle("on", i === atual);
      pontos[i].setAttribute("aria-selected", i === atual ? "true" : "false");
    }
    var ant = secao.querySelector(".dq-ant"), pro = secao.querySelector(".dq-pro");
    if(ant) ant.setAttribute("aria-disabled", atual === 0 ? "true" : "false");
    if(pro) pro.setAttribute("aria-disabled", atual >= total()-1 ? "true" : "false");
    /* aria-hidden nas telas fora de vista: leitor de tela não anuncia o que não está
       visível, e o `inert` evita que o Tab entre nelas */
    for(var t=0;t<telas.length;t++){
      telas[t].setAttribute("aria-hidden", t === atual ? "false" : "true");
    }
  }

  /* devolve true se ANDOU. false = não havia para onde ir, e é o sinal de
     "o passo é seu" para a apresentação. */
  function vaiPara(i){
    if(i < 0 || i >= total() || i === atual) return false;
    atual = i;
    /* libera a que entrou (já deve estar em cache pelo pré-carregamento) e adianta a
       seguinte. Só aqui, e nunca no `pinta()` inicial: no boot nada pode ser baixado. */
    liberaImagem(atual); preCarrega(atual + 1);
    pinta();
    return true;
  }
  function avancar(){ return vaiPara(atual + 1); }
  function voltar(){  return vaiPara(atual - 1); }

  function pronto(){
    secao = document.getElementById("destaques");
    if(!secao) return;
    trilho = secao.querySelector(".dq-trilho");
    telas = [].slice.call(secao.querySelectorAll(".dq-tela"));
    if(!trilho || !telas.length) return;

    /* ARTE QUE FALTA VIRA MOLDURA MARCADA, não quadro vazio.
       As três artes ainda não estão no projeto (o dono mandou por imagem, não por
       arquivo). Em vez de a seção nascer com três retângulos preto no ar, cada tela
       cujo arquivo não carrega mostra o nome dela e o caminho exato onde o arquivo
       deve ser posto. Assim a seção já é navegável e ela mesma documenta o que falta.
       O `complete && !naturalWidth` cobre a imagem que JÁ falhou antes deste código
       rodar — sem isso, um erro que aconteceu durante o carregamento passaria batido. */
    telas.forEach(function(fig, k){
      var im = fig.querySelector("img");
      if(!im) return;
      var falhou = function(){ fig.classList.add("dq-sem-arte"); preCarrega(k+1); };
      if(im.complete && !im.naturalWidth) falhou();
      im.addEventListener("error", falhou);
      im.addEventListener("load", function(){
        fig.classList.remove("dq-sem-arte");
        /* CORRENTE DE PRÉ-CARREGAMENTO: quando uma tela termina de chegar, a seguinte já
           é buscada. Começa sozinha na tela 1, que é a única com lazy nativo confiável —
           e é o que faz a tela 2 estar pronta ANTES do clique, sem custo no boot. */
        preCarrega(k+1);
      });
    });

    /* ============================================================
       ⚠ O `loading="lazy"` DAS TELAS 2 E 3 PODE NUNCA DISPARAR — já aconteceu duas
       vezes neste projeto, com este mesmo desenho.
       ------------------------------------------------------------
       Elas vivem lado a lado no trilho e saem da janela na HORIZONTAL (translateX). O
       navegador decide "perto da tela" pela caixa, e a caixa delas está a uma e a duas
       larguras de distância: o lazy fica esperando e a arte não aparece, sem erro nenhum
       no console. Foi assim que 12 dos 48 logos do clube e 32 das 47 fotos da galeria de
       eventos nunca carregavam.
       Aqui o conserto NÃO é um IntersectionObserver como nos outros dois casos, e a razão
       é honesta: eu não consigo vê-lo disparar neste ambiente (a janela automatizada quase
       não gera quadros, e a notificação do observer sai no fim de um quadro). Então a
       liberação foi amarrada ao que dá para testar e ao que o navegador faz bem:
         - a tela 1 fica no fluxo normal da página, com caixa no lugar dela: é exatamente
           o caso para o qual o lazy nativo existe;
         - quando uma tela termina de chegar, a corrente de `load` já busca a SEGUINTE
           (ver o `preCarrega` acima) — então a tela 2 está pronta antes do clique;
         - e o `vaiPara()` tira o lazy da tela que entrou, cinto e suspensório para o
           caso de a corrente não ter rodado.
       Custo no carregamento da página: ZERO — medido, nenhuma requisição de
       `/destaques/` sai do boot.
       ============================================================ */

    /* bolinhas: uma por tela */
    var caixa = secao.querySelector(".dq-pontos");
    if(caixa){
      var html = "";
      for(var i=0;i<telas.length;i++)
        html += '<button class="dq-ponto" type="button" role="tab" data-i="'+i+'" aria-label="Tela '+(i+1)+'"></button>';
      caixa.innerHTML = html;
      pontos = [].slice.call(caixa.querySelectorAll(".dq-ponto"));
      pontos.forEach(function(b){
        b.addEventListener("click", function(e){ e.stopPropagation(); vaiPara(+b.getAttribute("data-i")); });
      });
    }

    var ant = secao.querySelector(".dq-ant"), pro = secao.querySelector(".dq-pro");
    if(ant) ant.addEventListener("click", function(e){ e.stopPropagation(); voltar(); });
    if(pro) pro.addEventListener("click", function(e){ e.stopPropagation(); avancar(); });

    /* clique na arte avança. NÃO dá a volta no fim: a seção é uma sequência, não um
       laço — e no fim dela o que vem é o rodapé, tanto no site quanto na apresentação. */
    secao.querySelector(".dq-palco").addEventListener("click", function(e){
      if(e.target.closest(".dq-nav,.dq-ponto")) return;
      if(e.shiftKey) voltar(); else avancar();
    });

    /* teclado só quando a seção está de fato na tela, e nunca durante a apresentação:
       lá quem manda no passo é o goNext/goPrev, e dois donos para o mesmo gesto foi o
       que já fez a peça de reconhecimento pular a primeira página. */
    document.addEventListener("keydown", function(e){
      if(window.__pmode && window.__pmode.isActive && window.__pmode.isActive()) return;
      if(e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var r = secao.getBoundingClientRect();
      var naTela = r.top < window.innerHeight*0.6 && r.bottom > window.innerHeight*0.4;
      if(!naTela) return;
      e.preventDefault();
      if(e.key === "ArrowRight") avancar(); else voltar();
    });

    pinta();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto);
  else pronto();

  /* ============================================================
     API PÚBLICA — lida pelo js/presentation-mode.js
     `telas()` é o que o buildStops usa para saber quantas paradas criar.
     ============================================================ */
  window.IGREEN_DESTAQUES = {
    telas:   total,
    ir:      function(i){ if(i === atual){ pinta(); return true; } return vaiPara(i); },
    avancar: avancar,
    voltar:  voltar,
    atual:   function(){ return atual; },
    zerar:   function(){ atual = 0; pinta(); }
  };
})();
