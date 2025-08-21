-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;

-- Verificar se o usuário existe na tabela auth.users
DO $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Buscar o ID do usuário na tabela auth.users
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = 'victorcarmo2003@gmail.com';
    
    IF auth_user_id IS NOT NULL THEN
        -- Inserir ou atualizar na tabela users
        INSERT INTO public.users (id, email, name, role)
        VALUES (auth_user_id, 'victorcarmo2003@gmail.com', 'Victor Carmo', 'admin')
        ON CONFLICT (id) 
        DO UPDATE SET 
            name = 'Victor Carmo',
            role = 'admin',
            updated_at = NOW();
        
        RAISE NOTICE 'Usuário admin criado/atualizado com sucesso: %', auth_user_id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado na tabela auth.users. Crie via Dashboard primeiro.';
    END IF;
END $$;

-- Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Criar políticas mais simples e sem recursão
-- Para tabela users: permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Para admins: criar uma função que verifica se é admin sem recursão
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para admins verem todos os usuários (usando a função)
CREATE POLICY "admins_select_all_users" ON public.users
    FOR SELECT USING (is_admin(auth.uid()));

-- Política para admins criarem usuários
CREATE POLICY "admins_insert_users" ON public.users
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Políticas para clientes
CREATE POLICY "clients_select_own" ON public.clients
    FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "clients_insert_own" ON public.clients
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_update_own" ON public.clients
    FOR UPDATE USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "clients_delete_own" ON public.clients
    FOR DELETE USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Verificar se tudo foi criado corretamente
SELECT 'Usuários na tabela users:' as info;
SELECT id, email, name, role FROM public.users;

SELECT 'Políticas ativas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('users', 'clients');
