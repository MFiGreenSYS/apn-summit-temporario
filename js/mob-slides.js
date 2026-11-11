/* ============================================================================
   CONEXÃO MOB — o pop-up da apresentação do licenciado (2026-10-23)
   ----------------------------------------------------------------------------
   Pedido do dono, com o .pptx em anexo ("Conexao Mob - Apresentacao Licenciado -
   SUMMIT.pptx"): *"adicione os slides em jpge em sequencia aqui dentro"*, apontando
   a seção #mob. Os 22 slides foram exportados pelo próprio PowerPoint (1920x1080,
   nenhum oculto, nenhum vídeo embutido) para `assets/img/mob/Slide01..22.jpg`, na
   ordem do deck.

   ⚠ ESTE ARQUIVO É O POP-UP DA EXPANSÃO (js/expansao-etapas.js) COM OUTRA LISTA, e
   é uma cópia DE PROPÓSITO: a Expansão está no ar e validada, e transformar aquele
   arquivo em fábrica para servir às duas mexeria numa peça que funciona para
   acrescentar outra. O desenho é o mesmo — as classes `.xp-pop*` do index.html
   servem às duas, e só uma abre por vez. Se um ajuste de comportamento entrar lá
   (trava de scroll, teclado, transição), ele vale aqui também: são dois lugares.
   Ficou de fora daqui o vídeo da seção e a entrada da lista, que o
   js/expansao-etapas.js já cuida para as duas seções.

   ⚠ A LEGENDA DE CADA SLIDE É O TÍTULO DELE, lido abrindo a arte — não é texto
   inventado. Se o dono reexportar o deck com outra ordem, a lista muda inteira.
   ============================================================================ */
(function(){
  "use strict";

  var BASE = "assets/img/mob/";
  /* Arte sobrescrita com o mesmo nome precisa de URL nova (netlify.toml guarda /assets/*
     por um dia). Se reexportar o deck por cima, suba este número. */
  var VER = "?v=20261023";

  var SLIDES = [
    { arq:"Slide01.jpg", t:"Conexão Mob · material do licenciado" },
    { arq:"Slide02.jpg", t:"Você não vende um carregador. Vende uma licença." },
    { arq:"Slide03.jpg", t:"Um ponto, quatro fontes de receita" },
    { arq:"Slide04.jpg", t:"Três modelos, um para cada local" },
    { arq:"Slide05.jpg", t:"02 · Ganhos e comissões" },
    { arq:"Slide06.jpg", t:"Como se forma o resultado do eletroposto" },
    { arq:"Slide07.jpg", t:"3 vertentes de ganho em cada recarga" },
    { arq:"Slide08.jpg", t:"Você ganha em dois momentos" },
    { arq:"Slide09.jpg", t:"Quanto você ganha de GP vendendo uma licença Mob" },
    { arq:"Slide10.jpg", t:"Cada recarga gera três ganhos" },
    { arq:"Slide11.jpg", t:"O requisito para receber as comissões das recargas" },
    { arq:"Slide12.jpg", t:"Royalties por graduação" },
    { arq:"Slide13.jpg", t:"Quando a comissão da venda é liberada" },
    { arq:"Slide14.jpg", t:"Pontuação da venda e PRO 360" },
    { arq:"Slide15.jpg", t:"A carteira iGreen no eletroposto" },
    { arq:"Slide16.jpg", t:"03 · A licença Mob" },
    { arq:"Slide17.jpg", t:"Valores, pagamento e regras da licença" },
    { arq:"Slide18.jpg", t:"Já é licenciado? O upgrade é comprar a licença Mob" },
    { arq:"Slide19.jpg", t:"04 · Clientes e venda" },
    { arq:"Slide20.jpg", t:"Cliente Mob e regra de fidelidade" },
    { arq:"Slide21.jpg", t:"O passo a passo da venda" },
    { arq:"Slide22.jpg", t:"Troca de bandeira: traga eletropostos que já existem" }
  ];

  var pop = null, pagina = 0, smoother = null, travei = false, limpeza = 0;

  function total(){ return SLIDES.length; }
  function caminho(k){ return BASE + encodeURIComponent(SLIDES[k].arq) + VER; }

  /* filho do <body>, NUNCA do #smooth-content: é `position:fixed` (ver js/expansao-etapas.js) */
  function monta(){
    if (pop) return pop;
    pop = document.createElement("div");
    pop.className = "xp-pop";
    pop.id = "mbPop";
    pop.setAttribute("aria-hidden", "true");
    pop.innerHTML =
        '<div class="xp-pop-fundo"></div>'
      + '<div class="xp-pop-moldura">'
      +   '<div class="xp-pop-caixa" role="dialog" aria-modal="true" aria-label="Apresentação da Conexão Mob">'
      +     '<button class="xp-fechar" type="button" aria-label="Fechar">&times;</button>'
      +     '<button class="xp-nav xp-ant" type="button" aria-label="Slide anterior">&lsaquo;</button>'
      +     '<button class="xp-nav xp-prox" type="button" aria-label="Próximo slide">&rsaquo;</button>'
      +     '<figure class="xp-quadro">'
      +       '<img class="xp-img" src="" alt="" width="1920" height="1080" decoding="async">'
      +     '</figure>'
      +     '<div class="xp-rodape">'
      +       '<span class="xp-legenda"></span>'
      +       '<span class="xp-conta"></span>'
      +     '</div>'
      +     '<div class="xp-dots"></div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(pop);

    pop.querySelector(".xp-fechar").addEventListener("click", function(e){ e.stopPropagation(); fechar(); });
    pop.querySelector(".xp-pop-fundo").addEventListener("click", fechar);
    pop.querySelector(".xp-ant").addEventListener("click", function(e){ e.stopPropagation(); vaiPara(pagina - 1); });
    pop.querySelector(".xp-prox").addEventListener("click", function(e){ e.stopPropagation(); vaiPara(pagina + 1); });
    /* um ouvinte só, delegado: recriar os pontos a cada passo não empilha ouvintes */
    pop.querySelector(".xp-dots").addEventListener("click", function(e){
      var d = e.target.closest(".xp-dot"); if (!d) return;
      e.stopPropagation(); vaiPara(+d.getAttribute("data-p"));
    });
    return pop;
  }

  function desenha(){
    var n = total(), img = pop.querySelector(".xp-img");
    img.src = caminho(pagina);
    img.alt = SLIDES[pagina].t;
    pop.querySelector(".xp-legenda").textContent = SLIDES[pagina].t;
    pop.querySelector(".xp-conta").textContent =
      String(pagina + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
    var pts = "";
    for (var k = 0; k < n; k++){
      pts += '<button class="xp-dot' + (k === pagina ? " is-ativo" : "") + '" type="button" data-p="' + k
           + '" aria-label="Slide ' + (k + 1) + '"></button>';
    }
    pop.querySelector(".xp-dots").innerHTML = pts;
    pop.querySelector(".xp-ant").disabled  = (pagina === 0);
    pop.querySelector(".xp-prox").disabled = (pagina === n - 1);
    /* pré-carrega só o SEGUINTE: 22 slides são 5,3MB, e quem não abre o pop-up não paga nada */
    if (pagina + 1 < n){ var prox = new Image(); prox.decoding = "async"; prox.src = caminho(pagina + 1); }
  }

  function vaiPara(p){
    if (!pop || p < 0 || p >= total() || p === pagina) return false;
    pagina = p; desenha(); return true;
  }

  function abrir(p){
    monta();
    if (limpeza){ clearTimeout(limpeza); limpeza = 0; }
    pagina = Math.max(0, Math.min(total() - 1, p | 0));
    desenha();
    pop.classList.add("is-aberto");
    pop.setAttribute("aria-hidden", "false");
    /* na apresentação a trava de scroll NÃO entra (quem move o scroll é a varredura) — mesma
       decisão, pelo mesmo motivo, do js/expansao-etapas.js */
    var naApresentacao = !!(window.__pmode && window.__pmode.isActive && window.__pmode.isActive());
    smoother = (window.ScrollSmoother && ScrollSmoother.get) ? ScrollSmoother.get() : null;
    if (naApresentacao){ travei = false; }
    else {
      travei = true;
      if (smoother) smoother.paused(true); else document.body.style.overflow = "hidden";
    }
    return true;
  }

  function fechar(){
    if (!aberto()) return false;
    pop.classList.remove("is-aberto");
    pop.setAttribute("aria-hidden", "true");
    /* a imagem só sai depois do esmaecer, senão a saída não aparece */
    if (limpeza) clearTimeout(limpeza);
    limpeza = setTimeout(function(){
      limpeza = 0;
      if (aberto()) return;
      var im = pop.querySelector(".xp-img"); if (im) im.removeAttribute("src");
    }, 360);
    if (travei){
      if (smoother) smoother.paused(false); else document.body.style.overflow = "";
    }
    travei = false; smoother = null;
    return true;
  }

  function aberto(){ return !!(pop && pop.classList.contains("is-aberto")); }
  function avancar(){ return aberto() ? vaiPara(pagina + 1) : false; }
  function voltar(){  return aberto() ? vaiPara(pagina - 1) : false; }

  document.addEventListener("click", function(e){
    if (!e.target || !e.target.closest) return;
    if (!e.target.closest("#mbAbrir")) return;
    e.preventDefault();
    abrir(0);
  });

  /* ⚠ A GUARDA DA APRESENTAÇÃO É A PRIMEIRA LINHA: na apresentação quem manda no passo é o
     goNext/goPrev; aqui só se escuta quando ela está desligada. */
  document.addEventListener("keydown", function(e){
    if (!aberto()) return;
    if (window.__pmode && window.__pmode.isActive && window.__pmode.isActive()) return;
    if (e.key === "Escape"){ e.preventDefault(); fechar(); return; }
    if (e.key === "ArrowRight"){ e.preventDefault(); avancar(); return; }
    if (e.key === "ArrowLeft"){ e.preventDefault(); voltar(); }
  }, true);

  window.IGREEN_MOB = {
    abrir: abrir, fechar: fechar, aberto: aberto,
    avancar: avancar, voltar: voltar,
    paginas: total, ir: vaiPara,
    pagina: function(){ return pagina; }
  };
})();
