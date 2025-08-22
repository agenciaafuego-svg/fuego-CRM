# Implementação do Campo Google Meu Negócio

## Resumo das Mudanças

Este documento descreve as mudanças implementadas para adicionar o campo "Google Meu Negócio" ao sistema de clientes.

## Arquivos Modificados

### 1. `lib/types.ts`
- Adicionado o campo `google_meu_negocio?: string` ao tipo `Client`

### 2. `components/clients/client-form.tsx`
- Adicionado o campo `google_meu_negocio` ao estado do formulário
- Adicionado o campo visual no formulário com label e input
- O campo é opcional (não obrigatório)

### 3. `components/clients/client-table.tsx`
- Adicionada nova coluna "Google Meu Negócio" na tabela de clientes
- Implementação inteligente: mostra link direto quando preenchido, ou link de busca quando vazio
- Funciona tanto na versão desktop quanto mobile

### 4. `scripts/add-google-meu-negocio.sql`
- Script SQL para adicionar a nova coluna ao banco de dados

## Como Aplicar as Mudanças

### 1. Banco de Dados
Execute o script SQL no seu banco Supabase:

```sql
-- Via SQL Editor no Supabase Dashboard
-- Ou via linha de comando se tiver acesso direto

-- Adicionar coluna google_meu_negocio à tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS google_meu_negocio TEXT;

-- Comentário para documentar a coluna
COMMENT ON COLUMN public.clients.google_meu_negocio IS 'Link ou informações do Google Meu Negócio do cliente';
```

### 2. Frontend
As mudanças no frontend já estão implementadas:
- O formulário agora inclui o campo "Google Meu Negócio"
- A tabela de clientes exibe a nova coluna
- O campo é salvo junto com os outros dados do cliente
- Os dados são enviados para o Supabase via API existente

## Funcionalidades

- **Campo Opcional**: O campo não é obrigatório para criar/editar clientes
- **Validação**: Aceita qualquer texto (URLs, nomes de negócios, etc.)
- **Persistência**: Os dados são salvos no banco Supabase
- **Integração**: Funciona com o sistema existente de CRUD de clientes
- **Tabela Inteligente**: 
  - Se o campo estiver preenchido: mostra "Ver Negócio" com link direto
  - Se estiver vazio: mostra "Buscar no Google" com link de busca automática

## Exemplo de Uso

1. Abra o formulário de novo cliente
2. Preencha os campos obrigatórios
3. No campo "Google Meu Negócio", insira:
   - URL do Google Maps: `https://maps.google.com/meu-negocio/...`
   - Nome do negócio: `Restaurante Silva`
   - Ou deixe em branco se não aplicável
4. Salve o cliente
5. Na tabela de clientes, você verá:
   - Nova coluna "Google Meu Negócio"
   - Link direto se o campo estiver preenchido
   - Link de busca automática se estiver vazio

## Verificação

Para verificar se tudo está funcionando:

1. Crie um novo cliente com o campo preenchido
2. Verifique no banco de dados se a coluna foi criada
3. Confirme se o valor foi salvo corretamente
4. Teste a edição de um cliente existente
5. Verifique se a nova coluna aparece na tabela de clientes
6. Teste os links tanto para clientes com campo preenchido quanto vazio

## Notas Técnicas

- A coluna é do tipo `TEXT` para aceitar URLs longas
- O campo é `nullable` (opcional)
- Não há validação específica de formato (aceita qualquer texto)
- Integra-se com o sistema de RLS (Row Level Security) existente
- A tabela usa `encodeURIComponent()` para URLs de busca seguras
- Funciona responsivamente em desktop e mobile
