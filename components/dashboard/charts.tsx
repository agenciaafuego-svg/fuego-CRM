"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Client } from "@/lib/types"

interface ChartsProps {
  clients: Client[]
}

export function Charts({ clients }: ChartsProps) {
  // Dados para gráfico de barras dos últimos 7 dias
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const dailyData = last7Days.map((date) => {
    const dayClients = clients.filter((client) => {
      const clientDate = new Date(client.created_at)
      return clientDate.toDateString() === date.toDateString()
    })

    const closed = dayClients.filter((c) => c.status === "sucedida").reduce((sum, c) => sum + c.closed_value, 0)

    return {
      date: date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }),
      value: closed,
      count: dayClients.length,
    }
  })

  const maxValue = Math.max(...dailyData.map((d) => d.value), 1)

  // Dados para gráfico de status
  const statusData = [
    {
      status: "Sucedida",
      count: clients.filter((c) => c.status === "sucedida").length,
      color: "bg-green-500",
      lightColor: "bg-green-100",
    },
    {
      status: "Pendente",
      count: clients.filter((c) => c.status === "pendente").length,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-100",
    },
    {
      status: "Avaliando",
      count: clients.filter((c) => c.status === "avaliando").length,
      color: "bg-blue-500",
      lightColor: "bg-blue-100",
    },
    {
      status: "Falha",
      count: clients.filter((c) => c.status === "falha").length,
      color: "bg-red-500",
      lightColor: "bg-red-100",
    },
  ]

  const totalClients = statusData.reduce((sum, item) => sum + item.count, 0)

  // Calcular tendência
  const thisWeekClosed = clients
    .filter((c) => {
      const clientDate = new Date(c.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return clientDate >= weekAgo && c.status === "sucedida"
    })
    .reduce((sum, c) => sum + c.closed_value, 0)

  const lastWeekClosed = clients
    .filter((c) => {
      const clientDate = new Date(c.created_at)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return clientDate >= twoWeeksAgo && clientDate < weekAgo && c.status === "sucedida"
    })
    .reduce((sum, c) => sum + c.closed_value, 0)

  const trend = thisWeekClosed - lastWeekClosed
  const trendPercentage = lastWeekClosed > 0 ? ((trend / lastWeekClosed) * 100).toFixed(1) : "0"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras - Vendas dos Últimos 7 Dias */}
      <Card className="shadow-lg border-0 dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            📊 Vendas dos Últimos 7 Dias
            <div className="flex items-center gap-1 text-sm">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <Minus className="w-4 h-4 text-slate-600" />
              )}
              <span className={`${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-slate-600"}`}>
                {trend > 0 ? "+" : ""}
                {trendPercentage}%
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyData.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-xs font-medium text-slate-600 dark:text-slate-400">{day.date}</div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(day.value / maxValue) * 100}%` }}
                  >
                    {day.value > 0 && (
                      <span className="text-xs font-medium text-white">R$ {day.value.toLocaleString("pt-BR")}</span>
                    )}
                  </div>
                </div>
                <div className="w-8 text-xs text-slate-500 dark:text-slate-400">{day.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Status dos Clientes */}
      <Card className="shadow-lg border-0 dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            📈 Status dos Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.status}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item.count} ({totalClients > 0 ? ((item.count / totalClients) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className={`w-full ${item.lightColor} dark:bg-slate-700 rounded-full h-2`}>
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${totalClients > 0 ? (item.count / totalClients) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
