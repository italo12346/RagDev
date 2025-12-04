# 📱 RagDev — Sua Rede Social para Desenvolvedores

RagDev é uma rede social criada para conectar desenvolvedores, compartilhar conhecimento e construir comunidade.  
Aqui você pode criar posts, interagir com outros devs, acompanhar projetos e trocar ideias sobre tecnologia e carreira — tudo em um ambiente rápido, limpo e feito para quem respira código.

---
# 🚀 Tecnologias Utilizadas

## **Backend (API - Golang)**
- Go (Golang)
- Gorilla Mux
- MySQL
- JWT Authentication
- MVC + Repository Pattern
- Swagger Documentation

## **Frontend (Next.js)**
- Next.js (App Router)
- TypeScript
- TailwindCSS
- Axios
- Zustand
- React Hooks e Components reutilizáveis

---

# 📚 Funcionalidades

## 🖥️ Backend (API)
- 👤 Cadastro e login de usuários  
- ✍️ CRUD de posts  
- ❤️ Sistema de likes  
- 👥 Seguir / deixar de seguir usuários  
- 🔒 Autenticação com JWT  
- 🔍 Filtros e busca  
- 📄 Rotas documentadas com Swagger  
- 🧱 Arquitetura por camadas (Controller, Model, Repository)

## 🎨 Frontend (Next.js)
- 🌙 Interface moderna e responsiva  
- 🧭 Navegação rápida com App Router  
- ✍️ Criar e visualizar posts  
- ❤️ Curtir e interagir em tempo real  
- 👤 Perfis completos com posts, seguidores e seguindo  
- 🔐 Login e cadastro conectados à API  
- 🗂️ Pastas organizadas (contexts, hooks, utils, components, services)

---

# 🏗️ Arquitetura do Projeto

```
Cliente (Next.js)
      ↓
Serviços (Axios) → Auth + Posts + Profile
      ↓
API REST (Go)
      ↓
Controller → Repository → MySQL
```

---

# 📁 Estrutura do Projeto

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
    ├── app/
    ├── components/
    ├── contexts/
    ├── hooks/
    ├── public/
    ├── services/
    ├── types/
    ├── utils/
    ├── .env
    ├── .env.example
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── postcss.config.mjs
    └── tailwind.config.js
```

---

# 🔧 Como Rodar o Projeto

## ⚠️ Pré-requisitos
- **MySQL** instalado e rodando  
- **Node.js 18+**  
- **Go 1.20+**  

---

# 🐹 Rodando o Backend (Go)

### 1️⃣ Entrar na pasta
```bash
cd api
```

### 2️⃣ Configurar `.env`
Crie ou edite o arquivo `.env`:

```env
DB_USER=root
DB_PASSWORD=suasenha
DB_NAME=ragdev
DB_HOST=localhost
JWT_SECRET=minha_super_chave
```

### 3️⃣ Instalar dependências
```bash
go mod tidy
```

### 4️⃣ Rodar o servidor
```bash
go run main.go
```

A API estará disponível em:

```
http://localhost:5000
```

Swagger:
```
http://localhost:5000/swagger/
```

---

# ⚛️ Rodando o Frontend (Next.js)

### 1️⃣ Entrar na pasta

```bash
cd frontend
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Rodar em desenvolvimento

```bash
npm run dev
```

### 4️⃣ (Opcional) Build de produção

```bash
npm run build
npm start
```

Frontend disponível em:

```
http://localhost:3000
```

---

# 🧪 Scripts de Banco de Dados (Opcional)

Crie o banco:

```sql
CREATE DATABASE ragdev;
```

---
