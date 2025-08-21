-- Adicionar novos campos à tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS google_meet_link TEXT,
ADD COLUMN IF NOT EXISTS admin_acknowledged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS acknowledged_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance nas consultas de agendamentos
CREATE INDEX IF NOT EXISTS idx_clients_meeting_date_status ON public.clients(meeting_date, status);

-- Comentários para documentação
COMMENT ON COLUMN public.clients.google_meet_link IS 'Link do Google Meet para a reunião';
COMMENT ON COLUMN public.clients.admin_acknowledged IS 'Se o admin já está ciente da reunião';
COMMENT ON COLUMN public.clients.acknowledged_by IS 'ID do admin que marcou como ciente';
COMMENT ON COLUMN public.clients.acknowledged_at IS 'Data/hora quando foi marcado como ciente';
