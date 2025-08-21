"use client"

import { useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ConnectionTest() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult("")

    try {
      let resultText = ""

      // Teste 1: Verificar sessão atual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        resultText += `❌ Erro ao verificar sessão: ${sessionError.message}\n`
      } else if (sessionData.session) {
        resultText += `✅ Usuário autenticado: ${sessionData.session.user.email}\n`
        resultText += `🆔 User ID: ${sessionData.session.user.id}\n`

        // Teste 2: Tentar buscar dados do usuário
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .single()

          if (userError) {
            resultText += `❌ Erro ao buscar dados do usuário: ${userError.message}\n`
            resultText += `💡 Código do erro: ${userError.code}\n`
          } else if (userData) {
            resultText += `✅ Dados do usuário encontrados:\n`
            resultText += `   Nome: ${userData.name}\n`
            resultText += `   Email: ${userData.email}\n`
            resultText += `   Role: ${userData.role}\n`
          }
        } catch (error) {
          resultText += `❌ Erro ao buscar usuário: ${error}\n`
        }
      } else {
        resultText += `❌ Nenhum usuário autenticado\n`
      }

      // Teste 3: Verificar configuração
      resultText += `\n📋 Configuração:\n`
      resultText += `🌐 URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`
      resultText += `🔑 Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurada" : "❌ Não configurada"}\n`

      setResult(resultText)
    } catch (error) {
      console.error("Erro no teste:", error)
      setResult(`❌ Erro inesperado: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testDirectQuery = async () => {
    setLoading(true)
    try {
      // Tentar uma query simples sem RLS
      const { data, error } = await supabase.rpc("is_admin", { user_id: "18dc61ec-a91d-46de-b702-b3ae9e63960f" })

      if (error) {
        setResult(`❌ Erro na função is_admin: ${error.message}`)
      } else {
        setResult(`✅ Função is_admin funcionando: ${data}`)
      }
    } catch (error) {
      setResult(`❌ Erro inesperado: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createUserRecord = async () => {
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        setResult("❌ Faça login primeiro")
        setLoading(false)
        return
      }

      const userId = sessionData.session.user.id
      const userEmail = sessionData.session.user.email

      // Tentar criar o registro do usuário
      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: userId,
          email: userEmail,
          name: "Victor Carmo",
          role: "admin",
        })
        .select()

      if (error) {
        setResult(`❌ Erro ao criar usuário: ${error.message}`)
      } else {
        setResult(`✅ Usuário criado/atualizado com sucesso: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Erro inesperado: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Teste de Conexão Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <Button onClick={testConnection} disabled={loading} className="w-full">
            {loading ? "Testando..." : "Testar Conexão"}
          </Button>
          <Button onClick={testDirectQuery} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "Testando..." : "Testar Função Admin"}
          </Button>
          <Button onClick={createUserRecord} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "Criando..." : "Criar Registro Usuário"}
          </Button>
        </div>
        {result && (
          <pre className="text-sm bg-slate-100 p-4 rounded whitespace-pre-wrap max-h-64 overflow-y-auto">{result}</pre>
        )}
      </CardContent>
    </Card>
  )
}
