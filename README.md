# Zero7 Experience

Landing page da campanha. HTML, CSS e JavaScript puros, sem build e sem
dependencia. Publica igual aos outros sites da Zero7: sobe pro GitHub e puxa
pelo Git Version Control do cPanel.

```
index.html
css/
  fontes.css     Sora e Inter, servidas do proprio dominio
  estilos.css    todo o estilo da pagina
script/
  lenis.min.js   biblioteca de scroll suave (v1.3.26), servida daqui mesmo
  site.js        acordeao do FAQ, videos dos cards, botao magnetico, scroll suave
assets/
  brand/         logos
  experiencias/  videos dos cards + poster de cada um
  fontes/        arquivos .woff2
```

**Todos os caminhos sao relativos.** A pasta funciona em qualquer lugar do
dominio: raiz, subdominio ou subpasta, sem configurar nada.

## Mosaico da hero

A hero nao tem mais imagem de fundo: o fundo e um mosaico de video em
perspectiva, descendo em velocidades diferentes (34s, 46s e 39s, com
defasagens, para o conjunto nao ler como um bloco unico caindo).

- **Desktop (>= 1080px):** tres colunas, ocupando 62% da largura, encostado a
  direita, sumindo para a esquerda onde o texto vive. 12 tiles.
- **Mobile e tablet (< 1080px):** tela inteira por tras do texto, com DUAS
  colunas. 8 tiles.

O corte de tres para duas colunas no celular nao e estetico: varios Android
tem limite baixo de decodificadores de video simultaneos, e estourar esse
limite faz o navegador cair para software ou desistir de tocar. A terceira
coluna fica `display: none` e o JS so da play no que esta visivel, entao
aqueles quatro arquivos nem chegam a ser baixados no celular.

Os clipes em `assets/hero/mosaico/` sao versoes proprias de 384x480, 6
segundos, sem audio, feitas so para isto. Cada um tem um `.jpg` de mesmo
nome que serve de poster: e o que aparece antes do video comecar, e o que
sobra se o video nao tocar.

O desfoque e a dessaturacao estao em CSS (`.mosaico__plano`), para poder
ajustar sem passar pelo ffmpeg. Custa FPS: filtro em container obriga o
navegador a redesenhar a subarvore inteira a cada quadro. Se pesar demais, os
caminhos sao, nesta ordem: baixar o raio do blur, cair para duas colunas no
desktop tambem, ou assar o desfoque nos arquivos com `gblur=sigma=7` no
ffmpeg e tirar o `filter` do CSS.

Os tiles so tocam enquanto a hero esta na tela e pausam ao rolar para longe.
Sob `prefers-reduced-motion` nada toca e nada e baixado: ficam os posters.

A imagem `assets/hero/hero-fundo.avif` continua na pasta mas nao e mais
usada. Guardada caso voce queira voltar atras.

## Scroll suave

A pagina usa Lenis. O arquivo esta em `script/`, nao vem de CDN: se a internet
de terceiros cair, o site continua inteiro.

Ele **desliga sozinho** quando o visitante tem `prefers-reduced-motion` ligado
no sistema, e ai o scroll do navegador fica intacto. No celular o toque tambem
continua nativo, de proposito: o momentum do proprio aparelho e melhor que
qualquer imitacao em JS.

Para tirar o scroll suave, apague a linha do `lenis.min.js` no `index.html`.
A pagina continua funcionando normal.

## Editar

- **Texto:** direto no `index.html`.
- **Cores, espacos, tipografia:** as variaveis estao no `:root` do topo de
  `css/estilos.css`.
- **Trocar um video:** substitua o `.mp4` em `assets/experiencias/` mantendo o
  nome. O `.jpg` de mesmo nome e a imagem que aparece antes do video comecar.

## Card do Plano Senior

O quinto card nao tem video: no lugar dele ha um painel montado em HTML e CSS
(`.plano` no `index.html`, estilos no fim do `estilos.css`). Ele cita o card de
plano de zero7.com.br e usa so texto que ja existe na propria pagina: SENIOR,
80 contratos, conta real.

**Nao trouxe preco nem limites de proposito.** No site nacional esses numeros
sao injetados por JS e mudam com promocao: o HTML de la diz 12x R3,01 e a
pagina no ar mostra 12x R3,64. Cravar um deles aqui colocaria preco errado no
ar no dia que a promo virasse.

O fundo e ARTE, nao enfeite de interface: os quatro cards vizinhos sao video
colorido em movimento e este slot esta no lugar de um video, entao ele se
comporta como midia. Duas auras de luz derivam em periodos diferentes (19s e
26s), animadas por transform, que roda no compositor e nao repinta. As cores
saem todas da rampa da marca.

Um "veu" escurece o centro por cima das auras e por baixo do texto. E ele que
segura o contraste: sem ele o azul passaria atras do numero. Medido nos pixels
reais, no pior instante da animacao: SENIOR 12,74:1, 80 em 14,10:1, contratos
7,05:1.

O numero conta de 0 a 80 quando o card entra na tela, no mesmo gatilho dos
videos. Sob `prefers-reduced-motion` nada se move e ele nasce pronto, com o 80
no lugar. A escala usa container query, entao a composicao acompanha a largura
do card de 181px a 320px sem media query.


## Videos

Rodam mudos, em loop e sem controles, e so comecam quando o card entra na tela.
Sao H.264 1280x960, sem audio. Os arquivos originais em HEVC, enviados pelo
cliente, estao no backup (ver abaixo): HEVC nao toca em Chrome nem Firefox no
Windows, por isso foram reconvertidos.

## Backup

Este site foi montado a partir de um projeto em Next.js. O projeto inteiro,
com o codigo-fonte em componentes e os videos originais, esta guardado em:

```
Projetos/Zero7/_backup Zero7 Experience (projeto Next)/
```

Nao e necessario para o site funcionar. Guarde caso um dia queira voltar a
editar por componentes.
