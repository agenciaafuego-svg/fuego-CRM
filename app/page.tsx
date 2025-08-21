"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/contexts/theme-context"
import { supabase } from "@/utils/supabase-client"
import { LoginForm } from "@/components/auth/login-form"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PeriodFilter } from "@/components/dashboard/period-filter"
import { Charts } from "@/components/dashboard/charts"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ClientTable } from "@/components/clients/client-table"
import { ClientForm } from "@/components/clients/client-form"
import { RankingList } from "@/components/ranking/ranking-list"
import { UserManagement } from "@/components/admin/user-management"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Client, User, DashboardStats } from "@/lib/types"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { ScheduleList } from "@/components/schedule/schedule-list"
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings"
import { withTimeout } from "@/lib/utils"
import { subDays, subWeeks, subMonths, startOfYear } from "date-fns"

const API_TIMEOUT = 15000
const LOAD_TIMEOUT = 30000

export default function Home() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const { setTheme } = useTheme()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [dashboardPeriod, setDashboardPeriod] = useState("month")
  const [clientListPeriod, setClientListPeriod] = useState("all")
  const [stats, setStats] = useState<DashboardStats>({
    totalClosed: 0,
    totalPending: 0,
    failedMeetings: 0,
    clientsInEvaluation: 0,
    pendingMeetings: 0,
  })
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [rankings, setRankings] = useState<any[]>([])
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const dashboardInitialized = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user && !dashboardInitialized.current) {
      console.log("👤 Usuário logado detectado, inicializando dashboard:", user.email, user.role)
      dashboardInitialized.current = true

      const savedTheme = localStorage.getItem("fuego-theme")
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme)
        console.log("🎨 Tema aplicado:", savedTheme)
      }
    } else if (!user && dashboardInitialized.current) {
      console.log("❌ Usuário deslogado, resetando dashboard")
      dashboardInitialized.current = false
    }
  }, [user, setTheme])

  const loadStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      let query = supabase.from("clients").select("*")

      if (user.role !== "admin") {
        query = query.eq("user_id", user.id)
      }

      const now = new Date()
      let startDate: Date

      switch (dashboardPeriod) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = subWeeks(now, 1)
          break
        case "month":
          startDate = subMonths(now, 1)
          break
        default:
          startDate = new Date(0)
      }

      if (dashboardPeriod !== "all") {
        query = query.gte("created_at", startDate.toISOString())
      }

      const { data: clientsData } = await withTimeout(query, API_TIMEOUT)

      if (clientsData) {
        const totalClosed = clientsData
          .filter((c) => c.status === "sucedida")
          .reduce((sum, c) => sum + c.closed_value, 0)

        const totalPending = clientsData
          .filter((c) => c.status === "pendente")
          .reduce((sum, c) => sum + c.proposed_value, 0)

        const failedMeetings = clientsData.filter((c) => c.status === "falha").length
        const clientsInEvaluation = clientsData.filter((c) => c.status === "avaliando").length
        const pendingMeetings = clientsData.filter(
          (c) => c.status === "pendente" && new Date(c.meeting_date) >= now,
        ).length

        setStats({
          totalClosed,
          totalPending,
          failedMeetings,
          clientsInEvaluation,
          pendingMeetings,
        })
      }
    } catch (error) {
      console.error("Error loading stats:", error)
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMeetLink = async (clientId: string, meetLink: string) => {
    try {
      const { error } = await withTimeout(
        supabase.from("clients").update({ google_meet_link: meetLink }).eq("id", clientId),
        API_TIMEOUT,
      )

      if (error) throw error

      toast({
        title: "Link atualizado!",
        description: "O link do Google Meet foi salvo com sucesso.",
      })

      await withTimeout(loadClients(), LOAD_TIMEOUT)
    } catch (error) {
      console.error("Erro ao salvar link:", error)
      toast({
        title: "Erro ao salvar link",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleToggleAcknowledged = async (clientId: string, acknowledged: boolean) => {
    if (!user || user.role !== "admin") {
      toast({
        title: "Permissão negada",
        description: "Apenas administradores podem marcar reuniões como cientes.",
        variant: "destructive",
      })
      return
    }

    try {
      const updateData = {
        admin_acknowledged: acknowledged,
        acknowledged_by: acknowledged ? user.id : null,
        acknowledged_at: acknowledged ? new Date().toISOString() : null,
      }

      const { error } = await withTimeout(supabase.from("clients").update(updateData).eq("id", clientId), API_TIMEOUT)

      if (error) throw error

      await withTimeout(loadClients(), LOAD_TIMEOUT)
    } catch (error) {
      console.error("Erro ao atualizar status de confirmação:", error)
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
      throw error
    }
  }

  const loadClients = async () => {
    if (!user) return

    try {
      let query = supabase
        .from("clients")
        .select(`
        *,
        user:users!clients_user_id_fkey(name, email),
        acknowledgedByUser:users!clients_acknowledged_by_fkey(name, email)
      `)
        .order("created_at", { ascending: false })

      if (user.role !== "admin") {
        query = query.eq("user_id", user.id)
      }

      const now = new Date()
      let startDate: Date | null = null

      switch (clientListPeriod) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "3days":
          startDate = subDays(now, 3)
          break
        case "week":
          startDate = subWeeks(now, 1)
          break
        case "15days":
          startDate = subDays(now, 15)
          break
        case "month":
          startDate = subMonths(now, 1)
          break
        case "year":
          startDate = startOfYear(now)
          break
        case "all":
        default:
          startDate = null
          break
      }

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString())
      }

      const { data, error } = await withTimeout(query, API_TIMEOUT)
      if (error) throw error

      setClients(data || [])
    } catch (error) {
      console.error("Error loading clients:", error)
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      })
      throw error
    }
  }

  const loadUsers = async () => {
    if (!user) return

    try {
      const { data, error } = await withTimeout(
        supabase.from("users").select("*").order("created_at", { ascending: false }),
        API_TIMEOUT,
      )
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      })
      throw error
    }
  }

  const loadRankings = async () => {
    if (!user) return

    try {
      const { data: clientsData, error: clientsError } = await withTimeout(
        supabase.from("clients").select("*"),
        API_TIMEOUT,
      )

      if (clientsError) {
        console.error("Erro ao carregar clientes para ranking:", clientsError)
        throw clientsError
      }

      const { data: usersData, error: usersError } = await withTimeout(supabase.from("users").select("*"), API_TIMEOUT)

      if (usersError) {
        console.error("Erro ao carregar usuários para ranking:", usersError)
        throw usersError
      }

      if (clientsData && usersData) {
        const usersMap = usersData.reduce((acc: any, user: any) => {
          acc[user.id] = user
          return acc
        }, {})

        const userStats = clientsData.reduce((acc: any, client: any) => {
          const userId = client.user_id
          const user = usersMap[userId]

          if (!user) return acc

          if (!acc[userId]) {
            acc[userId] = {
              user: user,
              clientsCount: 0,
              totalClosed: 0,
              successfulMeetings: 0,
            }
          }

          acc[userId].clientsCount++
          if (client.status === "sucedida") {
            acc[userId].totalClosed += client.closed_value
            acc[userId].successfulMeetings++
          }

          return acc
        }, {})

        const rankings = Object.values(userStats)
          .map((stats: any) => ({
            ...stats,
            conversionRate: stats.clientsCount > 0 ? (stats.successfulMeetings / stats.clientsCount) * 100 : 0,
          }))
          .sort((a: any, b: any) => b.totalClosed - a.totalClosed)

        setRankings(rankings)
      }
    } catch (error) {
      console.error("Error loading rankings:", error)
      toast({
        title: "Erro ao carregar ranking",
        description: "Não foi possível carregar os dados do ranking.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleClientSubmit = async (clientData: Partial<Client>) => {
    if (!user) return

    try {
      setLoading(true)
      let error
      if (editingClient) {
        ;({ error } = await withTimeout(
          supabase.from("clients").update(clientData).eq("id", editingClient.id),
          API_TIMEOUT,
        ))
      } else {
        ;({ error } = await withTimeout(
          supabase.from("clients").insert([{ ...clientData, user_id: user.id }]),
          API_TIMEOUT,
        ))
      }

      if (error) throw error

      toast({
        title: editingClient ? "Cliente atualizado!" : "Cliente criado!",
        description: editingClient
          ? "As informações foram salvas com sucesso."
          : "O novo cliente foi adicionado com sucesso.",
      })

      setShowClientForm(false)
      setEditingClient(null)
      await Promise.all([
        withTimeout(loadClients(), LOAD_TIMEOUT),
        withTimeout(loadStats(), LOAD_TIMEOUT),
        withTimeout(loadRankings(), LOAD_TIMEOUT),
      ])
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (clientId: string, status: Client["status"]) => {
    try {
      const { error } = await withTimeout(supabase.from("clients").update({ status }).eq("id", clientId), API_TIMEOUT)

      if (error) throw error

      toast({
        title: "Status atualizado!",
        description: "O status do cliente foi alterado com sucesso.",
      })

      await Promise.all([
        withTimeout(loadClients(), LOAD_TIMEOUT),
        withTimeout(loadStats(), LOAD_TIMEOUT),
        withTimeout(loadRankings(), LOAD_TIMEOUT),
      ])
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!user) return

    try {
      const clientToDelete = clients.find((c) => c.id === clientId)
      if (!clientToDelete) {
        toast({
          title: "Erro",
          description: "Cliente não encontrado.",
          variant: "destructive",
        })
        return
      }

      const canDelete = user.role === "admin" || clientToDelete.user_id === user.id
      if (!canDelete) {
        toast({
          title: "Permissão negada",
          description: "Você não tem permissão para excluir este cliente.",
          variant: "destructive",
        })
        return
      }

      const { error } = await withTimeout(supabase.from("clients").delete().eq("id", clientId), API_TIMEOUT)

      if (error) throw error

      toast({
        title: "Cliente excluído!",
        description: "O cliente foi removido com sucesso.",
      })

      await Promise.all([
        withTimeout(loadClients(), LOAD_TIMEOUT),
        withTimeout(loadStats(), LOAD_TIMEOUT),
        withTimeout(loadRankings(), LOAD_TIMEOUT),
      ])
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleCreateUser = async (userData: {
    name: string
    email: string
    password: string
    role: "admin" | "prospectador"
  }) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: { name: userData.name },
        }),
        API_TIMEOUT,
      )

      if (error) throw error

      const { data: newUserAuth } = await withTimeout(supabase.auth.admin.listUsers(), API_TIMEOUT)
      const createdUserAuth = newUserAuth.users.find((u) => u.email === userData.email)

      if (createdUserAuth) {
        const { error: updateError } = await withTimeout(
          supabase.from("users").update({ role: userData.role, name: userData.name }).eq("id", createdUserAuth.id),
          API_TIMEOUT,
        )

        if (updateError) throw updateError
      }

      toast({
        title: "Usuário criado!",
        description: "O novo usuário foi criado com sucesso.",
      })

      await withTimeout(loadUsers(), LOAD_TIMEOUT)
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      toast({
        title: "Erro ao criar usuário",
        description: `Ocorreu um erro ao criar o usuário: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
      throw error
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: "admin" | "prospectador") => {
    if (!user || user.role !== "admin") {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para alterar roles de usuários.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await withTimeout(
        supabase.from("users").update({ role: newRole }).eq("id", userId),
        API_TIMEOUT,
      )

      if (error) throw error

      toast({
        title: "Role atualizada!",
        description: "A role do usuário foi alterada com sucesso.",
      })

      await withTimeout(loadUsers(), LOAD_TIMEOUT)
    } catch (error) {
      console.error("Erro ao atualizar role:", error)
      toast({
        title: "Erro ao atualizar role",
        description: `Ocorreu um erro ao atualizar a role: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    if (user && dashboardInitialized.current) {
      console.log("📊 Carregando dados do dashboard para:", user.email)
      loadStats()
      loadClients()
      loadRankings()
      loadUsers()
    }
  }, [user, dashboardPeriod, clientListPeriod])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro de autenticação: {authError}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-transparent"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Bem-vindo de volta, {user.name}! Aqui está um resumo da sua performance.
                </p>
              </div>
              <PeriodFilter value={dashboardPeriod} onChange={setDashboardPeriod} />
            </div>

            <StatsCards stats={stats} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickActions
                  onNewClient={() => setShowClientForm(true)}
                  onViewClients={() => setCurrentPage("clients")}
                  onViewRanking={() => setCurrentPage("ranking")}
                  onViewSchedule={() => setCurrentPage("schedule")}
                  pendingMeetings={stats.pendingMeetings}
                />
              </div>
              <div>
                <UpcomingMeetings clients={clients} onViewAllSchedules={() => setCurrentPage("schedule")} />
              </div>
            </div>

            <Charts clients={clients} />
          </div>
        )

      case "schedule":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Agendamentos</h1>
            <ScheduleList
              clients={clients}
              currentUser={user}
              onUpdateMeetLink={handleUpdateMeetLink}
              onToggleAcknowledged={handleToggleAcknowledged}
            />
          </div>
        )

      case "clients":
        return (
          <div className="space-y-6 w-full min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Clientes</h1>
              <Button
                onClick={() => setShowClientForm(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
            <div className="overflow-x-auto min-w-0">
              <ClientTable
                clients={clients}
                onEdit={(client) => {
                  setEditingClient(client)
                  setShowClientForm(true)
                }}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteClient}
                currentUser={user}
                allUsers={users}
                periodFilter={clientListPeriod}
                onPeriodFilterChange={setClientListPeriod}
              />
            </div>
          </div>
        )

      case "ranking":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Ranking</h1>
            <RankingList rankings={rankings} />
          </div>
        )

      case "admin":
        return user.role === "admin" ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Painel Administrativo</h1>
            <UserManagement
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUserRole={handleUpdateUserRole}
              loading={loading}
            />
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 min-w-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      <ClientForm
        open={showClientForm}
        onClose={() => {
          setShowClientForm(false)
          setEditingClient(null)
        }}
        onSubmit={handleClientSubmit}
        client={editingClient}
        loading={loading}
        existingClients={clients}
      />

      <Toaster />
    </div>
  )
}
