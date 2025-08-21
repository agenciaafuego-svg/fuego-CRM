"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { supabase } from "@/utils/supabase-client"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log("📊 Buscando perfil do usuário:", authUser.email)

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (userError) {
        if (userError.code === "PGRST116") {
          console.log("👤 Usuário não encontrado, criando perfil...")
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              id: authUser.id,
              email: authUser.email!,
              name: authUser.user_metadata?.name || authUser.email!.split("@")[0],
              role: "prospectador",
            })
            .select()
            .single()

          if (createError) {
            console.error("❌ Erro ao criar usuário:", createError)
            throw createError
          }

          console.log("✅ Usuário criado:", newUser)
          return newUser
        } else {
          console.error("❌ Erro ao buscar usuário:", userError)
          throw userError
        }
      } else {
        console.log("✅ Usuário encontrado:", userData)
        return userData
      }
    } catch (err) {
      console.error("❌ Erro ao buscar perfil:", err)
      setError(err instanceof Error ? err.message : String(err))
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    console.log("🚀 Inicializando autenticação...")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // 1) Ignora refresh de token
      if (event === "TOKEN_REFRESHED") {
        console.log("⏭️ Ignorando TOKEN_REFRESHED")
        return
      }

      // 2) Trata sessão inicial
      if (event === "INITIAL_SESSION") {
        console.log("🔄 INITIAL_SESSION capturado")
        if (session?.user) {
          setSupabaseUser(session.user)
          const userData = await fetchUserProfile(session.user)
          if (mounted) setUser(userData)
        }
        if (mounted) setLoading(false)
        return
      }

      // 3) Signed in
      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ SIGNED_IN:", session.user.email)
        setSupabaseUser(session.user)
        const userData = await fetchUserProfile(session.user)
        if (mounted) {
          setUser(userData)
          setError(null)
          setLoading(false)
        }
        return
      }

      // 4) Signed out
      if (event === "SIGNED_OUT") {
        console.log("🚪 SIGNED_OUT")
        setSupabaseUser(null)
        setUser(null)
        setError(null)
        if (mounted) setLoading(false)
        return
      }
    })

    return () => {
      mounted = false
      console.log("🧹 Limpando subscription do AuthProvider")
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    console.log("🚪 Fazendo logout...")
    setLoading(true)
    try {
      localStorage.removeItem("fuego-keep-connected")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("❌ Erro no logout:", error)
        setError(error.message)
      }
    } catch (err) {
      console.error("❌ Erro inesperado no logout:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
