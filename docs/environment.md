# Ambiente e Sistemas de Cena

## Clima

O mundo possui:

- ciclo continuo de dia e noite
- transicao automatica de chuva
- mudanca de ceu, neblina e intensidade de luz

## Luz

O sistema usa:

- luz hemisferica
- sol direcional
- lua direcional

Durante o ciclo:

- o sol muda de posicao e intensidade
- a lua assume maior presenca a noite
- o ceu e a neblina transitam entre cores de dia, crepusculo e noite

## Chuva

A chuva atual e visualizada com:

- `Points`
- posicoes proceduralmente recicladas
- intensidade controlada por `rainAmount`

No audio, a chuva tambem entra como camada de ruido filtrado.

## Lanternas

Algumas arvores recebem lanternas pendentes:

- apenas em certos contextos
- acesas conforme o mundo escurece
- com sway leve e emissao noturna

## HUD e interacao

O HUD atual inclui:

- crosshair em forma de estrela
- prompt de interacao
- painel lateral de informacao
- viewmodel de bracos em primeira pessoa
- controles touch em dispositivos moveis

A interacao:

- funciona por proximidade curta
- nao exige alinhamento exato no centro do crosshair
- usa `focusPoint` quando o objeto precisa de um alvo mais representativo
- destaca o alvo com contorno branco

## Audio procedural

O `SoundSystem` hoje cobre:

- passos em terra
- passos em agua
- cama ambiente
- agua
- chuva
- aves ocasionais
- som de interacao

## Viewmodel

Os bracos do jogador:

- sao independentes do corpo do player
- usam sway de caminhada/corrida
- seguem uma linguagem mais arcade do que simulativa

## Controles moveis

Em dispositivos touch, o jogo expõe:

- joystick virtual a esquerda para locomocao
- area de arraste a direita para olhar
- botoes de `correr`, `pular` e `interagir`
- botao contextual de interacao apenas quando existe alvo proximo

## Sinalizacao ambiental

O mundo possui uma camada curatorial leve:

- placas de bioma em pontos aleatorios da geracao
- leitura estilo parque ou museu ao ar livre
- texto curto associado a `mata ciliar`, `varzea`, `terra firme` ou `lago`
