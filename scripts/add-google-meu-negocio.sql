-- Adicionar coluna google_meu_negocio à tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS google_meu_negocio TEXT;

-- Comentário para documentar a coluna
COMMENT ON COLUMN public.clients.google_meu_negocio IS 'Link ou informações do Google Meu Negócio do cliente';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'google_meu_negocio';
