-- Remover todas as políticas existentes para recriá-las corretamente
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;

-- Políticas corrigidas para a tabela users (sem recursão)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política simplificada para admins visualizarem todos os usuários
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Política para admins criarem usuários
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Políticas para a tabela clients
CREATE POLICY "Users can view their own clients" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clients" ON public.clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients" ON public.clients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients" ON public.clients
  FOR DELETE USING (user_id = auth.uid());

-- Política para admins visualizarem todos os clientes
CREATE POLICY "Admins can view all clients" ON public.clients
  FOR ALL USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Verificar se o usuário admin existe e criar se necessário
DO $$
BEGIN
  -- Verificar se existe um usuário com o email especificado
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'victorcarmo2003@gmail.com') THEN
    -- Se não existir, você precisa criar via Dashboard primeiro
    RAISE NOTICE 'Usuário não encontrado. Crie o usuário via Supabase Dashboard primeiro.';
  ELSE
    -- Atualizar para admin se já existir
    UPDATE public.users 
    SET role = 'admin', name = 'Victor Carmo'
    WHERE email = 'victorcarmo2003@gmail.com';
    RAISE NOTICE 'Usuário atualizado para admin com sucesso.';
  END IF;
END $$;
