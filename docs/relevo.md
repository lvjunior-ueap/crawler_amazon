# Relevo e Hidrografia

## Forma geral do mapa

O mundo atual e um retangulo alongado no sentido do rio.

- largura aproximada: `180`
- comprimento aproximado: `540`
- exploracao principal orientada no eixo `Z`

## Faixa altimetrica

O relevo procedural trabalha aproximadamente entre:

- minimo: `-1`
- maximo: `3`

Essa altura e usada tanto para o terreno quanto para o ajuste do piso do player.

## Componentes do terreno

O calculo mistura:

- distancia ao eixo do rio
- largura local do canal
- abertura terminal para lago
- ruido macro
- ruido de terraceamento
- elevacao adicional para terra firme
- recorte do canal principal

## Rio e lago

O rio e construído como faixa sinuosa com:

- centro variavel ao longo de `Z`
- largura variavel por trecho
- leitura visual continua
- fauna aquatica sobre esse corredor

Na extremidade mais distante do mapa, o corredor abre para um `lago`:

- agua mais larga e calma
- transicao entre canal e remanso terminal
- presenca de vitoria-regia
- fauna associada a agua lenta

## Biomas derivados do relevo

### Mata ciliar

- muito proxima do rio
- cotas baixas
- vegetacao menor
- faixa de transicao entre agua e terra

### Varzea

- intermediaria entre margem e terra firme
- cotas moderadas
- presenca de arvores frutiferas e palmeiras

### Terra firme

- mais afastada do rio
- relevo mais alto e ondulado
- arvores mais velhas e de maior porte

### Lago

- aparece no fim do eixo do rio
- concentra remanso e agua mais aberta
- funciona como quarto bioma
- reforca a leitura hidrografica do mapa alongado

## Elementos associados ao relevo

- casa ribeirinha posicionada na margem
- jipe em area seca
- margem com garcas, bufalos e fauna aquatica
- fauna arboricola e predadores mais associados a terra firme
- placas de bioma distribuidas em pontos de leitura do percurso
