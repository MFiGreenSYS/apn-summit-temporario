/* ============================================================================
   VÍDEO DO RECONHECIMENTO — um player por qualificação
   ----------------------------------------------------------------------------
   Pedido do dono (2026-08-13): *"tem como a gente fazer aquele padrao do video, para rodar
   ofiline para cada uma das qualificacoes?"*, com quatro links do YouTube (Gestor,
   Executivos, Diretores, Acionistas).

   "Aquele padrão" é a peça do vídeo institucional da Sede (o IIFE do `.hqwatch` no
   index.html). O que ela faz, e o que esta repete de propósito:

     · toca o ARQUIVO LOCAL primeiro, e o embed do YouTube é RESERVA;
     · abre DENTRO do site, num pop-up, nunca em aba nova (exceto o caso `file://` abaixo);
     · quando o vídeo acaba, dispara `igreen:video-fim` — e o `js/presentation-mode.js`
       escuta esse evento e chama `goNext()` sozinho, se a apresentação estiver ativa. É
       assim que "acabou o vídeo, segue o fluxo" funciona sem esta peça saber o que é uma
       apresentação.

   ============================================================================
   ⚠ LEIA ISTO ANTES DE PROMETER "OFFLINE" A ALGUÉM
   ----------------------------------------------------------------------------
   Vídeo do YouTube **não roda offline**. Não existe truque: o que roda sem internet é um
   ARQUIVO no disco. Então "offline" aqui significa exatamente isto:

       assets/video/reconhecimento-gestor.mp4
       assets/video/reconhecimento-executivo.mp4
       assets/video/reconhecimento-diretor.mp4
       assets/video/reconhecimento-acionista.mp4

   Com o arquivo presente, o pop-up toca ele e a máquina pode estar sem rede. SEM o arquivo,
   o pop-up cai no embed do YouTube — que funciona, mas exige internet. Nenhum caminho
   termina em botão morto, que é a regra da peça do institucional.

   Os quatro arquivos NÃO estão no repositório (ver `.gitignore`), pelo mesmo motivo do
   institucional: são pesados e o repositório não é lugar de master de vídeo. Ou seja, no
   Netlify a reserva do YouTube é o que vai tocar. Para apresentar SEM internet, os quatro
   têm de ser copiados para `assets/video/` na máquina que vai apresentar.

   ============================================================================
   OS LINKS: UM VÍDEO POR NÍVEL, E NÃO PLAYLIST — CORRIGIDO EM 2026-08-13
   ----------------------------------------------------------------------------
   ⚠ A PRIMEIRA VERSÃO DESTE ARQUIVO USAVA PLAYLIST, E ESTAVA ERRADA. Os primeiros links que
   o dono mandou vinham na forma `watch?v=...&list=...`, e eu li o `list=` como intenção —
   monte a playlist. Não era: era só o parâmetro que o YouTube cola na URL quando você copia
   um vídeo estando dentro de uma lista. Ele reenviou os quatro em `youtu.be/<id>`, um vídeo
   cada, e junto veio o que faltava: *"lembrando que eles abrem dentro da pagina e nao fora"*.

   O que isso RESOLVEU, e é bom porque era a pergunta que estava em aberto no commit cab1599:
   eu havia registrado que "a apresentação só avança quando o ÚLTIMO vídeo da playlist
   acabar — se alguma for longa, isso pesa ao vivo" e perguntado se ele preferia "um vídeo e
   segue". A resposta veio na forma dos links. É um vídeo, ele acaba, a apresentação segue.

   O que isso SIMPLIFICOU: sem `list=`, o estado ENDED do embed passa a significar o que
   parece significar. Toda a checagem de "é o último item da lista?" saiu junto — ver o
   comentário de `aoMudarEstado()`, que registra por que ela existia.

   ⚠ O ACIONISTA MUDOU DE CONTEÚDO, não só de forma. Antes eu só tinha a playlist dele e o
   embed usava `videoseries?list=`, que começa no primeiro item — que pode não ser o vídeo
   que ele quer mostrar. Agora tem ID próprio (`LF3UO65aB1E`). Se alguém comparar com o
   commit anterior e achar que "só tiraram a lista", este é o nível onde o vídeo em si trocou.

   O `?si=...` das URLs que ele mandou é o código de rastreio que o YouTube gera no botão
   "compartilhar". Não entra em nada: o que importa é o ID de 11 caracteres.
   ============================================================================ */
(function(){
  "use strict";

  /* ---------------------------------------------------------------------------
     OS QUATRO NÍVEIS
     ---------------------------------------------------------------------------
     A chave é o NÍVEL na escada das graduações (Sênior=0 … Acionista=4), o mesmo `data-lvl`
     que a galeria, o clique na barra e a apresentação usam. Não é a posição do slide — essa
     confusão já produziu galeria trocada nesta base (ver o comentário dos dois índices no
     index.html).

     ⚠ O SÊNIOR (0) NÃO ESTÁ AQUI, e não é esquecimento: ele não tem galeria de fotos, logo
     não tem a capa de vídeo (a capa é um cartão que aparece POR CIMA das fotos — sem fotos
     atrás, não é capa de nada). Se um dia ele ganhar galeria, entra aqui com o link dele.
     --------------------------------------------------------------------------- */
  /* ⚠ OS QUATRO IDs FORAM TROCADOS EM 2026-08-13, à noite — *"segue os links do youtube
     atualizado nao sao mais aqueles link"*. Nenhum dos anteriores sobreviveu. Os de antes
     (`N1y7_qi7glw` gestor, `sgg9HaKw6xg` executivo, `F1-N6Cmn3qI` diretor, `LF3UO65aB1E`
     acionista) estão em `git show c17ea63` se algum dia precisarem ser conferidos.
     ⚠ ISTO NÃO MEXEU NOS ARQUIVOS LOCAIS, e é justamente por isso que vale um aviso: os quatro
     `.mp4` do disco continuam sendo os que chegaram mais cedo naquele dia. Se os vídeos do
     YouTube trocaram de CONTEÚDO (e não só de endereço), o site passou a ter duas versões
     diferentes do mesmo reconhecimento: offline toca o arquivo antigo, online toca o novo. O
     código não tem como perceber isso — só quem assiste. Está em EM ABERTO no commit. */
  /* ⚠ A CHAVE DEIXOU DE SER "SÓ NÍVEL" EM 2026-08-13. As quatro primeiras continuam sendo o
     NÍVEL na escada das graduações (número), mas entrou uma chave de TEXTO — `seguros`, do
     ecossistema. Por isso o `abrir()` não faz mais `+lvl` cego: número vira número, texto fica
     texto. Fazer `+"seguros"` daria NaN e a peça recusaria em silêncio, que é o tipo de defeito
     mudo que este projeto já pagou caro várias vezes.
     ⚠ O CAMINHO DO ARQUIVO É EXPLÍCITO em cada entrada, e isso também mudou: antes era montado
     por fórmula (`reconhecimento-<slug>.mp4`). O vídeo do Seguros chegou como
     `Seguros-BPSeguradora.mp4` — nome do dono, que não cabe em fórmula nenhuma. Regra do
     projeto: o código se ajusta ao arquivo, não o contrário. */
  var NIVEIS = {
    1:        { nome:"Gestor",          video:"aKa11Al0EO8", arquivo:"assets/video/reconhecimento-gestor.mp4"    },
    2:        { nome:"Executivo",       video:"1XJyhAy-JoI", arquivo:"assets/video/reconhecimento-executivo.mp4" },
    3:        { nome:"Diretor",         video:"GgmeAO4R81Y", arquivo:"assets/video/reconhecimento-diretor.mp4"   },
    4:        { nome:"Acionista",       video:"VgvyWPzsx_0", arquivo:"assets/video/reconhecimento-acionista.mp4" },
    /* Conexão Seguros — pedido do dono em 2026-08-13, para dentro do ecossistema. Mesma
       mecânica dos quatro acima: arquivo local primeiro, YouTube de reserva, e ao acabar
       dispara `igreen:video-fim` para a apresentação seguir sozinha. */
    seguros:  { nome:"Conexão Seguros", video:"G2sJP-6YMg4", arquivo:"assets/video/Seguros-BPSeguradora.mp4"     },
    /* Conexão Green — pedido do dono em 2026-08-14: o vídeo do Márcio Garcia ANTES da tabela
       de bônus, "replicando o fluxo como exemplo da conexão seguros". Mesma mecânica: arquivo
       local primeiro, YouTube de reserva, e ao acabar dispara `igreen:video-fim`.
       ⚠ O arquivo é `video-conexao-green.mp4` e NÃO o `conexao-green.mp4`, que já existia na
       mesma pasta desde 2026-08-10 e é outro vídeo (1 MB contra 9,9 MB). Os dois nomes são
       quase iguais e trocar um pelo outro não daria erro nenhum — daria o vídeo errado no meio
       da apresentação. */
    green:    { nome:"Conexão Green",   video:"ZYk43x89eBY", arquivo:"assets/video/video-conexao-green.mp4"    },
    /* Conexão Mob — o vídeo da Sol no eletroposto, pedido de 2026-10-14 ("coloque o vídeo da Sol").
       ⚠ SEM YOUTUBE (`video:""`): chegou só o arquivo. Sem ID não existe reserva, então se o
       arquivo faltar o pop-up mostra o recado DENTRO dele em vez de montar um embed quebrado —
       ver `semReserva()`. Quando houver link público, é preencher o ID aqui e nada mais. */
    mob:      { nome:"Conexão Mob",     video:"",            arquivo:"assets/video/video-conexao-mob.mp4"      }
    /* (o `expert` esteve aqui por algumas horas de 2026-10-24, enquanto o vídeo do Expert 4.0 abria pelo pop-up da
       Expansão; desde a seção #expert ele toca DENTRO do quadro dela, pelo js/expert.js) */
  };

  /* ============================================================================
     ⚠ VERSAO DOS VIDEOS — SUBA SEMPRE QUE UM .mp4 FOR SOBRESCRITO COM O MESMO NOME
     ----------------------------------------------------------------------------
     Isto FALTAVA e virou risco real em 2026-08-13: o dono trocou o Seguros mantendo o nome
     (1m35s/12MB viraram 1m29s/19MB). Sem versao na URL, o `netlify.toml` guarda `/assets/*`
     por UM DIA — entao quem ja tinha aberto o site continuaria vendo o video ANTIGO, sem
     nenhum sinal de erro. E o mesmo defeito que ele relatou ontem com a arte do "TOP 3", que
     me custou uma investigacao inteira ate eu provar por md5 que o site estava certo e o
     navegador dele e que servia a copia velha.
     A licao ja estava escrita no projeto ("Arquivo externo que muda de conteudo TEM de mudar
     de URL", 2026-08-04) e eu a apliquei nos JS e nas IMAGENS — e nao nos VIDEOS. Vale para
     os tres.
     ⚠ Nao vale so para o Seguros: os quatro do reconhecimento sao MENSAIS e vao ser
     sobrescritos com o mesmo nome todo mes. Suba este numero junto.
     ============================================================================ */
  /* 2026-10-24: os 4 do reconhecimento SOBRESCRITOS com os vídeos novos das viagens ("Trocar os vídeos para
     esses, das viagens", pasta D:/iGreen.SYS/Videos Novos: gestores/executivos/diretores/acionistas.mp4, 4K
     de 412-622MB). Servidos em 1080p, CRF 23, áudio AAC 128k, sem a trilha de timecode do original:
     gestor 41MB/1m08s, executivo 55MB/1m13s, diretor 28MB/48s, acionista 38MB/1m07s.
     ⚠ Os IDs do YouTube abaixo NÃO foram trocados: a reserva online ainda toca os vídeos anteriores. */
  /* 2026-11-06: SOBRESCRITOS DE NOVO, com a versão nova dos 4 ("atualize os seguintes vídeos", pasta
     Downloads/Igreen videos: GESTORES/executivos/diretores/acionisas.mp4, 4K de 449-642MB, 30fps). Mesmo
     padrão: 1080p, CRF 23, AAC 128k, faststart, sem timecode. gestor 38MB/1m05s, executivo 58MB/1m13s,
     diretor 30MB/52s, acionista 40MB/1m09s. Os IDs do YouTube continuam os antigos (reserva online). */
  var VER = "?v=20261106";

  /* número continua número (níveis), texto continua texto (conexões) */
  function chave(k){
    if (typeof k === "number") return k;
    var s = String(k);
    return /^\d+$/.test(s) ? +s : s;
  }
  function local(k){ return NIVEIS[k].arquivo + VER; }
  function linkPublico(k){ return "https://www.youtube.com/watch?v=" + NIVEIS[k].video; }

  var http = (location.protocol === "http:" || location.protocol === "https:");

  /* ---------------------------------------------------------------------------
     O POP-UP
     ---------------------------------------------------------------------------
     Reusa as classes `vmodal`/`vm-*` do vídeo institucional DE PROPÓSITO: o CSS já existe,
     já foi ajustado com o dono e já tem responsivo resolvido. Zero linha de estilo nova.
     O `id` é outro (`recVideoModal`) porque `id` é único e o institucional já usa
     `videoModal`.

     UM modal para os quatro níveis, e não quatro modais: o conteúdo do painel é destruído a
     cada fechamento (`panel.innerHTML=""`). Isso não é economia de memória, é o que
     realmente PARA o vídeo — esconder deixaria o áudio tocando atrás do site. Foi a lição
     nº 1 da peça do institucional.
     --------------------------------------------------------------------------- */
  var modal = null, panel = null, botaoX = null;
  var nivelAberto = null;
  var usaReserva = {};          /* por nível: o arquivo local já falhou aqui? */
  var tentandoReserva = false;

  function monta(){
    if(modal) return;
    modal = document.createElement("div");
    modal.className = "vmodal";
    modal.id = "recVideoModal";
    modal.setAttribute("aria-hidden","true");
    modal.innerHTML = '<div class="vm-backdrop"></div>'
      + '<button class="vm-close" type="button" aria-label="Fechar o vídeo">&#10005;</button>'
      + '<div class="vm-panel" role="dialog" aria-modal="true" aria-label="Vídeo do reconhecimento"></div>';
    document.body.appendChild(modal);
    panel  = modal.querySelector(".vm-panel");
    botaoX = modal.querySelector(".vm-close");
    botaoX.addEventListener("click", fechar);
    modal.querySelector(".vm-backdrop").addEventListener("click", fechar);
    /* ⚠ SÓ ESCAPE, e isso é decisão. As setas e o espaço NÃO são escutados aqui de propósito:
       são as teclas do passador de slide, e todo avanço da apresentação tem de passar por
       `goNext`/`goPrev`. Uma peça que consome a seta cria o defeito de "dois donos" que já
       apareceu três vezes neste projeto — tecla que não anda ou conteúdo que troca sozinho.
       Consequência desejada: com o vídeo aberto, a seta continua avançando a apresentação, e
       quem apresenta pode cortar o vídeo sem procurar o X. É como o institucional já se
       comporta. */
    document.addEventListener("keydown", function(e){
      if(!aberto()) return;
      if(e.key === "Escape" || e.keyCode === 27) fechar();
    });
  }

  function sm(){ return (window.ScrollSmoother && ScrollSmoother.get) ? ScrollSmoother.get() : null; }

  /* ---- player 1: o arquivo local (é este que roda offline) --------------------------- */
  function montaLocal(lvl){
    var v = document.createElement("video");
    v.id = "recVmLocal";
    v.src = local(lvl);
    v.controls = true; v.playsInline = true; v.preload = "auto";
    v.setAttribute("playsinline","");   /* iOS: sem isso vai para tela cheia sozinho */
    v.width = 1440; v.height = 810;     /* dimensões declaradas: sem elas a caixa nasce 0 */
    v.addEventListener("ended", fim);
    /* 'error' no elemento video dispara por causa do src — um 404 do arquivo cai aqui, e é
       exatamente o gatilho da reserva. */
    v.addEventListener("error", function(){ semArquivo(lvl); });
    panel.appendChild(v);
    var p = v.play();
    /* autoplay COM som depende de o navegador ter registrado interação. No fluxo normal
       houve clique (no cartão da capa ou no avanço da apresentação), então toca. Recusado, o
       vídeo fica parado com os controles à mostra e o apresentador dá play — melhor que
       tocar sem som. */
    if(p && p.catch) p.catch(function(){});
  }

  /* ---- player 2 (reserva): o embed do YouTube ---------------------------------------- */
  function montaYouTube(lvl){
    var n = NIVEIS[lvl];
    var f = document.createElement("iframe");
    f.id = "recVmYT";
    /* UM vídeo, sem `list=` — ver o bloco dos links no topo do arquivo. A forma
       `videoseries?list=` saiu em 2026-08-13 junto com a playlist.
       &origin explícito: é exatamente o parâmetro que o YouTube cobra no Erro 153, e aqui
       ele nunca pode divergir (sai de location.origin).
       &enablejsapi=1: sem isso não há como saber que o vídeo ACABOU, e é o fim do vídeo que
       faz a apresentação seguir sozinha.
       &rel=0: sem isso o YouTube emenda vídeos "relacionados" de OUTROS canais no fim — numa
       apresentação ao vivo isso é o pior desfecho possível para um vídeo institucional. */
    f.src = "https://www.youtube-nocookie.com/embed/" + n.video
          + "?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
          + "&origin=" + encodeURIComponent(location.origin);
    f.title = "Vídeo do reconhecimento " + n.nome;
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.setAttribute("allowfullscreen","");
    f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
    panel.appendChild(f);
    if(window.YT && YT.Player) liga(); else pedeApi();
  }

  /* ---- a reserva entra em cena ------------------------------------------------------- */
  /* ============================================================
     ⚠ "DENTRO DA PÁGINA E NÃO FORA" — pedido explícito do dono, 2026-08-13
     ------------------------------------------------------------
     *"lembrando que eles abrem dentro da pagina e nao fora"*.

     O caminho normal já era dentro: pop-up com o arquivo local, ou pop-up com o embed. Sobrava
     UM caso de aba nova — `file://` E arquivo local faltando ao mesmo tempo. Ele existe porque
     em `file://` a origem é a string "null" e o player do YouTube devolve Erro 153; sem arquivo
     e sem embed, não há o que mostrar dentro.

     A REGRA AGORA: durante a apresentação, NUNCA aba nova. Uma aba abrindo ao vivo rouba a
     tela, tira o foco do teclado e o passador de slide para de responder — é pior que um
     recado. Então nesse caso o pop-up fica de pé com um aviso DENTRO dele, e a seta continua
     avançando a apresentação normalmente.
     Fora da apresentação (alguém navegando o site em `file://`) a aba nova continua, porque
     aí ela é a única forma de a pessoa realmente ver o vídeo, e não há apresentação para
     atrapalhar.

     ⚠ NA PRÁTICA nenhum dos dois dispara hoje: os quatro `.mp4` estão no disco desde
     2026-08-13, então o `file://` toca o arquivo local. Isto é rede de segurança, não fluxo.
     ============================================================ */
  function apresentando(){
    return !!(window.__pmode && window.__pmode.isActive && window.__pmode.isActive());
  }
  function recadoDentro(lvl){
    panel.innerHTML = '<div class="recvm-aviso" role="alert">'
      + '<strong>Vídeo do reconhecimento ' + NIVEIS[lvl].nome + '</strong>'
      + '<span>Não encontrei o arquivo em <code>' + local(lvl) + '</code>, e abrir o YouTube '
      + 'aqui exige a página servida por <code>http</code>.</span>'
      + '<span>Siga com a apresentação — a seta continua funcionando.</span>'
      + '</div>';
    /* estilo mínimo, aplicado no próprio nó: uma regra de CSS nova no index.html para um
       estado que quase nunca acontece seria peso morto no arquivo de 600kB. */
    var a = panel.firstChild;
    a.style.cssText = "display:flex;flex-direction:column;gap:.7em;padding:2em;max-width:34em;"
      + "color:#e8f5e9;font:400 1rem/1.5 inherit;text-align:center;align-items:center";
    a.firstChild.style.cssText = "font-size:1.15rem;color:#18FF00";
  }
  function abreNoYouTube(lvl){
    if(apresentando()){ recadoDentro(lvl); return; }
    fechar();
    try{ window.open(linkPublico(lvl), "_blank", "noopener"); }catch(e){}
  }
  /* ⚠ `usaReserva[lvl]` fica ligado para SEMPRE depois da primeira falha DAQUELE nível.
     Sem isso a segunda abertura montaria o elemento video quebrado de novo, o 'error'
     voltaria com o guarda já gasto e o pop-up abriria VAZIO — o pior dos estados, porque
     parece que o site travou. É por nível, não global: um arquivo faltando não deve
     condenar os outros três, que podem estar no disco. */
  /* entrada sem ID do YouTube (o Mob): não há reserva para tentar */
  function semReserva(lvl){ return !NIVEIS[lvl].video; }
  function semArquivo(lvl){
    if(tentandoReserva) return;
    tentandoReserva = true; usaReserva[lvl] = true;
    panel.innerHTML = "";
    if(semReserva(lvl)) recadoDentro(lvl);
    else if(http) montaYouTube(lvl);
    else abreNoYouTube(lvl);   /* em file:// o embed dá Erro 153; aba nova é o único jeito */
  }

  /* ---- abrir / fechar ---------------------------------------------------------------- */
  function abrir(lvl){
    lvl = chave(lvl);      /* número vira número, texto fica texto — ver o comentário do NIVEIS */
    if(!NIVEIS[lvl]) return false;
    monta();
    if(aberto()){ if(nivelAberto === lvl) return true; fechar(); }
    tentandoReserva = false;
    nivelAberto = lvl;
    /* ⚠ A ORDEM AQUI IMPORTA: o modal abre ANTES de decidir o conteúdo no caso do recado.
       O `abreNoYouTube` em apresentação escreve dentro do painel, e escrever num painel de
       modal fechado não mostra nada — o sintoma seria "o passo do vídeo não faz nada". */
    if(!usaReserva[lvl]) montaLocal(lvl);
    else if(semReserva(lvl)) recadoDentro(lvl);
    else if(http) montaYouTube(lvl);
    else if(apresentando()){ recadoDentro(lvl); }
    else { abreNoYouTube(lvl); return true; }   /* aba nova: só fora da apresentação */
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    var s = sm(); if(s) s.paused(true); else document.body.style.overflow = "hidden";
    /* preventScroll: `focus()` SEM ele faz o navegador rolar o elemento para dentro da tela,
       e isso briga com o ScrollSmoother — foi o defeito que o dono descreveu como "no modo
       apresentação ele desce automático". */
    try{ botaoX.focus({preventScroll:true}); }catch(e){ try{ botaoX.focus(); }catch(e2){} }
    return true;
  }

  function fechar(){
    if(!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    panel.innerHTML = "";          /* destrói o player: é isto que PARA o áudio */
    player = null;
    nivelAberto = null;
    var s = sm(); if(s) s.paused(false); else document.body.style.overflow = "";
  }

  function aberto(){ return !!(modal && modal.classList.contains("open")); }

  /* ---- FIM DO VÍDEO ----------------------------------------------------------------- */
  function fim(){
    fechar();
    /* quem reage é o js/presentation-mode.js, escutando este evento e chamando goNext() se
       a apresentação estiver ativa. Fora da apresentação o evento não faz nada, e é isso
       mesmo: no site, acabar o vídeo só fecha o pop-up. */
    try{ document.dispatchEvent(new CustomEvent("igreen:video-fim")); }catch(e){}
  }

  /* ---- a API de iframe do YouTube (só quando a reserva é usada) ---------------------- */
  var apiPedida = false, player = null;
  function liga(){
    var f = panel && panel.querySelector("iframe");
    if(!f || !window.YT || !YT.Player) return;
    try{
      player = new YT.Player(f, { events:{ onStateChange: aoMudarEstado } });
    }catch(e){}
  }
  /* ENDED = acabou, e agora isso é literal. A checagem de "é o último item da playlist?" que
     morava aqui SAIU em 2026-08-13, quando o dono reenviou os links como vídeo único.
     ⚠ VALE SABER POR QUE ELA EXISTIA, para não voltar a ser necessária sem ninguém perceber:
     num embed com `list=`, o estado 0 dispara ao fim de CADA item e o player emenda o
     seguinte. Avançar a apresentação no primeiro ENDED cortaria a sequência no meio, em cima
     da fala. Se algum dia um nível voltar a apontar para playlist, esta guarda tem de voltar
     junto — o `git show cab1599` tem a versão dela. */
  function aoMudarEstado(ev){
    if(!ev || ev.data !== 0) return;          /* 0 = YT.PlayerState.ENDED */
    fim();
  }
  /* ⚠ NÃO sobrescreve `window.onYouTubeIframeAPIReady` cegamente: o vídeo institucional já
     define esse mesmo global, e o último a carregar apagaria o outro — o sintoma seria "o
     vídeo da Sede não fecha sozinho depois que eu abri um do reconhecimento", intermitente e
     difícil de achar. Encadeia: chama o anterior e depois o nosso. */
  function pedeApi(){
    if(apiPedida) return; apiPedida = true;
    var anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){
      if(typeof anterior === "function"){ try{ anterior(); }catch(e){} }
      liga();
    };
    if(window.YT && YT.Player){ liga(); return; }
    var t = document.createElement("script");
    t.src = "https://www.youtube.com/iframe_api"; t.async = true;
    document.head.appendChild(t);
  }

  /* ---------------------------------------------------------------------------
     API — o index.html (cartão da capa) e a apresentação chamam por aqui
     --------------------------------------------------------------------------- */
  window.IGREEN_REC_VIDEO = {
    abrir:  abrir,
    fechar: fechar,
    aberto: aberto,
    nivel:  function(){ return nivelAberto; },
    /* quais níveis têm vídeo — para o index não repetir a lista e os dois discordarem com o
       tempo, que é a armadilha nº 1 desta base. */
    temVideo: function(lvl){ return !!NIVEIS[chave(lvl)]; },
    /* ⚠ SÓ OS NUMÉRICOS, e de propósito: quem consome isto é a apresentação das GRADUAÇÕES,
       que espera níveis. Devolver `seguros` aqui faria a escada das qualificações tentar
       montar uma parada para uma conexão do ecossistema. As chaves de texto se consultam
       pelo `temVideo`, que é por item. */
    niveis:   function(){ return Object.keys(NIVEIS).filter(function(k){ return /^\d+$/.test(k); }).map(Number); }
  };
})();
