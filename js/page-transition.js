/* Transição de página "cortina" + retorno à seção — ver css/page-transition.css.
   Requisitos em cada página que usa:
     1) <link rel="stylesheet" href=".../css/page-transition.css">
     2) no <head>, ANTES do paint (evita flash na chegada):
        <script>try{if(sessionStorage.getItem('pt')){sessionStorage.removeItem('pt');
          document.documentElement.setAttribute('data-pt-state','cover');}}catch(e){}</script>
     3) primeiro filho do <body>: <div class="pt-curtain" aria-hidden="true"></div>
     4) este script antes de </body>
   Disparo: <a data-pt href="..."> ou qualquer elemento com [data-pt-href="destino.html"].
   Intro de conteúdo: marque elementos da página que chega com class .pt-intro.

   RETORNO À SEÇÃO (sem flick):
   Ao sair, guardamos a SEÇÃO onde o elemento clicado está (por id). Ao voltar,
   posicionamos o scroll no TOPO dessa seção — recalculado no layout novo — antes de
   revelar a cortina. Isso evita o flick de seções com scroll pinado/scrub (ex.: o deck
   do ecossistema, que é clonado em runtime): no topo da seção o efeito está no estado
   inicial (progresso 0), então nada "pula" ao revelar. Fallback: posição numérica. */
(function(){
  var html = document.documentElement;
  var REVEAL = 620, COVER = 500;
  /* normaliza o pathname p/ a chave: '/index.html' e '/' viram a mesma chave
     (a Vercel serve a home nas duas URLs; o link "voltar" vai p/ ../index.html,
     e sem isto a seção de origem não era restaurada — voltava pro topo). */
  var KEY = 'pt-scroll:' + location.pathname.replace(/index\.html$/, '');
  var IS_PRODUTO = /\/produtos\//.test(location.pathname);
  /* onde ele estava quando a pagina descarregou — e o que o F5 devolve. Chave separada da
     KEY de propósito: aquela e do retorno-a-secao pos-cortina e e CONSUMIDA na chegada. */
  var KEYR = 'pt-reload:' + location.pathname.replace(/index\.html$/, '');

  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch(e){}
  /* F5/reload sempre reinicia no TOPO. Sem isto, o navegador restaura o scroll no meio
     da pagina ANTES do ScrollSmoother/ScrollTrigger recalcularem, dessincronizando as
     secoes pinadas (o deck clonado do ecossistema quebrava). O retorno-a-secao pos-transicao
     nao e afetado (ele e feito por JS na chegada, via sessionStorage, nao pelo scroll nativo). */
  /* ⚠ A ORDEM AQUI E O CONSERTO INTEIRO: guarda a posicao ANTES de zerar. Invertido,
     guardaria sempre 0 — e o teste passaria (nada quebra), so nunca retomaria nada. */
  window.addEventListener('beforeunload', function(){
    guardaPosicao();
    try { var s = smoother(); if (s) s.scrollTop(0); } catch(e){}
    try { window.scrollTo(0, 0); } catch(e){}
  });

  /* VOLTAR (botao/gesto) via bfcache: o navegador restaura a pagina no MESMO estado
     em que ela saiu — inclusive com data-pt-state="in", que deixa a .pt-curtain
     cobrindo a tela (fica preta). Como os scripts NAO re-executam no restore do
     bfcache, limpamos o estado da cortina aqui, no pageshow persistido. */
  window.addEventListener('pageshow', function(e){
    if (!e.persisted) return;
    html.removeAttribute('data-pt-state');            // some com a cortina (volta pra translateY(100%))
    try { sessionStorage.removeItem('pt'); } catch(err){}
    if (window.ScrollTrigger) { try { ScrollTrigger.refresh(); } catch(err){} }
  });

  function smoother(){ return (window.ScrollSmoother && ScrollSmoother.get) ? ScrollSmoother.get() : null; }
  function getScroll(){ var s = smoother(); return s ? s.scrollTop() : (window.pageYOffset || document.documentElement.scrollTop || 0); }
  function setScroll(y){ var s = smoother(); if (s) s.scrollTop(y); else window.scrollTo(0, y); if (window.ScrollTrigger) ScrollTrigger.update(); }
  function maxScroll(){
    try { if (window.ScrollTrigger && ScrollTrigger.maxScroll) return ScrollTrigger.maxScroll(window); } catch(e){}
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  /* ==========================================================================
     RETOMAR ONDE PAROU no F5 (pedido do dono, 2026-09-09)
     --------------------------------------------------------------------------
     Sintoma, nas palavras dele: *"eu faco uma modificacao, subo, aprovo, e ai preciso
     atualizar a pagina e ela perde onde eu estou apresentando — tenho que rolar la pra
     baixo de novo pra continuar"*.

     ⚠ NAO E CASO DE TIRAR O ZERO DO beforeunload NEM DE DEVOLVER O scrollRestoration
     PRO NAVEGADOR. Isso ja foi tentado e esta documentado logo acima: o navegador
     restaura o scroll ANTES de o ScrollSmoother/ScrollTrigger remedirem, e as secoes
     pinadas ficam dessincronizadas (o deck clonado do ecossistema quebrava). A pagina
     continua nascendo no topo — quem devolve a posicao somos nos, DEPOIS que tudo mediu.

     ⚠ E TEM DE SER DEPOIS DO `load`, nao antes: durante o boot existe uma trava de scroll
     (o #boot no index) que reancora a pagina em `lockY` a cada evento de scroll ate o
     load. Restaurar antes disso e escrever num lugar que e imediatamente desfeito — sem
     erro nenhum no console. Como o #boot ainda cobre a tela por ~350ms + fade depois do
     load, o salto acontece atras dele: ninguem ve.

     Guardamos SECAO + deslocamento dentro dela, e o y cru so como reserva. Numero puro
     envelhece mal: imagem que carrega depois, fonte que troca, um card a mais na lista, e
     o mesmo y cai noutro lugar. A secao e reancorada no layout novo — mesma ideia do
     retorno-a-secao da cortina, que ja se provou aqui.
     ========================================================================== */
  /* ⚠ DUAS ARMADILHAS MEDIDAS AQUI, as duas silenciosas:

     1) SEÇÃO PINADA MENTE SOBRE A PRÓPRIA POSIÇÃO. Enquanto o pin está valendo, o
        ScrollTrigger segura a seção no topo da tela — o `rect.top` dela fica 0 durante
        os milhares de px do pin, então `y + rect.top` devolve SEMPRE o y atual. Ancorar
        nisso é ancorar em nada: no F5 daria "volte para onde você já está", ou seja, o
        topo. Quem sabe a posição verdadeira é o `.pin-spacer`, o div que o GSAP põe em
        volta para guardar o lugar dela no fluxo — medido: com a página em y=14000, a
        #orbita reportava 14000 e o spacer dela, 13325 (delta real de 675px).
        São 4 seções com spacer hoje (resultados, sede, ecossistema2, órbita).

     2) SEÇÃO `display:none` REPORTA RETÂNGULO ZERADO, e `y + 0` dá exatamente o y atual —
        então ela ganharia de qualquer âncora de verdade e o F5 cairia no topo. São 6
        delas na página (ecossistema, recorrencia, rede, agenda, top10, destaques).
        O filtro é a altura. */
  function caixaDaSecao(n){
    var p = n.parentNode;
    return (p && p.classList && p.classList.contains('pin-spacer')) ? p : n;
  }
  function secaoNoTopo(y){
    var achou = null, melhor = -Infinity;
    var todas = document.querySelectorAll('section[id]');
    for (var i = 0; i < todas.length; i++){
      var caixa = caixaDaSecao(todas[i]);
      var r = caixa.getBoundingClientRect();
      if (!r.height) continue;                       // display:none nao e ancora
      var topo = y + r.top;
      if (topo <= y + 4 && topo > melhor){ melhor = topo; achou = todas[i]; }
    }
    return achou ? { id: achou.id, delta: y - melhor } : null;
  }
  function guardaPosicao(){
    try {
      var y = getScroll();
      /* perto do topo nao ha o que retomar — e evita 'retomar' um F5 dado no hero */
      if (y < 40){ sessionStorage.removeItem(KEYR); return; }
      var s = secaoNoTopo(y);
      sessionStorage.setItem(KEYR, (s ? s.id : '') + '|' + Math.round(s ? s.delta : 0) + '|' + Math.round(y));
    } catch(e){}
  }
  function apresentando(){
    return !!(window.__pmode && window.__pmode.isActive && window.__pmode.isActive());
  }
  function retomar(){
    var t = null; try { t = sessionStorage.getItem(KEYR); } catch(e){}
    if (!t) return;
    try { sessionStorage.removeItem(KEYR); } catch(e){}   // uma vez so: nao vale pra proxima carga
    if (IS_PRODUTO) return;                               // pagina de produto sempre comeca no topo
    if (location.hash && document.getElementById(location.hash.slice(1))) return;   // ancora manda
    /* ⚠ DONO UNICO DO SCROLL: se a apresentacao vai retomar sozinha (pm/pm-stop), ela
       reenquadra a parada com a coreografia certa e nos ficamos FORA. Duas mecanicas
       escrevendo a posicao no mesmo instante e briga garantida neste projeto.

       ⚠ E POR QUE SAO DUAS PERGUNTAS, E NAO SO A DO sessionStorage: MEDIDO AQUI, a chave
       'pm' JA NAO EXISTE quando este codigo roda. O autoEnterIfNeeded do presentation-mode
       consome a chave em load+140ms e nos chegamos em load+300ms — a guarda do storage
       sozinha NUNCA pega o caso que ela existe para pegar. No teste os dois quiseram o
       mesmo y (9237 e 9238) e a briga passou despercebida; bastaria o layout mudar entre
       as duas cargas — que e exatamente o caso de uso do dono, recarregar DEPOIS de subir
       uma alteracao — para um puxar o scroll contra o outro no meio da varredura.
       Perguntar ao vivo `isActive()` fecha a janela inteira, e a pergunta se repete a cada
       tentativa porque a apresentacao pode entrar depois da primeira. */
    try { if (sessionStorage.getItem('pm') === '1') return; } catch(e){}
    if (apresentando()) return;
    var p = t.split('|'), idSec = p[0], delta = parseFloat(p[1]) || 0, yCru = parseFloat(p[2]) || 0;
    /* se ele mexer no scroll antes de a gente terminar, a vontade dele ganha */
    var mexeu = false, EV = ['wheel','touchstart','keydown','pointerdown'];
    function marca(){ mexeu = true; }
    EV.forEach(function(ev){ window.addEventListener(ev, marca, { passive:true }); });
    function alvo(){
      var y = yCru;
      if (idSec){
        var s = document.getElementById(idSec);
        if (s){
          var r = caixaDaSecao(s).getBoundingClientRect();
          if (r.height) y = getScroll() + r.top + delta;   // sem altura, cai no y cru
        }
      }
      return Math.max(0, Math.min(maxScroll(), y));
    }
    function aplica(){ if (!mexeu && !apresentando()) setScroll(alvo()); }
    aplica();                       // ja no frame do load (atras do #boot)
    requestAnimationFrame(aplica);  // depois do refresh unico do boot
    setTimeout(aplica, 140);        // depois de imagens/fontes acomodarem
    setTimeout(aplica, 520);
    setTimeout(function(){ aplica(); EV.forEach(function(ev){ window.removeEventListener(ev, marca); }); }, 1100);
  }

  // resolve o alvo salvo (seção por id, ou posição numérica) para um scrollTop no layout atual
  function resolveTarget(){
    var t = null; try { t = sessionStorage.getItem(KEY); } catch(e){}
    if (!t) return null;
    if (t.indexOf('sec:') === 0){
      var el = document.getElementById(t.slice(4));
      if (el) return Math.max(0, getScroll() + el.getBoundingClientRect().top);
      return null;
    }
    if (t.indexOf('y:') === 0) return parseFloat(t.slice(2)) || 0;
    return null;
  }

  // CHEGANDO via transição: o <head> já marcou data-pt-state="cover".
  if (html.getAttribute('data-pt-state') === 'cover') {
    var hasTarget = false;
    try { hasTarget = !!sessionStorage.getItem(KEY); } catch(e){}
    if (IS_PRODUTO) {
      /* páginas internas são páginas-destino: sempre no topo (não "retomam" a
         última posição, que causava o scroll pro final ao reentrar). */
      try { sessionStorage.removeItem(KEY); } catch(e){}
    } else if (hasTarget) {
      var apply = function(){ var y = resolveTarget(); if (y != null) setScroll(y); };
      apply();                                             // enquanto coberto (invisível)
      requestAnimationFrame(apply);                        // após 1º frame do ScrollSmoother/pins
      setTimeout(function(){ apply(); try{ sessionStorage.removeItem(KEY); }catch(e){} }, 80);
    }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      html.setAttribute('data-pt-state', 'out');           // revela
      setTimeout(function(){ html.removeAttribute('data-pt-state'); }, REVEAL + 60);
    }); });
  }

  /* chegou por F5/URL direta (nao pela cortina): retoma depois do load, quando o
     ScrollSmoother ja existe, o refresh unico do boot ja rodou e a trava do #boot soltou.
     Dois rAF: o igRefresh do index agenda o refresh num rAF proprio, registrado ANTES
     deste listener — o segundo quadro garante que medimos depois dele.

     ⚠ E POR QUE TEM UM setTimeout CORRENDO JUNTO: em ABA DE SEGUNDO PLANO o
     requestAnimationFrame NAO RODA. Nao e "roda devagar": medido aqui, ZERO quadros em
     1000ms com document.hidden === true. Quem abre o site com Ctrl+clique (o dono faz
     isso) cairia num retomar que so acontece quando ele finalmente olhasse a aba — tarde,
     ja sem o #boot cobrindo, com o salto a vista. Os dois caminhos disputam e o primeiro
     ganha: o `retomar` apaga a chave na primeira linha, entao o segundo vira no-op.
     Este projeto ja tinha essa armadilha documentada para MEDICAO; ela vale para o
     PRODUTO tambem. */
  if (html.getAttribute('data-pt-state') !== 'cover'){
    if (document.readyState === 'complete') setTimeout(retomar, 0);
    else window.addEventListener('load', function(){
      requestAnimationFrame(function(){ requestAnimationFrame(retomar); });
      setTimeout(retomar, 300);
    });
  }

  function go(href, el){
    if (!href) return;
    if (el && el.classList) el.classList.add('pt-clicked');   // feedback de clique
    try {
      sessionStorage.setItem('pt', '1');
      var sec = el && el.closest && el.closest('section[id]');
      sessionStorage.setItem(KEY, sec ? ('sec:' + sec.id) : ('y:' + getScroll()));
    } catch(e){}
    html.setAttribute('data-pt-state', 'in');              // cobre
    setTimeout(function(){ window.location.href = href; }, COVER);
  }

  document.addEventListener('click', function(e){
    var el = e.target.closest('a[data-pt], [data-pt-href]');
    if (!el) return;
    if (el.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    var href = el.getAttribute('data-pt-href') || el.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    e.preventDefault();
    /* TRAVA (pedido do dono): NUNCA entra nas paginas de produto (os 7 servicos, em produtos/...),
       em qualquer modo. O resto passa normal (ex.: voltar pro index). Pareado com a trava do
       goNext em presentation-mode.js. */
    if (href.indexOf('produtos/') !== -1) return;
    go(href, el);
  }, false);

  document.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest('[data-pt-href]');
    if (!el) return;
    e.preventDefault();
    var kh = el.getAttribute('data-pt-href');
    if (kh && kh.indexOf('produtos/') !== -1) return;
    go(kh, el);
  });

  /* PREFETCH: em desktop com mouse, pre-baixa a pagina de destino ao passar o cursor no card
     (ou ao focar via teclado), deixando a navegacao quase instantanea. NAO roda em touch nem
     com Save-Data ligado -> nao gasta dados no mobile. Cada destino e pre-baixado uma unica vez. */
  (function(){
    try {
      if (!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
      if (navigator.connection && navigator.connection.saveData) return;
    } catch(e){ return; }
    var done = {};
    function prefetch(href){
      if (!href || href.charAt(0) === '#' || done[href]) return;
      done[href] = 1;
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.as = 'document'; l.href = href;
      document.head.appendChild(l);
    }
    function onHint(e){
      var el = e.target.closest && e.target.closest('a[data-pt], [data-pt-href]');
      if (!el) return;
      prefetch(el.getAttribute('data-pt-href') || el.getAttribute('href'));
    }
    document.addEventListener('pointerover', onHint, {passive:true});
    document.addEventListener('focusin', onHint);
  })();
})();
