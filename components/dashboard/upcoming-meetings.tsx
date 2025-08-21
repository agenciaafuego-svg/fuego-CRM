"use client"

import type { Client } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Building, Video, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UpcomingMeetingsProps {
  clients: Client[]
  onViewAllSchedules: () => void
}

export function UpcomingMeetings({ clients, onViewAllSchedules }: UpcomingMeetingsProps) {
  // Pegar as 3 próximas reuniões pendentes
  const upcomingMeetings = clients
    .filter((client) => client.status === "pendente")
    .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())
    .slice(0, 3)

  const getDateBadge = (dateString: string) => {
    const date = new Date(dateString)

    if (isToday(date)) {
      return <Badge className="bg-green-500 hover:bg-green-600 text-xs">Hoje</Badge>
    }
    if (isTomorrow(date)) {
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Amanhã</Badge>
    }
    return (
      <Badge variant="outline" className="text-xs">
        Agendada
      </Badge>
    )
  }

  return (
    <Card className="shadow-lg border-0 dark:bg-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            🗓️ Próximas Reuniões
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onViewAllSchedules} className="bg-transparent">
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingMeetings.length > 0 ? (
          <div className="space-y-4">
            {upcomingMeetings.map((client, index) => (
              <div
                key={client.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {client.owner_name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {client.company_name}
                      </p>
                    </div>
                  </div>
                  {getDateBadge(client.meeting_date)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(client.meeting_date), "dd/MM", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    {format(new Date(client.meeting_date), "HH:mm", { locale: ptBR })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {client.admin_acknowledged ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Confirmado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">Aguardando</span>
                      </div>
                    )}
                  </div>

                  {client.google_meet_link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(client.google_meet_link, "_blank")}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Meet
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma reunião agendada</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
