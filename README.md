# 📱 RagDev — Sua Rede Social para Desenvolvedores

RagDev é uma rede social criada para conectar desenvolvedores, compartilhar conhecimento e construir comunidade.  
Aqui você pode criar posts, interagir com outros devs, acompanhar projetos e trocar ideias sobre tecnologia e carreira — tudo em um ambiente rápido, limpo e feito para quem respira código.

---

## 🚀 Tecnologias Utilizadas

### **Backend**
- **Linguagem:** Go (Golang)
- **Banco de Dados:** MySQL  
- **Framework:** Gorilla Mux  
- **Arquitetura:** MVC + Repository Pattern  
- **Autenticação:** JWT  

### **Frontend**
- **Framework:** Next.js (App Router)  
- **Linguagem:** TypeScript  
- **Estilização:** TailwindCSS  
- **Requisições:** Axios  
- **Build:** Turbopack  


---

## 📚 Funcionalidades

### 🖥️ Backend (API)
- 👤 Cadastro e login de usuários  
- ✍️ CRUD de posts  
- ❤️ Sistema de likes  
- 🔒 Autenticação com JWT  
- 📄 Listagens, filtros e busca  
- 👥 Seguir / deixar de seguir usuários  
- 🛠️ API REST organizada em camadas  

### 🎨 Frontend (Next.js)
- 🌙 Interface moderna e responsiva  
- 🧭 Navegação rápida com App Router  
- ✍️ Criar e visualizar posts  
- ❤️ Curtir e interagir sem recarregar página  
- 👤 Perfis completos com posts e seguidores  
- 🔐 Login e cadastro usando JWT   
- 🔄 Loaders, toasts e UX aprimorada  
- 💾 SSR/SSG onde fizer sentido  

---

## 🏗️ Estrutura do Projeto

```bash
# 📱 RagDev — Sua Rede Social para Desenvolvedores

RagDev é uma rede social criada para conectar desenvolvedores, compartilhar conhecimento e construir comunidade.  
Aqui você pode criar posts, interagir com outros devs, acompanhar projetos e trocar ideias sobre tecnologia e carreira — tudo em um ambiente rápido, limpo e feito para quem respira código.

---

## 🚀 Tecnologias Utilizadas

### **Backend (API - Golang)**
- **Linguagem:** Go  
- **Framework:** Gorilla Mux  
- **Arquitetura:** MVC + Repository Pattern  
- **Banco de Dados:** MySQL  
- **Autenticação:** JWT  
- **Documentação:** Swagger (swagger_api_doc.yaml)

### **Frontend (Next.js)**
- **Framework:** Next.js (App Router)  
- **Linguagem:** TypeScript  
- **Estilização:** TailwindCSS  
- **Gerenciamento de Estado:** Zustand  
- **Camada de Serviços:** Axios  
- **Componentes:** shadcn/ui (opcional)

---

## 📚 Funcionalidades

### 🖥️ Backend (API)
- Cadastro e login de usuários  
- CRUD de posts  
- Sistema de likes  
- Seguir / deixar de seguir usuários  
- Autenticação via JWT  
- Rotas documentadas com Swagger  
- Filtros e busca  
- Arquitetura por camadas (Controller, Model, Repository)

### 🎨 Frontend (Next.js)
- Interface moderna responsiva  
- Login e cadastro conectados à API  
- Criar, visualizar e curtir posts  
- Perfis com posts e seguidores  
- Zustand para estados globais  
- Hooks reutilizáveis  
- Camada de serviços centralizada  
- Pastas bem organizadas (contexts, utils, components, etc.)

---

## 🏗️ Estrutura do Projeto

```bash
RAGDEV/
├── api/
│   ├── script/
│   ├── src/
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── router/
│   │   ├── database/
│   │   └── config/
│   ├── .env
│   ├── .env.example
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   └── swagger_api_doc.yaml
│
└── frontend/
    ├── .next/
    ├── app/
    ├── components/
    ├── contexts/
    ├── hooks/
    ├── public/
    ├── services/
    ├── types/
    ├── utils/
    │── .env.example
    ├── .env
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── postcss.config.mjs
    └── tailwind.config.js

│
└── README.md
## 🔧 Como Rodar o Projeto

## ⚠️ Pré-requisitos
- É necessário ter **MySQL** instalado e rodando.
- Node.js 18+ (para o FrontEnd)
- Go 1.20+ (para o BackEnd)

### 1️ Clonar o repositório
```bash
git clone https://github.com/seu-usuario/ragdev.git
cd ragdev
cd api

### 2 Crie Variaveis de Ambiente

DB_USER=root
DB_PASSWORD=suasenha
DB_NAME=ragdev
DB_HOST=localhost
JWT_SECRET=minha_super_chave

### 3 Instalar dependencias 
go mod tidy

### 4 Executar o servidor 
go run main.go


 ## Para o FrontEnd
cd frontend
npm install
npm run build
npm start
```