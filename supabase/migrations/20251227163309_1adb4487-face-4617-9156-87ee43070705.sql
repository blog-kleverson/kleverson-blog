-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum para status dos posts
CREATE TYPE public.post_status AS ENUM ('draft', 'scheduled', 'published');

-- Tabela de posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  body TEXT,
  cover_image TEXT,
  category TEXT NOT NULL,
  status post_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles (separada por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Tabela de profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function para verificar role (SECURITY DEFINER evita recursão)
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

-- RLS Policies para posts
-- Leitura pública de posts publicados
CREATE POLICY "Posts publicados são visíveis para todos"
ON public.posts
FOR SELECT
USING (status = 'published' AND (scheduled_at IS NULL OR scheduled_at <= now()));

-- Admins podem ver todos os posts
CREATE POLICY "Admins podem ver todos os posts"
ON public.posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem criar posts
CREATE POLICY "Admins podem criar posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins podem atualizar posts
CREATE POLICY "Admins podem atualizar posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem deletar posts
CREATE POLICY "Admins podem deletar posts"
ON public.posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todas as roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para profiles
CREATE POLICY "Profiles são visíveis para todos"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Trigger para criar profile automaticamente
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_category ON public.posts(category);