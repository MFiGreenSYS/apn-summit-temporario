/* ============================================================================
   iGREEN EXPERT 5.0 — a seção abaixo do mapa do Summit (2026-10-24)
   ----------------------------------------------------------------------------
   Pedido do dono: *"vamos mover o slide expert, o vídeo e o último slide expert criando
   uma seção abaixo do mapa"*. As três telas estavam no fim do pop-up da Expansão desde
   a manhã do mesmo dia; aqui viram um QUADRO de slide na própria página:

       0  capa do Expert 5.0                      assets/img/expert/expert-capa.jpg
       1  vídeo "como foi o Expert 4.0"          assets/video/expert-4-0.mp4
          (a capa dele é o quadro dos 3m20s)      assets/img/expert/expert-video-capa.jpg
       2  2 de maio de 2027, Distrito Anhembi    assets/img/expert/expert-data.jpg
          + o QR do ingresso

   NO SITE: setas e bolinhas para passar; na tela 1 o play toca o vídeo DENTRO do quadro,
   com os controles do navegador.
   NA APRESENTAÇÃO: quem passa as telas é o js/presentation-mode.js (entrada 'Expert'), pela
   API `IGREEN_EXPERT` abaixo — 4 paradas: capa, capa do vídeo, vídeo tocando, data. Quando o
   vídeo acaba durante a apresentação, este arquivo dispara `igreen:video-fim`, o mesmo evento
   dos outros vídeos, e a apresentação segue sozinha para a data.
   ⚠ Este arquivo NÃO escuta teclado: as setas são da apresentação (e quem navega o site usa
   os botões). Peça sem teclado não disputa o passador com ninguém.
   ⚠ O vídeo (86MB) só ganha `src` quando a tela 1 aparece: ninguém baixa o vídeo só por abrir
   a página, e nenhum vídeo decodifica fora da tela (orçamento do projeto).
   ============================================================================ */
(function(){
  "use strict";

  var VER = "?v=20261024";
  var TELAS = [
    { img:"assets/img/expert/expert-capa.jpg",       alt:"iGreen Expert 5.0" },
    { img:"assets/img/expert/expert-video-capa.jpg", alt:"Vídeo: como foi o Expert 4.0",
      video:"assets/video/expert-4-0.mp4" },
    { img:"assets/img/expert/expert-data.jpg",       alt:"Expert 5.0 · 2 de maio de 2027, Distrito Anhembi, São Paulo · garanta seu ingresso" }
  ];

  var sec, img, vid, play, dots, ant, prox, pagina = 0;

  function apresentando(){ return !!(window.__pmode && window.__pmode.isActive && window.__pmode.isActive()); }

  function parar(){
    if (!vid) return;
    try{ vid.pause(); }catch(e){}
    vid.hidden = true;
  }

  function desenha(){
    var t = TELAS[pagina];
    parar();
    img.src = t.img + VER;
    img.alt = t.alt;
    img.hidden = false;
    play.hidden = !t.video;
    [].forEach.call(dots.querySelectorAll(".ex-dot"), function(d, k){
      d.classList.toggle("is-ativo", k === pagina);
      d.setAttribute("aria-current", k === pagina ? "true" : "false");
    });
    ant.disabled  = (pagina === 0);
    prox.disabled = (pagina === TELAS.length - 1);
    /* pré-carrega a próxima ARTE (imagem), nunca o vídeo */
    var n = TELAS[pagina + 1];
    if (n){ var im = new Image(); im.decoding = "async"; im.src = n.img + VER; }
  }

  function ir(p){
    p = Math.max(0, Math.min(TELAS.length - 1, p | 0));
    pagina = p; desenha();
    return true;
  }

  function tocar(){
    var t = TELAS[pagina];
    if (!t.video) return false;
    if (!vid.getAttribute("src")) vid.src = t.video + VER;
    vid.poster = t.img + VER;
    vid.hidden = false; img.hidden = true; play.hidden = true;
    var pr = vid.play(); if (pr && pr.catch) pr.catch(function(){});
    return true;
  }

  function monta(){
    sec = document.getElementById("expert");
    if (!sec) return false;
    img  = sec.querySelector(".ex-img");
    vid  = sec.querySelector(".ex-vid");
    play = sec.querySelector(".ex-play");
    dots = sec.querySelector(".ex-dots");
    ant  = sec.querySelector(".ex-ant");
    prox = sec.querySelector(".ex-prox");
    var h = "";
    for (var k = 0; k < TELAS.length; k++)
      h += '<button class="ex-dot" type="button" data-p="' + k + '" aria-label="Tela ' + (k + 1) + '"></button>';
    dots.innerHTML = h;
    dots.addEventListener("click", function(e){ var d = e.target.closest(".ex-dot"); if (d) ir(+d.getAttribute("data-p")); });
    ant.addEventListener("click", function(){ ir(pagina - 1); });
    prox.addEventListener("click", function(){ ir(pagina + 1); });
    play.addEventListener("click", function(e){ e.preventDefault(); tocar(); });
    vid.addEventListener("ended", function(){
      /* na apresentação, o fim do vídeo leva à próxima parada (a data) — o mesmo evento dos
         outros vídeos do site, tratado no js/presentation-mode.js. Fora dela, só volta a capa. */
      if (apresentando()){ try{ document.dispatchEvent(new CustomEvent("igreen:video-fim")); }catch(e){} }
      else desenha();
    });
    desenha();
    return true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", monta);
  else monta();

  /* API — consumida pelo js/presentation-mode.js (entrada 'Expert') */
  window.IGREEN_EXPERT = {
    paginas: function(){ return TELAS.length; },
    ir: ir, tocar: tocar, parar: parar,
    temVideo: function(p){ return !!(TELAS[p] && TELAS[p].video); },
    pagina: function(){ return pagina; }
  };
})();
