/*!
 * <igreen-agenda> — carrossel de dias · iGreen Academy
 * v1.0.0 · Shadow DOM · zero dependências · zero requisições externas
 *
 * Uso mínimo:
 *   <script src="igreen-agenda.js" defer></script>
 *   <igreen-agenda src="agenda.json"></igreen-agenda>
 *
 * Por que Shadow DOM: o CSS do site host não entra e o daqui não sai.
 * É o que garante que a seção renderize IDÊNTICA ao demo, mesmo num
 * site com reset, normalize ou Bootstrap por cima. Colar CSS solto é
 * exatamente onde a réplica deixa de ser réplica.
 */
(() => {
'use strict';

const CSS = `
/* ============================================================
   TOKENS — medidos nas duas referências com Pillow
   imagem 1 (778x338): anel #A7AE00 · fundo #0B1C19 · 66,7% escuro
   imagem 2 (1538x870): verde #3EFF00 (59.306px) · fundo #0B0B0B

   GEOMETRIA DO CARROSSEL — derivada da imagem 1:
     diâmetros 241 · 177 · 136  ->  razões 1,000 · 0,734 · 0,564
     anel 17-18px em 241        ->  7,3% do diâmetro
     sobreposição ~38px         ->  0,158 x D, constante
     x1 = (1,000+0,734)/2 - 0,158 = 0,709 D
     x2 = x1 + (0,734+0,564)/2 - 0,158 = 1,200 D
     vão = 2 x 1,200 + 0,564 = 2,964 D
     conferência: D=241 -> 714px calculados x 719px medidos (erro 0,7%)

   Anel em #3EFF00 e não no #A7AE00 da referência: o oliva não
   existe na paleta iGreen. Troca em uma linha, em --anel.
   ============================================================ */
:host{
  /* ---- tokens públicos: sobrescreva de fora ---- */
  --anel:#3EFF00;
  --anel-2:#A7AE00;          /* o oliva original, se quiser voltar */
  --fundo:#0B1C19;
  --fundo-2:#050D0B;
  --ink:#F2FFF0;
  --ink-2:rgba(232,255,228,.62);
  --ink-3:rgba(232,255,228,.34);
  --linha:rgba(232,255,228,.13);
  --mola:cubic-bezier(.16,1.1,.3,1);
  --font:"Inter Display","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;

  /* base de tudo: um número só governa o carrossel inteiro */
  --D:clamp(118px, min(30cqw, 34vh), 320px);
  --r1:.734;   --r2:.564;    /* razões medidas */
  --x1:.709;   --x2:1.200;   /* deslocamentos medidos */
  --anelW:.028;              /* referência media 7,3%; afinado a pedido para 2,8% */
  --w:calc(var(--D) * var(--anelW));   /* espessura do aro, usada na máscara */
  /* AQUI HAVIA UMA CHAVE DE FECHAMENTO A MAIS, no pacote que o dono mandou. Ela fechava
     o :host logo depois das variaveis, e as quatro linhas seguintes (display, background,
     font-family e overflow) viravam declaracoes orfas que o navegador descarta.
     O efeito era grave e silencioso: sem display:block um custom element vale
     display:inline, entao a secao nasceria sem altura, sem fundo e sem recorte.
     O autor do pacote avisou no README que nunca tinha renderizado isto num navegador. */
  display:block;position:relative;isolation:isolate;
  background:var(--fundo);color:var(--ink);
  font-family:var(--font);-webkit-font-smoothing:antialiased;
  overflow:hidden;                    /* a seção não vaza para o site */
}
*{box-sizing:border-box;margin:0;padding:0}
button{font:inherit;color:inherit;border:0;background:none}
/* atmosfera fica DENTRO da seção — nada de position:fixed num componente */
.atmosfera{
  position:absolute;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(58% 46% at 50% 36%,rgba(62,255,0,.10),transparent 64%),
    radial-gradient(70% 60% at 50% 100%,rgba(62,255,0,.05),transparent 70%),
    linear-gradient(170deg,var(--fundo) 0%,var(--fundo-2) 62%,#020705 100%);
}
.env{container-type:inline-size;position:relative;z-index:1;width:min(var(--iga-largura,1240px),100%);margin-inline:auto;padding:var(--iga-padding,clamp(20px,3.4vw,44px))}

/* ---------------- cabeçalho ---------------- */
.topo{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.marca{display:flex;align-items:center;gap:12px}
.marca svg,.marca .marca-img{height:clamp(30px,3.4vw,44px);width:auto;flex:none;object-fit:contain;
  filter:drop-shadow(0 0 14px rgba(24,255,0,.4))}   /* mesmo tratamento do rodapé do site */
.marca .nome{font-size:clamp(20px,2.4vw,30px);font-weight:800;letter-spacing:-.03em;line-height:1}
.marca .nome i{font-style:normal;color:var(--anel)}
.marca .sub{font-size:clamp(9px,1vw,11px);letter-spacing:.34em;text-transform:uppercase;color:var(--ink-3);margin-top:4px}
.titulo{text-align:right}
.titulo h1{font-size:clamp(22px,3.2vw,42px);font-weight:800;letter-spacing:-.03em;line-height:1}
.titulo p{font-size:clamp(11px,1.2vw,15px);color:var(--ink-2);margin-top:4px}

/* ============================================================
   PALCO — 5 círculos, só transform e opacity animados
   ============================================================ */
.palco{
  position:relative;
  /* 1,72 D: o brilho do círculo ativo sai 0,30 D para baixo e 0,19 D
     para cima. Com 1,16 D a caixa cortava o glow — era isso. */
  height:calc(var(--D) * 1.72);
  margin:clamp(6px,2vh,26px) 0 clamp(10px,2vh,24px);
  display:grid;place-items:center;
  overflow-x:clip;overflow-y:visible;   /* corta só na horizontal */
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
}
/* A órbita carrega a POSIÇÃO. A bolha carrega a FLUTUAÇÃO.
   Separados porque as duas coisas são transform: no mesmo
   elemento, a keyframe de flutuar sobrescreveria a posição. */
.orbita{
  position:absolute;
  width:var(--D);height:var(--D);
  display:grid;place-items:center;
  transform:translate3d(var(--x,0),0,0) scale(var(--s,1));
  opacity:var(--o,1);
  z-index:var(--z,1);
  transition:transform .78s var(--mola),opacity .78s var(--mola);
  will-change:transform;
}
.bolha{
  position:absolute;inset:0;border-radius:50%;border:0;
  background:#000;overflow:hidden;
  cursor:pointer;padding:0;appearance:none;
  box-shadow:0 calc(var(--D) * .06) calc(var(--D) * .16) rgba(0,0,0,.55);
}
.bolha:focus-visible{outline:3px solid var(--ink);outline-offset:8px}

/* ARO — a mesma linha animada dos cards, em círculo.
   O conic nunca chega a transparente (piso .16): o aro fica sempre
   fechado e o que corre é só o pico de luz. Mesmo ciclo de 5,2s
   dos cards, para as duas coisas baterem na tela. */
.aro,.neon{
  position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:conic-gradient(from 0deg,
    rgba(62,255,0,.16) 0 50%,
    rgba(62,255,0,.34) 64%,
    var(--anel) 76%,
    rgba(62,255,0,.34) 88%,
    rgba(62,255,0,.16) 96% 100%);
  -webkit-mask:radial-gradient(farthest-side,transparent calc(100% - var(--w)),#000 calc(100% - var(--w)));
          mask:radial-gradient(farthest-side,transparent calc(100% - var(--w)),#000 calc(100% - var(--w)));
  animation:gira-aro 5.2s linear infinite;
  animation-play-state:paused;
}
@keyframes gira-aro{to{transform:rotate(360deg)}}
.aro{opacity:.62;transition:opacity .6s var(--mola)}
.orbita.ativa .aro{animation-play-state:running;opacity:1}
.orbita:not(.ativa):hover .aro{opacity:.9}
/* flutuação: 3,5% de D de amplitude — 11px em D=320 */
.orbita.ativa .bolha{animation:flutuar 4.6s ease-in-out infinite}
@keyframes flutuar{
  0%,100%{transform:translateY(0)}
  50%    {transform:translateY(calc(var(--D) * -.035))}
}

/* halo: luz forte/fraca sem animar box-shadow (que é repintura) */
.brilho{
  position:absolute;inset:-28%;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(62,255,0,.42),rgba(62,255,0,.10) 44%,transparent 68%);
  opacity:0;transition:opacity .6s var(--mola);
}
.orbita.ativa .brilho{animation:respirar 3.8s ease-in-out infinite}
@keyframes respirar{
  0%,100%{opacity:.30;transform:scale(.95)}
  50%    {opacity:.92;transform:scale(1.07)}
}
/* NEON NO TRAÇO — dois aros iguais ao stroke, borrados em raios
   diferentes e sobrepostos a ele. É assim que tubo de neon se
   comporta: núcleo nítido + descarga curta + bloom largo.
   O blur é ESTÁTICO; só opacity e transform pulsam. Animar
   box-shadow ou filter por quadro seria repintura da área toda. */
/* neon: o MESMO aro, borrado e girando em sincronia — o brilho
   segue o pico de luz em vez de ser halo uniforme */
.neon{opacity:0}
.n1{filter:blur(calc(var(--D) * .022))}
.n2{filter:blur(calc(var(--D) * .070))}
.orbita.ativa .n1{animation:gira-aro 5.2s linear infinite,neon-curto 2.4s ease-in-out infinite}
.orbita.ativa .n2{animation:gira-aro 5.2s linear infinite,neon-largo 2.4s ease-in-out infinite}
@keyframes neon-curto{0%,100%{opacity:.52}50%{opacity:1}}
@keyframes neon-largo{0%,100%{opacity:.30}50%{opacity:.90}}

/* eco do anel: segundo aro que abre e some, em contratempo com o halo */
.aura{
  position:absolute;inset:0;border-radius:50%;pointer-events:none;
  border:calc(var(--D) * var(--anelW)) solid var(--anel);
  opacity:0;
}
.orbita.ativa .aura{animation:eco 3.8s ease-in-out .95s infinite}
@keyframes eco{
  0%  {opacity:.46;transform:scale(1)}
  70% {opacity:0;transform:scale(1.16)}
  100%{opacity:0;transform:scale(1.16)}
}

/* miolo: foto se existir, senão fundo gerado por hash do dia */
.foto{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.04);transition:transform .9s var(--mola)}
.orbita:hover .foto{transform:scale(1.10)}
.selo-dia{
  position:absolute;inset:0;display:grid;place-content:center;text-align:center;gap:2px;
  background:linear-gradient(160deg,rgba(0,0,0,.15),rgba(0,0,0,.68));
}
.selo-dia .abrev{
  font-size:calc(var(--D) * .21);font-weight:800;letter-spacing:.04em;line-height:1;
  color:var(--ink);text-shadow:0 2px 24px rgba(0,0,0,.8);
}
.selo-dia .qtd{
  font-size:calc(var(--D) * .052);letter-spacing:.24em;text-transform:uppercase;
  color:var(--anel);margin-top:calc(var(--D) * .03);
}
.orbita:not(.ativa) .selo-dia{background:linear-gradient(160deg,rgba(0,0,0,.42),rgba(0,0,0,.8))}

/* ---------------- setas ---------------- */
.seta{
  position:absolute;top:50%;translate:0 -50%;z-index:20;
  width:clamp(38px,4.4vw,52px);aspect-ratio:1;border-radius:999px;
  display:grid;place-items:center;cursor:pointer;
  border:1px solid var(--linha);background:rgba(5,13,11,.6);color:var(--ink);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  transition:transform .4s var(--mola),border-color .4s var(--mola),color .4s var(--mola),background .4s var(--mola);
}
.seta:hover{border-color:var(--anel);color:var(--anel);background:rgba(62,255,0,.1)}
.seta:focus-visible{outline:2px solid var(--anel);outline-offset:3px}
.seta svg{width:11px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8}
.seta.ant{left:clamp(2px,1vw,14px)}
.seta.pro{right:clamp(2px,1vw,14px)}
.seta.ant:hover{transform:translateX(-3px)}
.seta.pro:hover{transform:translateX(3px)}

/* ============================================================
   INFORMAÇÃO DO DIA ATIVO
   ============================================================ */
.info{text-align:center;min-height:clamp(210px,28vh,290px)}
.info .dia{
  font-size:clamp(26px,4.6vw,54px);font-weight:800;letter-spacing:-.03em;line-height:1;
  color:var(--anel);text-shadow:0 0 46px rgba(62,255,0,.34);
}
.info .marcador{
  font-size:clamp(10px,1.1vw,12px);letter-spacing:.30em;text-transform:uppercase;
  color:var(--ink-3);margin-bottom:clamp(8px,1.4vh,14px);
}
/* cada evento do dia ativo é um card */
.lista{
  list-style:none;
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(248px,320px));
  justify-content:center;
  gap:clamp(10px,1.4vw,16px);
  margin-top:clamp(16px,2.6vh,30px);
}
/* a moldura do card é a linha animada: 1,5px de anel cônico girando.
   Um elemento por card, só transform. Delay negativo escalonado
   para os 3 cards de quarta não pulsarem em uníssono. */
.lista li{
  position:relative;
  display:grid;          /* estica o .miolo até o fim do card — ver a nota acima */
  padding:1.5px;
  border-radius:clamp(14px,1.5vw,20px);
  background:rgba(62,255,0,.16);
  overflow:hidden;
  box-shadow:0 14px 34px rgba(0,0,0,.34);
  opacity:0;transform:translateY(14px);
  animation:sobe .6s var(--mola) forwards;
  animation-delay:calc(var(--i) * 90ms + 120ms);
  transition:transform .45s var(--mola),box-shadow .45s var(--mola);
}
.lista .anel{
  position:absolute;top:50%;left:50%;
  width:190%;aspect-ratio:1;
  background:conic-gradient(from 0deg,
    transparent 0 54%,
    rgba(62,255,0,.34) 66%,
    var(--anel) 76%,
    rgba(62,255,0,.34) 86%,
    transparent 96%);
  transform:translate(-50%,-50%) rotate(0deg);
  animation:gira-anel 5.2s linear infinite;
  animation-delay:calc(var(--i) * -420ms);
}
@keyframes gira-anel{to{transform:translate(-50%,-50%) rotate(360deg)}}
.lista .miolo{
  position:relative;
  display:grid;grid-template-columns:minmax(52px,auto) 1px 1fr;
  align-items:center;gap:clamp(10px,1.4vw,16px);
  padding:clamp(13px,1.6vw,19px) clamp(15px,1.8vw,22px);
  text-align:left;
  border-radius:calc(clamp(14px,1.5vw,20px) - 1.5px);
  background:
    radial-gradient(140% 120% at 0% 0%,rgba(62,255,0,.10),transparent 58%),
    linear-gradient(160deg,#0C1F1B,#071310 62%,#050D0B);
}
.lista li:hover{
  transform:translateY(-3px);
  box-shadow:0 0 44px rgba(62,255,0,.18),0 20px 44px rgba(0,0,0,.44);
}
@keyframes sobe{to{opacity:1;transform:none}}
.lista .hora{
  font-size:clamp(16px,1.9vw,24px);font-weight:800;color:var(--anel);
  text-align:right;font-variant-numeric:tabular-nums;letter-spacing:-.01em;
  text-shadow:0 0 22px rgba(62,255,0,.42);
}
.lista .barra{align-self:stretch;background:linear-gradient(to bottom,transparent,var(--anel),transparent);min-height:2em}
.lista .nome{font-size:clamp(13px,1.5vw,18px);font-weight:600;letter-spacing:-.01em;line-height:1.3}

/* saída/entrada do bloco na troca de dia */
.info.trocando .dia,.info.trocando .marcador,.info.trocando .lista{
  animation:sai .22s ease-in forwards;
}
@keyframes sai{to{opacity:0;transform:translateY(-10px)}}

/* ---------------- pontos ---------------- */
.pontos{display:flex;justify-content:center;gap:10px;margin-top:clamp(18px,3vh,34px);padding-bottom:clamp(14px,3vh,32px)}
.pt{
  width:8px;height:8px;border-radius:999px;background:rgba(232,255,228,.20);
  border:0;padding:0;cursor:pointer;
  transition:transform .45s var(--mola),background .45s var(--mola),box-shadow .45s var(--mola);
}
.pt.on{background:var(--anel);transform:scale(1.55);box-shadow:0 0 16px rgba(62,255,0,.75)}
.pt:focus-visible{outline:2px solid var(--anel);outline-offset:4px}

@media (max-width:640px){
  .topo{justify-content:center;text-align:center}
  .titulo{text-align:center;width:100%}
  .lista{grid-template-columns:minmax(0,340px)}
  .lista .miolo{grid-template-columns:minmax(46px,auto) 1px 1fr}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms !important;animation-delay:0ms !important;transition-duration:.001ms !important}
}
`;

/* ============================================================
   GEOMETRIA — medida na arte de referência (778x338, Pillow)
   diâmetros 241 · 177 · 136  ->  razões 1,000 · 0,734 · 0,564
   sobreposição ~38px = 0,158 x D, constante entre pares
   x1 = (1,000+0,734)/2 - 0,158 = 0,709 D
   x2 = x1 + (0,734+0,564)/2 - 0,158 = 1,200 D
   vão = 2 x 1,200 + 0,564 = 2,964 D
   conferência: D=241 -> 714px calculados x 719px medidos (erro 0,7%)
   ============================================================ */
const RAZ = [1, .734, .564];
const DX  = [0, .709, 1.200];
const OP  = [1, .92, .70];

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash = s => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); };

/* LOGO OFICIAL, nao o desenho do pacote.
   O autor avisou no README: "O logo e desenho meu, aproximando a lampada-G. Sem o arquivo
   oficial da marca iGreen Academy." O DESIGN.md deste projeto e taxativo: nada de logo
   inventado, todo o design e autoral e a marca tem arquivo proprio. O rodape do site ja usa
   este mesmo SVG, entao a agenda passa a mostrar a mesma logomarca que o resto da pagina.
   Fica como <img> e nao inline: o SVG oficial tem 9,3kB e entraria inteiro no JS. */
const MARCA = `<img src="assets/logos/igreen-logomarca-neon.svg" alt="iGreen" class="marca-img" width="295" height="94">`;

class IgreenAgenda extends HTMLElement {
  static get observedAttributes(){ return ['src','titulo','subtitulo','ciclo','auto']; }

  constructor(){
    super();
    this._raiz = this.attachShadow({mode:'open'});
    this._dados = [];
    this._ativo = 0;
    this._timer = null;
    this._trocando = false;
    this._x0 = null;
    this._semMov = matchMedia('(prefers-reduced-motion:reduce)').matches;
  }

  /* ---------------- API pública ---------------- */
  get dados(){ return this._dados; }
  set dados(v){ this._dados = Array.isArray(v) ? v : []; this._render(); }
  get ativo(){ return this._ativo; }
  get ciclo(){ return Number(this.getAttribute('ciclo')) || 6000; }

  ir(i){
    const N = this._dados.length; if(!N) return;
    const alvo = ((i % N) + N) % N;
    if(this._trocando || alvo === this._ativo) return;
    this._trocando = true;
    this._info.classList.add('trocando');
    this.parar();
    setTimeout(()=>{
      this._ativo = alvo;
      this._info.classList.remove('trocando');
      this._posicionar();
      this._pintarInfo();
      this._trocando = false;
      this.tocar();
      this._emitir('agenda:trocar', {indice:this._ativo, dia:this._dados[this._ativo]});
    }, 220);
  }
  proximo(){ this.ir(this._ativo + 1); }
  anterior(){ this.ir(this._ativo - 1); }
  tocar(){
    if(this._semMov || this.getAttribute('auto') === 'off') return;
    clearTimeout(this._timer);
    this._timer = setTimeout(()=> this.ir(this._ativo + 1), this.ciclo);
  }
  parar(){ clearTimeout(this._timer); }

  /* ---------------- ciclo de vida ---------------- */
  connectedCallback(){
    this._montarShell();
    const inline = this.querySelector('script[type="application/json"]');
    if(inline){
      try{ this._dados = JSON.parse(inline.textContent); }
      catch(e){ console.error('[igreen-agenda] JSON inline inválido:', e); }
    }
    if(this.hasAttribute('src')) this._carregar(this.getAttribute('src'));
    else this._render();
  }
  disconnectedCallback(){ this.parar(); }
  attributeChangedCallback(n, a, b){
    if(a === b || !this._raiz.firstChild) return;
    if(n === 'src') this._carregar(b);
    if(n === 'titulo' && this._h1) this._h1.textContent = b;
    if(n === 'subtitulo' && this._sub) this._sub.textContent = b;
    if(n === 'auto'){ b === 'off' ? this.parar() : this.tocar(); }
  }

  async _carregar(url){
    try{
      const r = await fetch(url, {cache:'no-cache'});
      if(!r.ok) throw new Error('HTTP ' + r.status);
      this.dados = await r.json();
    }catch(e){
      console.error('[igreen-agenda] falha ao carregar', url, e);
      this._info.innerHTML = `<p class="dia">Agenda indisponível</p>`;
    }
  }

  _emitir(nome, detalhe){
    this.dispatchEvent(new CustomEvent(nome, {detail:detalhe, bubbles:true, composed:true}));
  }

  /* ---------------- shell ---------------- */
  _montarShell(){
    /* MONTA UMA VEZ SÓ. O connectedCallback dispara toda vez que o elemento entra no DOM —
       e MOVER um elemento (insertBefore) é remover e inserir de novo. Neste site a seção da
       agenda é reposicionada pelo #reorder-secoes depois do boot, então sem esta guarda a
       casca era montada DUAS vezes e a seção ficava com o dobro da altura: medido, 1839px
       em vez de 932px, com dois carrosséis empilhados.
       Sair aqui preserva o estado (o dia selecionado sobrevive ao movimento); o _render()
       que vem logo depois no connectedCallback redesenha o conteúdo na casca existente. */
    if(this._raiz && this._raiz.firstChild) return;
    const folha = document.createElement('style');
    folha.textContent = CSS;
    const raiz = document.createElement('div');
    raiz.innerHTML = `
      <div class="atmosfera" aria-hidden="true"></div>
      <div class="env" part="env">
        <header class="topo" part="topo">
          <div class="marca" part="marca">
            ${MARCA}
            <div><p class="sub">Academy</p></div>
          </div>
          <div class="titulo" part="titulo">
            <h1 part="titulo-h1"></h1>
            <p part="subtitulo"></p>
          </div>
        </header>

        <div class="palco" part="palco">
          <button class="seta ant" aria-label="Dia anterior"><svg viewBox="0 0 11 19"><path d="M9 1L2 9.5 9 18"/></svg></button>
          <button class="seta pro" aria-label="Próximo dia"><svg viewBox="0 0 11 19"><path d="M2 1l7 8.5L2 18"/></svg></button>
        </div>

        <section class="info" part="info" aria-live="polite"></section>
        <div class="pontos" part="pontos"></div>
      </div>`;
    this._raiz.append(folha, raiz);

    this._palco  = this._raiz.querySelector('.palco');
    this._info   = this._raiz.querySelector('.info');
    this._pontos = this._raiz.querySelector('.pontos');
    this._h1     = this._raiz.querySelector('.titulo h1');
    this._sub    = this._raiz.querySelector('.titulo p');

    this._h1.textContent  = this.getAttribute('titulo') || 'Treinamentos';
    this._sub.textContent = this.getAttribute('subtitulo') || 'Agenda Oficial';

    this._raiz.querySelector('.ant').addEventListener('click', ()=> this.anterior());
    this._raiz.querySelector('.pro').addEventListener('click', ()=> this.proximo());

    this._palco.addEventListener('pointerenter', ()=> this.parar(), {passive:true});
    this._palco.addEventListener('pointerleave', ()=> this.tocar(), {passive:true});
    this._palco.addEventListener('focusin',  ()=> this.parar());
    this._palco.addEventListener('focusout', ()=> this.tocar());

    this._palco.addEventListener('pointerdown', e=>{ this._x0 = e.clientX; }, {passive:true});
    this._palco.addEventListener('pointerup', e=>{
      if(this._x0 === null) return;
      const dx = e.clientX - this._x0; this._x0 = null;
      if(Math.abs(dx) > 44) this.ir(this._ativo + (dx < 0 ? 1 : -1));
    }, {passive:true});

    /* teclas só quando o foco está dentro do componente */
    this.addEventListener('keydown', e=>{
      if(e.code === 'ArrowLeft'){  e.preventDefault(); this.anterior(); }
      if(e.code === 'ArrowRight'){ e.preventDefault(); this.proximo(); }
    });

    /* pausa quando a seção sai da tela: timer rodando fora de vista é
       trabalho jogado fora e mexe no estado sem ninguém ver */
    if('IntersectionObserver' in window){
      this._io = new IntersectionObserver(es=>{
        es.forEach(e => e.isIntersecting ? this.tocar() : this.parar());
      }, {threshold:.25});
      this._io.observe(this);
    }
  }

  _fundoDia(d){
    const h = 92 + (hash(d.dia) % 30);
    const a = (hash(d.abrev) % 60) + 130;
    return `linear-gradient(${a}deg,hsl(${h} 64% 13%),hsl(${h} 58% 6%) 60%,#04100C)`;
  }

  /* ---------------- render ---------------- */
  _render(){
    if(!this._palco) return;
    this._palco.querySelectorAll('.orbita').forEach(el => el.remove());
    this._pontos.innerHTML = '';
    this._ativo = Math.min(Number(this.getAttribute('inicio')) || 0, Math.max(0, this._dados.length - 1));

    this._orbitas = this._dados.map((d, i) => {
      const o = document.createElement('span');
      o.className = 'orbita';
      const n = d.eventos.length;
      o.innerHTML = `
        <span class="brilho" aria-hidden="true"></span>
        <span class="neon n2" aria-hidden="true"></span>
        <span class="neon n1" aria-hidden="true"></span>
        <button class="bolha" type="button">
          <span class="foto"></span>
          <span class="selo-dia">
            <span class="abrev">${esc(d.abrev)}</span>
            <span class="qtd">${n} ${n > 1 ? 'aulas' : 'aula'}</span>
          </span>
        </button>
        <span class="aro" aria-hidden="true"></span>
        <span class="aura" aria-hidden="true"></span>`;
      const b = o.querySelector('.bolha');
      b.setAttribute('aria-label', `${d.dia}, ${n} treinamento${n > 1 ? 's' : ''}`);
      o.querySelector('.foto').style.backgroundImage = d.imagem ? `url("${d.imagem}")` : this._fundoDia(d);
      b.addEventListener('click', ()=>{
        this.ir(i);
        this._emitir('agenda:selecionar', {indice:i, dia:d});
      });
      this._palco.appendChild(o);
      return o;
    });

    this._dados.forEach((d, i) => {
      const p = document.createElement('button');
      p.className = 'pt'; p.type = 'button';
      p.setAttribute('aria-label', `Ir para ${d.dia}`);
      p.addEventListener('click', ()=> this.ir(i));
      this._pontos.appendChild(p);
    });

    this._posicionar();
    this._pintarInfo();
    this.tocar();
  }

  /* posição: só transform e opacity */
  _posicionar(){
    const N = this._dados.length;
    this._orbitas.forEach((o, i) => {
      let off = i - this._ativo;
      if(off >  N/2) off -= N;
      if(off < -N/2) off += N;
      const a = Math.min(Math.abs(off), 2);
      const lado = Math.sign(off);
      o.style.setProperty('--x', `calc(var(--D) * ${(lado * DX[a]).toFixed(3)})`);
      o.style.setProperty('--s', RAZ[a].toFixed(3));
      o.style.setProperty('--o', OP[a]);
      o.style.setProperty('--z', String(10 - a));
      o.classList.toggle('ativa', a === 0);
      o.querySelector('.bolha').setAttribute('aria-current', a === 0 ? 'true' : 'false');
    });
  }

  _pintarInfo(){
    const d = this._dados[this._ativo];
    if(!d) return;
    this._info.innerHTML = `
      <p class="marcador">${esc(this.getAttribute('marcador') || 'Agenda da semana')}</p>
      <p class="dia">${esc(d.dia)}</p>
      <ul class="lista">${d.eventos.map((e, i) => `
        <li style="--i:${i}">
          <span class="anel" aria-hidden="true"></span>
          <span class="miolo">
            <span class="hora">${esc(e.hora)}</span>
            <span class="barra"></span>
            <span class="nome">${esc(e.nome)}</span>
          </span>
        </li>`).join('')}</ul>`;
    this._pontos.querySelectorAll('.pt').forEach((p, i) => p.classList.toggle('on', i === this._ativo));
  }
}

if(!customElements.get('igreen-agenda')) customElements.define('igreen-agenda', IgreenAgenda);
})();
