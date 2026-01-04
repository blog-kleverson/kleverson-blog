# Cartas de um Estoico - Blog

Um blog moderno sobre estoicismo com painel administrativo para gerenciamento de posts.

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Gerenciamento de Estado**: TanStack Query

---

## Configuração do Projeto Local

### 1. Pré-requisitos

- Node.js 18+ instalado ([instalar via nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Conta no Supabase (gratuita)

### 2. Clone o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
npm install
```

---

## Configuração do Supabase

### Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Faça login com GitHub, GitLab ou email
4. Após o login, clique em **"New Project"**
5. Escolha sua organização (ou crie uma nova)
6. Preencha os dados do projeto:
   - **Name**: Nome do seu projeto (ex: `cartas-estoico`)
   - **Database Password**: Crie uma senha forte (guarde-a!)
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
7. Clique em **"Create new project"** e aguarde a criação (~2 minutos)

### Passo 2: Configurar o Banco de Dados

Após o projeto ser criado, vá para **SQL Editor** no menu lateral e execute os seguintes comandos SQL **na ordem**:

#### 2.1 Criar Enum e Tabelas

```sql
-- Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar enum para status do post
CREATE TYPE public.post_status AS ENUM ('draft', 'scheduled', 'published');

-- Criar tabela de profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Criar tabela de posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  description TEXT,
  body TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID,
  status post_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de leads (captura de contatos)
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
  description TEXT,
  body TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID,
  status post_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### 2.2 Criar Funções

```sql
-- Função para verificar role do usuário (SECURITY DEFINER para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'display_name', new.email));
  RETURN new;
END;
$$;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

#### 2.3 Criar Triggers

```sql
-- Trigger para criar profile quando usuário se cadastra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at nos posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

#### 2.4 Habilitar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
```

#### 2.5 Criar Políticas de Segurança (RLS Policies)

```sql
-- Políticas para PROFILES
CREATE POLICY "Profiles são visíveis para todos" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio profile" 
  ON public.profiles FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Políticas para USER_ROLES
CREATE POLICY "Usuários podem ver suas próprias roles" 
  ON public.user_roles FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todas as roles" 
  ON public.user_roles FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Políticas para POSTS
CREATE POLICY "Posts publicados são visíveis para todos" 
  ON public.posts FOR SELECT 
  USING (status = 'published' AND (scheduled_at IS NULL OR scheduled_at <= now()));

CREATE POLICY "Admins podem ver todos os posts" 
  ON public.posts FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem criar posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar posts" 
  ON public.posts FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar posts" 
  ON public.posts FOR DELETE 
  USING (has_role(auth.uid(), 'admin'));

-- Políticas para LEADS
CREATE POLICY "Qualquer pessoa pode criar leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os leads"
  ON public.leads FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar leads"
  ON public.leads FOR DELETE
  USING (has_role(auth.uid(), 'admin'));
```

### Passo 3: Configurar Autenticação

1. No Supabase Dashboard, vá para **Authentication** > **Providers**
2. Certifique-se de que **Email** está habilitado
3. Vá para **Authentication** > **Settings**
4. Em **Email Auth**, desabilite **"Confirm email"** para desenvolvimento local (ou deixe habilitado para produção)

### Passo 4: Criar Usuário Admin

1. Vá para **Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha email e senha
4. Após criar o usuário, copie o **User UID**
5. Vá para **SQL Editor** e execute:

```sql
-- Substitua 'SEU_USER_ID_AQUI' pelo UUID do usuário criado
INSERT INTO public.user_roles (user_id, role) 
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

---

## Configuração do Arquivo .env

### Passo 1: Obter as Credenciais

1. No Supabase Dashboard, vá para **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL** (ex: `https://abcdefghij.supabase.co`)
   - **anon public** key (começa com `eyJ...`)
   - **Project ID** (está na URL, ex: `abcdefghij`)

### Passo 2: Criar o Arquivo .env

Na raiz do projeto, crie um arquivo `.env` com o seguinte conteúdo:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://SEU_PROJECT_ID.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="SUA_ANON_KEY_AQUI"
VITE_SUPABASE_PROJECT_ID="SEU_PROJECT_ID"
```

**Exemplo preenchido:**

```env
VITE_SUPABASE_URL="https://abcdefghij.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_PROJECT_ID="abcdefghij"
```

---

## Executando o Projeto

```bash
# Instalar dependências (se ainda não fez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

---

## Acessando o Painel Admin

1. Acesse `/auth` para fazer login
2. Use as credenciais do usuário admin criado
3. Após o login, acesse `/admin` para gerenciar posts

---

## Estrutura de Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial do blog |
| `/sobre` | Página sobre |
| `/cartas` | Lista de cartas/posts |
| `/artigo/:slug` | Post individual |
| `/auth` | Login/Cadastro |
| `/admin` | Painel administrativo (requer admin) |
| `/admin/posts/new` | Criar novo post |
| `/admin/posts/:id` | Editar post existente |

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública (anon) | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto | ✅ |

---

## Troubleshooting

### Erro "Invalid API Key"
- Verifique se a `VITE_SUPABASE_PUBLISHABLE_KEY` está correta
- Certifique-se de usar a chave **anon public**, não a **service_role**

### Usuário não consegue acessar /admin
- Verifique se o usuário tem role 'admin' na tabela `user_roles`
- Execute a query SQL para adicionar a role admin

### Posts não aparecem
- Verifique se os posts estão com `status = 'published'`
- Verifique se `scheduled_at` é NULL ou está no passado

### Erro de RLS/Permissão
- Verifique se todas as políticas RLS foram criadas corretamente
- Verifique se o usuário está autenticado para ações que requerem auth

---

## Licença

Este projeto é de uso pessoal/educacional.
