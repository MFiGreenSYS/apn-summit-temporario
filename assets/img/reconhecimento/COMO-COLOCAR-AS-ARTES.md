# Reconhecimento em imagens — Diretor e Acionista

Esses dois níveis usam **a mesma peça animada** do Sênior, Gestor e Executivo. A abertura é
idêntica: o pin voa, entra "Julho 2026 / RECONHECIMENTO / DIRETOR", o total, e a varredura de
luz. O que muda é só o que vem depois: no lugar do mural de nomes, **uma arte por clique**.

Por isso **a capa não entra na pasta**: o slide de capa do deck ("RECONHECIMENTO DIRETOR" com o
pin) é exatamente o que a abertura animada desenha. Ter os dois mostraria o mesmo título duas
vezes seguidas.

## Onde soltar

```
assets/img/reconhecimento/diretor/     ← hoje: Slide101 a Slide114 (14 diretores)
                                          + SlideUltimo_telaVideoComPayIlustrativo (tela final)
assets/img/reconhecimento/acionista/   ← hoje: Slide116 (1 arte)
```

**Nome livre.** Solte os arquivos e me avise: eu leio a pasta e escrevo a ordem no topo do
`js/reconhecimento.js`, no `NIVEIS`:

```js
3: { lvl:3, nome:"DIRETOR", ..., imagens:["Slide101", …, "Slide114"],
     telaFinal:{ arquivo:"SlideUltimo_telaVideoComPayIlustrativo", play:true } },
4: { lvl:4, nome:"ACIONISTA", ..., imagens:["Slide116"] }
```

**A ordem da lista é a ordem na tela**, e é ela que alimenta o total da abertura: 14 artes →
"14 DIRETORES". Com uma só, o texto cai para o singular: "1 ACIONISTA".

## Tela final (a que tem o play)

O `telaFinal` é a última tela do nível, e ela é **separada da lista** por um motivo prático:
o que está em `imagens` é contado como gente. Se a tela de vídeo entrasse na lista, a abertura
passaria a anunciar **"15 DIRETORES"** — e a 15ª não é um diretor.

`play:true` desenha por cima da moldura de vídeo da arte um **play ilustrativo**: botão de play,
um anel pulsando e uma barra de progresso que corre 9 segundos e para cheia. **Não toca vídeo
nenhum** — é sinalização, para a tela parecer um vídeo tocando durante a fala.

⚠ **Se você reexportar essa arte com a moldura do vídeo em outra posição, me avise.** A posição
do play foi medida dentro do arquivo atual (moldura em x 100–663, y 48–1031 de 1920×1080) e está
escrita no código. Moldura em outro lugar = play fora do lugar, e eu preciso medir de novo.

Para dar uma tela final ao **Acionista** também: mande a arte e me diga — é a mesma linha, no
nível 4.

Lista vazia = nível sem reconhecimento: sem parada na apresentação.

## Formato

- **1920×1080**, `.jpeg`, deitada (16:9).
- A arte entra **inteira**, nunca recortada: tem nome de gente e cidade escritos.
- Sem avif/webp por enquanto (um formato apontando para arquivo inexistente não volta para o
  jpeg — a arte simplesmente não aparece).

## Custo

Nada é baixado quando a página abre. Cada passo busca uma arte e **já adianta a seguinte**.
