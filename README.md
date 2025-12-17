# API Manager Dashboard - Supabase Integration
Dashboard completo para gerenciamento de usuários, serviços, cidades e categorias com upload de arquivos para o Supabase Storage.
## Funcionalidades Implementadas

### Backend (FastAPI)

- CRUD completo de Cidades
- CRUD completo de Categorias
- CRUD completo de Usuários
- CRUD completo de Serviços
- Upload de avatar para usuários (Supabase Storage)
- Upload de logo para serviços (Supabase Storage)
- Filtragem de serviços por cidade e categoria
- Remoção de arquivos do storage quando excluídos
- Validações e tratamento de erros
- CORS configurado
### Frontend (HTML/CSS/JS)

- Dashboard responsivo com tema dark
- Interface para todas as operações CRUD
- Upload de arquivos com preview
- Filtragem e busca em tempo real
- Feedback visual para usuário
- Design moderno e intuitivo
  
## Configuração do Ambiente

### 1. Pré-requisitos
- Python 3.8+
- Node.js (apenas para servir frontend estático)
- Conta no Supabase
### 2. Configuração do Supabase
#### 2.1 Criar um novo projeto
1. Acesse [Supabase](https://supabase.com) e crie uma conta (se necessário).
2. Clique em "New project".
3. Preencha os detalhes do projeto (nome, senha, região) e clique em "Create new project".
#### 2.2 Configurar o banco de dados
Após a criação do projeto, acesse o editor SQL (ícone SQL no menu lateral) e execute o seguinte script:

```sql
-- Tabela de cidades

CREATE TABLE cities (

    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    state TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()

);

  

-- Tabela de categorias

CREATE TABLE categories (

    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()

);

  

-- Tabela de usuários

CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    email TEXT UNIQUE NOT NULL,

    avatar_url TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

  

-- Tabela de serviços

CREATE TABLE services (

    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    description TEXT,

    city_id INTEGER REFERENCES cities(id) ON DELETE RESTRICT,

    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,

    logo_url TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);
````

#### 2.3 Criar os buckets no Storage

1. No menu lateral, clique em "Storage".
2. Clique em "Create a new bucket".
3. Crie dois buckets com os nomes:
    - `avatars` (para fotos de perfil)
        
    - `logos` (para logos de serviços)
        
#### 2.4 Configurar políticas de acesso nos buckets
Para que o upload de arquivos funcione, é necessário configurar as políticas de segurança (Row Level Security) em cada bucket.
**Para o bucket `logos`:**

1. Clique no bucket `logos`.
    
2. Vá para a aba "Policies".
    
3. Clique em "New Policy".
    
4. Selecione "Create a policy from scratch".
    
5. Configure a política para permitir todas as operações (SELECT, INSERT, UPDATE, DELETE):
    
    - **Policy Name**: `Allow all operations on logos`
        
    - **Allowed Operations**: Selecione todas (SELECT, INSERT, UPDATE, DELETE)
        
    - **Policy Definition**: `bucket_id = 'logos'`
        
6. Clique em "Save Policy".

**Para o bucket `avatars`:**

1. Clique no bucket `avatars`.
    
2. Siga os mesmos passos acima, criando uma política com o nome `Allow all operations on avatars`.
    

**Nota:** Em um ambiente de produção, é recomendado criar políticas mais restritivas, mas para desenvolvimento e testes, a política acima é suficiente.

#### 2.5 Obter as credenciais do projeto

1. No menu lateral, clique em "Settings" (ícone de engrenagem).
    
2. Selecione "API".
    
3. Anote a `URL` (será a `SUPABASE_URL`) e a `service_role key` (será a `SUPABASE_SERVICE_ROLE_KEY`).
    

### 3. Instalação do Backend

#### 3.1. Crie um ambiente virtual
	python -m venv venv
#### 3.2 Ative o ambiente virtual
##### Windows:
	venv\scripts\activate
##### Linux/Mac:
	source venv/bin/activate

#### 3.3 Instale as dependências
	git clone https://github.com/ElyahuMendesdaSilva/api_supabase
	cd api_supabase
	pip install -r requirements.txt  
