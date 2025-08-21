"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase-client"
// import { useTheme } from "@/contexts/theme-context" // Removido, pois o ThemeProvider já lida com a persistência
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepConnected, setKeepConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSecurityMessage, setShowSecurityMessage] = useState(false)
  const { toast } = useToast()
  // const { setTheme } = useTheme() // Removido
  const router = useRouter()
  const isSubmitting = useRef(false)

  useEffect(() => {
    // Removido: setTheme("light")
    // A persistência do tema agora é gerenciada exclusivamente pelo ThemeProvider

    // Verificar se foi desconectado por segurança
    const wasDisconnected = sessionStorage.getItem("security-disconnect") === "true"
    if (wasDisconnected) {
      setShowSecurityMessage(true)
      sessionStorage.removeItem("security-disconnect")

      setTimeout(() => {
        setShowSecurityMessage(false)
      }, 5000)
    }
  }, []) // Dependências vazias para rodar apenas uma vez

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevenir múltiplas submissões
    if (isSubmitting.current || loading) {
      console.log("⏸️ Login já em andamento, ignorando...")
      return
    }

    isSubmitting.current = true
    setLoading(true)

    try {
      console.log("🔐 Tentando fazer login com:", email)

      // Salvar preferência de manter conectado ANTES do login
      if (keepConnected) {
        localStorage.setItem("fuego-keep-connected", "true")
        console.log("💾 Preferência 'manter conectado' salva")
      } else {
        localStorage.removeItem("fuego-keep-connected")
        console.log("🗑️ Preferência 'manter conectado' removida")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log("📝 Resposta do login:", {
        user: data?.user?.email,
        session: !!data?.session,
        error: error?.message,
      })

      if (error) {
        console.error("❌ Erro de autenticação:", error)

        let errorDescription = "Verifique suas credenciais e tente novamente"

        switch (error.message) {
          case "Invalid login credentials":
            errorDescription = "Email ou senha incorretos"
            break
          case "Email not confirmed":
            errorDescription = "Email não confirmado. Verifique sua caixa de entrada."
            break
          case "Too many requests":
            errorDescription = "Muitas tentativas. Aguarde alguns minutos."
            break
          default:
            errorDescription = error.message
        }

        toast({
          title: "Erro no login",
          description: errorDescription,
          variant: "destructive",
        })
      } else if (data?.session?.user) {
        console.log("✅ Login bem-sucedido!")

        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        })

        // REDIRECIONAMENTO EXPLÍCITO - Esta é a correção principal!
        console.log("🚀 Redirecionando para o dashboard...")
        router.push("/")
      }
    } catch (error) {
      console.error("❌ Erro inesperado:", error)
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      isSubmitting.current = false
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {showSecurityMessage && (
        <Alert className="mb-4 max-w-md border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Por segurança, você foi desconectado após atualizar a página. Faça login novamente.
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md shadow-xl border-0 bg-white backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img src="/fuego-logo.svg" alt="Agencia Fuego" className="w-full h-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Agencia Fuego
            </CardTitle>
            <CardDescription className="text-slate-600">Faça login para acessar sua conta</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="keepConnected"
                checked={keepConnected}
                onCheckedChange={(checked) => setKeepConnected(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="keepConnected" className="text-sm text-slate-600">
                Manter conectado por 7 dias
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 text-center">
              <Shield className="w-3 h-3 inline mr-1" />
              {keepConnected
                ? "Você permanecerá conectado por 7 dias"
                : "Por segurança, você será desconectado se atualizar a página"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
