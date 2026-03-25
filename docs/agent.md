# Diretrizes de Desenvolvimento (Agent)

## Princípios

1. Performance sempre vem primeiro
2. Código simples > código elegante
3. Evitar abstrações prematuras
4. Cada sistema deve ter uma responsabilidade clara

## Boas práticas

* Evitar criação excessiva de objetos por frame
* Reutilizar estruturas sempre que possível
* Minimizar draw calls
* Preferir instancing sempre que possível

## Renderização

* Evitar sombras dinâmicas inicialmente
* Evitar pós-processamento
* Usar materiais simples

## Organização

* Nenhuma classe deve crescer indefinidamente
* Separar lógica de renderização
* Sistemas devem ser independentes

## Debug

* Sempre medir FPS
* Logar apenas quando necessário
* Evitar poluição de console

## Regra crítica

Se algo reduzir FPS de forma perceptível → revisar imediatamente
