# Aplicação Mary Kay - Gestão de Produtos

Esta aplicação é uma ferramenta de gestão de produtos, desenvolvida com Node.js, Express e PostgreSQL, e empacotada com Docker. Esta documentação explica como configurar e rodar a aplicação localmente com Docker.

## Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuração do Ambiente

### 1. Clone o Repositório

Clone este repositório em seu ambiente local:

```bash
git clone https://github.com/fabiobrasileiroo/api-mary-kay.git
cd api-mary-kay
```

### 2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis de ambiente necessárias. Aqui está um exemplo de como o arquivo `.env` deve se parecer:

```env
DATABASE_URL=postgresql://postgres:password@db:5432/marykay
JWT_SECRET=supersecretkey
```

> **Importante**: Este arquivo `.env` não deve ser versionado no GitHub. Certifique-se de que ele está adicionado ao `.gitignore`.

### 3. Subir a Aplicação com Docker Compose

A aplicação é configurada para rodar com Docker Compose. Para subir a aplicação e o banco de dados, basta rodar o seguinte comando:

```bash
docker-compose up --build
```

Isso irá:

- Construir a imagem da aplicação Node.js.
- Rodar o banco de dados PostgreSQL em um contêiner.
- Expor a aplicação na porta `3000` (pode ser acessada em `http://localhost:3000`).

### 4. Rodar em Modo Produção (Opcional)

Para rodar a aplicação em modo de produção, você pode usar um arquivo de configuração separado `docker-compose.prod.yml`. Primeiro, crie um arquivo `.env.prod` com as variáveis de produção:

```env
DATABASE_URL=postgresql://postgres:password@db:5432/marykay_prod
JWT_SECRET=supersecretkey
```

Então, execute o comando:

```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml up --build -d
```

Isso rodará a aplicação em modo de produção, mapeando a porta `80` para o serviço web.

### 5. Parar a Aplicação

Para parar e remover os contêineres em execução:

```bash
docker-compose down
```

Para a versão de produção:

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## Uso

- **Registro de Usuário**: Acesse a rota `/api/usuarios/registrar` via `POST` para registrar um novo usuário.
- **Login**: Acesse a rota `/api/usuarios/login` via `POST` para realizar o login e receber o token JWT.

---

### Tecnologias Usadas

- **Node.js**
- **Express**
- **PostgreSQL**
- **Docker & Docker Compose**

---

### Contribuição

Sinta-se à vontade para contribuir com este projeto enviando pull requests ou relatando problemas.

---

### Licença

Este projeto é licenciado sob a [MIT License](LICENSE).

---
