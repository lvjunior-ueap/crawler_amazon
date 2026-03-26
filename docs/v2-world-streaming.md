# V2: Mundo Maior com Chunks e Streaming

## Objetivo

Esta proposta descreve uma versao 2 do projeto com escala muito maior, mais proxima da sensacao de mundo continuo de jogos como `Minecraft`, sem tentar carregar tudo de uma vez.

A ideia central nao e apenas "aumentar o mapa". E trocar a arquitetura atual de mundo unico por uma arquitetura de:

- chunks
- streaming
- geracao procedural por regiao
- persistencia leve de estado

## Problema da arquitetura atual

Hoje o projeto funciona bem para:

- um mapa unico
- geracao inteira em `build()`
- fauna e flora concentradas em um unico modulo
- atualizacao continua sobre uma cena inteira carregada

Isso limita a escala porque:

- todo o terreno existe ao mesmo tempo
- toda a vegetacao e fauna entram na mesma cena
- o custo de draw calls e atualizacao cresce junto com a area
- `World.js` concentra responsabilidades demais

Para ficar muito maior, o problema deixa de ser "quantos metros o mapa tem" e passa a ser "como o mundo e carregado".

## Ideia principal

A v2 usaria um mundo dividido em chunks.

Exemplo:

- cada chunk mede `64 x 64` unidades
- o jogador mantem um raio de chunks ativos ao redor
- chunks proximos sao gerados e carregados
- chunks distantes sao descarregados ou simplificados

Isso permite:

- rios muito mais longos
- varios lagos e ramificacoes
- areas de floresta, plantio, estrada e vila
- exploracao quase continua
- custo de renderizacao controlado

## Conceitos centrais

## Chunk

Unidade basica de mundo carregavel.

Cada chunk teria:

- coordenadas de grade, como `chunkX` e `chunkZ`
- seed derivada
- geometria de terreno
- agua local
- flora
- fauna
- props
- interagiveis locais
- estado salvo

## Streaming

Sistema que decide:

- quais chunks devem existir
- quais chunks devem ser criados
- quais chunks devem ser removidos
- quais chunks podem ficar em LOD baixo

Regra simples inicial:

- raio interno: chunks totalmente ativos
- raio medio: chunks com geometria simplificada
- raio externo: chunks inexistentes

## Seed de mundo

O mundo precisa ser reproduzivel.

Com uma `worldSeed`, a geracao pode recriar:

- relevo
- rios
- biomas
- especies vegetais
- distribuicao base de fauna
- pontos de interesse

Isso ajuda em:

- debugging
- saves
- compartilhamento de mundos
- consistencia entre sessoes

## Arquitetura sugerida

## Modulos novos

### `src/world/WorldManager.js`

Responsavel por:

- manter lista de chunks ativos
- pedir criacao e descarte
- atualizar streaming conforme a posicao do jogador

### `src/world/Chunk.js`

Representacao de um chunk carregado.

Responsavel por:

- armazenar grupos e objetos do chunk
- registrar interagiveis locais
- expor `mount()` e `dispose()`

### `src/world/generation/TerrainGenerator.js`

Responsavel por:

- altura base
- macro relevo
- erosao simples ou terraceamento leve
- mascaras de alagamento

### `src/world/generation/HydrologyGenerator.js`

Responsavel por:

- eixo principal do rio
- afluentes
- lagos
- areas de remanso
- largura por trecho

### `src/world/generation/BiomeMap.js`

Responsavel por classificar cada area em:

- `mata_ciliar`
- `varzea`
- `terra_firme`
- `lago`
- futuros biomas da v2

### `src/world/generation/FloraSpawner.js`

Responsavel por:

- ler catalogos de especies
- gerar exemplares por chunk
- aplicar idade, escala e densidade
- usar instancing quando possivel

### `src/world/generation/FaunaSpawner.js`

Responsavel por:

- calcular biomassa por habitat
- decidir exibicao curada por chunk
- registrar comportamento base

### `src/world/persistence/ChunkStateStore.js`

Responsavel por:

- guardar modificacoes do jogador
- registrar estado de interagiveis e fauna persistente
- permitir recarregamento coerente

## Fluxo de runtime

1. jogador se move
2. `WorldManager` calcula chunk atual
3. sistema compara o raio desejado com o raio carregado
4. chunks novos entram em fila de geracao
5. chunks antigos saem da cena e liberam memoria
6. interagiveis e fauna passam a ser resolvidos por proximidade de chunk

## Escala sugerida

Exemplo de configuracao inicial:

- tamanho de chunk: `64`
- raio totalmente ativo: `2` chunks
- raio de LOD: `4` chunks
- total simultaneo alto detalhe: `5 x 5 = 25` chunks

Isso ja permitiria um mundo percebido muito maior do que o atual, sem tentar renderizar centenas de chunks em detalhe maximo.

## Terreno e hidrografia

Para a v2, o relevo deveria passar a ter duas camadas:

- macroforma do mundo
- detalhe local por chunk

Macroforma:

- define serras baixas, planicies, lagos e corredor principal do rio

Detalhe local:

- aplica ruido fino
- modela margens
- cria baixios, bancos e pequenas variacoes

O rio principal pode ser tratado como um sistema continuo global, nao como acidente isolado de um chunk.

## Biomas

Na v2, os biomas devem nascer de mapas continuos, nao apenas de regras locais simples.

Exemplo de mascaras:

- distancia ao rio
- cota
- saturacao hidrica
- declividade
- tipo de macroregiao

Isso permite manter:

- coerencia espacial
- transicoes suaves
- manchas grandes de vegetacao
- leitura melhor do mundo

## Flora

A flora de v2 deve combinar tres estrategias:

- mesh unica para especies especiais e interagiveis
- `InstancedMesh` para grandes quantidades de exemplares repetidos
- LOD para arvores distantes

Regras importantes:

- exemplares proximos do jogador podem ser completos
- exemplares medios podem usar formas simplificadas
- exemplares distantes podem virar blocos de copa ou ate impostors

## Fauna

A fauna deve sair do modelo "lista global da cena" e passar para:

- fauna por chunk
- fauna ativa apenas perto do jogador
- fauna distante em modo simulado leve ou congelado

Camadas sugeridas:

- fauna presente no chunk
- fauna ativa em comportamento completo
- fauna virtual em estado resumido

Assim, a biomassa do mundo continua coerente sem custo total de simulacao.

## Interacao

Cada chunk poderia manter seu proprio indice de:

- interagiveis
- colliders
- fauna ativa
- pontos de foco

O jogo consultaria primeiro os chunks proximos, e nao o mundo inteiro.

Isso reduz custo e prepara o projeto para:

- mais objetos observaveis
- coleta
- inventario
- missoes ou trilhas interpretativas

## Performance

Os pilares de performance da v2 deveriam ser:

- `InstancedMesh`
- LOD
- descarte de chunks
- pools de objetos
- menos `Group` dinamico para vegetacao repetida
- atualizacao de fauna apenas perto do jogador

Tambem valeria mover geracao pesada para:

- `Web Worker`, quando a complexidade aumentar

## Persistencia

Mesmo sem sistema completo de save, a v2 pode persistir:

- seed do mundo
- chunks visitados
- placas lidas
- interagiveis acionados
- alteracoes locais

Formato simples inicial:

- `localStorage` para prototipo
- JSON por mundo

## Roadmap sugerido

## Fase 1

- extrair `World.js` em modulos menores
- criar `WorldManager`
- introduzir conceito de chunk sem streaming real

## Fase 2

- ativar streaming de terreno e agua
- mover flora para chunks
- manter fauna ainda simplificada

## Fase 3

- chunkizar fauna e interagiveis
- adicionar LOD
- introduzir instancing em massa

## Fase 4

- persistencia de mundo
- seeds reproduziveis
- pontos de interesse maiores como vilas, estradas e plantios

## Riscos e cuidados

- chunks mal integrados podem criar costuras visuais no terreno
- fauna pode "desaparecer" de forma estranha se o streaming for brusco
- interagiveis entre bordas de chunk exigem cuidado
- hidrografia continua precisa ser pensada globalmente
- o custo de codigo sobe bastante, mesmo que a performance melhore

## Recomendacao

Para a v2, eu recomendo nao tentar "portar tudo" de uma vez.

A melhor sequencia seria:

1. separar responsabilidades atuais de `World.js`
2. criar uma camada de chunk management
3. migrar terreno e agua primeiro
4. migrar flora depois
5. migrar fauna por ultimo

Assim a equipe mantem um jogo funcionando enquanto aumenta a escala.

## Resumo

Sim, da para fazer um mundo muito maior, em sensacao proxima de `Minecraft`.

Mas isso pede:

- nova arquitetura
- mundo por chunks
- streaming
- geracao com seed
- LOD
- modularizacao forte

Sem isso, aumentar o mapa atual so faria crescer custo e fragilidade.
