-- Este script deve ser executado no SQL Editor do Supabase
-- para criar o usuário de autenticação

-- Primeiro, vamos verificar se o usuário já existe na tabela auth.users
SELECT * FROM auth.users WHERE email = 'victorcarmo2003@gmail.com';

-- Se não existir, você precisa criar o usuário via Supabase Dashboard
-- Vá em Authentication > Users > Add User
-- Email: victorcarmo2003@gmail.com
-- Password: [sua senha]
-- Confirm Password: [sua senha]

-- Depois de criar o usuário via Dashboard, execute este comando para definir como admin:
UPDATE public.users 
SET role = 'admin', name = 'Victor Carmo'
WHERE email = 'victorcarmo2003@gmail.com';

-- Verificar se foi atualizado corretamente
SELECT * FROM public.users WHERE email = 'victorcarmo2003@gmail.com';
