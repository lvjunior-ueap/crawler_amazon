# Setup Inicial do Projeto

Este documento descreve o processo de configuração do ambiente de desenvolvimento para o projeto **Crawler Amazon**.

---

## 🧰 Pré-requisitos

Antes de começar, é necessário ter instalado:

* Node.js (via NVM recomendado)
* npm (instalado junto com Node)

---

## 🚀 Instalação do Node.js (via NVM)

### 1. Instalar o NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

---

### 2. Recarregar o terminal

```bash
source ~/.bashrc
```

> Se estiver usando zsh:

```bash
source ~/.zshrc
```

---

### 3. Instalar Node.js (LTS)

```bash
nvm install --lts
```

---

### 4. Ativar a versão instalada

```bash
nvm use --lts
```

---

### 5. Verificar instalação

```bash
node -v
npm -v
```

---

## 📦 Inicialização do projeto com Vite

Dentro do diretório do projeto:

```bash
npm create vite@latest .
```

### Opções selecionadas:

* **Ignore files and continue**
* **Framework:** Vanilla
* **Linguagem:** JavaScript

---

## 📥 Instalar dependências

```bash
npm install
npm install three
```

---

## ▶️ Executar o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:5173
```

---

## 📁 Estrutura inicial gerada

```bash
index.html
main.js
style.css
```

---

## ⚠️ Observações importantes

* Sempre utilizar Node via NVM
* Evitar versões antigas do Node (via apt)
* Testar preferencialmente em:

  * Chrome
  * Firefox

---

## 🧭 Próximos passos

* Refatorar estrutura para `/src`
* Implementar Game Loop
* Integrar renderização com Three.js
* Criar base de cena 3D

---

## 💡 Dica

Se houver problemas com versão do Node:

```bash
nvm use --lts
```

---

## 📌 Status

✔ Ambiente pronto para desenvolvimento
