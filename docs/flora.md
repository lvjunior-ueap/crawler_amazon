# Flora

## Estrategia geral

A flora mistura:

- distribuicao procedural
- bioma por posicao
- especies declaradas em JSON
- idade dinamica por exemplar

Nem toda arvore e interagivel. Algumas especies de terra firme sao selecionadas como pontos de leitura.
Tambem existem elementos vegetais aquaticos e um talhao de eucalipto na borda do mapa.

## Catalogo de arvores

Arquivo-base:

- [treeSpecies.json](/home/coruja/Projetos/crawler_amazon/src/data/treeSpecies.json)

Especies e familias visuais usadas:

- `angelim`
- `macacauba`
- `buritizeiro`
- `tucuma`
- `embauba`
- `pata-de-vaca` como exemplar especial modelado a parte
- `eucalipto` como plantacao cenografica e ponto de leitura
- `vitoria-regia` como planta aquatica interagivel do lago

Tambem existem variantes de idade/porte, como:

- `angelim_jovem`
- `macacauba_alta`
- `buriti_jovem`
- `tucuma_fechado`
- `embauba_alta`

## Idade e porte

Cada exemplar recebe:

- `age`
- `heightScale`
- `spreadScale`
- `trunkScale`

O bioma influencia essa idade:

- `terra_firme`: individuos mais velhos e maiores
- `varzea`: porte medio
- `mata_ciliar`: porte menor

## Biomas vegetais

### Mata ciliar

Predominio de:

- embaubas
- tucuma
- buritizeiro jovem
- vegetacao baixa e densa

### Varzea

Predominio de:

- macacauba
- buritizeiro
- tucuma
- embauba

### Terra firme

Predominio de:

- angelim
- macacauba alta
- angelim jovem
- exemplares mais altos e espaçados

### Lago

Predominio de:

- agua mais aberta e lenta
- vitoria-regia
- margem baixa de transicao

## Pata-de-vaca

A pata-de-vaca e um ponto especial da cena:

- tem modelagem propria
- usa folhas bilobadas
- e interagivel
- funciona como especie de referencia botanica do percurso

## Arvores interagiveis

Atualmente algumas arvores de terra firme sao selecionadas como pontos de leitura:

- `angelim`
- `macacauba`
- `eucalipto` em alguns exemplares do talhao de borda

Essas arvores:

- recebem contorno branco sob foco
- mostram painel de informacao
- nao cobrem toda a floresta, apenas exemplares pontuais

## Vitoria-regia

A vitoria-regia aparece no bioma `lago`:

- em folhas flutuantes distribuidas perto do terminal do rio
- com alguns exemplares interagiveis
- como ponto de leitura sobre flora aquatica

## Iluminacao vegetal noturna

Algumas arvores proximas de biomas umidos podem receber:

- lanternas pendentes
- emissao noturna
- iluminacao ativada no ciclo escuro
