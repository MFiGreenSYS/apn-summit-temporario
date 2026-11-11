/* video-inview.js — toca vídeos de fundo só quando visíveis; pausa fora da tela (performance).
   Aditivo e conservador: NÃO gerencia vídeos que já têm controlador próprio
   (carros = play-once; órbita/sede-scrub no desktop). No mobile, onde essas lógicas
   de foco/scrub não rodam, também gerencia sede/cards/bg de produtos.
   Respeita prefers-reduced-motion (esses vídeos já ficam pausados por lá). */
(function(){
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var isMobile = window.matchMedia('(max-width:1024px)').matches;

  function collect(){
    var set = [];
    var add = function(nodes){ [].forEach.call(nodes, function(v){ if(set.indexOf(v)<0) set.push(v); }); };
    /* decorativos de fundo, seguros em qualquer largura (sem outro controlador):
       (os .segv do hero da index NAO entram aqui — o carrossel ja controla play/pause deles) */
    add(document.querySelectorAll('video[loop][src*="bolt-glass"]')); /* hero das paginas de produto */
    /* SEDE em qualquer largura: o scrub do desktop foi removido (o video so toca em loop), entao
       nao existe mais controlador proprio la. E este observador e a forma CERTA de decidir isso:
       ele mede visibilidade REAL, imune a geometria de pin. Um ScrollTrigger com 'top bottom'/
       'bottom top' media a caixa NATURAL do elemento e, com a secao pinada, desativava no meio do
       caminho e pausava o video (bug real que aconteceu). */
    add(document.querySelectorAll('.hqbg'));                       /* sede */
    if(isMobile){
      /* no mobile as logicas de foco (cards) / orbita nao rodam,
         entao esses tambem podem ser pausados fora da tela (ganho real no celular) */
      add(document.querySelectorAll('.evid'));                     /* cards do ecossistema */
      add(document.querySelectorAll('.pbg'));                      /* fundo produtos/orbita */
    }
    /* nunca gerenciar o video dos carros (tem play-once proprio) */
    set = set.filter(function(v){ return !v.classList.contains('carvid'); });
    return set;
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var v = e.target;
      if(e.isIntersecting){ var p = v.play && v.play(); if(p && p.catch) p.catch(function(){}); }
      else { try{ v.pause(); }catch(err){} }
    });
  }, { threshold: 0.1 });

  function start(){ collect().forEach(function(v){ try{ io.observe(v); }catch(e){} }); }
  /* window.load: garante que clones criados durante o load (ex.: cards eco2) ja existem */
  if(document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
