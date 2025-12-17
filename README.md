# API Manager Dashboard

Este projeto adota uma arquitetura desacoplada (**Headless**), onde o Backend (API) e o Frontend (Interface) residem em repositórios Git distintos e se comunicam via protocolo HTTP/REST.

## Estrutura dos Repositórios

| **Componente**     | **Repositório**                                            | **Tecnologias**           | **Hospedagem Sugerida**       |
| ------------------ | ---------------------------------------------------------- | ------------------------- | ----------------------------- |
| **Backend (API)**  | `https://github.com/ElyahuMendesdaSilva/api_supabase_back` | Python, FastAPI, Supabase | Render, Railway, Fly.io       |
| **Frontend (Web)** | `https://github.com/ElyahuMendesdaSilva/api_supabase`      | HTML5, CSS3, JS Vanilla   | Vercel, Netlify, GitHub Pages |

---

## Parte 1: Configuração do Backend (API)

Este repositório contém a lógica de servidor, conexão com banco de dados e regras de upload.

### Pré-requisitos

- Python 3.8+
    
- Conta no Supabase (Projeto criado com buckets `avatars` e `logos`).
    

### Instalação Local

1. **Clone o repositório do Backend:**
    
    Bash
    
    ```
    git clone https://github.com/ElyahuMendesdaSilva/api_supabase_back
    cd api_supabase_back
    ```
    
2. **Crie o ambiente virtual e instale as dependências:**
    
    Bash
    
    ```
    python -m venv venv
    # Windows:
    venv\scripts\activate
    # Linux/Mac:
    source venv/bin/activate
    
    pip install -r requirements.txt
    ```
    
3. Variáveis de Ambiente (.env):
    
    Crie um arquivo .env na raiz e preencha com suas credenciais do Supabase:
    
    Fragmento do código
    
    ```
    SUPABASE_URL=https://seu-projeto.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta
    PORT=8000
    ```
    
4. **Rodar a API:**
    
    Bash
    
    ```
    python main.py
    ```
    
    _A API estará ativa em `http://localhost:8000`._
    

---

## Parte 2: Configuração do Frontend (Client)

Este repositório contém apenas os arquivos estáticos da interface. Ele consome a API configurada acima.

### Configuração da URL da API

O Frontend possui um sistema de detecção automática de ambiente no arquivo `app.js`.

- **Desenvolvimento:** Se você abrir o site em `localhost`, ele tentará conectar em `http://localhost:8000`.
    
- **Produção:** Se o site estiver hospedado (ex: Vercel), ele conectará na URL de produção definida.
    

> **Importante:** Antes de subir para produção, verifique a linha 3 do arquivo `app.js` e insira a URL do seu Backend hospedado:
> 
> JavaScript
> 
> ```
> const API_BASE = window.location.hostname.includes('localhost') 
>   ? 'http://localhost:8000' 
>   : 'https://sua-api-no-render.com'; // <--- ATUALIZE AQUI
> ```

### Instalação e Execução

1. **Clone o repositório do Frontend:**
    
    Bash
    
    ```
    git clone https://github.com/ElyahuMendesdaSilva/api_supabase
    cd api_supabase
    ```
    
2. Executar Localmente:
    
    Como é HTML estático, você precisa de um servidor HTTP simples para evitar erros de CORS (não abra o arquivo direto clicando duas vezes).
    
    - **Opção com Python:**
        
        Bash
        
        ```
        python -m http.server 5500
        ```
        
    - Opção com VSCode:
        
        Instale a extensão "Live Server" e clique em "Go Live".
        
3. **Acesse:** `http://localhost:5500` (ou a porta indicada).
    

---

## Guia de Deploy (Publicação)

Como os repositórios são separados, o deploy é feito de forma independente.

### 1. Deploy do Backend

Recomendado: **Render.com** (Web Service)

1. Conecte o repositório do Backend no Render.
    
2. Runtime: **Python 3**.
    
3. Build Command: `pip install -r requirements.txt`.
    
4. Start Command: `python main.py` (ou `uvicorn main:app --host 0.0.0.0 --port $PORT`).
    
5. **Environment Variables:** Adicione `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nas configurações do painel do Render.
    

### 2. Deploy do Frontend

Recomendado: **Vercel** ou **Netlify**

1. Conecte o repositório do Frontend.
    
2. Como não há build step (é JS puro), basta manter as configurações padrão.
    
3. O deploy será instantâneo.
    
4. **Atenção:** Certifique-se de que atualizou o `app.js` com a URL do backend gerada no passo anterior.
