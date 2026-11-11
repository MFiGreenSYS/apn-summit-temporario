/* ============================================================================
   GALERIA DO ECOSSISTEMA — um pop-up de fotos por conexão
   ----------------------------------------------------------------------------
   Pedido do dono (2026-08-10): "coloca esse pop up da imagem [a galeria das
   graduações] e replica ela para o ecossistema. Cada ecossistema terá o seu
   pop up... você clica na seta da apresentação, abre o pop up e vai passando as
   imagens; chega na última e ela volta, e com outro clique a gente passa para a
   Conexão Green, e assim sucessivamente. Cada um terá cerca de vinte imagens."

   Ou seja: a MESMA mecânica das graduações, só que a lista é de conexões em vez
   de qualificações. E é de propósito que o desenho seja o mesmo — o pop-up das
   graduações já existe, já foi ajustado com o dono e já tem responsivo resolvido.

   ============================================================================
   O QUE ESTE ARQUIVO NÃO REPETE
   ----------------------------------------------------------------------------
   Quase nada aqui é dado novo. O nome, a etiqueta e a descrição de cada conexão
   são LIDOS DO PRÓPRIO CARTÃO no `index.html`, e o `slug` sai do `data-pt-href`
   dele (`produtos/conexaolivre.html` -> `livre`). Isso é decisão consciente: a
   armadilha número um desta base é o mesmo dado escrito em dois lugares e os
   dois discordando com o tempo (já aconteceu com número de texto x `data-target`,
   e com `data-i` x `data-lvl` na galeria das graduações). Se o dono renomear uma
   conexão no cartão, o pop-up acompanha sem ninguém lembrar deste arquivo.

   A ÚNICA coisa declarada à mão é QUANTAS FOTOS cada conexão tem, no `QTD` logo
   abaixo — porque o navegador não consegue listar uma pasta. Enquanto o número
   for 0, aquela conexão simplesmente não tem pop-up e a apresentação não cria
   parada para ela. É o mesmo critério do `GRAD_GAL_LEVELS`: parada que não faz
   nada é pior que parada nenhuma, porque quem apresenta clica e não entende.

   ============================================================================
   UMA IMAGEM POR VEZ (ajuste do dono, 2026-08-10)
   ----------------------------------------------------------------------------
   "deve ser 1 imagem por vez para exibição" e "a última imagem do popup volta
   para o ecossistema para manter a linha cronológica".
   A primeira versão mostrava 8 fotos por página, como a galeria das graduações.
   Isso mudou porque o que chegou não é foto de evento: são SLIDES de apresentação
   (720x405, 16:9, exportados de um deck de 100 slides). Slide tem texto — oito
   deles lado a lado, cada um com 189px de largura, seria ilegível.
   Por isso o pop-up virou um VISOR: um slide ocupando o painel, e o `object-fit`
   é **contain** e nunca cover. Cortar um slide é cortar texto.

   ============================================================================
   ONDE AS FOTOS FICAM
   ----------------------------------------------------------------------------
       assets/img/ecossistema/<slug>/Slide<n>.jpeg

   Os sete slugs são: livre, green, placas, solar, telecom, seguros, expansao.

   ⚠ OS NOMES SÃO OS DO DECK, e isso é de propósito. O dono exportou os slides do
   PowerPoint e distribuiu nas sete pastas. Estado em 2026-08-13:

       placas    (vazia)     0        solar     (vazia)     0
       livre     (vazia)     0        expansao  (vazia)     0
       green     (vazia)     0  + VIDEO
       telecom   (vazia)     0        <- e sem video: este cartao nao abre nada
       seguros   (vazia)     0  + VIDEO                          = 0 slides exibidos

   ⚠ 0 SLIDES EXIBIDOS, 59 NO DISCO — e as duas contagens estão certas. Em 2026-09-09 o dono
   esvaziou as três últimas ("Tabela 02 c green - tirar / Telecom nada / Seguros somente o
   video"); as outras quatro já estavam vazias desde 13/08. Lista vazia é a forma de desligar
   o pop-up sem criar parada morta na apresentação. Nenhum arquivo foi apagado e as listas
   antigas estão guardadas nos comentários do `FOTOS` para recolar. Então: contando arquivo dá
   59, contando o que o site mostra dá 0. Não é lista velha.

   ⚠ E "SEM SLIDE" NÃO É MAIS "SEM POP-UP": Green e Seguros têm VÍDEO, e continuam abrindo —
   com uma página só, a capa do vídeo. Ver o bloco SÓ O VÍDEO no `FOTOS`.

   ⚠ `Slide1S` EXISTE EM DUAS PASTAS (solar e seguros) COM CONTEÚDOS DIFERENTES. Não é
   engano: o caminho inclui o slug da conexão, então `solar/Slide1S` e `seguros/Slide1S`
   nunca se confundem. Mas quem for procurar "Slide1S" no projeto vai achar dois.
   ⚠ `Slideulitmo` está com o "l" e o "t" trocados. É o nome que o dono deu ao arquivo e
   fica assim — regra do projeto: o código se ajusta ao arquivo, não o contrário. Renomear
   para "Slideultimo" quebraria a lista sem avisar. Renomear
   para 1..N deixaria o código mais bonito e quebraria a única coisa que importa
   aqui: **a ordem é a do deck, e é ela que o dono chama de "linha cronológica"**.
   Mantendo o nome original, ele reexporta o deck e sobrescreve os arquivos sem
   nada mais mudar. As listas estão declaradas no `FOTOS` abaixo — é o único lugar
   a atualizar quando entrar ou sair slide.

   ⚠ SÓ .jpeg por enquanto, e isso é proteção, não preguiça. A galeria das
   graduações usa <picture> com avif + webp + jpg, e ali funciona porque os três
   existem para toda foto. Um <source> que aponta para arquivo inexistente NÃO
   cai para o <img> de baixo: o navegador já escolheu aquele source e a foto
   simplesmente não aparece. Conversão depois, nunca antes.
   ============================================================================ */
(function(){
  "use strict";

  /* ---------------------------------------------------------------------------
     QUAIS SLIDES SÃO DE CADA CONEXÃO — é aqui que se mexe quando entra imagem
     ---------------------------------------------------------------------------
     ⚠ REESCRITO EM 2026-08-12, DE CIMA A BAIXO — A SEGUNDA VEZ. O dono trocou o deck
     inteiro no disco: *"dentro da pasta ecossistema das img atualizei as imagens"*. Saíram
     os 27 arquivos que estavam aqui, entraram 59 com nomes NOVOS. Nenhum nome da lista
     anterior sobreviveu (o único que coincidia, `green/Slide40`, virou outra imagem —
     era a capa do TOP 3 e agora é "KWH E GREEN POINTS DOBRADO"). Ou seja: a lista velha
     não ficou "desatualizada", ficou apontando para 27 arquivos INEXISTENTES, e o pop-up
     das sete conexões abriria preto.

     O QUE O DECK É AGORA — e isto é a mudança de fundo: não são mais fotos de gente.
     Antes cada conexão era 1 capa ("DESTAQUES CONEXÃO X") + os destaques com nome, cidade
     e números de licenciados. Agora são os SLIDES DE CAMPANHA de agosto/2026: Status PRO,
     bônus, tabelas de comissão, promoções, licenças, etapas. Quem mexer aqui esperando
     encontrar "capa + destaques" não vai encontrar — e não é defeito.

     ⚠ A ORDEM **NÃO** É MAIS A NUMÉRICA, e esta é a TERCEIRA vez que essa regra vira do
     avesso neste arquivo. Vale registrar as três, porque cada uma estava certa para o
     deck dela e quem ler só a última vai deduzir errado na próxima:
       · deck de 10/08: ordem numérica ERRAVA (a capa do Green se chamava "SlideTop1", a da
         Livre "Slide 1_Livre", e a Expansão descia de 50 para 11 licenciados);
       · deck de 12/08 de manhã: ordem numérica ACERTAVA nas sete (Slide80/81/82/83 são
         literalmente "1ª Etapa" a "4ª Etapa");
       · deck de 12/08 à noite: **quebrou de novo**. Chegaram sete arquivos cujos nomes não
         entram na sequência — seis `Slide1X` (um por conexão, menos expansão) e um
         `Slideulitmo`. Por ordem de texto, "Slide1P" cairia entre "Slide18" e "Slide22", e
         "Slideulitmo" iria para o fim ou para o começo dependendo do critério.

     ONDE ELES ENTRAM, conferido ABRINDO os sete: os seis `Slide1X` são a MESMA família —
     "Como Funciona" / "Formas de Ganhos" / "Recorrência licenciado", com os percentuais
     GP/GI/RO/EQ daquela conexão. São ABERTURAS: explicam como se ganha antes de a conexão
     mostrar as campanhas do mês. Por isso vão em PRIMEIRO.
     ⚠ O `Slideulitmo` ("Cashback Telecom") ENTROU COMO ÚLTIMO E DEPOIS MUDOU DE LUGAR, no
     mesmo dia. O dono pediu *"e o ultimo adicione é Slideulitmo.jpeg"* — e foi só para esse
     que ele marcou posição, o que confirmou que os outros seis eram o primeiro. Horas
     depois ele corrigiu, com dois prints: *"a imagem 1 deve estar antes da imagem 2, e nao
     a sendo a ultima"*. Hoje ele fecha o bloco BRASIL (depois do Slide52) e vem ANTES do
     Slide53, que é onde a conexão vira EUA. Ver o comentário do `telecom` no FOTOS.

     A lição que sobrevive às três viradas: **ordem se confere abrindo, nunca pelo nome.**
     Se o dono mandar mais arquivos, abra de novo — não confie nesta lista como regra.

     TODAS as sete continuam em LISTA EXPLÍCITA (`arquivos`), e agora há um motivo NOVO e
     concreto para não voltar a faixa `de`/`ate`: o deck TEM BURACOS. Falta o 36 em Green e
     o 61 em Seguros (o dono tirou esses dois slides). Uma faixa 35-44 pediria o 36, que
     não existe, e o resultado seria um passo preto no meio da apresentação — a rede de
     segurança do `desenha()` pularia adiante avisando no console, mas quem apresenta veria
     o salto. Lista explícita não tem esse risco.

     PARA MEXER: acrescente ou tire o nome (sem extensão) na posição desejada. Contagem,
     contador do rodapé e paradas da apresentação saem daqui. Lista vazia = conexão sem
     pop-up e sem parada.

     ⚠ NOMES COM ESPAÇO CONTINUAM PERMITIDOS, embora neste deck nenhum tenha. Quem cuida é
     o `caminho()`, que codifica o nome antes de virar URL. A proteção fica: no deck de
     2026-08-10 a capa da Livre se chamava "Slide 1_Livre", com espaço, e foi o dono que
     nomeou assim. Não renomeie arquivo do dono para caber no código — é o código que se
     ajusta.
     --------------------------------------------------------------------------- */
  var FOTOS = {
    /* 6 slides. Abre no `Slide1P` ("Formas De Ganhos", os percentuais da Placas), depois
       Status PRO (13), a venda via Closer (14), e as ofertas: cliente (16), licenciado (17)
       e o drone (18).
       ⚠ SAÍRAM TRÊS por pedido do dono, com os prints em anexo: o Slide15 (a capa
       "PROMOÇÕES CONEXÃO PLACAS"), o Slide19 ("BATERIAS — a próxima fronteira") e o
       Slide20 ("Integração: Solar + Bateria + Cliente"). Ou seja, a conexão perdeu a capa
       de propósito e agora ABRE no Status PRO — não é capa faltando. */
    placas:   { arquivos:[] },     /* VAZIA em 2026-08-13 — ver o bloco QUATRO VAZIAS logo abaixo */
    solar:    { arquivos:[] },     /* VAZIA em 2026-08-13 — ver o bloco QUATRO VAZIAS logo abaixo */
    livre:    { arquivos:[] },     /* VAZIA em 2026-08-13 — ver o bloco QUATRO VAZIAS logo abaixo */
    /* ⚠ ZERO SLIDES DESDE 2026-09-09 — SÓ O VÍDEO (ver o bloco logo depois do FOTOS).
       A história abaixo é de 13/08, quando esta conexão ficou com UM slide, e fica
       registrada porque explica de onde vieram os arquivos e por que eles não foram
       apagados. Não é o estado atual.
       ⚠ 1 SLIDE, e isso é decisão do dono, não sobra de lista (2026-08-13). Pedido, com os
       três prints em anexo: *"as telas green, telecom, seguros. devem ter somente essas, as
       demais, dos ecossistema permanecem do jeito que esta"* — uma imagem por conexão, e
       cada uma era o "Bônus Extra" daquela conexão.
       O `green` tinha 10 e ficou só com o `Slide39` ("Bônus Extra — TABELA CLIENTES Conexão
       Green | Agosto 2026", a tabela de 4% a 60% por faixa de clientes).
       CORROBORAÇÃO de que a leitura está certa, porque a frase admitia o contrário ("tire
       essas três"): as TRÊS conexões que ele nomeou são exatamente as três MAIORES do deck
       (green 10, telecom 13, seguros 13 = 36 dos 59 slides) e as quatro que ele mandou
       deixar como estavam são exatamente as quatro MENORES (solar 4, placas 6, livre 6,
       expansão 7). Cortar as maiores e preservar as menores é o que faz uma apresentação ao
       vivo caber no tempo; a leitura invertida cortaria justo o slide de campanha do mês.
       ⚠ OS 9 ARQUIVOS CONTINUAM NO DISCO E NO GIT, de propósito e ao contrário do que foi
       feito nos cortes anteriores (placas Slide15/19/20 e seguros Slide72-75 foram apagados
       em 57dff13). Aqui não: a lista é a única coisa que faz o navegador buscar a imagem, e
       arquivo não listado não custa byte nenhum ao visitante. Enquanto o dono não confirmar
       no navegador, apagar 33 arquivos seria transformar uma leitura de frase em perda de
       ativo. Confirmado, apaga-se num comando. Slide36 continua não existindo. */
    green:    { arquivos:["Cashback-Green-Novembro", "Promo-BonusExtraGarantido-Novembro"] },  /* 2026-11-10, DEPOIS do vídeo — ver o bloco NOVEMBRO, OS CASHBACKS */
    /* ⚠ ZERO SLIDES DESDE 2026-09-09 — E AQUI NEM VÍDEO: *"Telecom nada"*. O cartão
       continua na seção, visível e com a página de produto ligada no `data-pt-href`; o que
       ele perdeu foi o pop-up. Clicar nele agora não faz nada — igual a Livre, Placas, Solar
       e Expansão, porque a TRAVA do page-transition ("nem no modo apresentação nem fora dele
       o site abre as 7 páginas de produto") já barrava a navegação. Não é defeito novo.
       Histórico de 13/08 abaixo, que não é o estado atual.
       ⚠ 1 SLIDE (2026-08-13), pelo mesmo pedido do `green` acima — leia o comentário de lá,
       que é onde a decisão está registrada por inteiro.
       Ficou o `Slide52` ("Promoção Bônus Extra — CADA NÍVEL DESBLOQUEIA MAIS BÔNUS | CONEXÃO
       TELECOM", de 50% a 300% por faixa de portabilidades), que era a posição 07/13.
       ⚠ ESTA CONEXÃO PERDEU DOIS AJUSTES FINOS FEITOS NO MESMO DIA, e vale saber para não
       "consertar" o que não está quebrado: os três blocos (abertura / Telecom BRASIL /
       iGreen Mobile-licença USA) e a realocação do `Slideulitmo` ("Cashback Telecom"), que
       em 12/08 saiu do fim para antes do `Slide53` justamente porque é assunto Brasil e o 53
       é onde a conexão vira EUA. Com um slide só não há mais ordem para acertar — mas se o
       dono devolver a lista, esse é o critério, e não a ordem numérica.
       ⚠ Se o `Slideulitmo` voltar: o "l" e o "t" estão trocados no nome do arquivo do dono e
       é assim que fica; renomear quebra a lista sem avisar. */
    telecom:  { arquivos:["Slide22", "Cashback-Telecom-Novembro", "Slide23", "Cashback-Mobile-Novembro", "Slide24"] },  /* 2026-11-10 — ver o bloco NOVEMBRO, OS CASHBACKS */
    /* ⚠ ZERO SLIDES DESDE 2026-09-09 — SÓ O VÍDEO (ver o bloco logo depois do FOTOS).
       Histórico de 13/08 abaixo, que não é o estado atual.
       ⚠ 1 SLIDE (2026-08-13), pelo mesmo pedido do `green` acima — a decisão está registrada
       por inteiro no comentário de lá.
       Ficou o `Slide71` ("Promoção Bônus Extra — CADA NÍVEL DESBLOQUEIA MAIS BÔNUS | CONEXÃO
       SEGUROS", Nível 1 a 4, de 50% a 300%), que era a última da lista (13/13). Ou seja: a
       conexão já fechava nele, e agora ele é o único.
       ⚠ CURIOSIDADE ÚTIL para quem for comparar: este slide e o `telecom/Slide52` são o MESMO
       layout com o texto trocado (Seguros tem a coluna "Nível 1..4" que Telecom não tem, e
       fala de vistoria em vez de fatura). Ver os dois lado a lado e achar que é arquivo
       duplicado é erro fácil — são de conexões diferentes.
       ⚠ Slide61 continua não existindo (o dono tirou lá atrás). O `Slide1S` desta pasta é
       OUTRO arquivo que o `Slide1S` de solar — mesmo nome, pastas diferentes; se um dia a
       lista voltar, isso continua valendo. */
    /* ⚠ A ORDEM AQUI E A ORDEM NA TELA. `SlideSeguros` entra DEPOIS do `Slide71` porque o
       dono pediu "logo depois do slide dos 300%" — e o Slide71 E o slide dos 300% desta
       conexao (conferido abrindo a imagem, nao deduzido pelo numero do arquivo). */
    seguros:  { arquivos:["Cashback-Seguros-Novembro", "Slide31", "Slide32"] },  /* 2026-11-10, DEPOIS do vídeo — ver o bloco NOVEMBRO, OS CASHBACKS */
    /* `silide4.jpg` é o nome do dono (com o "i" a mais e em .jpg): fica assim, e por isso vai com a
       extensão — ver o `caminho()`. */
    /* 2026-10-23 (o cartão voltou ao ecossistema): *"vai aparecer a foto do eletroposto com o Thiago, o Vídeo da
       Sol da promoção e os 3 eletropostos mockup. Retire todos os outros slides"*. Saiu o `silide4.jpg` (a live), e o
       vídeo passa para o MEIO — ver o CAPA_NA_PAGINA logo depois do VIDEO_DA_CONEXAO. */
    /* 2026-10-24: os 3 eletropostos passaram a ter o NOME no lugar de "Carga Rápida / Carga Rápida / Carga Ultra
       Rápida" (*"coloque o nome deles ... Mob, Mob Fast, Mob Ultra Fast"*). Arte nova com nome novo
       (`Slide3-nomes.jpeg`), e não sobrescrita: nome novo é URL nova, sem esperar o cache de um dia. O texto foi
       reescrito em Montserrat Bold 36px, a mesma da arte ("Carga Ultra Rápida" mede 352px na arte e 355px na
       fonte), no mesmo centro e na mesma linha; o fundo desfocado atrás foi refeito por interpolação. O
       `Slide3.jpeg` original fica (os recortes dos carregadores nos Planos saem dele). */
    mob:      { arquivos:["Slide2", "Slide3-nomes"] },
    expansao: { arquivos:[] }      /* VAZIA em 2026-08-13 — ver o bloco QUATRO VAZIAS logo abaixo */
  };

  /* ============================================================================
     NOVEMBRO, OS CASHBACKS — o estado de 2026-11-10 (vale hoje)
     ----------------------------------------------------------------------------
     Pedido do dono, com prints do WhatsApp: *"Colocar na Green: Cashback Green e Bônus Extra
     Garantido. Colocar Telecom: Cashback Telecom e Cashback Mobile. Colocar no seguro: Cashback
     Seguros"* — para a APN padrão, o Summit e o Grand Show. Foi só ACRESCENTAR: nada saiu.

         green    VÍDEO do Márcio · Cashback-Green-Novembro · Promo-BonusExtraGarantido-Novembro
         telecom  Slide22 (Bônus Extra Telecom) · Cashback-Telecom-Novembro · Slide23 (Uma Marca
                  Brasileira, BR/EUA) · Cashback-Mobile-Novembro · Slide24 (Bônus Extra Mobile)
         seguros  VÍDEO · Cashback-Seguros-Novembro · Slide31 (Bônus Extra Seguros) · Slide32 (elétricos
                  e híbridos)

     A posição segue a ordem da Newsletter de Novembro (Telecom 57 → 58 → 62 → 64 → 65; Seguros: o
     Cashback, 71, vem antes do Bônus Extra, 80) e, no Green, a mesma ordem já publicada no Grand Show
     (Cashback antes do Bônus Extra Garantido). As 5 artes são os MESMOS arquivos do Grand Show (mesmo
     md5), exportadas do PPTX da Newsletter — não reexporte nesta máquina, o PowerPoint troca Montserrat
     Bold por Bold Italic em alguns slides.
     ⚠ O GREEN DEIXA DE SER "SÓ O VÍDEO": com arquivos na lista a capa do vídeo continua na página 0
     (o Green não está no CAPA_NA_PAGINA) e os slides começam na 1 — o mesmo caminho que o Seguros usa
     desde 13/08. Não precisou mexer em função nenhuma.
     ⚠ O Slide24 (Bônus Extra Mobile) e o Slide31 (Bônus Extra Seguros) ainda dizem "| Outubro" dentro da
     imagem. Ficaram porque o pedido foi só acrescentar.
     ============================================================================ */

  /* ============================================================================
     OUTUBRO, AS PROMOÇÕES VOLTAM — o estado de 2026-10-14 (HISTÓRICO desde 10/11)
     ----------------------------------------------------------------------------
     Pedido que o dono repassou (mensagens da diretoria, com os prints):
       · *"Coloque na telecom esses 3 slides"*
       · Seguros: *"coloque esses dois logo depois do vídeo do gusttavo lima"*
       · *"E no do Eletroposto, coloque o vídeo da Sol, depois a foto do thiago no eletroposto,
         as 3 opções e o slide da live"*

         telecom  Slide22 (Bônus Extra Telecom) · Slide23 (iGreen Mobile, BR/EUA) · Slide24 (Bônus
                  Extra Mobile | Outubro)                                    — sem vídeo
         seguros  VÍDEO · Slide31 (Bônus Extra Seguros | Outubro) · Slide32 (É oficial: elétricos
                  e híbridos)
         mob      VÍDEO da Sol · Slide2 (o Thiago no eletroposto) · Slide3 (as 3 opções, 7/40/80)
                  · silide4.jpg (a live de lançamento, 20/10 20h00)

     A ordem foi conferida ABRINDO cada imagem contra os prints, não pelo número do arquivo.
     ⚠ O MOB NÃO TINHA GALERIA ATÉ AQUI, e o motivo era o `slugDe`: ele lia o slug só do
     `data-pt-href`, e o cartão do Mob não tem página de produto (CTA-DESATIVADO). Agora o
     `data-slug` explícito vem primeiro — a mesma solução do Grand Show, que já tem galeria no Mob.
     ⚠ O vídeo da Sol chegou em 4K, 136MB, dentro de `ecossistema/mob/`. O servido é
     `assets/video/video-conexao-mob.mp4` (1080p, CRF 23, 13,6MB); o master fica no disco e fora
     do git (`.gitignore`), e a capa `mob/capa-video.jpg` é o quadro dos 5s.
     ⚠ Os `telecom/Slide1.jpg` e `seguros/Slide1.jpeg` (as promoções de setembro) foram apagados
     da pasta por quem trouxe os novos — e saem do git junto. Nenhuma lista os citava.
     ============================================================================ */

  /* ============================================================================
     SÓ OS VÍDEOS — o estado de 2026-10-08, no Summit de outubro (HISTÓRICO desde 14/10)
     ----------------------------------------------------------------------------
     Pedido do dono: *"tira as promoções, do telecom o slide e do seguros tambem deixando somente o
     video"*.

         livre    (vazia)      placas  (vazia)      solar   (vazia)     expansao (vazia)
         green    (vazia)      + VÍDEO do Márcio Garcia
         telecom  (vazia)      SEM vídeo  → o cartão amplia e o clique no ampliado só fecha
         seguros  (vazia)      + VÍDEO da BP Seguradora

     As duas artes que saíram eram as PROMOÇÕES de setembro ("Promoção Bônus Extra · TELECOM |
     Setembro" e "· SEGUROS | Setembro"), e o mês já era outubro. Com isto as sete listas ficam
     iguais às da APN Digital, que está assim desde 09/09.
     Sem slide, o `paginasDe` do Seguros devolve 1 (só a capa) e a apresentação fica: cartão →
     cartão ampliado → capa (com play) → vídeo → fechar. O Telecom, sem slide e sem vídeo, deixa
     de ter galeria: na apresentação fica cartão → cartão ampliado, e segue para a próxima.
     ⚠ Os arquivos (`telecom/Slide1.jpg`, `seguros/Slide1.jpeg`) CONTINUAM NA PASTA: fora da lista
     ninguém baixa, e devolver é uma linha. Se voltarem, confira o MÊS dentro da arte antes.
     ============================================================================ */

  /* ============================================================================
     GREEN SÓ COM O VÍDEO DO MÁRCIO — o estado de 2026-10-01 (histórico: em 08/10 Telecom e Seguros
     foram pelo mesmo caminho — ver o bloco SÓ OS VÍDEOS, logo acima)
     ----------------------------------------------------------------------------
     Pedido do dono, com print da página 02/02 do pop-up do Green — a tabela "Bônus Extra ·
     TABELA CLIENTES Conexão Green | Setembro 2026": *"tire essa é somente o video do marcio"*.

         livre    (vazia)      placas  (vazia)      solar   (vazia)     expansao (vazia)
         green    (vazia)      + VÍDEO do Márcio Garcia (assets/video/video-conexao-green.mp4)
         telecom  Slide1.jpg               (sem mudança)
         seguros  Slide1       + VÍDEO     (sem mudança)

     ⚠ É A TERCEIRA VEZ QUE ESTA TABELA MUDA, e a ordem importa para quem vier depois:
         09/09  saiu    "Tabela 02 c green - tirar"            (era a de AGOSTO, Slide39)
         10/09  voltou  "adiciona o slide 2.jpeg apos o video" (a mesma, reexportada SETEMBRO)
         01/10  saiu    este bloco — a arte ainda dizia "Setembro 2026" e já era outubro.
     Se ela voltar com o mês de outubro, é recolar "Slide2" na lista acima. Mas confira o mês
     DENTRO DA IMAGEM antes: foi o mês errado na arte que já fez esta tabela ir e voltar.

     Sequência na apresentação: cartão → card em grande → capa (com play) → vídeo → fechar.
     Sem slide, o `paginasDe` devolve 1 (só a capa): é o caminho "só o vídeo" criado em 09/09
     para o Seguros, e continua valendo. Não precisou mexer em função nenhuma.

     ⚠ `Slide2.jpeg` CONTINUA NA PASTA, de propósito, pelo motivo de sempre: fora da lista
     ninguém baixa o arquivo, e devolver é uma linha.
     ============================================================================ */

  /* ============================================================================
     DE VOLTA COM A ARTE DE SETEMBRO — o estado de 2026-09-10 (o GREEN saiu de novo em 01/10)
     ----------------------------------------------------------------------------
     Pedido do dono, item por item: *"Na conexão green, adiciona o slide 2.jpeg apos o video.
     na telecom adicione Slide1.jpg. no seguros adicione Slide1.jpeg apos o video"*.

         livre    (vazia)      placas  (vazia)      solar   (vazia)     expansao (vazia)
         green    Slide2       + VÍDEO      "Bônus Extra · TABELA CLIENTES | Setembro 2026"
         telecom  Slide1.jpg               "Promoção Bônus Extra · TELECOM | Setembro"
         seguros  Slide1       + VÍDEO     "Promoção Bônus Extra · SEGUROS | Setembro"

     Conferido ABRINDO as três, não deduzido do nome. São as MESMAS artes que saíram em
     09/09, reexportadas com o mês certo: a do Green é a tabela que ele mandou tirar naquele
     dia ("Tabela 02 c green - tirar") e que dizia **Agosto 2026** — agora diz Setembro.
     Ou seja, o corte de ontem não era da tabela, era do mês errado nela.

     ⚠ "APÓS O VÍDEO" JÁ É O COMPORTAMENTO, não precisou de nada: nesta galeria a página 0 é
     a CAPA do vídeo e os slides começam na 1, e o `buildStops` põe a parada do vídeo logo
     depois da capa. A sequência na apresentação fica: cartão → capa (com play) → vídeo →
     slide → um passo só para fechar. A Telecom não tem vídeo, então são cartão → slide →
     fechar.

     ⚠ TELECOM É `.jpg` E AS OUTRAS DUAS SÃO `.jpeg`. Por isso o nome dela vai INTEIRO na
     lista — ver o comentário no `caminho()`, que é onde a exceção é tratada.
     ============================================================================ */

  /* ============================================================================
     SÓ O VÍDEO — o estado de 2026-09-09 (histórico; foi revertido em 10/09)
     ----------------------------------------------------------------------------
     Pedido do dono, três linhas:

         Tabela 02 c green - tirar
         Telecom nada
         Seguros somente o video

     Resultado: as SETE listas estão vazias. Green e Seguros continuam com o pop-up, porque
     têm VÍDEO; Telecom não tem vídeo, então o cartão dele deixou de abrir qualquer coisa.

     ⚠ COMO EU LI "TABELA 02", e diga se errei: o pop-up do Green tinha duas páginas — a
     capa do vídeo (01) e o `Slide39` (02), que é uma TABELA ("Bônus Extra — TABELA CLIENTES
     Conexão Green"; conferido abrindo a imagem, não deduzido do nome). "Tabela 02" é essa
     página 02, e sai. O dono já se referiu a slide pelo número do contador antes — em
     13/08: *"tira isso, nao tem player nesse slide 2"*. A leitura alternativa seria a
     SEGUNDA TABELA DENTRO da arte (o slide tem duas), e essa eu não poderia atender aqui:
     exigiria reexportar a imagem. Se era essa, o que falta é o arquivo novo.

     ⚠ SEM ESTE DETALHE O PEDIDO VIRARIA O CONTRÁRIO DELE MESMO: até hoje, lista vazia
     desligava o pop-up INTEIRO — inclusive a capa do vídeo e as paradas da apresentação.
     "Seguros somente o vídeo" com a regra antiga tiraria também o vídeo. Por isso o
     `temGaleria` e o `paginasDe` mudaram: conexão com vídeo e sem slide vale UMA página, a
     capa. Ver o comentário nas duas funções.

     ⚠ OS ARQUIVOS CONTINUAM NO DISCO E NO GIT (agora são 59 no disco, 0 exibidos). Mesmo
     motivo de sempre: arquivo fora da lista não é baixado por ninguém, e devolver uma
     conexão é recolar a lista guardada aqui. As que saíram agora:

         green     Slide39
         telecom   Slide52
         seguros   Slide71, SlideSeguros

     ⚠ E VALE SABER: os três slides que saíram diziam "Agosto 2026" na arte. Se voltarem,
     voltam com o mês velho — o dono já pediu "Setembro 2026" no resto do site (09/09).
     ============================================================================ */

  /* ============================================================================
     QUATRO VAZIAS, TRÊS COM UM SLIDE — o estado de 2026-08-13 (histórico)
     ----------------------------------------------------------------------------
     Segundo pedido do dono no mesmo dia, e agora item por item, sem margem para leitura:

         Livre: retirar todos          Green: mantem somente 1
         Placas: retirar todos         Telecom: mantem somente 1
         Solar: retirar todos          Seguros: mantem somente 1
         Expansão: retirar todos

     ⚠ ISTO CONFIRMOU A LEITURA DA MENSAGEM ANTERIOR, e vale registrar porque eu tinha
     decidido no escuro. A frase de antes era *"as telas green, telecom, seguros devem ter
     somente essas"*, que também podia significar "tire essas três". Eu li como "fique só com
     estas" e argumentei pela aritmética do deck (as três nomeadas eram as três MAIORES).
     A lista acima diz "mantem somente 1" para as mesmas três — a leitura estava certa. O
     método (decidir pela conta, não pela gramática) fica valendo; o palpite não.

     O QUE LISTA VAZIA FAZ, e é por isso que ela é a forma certa de "retirar todos":
     `qtd` vira 0 -> `temGaleria()` devolve false -> o cartão não abre pop-up e a apresentação
     NÃO cria parada para aquela conexão. Nada de parada que abre nada, que é o pior dos
     mundos para quem apresenta (clica e não entende). Já estava documentado no cabeçalho
     deste arquivo desde o primeiro dia; agora quatro conexões usam.

     ⚠ AS 4 CONEXÕES CONTINUAM NA SEÇÃO, visíveis e clicáveis para navegar para a página de
     produto. O que elas perderam foi o pop-up de slides. Quem for investigar "o cartão da
     Livre não abre nada" tem a resposta aqui — não é defeito.

     ⚠ OS 56 ARQUIVOS CONTINUAM NO DISCO E NO GIT (26 exibidos ficaram 3). Mesmo motivo do
     comentário do `green`: arquivo fora da lista não é baixado por ninguém, e devolver uma
     conexão é recolar a lista que está guardada aqui embaixo. Elas eram:

         placas    Slide1P, Slide13, Slide14, Slide16, Slide17, Slide18
         solar     Slide1S, Slide22, Slide23, Slide24
         livre     Slide1L, Slide29, Slide30, Slide31, Slide32, Slide33
         expansao  Slide77, Slide78, Slide79, Slide80, Slide81, Slide82, Slide83

     (`expansao` era a única sem abertura `Slide1X` — a pergunta de 12/08 que nunca foi
     respondida e agora perdeu o objeto.)
     ============================================================================ */

  /* Normaliza as duas formas numa lista de nomes de arquivo (sem extensão), para o resto
     do arquivo não precisar saber qual delas foi usada. */
  function nomesDe(faixa){
    if(!faixa) return [];
    if(faixa.arquivos) return faixa.arquivos.slice();
    if(!faixa.de) return [];
    var out = [];
    for(var n = faixa.de; n <= faixa.ate; n++) out.push(PRE + n);
    return out;
  }

  var BASE = "assets/img/ecossistema/";
  var PRE = "Slide", EXT = ".jpeg";

  /* ============================================================================
     CONEXÕES COM VÍDEO — a capa com play, e o pop-up (2026-08-13)
     ----------------------------------------------------------------------------
     Pedido do dono: *"adicione um popup para esse video ... para dentro do ecossistema com a
     capa e popup de play ja com a funcionalidade do modo apresentacao"*, para a Conexão
     Seguros.

     ⚠ ESTA LISTA É SÓ O ELO. O vídeo em si (arquivo local, ID do YouTube, o pop-up, o
     `igreen:video-fim` que faz a apresentação seguir) mora no `js/video-reconhecimento.js`,
     que atendia só as graduações e passou a aceitar chave de TEXTO por causa deste pedido.
     Repetir aqui o ID do YouTube ou o caminho do arquivo criaria o mesmo dado em dois lugares
     — a armadilha nº 1 desta base. Aqui só se declara "esta conexão tem vídeo, e o nome dele
     lá é este".

     PARA ACRESCENTAR OUTRA CONEXÃO: ponha a entrada no `NIVEIS` do video-reconhecimento.js e
     o slug aqui. Nada mais — a capa, a parada da apresentação e o pop-up saem daqui.
     ============================================================================ */
  var VIDEO_DA_CONEXAO = { seguros: "seguros", green: "green", mob: "mob" };
  /* ⚠ EM QUE PÁGINA FICA A CAPA DO VÍDEO (2026-10-23). Até aqui era SEMPRE a 0 — o vídeo abria a galeria
     (pedido de 13/08 para o Seguros, e o Green seguiu). No Mob o dono pediu a ordem foto do Thiago → vídeo da
     Sol → os 3 eletropostos, perguntado e confirmado: a capa vai para a página 1. Quem não está aqui continua
     na 0. O `ehCapa`, o `slideDaPagina` e as paradas da apresentação (`capaPagina` na API) leem daqui. */
  var CAPA_NA_PAGINA = { mob: 1 };
  /* ============================================================================
     A SIMULAÇÃO DO ELETROPOSTO COMO ÚLTIMA PÁGINA DO MOB (2026-10-24)
     ----------------------------------------------------------------------------
     Pedido do dono: *"se você conseguir colocar a simulação do site https://igreenmob.com.br/simulacao lá na
     parte do MOB, no card dele, depois dos slides ... se não conseguir, coloque 'Faça uma simulação do
     Eletroposto' e coloque um botão pra ir para o igreenmob.com.br"*.
     DEU PARA COLOCAR, e foi medido antes: a resposta de igreenmob.com.br/simulacao NÃO tem X-Frame-Options nem
     Content-Security-Policy (2026-10-24), e o apnsummit no ar também não tem `frame-src` — então a página
     dele abre DENTRO do pop-up, num <iframe>. É a simulação de verdade, a mesma do site: nenhuma regra de
     cálculo foi copiada para cá (copiar seria um segundo lugar para a conta ficar desatualizada).
     ⚠ O PLANO B DO DONO FICA SEMPRE À MOSTRA: a faixa de cima com "Faça uma simulação do Eletroposto" e o
     botão para o site. E ele vira a página inteira quando: (a) não há internet — apresentar offline é
     requisito deste projeto, e um iframe sem rede mostraria a página de erro do navegador; (b) a tela é de
     celular (≤700px), onde um simulador longo espremido num quadro 16:9 de 360px não se usa; (c) o site
     passar um dia a recusar ser embutido — aí o iframe fica em branco, mas o botão continua na faixa.
     ⚠ TECLADO NA APRESENTAÇÃO: quem clica DENTRO da simulação leva o foco para o iframe, e aí as teclas do
     passador de slide vão para o site de lá, não para a apresentação. Por isso, ao sair o mouse de cima do
     iframe e a cada troca de página, o foco volta para esta página (`devolveFoco`).
     ============================================================================ */
  var PAGINA_WEB = {
    mob: { url: "https://igreenmob.com.br/simulacao", titulo: "Faça uma simulação do Eletroposto",
           botao: "Abrir no igreenmob.com.br", site: "igreenmob.com.br" }
  };
  function webDe(i){ var c = conexao(i); return (c && PAGINA_WEB[c.slug]) || null; }
  /* a página web é sempre a ÚLTIMA da conexão */
  function ehWeb(i, pagina){ return !!webDe(i) && pagina === paginasDe(i) - 1; }
  function capaPagina(i){
    var c = conexao(i); if (!c || !temVideo(i)) return -1;
    var p = CAPA_NA_PAGINA[c.slug] || 0;
    return Math.min(p, paginasDe(i) - 1);
  }

  function chaveDeVideo(i){
    var c = conexao(i);
    if (!c || !c.slug) return null;
    var k = VIDEO_DA_CONEXAO[c.slug];
    if (!k) return null;
    /* ⚠ pergunta à PEÇA DO VÍDEO se ela conhece a chave, em vez de confiar nesta lista.
       Se alguém tirar a entrada de lá e esquecer aqui, o play não aparece — em vez de
       aparecer e não fazer nada, que é pior para quem está apresentando. */
    var V = window.IGREEN_REC_VIDEO;
    return (V && V.temVideo && V.temVideo(k)) ? k : null;
  }
  function temVideo(i){ return !!chaveDeVideo(i); }
  function abrirVideoDaConexao(){
    var k = chaveDeVideo(atual);
    if (!k) return false;
    var V = window.IGREEN_REC_VIDEO;
    if (!V) return false;
    try { return !!V.abrir(k); } catch(e){ return false; }
  }

  /* ============================================================================
     ⚠ VERSAO DAS ARTES — SUBA ESTE NUMERO SEMPRE QUE UMA IMAGEM FOR SOBRESCRITA
     ----------------------------------------------------------------------------
     Isto existe por causa de um defeito real, relatado pelo dono em 2026-08-12 com um
     print: a galeria da Conexao Green mostrava, na posicao 06/10, o slide "TOP 3 CONEXAO
     GREEN — Performance". Esse slide NAO EXISTE MAIS — e o `green/Slide40` do deck ANTIGO.

     MEDIDO: o arquivo no disco e o do commit tinham o mesmo md5 (`ab75bdcd...`), e o do
     deck antigo, outro (`c4524566...`). Ou seja: o site estava certo e o NAVEGADOR DELE
     estava servindo a copia velha.

     POR QUE ACONTECE, e por que so com algumas: o `netlify.toml` guarda `/assets/*` por
     UM DIA (`max-age=86400`), de proposito — arte deste projeto e SOBRESCRITA com o mesmo
     nome, entao cache eterno seria pior. Mas um dia ja basta para o dono reexportar, subir
     e continuar vendo o antigo. No dia 12/08 QUATRO artes foram sobrescritas mantendo o
     nome: green/Slide40, placas/Slide18, solar/Slide24 e seguros/Slide59. As quatro tinham
     o mesmo problema; ele so notou a do Green porque o conteudo mudou por inteiro.

     ⚠ O ERRO FOI MEU, e vale dizer com todas as letras: o projeto JA tinha esta licao
     escrita — "Arquivo externo que muda de conteudo TEM de mudar de URL" (2026-08-04, no
     mapa das colecoes) — e eu apliquei ela nos ARQUIVOS DE JS naquele mesmo dia, subindo o
     `?v=` de tres deles. Nao apliquei nas IMAGENS. A regra vale para os dois.

     COMO USAR: se voce SOBRESCREVEU uma arte mantendo o nome, suba este numero. Se apenas
     acrescentou ou removeu arquivos com nomes NOVOS, nao precisa (URL nova ja e URL nova).
     Na duvida, suba: o custo e uma requisicao a mais, uma vez.
     ⚠ O `antes-de-commitar.js` avisa quando uma imagem e sobrescrita e este numero nao sobe.
     ============================================================================ */
  var VER = "?v=20260910";

  /* UMA por vez (ajuste do dono, 2026-08-10). A função continua existindo em vez de
     o 1 estar espalhado pelo código: se ele voltar a querer mosaico, muda aqui e o
     resto — contagem de páginas, contador, paradas da apresentação — acompanha. */
  function porPagina(){ return 1; }

  /* A cor é a VERDE DO ECOSSISTEMA nas sete, e não uma cor por conexão.
     Nas graduações cada nível tem a sua (o pin é colorido), mas aqui a seção
     inteira é verde: dar sete cores diferentes faria o pop-up parecer de outra
     parte do site. O `--acc` alimenta borda, brilho e o tint das fotos, que o
     CSS de `.grad-modal` já resolve. */
  var VERDE = "#18FF00", VERDE_RGB = "24,255,0";

  var cartoes = null;      /* lista lida do DOM, na ordem em que os cartões aparecem */
  var modal = null;        /* montado no primeiro uso, não no carregamento da página */
  var atual = -1;          /* índice da conexão aberta, -1 = nenhuma */
  var pagina = 0;
  var smoother = null;
  var travei = false;     /* fui EU que travei o scroll? só quem travou destrava */

  /* ---------------------------------------------------------------------------
     LÊ AS CONEXÕES DO PRÓPRIO HTML
     --------------------------------------------------------------------------- */
  function slugDe(card){
    /* `data-slug` explícito primeiro: é o único jeito do cartão do Mob, que não tem página de
       produto, ter galeria (2026-10-14 — ver o bloco OUTUBRO, AS PROMOÇÕES VOLTAM). */
    var explicito = (card.getAttribute("data-slug") || "").trim().toLowerCase();
    if (explicito) return explicito;
    var href = card.getAttribute("data-pt-href") || "";
    var m = href.match(/conexao([a-z]+)\.html/i);
    return m ? m[1].toLowerCase() : "";
  }

  /* ============================================================
     ⚠ A SEÇÃO DO ECOSSISTEMA TEM DOIS ENDEREÇOS, E ISSO É ARMADILHA
     ------------------------------------------------------------
     No desktop, `#ecossistema2` é um CLONE que o próprio index cria em runtime (o
     baralho de cards encavalados), e o `#ecossistema` original fica escondido só
     como molde. No celular o clone NÃO existe: aquele bloco sai antes por
     `matchMedia('(max-width:1024px)')` e quem está na tela é o original.
     Então procurar só por `#ecossistema2` devolve zero no celular — sem erro
     nenhum, com a galeria simplesmente não existindo naquele aparelho.
     E tem o tempo: o clone depende do GSAP já estar carregado, então na primeira
     leitura ele pode ainda não existir. Foi medido acontecendo: numa carga a lista
     veio com os 7 cartões e na seguinte veio VAZIA. Por isso a lista é lida com
     preguiça e refeita enquanto estiver vazia — array vazio é "truthy" em JS, e
     guardar um vazio no cache deixaria a galeria morta para sempre naquela carga.
     ============================================================ */
  function raizEco(){
    return document.getElementById("ecossistema2") || document.getElementById("ecossistema");
  }

  function leCartoes(){
    var raiz = raizEco();
    if(!raiz) return [];
    var els = raiz.querySelectorAll(".ecard");
    var out = [];
    for(var i=0;i<els.length;i++){
      var c = els[i];
      var h3 = c.querySelector("h3"), p = c.querySelector("p"), tag = c.querySelector(".etag");
      var slug = slugDe(c);
      out.push({
        i: i,
        el: c,
        slug: slug,
        nome: h3 ? h3.textContent.trim() : "",
        /* a etiqueta no HTML vem com os colchetes ("[ Livre ]"); aqui fica só a palavra,
           porque o pop-up desenha os colchetes por conta */
        tag: tag ? tag.textContent.replace(/[\[\]]/g,"").trim() : "",
        desc: p ? p.textContent.trim() : "",
        nomes: nomesDe(slug ? FOTOS[slug] : null),
        qtd: nomesDe(slug ? FOTOS[slug] : null).length
      });
    }
    return out;
  }

  function lista(){ if(!cartoes || !cartoes.length) cartoes = leCartoes(); return cartoes; }

  function conexao(i){ var L = lista(); return (i>=0 && i<L.length) ? L[i] : null; }
  /* ⚠ "TEM POP-UP" NAO E MAIS O MESMO QUE "TEM SLIDE" (2026-09-09). Ate aqui, lista vazia
     desligava o pop-up inteiro — e era o certo enquanto pop-up sem slide fosse pop-up vazio.
     Deixou de ser quando o dono pediu *"Seguros somente o video"*: a conexao passa a ter
     ZERO slides e MESMO ASSIM tem o que mostrar. Com a regra antiga, `qtd:0` derrubava
     junto a capa do video, o clique no cartao e as paradas da apresentacao — o video
     sumiria em vez de ficar sozinho, que e o oposto do pedido. Medido no codigo antes de
     mexer: o `paginasDe` devolvia 0 e o `buildStops` cria a parada do video DENTRO do laco
     das paginas, entao com 0 paginas o laco nao roda e a parada nao nasce. */
  function temGaleria(i){ var c = conexao(i); return !!(c && (c.qtd > 0 || temVideo(i))); }
  /* ⚠ A CAPA DO VÍDEO CONTA COMO PÁGINA (2026-08-13, à noite).
     A primeira tentativa foi um play SOBREPOSTO ao slide, e o dono devolveu com um print:
     *"ainda continua errado"* — a tabela do Bônus Extra aparecia com um botão de play colado
     em cima dela. Ele estava certo: uma capa é uma TELA, não um adesivo.
     Agora a conexão com vídeo tem uma página a mais, a de índice 0, que é a capa. Os slides
     começam no 1. Tudo o que conta páginas (o contador do rodapé, as setas, e as paradas da
     apresentação) sai daqui, então acompanha sozinho. */
  function paginasDe(i){
    var c = conexao(i); if(!c) return 0;
    /* sem slide nenhum: se houver video, sobra a capa dele — uma pagina, que e a de indice 0
       e e exatamente a que o `ehCapa` ja trata. Sem video, zero, e a conexao nao abre nada. */
    var web = PAGINA_WEB[c.slug] ? 1 : 0;   /* a simulação, última página (2026-10-24) */
    if(!c.qtd) return (temVideo(i) ? 1 : 0) + web;
    return Math.ceil(c.qtd / porPagina()) + (temVideo(i) ? 1 : 0) + web;
  }
  /* esta página é a capa do vídeo? */
  function ehCapa(i, pagina){ return temVideo(i) && pagina === capaPagina(i); }
  /* o slide real por trás da página, já descontando a capa */
  function slideDaPagina(i, pagina){ var cp = capaPagina(i); return (cp >= 0 && pagina > cp) ? pagina - 1 : pagina; }
  function capaDe(c){ return BASE + c.slug + "/capa-video.jpg" + VER; }

  /* ---------------------------------------------------------------------------
     O POP-UP
     ---------------------------------------------------------------------------
     `class="grad-modal eco-modal"`: herda TODO o CSS da galeria das graduações
     (painel, fundo desfocado, grade de fotos, setas, bolinhas, e o responsivo de
     retrato que já foi acertado com o dono) e usa `.eco-modal` só para o que é
     diferente. Copiar aquelas ~50 regras para cá seria criar um segundo lugar
     para consertar todo ajuste futuro.
     --------------------------------------------------------------------------- */
  function monta(){
    if(modal) return modal;
    modal = document.createElement("div");
    modal.className = "grad-modal eco-modal";
    modal.id = "ecoGalModal";
    modal.setAttribute("aria-hidden","true");
    modal.innerHTML =
        '<div class="gm-backdrop"></div>'
      + '<div class="gm-panel" role="dialog" aria-modal="true" aria-label="Fotos da conexão">'
      +   '<button class="gm-close" type="button" aria-label="Fechar">✕</button>'
      +   '<button class="gm-nav gm-prev" type="button" aria-label="Página anterior">‹</button>'
      +   '<button class="gm-nav gm-next" type="button" aria-label="Próxima página">›</button>'
      +   '<div class="gm-viewport"><div class="gm-track"></div></div>'
      +   '<div class="gm-dots"></div>'
      + '</div>';
    document.body.appendChild(modal);

    modal.querySelector(".gm-close").addEventListener("click", fechar);
    modal.querySelector(".gm-backdrop").addEventListener("click", fechar);
    modal.querySelector(".gm-prev").addEventListener("click", function(e){ e.stopPropagation(); vaiPara(pagina-1); });
    modal.querySelector(".gm-next").addEventListener("click", function(e){ e.stopPropagation(); vaiPara(pagina+1); });
    return modal;
  }

  /* caminho do slide da posição `k` (0 = o primeiro daquela conexão)
     ⚠ O NOME PASSA POR encodeURIComponent, e isso não é zelo teórico: no deck de
     2026-08-10 a capa da Livre se chamava "Slide 1_Livre", COM ESPAÇO. O deck de
     2026-08-12 não tem nenhum nome com espaço, mas a codificação FICA — foi o dono que
     nomeou aquele arquivo, e o próximo deck pode trazer outro igual. Espaço cru num `src`
     é território de "às vezes funciona": o navegador costuma codificar sozinho, mas um
     servidor pode devolver 404 e a falha é MUDA — a imagem não aparece e o console não
     diz nada.
     Codificar aqui resolve para qualquer nome futuro, e é o código se ajustando ao arquivo
     do dono, não o contrário (regra do projeto).
     A codificação é só do NOME. A pasta e o `BASE` ficam crus de propósito: uma barra
     codificada (%2F) deixaria de ser separador de caminho e quebraria a URL inteira. */
  function caminho(c, k){
    if(!c || !c.nomes || k < 0 || k >= c.nomes.length) return "";
    var nome = c.nomes[k];
    /* ⚠ O NOME PODE TRAZER A PRÓPRIA EXTENSÃO, e isso não é firula: em 2026-09-10 o dono
       mandou `telecom/Slide1.jpg` enquanto green e seguros vieram `.jpeg`. Com o `EXT` fixo
       colado em todos, a Telecom pediria `Slide1.jpg.jpeg` e daria 404 — e 404 de imagem
       aqui é MUDO: o pop-up abre e o quadro fica preto (o `onerror` avisa no console e
       pula, o que numa apresentação lê como falha da peça).
       Regra do projeto: o código se ajusta ao arquivo do dono. Quem tiver extensão diferente
       do padrão põe o nome inteiro na lista; o resto segue curto, sem extensão. */
    var ext = /\.(jpe?g|png|webp|avif)$/i.test(nome) ? "" : EXT;
    return BASE + c.slug + "/" + encodeURIComponent(nome) + ext + VER;
  }

  /* ---------------------------------------------------------------------------
     O SLIDE ATUAL
     ---------------------------------------------------------------------------
     Uma imagem por vez. Trocar o `src` de um <img> que já existe, em vez de
     recriar o nó a cada passo: o navegador mantém o quadro anterior desenhado até
     o novo estar pronto, e a troca não pisca. Recriando o nó, existe um quadro com
     a caixa vazia — e numa tela de apresentação isso lê como falha.
     --------------------------------------------------------------------------- */
  /* monta a página web uma vez por abertura do pop-up (o `fechar()` esvazia a trilha e leva o iframe junto) */
  function montaWeb(caixa, cfg){
    if (!cfg) return;
    if (!caixa.firstChild){
      caixa.innerHTML =
          '<div class="eg-web-barra">'
        +   '<span class="eg-web-nav"><button class="eg-web-ant" type="button" aria-label="Voltar">&lsaquo;</button>'
        +   '<button class="eg-web-prox" type="button" aria-label="Avançar">&rsaquo;</button></span>'
        +   '<b class="eg-web-tit"></b>'
        +   '<a class="eg-web-btn" target="_blank" rel="noopener"><span></span>'
        +     '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a></div>'
        + '<div class="eg-web-area">'
        +   '<div class="eg-web-off"><b></b><span>Veja quanto um eletroposto pode render, com os seus números.</span>'
        +     '<a class="eg-web-btn eg-web-btn-g" target="_blank" rel="noopener"><span></span>'
        +       '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a></div>'
        + '</div>';
      caixa.querySelector(".eg-web-tit").textContent = cfg.titulo;
      caixa.querySelector(".eg-web-off b").textContent = cfg.titulo;
      [].forEach.call(caixa.querySelectorAll(".eg-web-btn"), function(a){
        a.href = cfg.url; a.querySelector("span").textContent = cfg.botao;
        a.addEventListener("click", function(e){ e.stopPropagation(); });
      });
      /* ‹ › DA FAIXA (2026-10-24). Sintoma do dono: *"no modo apresentacao quando entro na simulacao do mob
         faço a simulacao etc... e clico para setas para passar e fechar o slide e continuar para a proxima
         secao nao vai"*. Causa: depois de usar a simulação o foco do teclado está DENTRO do iframe (outro site)
         e a página não recebe tecla nenhuma de lá; e a barra da apresentação, que some sozinha, não reaparece
         com o mouse em cima do iframe (o movimento acontece no outro site). Estes dois botões ficam sempre à
         mostra NESTA página: na apresentação chamam o mesmo goNext/goPrev do passador; fora dela, andam na
         galeria (o › da última página fecha). E o clique neles já devolve o foco à página. */
      caixa.querySelector(".eg-web-ant").addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); navWeb(-1); });
      caixa.querySelector(".eg-web-prox").addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); navWeb(1); });
      var area = caixa.querySelector(".eg-web-area");
      area.addEventListener("mouseleave", devolveFoco);
      /* ⚠ O `mouseleave` SOZINHO NÃO BASTOU (medido, 2026-10-24): com o mouse saindo do iframe para a faixa,
         a página não recebeu o evento e a seta continuou indo para a simulação. O que chegou foi o `mouseover`
         do que está fora do iframe — então é ele que devolve o foco, em qualquer ponto da página (inclusive
         nos botões da apresentação). Ligado uma vez só. */
      if (!devolveLigado){
        devolveLigado = true;
        /* ⚠ `mousemove`, e não `mouseover` (2026-10-24, medido com mouse real via CDP): voltando do iframe
           para o MESMO elemento de onde o mouse entrou (faixa → faixa, fundo → fundo, rodapé → rodapé) o
           navegador não gera `mouseover` — só `mousemove`. Com o `mouseover`, 4 de 7 caminhos de saída
           deixavam o passador preso na simulação, e entrar e sair pela faixa de cima é justamente o caminho
           natural. Com o `mousemove` os 7 devolvem o foco. Barato: só olha o resto quando o foco está num
           iframe. O que NENHUM ouvinte resolve: mouse parado em cima da simulação — aí as teclas são do
           outro site, e a saída é mexer o mouse ou os ‹ › da faixa (decisão do dono, "deixa como está"). */
        document.addEventListener("mousemove", function(e){
          var at = document.activeElement;
          if (!at || at.tagName !== "IFRAME") return;
          if (e.target && e.target.closest && e.target.closest(".eg-web-area")) return;
          devolveFoco();
        }, true);
      }
    }
    var area2 = caixa.querySelector(".eg-web-area");
    var celular = window.matchMedia && window.matchMedia("(max-width:700px)").matches;
    var online = (typeof navigator.onLine !== "boolean") || navigator.onLine;
    if (!area2.querySelector("iframe") && online && !celular){
      var fr = document.createElement("iframe");
      fr.className = "eg-web-frame";
      fr.src = cfg.url;
      fr.title = cfg.titulo;
      fr.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      area2.appendChild(fr);
    }
  }
  /* tira o foco de dentro do iframe: sem isto, depois de mexer na simulação, as teclas do passador iriam
     para o site de lá e a apresentação pareceria travada */
  var devolveLigado = false;
  function navWeb(dir){
    devolveFoco();
    var P = window.__pmode;
    if (P && P.isActive && P.isActive() && P.next && P.prev){ if (dir > 0) P.next(); else P.prev(); return; }
    if (dir > 0){ if (!vaiPara(pagina + 1)) fechar(); }
    else vaiPara(pagina - 1);
  }
  function devolveFoco(){
    var a = document.activeElement;
    if (a && a.tagName === "IFRAME"){ try{ a.blur(); }catch(e){} try{ window.focus(); }catch(e){} }
  }

  function desenha(){
    var c = conexao(atual); if(!c) return;
    var pags = paginasDe(atual);
    var track = modal.querySelector(".gm-track");

    if(!track.querySelector(".eg-solo")){
      var estilo = "--acc:"+VERDE
        + ";--acc-line:rgba("+VERDE_RGB+",.5)"
        + ";--acc-glow:rgba("+VERDE_RGB+",.14)"
        + ";--acc-glow2:rgba("+VERDE_RGB+",.45)"
        + ";--acc-tint:rgba("+VERDE_RGB+",.16)";
      /* width/height declarados: regra do projeto, imagem sempre com dimensão. São os
         1920x1080 reais dos slides — servem para o navegador reservar a caixa na
         proporção certa antes de o arquivo chegar, e é o que evita o pulo de layout.
         (Eram 720x405 até 2026-08-10, quando o dono reexportou o deck em 1920x1080. A
         proporção não mudou, então nada de layout dependia disso — mas número declarado
         que não bate com o arquivo é armadilha para quem vier depois.)
         Sem loading="lazy": existe UMA imagem no DOM e ela é justamente a que está na
         tela; lazy aqui só atrasaria o quadro em que o pop-up abre. */
      track.innerHTML = '<div class="gm-slide eg-solo" style="'+estilo+'">'
        + '<div class="eg-quadro">'
        +   '<img class="eg-img" src="" alt="" width="1920" height="1080" decoding="async">'
        +   '<div class="eg-web" hidden></div>'
        /* CAPA COM PLAY (2026-08-13, pedido do dono para a Conexão Seguros). O botão vive
           SEMPRE no DOM e é o `desenha()` que o mostra ou esconde — montar e desmontar nó a
           cada passo custaria layout no meio da apresentação, que é o que este projeto evita.
           Fica sobre o slide, que faz o papel de capa: a arte já está na tela e o play só
           anuncia que ali existe vídeo. Sem imagem nova no projeto. */
        +   '<button class="eg-play" type="button" hidden aria-label="Assistir ao vídeo">'
        +     '<span class="eg-play-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>'
        +     '<span class="eg-play-txt">Assistir ao vídeo</span>'
        +   '</button>'
        + '</div>'
        + '<div class="eg-rodape">'
        +   '<span class="eg-nome"><i class="eg-tag"></i><b class="eg-titulo"></b></span>'
        +   '<span class="eg-conta"></span>'
        + '</div>'
        + '</div>';
      var im = track.querySelector(".eg-img");
      /* rede de segurança: se faltar um número dentro da faixa, o passo ficaria preto.
         Aqui ele avisa no console (para quem for consertar) e segue para o próximo,
         em vez de deixar quem está apresentando olhando para um quadro vazio. */
      im.addEventListener("error", function(){
        if(!im.getAttribute("src")) return;
        try{ console.warn("[eco-galeria] slide não encontrado:", im.getAttribute("src")); }catch(e){}
        if(!avancar()) fechar();
      });
      /* ⚠ O CLIQUE É LIGADO UMA VEZ SÓ, aqui dentro do "monta o slide", e não no `desenha()`.
         O `desenha()` roda a CADA passo — ligar ali empilharia um ouvinte por imagem vista, e
         depois de seis passos um clique abriria o player seis vezes. É o tipo de defeito que
         só aparece depois de um tempo de uso e some quando você vai investigar. */
      track.querySelector(".eg-play").addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        abrirVideoDaConexao();
      });
    }

    var img = track.querySelector(".eg-img");
    var capa = ehCapa(c.i, pagina);
    var web = ehWeb(c.i, pagina), caixaWeb = track.querySelector(".eg-web");
    if (caixaWeb){ caixaWeb.hidden = !web; if (web) montaWeb(caixaWeb, webDe(c.i)); }
    modal.classList.toggle("eg-na-web", web);
    if (!web) devolveFoco();
    img.style.display = web ? "none" : "";
    if (web) img.removeAttribute("src");
    else img.src = capa ? capaDe(c) : caminho(c, slideDaPagina(c.i, pagina));
    img.alt = capa ? ("Vídeo da " + c.nome)
                   : (c.nome + " — imagem " + (pagina+1) + " de " + pags);
    /* textContent e não innerHTML: nome e etiqueta vêm do HTML do cartão, são texto */
    track.querySelector(".eg-tag").textContent = "[ " + c.tag + " ]";
    track.querySelector(".eg-titulo").textContent = c.nome;
    track.querySelector(".eg-conta").textContent =
      String(pagina+1).padStart(2,"0") + " / " + String(pags).padStart(2,"0");

    /* ============================================================
       O PLAY APARECE NA PRIMEIRA IMAGEM DA CONEXÃO QUE TEM VÍDEO
       ------------------------------------------------------------
       ⚠ ERA NA ÚLTIMA, E MUDOU NO MESMO DIA (2026-08-13, à noite). A primeira versão copiou
       o fluxo das Graduações (fotos -> vídeo) e o dono corrigiu: *"coloque o video antes e
       depois que finalizar no proximo click aparece o slide do bonus extra"*. Aqui o vídeo
       APRESENTA a conexão e as artes são a campanha do mês — o argumento vem antes da tabela.
       Então o play fica na PRIMEIRA, que é onde o visitante chega ao abrir a galeria.
       ⚠ NÃO "UNIFORMIZE" COM AS GRADUAÇÕES: lá a ordem é fotos -> vídeo, aqui é o inverso, e
       as duas estão certas para o que contam. Trocar uma pela outra desfaz um pedido explícito.
       Numa conexão de uma imagem só (o Seguros hoje, com o `Slide71`) primeira e última são a
       mesma, então visualmente nada mudou — o que mudou de verdade foi a ORDEM DAS PARADAS na
       apresentação, no presentation-mode.js.
       ⚠ O `hidden` DAQUI SÓ FUNCIONA POR CAUSA DE UMA REGRA NO index.html, e eu já escrevi o
       contrário aqui — estava errado. O atributo esconde através de um `display:none` da folha
       do NAVEGADOR, e regra de navegador perde para regra de autor; como o `.eg-play` define
       `display:flex` numa classe, o botão continuava aparecendo com `hidden` ligado. O dono viu
       o play em cima da tabela do Bônus Extra: *"tira isso, nao tem player nesse slide 2"*.
       A regra `.eco-modal .eg-play[hidden]{ display:none }` é o que faz esta linha valer. Se
       alguém mexer no CSS do play, PRECISA manter aquela regra.
       ============================================================ */
    var play = track.querySelector(".eg-play");
    if (play) play.hidden = !capa;

    /* PRÉ-CARREGA A PRÓXIMA. Com uma imagem por passo, cada clique é uma requisição de
       ~340kB no deck de 2026-08-12 (eram ~80kB no anterior, que era menor em pixels);
       sem isto, numa rede ruim o apresentador clica e espera — e agora esperaria 4x mais.
       Baixar só a SEGUINTE (e não a conexão inteira) é o que mantém isso barato: ao fim
       da maior conexão, Seguros, terão sido baixados 16 slides ≈ 5,5MB, e não os 59 ≈ 20MB
       do deck inteiro. Quem só abre uma conexão não paga pelas outras seis. */
    if(pagina + 1 < pags && !ehWeb(c.i, pagina + 1)){
      var prox = new Image();
      prox.decoding = "async";
      prox.src = caminho(c, pagina + 1);
    }

    /* bolinhas só até 8 — mesma trava do reconhecimento, onde 35 bolinhas somavam
       551px numa tela de 390 e empurravam o contador para fora dela. No deck de
       2026-08-12 isso divide as sete em duas: Solar (3), Livre (5), Expansão (7) e Placas
       (8) ganham bolinhas; Green (9), Telecom (11) e Seguros (16) passam do limite e
       informam pelo contador do rodapé. É de propósito, não é bolinha faltando. */
    var pts = "";
    if(pags > 1 && pags <= 8){
      for(var k=0;k<pags;k++) pts += '<button class="gm-dot'+(k===pagina?" active":"")+'" type="button" data-p="'+k+'" aria-label="Imagem '+(k+1)+'"></button>';
    }
    var dots = modal.querySelector(".gm-dots");
    dots.innerHTML = pts;
    [].forEach.call(dots.querySelectorAll(".gm-dot"), function(d){
      d.addEventListener("click", function(e){ e.stopPropagation(); vaiPara(+d.getAttribute("data-p")); });
    });

    var umaSo = (pags <= 1);
    modal.querySelector(".gm-prev").style.display = umaSo ? "none" : "";
    modal.querySelector(".gm-next").style.display = umaSo ? "none" : "";
    modal.querySelector(".gm-panel").setAttribute("aria-label","Imagens da "+c.nome);
  }

  function vaiPara(p){
    var pags = paginasDe(atual);
    if(!pags) return false;
    if(p < 0 || p >= pags) return false;
    if(p === pagina) return false;
    pagina = p; desenha();
    return true;
  }

  /* ---------------------------------------------------------------------------
     ABRIR / FECHAR
     ---------------------------------------------------------------------------
     A trava do scroll é a mesma da galeria das graduações: pausar o ScrollSmoother
     no desktop e o overflow do body onde ele não existe. Duas mecânicas mexendo na
     posição do scroll ao mesmo tempo é briga garantida neste projeto.
     --------------------------------------------------------------------------- */
  function abrir(i, p){
    if(!temGaleria(i)) return false;
    monta();
    if(limpeza){ clearTimeout(limpeza); limpeza = 0; }   /* cancela a limpeza pendente */
    atual = i;
    pagina = Math.max(0, Math.min(paginasDe(i)-1, p|0));
    desenha();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    /* ============================================================
       NO MODO APRESENTAÇÃO A TRAVA DE SCROLL NÃO ENTRA — posse explícita
       ------------------------------------------------------------
       Fora da apresentação a trava é obrigatória: sem ela a roda do mouse rola a
       página atrás do pop-up. Dentro da apresentação ela é ERRADA, e por um motivo
       que só existe nesta seção: as paradas do ecossistema estão em alturas
       DIFERENTES (uma por card, ao longo do pin do baralho). Ao sair da última
       imagem de uma conexão para o card da próxima, a apresentação precisa MOVER o
       scroll — e ela move escrevendo em `ScrollSmoother.scrollTop()`. Com o
       smoother pausado por esta galeria, esse passo escreveria numa mecânica
       desligada. É a regra do projeto de dar posse explícita quando duas mecânicas
       escrevem a mesma coisa (ver `autoAte`/`igNavAte` no index): na apresentação o
       scroll é dela, e a galeria não encosta.
       Nas galerias das graduações o problema não existe porque as 17 paradas
       daquela seção compartilham UM y só — lá a varredura nunca precisa andar, e é
       por isso que a trava delas nunca incomodou.

       ⚠ HONESTIDADE SOBRE A VERIFICAÇÃO: isto NÃO foi medido. No pane automatizado
       a varredura do presentation-mode não anda em nenhuma seção — conferido no
       baseline, a Trajetória (7 paradas em alturas diferentes, código que eu não
       toquei) também fica parada, porque o tween da varredura depende de quadros
       reais e a janela oculta roda a 1 fps. Então esta é uma decisão por leitura do
       código, não por número. Quem confirma é a tela do dono.
       ============================================================ */
    var naApresentacao = !!(window.__pmode && window.__pmode.isActive && window.__pmode.isActive());
    smoother = (window.ScrollSmoother && ScrollSmoother.get) ? ScrollSmoother.get() : null;
    if(naApresentacao){ travei = false; }
    else {
      travei = true;
      if(smoother) smoother.paused(true); else document.body.style.overflow = "hidden";
    }
    return true;
  }

  var limpeza = 0;
  function fechar(){
    if(!modal || !aberto()) return false;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    /* ============================================================
       A TRILHA SÓ É ESVAZIADA DEPOIS DO ESMAECER
       ------------------------------------------------------------
       Esvaziar aqui, na mesma linha, apagava a imagem no MESMO quadro em que o
       pop-up começava a sumir — ou seja, a transição de saída existia no CSS e não
       aparecia, porque não havia mais nada para esmaecer. Era metade do "ele volta
       de uma vez" que o dono relatou (2026-08-10). A outra metade estava no CSS
       (`visibility` sem transição), ver `.eco-modal` no index.html.
       Esvaziar continua sendo necessário: são até 89 imagens por conexão e deixar a
       última decodificada na memória com o pop-up fechado é desperdício.
       O `limpeza` guardado evita o caso de reabrir antes dos 360ms: o timer é
       cancelado, senão ele apagaria a trilha da conexão NOVA.
       ============================================================ */
    if(limpeza) clearTimeout(limpeza);
    limpeza = setTimeout(function(){
      limpeza = 0;
      if(aberto()) return;                        /* reabriu no meio: não mexe */
      var tk = modal.querySelector(".gm-track"); if(tk) tk.innerHTML = "";
    }, 360);
    atual = -1; pagina = 0;
    /* destrava SÓ se foi esta galeria que travou. Chamar `paused(false)` sem ter
       pausado devolveria o scroll a quem não pediu — e se outra peça (o
       reconhecimento, o pop-up de vídeo) estivesse com a trava dela, a nossa
       liberaria a dos outros. */
    if(travei){
      if(smoother) smoother.paused(false); else document.body.style.overflow = "";
    }
    travei = false; smoother = null;
    return true;
  }

  function aberto(){ return !!(modal && modal.classList.contains("open")); }

  /* avança dentro do pop-up; devolve false quando não há mais página, que é o
     sinal de "acabou, o passo é seu" para quem estiver por cima (a apresentação) */
  function avancar(){ return aberto() ? vaiPara(pagina+1) : false; }
  function voltar(){  return aberto() ? vaiPara(pagina-1) : false; }

  /* ---------------------------------------------------------------------------
     CLIQUE NO CARTÃO, fora da apresentação
     ---------------------------------------------------------------------------
     O cartão é um `role="link"` com `data-pt-href="produtos/conexao*.html"`, mas
     hoje esse clique NÃO LEVA A LUGAR NENHUM: o js/page-transition.js dá
     `preventDefault()` e sai fora quando o destino tem "produtos/" — é a trava que
     o dono pediu para nunca entrar nas páginas de produto. Ou seja, os sete cartões
     estão mudos desde então, exatamente como a barra do Sênior ficou muda quando
     perdeu a galeria. Devolver efeito a esse clique é ganho, não invasão.
     Só intercepta quando AQUELA conexão tem foto; sem foto o clique segue o caminho
     de sempre (que hoje é não fazer nada) e ninguém ganha um gesto que engana.

     Delegado no documento, em fase de CAPTURA, e não um listener por cartão: o
     clone `#ecossistema2` nasce em runtime e pode não existir quando este arquivo
     roda — listener por cartão perderia justamente os cartões do clone, que são os
     que estão na tela no desktop. Um listener só, que resolve o cartão na hora do
     clique, não tem esse problema.
     --------------------------------------------------------------------------- */
  /* ⚠ FORA DA APRESENTAÇÃO O CLIQUE AMPLIA O CARTÃO (2026-10-08, trazido da APN Digital —
     commit f3aa619 de lá). Pedido do dono: *"quando clicar no card dos ecossistemas ele tem que
     expandir mesmo sem ser no modo apresentação"*.
     Até aqui só o modo apresentação ampliava; fora dele o clique só abria a galeria, e só nas
     conexões que têm uma — nas outras o cartão continuava mudo.
     Agora o clique segue a MESMA ORDEM das paradas da apresentação: 1º clique amplia o cartão;
     clique no cartão ampliado abre a galeria daquela conexão, se ela tiver (aqui, desde
     2026-10-08: Green e Seguros, só com o vídeo), ou fecha, se não tiver. O ✕, o fundo e o Esc fecham.
     DENTRO da apresentação o comportamento antigo fica intocado (clique abre a galeria):
     lá quem decide o que aparece é o goNext/goPrev, e o cartão ampliado já é uma parada.

     ⚠⚠ NO ROYAIS O CARTÃO AMPLIADO É OUTRA PEÇA — por isso este bloco NÃO é cópia do da APN.
     As duas nasceram no mesmo dia (2026-09-14), em sessões paralelas, do mesmo pedido: lá ele
     mora NESTE arquivo (`abrirCard`, amplia com `scale`, usa o cromo da `.grad-modal`); aqui
     mora em js/ecossistema-card.js e é falado por `window.IGREEN_ECO_CARD`. Ao trazer o
     commit da APN, o git aplicou sozinho a parte do clique — que chamava `abrirCard`,
     `fecharCard`, `cardAberto`, `cardModal` e `cardAtual`, funções que NÃO EXISTEM aqui. O
     primeiro clique num cartão daria ReferenceError. O comportamento é o da APN; a peça é a
     do Royais, e de propósito: o cromo da `.grad-modal` traz `backdrop-filter: blur(8px)` de
     tela cheia, e medido em 2026-09-14 é exatamente o efeito que derruba esta seção a 14 fps
     num PC sem aceleração de vídeo. Trazer a peça da APN seria trazer esse custo junto. */
  function pmodeAtivo(){ return !!(window.__pmode && window.__pmode.isActive && window.__pmode.isActive()); }
  /* a peça do cartão ampliado. Ela carrega DEPOIS deste arquivo (ver a ordem das <script> no
     index.html), então é procurada na hora do clique, nunca guardada na carga. */
  function cartao(){ return window.IGREEN_ECO_CARD || null; }
  function cartaoAberto(){ var C = cartao(); return !!(C && C.aberto && C.aberto()); }

  function ligaCliques(){
    document.addEventListener("click", function(e){
      if(!e.target || !e.target.closest) return;
      if(aberto()) return;                                  /* já tem galeria na frente */

      /* clique DENTRO do cartão ampliado. Ele é anexado ao <body>, então este listener de
         documento vê o clique. ⚠ O CLONE TAMBÉM É UM `.ecard` — por isso este teste vem
         ANTES da busca pelo cartão do baralho, senão o clique no ampliado reabriria ele. */
      var modal = document.getElementById("ecoCardModal");
      if(cartaoAberto() && modal && modal.contains(e.target)){
        /* na apresentação o ampliado é uma PARADA, e quem a fecha é só a apresentação — ver o
           cabeçalho do js/ecossistema-card.js (o caso dos "dois donos"). */
        if(pmodeAtivo()) return;
        e.preventDefault(); e.stopPropagation();
        var C = cartao(), j = C.indice();
        C.fechar();
        /* no cartão: segue para a galeria, quando há uma. No ✕ ou no fundo: só fecha. */
        if(e.target.closest(".ecm-card") && j >= 0 && temGaleria(j)) abrir(j, 0);
        return;
      }

      var card = e.target.closest(".ecard");
      if(!card) return;
      var raiz = raizEco();
      if(!raiz || !raiz.contains(card)) return;             /* cartão do clone escondido: ignora */
      var i = [].indexOf.call(raiz.querySelectorAll(".ecard"), card);
      if(i < 0) return;
      /* ⚠ SÓ NO LAYOUT DE COMPUTADOR (>=1025px). Abaixo disso o cartão já ocupa a largura da
         tela (medido na APN a 1024x768: cartão de 969px), e o "ampliado" seria o mesmo cartão.
         Lá o clique segue como antes. */
      var celular = window.matchMedia && window.matchMedia("(max-width:1024px)").matches;
      var C2 = cartao();
      if(pmodeAtivo() || celular || !C2){
        if(!temGaleria(i)) return;
        e.preventDefault(); e.stopPropagation();
        abrir(i, 0);
        return;
      }
      e.preventDefault(); e.stopPropagation();
      C2.abrir(i);
    }, true);

    /* Esc fecha o cartão ampliado — só fora da apresentação (guarda do __pmode na 1ª linha,
       regra do projeto para toda peça sobreposta com teclado) */
    document.addEventListener("keydown", function(e){
      if(pmodeAtivo()) return;
      if(!cartaoAberto()) return;
      if(e.key === "Escape" || e.keyCode === 27){ e.preventDefault(); cartao().fechar(); }
    }, true);
  }

  /* Esc fecha, setas trocam de página — só quando o pop-up está aberto, e nunca
     durante a apresentação: lá quem manda no passo é o goNext/goPrev, e dois donos
     para o mesmo gesto já produziram aqui o bug de "pular a primeira página". */
  document.addEventListener("keydown", function(e){
    if(!aberto()) return;
    if(window.__pmode && window.__pmode.isActive && window.__pmode.isActive()) return;
    /* ⚠ QUEM ESTÁ POR CIMA MANDA (2026-08-13). Com o pop-up do vídeo aberto sobre a galeria,
       sem esta linha o Esc fecharia a GALERIA inteira em vez do vídeo, e a seta trocaria a
       imagem atrás de uma tela que ninguém está vendo. É a mesma cessão que a galeria das
       graduações passou a fazer no mesmo dia. O player só escuta Esc — as setas ele deixa
       passar de propósito, para o passador de slide poder cortar o vídeo. */
    if(window.IGREEN_REC_VIDEO && window.IGREEN_REC_VIDEO.aberto()) return;
    if(e.key === "Escape"){ fechar(); return; }
    if(e.key === "ArrowRight"){ e.preventDefault(); avancar(); return; }
    if(e.key === "ArrowLeft"){ e.preventDefault(); voltar(); }
  }, true);

  /* girar o aparelho muda quantas fotos cabem por página (8 <-> 4), e com isso o
     número de páginas. Sem redesenhar, o contador passaria a mentir. */
  window.addEventListener("resize", function(){
    if(!aberto()) return;
    var pags = paginasDe(atual);
    if(pagina > pags-1) pagina = Math.max(0, pags-1);
    desenha();
  });

  /* Quais conexões têm foto. Lido de fora (e útil para conferir no console) — mas a
     apresentação NÃO depende desta lista: o buildStops pergunta `paginas(i)` conexão por
     conexão, justamente porque uma lista tirada cedo demais pode nascer vazia enquanto o
     clone do ecossistema não existe. Aqui é função, não array congelado, pelo mesmo motivo. */
  function comFoto(){
    var L = lista(), out = [];
    for(var i=0;i<L.length;i++) if(L[i].qtd > 0) out.push(i);
    return out;
  }

  function pronto(){
    ligaCliques();
    /* getter e não valor: ler `window.ECO_GAL_CARDS` sempre devolve a verdade daquele
       instante, mesmo que na hora em que este arquivo rodou o clone ainda não existisse. */
    try{
      Object.defineProperty(window, "ECO_GAL_CARDS", { get: comFoto, configurable: true });
    }catch(e){ window.ECO_GAL_CARDS = comFoto(); }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto);
  else pronto();

  /* ============================================================
     API PÚBLICA
     `i` é a posição do cartão na seção (0 = Conexão Livre … 6 = Expansão),
     a mesma ordem do DOM e a mesma que o buildStops da apresentação usa.
     ============================================================ */
  window.IGREEN_ECO_GAL = {
    abrir:      function(i,p){ return abrir(i, p||0); },
    fechar:     fechar,
    aberto:     aberto,
    avancar:    avancar,
    voltar:     voltar,
    paginas:    paginasDe,
    capaPagina: capaPagina,
    temGaleria: temGaleria,
    /* lidos pelo js/presentation-mode.js para criar a parada do vídeo daquela conexão */
    temVideo:    temVideo,
    abrirVideo:  function(i){
      var k = chaveDeVideo(i), V = window.IGREEN_REC_VIDEO;
      if (!k || !V) return false;
      try { return !!V.abrir(k); } catch(e){ return false; }
    },
    fecharVideo: function(){
      var V = window.IGREEN_REC_VIDEO;
      if (V && V.aberto()) try { V.fechar(); } catch(e){}
    },
    videoAberto: function(){ var V = window.IGREEN_REC_VIDEO; return !!(V && V.aberto()); },
    indice:     function(){ return atual; },
    pagina:     function(){ return pagina; },
    porPagina:  porPagina,
    conexoes:   function(){ return lista().map(function(c){ return { i:c.i, slug:c.slug, nome:c.nome, qtd:c.qtd, paginas:paginasDe(c.i) }; }); }
  };
})();
