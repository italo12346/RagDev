# 📱 RagDev — Sua Rede Social para Desenvolvedores

RagDev é uma rede social criada para conectar desenvolvedores, compartilhar conhecimento e construir comunidade.  
Aqui você pode criar posts, interagir com outros devs, acompanhar projetos e trocar ideias sobre tecnologia e carreira — tudo em um ambiente rápido, limpo e feito para quem respira código.

---

## 🚀 Tecnologias Utilizadas

- **Backend:** Go (Golang)  
- **Banco de Dados:** MySQL  
- **Frameworks:** Gorilla Mux  
- **Arquitetura:** MVC + Repository Pattern  
- **Autenticação:** JWT  
- **Outros:** Docker, godotenv, SQL migrations  

---

## 📚 Funcionalidades

- 👤 Cadastro e login de usuários  
- ✍️ Criação e edição de posts  
- ❤️ Sistema de likes  
- 🔒 Autenticação com JWT  
- 📄 Listagem, filtros e busca  
- 👥 Relacionamentos entre usuários (seguir / deixar de seguir)  
- 🛠️ API REST completa

---

## 🏗️ Estrutura do Projeto

```bash
RagDev/
├── api/
│   ├── src/
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── router/
│   │   ├── database/
│   │   └── config/
├── FrontEnd
├── go.mod
└── README.md


---

## 🔧 Como Rodar o Projeto

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

```


