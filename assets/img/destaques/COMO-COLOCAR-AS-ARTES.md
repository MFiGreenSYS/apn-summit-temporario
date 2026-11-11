# Destaques — as 3 artes da seção

A seção **Destaques** fica logo abaixo da Agenda e é a última antes do rodapé. São três
telas que passam na horizontal, por clique e no modo apresentação.

Ponha os arquivos aqui, com estes nomes exatos:

| tela | arquivo | o que é | como está |
|---|---|---|---|
| 1 | `creator.jpeg` | iGreen Creator | 1672×941 · 1,4MB |
| 2 | `escritorio-virtual.jpeg` | Escritório Virtual | 1920×1080 · 400kB |
| 3 | `summit.jpeg` | iGreen Summit | 1920×1080 · 495kB |

Enquanto um arquivo não estiver aqui, **a tela dele mostra uma moldura tracejada com o nome
e o caminho** — é assim que a seção diz o que falta em vez de exibir um retângulo preto.

## Formato

- **16:9 deitada.** A moldura é 16:9 e a arte entra por inteiro (`contain`), nunca recortada.
- **`.jpg`**, como as outras artes do projeto. Sem avif/webp por enquanto, pelo mesmo motivo
  das imagens do ecossistema: um formato apontando para arquivo inexistente não volta para o
  jpg, e a arte simplesmente não aparece.
- **1920×1080** é o tamanho certo. A moldura chega a 1320px de largura num notebook de 1920,
  então de 1920 ela REDUZ — que é a condição em que o texto fica nítido. Arte menor que 1320
  aparece ampliada e com a borda mole.
- ⚠ **O `creator.jpeg` está em 1,4MB**, contra ~450kB dos outros dois, e com MENOS pixels
  (1672×941). É exportação com compressão baixa demais, não resolução a mais. Reencodar em
  qualidade 90 dá **366kB** — medido — sem diferença visível. Está pendente de decisão do dono.

## Custo no carregamento: zero

Nada é baixado quando a página abre — medido. A tela 1 só é buscada quando a seção chega
perto, e cada tela já adianta a seguinte, então quem clica encontra a próxima pronta.

## Mudar a ordem, o nome ou a quantidade

As três telas são `<figure class="dq-tela">` dentro da `<section id="destaques">`, no
`index.html`. Acrescentar ou remover uma tela é acrescentar ou remover um `figure`: as
bolinhas e as paradas do modo apresentação são contadas em runtime a partir do que existe no
HTML (ver `js/destaques.js` e a entrada 'Destaques' do `js/presentation-mode.js`).
