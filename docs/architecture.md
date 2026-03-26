# Arquitetura do Projeto

## Visao geral

O projeto e organizado em torno de um loop simples de jogo e de uma separacao clara entre:

- `core`: orquestracao da aplicacao
- `scene`: camera, player e construcao do mundo
- `systems`: input, movimento e audio
- `data`: catalogos declarativos, como especies vegetais

## Modulos principais

### `src/core/Game.js`

Responsavel por:

- criar renderer, camera, player, mundo e sistemas
- atualizar o jogo a cada frame
- montar HUD e painel de informacao
- resolver interacao por proximidade
- animar o viewmodel dos bracos

### `src/core/Renderer.js`

Responsavel por:

- criar o `WebGLRenderer`
- configurar sombras e `outputColorSpace`
- ajustar o canvas ao tamanho do container

### `src/core/Loop.js`

Responsavel por:

- controlar o ciclo `update/render`
- alimentar o jogo com `deltaSeconds`

### `src/scene/World.js`

E o modulo mais denso do projeto. Hoje concentra:

- relevo procedural
- hidrografia
- biomas
- distribuicao de arvores e vegetacao baixa
- fauna por biomassa
- ciclo de dia-noite-chuva
- lanternas noturnas
- chuva visual
- colisores estaticos e dinamicos
- interagiveis de fauna e flora

### `src/scene/Player.js`

Responsavel por:

- pivot de rotacao horizontal
- pivot de pitch da camera
- estado fisico basico do player

### `src/systems/InputSystem.js`

Responsavel por:

- teclado
- mouse
- pointer lock
- leitura de acoes discretas como interagir

### `src/systems/MovementSystem.js`

Responsavel por:

- locomocao
- corrida
- salto
- gravidade
- ajuste ao relevo do terreno
- resolucao de colisao contra obstaculos do mundo

### `src/systems/SoundSystem.js`

Responsavel por audio procedural em Web Audio:

- passos em agua e terra
- cama ambiente
- agua
- chuva
- canto de aves
- som curto de interacao

## Dados declarativos

### `src/data/treeSpecies.json`

Catalogo de especies arboreas com:

- nome
- familia geometrica
- biomas validos
- faixa de idade
- parametros base de porte e copa

O mundo transforma cada especie em exemplares com idade e escala dinamica.

## Filosofia tecnica

- JavaScript modular, sem engine pesada
- geometria simples e legivel
- sistemas de jogo pequenos e focados
- configuracao por dados quando fizer sentido
- preferencia por efeitos baratos sobre simulacao completa

## Pontos de atencao

- `World.js` centraliza muitas responsabilidades e e o principal candidato a futura divisao
- a fauna e o clima hoje compartilham o mesmo modulo de cena
- a documentacao em `docs/` deve acompanhar as mudancas de bioma, flora e fauna
