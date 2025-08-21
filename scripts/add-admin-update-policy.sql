-- Adicionar política para admins atualizarem qualquer usuário
CREATE POLICY "admins_update_all_users" ON public.users
    FOR UPDATE USING (is_admin(auth.uid()));

-- Opcional: Verificar as políticas ativas para a tabela users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';
