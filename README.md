<p align="center">
  <img src="web/src/assets/Logo_IconDark.png" width="72" alt="Ícone do HelpDesk" />
</p>

<h1 align="center">HelpDesk</h1>

<p align="center">
  Plataforma fullstack para abertura, acompanhamento e gerenciamento de chamados técnicos.
</p>

<p align="center">
  <a href="https://help-desk-lovat.vercel.app">Aplicação</a>
  ·
  <a href="https://helpdesk-api-7vdo.onrender.com/health">Status da API</a>
</p>

## Sobre

O HelpDesk organiza o fluxo de atendimento técnico entre administradores, clientes e técnicos. O projeto foi desenvolvido como projeto final do curso Fullstack da Rocketseat, com regras de negócio, autenticação, autorização por perfil, catálogo de serviços, preços congelados por chamado e deploy em produção.

## Funcionalidades

### Administrador

- Gerencia técnicos, clientes e catálogo de serviços.
- Cria, edita, ativa e desativa serviços.
- Acompanha todos os chamados e altera status dentro das transições permitidas.

### Cliente

- Cria conta e atualiza o próprio perfil, senha e avatar.
- Cria chamados selecionando um serviço ativo.
- Acompanha lista e detalhes dos próprios chamados.
- Consulta técnico responsável, serviços adicionais e valor total.

### Técnico

- Atualiza próprio perfil, senha e avatar.
- Consulta somente chamados atribuídos.
- Inicia e encerra atendimentos conforme status do chamado.
- Adiciona serviços extras livres durante um atendimento.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front-end | React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form |
| Back-end | Node.js, Express, TypeScript, Zod, JWT, Multer |
| Banco de dados | PostgreSQL, Prisma ORM |
| Qualidade | Biome, Jest, Supertest |
| Ambiente | Docker Compose |
| Deploy | Vercel (web) e Render (API e PostgreSQL) |

## Arquitetura

```text
HelpDesk/
├── api/                 # API Express, Prisma, autenticação e regras de negócio
│   ├── prisma/          # Schema, migrations e seed
│   ├── src/modules/     # auth, client, technician, services, tickets e upload
│   └── tests/           # Testes de integração HTTP
├── web/                 # SPA React organizada por features
│   └── src/modules/     # auth, admin, client e technician
└── render.yaml          # Blueprint de deploy da API e banco no Render
```

## Requisitos

- Node.js 22 ou superior
- npm
- Docker e Docker Compose para o banco local

## Executando localmente

### 1. Clone o projeto

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd HelpDesk
```

### 2. Configure e inicie o banco

```bash
cd api
Copy-Item .env.example .env
```

Preencha `api/.env` com uma `DATABASE_URL` local e um `JWT_SECRET` seguro. Para usar o Docker Compose, inclua também as variáveis abaixo no mesmo arquivo:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=helpdeskdb
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/helpdeskdb?schema=public
```

Inicie o PostgreSQL:

```bash
docker compose -f docker-compose.yaml up -d
```

### 3. Inicie a API

Ainda em `api/`:

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

A API ficará disponível em `http://localhost:2000`.

### 4. Inicie o front-end

Em outro terminal:

```bash
cd web
Copy-Item .env.example .env
npm install
npm run dev
```

O arquivo `web/.env` deve conter a URL da API local:

```env
VITE_API_URL=http://localhost:2000
```

A aplicação ficará disponível em `http://localhost:5173`.

> [!NOTE]
> Os comandos `Copy-Item` são do PowerShell. Em macOS ou Linux, use `cp .env.example .env`.

## Variáveis de ambiente

### API (`api/.env`)

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta HTTP da API. Padrão do exemplo: `2000`. |
| `DATABASE_URL` | URL de conexão PostgreSQL usada pelo Prisma. |
| `JWT_SECRET` | Chave usada para assinar tokens JWT. Use valor longo e secreto. |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula. |
| `POSTGRES_USER` | Usuário PostgreSQL usado pelo Docker Compose local. |
| `POSTGRES_PASSWORD` | Senha PostgreSQL usada pelo Docker Compose local. |
| `POSTGRES_DB` | Nome do banco PostgreSQL usado pelo Docker Compose local. |

### Web (`web/.env`)

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL pública ou local da API consumida pelo front-end. |

## Scripts úteis

### API

```bash
cd api
npm run dev           # Inicia API com watch
npm run build         # Gera dist/server.js
npm start             # Inicia versão compilada
npm test              # Executa testes de integração com .env.test
npm run test:watch    # Executa Jest em modo watch
npm run test:db:reset # Reseta apenas o banco configurado em .env.test
```

### Web

```bash
cd web
npm run dev     # Inicia Vite
npm run lint    # Valida estilo e formatação com Biome
npm run build   # Executa type-check e build de produção
npm run preview # Visualiza build de produção localmente
```

## Testes

Os testes do back-end são testes de integração HTTP com Jest e Supertest. Eles cobrem autenticação, autorização por perfil, usuários, serviços, chamados, regras de transição de status, preço congelado, serviços adicionais e operações em cascata.

> [!WARNING]
> Antes de executar `npm test`, configure `api/.env.test` para apontar para um banco exclusivo de testes. Nunca use o banco de desenvolvimento ou produção para `npm run test:db:reset`.

## Deploy

- A API e o PostgreSQL são definidos em [`render.yaml`](render.yaml).
- O front-end é publicado pela Vercel com configuração em [`web/vercel.json`](web/vercel.json).
- Em produção, configure `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` e `VITE_API_URL` diretamente nos provedores de hospedagem.

## Demonstração

Existe uma demonstração em vídeo do fluxo Admin → Cliente → Técnico: criação de serviço, abertura de chamado, início do atendimento, inclusão de serviço adicional e encerramento.

Assista à publicação no LinkedIn: [Demonstração do HelpDesk](https://www.linkedin.com/posts/kauagabriell1_fullstack-react-nodejs-ugcPost-7487555408384020480-ZmiG/).

O vídeo é gerado localmente em `docs/video/` e não é versionado pelo Git.
