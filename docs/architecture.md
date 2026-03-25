# Arquitetura do Projeto

## Abordagem

Projeto code-first com separação clara de responsabilidades.

Inspirado em:

* ECS (Entity Component System)
* Game Loop tradicional
* Arquitetura modular

## Stack

* Three.js (renderização)
* WebGL (backend gráfico)
* JavaScript modular

## Estrutura inicial

```
src/
 ├── core/
 │    ├── Game.js
 │    ├── Renderer.js
 │    └── Loop.js
 │
 ├── scene/
 │    ├── World.js
 │    ├── Camera.js
 │    └── Player.js
 │
 ├── systems/
 │    ├── InputSystem.js
 │    └── MovementSystem.js
 │
 └── utils/
      └── Math.js
```

## Conceitos principais

### Game Loop

* update(delta)
* render()

### Separação

* Renderer → apenas desenha
* World → contém entidades
* Systems → lógica

## Decisões importantes

* Evitar dependência de frameworks pesados
* Evitar lógica dentro do renderer
* Tudo deve ser testável isoladamente

## Futuro

* ECS completo
* Chunk system (mundo procedural)
* Sistema de instancing
