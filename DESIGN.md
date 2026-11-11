# DESIGN.md — integridade visual da landing iGreen

Este documento existe para que qualquer pessoa possa **crescer** o site sem que ele deixe de parecer o mesmo site. Se você vai criar uma seção, uma página interna ou um componente, o padrão está aqui.

**Todo o design é autoral.** Não existe e não deve existir nenhuma referência, imagem, logo, fonte ou link de terceiros neste projeto. Se você precisar de inspiração, derive dos tokens e padrões abaixo — não busque fora.

## Tokens reais (fonte da verdade: `:root` no `index.html`, linhas 26-27)

```css
--bg:       #030603                      /* preto esverdeado, quase puro */
--green:    #18FF00                      /* verde elétrico — a assinatura da marca */
--ink:      #f2fff0                       /* texto principal, branco levemente verde */
--ink-dim:  rgba(232,255,228,.62)         /* texto secundário */
--line:     rgba(232,255,228,.13)         /* bordas e divisores */
```

O verde `#18FF00` é usado com parcimônia: títulos em destaque, dados numéricos, ícones de estado e brilhos. **Nunca** como fundo de área grande — ele funciona porque é raro.

Páginas de produto acrescentam tokens de acento próprios (`--acc`, `--acc-glow`, `--acc-tint`, `--acc-line`) para dar identidade a cada conexão sem sair da família. Ao criar uma página nova, siga esse mecanismo em vez de inventar cores soltas.

## Tipografia

- Família: **Inter Display**, com fallback `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- Arquivos locais em `assets/fonts/`: `InterDisplay-Regular.woff2` e `InterDisplay-Medium.woff2`
- **Não adicione fontes novas nem serviços de fonte externos.** Peso e estilo se resolvem com os dois arquivos que existem.
- Títulos usam `font-weight:400` com `letter-spacing:-.02em` e `line-height` apertado (1.12–1.16) — a elegância vem do tracking negativo, não do peso.
- Tamanhos são fluidos com `clamp()`. Padrão de título de seção: `clamp(36px,4vw,56px)`.
- Kickers (rótulos acima do título): caixa alta, `letter-spacing` largo (`.26em` a `.34em`), verde, ~11–13px.

## Ritmo e composição

- Fundo escuro constante; a profundidade vem de **gradientes radiais de verde em opacidade muito baixa** (0.05 a 0.07), não de caixas cinzas.
- Cartões: fundo quase transparente (`rgba(255,255,255,.03)`), borda `--line`, cantos generosos (16–26px) ou pílula (`999px`) em elementos de ação.
- Máscaras `linear-gradient`/`radial-gradient` em `mask-image` para dissolver bordas de camadas decorativas — o site quase não tem corte reto.
- Brilho é feito com `box-shadow` colorido de raio grande e baixa opacidade, nunca com borda grossa.

## Movimento

A linguagem de animação é **entrada suave e discreta**, não espetáculo:

- Reveal padrão: opacidade 0→1 com deslocamento vertical de ~20px, `transition:opacity .6s ease, transform .65s cubic-bezier(.16,1.1,.3,1)`.
- Cascata de elementos com `transition-delay` escalonado de ~80ms (0.05 / 0.12 / 0.2 / 0.28 …).
- **Prefira tempo (CSS) a scroll.** Coreografia amarrada ao scroll custa trabalho por quadro e obriga o usuário a rolar devagar para ver. Só use scroll quando o movimento *conta uma história de progresso*.
- Sempre respeite `prefers-reduced-motion`.
- Nunca anime `width`, `height`, `top` ou `left`. Só `opacity` e `transform` — são as duas que a GPU compõe sem recalcular layout.

## Padrão de ativos

**Imagens**
- Cadeia `<picture>`: AVIF → WebP → JPG/PNG. Fundos em CSS usam `image-set()` com fallback `url()` antes.
- **Sempre** declare `width` e `height` na tag. Não é opcional: sem elas, `loading="lazy"` pode impedir a imagem de carregar para sempre (aconteceu). Ver armadilhas no `.claude/CLAUDE.md`.
- `loading="lazy"` e `decoding="async"` em tudo que não é visível no primeiro quadro. O que é visível de cara leva `fetchpriority="high"`.
- Imagem com transparência ou usada com `mix-blend-mode`: AVIF **lossless**. Lossy destrói o alpha.
- Masters pesados ficam no disco e fora do git (padrão `*-master.*` no `.gitignore`).

**Vídeo**
- H.264 em MP4, `yuv420p`, sem áudio (`-an`), `-movflags +faststart`.
- `muted playsinline loop preload="none"` + poster extraído do **próprio vídeo tratado**.
- Play/pause por visibilidade real (`js/video-inview.js`), nunca por geometria de ScrollTrigger.
- Gradiente estático sobre vídeo: asse no arquivo em vez de compor por quadro.

## Ao criar uma página interna nova

Use `produtos/template.html` como base. Ela já traz a estrutura, os tokens de acento, a transição de página e o hero. Troque conteúdo e acento; não reinvente a estrutura.

Checklist: tokens de acento definidos · fontes locais (nenhuma externa) · imagens com dimensões declaradas e cadeia de formatos · reveal com o timing padrão · testado em 1920×946, 1536×750 @125% e 390×844 @3x.
