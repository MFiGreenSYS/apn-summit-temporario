# Fotos do ecossistema — como colocar

Cada conexão do ecossistema tem um pop-up (um visor) que mostra **uma imagem por vez**.
Esta pasta é de onde ele lê.

## O que está lá hoje (conferido em 2026-08-12, abrindo cada uma)

O deck mudou de conteúdo nesta troca. Antes eram **capa + destaques** (nome, cidade,
número de licenciados). Agora são os **slides de campanha de agosto/2026**: Status PRO,
tabelas de bônus, promoções, licenças, as etapas do Início Rápido.

| pasta | slides | quantos | observação |
|---|---|---|---|
| `placas/` | **Slide1P** + Slide13, Slide14, Slide16 – Slide18 | **6** | abre no Slide1P ("Formas De Ganhos") |
| `solar/` | **Slide1S** + Slide22 – Slide24 | **4** | a menor. ⚠ o Slide1S daqui é outro arquivo que o de seguros |
| `livre/` | **Slide1L** + Slide29 – Slide33 | **6** | abre no Slide1L ("Forma de Ganhos") |
| `green/` | **Slide39** | **1** | ← era 10. Ver o aviso abaixo |
| `telecom/` | **Slide52** | **1** | ← era 13 |
| `seguros/` | **Slide71** | **1** | ← era 13 |
| `expansao/` | Slide77 – Slide83 | **7** | as quatro etapas são Slide80 a Slide83 |

**Total exibido: 26 imagens**, todas em 1920×1080 — medido abrindo cada uma no navegador, não
contando arquivo na pasta.

Com isso a apresentação inteira ficou com **100 cliques**, e a seção do Ecossistema com **40**.

### ⚠ Você vai contar 59 arquivos na pasta e o site mostra 26. As duas contas estão certas.

Em **13/08** você pediu, com três prints: *"as telas green, telecom, seguros devem ter somente
essas, as demais, dos ecossistema permanecem do jeito que esta"*. Então essas três conexões
ficaram com **um slide cada** — o "Bônus Extra" de cada uma, que era o que estava nos prints —
e as outras quatro seguem exatamente como estavam.

**Os 33 arquivos que saíram da lista continuam na pasta, de propósito.** O que faz o site buscar
uma imagem é a lista dentro do código, não o arquivo existir; arquivo fora da lista **não é
baixado por ninguém** e não deixa o site mais lento. Deixei assim porque a sua frase também podia
ser lida ao contrário ("tire essas três"), e apagar 33 artes por causa de uma leitura de frase
seria caro de desfazer. **Conferindo no navegador que ficou como você quis, me diga e eu apago os
33** — ou, se a leitura estava invertida, volto tudo numa linha por conexão.

Os slides que **ficaram**: `green/Slide39` (Bônus Extra, tabela de clientes, 4% a 60%),
`telecom/Slide52` (Bônus Extra, 50% a 300% por portabilidades) e `seguros/Slide71` (Bônus Extra,
Nível 1 a 4). Os dois últimos são o **mesmo layout com texto diferente** — não são arquivo
duplicado.

Os buracos são de propósito e vale conferir: **não existem** Slide36 e Slide61 (você tirou
ao montar o deck), e **saíram no fim do dia 12/08**, a seu pedido, os Slide15, Slide19 e
Slide20 de Placas e os Slide72 a Slide75 de Seguros. Se algum deles saiu sem querer, me
diga — todos estão guardados no commit `d552ad3` e voltam com um comando.

## A ordem: neste deck é a ordem do número, e isso foi conferido

Cada conexão aparece na **ordem crescente do número do slide** — `Slide13`, depois `14`,
depois `15`, e assim por diante.

⚠ **Isso é o contrário do que valia no deck anterior**, e é bom você saber por quê: antes a
capa do Green se chamava `SlideTop1` e a da Livre `Slide 1_Livre`, então a ordem do número
dava errado. Neste deck não dá. A prova mais clara é a Expansão: os slides 80, 81, 82 e 83
são literalmente "1ª Etapa", "2ª Etapa", "3ª Etapa" e "4ª Etapa".

⚠ **Seis conexões abrem no `Slide1X` que você mandou** (o "Como Funciona" / "Formas de
Ganhos" de cada uma). A expansão é a única sem, e bate com a sua lista — se quiser uma para
ela, me diga.

⚠ **O `Slideulitmo` é o único que vai no FIM**, no telecom, porque foi o único para o qual
você marcou posição. Os outros seis vão no começo.

⚠ **Dois nomes merecem cuidado, e não vou mudá-los:** `Slide1S` existe em solar E em seguros
com imagens diferentes (funciona, porque a pasta faz parte do endereço), e `Slideulitmo`
está com o "l" e o "t" trocados. Mantenho exatamente como você nomeou — se eu "corrigir", a
lista para de achar o arquivo e a imagem desaparece sem dar erro.

⚠ **Se você trocar uma arte e a ordem dela importar, me diga.** Eu confiro abrindo os
arquivos, mas não adivinho intenção — na expansão do deck anterior a ordem certa era
`Slide100 → Slide99 → Slide98`, ao contrário do número, e só você sabia disso.

## Os nomes ficam como estão

Não precisa renomear para `1.jpg`, `2.jpg`, e **não precisa evitar espaço no nome** — o
código codifica o nome antes de virar endereço. No deck anterior um arquivo se chamava
`Slide 1_Livre.jpeg`, com espaço, e funcionava.

Reexportou o deck? **Sobrescreva os arquivos com os mesmos nomes** e nada mais precisa
mudar. Se os nomes mudarem, aí sim me avise (foi o que aconteceu em 2026-08-12: dos 59
nomes que chegaram, só 1 coincidia com a lista antiga).

## Quando entrar ou sair imagem

⚠ **Me avise.** O navegador não sabe listar pasta: as sete listas estão escritas no topo
do `js/ecossistema-galeria.js`, e é lá que eu mexo.

```js
var FOTOS = {
  placas:   { arquivos:[ "Slide13", "Slide14", "Slide16", ... ] },
  solar:    { arquivos:[ "Slide22", "Slide23", "Slide24" ] },
  ...
};
```

**A ordem da lista é a ordem na tela.** Acrescentar tela é pôr o nome (sem a extensão) na
posição certa — a contagem, o contador do rodapé e as paradas da apresentação saem todos
daí.

Se você **trocar** os arquivos da pasta e não me avisar, acontece o seguinte: os nomes
novos ninguém pede, e os nomes antigos não existem mais — as sete conexões abrem o pop-up
**preto**. Foi o risco real de 2026-08-12, quando 58 dos 59 nomes mudaram.

⚠ **E existe um caso pior, que não dá erro nenhum:** se um nome antigo continuar existindo
mas com **outra imagem dentro**, o visor mostra a imagem errada calado. Aconteceu com o
`green/Slide40` — era a capa do TOP 3 e virou "KWH E GREEN POINTS DOBRADO". É por isso que
eu confiro abrindo os arquivos, e não só checando se carregam.

Lista vazia = conexão sem imagem: sem pop-up e sem parada na apresentação.

## Formato

- **Só `.jpeg`**, e isso é proteção. Não converta para avif/webp por conta própria: o
  visor aponta direto para o `.jpeg`, e se um dia virar `<picture>` com três formatos,
  os três precisam existir para toda imagem — um `<source>` apontando para arquivo que
  não existe **não** cai para o de baixo, a imagem só não aparece.
- **1920×1080**, exportado do deck. É a resolução em que a moldura reduz em vez de
  ampliar, e é isso que deixa o texto do slide nítido.
- **Peso: a pasta está com 21MB** (média de ~355kB por slide) e isso **não** deixa o site
  mais lento para abrir. Nenhuma dessas imagens é baixada no carregamento da página: o
  visor pede uma por vez e adianta só a seguinte. Quem nunca abre um pop-up não baixa
  nenhuma.

## Uma observação sobre celular

No celular o visor desenha o slide com **365px de largura**. Nos slides que são tabela
cheia de letra miúda (por exemplo o `green/Slide39` e o `telecom/Slide49`) fica apertado
para ler. Não é defeito do site — é que este deck ficou mais denso que o anterior, que era
foto com nome grande. Se for incomodar na prática, me diga e a gente trata esses slides à
parte.

## ⚠ Uma coisa nova, sobre MAIÚSCULA e minúscula no nome

Os arquivos que você mandou agora têm letra no nome (`Slide1g` com g minúsculo, `Slide1L`,
`Slide1P`, `Slide1S`, `Slide1T` com maiúscula). Isso trouxe um risco que não existia antes,
e é bom você saber porque **não dá para ver testando no seu Mac**:

- o disco do Mac **não diferencia** maiúscula de minúscula. Pedir `Slide1G` (G maiúsculo)
  funciona igual, mesmo o arquivo sendo `Slide1g`;
- o servidor onde o site fica publicado **diferencia**. Lá, uma letra trocada = imagem que
  não aparece, só no site, nunca na sua máquina.

Eu confiro isso comparando letra por letra antes de entregar. Só me avise quando trocar um
arquivo — é o mesmo pedido de sempre, agora com um motivo a mais.

## ⚠ Se você SOBRESCREVER uma arte com o mesmo nome, me avise

Este é o caso que já deu problema de verdade, em 2026-08-12: você viu na Conexão Green um
slide que **não existe mais** ("TOP 3 CONEXÃO GREEN"). O site estava certo — conferido, o
arquivo no servidor era o novo. Quem estava errado era o **seu navegador**, que guardou a
imagem antiga.

Por que acontece: o endereço da imagem não muda quando você troca o arquivo mantendo o nome.
Para o navegador, `Slide40.jpeg` é `Slide40.jpeg`, e ele guarda a cópia por **um dia**.

O que eu faço quando você me avisa: subo um número de versão no código, o endereço muda, e
todo mundo recebe a imagem nova na hora — inclusive quem já tinha visitado. **Não adianta só
subir o arquivo.**

Se quiser resolver sozinho na sua máquina, um recarregamento forçado (`Ctrl+Shift+R`, ou
`Cmd+Shift+R` no Mac) limpa o seu navegador — mas **só o seu**. Quem assistir à apresentação
continuaria vendo o antigo. Por isso o certo é me avisar.

⚠ **Acrescentar ou remover** arquivo com nome novo **não** tem esse problema: nome novo já é
endereço novo.
