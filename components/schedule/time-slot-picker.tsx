"use client"

import { useState, useEffect } from "react"
import type { Client } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Clock, AlertTriangle, CheckCircle, CalendarIcon } from "lucide-react"
import { format, setHours, setMinutes, isSameDay, isSameHour, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TimeSlotPickerProps {
  existingClients: Client[]
  selectedDate: Date | undefined
  selectedTime: string
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
}

export function TimeSlotPicker({
  existingClients,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean; clientName?: string }[]>([])

  // Horários de trabalho (9h às 18h)
  const workingHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const slots = workingHours.map((time) => {
      const [hours, minutes] = time.split(":").map(Number)
      const slotDateTime = setMinutes(setHours(selectedDate, hours), minutes)

      // Verificar se já existe um agendamento neste horário
      const existingClient = existingClients.find((client) => {
        const clientDate = new Date(client.meeting_date)
        return (
          client.status === "pendente" && isSameDay(clientDate, selectedDate) && isSameHour(clientDate, slotDateTime)
        )
      })

      // Verificar se o horário já passou (apenas para hoje)
      const now = new Date()
      const isPastTime = isSameDay(selectedDate, now) && isBefore(slotDateTime, now)

      return {
        time,
        available: !existingClient && !isPastTime,
        clientName: existingClient?.owner_name,
      }
    })

    setAvailableSlots(slots)
  }, [selectedDate, existingClients])

  // Não permitir seleção de datas passadas
  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return isBefore(date, today)
  }

  return (
    <div className="space-y-4">
      {/* Calendário - Melhorado para mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Selecionar Data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={disabledDays}
              locale={ptBR}
              className="rounded-md border w-full max-w-sm mx-auto scale-90 sm:scale-100" // Reduzir escala no mobile
            />
          </div>
        </CardContent>
      </Card>

      {/* Horários Disponíveis - Melhorado para mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Horários Disponíveis
            {selectedDate && (
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                - {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {!selectedDate ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <CalendarIcon className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Selecione uma data para ver os horários disponíveis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Grid responsivo melhorado */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    className={`h-auto p-2 sm:p-3 flex flex-col items-center gap-1 text-xs sm:text-sm ${
                      !slot.available
                        ? "opacity-50 cursor-not-allowed bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        : selectedTime === slot.time
                          ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => slot.available && onTimeSelect(slot.time)}
                    disabled={!slot.available}
                  >
                    <div className="flex items-center gap-1">
                      {slot.available ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                      )}
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    {!slot.available && slot.clientName && (
                      <Badge variant="destructive" className="text-xs px-1 py-0 mt-1">
                        Ocupado
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              {/* Legenda */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 text-sm">Legenda:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-slate-600 dark:text-slate-400">Horário disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span className="text-slate-600 dark:text-slate-400">Horário ocupado</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  * Cada reunião tem duração de 1 hora (30min + 30min preparação)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
