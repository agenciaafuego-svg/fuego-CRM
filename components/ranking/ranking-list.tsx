"use client"

import type { User } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react"

interface RankingData {
  user: User
  clientsCount: number
  totalClosed: number
  conversionRate: number
}

interface RankingListProps {
  rankings: RankingData[]
}

export function RankingList({ rankings }: RankingListProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
            {position + 1}
          </div>
        )
    }
  }

  const getRankBg = (position: number) => {
    switch (position) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-700"
      case 1:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 dark:from-slate-800/50 dark:to-slate-700/50 dark:border-slate-600"
      case 2:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-700"
      default:
        return "bg-white border-slate-200 dark:bg-slate-800/50 dark:border-slate-600"
    }
  }

  return (
    <Card className="shadow-lg border-0 dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking de Prospectadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankings.map((ranking, index) => (
            <div
              key={ranking.user.id}
              className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${getRankBg(index)}`}
            >
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold">
                        {ranking.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{ranking.user.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{ranking.user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {ranking.totalClosed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {ranking.clientsCount} clientes • {ranking.conversionRate.toFixed(1)}% conversão
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold">
                        {ranking.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {ranking.totalClosed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{ranking.user.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{ranking.user.email}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Users className="w-4 h-4" />
                      {ranking.clientsCount} clientes
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <TrendingUp className="w-4 h-4" />
                      {ranking.conversionRate.toFixed(1)}% conversão
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {rankings.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum dado de ranking disponível</div>
        )}
      </CardContent>
    </Card>
  )
}
