# Crawler Amazon

Experimento de exploracao 3D em primeira pessoa, rodando no navegador com `Three.js`, focado em uma paisagem amazonica estilizada com relevo procedural, biomas, fauna distribuida por biomassa, clima dinamico e interacoes de observacao.

## Estado atual

O projeto ja possui:

- locomocao em primeira pessoa com colisao e salto
- mundo procedural em faixa retangular no sentido do rio
- quatro biomas legiveis: `mata ciliar`, `varzea`, `terra firme` e `lago`
- ciclo de `dia`, `noite` e `chuva`
- fauna terrestre, arborea, aerea e aquatica
- flora distribuida por especie e idade
- interacao de proximidade com animais e algumas especies vegetais
- HUD com crosshair, prompt e painel de informacao
- controles touch para Android com joystick virtual, olhar por arraste e botoes de acao
- placas de bioma geradas proceduralmente

## Stack

- JavaScript ES Modules
- Three.js
- WebGL
- Vite

## Como rodar

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
```

## Estrutura principal

```text
src/
  core/
    Game.js
    Loop.js
    Renderer.js
  scene/
    Camera.js
    Player.js
    World.js
  systems/
    InputSystem.js
    MovementSystem.js
    SoundSystem.js
  data/
    treeSpecies.json

docs/
  architecture.md
  environment.md
  fauna.md
  flora.md
  geografia.md
  gamestyle.md
  relevo.md
  start.md
  target.md
```

## Documentacao

- [architecture.md](/home/coruja/Projetos/crawler_amazon/docs/architecture.md)
- [environment.md](/home/coruja/Projetos/crawler_amazon/docs/environment.md)
- [relevo.md](/home/coruja/Projetos/crawler_amazon/docs/relevo.md)
- [flora.md](/home/coruja/Projetos/crawler_amazon/docs/flora.md)
- [fauna.md](/home/coruja/Projetos/crawler_amazon/docs/fauna.md)
- [geografia.md](/home/coruja/Projetos/crawler_amazon/docs/geografia.md)
- [screenshots.md](/home/coruja/Projetos/crawler_amazon/docs/screenshots.md)

## Screenshots

Capturas de tela ficam em `docs/screenshots/`.

Arquivos esperados:

- `docs/screenshots/exploracao-primeira-pessoa.png`
- `docs/screenshots/hud-inicial.png`

## Direcao do projeto

O jogo procura um meio-termo entre:

- exploracao contemplativa
- museu interativo ao ar livre
- legibilidade de especies e biomas
- baixo custo de renderizacao

Nao busca simulacao total nem hiper-realismo.
