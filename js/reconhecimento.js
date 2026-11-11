/* ============================================================
   RECONHECIMENTO — peça animada em dois atos, por qualificação
   ------------------------------------------------------------
   Porte para JS puro do pacote React+TypeScript que o dono mandou
   (Animacao_Pins_Reconhecimento.zip, 2026-08-09). Este projeto não
   tem React nem etapa de build: o pacote vinha com .tsx e CSS
   Module, que só existem depois de compilados. O que foi mantido
   linha a linha: o classificador de nomes, o cálculo do corpo da
   fonte, a paginação e a curvatura do mural — são funções puras e
   os números delas vieram de medição.

   O QUE ESTE ARQUIVO FAZ, EM UMA FRASE
   Monta sob demanda uma tela cheia com o pin do nível e, QUANDO
   MANDAM, varre a tela com um facho de luz e revela o mural de
   nomes reconhecidos.

   ONDE ELE ENTRA (pedido do dono, 2026-08-09)
     Sênior    -> só a animação (este nível não tem galeria de fotos
                  desde 04/08, e o dono confirmou que continua sem)
     Gestor    -> fotos da galeria  ->  animação
     Executivo -> fotos da galeria  ->  popup de vídeo  ->  animação
   O popup de vídeo é SINALIZAÇÃO, não toca nada: "sem
   funcionalidade", palavras do dono. Ele vive no index.html, junto
   da galeria, porque é da galeria que ele aparece por cima.

   DUAS ARMADILHAS DESTE PROJETO QUE MANDARAM NO DESENHO DAQUI
   1) O nó é pendurado no <body>, FORA do #smooth-content. Dentro
      dele um position:fixed passa a medir o ancestral transformado
      pelo ScrollSmoother e a tela cheia sai de lugar. Mesmo motivo
      do popup do vídeo institucional e do modal de eventos.
   2) Quem avança é SEMPRE uma ação de quem apresenta — clique,
      seta ou passo da apresentação. Não há relógio levando a peça
      sozinha (havia até 2026-08-09). O JS só põe a classe `ato2` na
      tela; a coreografia inteira do 2º ato é CSS a partir desse
      instante. Isso mantém o custo em zero trabalho por quadro no
      JS, que é a causa de engasgo neste projeto.
   ============================================================ */
(function(){
  "use strict";

  /* ---------- relógio da troca de página (ms). Espelha o CSS ----------
     Os tempos do ATO 1 e da VARREDURA saíram daqui em 2026-08-09: a troca de ato virou
     manual e quem cronometra é o CSS, a partir do instante em que a classe `ato2` entra.
     Só a troca de página ainda precisa de tempo no JS, porque ela tem três fases e o meio
     (redesenhar o mural) é trabalho de JS.

     ⚠ ESTES DOIS NÚMEROS ESPELHAM O CSS e a soma deles é a JANELA EM QUE `irPara()` RECUSA
     input (`fase !== "parado"`). Antes eram 430 + 750 = 1180ms, o tempo da onda de falha
     escalonada por card. Com o glitch trocado por ocultar (2026-08-10, pedido do dono), a
     saída são 160ms e a entrada 200ms no CSS — e a janela morta caiu para 400ms. Isso
     importa numa apresentação ao vivo: quem clica rápido perdia o segundo clique dentro
     daquele 1,18s e o sintoma era "às vezes ele não passa a página". Se mexer na duração
     no CSS, mexa aqui na mesma edição. */
  var T_SAIDA   = 180;             /* 160ms de recSome, +20 de folga */
  var T_ENTRADA = 220;             /* 200ms de recVolta, +20 de folga */

  /* ---------- padrão de raios das paredes (medido no mp4 de referência) ---------- */
  var PASSO_X = 118, PASSO_Y = 196, PER_MIN = 1.4, PER_MAX = 3.3;

  /* ============================================================
     OS NOMES — É AQUI QUE SE MEXE
     ------------------------------------------------------------
     Uma lista por qualificação, como o dono mandou em 2026-08-09
     (arquivo "nomes pins/SENIORS.md"). Elas vieram em tabelas de
     4 colunas, e a ordem alfabética das tabelas corre POR COLUNA,
     não por linha: a coluna 1 vai de A até C, a 2 continua dali.
     Lidas na ordem certa, as três saem alfabéticas de ponta a
     ponta — conferido: ZERO quebras de ordem nas 475 entradas.

     ⚠ "Eduardo Voss Wotter" aparecia DUAS VEZES na tabela de
     Gestores (uma na 1ª tabela, outra na 2ª). Entrou uma vez só.
     Se as duas eram pessoas diferentes, é aqui que se desempata.

     Contagem: Sêniores 313 · Gestores 114 · Executivos 48.

     Cada item pode ser:
       "Nome Completo"                    -> tipo detectado pelo classificador
       { nome:"Nome", tipo:"feminina" }   -> tipo cravado à mão
     O classificador é heurística, não cadastro: nome unissex cai
     no padrão masculino. Para cravar, use a segunda forma.
     ============================================================ */
  var SENIORS = [
    "Adailton Silva Pereira",
    "Adelson Antonio Gomes Santos",
    "Adriana Porfirio Gomes Da Fonseca",
    "Adrieverton D Santos",
    "Adzon De Jesus Costa",
    "Agnaldo Faber",
    "Alan Patrique Kegler",
    "Aldair Jose Massuria",
    "Aldairis Andreia Lima De Oliveira",
    "Alessandra Pereira Da Silva",
    "Alexandre De Araujo Belarmino",
    "Alexandro Da Costa",
    "Alexsandro Alves Da Silva",
    "Alexssandro Cezar Wiesener Vieira",
    "Aliana Lima Alves",
    "Alisson Nagib Bonfim",
    "Alvaro Dutra Silva",
    "Amos Correa Dos Santos",
    "Ana Karla Dos Santos Barboza",
    "Ana Paula De Vargas",
    "Ana Paula Freitas",
    "Andre Elias Benedito",
    "Andre Luiz Santos De Melo",
    "Andre Nobre Da Silva Freire",
    "Andrea Eduarda De Almeida",
    "Andreia Dias Aragao",
    "Andressa Regina Goncalves Garcia",
    "Andressa Santos Abreu",
    "Andreza De Almeida Prado Bergamo",
    "Andriel Leitao Januario De Sousa",
    "Andriele Rosa Rabelo",
    "Anna Luiza Rocha Senra Mendes",
    "Antonia Pereira De Souza",
    "Antonio Jackson Rodrigues",
    "Antonio Lopes De Souza",
    "Antonio Oplinio De Souza",
    "Antonio Soares Do Nascimento",
    "Ariane Figueiredo Godois",
    "Ariany Evelyn Silva Fernandes",
    "Aure Luce Foschini Paiossin",
    "Brenda Oliveira Da Silva",
    "Bruno Augusto Rezende Souza",
    "Bruno De Souza Bueno",
    "Bruno Dell Agonolo",
    "Calebe Cardoso Teixeira",
    "Carlos Alberto Da Silva",
    "Caroline Holz",
    "Cassia Silva De Jesus",
    "Cassio De Andrade Franca",
    "Celso Alves Da Silva",
    "Cintia Gomes Martins",
    "Cintia Maria Sales Furlan",
    "Claudiane N Barbosa",
    "Claudinei Lopes Vieira",
    "Cleysson Pinheiro Ferreira",
    "Cristian Junior Vargas Ouriques",
    "Cristiane Leithardt",
    "Cristiane Solange Dos Santos",
    "Cristiani Goncalves Vitoria Junior",
    "Cristiano Schicovski Hirata",
    "Daniel Almiro Zillmer",
    "Daniel Andrade Lopes",
    "Daniel Fernando Daudt Cardoso",
    "Daniele De Souza Oliveira Gomes",
    "Danielle Cristina Barreto",
    "Danielle Sousa Moura",
    "Davila Da Silva Sousa Lacerda",
    "Debora Cristina Tameirao Ferreira",
    "Decio Antunes Da Silva",
    "Demetrios Nunes Gualberto Junior",
    "Denis Amaral Martins",
    "Dhomarcos Castro Mateus",
    "Diego Goncalves Magalhaes",
    "Diego Henrique Silva De Souza",
    "Diego Paulino Da Silva",
    "Diessica De Borba Raupp",
    "Dinalva Ferreira Da Silva",
    "Dulciana Medeiros Coronato",
    "Eber Souza Lima",
    "Edenil Fonseca Da Silva",
    "Edgar Berriel Tristao",
    "Edgar De Oliveira Costa",
    "Edgard Elvin Fraga Do Carmo",
    "Edivaldo Pereira Lima Junior",
    "Edmilson Dos Santos Costa",
    "Edson Duarte",
    "Edson Juvenal Dos Santos Chuquel",
    "Eduardo Da Silva Junior",
    "Eduardo Domingos",
    "Eduardo Gonçalves Dos Santos",
    "Eduardo Henrique Matias",
    "Edvan Souza Rodrigues",
    "Elaine Aparecida Hernandes Galdi",
    "Elberth Aquino Morais",
    "Elen Henrique De Oliveira",
    "Eliane Maria Kadanas Stokolosa",
    "Eliézer Lucas Mirais",
    "Elisabete Cristina Da Silva",
    "Elizabeth Rose Pereira",
    "Elizangela Maria Da Conceicao",
    "Emerson Fernando Souza Silva",
    "Emerson Luis Santos",
    "Eron Paulo Borges",
    "Esley Jose Da Silva",
    "Estevao Garcia",
    "Ezequiel Lindolfo De Mesquita",
    "Fabiano Alves Braga",
    "Fabiano Silvane Da Silva",
    "Fernanda Oliveira De Araújo Alves",
    "Fernanda Pavão De Souza Alegre",
    "Fernando Frota Dos Santos",
    "Fernando Henrique Bianchi",
    "Fernando Viana Da Silva",
    "Flávio Gonçalves Da Silva",
    "Flavio Schmidt De Carvalho",
    "Florencio Honorio Martins Melo",
    "Francilene Pereira Da Silva",
    "Francisco Goncalves De Assis Junior",
    "Gabriel Rangel Moreira",
    "Gabriel Santos Santiago",
    "Geovana Pereira",
    "Geraldo Edson Pereira",
    "Giovani Bau",
    "Giovani Macedo De Oliveira",
    "Giovani Motta Martins",
    "Givanildo Rodrigues Da Silva",
    "Glayco Menezes",
    "Guilherme Thomas Silva",
    "Gustavo Budal Spera",
    "Gustavo Guillermo Lazo Tessier",
    "Gustavo Henrique Saraiva",
    "Henrique Filgueira De Souza Marinho",
    "Hercules Alexandre Da Silva Lima",
    "Igor Gabriel Marques",
    "Iradi Rodrigues Da Cruz",
    "Isadora Luiza Damasceno",
    "Isaias Vilas Boas Batista",
    "Isaque A Ramos",
    "Itainara Aparecida Lopes Da Silva",
    "Ivandro Pedersini",
    "Ivete Ulrich",
    "Izaias Basilio De Sousa",
    "Jael Ximenes Soares",
    "Jairyson De Magalhaes Machado",
    "Janaina Nunes Da Silva",
    "Jean Carlos Silva Martins Leles",
    "Jedson Pereira Cardoso",
    "Jessica Ilioterio Rodrigues",
    "Jhon Jesus Oliveira",
    "Joel Cosso",
    "Joel Valente Reis",
    "Jonas Da Rocha Rachinhas",
    "Jonas Oliveira Pires",
    "José Antônio Marques",
    "Jose Eustaquio Ferreira",
    "Jose Francisco Da Silva",
    "Jose Frederico Teles Junior",
    "Jose Maria Almeida",
    "Jose Pedro Vieira Dos Santos",
    "Jose Roberto Pantoja Dos Santos",
    "Jose Wellington Da Silva",
    "Josenilda Souza Cruz Piola",
    "Josiane Aparecida De Paula",
    "Josiel Ricardo Toni",
    "Joyce Moreira Rodrigues Mota",
    "Juliana Raquel Armanje",
    "Kairusa De Moraes Hess",
    "Karina De Cassia Garcia",
    "Kleyton Dos Santos Da Silva",
    "Laura Visconti Sacco",
    "Leandro Barreto Parente",
    "Leandro Batista Do Nascimento",
    "Leandro Necchi",
    "Leonardo Da Silva",
    "Leonardo Domingos Lopes",
    "Leticia Nascimento Dos Santos",
    "Lidiane Fatima Varreira",
    "Lucas De Oliveira Da Fonseca",
    "Lucas Pereira Dos Santos",
    "Luciane Helena Costa Da Silva",
    "Luciano Rocha De Sousa Lima",
    "Luciano Scheffer Fraga",
    "Lucy Helene Bonfim",
    "Luis Claudio Malaguti",
    "Luis Claudio Pinto",
    "Luís Fernando Rech Dos Reis",
    "Luiz Carlos Carneiro Dos Santos",
    "Luiz Cesar De Souza",
    "Luiz Cezar Pinheiro De Oliveira",
    "Luiz Gabriel Goulart",
    "Luiz Gustavo Costa Silva",
    "Luiz Gustavo Herbst Rodrigues",
    "Luiz Jose De Cristo",
    "Luydge Ferreira Rosa",
    "Magnus Zanetti Goncalves",
    "Manoel Serafin Sebastiao",
    "Marcelo Gonçalves Fernandes",
    "Marcelo Zunino",
    "Marci Muller Friling",
    "Marcia Aparecida Urbanski",
    "Marcilei Martins Da Guia",
    "Marcio De Castro Vieira",
    "Marcos Jose Sabchuk",
    "Marcos Paulo Dos Santos Rocha",
    "Maria Aparecida De Jesus Souza",
    "Maria Do Carmo Furtado Hipolito",
    "Maria Lucia Do Nascimento Silva",
    "Mariana Rossi Negrini",
    "Marilia Gimenes Dos Anjos Rios",
    "Marlison Jordan Cardoso Monteiro",
    "Mateus Junio Dos Santos",
    "Mateus Krause Bierhals",
    "Matheus Milan Bonotto",
    "Maxmiliano Da Silva Pimentel",
    "Micael Armiliato",
    "Micheline Berger",
    "Miguel Luiz Waskow",
    "Moacir Anzolin",
    "Monica Santos Deolindo",
    "Murilo Chagas Silva",
    "Nadia Rosa",
    "Nangela Oliveira Frank Rosa",
    "Neuzilane Tellaroli Ferreira",
    "Nilvia Rejane Souza Vieira",
    "Nivaldo De Oliveira Sales",
    "Noeme Alves De Melo",
    "Oscar Quirino",
    "Osvaldo Marcelo Oreles De Medeiros",
    "Otelmo Albino Drebes",
    "Palmiro Rodrigues Da Silva",
    "Pamela Cristina Cardoso Moreira",
    "Patrick Henrique Fuentes Silva",
    "Patrique Bordini Amaral",
    "Paulo Henrique Aparecido",
    "Paulo Ricardo Da Silva Da Silva",
    "Pedro Carrilho Dutra",
    "Pedro Gilmar Freitas Palhano",
    "Pedro Henrique Costa Alves",
    "Pedro Henrique De Souza",
    "Pedro Henrique Reboucas Oliveira",
    "Rafael Adad Silva",
    "Rafael Gilberto Maktura",
    "Rafael Gregorio Da Silva",
    "Rafael Nathan Nogas",
    "Rafael Pinho Mota",
    "Rafael Ribeiro Garcia",
    "Rafaela Fatima Graciano",
    "Raimundo Sousa Da Silva",
    "Ramon Luan Pereira Da Silva",
    "Ranielle Gonçalves Da Matta",
    "Raphael Alves De Araujo",
    "Reginaldo Dos Santos Nunes",
    "Renan Neres Da Silva",
    "Renan Rizzon",
    "Renata Ledo De Souza Fernandes",
    "Reverton Dallacort Dos Santos",
    "Rinaldo Aparecido Barros Da Fonseca",
    "Rita De Cassia Melo Kleinkauff",
    "Rita Ximenes Alves Prates",
    "Roberto Taylor Faria Filho",
    "Robson Cler Rodrigues",
    "Rochelle Cássia Da Silva",
    "Rodrigo Assuncao Felix Dos Santos",
    "Rodrigo Florencio Barbosa",
    "Rodrigo Silva Mendes",
    "Rogerio Amaral Da Rosa",
    "Rogerio Antonio Ferreira",
    "Rogerio De Souza Barbosa",
    "Rogerio Santos Da Rosa",
    "Rogerio Torres Lopes",
    "Roselaine Pinotti",
    "Rosemeire Colpini Barandreckt",
    "Ruben Ferreira Maciel Junior",
    "Samara Fernanda Coelho De Sousa",
    "Samuel Correa Dos Santos",
    "Sandra Cardozo Felix De Vasconcelos",
    "Sara Do Amaral Wagner",
    "Sarah Dos Santos Souza Goulart",
    "Sebastiao Antonio Vivas Costa",
    "Sergio Ghislandi",
    "Sergio Santana De Oliveira",
    "Sergio Valdir Sfredo",
    "Simone Matter Furstenau",
    "Solange Berenice Pinheiro",
    "Suelen Brito Pinto",
    "Sueli Ribeiro Magalhaes Valesan",
    "Susana Claudia Balsalobre Barbosa",
    "Susana Nunes Werneck",
    "Tania Mara Da Silva Costa",
    "Tedson Aderno Fernandes De Souza",
    "Thaelis Bortolini",
    "Tony De Oliveira Dos Santos",
    "Uelison Do Amaral Manhães",
    "Valbenilson Santos",
    "Valentim Nardelli",
    "Valeria Brandao Zanelatto",
    "Vania Da Silva Santos",
    "Veronica Vaz Vieira Brandao",
    "Vilena Vilela Santos",
    "Vinicius De Sousa De Oliveira",
    "Vitor Cesar Alves De Almeida",
    "Viviani De Oliveira Marques De Vargas",
    "Wagner Magalhaes De Matos",
    "Walber Wilson De Alencar Mendes Junior",
    "Waldirene Da Silva Moura",
    "Wanderson Domiciano Soares Silva",
    "Wandersson Diovanne Pereira De Cerqueira",
    "Welington Lacerda Cypriano",
    "Wesley Almeida Dos Santos",
    "Willian Henrique Barbosa",
    "Yousef Igor Júnior Oliveira",
    "Zelma Pereira Dos Reis Da Costa",
    "Zenildo Souza Do Carmo"
  ];

  var GESTORES = [
    "Adalto De Jesus Santos",
    "Adriana De Oliveira",
    "Adriane Rodrigues Dos Santos",
    "Alan Ferreira Pinto",
    "Alberto Gonzaga De Lima Junior",
    "Alex Aparecido Martins Da Silva",
    "Alexandra Dos Santos Munhoz",
    "Aline Ellwanger",
    "Allan Vasconcelos Pinto",
    "Ana Beatriz Caiaffa Kreischer",
    "Ana Karina Da Costa Guarezi",
    "Anderson Tiago Brudnicki Gordya",
    "Anselmo Ednilson Freitas",
    "Antônio Marcos Silva Santos",
    "Aoliabe Luiz Da Silva Cavalcanti",
    "Bruna Flavia Ferregutti Benetom",
    "Bruno De Castro Albernaz",
    "Camilla Mendes Rodrigues Da Silva",
    "Carlos Alberto Souza Machado",
    "Carolina Goulart Paranaiba",
    "Conceicao Aparecida Oliveira Lima",
    "Cristiane Sakugawa",
    "Daivson De Souza Belem",
    "Daniele Carneiro Ramos",
    "Douglas Oliveira Dos Santos",
    "Dyogo De Souza Oliveira",
    "Ederson Trindade Da Silva",
    "Edinelson Depetris Da Silva",
    "Eduardo Bruschi Alves",
    "Eduardo Voss Wotter",
    "Eliane Sousa Carneiro Dos Santos",
    "Enzo Jonathan Monteiro De Abreu",
    "Esther Conceicao De Souza",
    "Evando Lucas Marques",
    "Everaldina Aparecida Barbosa",
    "Fabiana Melo Oliveira",
    "Fabio Carvalho Santana",
    "Fabio Dos Santos Verissimo",
    "Felipe Eduardo Schon Da Costa",
    "Fernando Reginato Lemos",
    "Fernando Rodrigues Dos Santos",
    "Filippo Stucchi Armaroli Amorim",
    "Gabriel Henrique Liberato Pereira",
    "Geraldo Silvério Filho",
    "Gilsane De Lima Bilhalva",
    "Graziele Jussara Fernandes",
    "Guilherme Zauk Allemand",
    "Hellen Dutra Jarfim",
    "Hercules Adalberto Lima",
    "Hevandro Da Silva Campos",
    "Hully Besen",
    "Igor Andre Santos",
    "Ismael Machado De Campos",
    "Italo Oliveira Farias",
    "Jackson Duarte",
    "Jean Carlos Barbosa",
    "Jhony De Oliveira Santos",
    "Joao Manoel Da Silva",
    "Joao Vitor Soares Do Amaral",
    "Jonathan Sangalli Bondaruk",
    "Jose Matheus Macena De Carvalho",
    "Jusieli Cristina Muller",
    "Larry Loesch Silva",
    "Laurinete A Costa",
    "Leandro B A Nascimento",
    "Leidiane Silva De Almeida",
    "Lindamara Catarina Da Paixao",
    "Lucas De Oliveira",
    "Lucas De Souza Lisboa",
    "Lucas Dos Santos Pereira",
    "Lucas Silva Do Nascimento",
    "Lucca Fontoura Miani Figueiredo",
    "Luis Roberto De Oliveira Da Silva",
    "Luis Rogerio Lopes Crivello",
    "Luiz Fernando Corrêa Augusto",
    "Marcia Cristina Almeida Santos",
    "Marcia Espindola",
    "Marcos Antonio Monteiro Barbosa",
    "Marcos Roberto Mendes De Lina",
    "Marlon Da Rosa",
    "Mary Aparecida Feres De Castro",
    "Matheus Correa Azevedo",
    "Mayre Bastos Gai",
    "Miguel Celestino Lucardo",
    "Miqueias De Souza Fitz",
    "Nilma Tavares Santana",
    "Nilson Antonio Pereira",
    "Paloma Evillin Santos Desbezell",
    "Patricia Costa Badaro Eler",
    "Pyetro Henrique Bravo Reckziegel",
    "Renato Morandin",
    "Rita De Cassia Moraes",
    "Roberto Wolf",
    "Robson Liberio De Oliveira",
    "Romilson Januario Martins",
    "Ronaldo Vagner Da Silva Torres",
    "Sâmela Freitas",
    "Samuel Domingos De Sousa",
    "Samuel Junior De Almeida",
    "Silvio Da Silva Machado",
    "Simone Fabiane Schirmann",
    "Tailor Nunes Azambuja",
    "Theo Schmidt Levien",
    "Thiago De Souza Andrade",
    "Thomas Ramalho Vianna",
    "Thulio Moutinho Silva",
    "Vagner Augusto Machado",
    "Valderir Mota Santana",
    "Valquiria Da Silva",
    "Viviane Machado Martins",
    "Warllen Rodrigues De Oliveira Barros",
    "Washignton Fernandes Da Silva",
    "Wellington Cristiano Nascimento",
    "Wilson Paes De Angelo"
  ];

  var EXECUTIVOS = [
    "Alexsandra Cristina Fumiko Tsuda",
    "Aline Oliveira Simoes",
    "Angela Marta Rodrigues De Andrade",
    "Ângela Pernas Pereira",
    "Antonio Moraes Da Costa",
    "Antonio Raimundo Leal Pires",
    "Carlos Bronson Soares Machado",
    "Charleanderson Rocha De Andrade",
    "Cristiane Gomes Da Silva",
    "Danillo Andrade De Sousa",
    "Davi Aparecido Dos Reis Pereira",
    "Edson Ricardo Gonzaga Dos Reis",
    "Fabiano Dos Santos Silva",
    "Fabio De Oliveira Almeida",
    "Francisco De Assis Siqueira Dos Santos",
    "Gabriela Guesser Nazario",
    "Gabriela Guimaraes Ramos Bueno",
    "Genival Ribeiro Garcia",
    "Guilherme Cavalcante Teodoro",
    "Jean Marcel Gonçalves Pernas",
    "Jm Solucoes De Energia Limpa",
    "Jonny Martins Da Silva",
    "Jorge Luis Komiya Yokota",
    "Josiane Cristina Tenorio",
    "Juliano Nunes Gonçalves",
    "Kelsen De Novaes Queiroz",
    "Laecio Oliveira Cardoso",
    "Loremar Santa Catarina",
    "Manoel Marcos Meireles Silva",
    "Marcos Antonio Bertotti",
    "Marcos Jose De Matos",
    "Maxuel Jesuino Zauer",
    "Maycon Elias Ferreira Basilio",
    "Micael Da Cunha Rebhein",
    "Michael Roberto Padilha Ennes",
    "Raphael Rodrigues Martins De Almeida",
    "Ricardo Becker",
    "Ronyclecio Vital Leite",
    "Rubineia Stefania Da Silva",
    "Sabrina Taiane Santos De Jesus",
    "Sandro Rodrigo Libardoni",
    "Scheila Rosa De Oliveira",
    "Soraia Candida Dos Santos Silva",
    "Talita Vitoria Caiaffa Kreicher",
    "Valdriana Lima De Brito",
    "Walberth Heber Queiroz Mendes",
    "Waldiney Dias Bastos",
    "Wilson Goncalves Correa"
  ];

  /* ============================================================
     OS TRÊS NÍVEIS
     ------------------------------------------------------------
     `lvl` é o índice na escada de qualificações (Sênior=0 …
     Acionista=4) — o MESMO índice que o resto do site usa para
     pedir galeria. Não é a posição neste array. Isso já quebrou
     antes aqui (ver o comentário do EVENTS no index.html): usar a
     posição fazia o pin do Gestor abrir a galeria do Executivo.

     CORES: `luz` é a cor do pin daquele nível na escada (o array
     DATA do index), para a peça parecer daquele nível e não de
     outro site. `cor` é a versão estrutural, mais escura — é o
     papel que o #1B8ACF fazia no pacote original, onde `luz` era
     o #28C2FF. `fundo` é o terceiro tom, usado nos cards de
     empresa e na luz do teto.

     `plural` é só o rótulo do TOTAL na tela de título ("313
     SÊNIORS"). Existe porque o plural de cada um é diferente e
     nenhuma regra automática acerta os três — "SÊNIOR" + "S" dá
     certo, "GESTOR" + "S" não. O NÚMERO nunca é escrito à mão:
     sai de `nomes.length`, então trocar a lista de nomes já
     atualiza o total e não há como os dois discordarem.
     ============================================================ */
  var NIVEIS = {
    0: { lvl:0, nome:"SÊNIOR",    plural:"SÊNIORS",    cor:"#12874A", luz:"#22C55E", fundo:"#065F46",
         pin:"assets/pins/grad-senior.webp",    video:"assets/video/rec-energia-senior.mp4",    nomes:SENIORS },
    1: { lvl:1, nome:"GESTOR",    plural:"GESTORES",   cor:"#C2560A", luz:"#F97316", fundo:"#7C2D12",
         pin:"assets/pins/grad-gestor.webp",    video:"assets/video/rec-energia-gestor.mp4",    nomes:GESTORES },
    2: { lvl:2, nome:"EXECUTIVO", plural:"EXECUTIVOS", cor:"#1B8ACF", luz:"#38BDF8", fundo:"#0C4A6E",
         pin:"assets/pins/grad-executivo.webp", video:"assets/video/rec-energia-executivo.mp4", nomes:EXECUTIVOS },
    /* ============================================================
       DIRETOR E ACIONISTA: MESMA PECA, CONTEUDO EM IMAGEM (2026-08-10)
       ------------------------------------------------------------
       Pedido do dono: "as animacoes, quando eu clicar no video, deve ter a sequencia
       IDENTICA dos seniors e executivos; adicione essas animacoes tanto no Diretores
       quanto no Acionista."
       Por isso eles entraram AQUI, na peca de verdade, e nao numa peca a parte: o 1o ato
       (pin voando, data, RECONHECIMENTO, nome do nivel, total, varredura de luz) e
       exatamente o mesmo codigo, entao e literalmente a mesma sequencia — nao uma
       imitacao. O que muda e so o 2o ato: onde os outros tres montam o mural de cards,
       estes dois mostram UMA ARTE POR PASSO.
       ⚠ Um nivel tem `nomes` OU `imagens`, nunca os dois. E esse campo que o resto do
       arquivo consulta para saber qual 2o ato montar (ehImagem()).
       As artes NAO incluem capa: a capa do deck era exatamente o que o 1o ato desenha
       animado, e manter as duas mostraria o mesmo titulo duas vezes seguidas.
       Cores e pin iguais aos do DATA da escada no index.html (Diretor prata, Acionista
       dourado). Os videos de energia foram assados com ffmpeg a partir do bg-prod, como os
       outros tres: hue=s=0 para o prata (dessaturar, porque prata nao e matiz) e
       hue=h=-63 para o dourado (de 108 para 45 graus).
       ============================================================ */
    3: { lvl:3, nome:"DIRETOR",   plural:"DIRETORES",  cor:"#94A3B8", luz:"#CBD5E1", fundo:"#475569",
         pin:"assets/pins/grad-diretor.webp",   video:"assets/video/rec-energia-diretor.mp4",
         imagens:["Slide101","Slide102","Slide103","Slide104","Slide105","Slide106","Slide107",
                  "Slide108","Slide109","Slide110","Slide111","Slide112","Slide113","Slide114"],
         /* ============================================================
            TELA FINAL — fora de `imagens` DE PROPOSITO (2026-08-10)
            ------------------------------------------------------------
            Pedido do dono: "insira essa imagem como a ultima e simule um play ilustrativo
            e depois em outro click ele sai e continua normal para o grafico".
            Ela e um campo separado e NAO um 15o item de `imagens` porque `imagens.length`
            e o que o 1o ato mostra no total ("14 DIRETORES"). Enfiada na lista, o titulo
            passaria a anunciar 15 diretores — e o 15o e uma tela de video, nao uma pessoa.
            E a armadilha que o CLAUDE.md chama de "numero visivel tem gemeo escondido",
            so que ao contrario: aqui o gemeo seria o total mentindo por causa de um item
            que nao conta. Com o campo separado, `quantos()` continua certo por construcao,
            sem ninguem ter que lembrar de subtrair 1.
            `play:true` liga o play ilustrativo por cima da moldura de video da arte.
            A moldura foi MEDIDA no arquivo, nao estimada — ver PLAY_CAIXA.
            ============================================================ */
         telaFinal:{ arquivo:"SlideUltimo_telaVideoComPayIlustrativo", play:true } },
    4: { lvl:4, nome:"ACIONISTA", plural:"ACIONISTAS", cor:"#B8860B", luz:"#F5C542", fundo:"#92600A",
         pin:"assets/pins/grad-acionista.webp", video:"assets/video/rec-energia-acionista.mp4",
         imagens:["Slide116"] }
  };

  /* pasta e extensao das artes dos niveis em imagem, um lugar so */
  var IMG_BASE = "assets/img/reconhecimento/", IMG_EXT = ".jpeg";
  var IMG_PASTA = { 3:"diretor", 4:"acionista" };
  function ehImagem(n){ return !!(n && n.imagens && n.imagens.length); }
  /* quantas TELAS o 2o ato tem = os reconhecidos + a tela final, quando existe.
     Separado de quantos() de proposito: um conta telas, o outro conta gente. */
  function qtdArtes(n){ return ehImagem(n) ? n.imagens.length + (n.telaFinal ? 1 : 0) : 0; }
  function ehTelaFinal(n, i){ return !!(n && n.telaFinal && ehImagem(n) && i === n.imagens.length); }
  function caminhoArte(n, i){
    if(!ehImagem(n) || i < 0 || i >= qtdArtes(n)) return "";
    var arq = ehTelaFinal(n, i) ? n.telaFinal.arquivo : n.imagens[i];
    return IMG_BASE + IMG_PASTA[n.lvl] + "/" + arq + IMG_EXT;
  }
  /* a arte desta pagina pede o play ilustrativo? */
  function temPlay(n, i){ return ehTelaFinal(n, i) && !!n.telaFinal.play; }
  /* ============================================================
     A MOLDURA DE VIDEO DENTRO DA ARTE — MEDIDA, NAO ESTIMADA
     ------------------------------------------------------------
     A arte da tela final tem uma moldura vertical (9:16) a esquerda com uma pessoa
     dentro; e SOBRE ELA que o play tem de cair. Medido no proprio arquivo em
     2026-08-10, decodificando o jpeg e procurando onde o fundo escuro termina:
     moldura em x 100..663, y 48..1031 de 1920x1080 — 563x983, proporcao 0,57
     (9:16 = 0,5625, confere). Dai os quatro numeros abaixo, em fracao da arte.
     Se a arte for reexportada com a moldura em outro lugar, estes numeros mudam —
     e o jeito de descobrir os novos e medir de novo, nao olhar e chutar.
     ============================================================ */
  var PLAY_CAIXA = { x:5.21, y:4.44, w:29.32, h:91.02 };
  /* quantos reconhecidos o nivel tem — e o que o total do 1o ato mostra.
     ⚠ Conta PESSOAS, nao telas: a tela final nao entra aqui. */
  function quantos(n){ return ehImagem(n) ? n.imagens.length : (n.nomes ? n.nomes.length : 0); }
  /* mês e ano do reconhecimento, um lugar só */
  var MES = "Julho", ANO = "2026";

  /* lido pelo js/presentation-mode.js para criar as paradas. Publicado aqui
     porque é aqui que a verdade mora — mesma decisão do GRAD_GAL_LEVELS. */
  /* Quem consome esta lista (o rotulo do botao da galeria, os dois cliques do grafico —
     barra no desktop e coluna no mobile) nao precisa saber qual dos dois 2os atos e: a peca
     e a mesma e a API e a mesma.

     ⚠ O SENIOR (nivel 0) SAIU EM 2026-08-12. Pedido do dono, com dois prints da peca dele
     em anexo: *"o senior da qualificacao nao deve ter isso, pode ocultar nao tem nenhuma
     dessas telas. popup etc.. os outros permanecem do jeito que esta"*.

     POR QUE TIRAR DAQUI RESOLVE TUDO, e nao ha um segundo lugar para mexer: o Senior e o
     unico nivel SEM GALERIA, e por isso os dois cliques do grafico caem num caminho
     especial — "sem dot" deixou de significar "nada acontece" em 2026-08-09 e passou a
     consultar esta lista para abrir a animacao direto (ver index.html, linhas do
     `abreRecGlobal`). Tirando o 0 daqui, esse caminho nao encontra o nivel e o clique volta
     a nao fazer nada, que e exatamente o pedido. Os outros quatro seguem intactos.

     ⚠ CONSEQUENCIA ACEITA: a barra do Senior fica MUDA de novo (era assim ate 2026-08-09).
     Nao e defeito — e o pedido. Se um dia ele quiser de volta, e devolver o 0 a esta lista
     e nada mais.

     ⚠ OS 313 NOMES DO ARRAY `SENIORS` FICAM NO ARQUIVO, de proposito. Nao viraram peso
     morto por acidente: sao o dado, e apagar para "limpar" custaria o retrabalho de
     redigita-los se ele mudar de ideia. A peca ja sabe monta-los. */
  window.GRAD_REC_LEVELS = [1,2,3,4];

  /* ============================================================
     CLASSIFICADOR — empresa / feminina / masculino
     Ordem das regras importa: token de empresa -> sigla -> lista
     exata -> sufixo -> terminação em "a" -> padrão.
     A lista exata vem ANTES do sufixo porque senão Guilherme,
     Alexandre, André e Jorge cairiam na regra de "-e" feminino.
     Aferido pelo autor do pacote em 30 nomes reais + 20 fora da
     lista: 50/50.
     ============================================================ */
  function semAcento(s){ return s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }

  function conjunto(str){ var o={}, a=str.split(" "); for(var i=0;i<a.length;i++) o[a[i]]=1; return o; }

  var TOKEN_EMPRESA = conjunto(
    "solucoes solucao energia energias limpa ltda me epp eireli mei comercio servicos servico "+
    "consultoria tecnologia engenharia distribuidora representacoes empreendimentos transportes "+
    "construtora holding grupo corp telecom solar ambiental industria industrias materiais "+
    "produtos sistemas assessoria participacoes agropecuaria agro farma center express network "+
    "digital invest investimentos negocios");

  var FEM = conjunto(
    "alexsandra aline angela cristiane gabriela josiane ana adriana amanda andreia bruna beatriz "+
    "camila carla carolina cintia claudia daniela debora denise edna elaine eliane elisangela "+
    "erica fabiana fernanda flavia gisele helena ingrid irene isabel isabela ivone jaqueline "+
    "jessica joana joelma juliana karen katia kelly larissa laura leticia lidia liliane lucia "+
    "luciana luiza marcia margarida maria mariana marilene marlene michele michelle mirian monica "+
    "nadia natalia neide nilza patricia paula priscila rafaela raquel regina renata rita roberta "+
    "rosa rosana rosangela rose roseli sandra sara sheila silvia simone solange sonia sueli tania "+
    "tatiana teresa thais valeria vania vera veronica viviane zilda");

  var MASC = conjunto(
    "antonio carlos charleanderson danillo davi edson fabiano fabio francisco genival guilherme "+
    "jean jonny jorge juliano kelsen laecio loremar manoel marcos adilson ademir alexandre andre "+
    "anderson bruno caio cesar cristiano daniel diego edilson eduardo elias emerson everton "+
    "felipe fernando flavio gabriel geraldo gilberto gustavo heitor henrique hugo igor isaias "+
    "israel ivan joao jonas jose josue leandro leonardo lucas luis luiz marcelo mario matheus "+
    "mauricio milton moises murilo nelson nicolas otavio paulo pedro rafael renato ricardo "+
    "roberto rodrigo rogerio ronaldo samuel sergio silas thiago tiago tobias valdir valter "+
    "victor vinicius vitor wagner walter wellington wesley willian william wilson");

  /* terminam em "a" e são masculinos */
  var MASC_EM_A = conjunto("luca noa josua joshua nicola sasha aquila isaia jeremia elia zacaria ezequia");
  /* sufixos femininos que NÃO terminam em "a" — do mais longo ao mais curto */
  var SUF_FEM = ["iane","elle","ette","ine","ane","one","ete","ice","ide"];

  function classificar(nomeCompleto){
    var tokens = semAcento(nomeCompleto).split(/\s+/).filter(Boolean);
    for(var i=0;i<tokens.length;i++) if(TOKEN_EMPRESA[tokens[i]]) return "empresa";
    if(tokens[0] && tokens[0].length<=2) return "empresa";           /* sigla: "Jm ..." */
    var p = tokens[0] || "";
    if(FEM[p])  return "feminina";
    if(MASC[p]) return "masculino";
    for(var j=0;j<SUF_FEM.length;j++) if(p.slice(-SUF_FEM[j].length)===SUF_FEM[j]) return "feminina";
    if(p.slice(-1)==="a" && !MASC_EM_A[p]) return "feminina";
    return "masculino";
  }

  /* ============================================================
     CORPO POR NOME — agora MEDIDO, não estimado
     ------------------------------------------------------------
     Até 2026-08-10 a conta usava "largura média do caractere =
     0,52 do corpo", uma ESTIMATIVA do autor do pacote — e o
     próprio comentário dele dizia que o certo seria medir com
     canvas.measureText. Passou a valer quando o dono pediu no
     máximo 6 páginas: com 54 nomes por página a coluna cai para
     220px, a folga acaba, e um erro de 5% na largura do caractere
     deixa de ser detalhe e passa a estourar o card.
     Agora a largura de cada nome é medida na fonte de verdade.
     O `M` mede uma vez a 100px e escala: largura é linear no
     corpo da fonte, então uma medição serve para qualquer tamanho
     — 475 nomes custam 475 measureText, não 475 x tentativas.

     ⚠ A PILHA DE FONTES ABAIXO ESPELHA O CSS (.rec-overlay, em
     css/reconhecimento.css). Se ela mudar lá, mude aqui: medir com
     uma fonte e desenhar com outra é pior que estimar, porque o
     erro fica invisível até um nome específico estourar.
     ============================================================ */
  var FAMILIA = "'Inter Display','Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif";
  var REF = 100;                 /* corpo de referência da medição */
  var _ctx = null;
  function larguraRef(txt){
    if(!_ctx){
      var cv = document.createElement("canvas");
      _ctx = cv.getContext("2d");
    }
    /* peso 700 é o do .rec-rotulo */
    _ctx.font = "700 " + REF + "px " + FAMILIA;
    return _ctx.measureText(txt).width;
  }

  /* `uteis` = largura de texto disponível dentro do card, em px.
     `cap1`/`cap2` = teto do corpo em 1 e em 2 linhas; `min1` = abaixo disto uma linha
     lê pior que duas, então quebra. Os três vêm do arranjo (ver ARRANJO), porque o card
     de 4 colunas e o de 6 não suportam o mesmo tamanho de letra. */
  function corpo(nome, uteis, cap1, cap2, min1){
    var U = uteis || 230;
    if(!U) return cap1 || 18;
    var w = larguraRef(nome);
    if(!w) return cap1 || 18;
    var fs1 = U * REF / w;                       /* corpo que faz o nome caber em UMA linha */
    if(fs1 >= (min1 || 17)) return Math.min(cap1 || 21, Math.round(fs1*10)/10);
    /* duas linhas: o dobro da largura, com 8% de desconto porque a quebra cai em espaço
       de palavra e nunca exatamente na metade */
    var fs2 = (2 * U * 0.92) * REF / w;
    return Math.max(11, Math.min(cap2 || 18, Math.round(fs2*10)/10));
  }

  function montarCartoes(entradas, uteis, cap1, cap2, min1){
    return entradas.map(function(e){
      var nome = (typeof e === "string") ? e : e.nome;
      var tipo = (typeof e === "string") ? classificar(nome) : (e.tipo || classificar(nome));
      return { nome:nome, tipo:tipo, corpo:corpo(nome, uteis, cap1, cap2, min1) };
    });
  }

  /* ============================================================
     NO MÁXIMO 6 PÁGINAS (pedido do dono, 2026-08-10)
     ------------------------------------------------------------
     "essa parte dos nomes, pode colocar no máximo 6 slides,
     adapte para no máximo 6."
     O Sênior tinha 14 páginas de 24 nomes. Com o teto de 6 são
     ceil(313/6) = 53 por página, e a `paginar()` reparte em 6 de
     53. Gestor (114) e Executivo (48) já cabiam em 6 com 24 por
     página, então para eles nada muda.
     ============================================================ */
  var MAX_PAGINAS = 6;

  /* ============================================================
     O ARRANJO SE ESCOLHE SOZINHO
     ------------------------------------------------------------
     Antes o número de colunas era 4, escrito à mão. Não serve mais:
     53 nomes por página em 4 colunas dariam 14 linhas, e o card
     ficaria com 30px de altura — menos que UMA linha de texto.
     Mais colunas = menos linhas = card mais ALTO. Então a regra é:
     ande de 4 para 7 colunas e pare na primeira que dá altura de
     card suficiente para duas linhas de nome. Medido no palco de
     1920x1080, mural de 1378x624, vão de 12px entre colunas e 16px
     entre linhas:
       53/pág -> 4col=14lin=30px ✗ · 5col=11lin=42px ✗ · 6col=9lin=55px ✓
       24/pág -> 4col= 6lin=91px ✓  (Gestor e Executivo seguem em 4)
     A partir de 6 colunas o card entra em modo DENSO (classe
     `rec-denso`): padding e ícone menores, e teto de corpo menor.
     Sem isso a soma padding + 2 linhas de 18px passaria dos 55px.
     ============================================================ */
  var MURAL_W = 1378, MURAL_H = 624, VAO_COL = 12, VAO_LIN = 16;
  var ALT_MIN_CARD = 50;         /* 2 linhas de 15px (35,4) + padding denso (18) = 53,4 */

  function arranjo(porPagina){
    for(var c=4;c<=7;c++){
      var lin = Math.ceil(porPagina/c);
      var altura = (MURAL_H - (lin-1)*VAO_LIN)/lin;
      if(altura >= ALT_MIN_CARD || c===7) return medidasDoArranjo(c, lin, altura);
    }
    return medidasDoArranjo(4, Math.ceil(porPagina/4), 0);
  }

  function medidasDoArranjo(colunas, linhas, altura){
    var colW = (MURAL_W - (colunas-1)*VAO_COL)/colunas;
    var denso = colunas >= 6;
    /* úteis = coluna − padding horizontal − ícone − vão entre ícone e nome.
       Os três números têm de bater com o CSS (.rec-miolo / .rec-icone, e as versões
       `.rec-denso` deles). Mexeu num, mexa no outro. */
    var padH = denso ? 22 : 28, icone = denso ? 26 : 32, vao = denso ? 9 : 12;
    return {
      colunas: colunas, linhas: linhas, altura: Math.round(altura*10)/10,
      denso: denso,
      uteis: Math.round((colW - padH - icone - vao)*10)/10,
      cap1: denso ? 16 : 21,
      cap2: denso ? 15 : 18,
      min1: denso ? 14 : 17
    };
  }

  /* paginação: teto por página, depois reparte igual para nenhuma página ficar
     com sobra feia. 30 nomes, teto 20 -> 2 páginas de 15 (5x3), zero células vazias.
     O `Math.max` com o teto de 6 páginas é o que garante o pedido do dono sem mexer no
     teto "de conforto" de cada modo: no desktop ele é 24, no celular vem da altura do
     aparelho, e nos dois casos o número só SOBE se for preciso para caber em 6. */
  function paginar(total, teto, colunas, maxPaginas){
    var t = teto;
    if(maxPaginas) t = Math.max(t, Math.ceil(total/maxPaginas));
    var paginas = Math.max(1, Math.ceil(total/t));
    var porPagina = Math.ceil(total/paginas);
    return { paginas:paginas, porPagina:porPagina, linhas:Math.ceil(porPagina/colunas), teto:t };
  }

  /* ============================================================
     CURVATURA DO MURAL — o passo ENCOLHE quando entram colunas
     ------------------------------------------------------------
     Passo 11°, raio 1450 -> tz 0 / -26,6 / -105,6. O passo é 11° e não 20° porque a
     escala aparente da coluna externa não pode cair abaixo de 0,9: sob 0,9 a
     rasterização do texto girado começa a degradar (nota do autor do pacote).
     Com passo fixo essa regra se rompe sozinha ao acrescentar coluna: a externa fica em
     (colunas-1)/2 x 11°, ou seja ±16,5° com 4 colunas (cos 0,959) mas ±27,5° com 6
     (cos 0,887) — já abaixo do limite, e justamente no arranjo em que a letra é a menor
     de todas. Então o passo passou a ser o que mantém a coluna externa em 24°
     (cos 0,914), nunca mais que 11°:
       4 colunas -> min(11, 24/1,5=16) = 11°  (idêntico ao de antes: Gestor e Executivo
                                               não mudam de desenho)
       6 colunas -> min(11, 24/2,5=9,6) = 9,6°
     ============================================================ */
  var RAIO = 1450, PASSO_ANG = 11, ANG_MAX = 24;
  function curvatura(colunas){
    var out=[];
    var passo = (colunas > 1) ? Math.min(PASSO_ANG, ANG_MAX / ((colunas-1)/2)) : 0;
    for(var c=0;c<colunas;c++){
      var ry = (c - (colunas-1)/2) * passo;
      out.push({ ry:ry, tz:-(RAIO*(1-Math.cos(ry*Math.PI/180))) });
    }
    return out;
  }

  /* PRNG com semente: o padrão da parede é o mesmo em toda montagem. */
  function semente(s0){ var x = s0>>>0; return function(){ x = (x*1664525 + 1013904223)>>>0; return x/4294967296; }; }

  /* ---------- cor: hex -> "r,g,b" para montar os rgba() dos brilhos ---------- */
  function rgb(hex){
    var h = hex.replace("#","");
    if(h.length===3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return parseInt(h.slice(0,2),16)+","+parseInt(h.slice(2,4),16)+","+parseInt(h.slice(4,6),16);
  }

  /* Todos os rgba() do CSS saem daqui. As opacidades são as do pacote original —
     só a cor base mudou. Manter em um lugar só evita o que já aconteceu neste
     projeto com números repetidos: mudar um e esquecer os outros. */
  function pintar(el, n){
    var C = rgb(n.cor), L = rgb(n.luz), F = rgb(n.fundo);
    function v(k,val){ el.style.setProperty(k, val); }
    v("--rec-cor", n.cor); v("--rec-luz", n.luz); v("--rec-fundo", n.fundo);
    v("--rec-grade-cor","rgba("+C+",.13)");
    v("--rec-halo1","rgba("+C+",.20)");   v("--rec-halo2","rgba("+L+",.07)");
    v("--rec-halo3","rgba("+L+",.18)");   v("--rec-halo4","rgba("+C+",.05)");
    v("--rec-glow-m","rgba("+L+",.5)");   v("--rec-glow-f","rgba("+C+",.46)");
    v("--rec-glow-r","rgba("+L+",.55)");  v("--rec-glow-h","rgba("+L+",.16)");
    v("--rec-glow-t","rgba("+L+",.85)");  v("--rec-glow-p","rgba("+L+",.8)");
    v("--rec-glow-sm","rgba("+C+",.6)");  v("--rec-glow-hover","rgba("+L+",.45)");
    v("--rec-glow-b","rgba("+L+",.75)");  v("--rec-glow-b2","rgba("+C+",.42)");
    v("--rec-glow-bt","rgba("+C+",.32)");
    v("--rec-sombra1","rgba("+C+",.92)");
    /* grade do chão e do teto mais fraca desde 2026-08-09 (era .17/.11): fazia parte do
       "não tá legal" da parede e do chão que o dono apontou */
    v("--rec-piso","rgba("+C+",.10)");    v("--rec-piso2","rgba("+C+",.06)");
    v("--rec-glow-lz1","rgba("+C+",.72)");v("--rec-glow-lz2","rgba("+L+",.78)");
    v("--rec-glow-lz3","rgba("+F+",.70)");
    v("--rec-card-bg","rgba("+C+",.28)"); v("--rec-card-glow","rgba("+C+",.22)");
    v("--rec-card-bg-f","rgba("+L+",.42)");v("--rec-card-glow-f","rgba("+L+",.28)");
    v("--rec-card-bg-e","rgba("+F+",.62)");v("--rec-card-glow-e","rgba("+C+",.34)");
    v("--rec-anel1","rgba("+C+",.42)");   v("--rec-miolo-luz","rgba("+L+",.24)");
    v("--rec-icone-bg","rgba("+C+",.20)");v("--rec-icone-bd","rgba("+L+",.38)");
    v("--rec-icone-bg-f","rgba("+L+",.22)");v("--rec-icone-bd-f","rgba("+L+",.6)");
    v("--rec-icone-bg-e","rgba("+C+",.3)");v("--rec-icone-bd-e","rgba("+C+",.7)");
    v("--rec-rf","rgba("+C+",.5)");       v("--rec-rf-glow","rgba("+L+",.5)");
    v("--rec-rf-f","rgba("+L+",.7)");     v("--rec-rf-e","rgba("+F+",.8)");
    v("--rec-ruido1","rgba("+L+",.16)");  v("--rec-ruido2","rgba("+C+",.16)");
    v("--rec-borda","rgba("+L+",.34)");   v("--rec-tint","rgba("+L+",.12)");
  }

  /* ---------- helpers de DOM ---------- */
  function el(tag, cls, html){
    var n = document.createElement(tag);
    if(cls) n.className = cls;
    if(html != null) n.innerHTML = html;
    return n;
  }
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ============================================================
     O PIN DO NÍVEL
     ------------------------------------------------------------
     Aqui havia um SELO DESENHADO em SVG pelo autor do pacote. Ele
     mesmo avisou no README que não era a arte oficial e que era
     "o item que mais separa o resultado de premium hoje". O dono
     viu e pediu o pin de verdade (2026-08-09): "retire esse pin
     como exemplo e coloque os pins exatamente de acordo com cada
     um". Agora usa `assets/pins/grad-<nivel>.webp` — os MESMOS
     arquivos que a escada de qualificações, a galeria de eventos e
     o cartão do mobile já usam, então o pin da peça e o pin do
     gráfico nunca podem divergir.

     420x420, WebP lossless (lossy destruiria o alpha — DESIGN.md).
     Largura e altura declaradas: sem elas, imagem cujo container
     tira a altura pode nascer com caixa zero e nunca carregar. Já
     apagou o fundo de moedas dos planos neste projeto.

     A vida do selo antigo (o traço de luz correndo no contorno e
     os raios pulsando) virou brilho e flutuação em volta do pin,
     no CSS — o pin é uma imagem, não dá para animar o traço dele.
     ============================================================ */
  function pinDoNivel(cls, n){
    var d = el("div", cls);
    var img = document.createElement("img");
    img.src = n.pin;
    img.alt = "Pin " + n.nome + " iGreen";
    img.width = 420; img.height = 420;
    img.decoding = "async";
    d.appendChild(img);
    return d;
  }

  /* O SELO DESENHADO DO PACOTE FOI REMOVIDO (2026-08-09), nao apenas desativado.
     Este projeto costuma comentar em vez de apagar, mas aqui apagar e o certo: o selo
     dependia das classes .rec-tracador/.rec-tracador2 do CSS, que sairam junto, entao
     um bloco comentado seria uma promessa falsa de "e so descomentar". O original esta
     no pacote que o dono mandou (Animacao_Pins_Reconhecimento.zip), no arquivo
     ReconhecimentoExecutivo.tsx, componente Selo. */

  /* ---------- parede de raios ----------
     Medido no mp4: deriva dx=0 dy=0, correlação 0,15 entre ladrilhos. Por isso a
     grade é PARADA e cada raio pulsa com período e atraso próprios. */
  function paredeRaios(largura, altura, s0, uid){
    var rnd = semente(s0);
    var cols = Math.ceil(largura/PASSO_X)+1, lins = Math.ceil(altura/PASSO_Y)+1;
    var g = "";
    for(var l=0;l<lins;l++){
      for(var c=0;c<cols;c++){
        var x = c*PASSO_X + (l%2 ? PASSO_X/2 : 0) - PASSO_X/2;
        var y = l*PASSO_Y - PASSO_Y/2;
        var t = (PER_MIN + rnd()*(PER_MAX-PER_MIN)).toFixed(2);
        var d = (-rnd()*PER_MAX).toFixed(2);
        var e = (0.82 + rnd()*0.3).toFixed(2);
        g += '<g class="rec-ray" style="--t:'+t+'s;--d:'+d+'s" transform="translate('+x+','+y+') scale('+e+')">'
           +   '<use href="#raio-'+uid+'" class="rec-raio-halo"/>'
           +   '<use href="#raio-'+uid+'" class="rec-raio-nucleo"/>'
           + '</g>';
      }
    }
    return '<svg viewBox="0 0 '+largura+' '+altura+'" preserveAspectRatio="xMidYMid slice">'
         + '<defs><path id="raio-'+uid+'" d="M62 8 H34 L24 60 H44 L36 104 L78 46 H54 Z"/></defs>'
         + g + '</svg>';
  }

  /* letra a letra, cada uma com seu atraso via --i */
  function letras(texto){
    var s = '<span class="rec-sr">'+texto+'</span>';
    for(var i=0;i<texto.length;i++){
      /* espaco vira \u00A0: um span com espaco normal e colapsado pelo HTML e a
         palavra seguinte cola na anterior. Escrito como escape de proposito —
         um nbsp literal no fonte e invisivel e some numa edicao distraida. */
      var ch = texto[i]===" " ? "\u00A0" : texto[i];
      s += '<span class="rec-ltr" style="--i:'+i+'" aria-hidden="true">'+ch+'</span>';
    }
    return s;
  }

  var ICONE = { masculino:"ic-m", feminina:"ic-f", empresa:"ic-e" };

  function sprite(uid){
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
      + '<symbol id="ic-m-'+uid+'" viewBox="0 0 24 24">'
      +   '<path fill="currentColor" d="M12 3.4a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4zM5.2 20.6c0-3.8 3-6.4 6.8-6.4s6.8 2.6 6.8 6.4a.9.9 0 0 1-.9.9H6.1a.9.9 0 0 1-.9-.9z"/>'
      +   '<path fill="currentColor" d="M7.7 6.9C7.7 4.1 9.6 2.2 12 2.2s4.3 1.9 4.3 4.7l-1.5-.6c-1.9.7-3.7.7-5.6 0l-1.5.6z"/></symbol>'
      + '<symbol id="ic-f-'+uid+'" viewBox="0 0 24 24">'
      +   '<path fill="currentColor" d="M12 3.6a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zM5.4 20.6c0-3.7 3-6.3 6.6-6.3s6.6 2.6 6.6 6.3a.9.9 0 0 1-.9.9H6.3a.9.9 0 0 1-.9-.9z"/>'
      +   '<path fill="currentColor" d="M6.6 11.4c-.5-1.3-.6-2.7-.3-4C6.9 4.3 9.2 2.3 12 2.3s5.1 2 5.7 5.1c.3 1.3.2 2.7-.3 4l-1.6-.7c.5-1.4.4-2.5-.3-3.4-2.2 1-4.8 1-7 0-.7.9-.8 2-.3 3.4l-1.6.7z"/></symbol>'
      + '<symbol id="ic-e-'+uid+'" viewBox="0 0 24 24">'
      +   '<path fill="currentColor" d="M3.6 21.4V6.2c0-.5.4-.9.9-.9h7.2c.5 0 .9.4.9.9v3.1h6c.5 0 .9.4.9.9v11.2H3.6zm2.7-2.6h2.2v-2.2H6.3v2.2zm0-4.3h2.2v-2.2H6.3v2.2zm0-4.4h2.2V7.9H6.3v2.2zm4.4 8.7h2.2v-2.2h-2.2v2.2zm0-4.3h2.2v-2.2h-2.2v2.2zm0-4.4h2.2V7.9h-2.2v2.2zm4.4 8.7h3.5v-2.2h-3.5v2.2zm0-4.3h3.5v-2.2h-3.5v2.2z"/></symbol>'
      + '</defs></svg>';
  }

  /* ============================================================
     ESTADO
     ============================================================ */
  var raiz=null, tela=null, nivelAtual=null, aberto=false, uidN=0;
  var cartoes=[], paginas=1, porPagina=15, linhas=3, colunas=5, curva=null;
  var pagina=0, fase="parado", timers=[], smoother=null, colunaUnica=false;
  var arr=null;      /* arranjo escolhido (colunas, linhas, largura útil, tetos de corpo) */
  var modoImg=false; /* 2o ato em ARTE (Diretor, Acionista) em vez de mural de nomes */
  var travei=false;   /* fui EU quem travou o scroll? ver a nota de posse no abre() */
  var ato=1;          /* 1 = título, 2 = mural de nomes. Só muda por ação de quem apresenta. */
  var abertoEm=0;     /* instante da montagem — usado pela janela morta do clique fantasma */

  function agendar(fn, ms){ timers.push(setTimeout(fn, ms)); }
  function limpar(){ timers.forEach(clearTimeout); timers = []; }

  /* Portão de hardware: hardwareConcurrency <= 4 ou ponteiro grosso.
     Os 30 gradientes cônicos girando e os 84 raios das paredes são a conta que
     pesa. Aditivo — em máquina boa não muda nada. */
  function ehLeve(){
    var n = navigator.hardwareConcurrency;
    return (typeof n === "number" ? n : 4) <= 4 || matchMedia("(pointer:coarse)").matches;
  }
  /* em tela pequena o mural vira lista de uma coluna (ver o fim do CSS) */
  function ehEstreito(){ return matchMedia("(max-width:1024px), (orientation:portrait)").matches; }

  /* ============================================================
     QUANTOS NOMES CABEM NUMA PÁGINA DE CELULAR
     ------------------------------------------------------------
     Era um número fixo (12) e isso escondia gente: medido num
     390x844, a lista tinha 886px de conteúdo numa área visível de
     666px — 220px, uns 3 nomes por página, ficavam abaixo da dobra.
     Numa apresentação isso é pior que parece: quem passa a página
     acha que ela acabou, e aqueles nomes nunca aparecem.
     Agora a conta vem do aparelho. Os números batem com o CSS do
     retrato: o mural começa em 92px do topo e termina 86px do fim,
     cada card tem 64px de altura mínima e o vão entre eles é 10px.
     Mexeu num, mexa no outro.
     O piso de 4 é para telas muito baixas (teclado aberto, janela
     apertada) não gerarem uma página por nome.
     ============================================================ */
  function tetoDoCelular(){
    var TOPO = 92, BASE = 86, CARD = 64, VAO = 10;
    var util = Math.max(0, innerHeight - TOPO - BASE);
    return Math.max(4, Math.floor((util + VAO) / (CARD + VAO)));
  }

  /* ============================================================
     MONTAGEM
     ============================================================ */
  function montaColunas(espelho, uid){
    var frag = document.createDocumentFragment();
    var fatia = cartoes.slice(pagina*porPagina, pagina*porPagina + porPagina);
    var inicial = (fase === "parado" && pagina === 0);

    /* COLUNA ÚNICA (celular): sem curvatura, sem espelho. A curvatura depende de a
       coluna existir; sem as 5 colunas ela não faz sentido, e o reflexo do chão
       também não — a sala 3D está escondida por CSS aqui. */
    if(colunaUnica){
      if(espelho) return frag;
      for(var k=0;k<fatia.length;k++) frag.appendChild(cartao(fatia[k], k, inicial, uid));
      return frag;
    }

    for(var c=0;c<colunas;c++){
      var col = el("div","rec-coluna");
      col.style.setProperty("--ry", curva[c].ry.toFixed(2)+"deg");
      col.style.setProperty("--tz", curva[c].tz.toFixed(1)+"px");
      for(var l=0;l<linhas;l++){
        var i = l*colunas + c;
        var item = fatia[i];
        if(!item){ var vao = el("div","rec-vao"); vao.setAttribute("aria-hidden","true"); col.appendChild(vao); continue; }
        if(espelho){
          var rf = el("div","rec-rf"); rf.setAttribute("data-tipo", item.tipo); col.appendChild(rf); continue;
        }
        col.appendChild(cartao(item, i, inicial, uid));
      }
      frag.appendChild(col);
    }
    return frag;
  }

  function cartao(item, i, inicial, uid){
    var cls = "rec-cartao" + (fase==="saindo" ? " rec-sai" : "") + (fase==="entrando" ? " rec-entra" : "");
    var a = el("article", cls);
    a.setAttribute("data-tipo", item.tipo);
    a.style.setProperty("--i", i);
    a.style.setProperty("--fs", item.corpo+"px");
    if(inicial){
      /* Primeira exibição: os cards entram 1000ms depois da varredura começar — ou seja,
         ~220ms depois de a tela já estar no 2º ato (que acende aos 780ms). Antes este
         número era `var(--rec-tNomes)`, que valia 5600 e era contado desde a abertura da
         peça; com a troca de ato manual a contagem passou a ser desde o gatilho.
         Nas trocas de PÁGINA a entrada é a animação de falha, que tem passo próprio. */
      a.style.setProperty("--rec-base-az", "1000");
      a.style.setProperty("--rec-passo-az", "40");
    }
    a.innerHTML = '<div class="rec-anel" aria-hidden="true"></div>'
      + '<div class="rec-miolo">'
      +   '<span class="rec-icone"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#'+ICONE[item.tipo]+'-'+uid+'"></use></svg></span>'
      +   '<span class="rec-rotulo"></span>'
      + '</div>';
    /* textContent e não innerHTML: nome é dado, não marcação */
    a.querySelector(".rec-rotulo").textContent = item.nome;
    return a;
  }

  /* ============================================================
     O PLAY ILUSTRATIVO
     ------------------------------------------------------------
     Pedido do dono: "simule um play ilustrativo". Ilustrativo e a palavra que manda:
     ⚠ NAO TOCA VIDEO NENHUM. Nao existe elemento de video aqui, nem iframe, nem
     requisicao — e sinalizacao, igual ao cartao .recvid da capa das graduacoes. O que
     faz a tela LER como video tocando sao tres coisas baratas: um botao de play, um anel
     que pulsa saindo dele, e uma barra de progresso que corre uma vez e para cheia.
     A barra e o que simula o "play": sem ela a tela le como PAUSADA.

     POR QUE O NO E RECRIADO a cada vez que a tela final aparece, em vez de so trocar
     uma classe: animacao de CSS nao reinicia sozinha. Reaproveitando o no, voltar uma
     pagina e avancar de novo mostraria a barra ja cheia e o anel no meio do ciclo — a
     segunda passada nao pareceria um play. Recriar tambem garante o contrario, que e o
     que importa para o orcamento deste projeto: fora da tela final o no NAO EXISTE, e
     nao ha anel pulsando atras de arte nenhuma. Custa um elemento pequeno, uma vez.

     O clique NAO e capturado (`pointer-events:none` no CSS): o proximo clique tem de
     seguir para quem sempre o recebeu, senao o "depois em outro click ele sai e continua
     para o grafico" deixaria de funcionar justo nesta tela.
     ============================================================ */
  function montaPlay(caixa, ligado){
    if(!caixa) return;
    var velho = caixa.querySelector(".rec-play");
    if(velho) caixa.removeChild(velho);
    if(!ligado) return;
    var p = el("span", "rec-play");
    p.setAttribute("aria-hidden", "true");
    /* as medidas vem do PLAY_CAIXA e nao do CSS porque elas descrevem O ARQUIVO, nao o
       desenho da pagina: quem reexportar a arte mexe num lugar so. */
    p.style.left = PLAY_CAIXA.x + "%";  p.style.top    = PLAY_CAIXA.y + "%";
    p.style.width = PLAY_CAIXA.w + "%"; p.style.height = PLAY_CAIXA.h + "%";
    p.innerHTML = '<span class="rec-play-anel"></span>'
      + '<span class="rec-play-botao"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
      + '<path d="M8 5v14l11-7z"/></svg></span>'
      + '<span class="rec-play-barra"><i></i></span>';
    caixa.appendChild(p);
  }

  function redesenhaMural(uid){
    var mural = tela.querySelector(".rec-mural");
    var reflexo = tela.querySelector(".rec-reflexo");
    /* ============================================================
       2o ATO EM IMAGEM (Diretor, Acionista)
       ------------------------------------------------------------
       O mural vira uma moldura 16:9 com UMA arte. Trocar o `src` de um <img> que ja
       existe, em vez de recriar o no a cada passo, e de proposito: o navegador mantem o
       quadro anterior desenhado ate o novo estar pronto, e a troca nao pisca. Recriando,
       existe um quadro com a caixa vazia — numa tela de apresentacao isso le como falha.
       O reflexo do chao nao entra: ele espelha COLUNAS DE CARDS, e refletir uma foto
       inteira de cabeca para baixo nao e o mesmo efeito. Sai por CSS (.rec-modoimg).
       width/height declarados: regra do projeto, imagem sempre com dimensao — sao os
       1920x1080 reais das artes.
       ============================================================ */
    if(modoImg){
      var caixa = mural.querySelector(".rec-artebox");
      var im = mural.querySelector(".rec-artefoto");
      if(!im){
        /* A CAIXA existe por um motivo de posicionamento, nao de estilo: o play tem de
           cair sobre a moldura de video DENTRO da arte, e portanto suas porcentagens
           precisam ser da ARTE, nao do mural. No desktop os dois coincidem (o mural e
           1479x832, 16:9 exato, e a arte preenche), mas no retrato o mural e uma caixa
           alta com a arte centrada dentro — ali a porcentagem do mural cairia longe.
           A caixa com `aspect-ratio:16/9` abraca a arte nos dois casos. */
        mural.innerHTML = '<div class="rec-artebox">'
          + '<img class="rec-artefoto" src="" alt="" width="1920" height="1080" decoding="async">'
          + '</div>';
        caixa = mural.querySelector(".rec-artebox");
        im = mural.querySelector(".rec-artefoto");
        /* arte que falta nao pode deixar a tela preta no meio de uma apresentacao:
           avisa no console e segue para a proxima. */
        im.addEventListener("error", function(){
          if(!im.getAttribute("src")) return;
          try{ console.warn("[reconhecimento] arte nao encontrada:", im.getAttribute("src")); }catch(e){}
          if(pagina < paginas-1) irPara(pagina+1); else fecha();
        });
      }
      im.src = caminhoArte(nivelAtual, pagina);
      im.alt = ehTelaFinal(nivelAtual, pagina)
        ? "Tela de encerramento do reconhecimento " + nivelAtual.nome
        : "Reconhecimento " + nivelAtual.nome + " — arte " + (pagina+1) + " de " + paginas;
      montaPlay(caixa, temPlay(nivelAtual, pagina));
      /* pre-carrega a seguinte: uma arte por passo e uma requisicao por clique, e numa
         rede de evento isso aparece. Mesmo padrao do visor do ecossistema. */
      var prox = caminhoArte(nivelAtual, pagina+1);
      if(prox){ var p = new Image(); p.decoding = "async"; p.src = prox; }
      if(reflexo) reflexo.innerHTML = "";
      atualizaPaginador();
      return;
    }
    mural.innerHTML = ""; mural.appendChild(montaColunas(false, uid));
    if(reflexo){ reflexo.innerHTML = ""; reflexo.appendChild(montaColunas(true, uid)); }
    atualizaPaginador();
  }

  function atualizaPaginador(){
    var p = tela.querySelector(".rec-paginador"); if(!p) return;
    var pontos = p.querySelectorAll(".rec-ponto");
    for(var i=0;i<pontos.length;i++) pontos[i].classList.toggle("rec-ponto-on", i===pagina);
    var cont = p.querySelector(".rec-contador");
    if(cont) cont.textContent = String(pagina+1).padStart(2,"0")+" / "+String(paginas).padStart(2,"0");
    var ant = tela.querySelector(".rec-seta-ant"), pro = tela.querySelector(".rec-seta-pro");
    if(ant) ant.setAttribute("aria-disabled", pagina===0 ? "true" : "false");
    if(pro) pro.setAttribute("aria-disabled", pagina>=paginas-1 ? "true" : "false");
  }

  /* troca de página: os nomes somem, os próximos aparecem */
  function irPara(p){
    if(fase !== "parado" || p<0 || p>=paginas || p===pagina) return;
    var uid = tela.getAttribute("data-uid");
    fase = "saindo";
    /* o `rec-fixo` SAI antes do `rec-sai` entrar, e a ordem não é opcional: ele tem dois
       seletores de classe e venceria o `rec-sai`, que tem um — a saída não aconteceria e os
       nomes trocariam de estalo. Ver o comentário do rec-fixo no fim desta função. */
    tela.querySelectorAll(".rec-cartao").forEach(function(c){
      c.classList.remove("rec-fixo"); c.classList.add("rec-sai");
    });
    var ref = tela.querySelector(".rec-reflexo"); if(ref) ref.classList.add("rec-reflexo-falha");
    /* O CHIADO DE TELA SAIU em 2026-08-10, junto com o glitch dos cards ("tire o glitch dos
       nomes quando passa para as páginas, pode ocultar somente"). Ele era a outra metade do
       mesmo efeito: uma camada de tela cheia piscando em 6 degraus de opacidade sobre a
       cena. Sem os cards falhando, o chiado sozinho ficaria sem causa aparente — a tela
       piscaria sem nada acontecer nela.
       A camada .rec-ruido continua no DOM e o CSS dela também: religar é voltar a linha
       abaixo. Mantida em vez de apagada porque é o padrão desta base para efeito
       desativado, e porque o nó custa zero enquanto ninguém acrescenta a classe.
         var ruido = raiz.querySelector(".rec-ruido"); if(ruido){ ruido.classList.remove("rec-ruido-on"); void ruido.offsetWidth; ruido.classList.add("rec-ruido-on"); } */
    agendar(function(){
      pagina = p; fase = "entrando";
      redesenhaMural(uid);
      if(ref) ref.classList.remove("rec-reflexo-falha");
    }, T_SAIDA);
    agendar(function(){
      fase = "parado";
      /* ============================================================
         ⚠ A ENTRADA DOS CARDS RODAVA DUAS VEZES — descoberto medindo, 2026-08-10
         ------------------------------------------------------------
         Aqui só se tirava o `rec-entra`. O problema é que a regra BASE do `.rec-cartao`
         tem `animation:recAzulejo` permanente (é ela que faz a primeira exibição). Trocar
         o animation-name de volta NÃO é neutro: o navegador entende animação diferente e
         COMEÇA UMA NOVA, do zero. Medido no card: logo depois desta linha havia um
         `recAzulejo` com `playState:"running"` e `currentTime:0`, e a regra base começa em
         `opacity:0` — ou seja, a página já montada apagava inteira e os nomes entravam de
         novo, deslizando, escalonados de 40 em 40ms.
         Era isso, e não só o efeito de falha, o "glitch dos nomes quando passa para as
         páginas". O efeito de falha era o que se via primeiro; este segundo pisque vinha
         atrás e existia desde o pacote original.
         O `rec-fixo` corta o ciclo: `animation:none` + `opacity:1`, ou seja, o card fica
         onde está e nenhuma regra pode remontá-lo. Quem o remove é o `irPara()`, no
         começo — e tem de ser antes de pôr o `rec-sai`, por especificidade.
         ============================================================ */
      tela.querySelectorAll(".rec-cartao").forEach(function(c){
        c.classList.remove("rec-entra"); c.classList.add("rec-fixo");
      });
    }, T_SAIDA + T_ENTRADA);
  }

  /* ---------- escala do palco ----------
     Escreve a custom property direto no nó. Recalcular por estado re-renderizaria
     tudo a cada pixel de resize e REINICIARIA todas as animações CSS. */
  var rafEscala = 0;
  function medirEscala(){
    rafEscala = 0;
    if(!raiz) return;
    raiz.style.setProperty("--rec-k", Math.min(innerWidth/1920, innerHeight/1080).toFixed(5));
  }
  function agendaEscala(){ if(!rafEscala) rafEscala = requestAnimationFrame(medirEscala); }

  /* ============================================================
     ABRIR / FECHAR
     ============================================================ */
  function construir(n){
    var uid = "r"+(++uidN);
    colunaUnica = ehEstreito();
    /* QUATRO colunas de LINHAS no desktop (pedido do dono, 2026-08-09: "os nomes de
       maneira geral podem colocar quatro colunas ao invés de três"). Eram 3 desde mais
       cedo no mesmo dia, e antes disso 5 colunas de cards QUADRADOS (o pacote original).

       O QUE A 4ª COLUNA CUSTA, medido nos 475 nomes: a coluna cai de 451px para 336px e a
       largura útil de texto de 379px para 264px. Com isso **18% dos nomes (84 de 475)**
       passam a usar DUAS linhas — com 3 colunas nenhum usava. O maior de todos tem 40
       caracteres ("Wandersson Diovanne Pereira De Cerqueira").
       Por isso o arranjo é 4x6 e não 4x7: um card de duas linhas de 18px precisa de 72px
       de altura, e 7 linhas dariam cards de 67px — não caberia. Com 6 linhas o card fica
       com 81px e sobra folga. São 24 por página, contra 21 de antes.
       Mexer no número de colunas exige refazer a curvatura (calculada a partir dele), o
       teto da paginação e a largura útil passada ao corpo(). Os três estão nestas linhas. */
    /* ============================================================
       A ORDEM AQUI TEM UM PORQUÊ: paginar ANTES de arranjar.
       O arranjo (quantas colunas) depende de quantos nomes cabem por página, e quantos
       cabem por página depende do teto de 6 páginas — não do arranjo. Então: primeiro a
       paginação com um teto provisório, depois o arranjo que aquele número exige, e só
       então os cards, que precisam da largura útil do arranjo para calcular o corpo.
       Invertendo, o corpo da fonte seria calculado para uma coluna que não é a que vai
       existir, e os nomes estourariam o card sem nenhum erro no console.

       NO CELULAR nada disso vale: lá é uma coluna, o mural rola, e o teto vem da altura
       do aparelho (`tetoDoCelular`). O teto de 6 páginas é DESKTOP: 53 nomes numa coluna
       de celular precisariam de rolagem dentro da página, e o modo apresentação — que é
       quem contava as páginas — nem carrega no celular (desktop-only por matchMedia).
       ============================================================ */
    /* ============================================================
       NIVEL EM IMAGEM: uma arte por pagina, e nada de card
       ------------------------------------------------------------
       Sai antes de toda a maquinaria de nomes — arranjo de colunas, corpo por nome,
       curvatura, teto de 6 paginas. Nenhuma delas tem sentido aqui, e chamar `paginar`
       com MAX_PAGINAS juntaria 14 artes em 6 passos, o oposto do pedido: o dono quer UMA
       POR CLIQUE, como no visor do ecossistema.
       ============================================================ */
    var pg;
    modoImg = ehImagem(n);
    if(modoImg){
      colunas = 1; arr = null; cartoes = [];
      /* qtdArtes e nao imagens.length: a tela final e um passo tambem. */
      pg = { paginas:qtdArtes(n), porPagina:1, linhas:1 };
    } else if(colunaUnica){
      colunas = 1;
      pg = paginar(n.nomes.length, tetoDoCelular(), 1, 0);
      arr = null;
      cartoes = montarCartoes(n.nomes, 0);
    } else {
      pg = paginar(n.nomes.length, 24, 4, MAX_PAGINAS);
      arr = arranjo(pg.porPagina);
      colunas = arr.colunas;
      pg = paginar(n.nomes.length, pg.teto, colunas, MAX_PAGINAS);
      cartoes = montarCartoes(n.nomes, arr.uteis, arr.cap1, arr.cap2, arr.min1);
    }
    paginas = pg.paginas; porPagina = pg.porPagina; linhas = pg.linhas;
    curva = curvatura(colunas);
    pagina = 0; fase = "parado";

    /* `rec-denso` liga o card apertado (padding e ícone menores) a partir de 6 colunas.
       Vai na TELA e não no mural porque o reflexo do chão também é feito de colunas e
       precisa acompanhar a mesma medida — senão o reflexo não bate com o que reflete. */
    tela = el("div", "rec-tela" + (ehLeve() ? " rec-leve" : "") + (arr && arr.denso ? " rec-denso" : "")
      + (modoImg ? " rec-modoimg" : ""));
    tela.setAttribute("data-uid", uid);

    /* ============================================================
       FUNDO — com o vídeo de energia atrás de tudo
       ------------------------------------------------------------
       Pedido do dono (2026-08-09): "coloque aquele vídeo de energia
       de fundo, aquele que estava, porém nas cores de cada pin".
       É o `bg-prod.mp4`, o mesmo loop que já faz o fundo da seção
       da Órbita (960x540, 10s, 89kB).

       A COR ESTÁ ASSADA NO ARQUIVO, não filtrada por quadro. São
       três arquivos, um por nível. Um `filter:hue-rotate()` numa
       camada de tela cheia seria exatamente o "trabalho por quadro"
       que engasga o notebook do dono — a regra deste projeto é
       assar no arquivo com ffmpeg, a mesma decisão do gradiente do
       vídeo da sede. Medido: matiz do vídeo bate com a do pin com
       1 a 2 graus de desvio (verde 141 vs 142, laranja 26 vs 25,
       azul 200 vs 198).
       ⚠ O `format=gbrp` antes do `hue` não é opcional: sem ele o
       ffmpeg gira a matiz em YUV e o vídeo sai magenta. Já
       aconteceu neste projeto.

       preload="auto" e não "none" (que é o padrão do DESIGN.md):
       este elemento só EXISTE depois que alguém abre a peça, então
       não há byte nenhum no carregamento da página para economizar
       — e "none" faria o play() falhar por falta de dados.
       Ao fechar, o overlay é esvaziado e o elemento morre junto:
       zero vídeo decodificando invisível. */
    /* O CENÁRIO É TELA CHEIA E NÃO PERTENCE AO PALCO.
       O palco tem 1920x1080 e é escalado por min(vw/1920, vh/1080) — ou seja, em qualquer
       tela que não seja 16:9 ele sobra ou falta, e antes o fundo inteiro ia junto: dava
       tarja preta e uma borda visível onde o cenário acabava. Agora só o CONTEÚDO (pin,
       título, nomes, setas) fica no palco escalado; tudo que é atmosfera mora aqui, colado
       nos quatro cantos da janela. Foi o pedido do dono: "tem que preencher toda a tela de
       qualquer dispositivo" e "o fundo tem que ser algo suave". */
    var cenario = el("div","rec-cenario",
      '<video class="rec-energia" muted loop playsinline preload="auto" aria-hidden="true">'
      + '<source src="'+n.video+'" type="video/mp4"></video>'
      + '<div class="rec-halo"></div><div class="rec-grade"></div>'
      + '<div class="rec-barraluz"></div>');
    cenario.setAttribute("aria-hidden","true");
    var vid = cenario.querySelector(".rec-energia");
    if(vid){
      var toca = function(){ try{ var pr = vid.play(); if(pr && pr.catch) pr.catch(function(){}); }catch(e){} };
      toca();
      /* mesma rede de segurança do vídeo da sede: se a peça abrir antes de os dados
         chegarem, o play() falha e ninguém tentaria de novo. O 'canplay' tenta na hora
         em que dá. O 'pause' cobre o navegador que pausa vídeo em janela sem foco — ao
         voltar o foco, ele volta a rodar em vez de congelar num quadro. */
      vid.addEventListener("canplay", toca);
      document.addEventListener("visibilitychange", function(){ if(!document.hidden && aberto) toca(); });
    }

    /* ---- ato 1 ---- */
    var ato1 = el("section","rec-ato rec-ato1");
    ato1.appendChild(pinDoNivel("rec-selo", n));
    ato1.appendChild(el("div", "rec-txt1",
        '<p class="rec-data"><span class="rec-mes">'+MES+'</span> <span>'+ANO+'</span></p>'
      + '<h1 class="rec-chapeu">'+letras("RECONHECIMENTO")+'</h1>'
      + '<div class="rec-regua"></div>'
      + '<h2 class="rec-titulo">'+letras(n.nome)+'</h2>'
      /* TOTAL DO NÍVEL (pedido do dono, 2026-08-10: "coloque a quantidade total de cada um
         deles. Exemplo: XX Sêniors"). Fica na tela de TÍTULO, que é onde o apresentador
         anuncia o mês — na tela dos nomes o cabeçalho já é apertado e o contador de página
         ocupa o rodapé. O número sai de `nomes.length`, nunca escrito à mão: é a mesma
         lista que gera os cards, então não existe o "número visível com gêmeo escondido"
         que já morou nesta base. Entra com recSurge (só opacidade) porque quem se
         posiciona por transform perde a posição com as animações que terminam em
         `transform:none` — foi o que já deslocou o contador em 193px. */
      /* quantos(n) e nao n.nomes.length: nos niveis em imagem a conta e o numero de artes.
         E o plural cai para o singular quando e um so — "1 ACIONISTAS" seria o tipo de
         detalhe que numa tela de 124px salta aos olhos de todo mundo. */
      + '<p class="rec-total"><span class="rec-total-n">'+quantos(n)+'</span> '
      +   (quantos(n) === 1 ? n.nome : n.plural) + '</p>'));
    tela.appendChild(ato1);

    /* ---- ato 2 ---- */
    var ato2 = el("section","rec-ato rec-ato2");
    ato2.setAttribute("aria-hidden","true");
    var sala = el("div","rec-sala",
        '<div class="rec-face rec-teto"><div class="rec-arte">'
      +   '<svg class="rec-teto-arte" viewBox="0 0 1920 550" preserveAspectRatio="xMidYMax slice">'
      +     '<path d="M700 40 h520 a36 36 0 0 1 36 36 v130 a36 36 0 0 1 -36 36 h-520 a36 36 0 0 1 -36 -36 v-130 a36 36 0 0 1 36 -36z"/>'
      +     '<path d="M790 290 h340"/>'
      +     '<g class="rec-fraco"><path d="M520 130 h80"/><path d="M1320 130 h80"/><path d="M580 220 h50"/><path d="M1290 220 h50"/></g>'
      +   '</svg></div></div>'
      + '<div class="rec-face rec-chao"></div>'
      + '<div class="rec-face rec-esq"><div class="rec-arte">'+paredeRaios(550,1080,20260731,"e"+uid)+'</div></div>'
      + '<div class="rec-face rec-dir"><div class="rec-arte">'+paredeRaios(550,1080,20261708,"d"+uid)+'</div></div>');
    sala.setAttribute("aria-hidden","true");
    /* A SALA NÃO ENTRA NO ATO 2 — vai para o CENÁRIO, que é tela cheia (ver o cenário
       logo acima). Enquanto ela vivia dentro do palco de 1920x1080, o quarto 3D terminava
       na borda do palco e sobrava preto em volta em qualquer tela que não fosse 16:9:
       era o "corte entre as linhas e o fundo". A revelação dela continua amarrada ao 2º
       ato pelo CSS (.rec-overlay.ato2 .rec-sala), então a coreografia não mudou. */
    cenario.appendChild(sala);
    cenario.appendChild(el("div","rec-brilhofundo"));
    cenario.appendChild(el("div","rec-horizonte"));
    /* a neblina vem DEPOIS da sala: é ela que come as quinas da caixa 3D */
    cenario.appendChild(el("div","rec-neblina"));
    cenario.appendChild(el("div","rec-vinheta"));

    ato2.appendChild(el("div","rec-mural"));
    var reflexo = el("div","rec-reflexo"); reflexo.setAttribute("aria-hidden","true");
    ato2.appendChild(reflexo);

    if(paginas > 1){
      var ant = el("button","rec-seta rec-seta-ant",'<svg viewBox="0 0 13 22"><path d="M11 1L2 11l9 10"/></svg>');
      ant.setAttribute("aria-label","Página anterior");
      ant.addEventListener("click", function(){ irPara(pagina-1); });
      var pro = el("button","rec-seta rec-seta-pro",'<svg viewBox="0 0 13 22"><path d="M2 1l9 10-9 10"/></svg>');
      pro.setAttribute("aria-label","Próxima página");
      pro.addEventListener("click", function(){ irPara(pagina+1); });
      /* ============================================================
         BOLINHA SÓ ATÉ 8 PÁGINAS
         ------------------------------------------------------------
         Com as listas de verdade a contagem explodiu: o Sênior dá 14
         páginas no desktop e 35 no celular. Medido em 390x844 com 35
         bolinhas: o grupo ficava com 551px de largura numa tela de
         390 e EMPURRAVA O CONTADOR PARA FORA — ele nascia em x=390,
         invisível, e o apresentador perdia a única indicação de onde
         estava. Acima de 8 páginas a bolinha deixa de informar e só
         atrapalha; o contador "01 / 35" sozinho diz tudo.
         ============================================================ */
      var pts = "";
      if(paginas <= 8) for(var i=0;i<paginas;i++) pts += '<span class="rec-ponto"></span>';
      ato2.appendChild(ant); ato2.appendChild(pro);
      ato2.appendChild(el("div","rec-paginador", pts+'<span class="rec-contador"></span>'));
    }

    var cabeca = el("header","rec-cabeca");
    cabeca.appendChild(pinDoNivel("rec-selomini", n));
    cabeca.appendChild(el("div", null,
        '<p class="rec-data"><span class="rec-mes">'+MES+'</span> <span>'+ANO+'</span></p>'
      + '<p class="rec-rec">RECONHECIMENTO</p>'
      + '<div class="rec-reguamini"></div>'
      + '<p class="rec-exe">'+n.nome+'</p>'));
    /* VÉUS DE BLUR EM GRADIENTE, topo e base (pedido do dono, 2026-08-09: "dá uma
       suavizada também na parte de cima no header, dá um blur gradiente para ele não
       ficar chapado daquele jeito, tanto embaixo quanto em cima").
       Ficam ANTES do cabeçalho no DOM e com z-index 2: por cima do mural e da sala,
       por baixo do cabeçalho (z-index 3). É o que dá chão ao título sem caixa nem borda. */
    ato2.appendChild(el("div","rec-veu rec-veu-topo"));
    ato2.appendChild(el("div","rec-veu rec-veu-base"));
    ato2.appendChild(cabeca);

    /* A LEGENDA "Homem / Mulher / Empresa" SAIU em 2026-08-09, a pedido do dono, junto com
       o botão Repetir: "pode tirar essas nomenclaturas". Os ícones continuam nos cards —
       o que saiu foi o rodapé que os explicava. */
    tela.appendChild(ato2);


    raiz.innerHTML = "";
    raiz.classList.remove("ato2");   /* remontar a peça volta para o 1º ato */
    raiz.appendChild(cenario);       /* atmosfera, tela cheia */
    raiz.appendChild(tela);          /* conteúdo, palco escalado */
    /* o facho e o ruído varrem a JANELA, não o palco: dentro dele parariam na tarja */
    raiz.appendChild(el("div","rec-ruido"));
    raiz.appendChild(el("div","rec-varredura",
      '<div class="rec-massa"></div><div class="rec-beiratras"></div><div class="rec-beira"></div>'));
    raiz.insertAdjacentHTML("beforeend", sprite(uid));

    var fechar = el("button","rec-fechar","✕");
    fechar.setAttribute("aria-label","Fechar");
    fechar.addEventListener("click", fecha);
    raiz.appendChild(fechar);

    /* O botão "Repetir" saiu em 2026-08-09 (mesmo pedido que tirou a legenda). Rever a
       peça = fechar e abrir de novo, que é um gesto que já existe. A função de remontar
       continua sendo o próprio abre(), então religar é uma linha. */

    /* O MURAL NÃO É MONTADO AQUI, de propósito — ver vaiParaAto2().
       Uma animação CSS começa a contar no instante em que o nó ganha a propriedade. Se os
       cards nascessem agora, no 1º ato, a cascata de entrada deles já teria acabado
       enquanto o apresentador ainda fala sobre o título, e ao passar para os nomes eles
       apareceriam todos de uma vez, sem cascata. Montar no gatilho resolve sem timer. */

    /* ============================================================
       A TROCA DE ATO É MANUAL (pedido do dono, 2026-08-09)
       ------------------------------------------------------------
       Antes um setTimeout de 5,4s levava sozinho do título para os
       nomes. O dono pediu o contrário: "quando for clicar para
       aparecer essa tela ela é clicável e no próximo botão que vier
       ela apaga e aparece a próxima tela". Numa apresentação ao
       vivo isso é o certo — o tempo é de quem está falando, não do
       relógio. Agora quem manda é o clique, a seta ou o passo da
       apresentação; o roteiro do CSS só começa quando a classe
       `ato2` entra na tela (é assim que uma animação CSS começa:
       no instante em que o elemento ganha a propriedade).
       ============================================================ */
    ato = 1;
    abertoEm = Date.now();
    tela.addEventListener("click", function(e){
      /* clique nos controles do ato 2 não conta como "avançar" */
      if(e.target.closest && e.target.closest(".rec-seta,.rec-paginador")) return;
      /* JANELA MORTA DE 400ms. O gesto que ABRE a peça (toque na barra do gráfico, clique
         no botão da galeria) pode gerar um segundo "click" logo depois, já com a tela
         cheia montada debaixo do dedo — o clique fantasma clássico do toque. Sem esta
         guarda o título seria pulado no mesmo gesto que o mandou aparecer, e o sintoma
         seria "às vezes ele pula sozinho", que neste projeto é sempre corrida. */
      if(Date.now() - abertoEm < 400) return;
      if(ato === 1) vaiParaAto2();
    });
    limpar();
  }

  /* ato 1 -> varredura -> ato 2. Sem timer: é chamado pelo clique, pela seta ou pela
     apresentação. Idempotente de propósito — dois toques rápidos não disparam duas
     varreduras (foi assim que o projeto já produziu "comportamento intermitente"). */
  /* ============================================================
     O PIN ATRAVESSA A VARREDURA
     ------------------------------------------------------------
     Pedido do dono (2026-08-09): "quando a animação for apagando
     precisa exibir a imagem do pin ainda, pois está sem nada no
     fundo: ele apaga e volta sem nada, e depois aparecem as
     imagens". Era verdade — o ato 1 inteiro apagava atrás do facho
     e a cena voltava vazia até os cards entrarem.
     Agora o ato 1 NÃO apaga inteiro: some só o texto. O pin fica e
     VOA até o lugar dele no cabeçalho do ato 2, chegando enquanto
     o facho ainda está saindo. A cena nunca fica sem nada.

     O destino é MEDIDO, não chutado: a largura do cabeçalho muda
     com o nome do nível (SÊNIOR, GESTOR, EXECUTIVO têm larguras
     diferentes), então o pin do cabeçalho não fica sempre no mesmo
     x. Medir é o que faz o pouso ser exato nos três.
     ============================================================ */
  function mediaVooDoPin(){
    var selo = tela.querySelector(".rec-selo");
    var mini = tela.querySelector(".rec-selomini");
    if(!selo || !mini) return;
    /* congela a flutuação antes de medir: ela desloca o pin em até 14px e entraria
       inteira no cálculo. Sem quadro pintado entre desligar e religar — tudo na mesma
       tarefa —, então não pisca. */
    var guarda = selo.style.animation;
    selo.style.animation = "none";
    void selo.offsetWidth;                       /* força o recálculo antes de medir */
    var a = selo.getBoundingClientRect();
    var b = mini.getBoundingClientRect();
    selo.style.animation = guarda;
    /* escala real do palco: serve tanto no desktop (scale(k)) quanto no retrato (sem scale) */
    var k = tela.getBoundingClientRect().width / tela.offsetWidth;
    if(!(k > 0) || !a.width || !b.width) return;
    /* com transform-origin no centro, translate move o CENTRO: então a conta é de centro
       para centro, e a escala é a razão das larguras */
    var dx = ((b.left + b.width/2) - (a.left + a.width/2)) / k;
    var dy = ((b.top + b.height/2) - (a.top + a.height/2)) / k;
    tela.style.setProperty("--rec-pin-dx", dx.toFixed(1)+"px");
    tela.style.setProperty("--rec-pin-dy", dy.toFixed(1)+"px");
    tela.style.setProperty("--rec-pin-k", (b.width/a.width).toFixed(4));
  }

  function vaiParaAto2(){
    if(!tela || ato === 2) return;
    ato = 2;
    mediaVooDoPin();          /* mede ANTES da classe entrar, com o pin ainda parado */
    /* a classe vai no OVERLAY, não na tela: o botão Repetir é irmão da tela e também
       precisa ser alcançado pela regra (ver o bloco "O 2º ATO COMEÇA AQUI" no CSS) */
    raiz.classList.add("ato2");
    /* os cards nascem AGORA: é o que faz a cascata de entrada deles começar junto com o
       ato, e não lá atrás quando a peça foi aberta */
    redesenhaMural(tela.getAttribute("data-uid"));
    var a1 = tela.querySelector(".rec-ato1"), a2 = tela.querySelector(".rec-ato2");
    if(a1) a1.setAttribute("aria-hidden","true");
    if(a2) a2.setAttribute("aria-hidden","false");
  }

  function abre(lvl){
    var n = NIVEIS[lvl];
    if(!n) return;
    if(!raiz){
      /* pendurado no <body>, FORA do #smooth-content — ver o cabeçalho do arquivo */
      raiz = el("div","rec-overlay");
      raiz.id = "recOverlay";
      raiz.setAttribute("aria-hidden","true");
      raiz.setAttribute("role","dialog");
      raiz.setAttribute("aria-modal","true");
      document.body.appendChild(raiz);
      addEventListener("resize", agendaEscala, { passive:true });
    }
    nivelAtual = n;
    pintar(raiz, n);
    raiz.setAttribute("aria-label","Reconhecimento "+n.nome);
    medirEscala();
    construir(n);
    raiz.classList.add("open");
    raiz.setAttribute("aria-hidden","false");
    if(!aberto){
      aberto = true;
      /* TRAVA DE SCROLL COM POSSE. A peça quase sempre abre POR CIMA da galeria de
         eventos, que já travou o scroll ao abrir. Destravar na saída sem verificar
         devolveria o scroll com a galeria ainda aberta — dois donos escrevendo a mesma
         propriedade, que é a origem de metade dos bugs de scroll deste projeto. Só
         destrava quem travou. */
      smoother = (window.ScrollSmoother && ScrollSmoother.get) ? ScrollSmoother.get() : null;
      if(smoother){
        travei = !smoother.paused();
        if(travei) smoother.paused(true);
      }else{
        travei = (document.body.style.overflow !== "hidden");
        if(travei) document.body.style.overflow = "hidden";
      }
    }
  }

  function fecha(){
    if(!aberto || !raiz) return;
    aberto = false;
    limpar();
    raiz.classList.remove("open");
    raiz.setAttribute("aria-hidden","true");
    /* esvazia DEPOIS do fade: 30 gradientes cônicos girando atrás de um overlay
       invisível seriam trabalho por quadro sem ninguém vendo. */
    setTimeout(function(){ if(!aberto && raiz) raiz.innerHTML = ""; }, 340);
    if(travei){                                  /* ver a nota de posse no abre() */
      if(smoother) smoother.paused(false); else document.body.style.overflow = "";
      travei = false;
    }
  }

  /* ============================================================
     TECLADO
     ------------------------------------------------------------
     Fase de CAPTURA de propósito. O modo apresentação escuta
     keydown no document (borbulha) e usa as MESMAS setas. Sem a
     captura, um "avançar" trocaria a página daqui E pularia a
     parada da apresentação no mesmo toque.
     A regra: enquanto houver página para virar, a peça consome a
     tecla; na última, ela deixa passar e a apresentação segue.
     Assim o apresentador usa uma seta só do começo ao fim.
     ============================================================ */
  document.addEventListener("keydown", function(e){
    if(!aberto) return;
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); fecha(); return; }
    /* ============================================================
       POSSE DO PASSO: NA APRESENTAÇÃO, QUEM MANDA É ELA
       ------------------------------------------------------------
       Este bloco existe para o modo SITE, onde não há apresentação
       para perguntar nada. Dentro da apresentação ele tem de SAIR:
       de 2026-08-09 em diante o goNext/goPrev de lá já pergunta à
       peça (pecaConsumiu), e manter os dois ativos criava DOIS DONOS
       do mesmo avanço — uma tecla virava dois passos.
       Sintoma medido, e foi assim que o dono viu: uma seta levava do
       título direto para a PÁGINA 2 dos nomes, pulando a página 1.
       É a armadilha que o CLAUDE.md descreve: duas mecânicas
       escrevendo a mesma coisa, e a última do quadro ganha.
       ============================================================ */
    if(window.__pmode && window.__pmode.isActive && window.__pmode.isActive()) return;
    var frente = (e.key==="ArrowRight" || e.key==="ArrowDown" || e.key===" " || e.key==="PageDown");
    var tras   = (e.key==="ArrowLeft"  || e.key==="ArrowUp"   || e.key==="PageUp");
    /* 1º avanço: título -> nomes. Só depois disso as setas viram troca de página. */
    if(frente && ato === 1){ e.preventDefault(); e.stopPropagation(); vaiParaAto2(); return; }
    if(frente && pagina < paginas-1){ e.preventDefault(); e.stopPropagation(); irPara(pagina+1); return; }
    if(tras   && pagina > 0){        e.preventDefault(); e.stopPropagation(); irPara(pagina-1); return; }
    /* acabou as páginas: não consome — quem estiver por trás (apresentação) decide.
       É isto que faz UMA parada de apresentação bastar para a peça inteira, por mais
       páginas de nomes que existam: ela devolve o controle sozinha no fim. */
  }, true);

  /* ============================================================
     API PÚBLICA
     abrir(lvl)  lvl = nível na escada (Sênior=0, Gestor=1, Executivo=2)
     ============================================================ */
  window.IGREEN_RECONHECIMENTO = {
    abrir:  function(lvl){ abre(lvl); },
    fechar: fecha,
    aberto: function(){ return aberto; },
    /* usado pela apresentação para saber se ainda há página a virar */
    paginas:function(){ return paginas; },
    pagina: function(){ return pagina; },
    ato:    function(){ return ato; },
    /* Um passo para a frente: título -> nomes, depois página a página.
       Devolve false quando não há mais para onde ir — é o sinal de "pode seguir".
       É por aqui que o modo apresentação pergunta, no goNext/goPrev, e é o que faz o
       BOTÃO da tela funcionar igual à tecla (antes só a tecla era interceptada). */
    avancar:function(){
      if(ato === 1){ vaiParaAto2(); return true; }
      if(pagina < paginas-1){ irPara(pagina+1); return true; }
      return false;
    },
    /* Um passo para trás, só entre páginas. Voltar do 2º ato para o 1º exigiria desfazer a
       varredura, e um facho correndo ao contrário lê como defeito — na primeira página a
       peça devolve o passo e quem anda para trás é a apresentação. */
    voltar:function(){
      if(ato === 2 && pagina > 0){ irPara(pagina-1); return true; }
      return false;
    },
    niveis: function(){ return window.GRAD_REC_LEVELS.slice(); }
  };
})();
