# GranShow[AP] — apresentação iGreen

Landing da iGreen Energy preparada para o **GranShow**, com 8 páginas de produto e um **modo apresentação** que substitui PowerPoint em apresentações ao vivo. É a partir dele que a apresentação roda: cada clique avança uma parada.

Este repositório **não é** o site institucional em produção. Aquele é o `igreenlab/ui-apn-institucional`, e o que existe aqui — a peça de reconhecimento por graduação, a galeria de slides por conexão do ecossistema, os Destaques e o TOP 10 Green Points — nunca entrou nele. Por isso o `.github/workflows/deploy-prod.yml`, que fazia SSH no servidor de produção a cada push na `main`, **foi removido**: aqui ele deploiaria a apresentação por cima do site institucional.

## Antes de mexer, leia isto

O projeto é **pequeno em tamanho e alto em acoplamento**: o `index.html` tem cerca de 6.000 linhas com CSS e JavaScript embutidos, e uma mudança visual aparentemente inocente pode quebrar a navegação, o scroll e o modo apresentação ao mesmo tempo.

Por isso existe um pipeline de trabalho em **[`.claude/`](.claude/)**. Se você vai alterar qualquer coisa aqui usando Claude Code, ele é carregado automaticamente e cuida das consequências técnicas por você — inclusive validando que nada saiu de lugar.

- **[`.claude/CLAUDE.md`](.claude/CLAUDE.md)** — as regras, a anatomia do projeto e as armadilhas já descobertas. Comece por aqui.
- **[`DESIGN.md`](DESIGN.md)** — a identidade visual: cores, tipografia, movimento e o padrão de tratamento de imagens e vídeos. Todo o design é autoral; não há nada de terceiros no projeto e não deve haver.

Peça a alteração em português comum — "adiciona um card no ecossistema", "troca essa foto", "atualiza esse número". O pipeline identifica a natureza do pedido e aciona as verificações necessárias.

### Rode isto uma vez, neste clone

```bash
git config core.hooksPath .githooks
```

Com o Claude Code, as verificações já rodam sozinhas (terminal ou VS Code, tanto faz). Essa linha estende a verificação de commit para **quando você commita pela mão** — pelo terminal comum ou pelo painel de Source Control do VS Code. Sem ela, um commit feito fora do Claude Code passa sem conferência.

Hooks do git não vêm no clone (eles moram em `.git/`, que não é versionado), por isso o comando é manual. É a única configuração do projeto. Se esquecer, o Claude Code avisa no início da sessão.

## Como abrir para testar

Não há build nem instalação. Abra o `index.html` no navegador.

Servindo por HTTP (recomendado — evita o aviso de fonte que o `file://` gera no console):

```bash
npx serve .
```

## Estrutura

```
index.html        a landing inteira (CSS e JS embutidos)
produtos/         8 páginas de produto + template.html (base para páginas novas)
css/              modo apresentação, transição de página e tokens
js/               modo apresentação, transição entre páginas, autoplay de vídeo por visibilidade
assets/           imagens, vídeos e fontes
.claude/          o pipeline de trabalho (agentes, verificações, comandos)
```

## Duas regras que valem para todos

1. **Valide no navegador antes de publicar.** Em três tamanhos: 1920×946, 1536×750 com escala de 125% do Windows, e 390×844 no celular. Neste projeto **altura é o que aperta**, não largura.
2. **Nada de terceiros.** Sem CDN, fonte externa, imagem de banco ou script de análise. As fontes são locais e as imagens são autorais.

## Verificação rápida

```bash
node .claude/scripts/revisar.js
```

Confere os padrões do projeto e aponta o que costuma quebrar aqui. Cada regra existe porque o problema aconteceu de verdade.

## Publicação — Netlify

O site é publicado pelo **Netlify**, ligado direto a este repositório do GitHub. Não há build: o `netlify.toml` publica a raiz do jeito que ela está, que é como o site já roda no disco.

**Todo push na `main` republica sozinho.** Não existe script de deploy, não existe passo manual, e não é preciso avisar ninguém. É a única mecânica de publicação deste repositório.

Uma branch qualquer (ou uma PR) gera um **deploy de pré-visualização** com URL própria, sem tocar no site publicado. É onde a validação no navegador acontece antes de a `main` mudar — o que mantém a regra do projeto de validar antes de publicar, só que com um endereço que dá para abrir no celular e mandar para outra pessoa.

O `netlify.toml` guarda três decisões que valem uma linha cada:

- **`/.claude/*`, `/.github/*` e `/.githooks/*` devolvem 404.** O repositório é privado, mas o site é público: sem isso, `/.claude/CLAUDE.md` entregaria as instruções e os mapas internos a quem digitasse o endereço.
- **`assets/` tem cache de 1 dia, não de 1 ano.** Neste projeto arte trocada é arte **sobrescrita com o mesmo nome** — cache eterno faria a versão antiga continuar aparecendo depois do deploy.
- **`js/` e `css/` revalidam sempre.** HTML novo com JS velho não dá erro: só faz a apresentação parar no lugar errado.
