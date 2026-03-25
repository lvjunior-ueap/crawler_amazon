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

## Persistência de Dados

### Estratégia

A persistência deve seguir a abordagem mais simples possível inicialmente, evoluindo apenas quando necessário.

### Banco de dados

Ordem de preferência:

1. **SQLite**

   * Zero configuração
   * Ideal para prototipagem
   * Baixo overhead
   * Funciona bem com arquivos locais

2. **PostgreSQL**

   * Utilizado apenas se houver necessidade de:

     * Escala
     * Concorrência
     * Queries mais complexas

### Diretrizes

* Evitar dependência de banco no início do projeto
* Preferir dados em memória ou JSON durante prototipagem
* Introduzir persistência apenas quando houver necessidade real

### Possíveis usos futuros

* Salvamento de estado do mundo
* Seeds de geração procedural
* Configurações do jogador
