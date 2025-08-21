"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Calendar, TrendingUp } from "lucide-react"

interface QuickActionsProps {
  onNewClient: () => void
  onViewClients: () => void
  onViewRanking: () => void
  onViewSchedule: () => void // Nova prop
  pendingMeetings: number
}

export function QuickActions({
  onNewClient,
  onViewClients,
  onViewRanking,
  onViewSchedule,
  pendingMeetings,
}: QuickActionsProps) {
  const actions = [
    {
      title: "Novo Cliente",
      description: "Cadastrar novo prospect",
      icon: Plus,
      color: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      onClick: onNewClient,
    },
    {
      title: "Ver Clientes",
      description: "Gerenciar clientes",
      icon: Users,
      color: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      onClick: onViewClients,
    },
    {
      title: "Agendamentos",
      description: "Ver reuniões",
      icon: Calendar,
      color: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      onClick: onViewSchedule,
    },
    {
      title: "Ranking",
      description: "Ver performance",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      onClick: onViewRanking,
    },
  ]

  return (
    <Card className="shadow-lg border-0 dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">⚡ Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white border-0 h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 transform hover:scale-105`}
            >
              <action.icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {pendingMeetings > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                Você tem {pendingMeetings} reunião{pendingMeetings > 1 ? "ões" : ""} pendente
                {pendingMeetings > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
