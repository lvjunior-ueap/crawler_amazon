# Target de Hardware

## Objetivo

Manter a experiencia navegavel em hardware modesto, mesmo com:

- terreno procedural grande
- clima dinamico
- fauna distribuida
- luzes adicionais e lanternas

## Perfil alvo

- CPU: Intel Core i3 antigo ou equivalente
- GPU: Intel HD 4000 ou superior
- RAM: 4 GB a 8 GB

## Navegadores prioritarios

1. Chrome
2. Firefox

Secundarios:

- Edge
- Opera

## Metas praticas

- cena jogavel em hardware modesto
- custo visual concentrado em leitura de ambiente, nao em shaders pesados
- uso de geometria simples e materiais baratos

## Restricoes atuais

- o bundle de JS ainda esta acima de `500 kB`
- `World.js` concentra bastante logica
- ha muitos objetos individuais em cena, embora a linguagem visual seja low-poly

## Diretriz

Quando surgir conflito entre:

- mais fidelidade visual
- mais legibilidade
- mais performance

a preferencia continua sendo:

`legibilidade + performance`
