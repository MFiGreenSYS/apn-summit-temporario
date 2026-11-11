/* ============================================================================
   CONEXÃO EXPANSÃO — o pop-up das quatro etapas
   ----------------------------------------------------------------------------
   Pedido do dono (2026-09-09), com o componente pronto em anexo:
   *"adicione uma nova secao, para esse componente deve ser identico a da
   espansao, movendo ela para ca porem nessa estrutura de html mas quando
   clicar aparece o popup de imagem e nao assim um abaixo do outro"*.

   O componente que ele mandou tinha as quatro etapas como CARTÕES DE TEXTO
   empilhados dentro do pop-up. Aqui elas são as QUATRO ARTES do deck, uma por
   vez — que é a frase "popup de imagem e não assim um abaixo do outro".

   ============================================================================
   AS SEIS ARTES, CONFERIDAS ABRINDO CADA UMA (não deduzidas pelo nome)
   ----------------------------------------------------------------------------
       Grand Show - Etapa    capa: "Campanha — Seu Investimento de Volta", com as
                             quatro etapas resumidas lado a lado                  .jpg
       Grand Show - etapa1   1ª Etapa · conecte 1 cliente, R$ 100,00 extra        .jpg
       Grand Show - etapa2   2ª Etapa · seja Green, 1.000 pontos extra            .jpg
       Grand Show - etapa3   3ª Etapa · conecte 2 licenciados, até R$ 600,00      .jpg
       Grand Show - etapa4   4ª Etapa · SENIOR EXPANSÃO + 3.000 pontos extra      .jpeg
       Grand Show - etapa5   "Campanha Expansão": 5 novos licenciados R$4.997,00
                             e 10 novos R$13.994,00                               .jpeg

   ⚠ A 4ª ETAPA MUDOU DE CONTEÚDO EM 10/09, não só de arquivo: a qualificação passou de
   **PRE-SENIOR** para **SENIOR EXPANSÃO**. A legenda acompanhou. Quem comparar com o
   histórico vai ver a versão antiga falando de Pré-Sênior — não é engano, é a arte anterior.
   ⚠ E ELA TROCOU DE EXTENSÃO: `.jpg` virou `.jpeg` (a `.jpg` foi apagada pelo dono). Sem a
   extensão viajando por item, isto seria um 404 mudo — quadro preto no meio da apresentação.
   ⚠ A etapa5 NÃO é uma "5ª etapa": é o fechamento da campanha, com o total por 5 e por 10
   licenciados. Por isso a legenda dela não segue a numeração das outras.

   ⚠ O DONO TROCOU A PASTA NO MEIO DESTE TRABALHO. Antes eram sete `Slide77..83`
   (o deck de 12/08, que tinha as mesmas quatro etapas em `Slide80..83`); ele
   apagou os sete e pôs estes cinco, com a capa nova. A primeira versão deste
   arquivo apontava para os `Slide8x` e o pop-up abria vazio — 404 medido, não
   suposto. Se alguém procurar os `Slide8x`: saíram por decisão dele e continuam
   no histórico do git.

   ⚠ OS NOMES TÊM ESPAÇO, E O "E" DE "Etapa" É MAIÚSCULO SÓ NA CAPA. Ficam assim:
   a regra do projeto é o código se ajustar ao arquivo do dono, não o contrário —
   renomear quebraria a lista sem avisar, e ele reexporta por cima com o mesmo
   nome. O espaço passa por `encodeURIComponent` no `caminho()`; espaço cru num
   `src` é território de "às vezes funciona".
   ⚠ E SÃO `.jpg`, NÃO `.jpeg`. A extensão viaja em cada item da lista, e não numa
   constante só, justamente porque esta pasta já teve as duas.

   ============================================================================
   POR QUE UM DIV E NÃO UM <dialog>
   ----------------------------------------------------------------------------
   O componente original usava `<dialog>` com `showModal()`. Aqui isso seria um
   defeito grave e silencioso: `showModal()` marca TODO o resto da página como
   inerte, e o resto da página inclui o RAIL DA APRESENTAÇÃO — os botões de
   passo ficariam mortos com o pop-up aberto, justamente quando o apresentador
   mais precisa deles. As outras peças de tela cheia do projeto (galeria das
   graduações, galeria do ecossistema, reconhecimento) são divs por esse mesmo
   motivo, e esta segue a mesma forma.

   ⚠ O pop-up é filho do <body>, NUNCA do #smooth-content: ele é `position:fixed`
   e, dentro do conteúdo suavizado, `fixed` passa a medir o ancestral transformado
   em vez da janela. É a mesma armadilha registrada no index.html.
   ============================================================================ */
(function(){
  "use strict";

  var BASE = "assets/img/ecossistema/expansao/";
  /* ⚠ mesma regra do resto do projeto: arte sobrescrita mantendo o nome precisa de URL
     nova, senão o navegador serve a cópia velha por até um dia (netlify.toml, /assets/*
     com max-age=86400). Se reexportar uma etapa, suba este número. */
  var VER = "?v=20261008";

  /* ============================================================
     OUTUBRO 2026 — a campanha do mês, trazida do Grand Show de outubro (2026-10-08)
     ------------------------------------------------------------
     Pedido do dono: *"todas as atualizações [...] do grandshow que atualizamos desse mês"*,
     item 3 da auditoria. São as 5 artes DA CAMPANHA do Grand Show de outubro (lá são 9: as 4 de
     destaques ficam fora daqui — ver o aviso no fim da lista)
     (`GrandShow\05-10-2026_08h11\GRANDSHOW[AP]\js\expansao-etapas.js`), com o nome do slide
     do deck: a campanha passou a se chamar "Investimento de Volta" e tem TRÊS etapas, não
     quatro — por isso a lista de setembro não foi "atualizada", foi trocada inteira.
     As telas 51 (Renovação), 52 e 53 (PRO) ficaram de fora lá, por pedido dele, e aqui também.
     As artes de setembro (`Grand Show - etapa*.jpg/.jpeg`) CONTINUAM NA PASTA: voltar é
     devolver a lista de baixo (está no histórico do git, commit e393414).
     ⚠ As paradas da apresentação acompanham sozinhas: elas perguntam `paginas()` a esta peça
     (8 paradas em setembro → 7 agora: enquadrar + 5 artes + fechar). */
  /* ============================================================
     2026-10-24 — AS 9 ARTES DO "PPT EXPANSAO.pdf" (vale hoje)
     ------------------------------------------------------------
     Pedido do dono, com o PDF em anexo: *"Usa esses no expansao"*. As 9 páginas (960x540 pt) foram
     renderizadas do próprio vetor a 1920x1080 e salvas como `Expansao-01..09.jpg` — nomes NOVOS, então
     não há cópia velha no cache de ninguém e o VER não precisa subir. A ordem é a do PDF, e as
     legendas são os títulos lidos em cada página.
     O que mudou em relação às 5 artes de outubro: abre na Licença Connect, a 1ª etapa passou a ser
     "conecte os 5 primeiros clientes diretos", e entram 3 páginas da Licença Connect Mob no fim.
     As paradas da apresentação acompanham sozinhas (`paginas()`): 7 → 11 (enquadrar + 9 + fechar).
     As 5 de outubro (Slide46..50) continuam na pasta e na lista ETAPAS_OUTUBRO logo abaixo.
     ============================================================ */
  var ETAPAS = [
    { arq:"Expansao-01.jpg", t:"Licença Connect" },
    { arq:"Expansao-02.jpg", t:"Campanha Investimento de Volta · Licença Connect" },
    { arq:"Expansao-03.jpg", t:"1ª Etapa · 5 primeiros clientes diretos, 1.000 pontos extra" },
    { arq:"Expansao-04.jpg", t:"2ª Etapa · conecte 2 licenciados, até R$ 600,00" },
    { arq:"Expansao-05.jpg", t:"3ª Etapa · Pré-Sênior + 3.000 pontos extra" },
    { arq:"Expansao-06.jpg", t:"Campanha Expansão · 5 ou 10 novos licenciados" },
    { arq:"Expansao-07.jpg", t:"Licença Connect Mob" },
    { arq:"Expansao-08.jpg", t:"Você ganha na venda da Licença Mob" },
    { arq:"Expansao-09.jpg", t:"Quanto você ganha de GP vendendo uma Licença Mob" }
    /* ⚠ O EXPERT 5.0 (capa, vídeo do Expert 4.0, data e QR) ficou aqui no fim por algumas horas de 2026-10-24 e
       virou SEÇÃO PRÓPRIA abaixo do mapa do Summit no mesmo dia (*"criando uma seção abaixo do mapa"*) — ver o
       js/expert.js. O suporte a página com vídeo (`video`, o `.xp-play`, `IGREEN_EXPANSAO.video(p)` e a parada
       do vídeo na apresentação) continua aqui: é genérico e não custa nada sem uso. */
  ];
  // OUTUBRO 2026, 1ª versão (2026-10-08 a 2026-10-24) — fora do ar; guardada só como referência, NADA a usa.
  var ETAPAS_OUTUBRO = [
    { arq:"Slide46.jpeg", t:"Campanha Investimento de Volta" },
    { arq:"Slide47.jpeg", t:"1ª Etapa · seja Green, 1.000 pontos extra" },
    { arq:"Slide48.jpeg", t:"2ª Etapa · conecte 2 licenciados, até R$ 600,00" },
    { arq:"Slide49.jpeg", t:"3ª Etapa · Pré-Sênior + 3.000 pontos extra" },
    { arq:"Slide50.jpeg", t:"Campanha Expansão · 5 ou 10 novos licenciados" }
    /* ⚠ OS DESTAQUES DA EXPANSÃO (Slide54 "Destaques Conexão Expansão" e Slide55-57, os três destaques do
       mês) NÃO ENTRAM NA APN DIGITAL — regra do dono, 2026-10-08: *"nao tem os destaques da expansao nunca
       entram na apn digital"*. Eles existem no Grand Show; aqui o pop-up é só a CAMPANHA. Ao trazer as artes
       de um mês novo do Grand Show, pare na última arte da campanha. */
  ];
  // SETEMBRO 2026 — fora do ar desde 2026-10-08; guardada só como referência, NADA a usa.
  // (Variável e não comentário porque ela tem comentários dentro, e comentário não aninha.)
  var ETAPAS_SETEMBRO = [
    { arq:"Grand Show - Etapa.jpg",  t:"Campanha · Seu Investimento de Volta" },
    { arq:"Grand Show - etapa1.jpg", t:"1ª Etapa · conecte 1 cliente" },
    { arq:"Grand Show - etapa2.jpg", t:"2ª Etapa · seja Green" },
    { arq:"Grand Show - etapa3.jpg", t:"3ª Etapa · conecte 2 licenciados" },
    /* ⚠ ESTA ENTRADA E .jpeg E AS OUTRAS SAO .jpg — nao e descuido meu nem inconsistencia
       a "arrumar". Em 2026-09-10 o dono reexportou esta arte e o arquivo veio com a outra
       extensao: `Grand Show - etapa4.jpeg`. O `.jpg` antigo saiu do disco, entao manter o
       caminho velho aqui era um 404 — a 4ª etapa abriria em branco no meio da apresentacao,
       sem erro visivel na tela. Regra do projeto: o codigo se ajusta ao nome do arquivo, nao
       o contrario. Renomear a arte para .jpg "por simetria" e uma troca a mais para quebrar
       na proxima reexportacao dele.
       ⚠ E O TEXTO MUDOU JUNTO: a arte nova diz "Qualificação SENIOR EXPANSÃO", nao mais
       "Pré-Sênior". O titulo aqui acompanha a arte — se discordarem, quem apresenta le uma
       coisa na legenda e ve outra no slide. */
    { arq:"Grand Show - etapa4.jpeg", t:"4ª Etapa · Sênior Expansão + 3.000 pontos" },
    { arq:"Grand Show - etapa5.jpeg", t:"Campanha Expansão · 5 ou 10 novos licenciados" }
  ];

  var pop = null, pagina = 0, smoother = null, travei = false, limpeza = 0;

  function total(){ return ETAPAS.length; }
  /* encodeURIComponent no NOME e só no nome: uma barra codificada deixaria de ser
     separador e quebraria o caminho. Mesma decisão da galeria do ecossistema. */
  function caminho(k){ return BASE + encodeURIComponent(ETAPAS[k].arq) + VER; }

  function monta(){
    if (pop) return pop;
    pop = document.createElement("div");
    pop.className = "xp-pop";
    pop.setAttribute("aria-hidden", "true");
    pop.innerHTML =
        '<div class="xp-pop-fundo"></div>'
      + '<div class="xp-pop-moldura">'
      +   '<div class="xp-pop-caixa" role="dialog" aria-modal="true" aria-label="Campanha da Conexão Expansão">'
      +     '<button class="xp-fechar" type="button" aria-label="Fechar">&times;</button>'
      +     '<button class="xp-nav xp-ant" type="button" aria-label="Etapa anterior">&lsaquo;</button>'
      +     '<button class="xp-nav xp-prox" type="button" aria-label="Próxima etapa">&rsaquo;</button>'
      +     '<figure class="xp-quadro">'
      /* width/height declarados: regra do projeto. São os 1920x1080 reais das artes, e é o
         que reserva a caixa na proporção certa antes de o arquivo chegar (sem salto). */
      +       '<img class="xp-img" src="" alt="" width="1920" height="1080" decoding="async">'
      /* o play da página de vídeo (Expert, 2026-10-24) — sempre no DOM, o desenha() mostra ou esconde */
      +       '<button class="xp-play" type="button" hidden aria-label="Assistir ao vídeo">'
      +         '<span class="xp-play-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>'
      +         '<span class="xp-play-txt">Assistir ao vídeo</span></button>'
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
    /* ⚠ o clique nas bolinhas é ligado UMA vez, aqui, e resolvido por delegação. Ligar no
       `desenha()` empilharia um ouvinte por passo — o defeito que a galeria do ecossistema
       já pagou e deixou anotado. */
    pop.querySelector(".xp-play").addEventListener("click", function(e){
      e.preventDefault(); e.stopPropagation();
      var k = ETAPAS[pagina] && ETAPAS[pagina].video, V = window.IGREEN_REC_VIDEO;
      if (k && V) try{ V.abrir(k); }catch(err){}
    });
    pop.querySelector(".xp-dots").addEventListener("click", function(e){
      var d = e.target.closest(".xp-dot"); if (!d) return;
      e.stopPropagation(); vaiPara(+d.getAttribute("data-p"));
    });
    return pop;
  }

  function desenha(){
    var n = total(), img = pop.querySelector(".xp-img");
    /* trocar o src de um <img> que já existe, em vez de recriar o nó: o navegador segura o
       quadro anterior até o novo estar pronto e a troca não pisca. Recriando, existe um
       quadro com a caixa vazia — numa tela de apresentação isso lê como falha. */
    img.src = caminho(pagina);
    img.alt = ETAPAS[pagina].t;
    pop.querySelector(".xp-legenda").textContent = ETAPAS[pagina].t;
    pop.querySelector(".xp-conta").textContent =
      String(pagina + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");

    var pts = "";
    for (var k = 0; k < n; k++){
      pts += '<button class="xp-dot' + (k === pagina ? " is-ativo" : "") + '" type="button" data-p="' + k
           + '" aria-label="Etapa ' + (k + 1) + '"></button>';
    }
    pop.querySelector(".xp-dots").innerHTML = pts;

    pop.querySelector(".xp-ant").disabled  = (pagina === 0);
    pop.querySelector(".xp-prox").disabled = (pagina === n - 1);

    /* pré-carrega só a PRÓXIMA. São quatro artes de ~1920x1080; baixar as quatro de uma vez
       na abertura custaria a espera toda no primeiro clique. */
    if (pagina + 1 < n){ var prox = new Image(); prox.decoding = "async"; prox.src = caminho(pagina + 1); }
    var play = pop.querySelector(".xp-play");
    if (play) play.hidden = !ETAPAS[pagina].video;
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
    /* ============================================================
       NA APRESENTAÇÃO A TRAVA DE SCROLL NÃO ENTRA — posse explícita
       ------------------------------------------------------------
       Fora da apresentação a trava é obrigatória: sem ela a roda rola a página atrás do
       pop-up. Dentro da apresentação ela é ERRADA — quem move o scroll ali é a varredura,
       escrevendo em `ScrollSmoother.scrollTop()`, e com o smoother pausado por esta peça
       aquele passo escreveria numa mecânica desligada. Mesma decisão, pelo mesmo motivo,
       que está registrada na galeria do ecossistema.
       ⚠ Aqui as quatro paradas compartilham UM y só (a seção não é pinada), então na
       prática a varredura não precisa andar entre elas — mas a regra fica igual à das
       outras peças de propósito: uma peça sobreposta não mexe no scroll da apresentação.
       ============================================================ */
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
    /* esvazia o src só DEPOIS do esmaecer: apagar no mesmo quadro tira o que havia para
       esmaecer e a saída simplesmente não aparece (defeito já relatado na galeria do
       ecossistema). O timer guardado evita apagar a imagem de uma reabertura rápida. */
    if (limpeza) clearTimeout(limpeza);
    limpeza = setTimeout(function(){
      limpeza = 0;
      if (aberto()) return;
      var im = pop.querySelector(".xp-img"); if (im) im.removeAttribute("src");
    }, 360);
    /* destrava SÓ se foi esta peça que travou: chamar paused(false) sem ter pausado
       liberaria a trava de outra peça que estivesse por cima. */
    if (travei){
      if (smoother) smoother.paused(false); else document.body.style.overflow = "";
    }
    travei = false; smoother = null;
    return true;
  }

  function aberto(){ return !!(pop && pop.classList.contains("is-aberto")); }
  function avancar(){ return aberto() ? vaiPara(pagina + 1) : false; }
  function voltar(){  return aberto() ? vaiPara(pagina - 1) : false; }

  /* o botão da seção */
  document.addEventListener("click", function(e){
    if (!e.target || !e.target.closest) return;
    if (!e.target.closest("#xpAbrir")) return;
    e.preventDefault();
    abrir(0);
  });

  /* ⚠ A GUARDA DA APRESENTAÇÃO É A PRIMEIRA LINHA DESTE TRATADOR, e não é zelo: são cinco
     peças sobrepostas neste projeto e por meses só três tinham a guarda — o resultado foi
     tecla que não anda e conteúdo que troca sozinho, sem nada no console. Na apresentação
     quem manda no passo é o goNext/goPrev; aqui só se escuta quando ela está desligada. */
  document.addEventListener("keydown", function(e){
    if (!aberto()) return;
    if (window.__pmode && window.__pmode.isActive && window.__pmode.isActive()) return;
    if (e.key === "Escape"){ e.preventDefault(); fechar(); return; }
    if (e.key === "ArrowRight"){ e.preventDefault(); avancar(); return; }
    if (e.key === "ArrowLeft"){ e.preventDefault(); voltar(); }
  }, true);

  /* ---- o vídeo da seção: só decodifica quando está na tela ----
     Orçamento do projeto: zero vídeo decodificando invisível. `preload="none"` no HTML
     evita o byte no boot; isto evita o quadro. */
  /* ⚠ DUAS SEÇÕES DESDE 2026-10-23: o #mob usa o mesmo desenho `xp-` e o mesmo cuidado com o vídeo
     e com a entrada da lista. Um observador por vídeo, como antes. */
  function ligaVideo(){
    if (!("IntersectionObserver" in window)) return;
    [].forEach.call(document.querySelectorAll("#expansao .xp-vid, #mob .xp-vid"), function(v){
      new IntersectionObserver(function(es){
        es.forEach(function(en){
          if (en.isIntersecting){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }
          else v.pause();
        });
      }, { threshold:.25 }).observe(v);
    });
  }

  /* entrada dos itens da lista ao chegar na tela.
     ⚠ O estado PADRÃO é visível, e a animação só roda quando a classe entra. O contrário
     (`opacity:0` no CSS, esperando o JS) é o que já apagou conteúdo neste projeto quando
     o gatilho não disparava — texto invisível não dá erro no console. */
  function ligaEntrada(){
    if (!("IntersectionObserver" in window)) return;
    ["expansao", "mob"].forEach(function(id){
      var sec = document.getElementById(id);
      if (!sec) return;
      var io = new IntersectionObserver(function(es){
        es.forEach(function(en){ if (en.isIntersecting){ sec.classList.add("xp-vivo"); io.disconnect(); } });
      }, { threshold:.2 });
      io.observe(sec);
    });
  }

  function pronto(){ ligaVideo(); ligaEntrada(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto);
  else pronto();

  /* a apresentação PERGUNTA à peça, não alcança dentro dela — mesma forma das outras */
  window.IGREEN_EXPANSAO = {
    abrir: abrir, fechar: fechar, aberto: aberto,
    avancar: avancar, voltar: voltar,
    paginas: total, ir: vaiPara,
    /* a chave do vídeo da página `p` (ou null) — a apresentação cria a parada do vídeo com isto */
    video: function(p){ var e = ETAPAS[p]; return (e && e.video) || null; },
    pagina: function(){ return pagina; }
  };
})();
