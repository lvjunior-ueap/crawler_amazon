# Fauna

## Estrategia geral

A fauna e distribuida por:

- bioma
- tipo de habitat
- regra de biomassa
- fator de exibicao mais baixo, para manter leitura estilo museu

Arquivo principal:

- [World.js](/home/coruja/Projetos/crawler_amazon/src/scene/World.js)

## Regra de biomassa

O sistema trabalha com:

- celulas de habitat de `20` unidades
- teto teorico de `300 kg` por especie por celula
- fator de exibicao reduzido para evitar superpovoamento

Isso produz uma cena mais curada do que naturalista estrita.

## Fauna terrestre

### Mata ciliar / varzea

- capivara
- iguana
- mucura
- bufalo em areas de agua rasa e margem

### Varzea / terra firme

- cotia
- porco-do-mato

### Terra firme

- onca
- guariba ou bugio arboricola
- jabuti

## Fauna aerea

- arara
- bem-te-vi
- garca
- borboletas

As araras e aves pequenas usam o sistema de fauna flutuante. Garcas ocupam a margem e caminham pouco.

## Fauna aquatica e semiaquatica

- tracaja
- matamata
- aracu
- pacu
- tamata
- tucunare
- boto
- sucuri
- jacare

Esses animais ocupam o corredor do rio e, no extremo do mapa, tambem o trecho mais aberto do lago.

## Interacao

Hoje todos os animais relevantes de cena podem ser observados com:

- contorno branco ao focar
- prompt de interacao
- painel com nome e descricao
- som curto procedural por especie ou familia

## Movimento

### Animais terrestres

Usam:

- deslocamento orbital curto
- variacao de direcao
- pequeno `bob`
- atualizacao de colisao e ponto de foco

### Animais aereos

Usam:

- trajetorias oscilatorias
- batimento de asas

### Fauna do rio

Usa:

- oscilacao ao longo do canal
- leve variacao vertical
- alturas distintas para peixe, quelonio, jacare e boto

### Fauna arboricola

O guariba:

- procura arvores de terra firme como ancora
- aparece entre `3` e `7` metros acima do solo
- orbita em torno da arvore em raio curto
- mantem foco interagivel atualizado mesmo em movimento

## Abordagem curatorial

A fauna nao busca densidade realista maxima.

O objetivo atual e:

- mostrar especies de forma reconhecivel
- distribuir por habitat plausivel
- manter a leitura espacial
- evitar excesso de ruido visual
