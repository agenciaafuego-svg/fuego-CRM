"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Client } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CalendarIcon, Clock } from "lucide-react"
import { TimeSlotPicker } from "@/components/schedule/time-slot-picker"
import { setHours, setMinutes, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface ClientFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<Client>) => Promise<void>
  client?: Client | null
  loading?: boolean
  existingClients: Client[]
}

export function ClientForm({ open, onClose, onSubmit, client, loading, existingClients }: ClientFormProps) {
  const [formData, setFormData] = useState({
    owner_name: "",
    company_name: "",
    niche: "",
    phone: "",
    status: "pendente" as Client["status"],
    proposed_value: 0,
    closed_value: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (client) {
      const clientDate = new Date(client.meeting_date)
      setFormData({
        owner_name: client.owner_name,
        company_name: client.company_name,
        niche: client.niche,
        phone: client.phone,
        status: client.status,
        proposed_value: client.proposed_value,
        closed_value: client.closed_value,
      })
      setSelectedDate(clientDate)
      setSelectedTime(format(clientDate, "HH:mm"))
    } else {
      setFormData({
        owner_name: "",
        company_name: "",
        niche: "",
        phone: "",
        status: "pendente",
        proposed_value: 0,
        closed_value: 0,
      })
      setSelectedDate(undefined)
      setSelectedTime("")
    }
    setShowSchedulePicker(false)
  }, [client, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erro de Agendamento",
        description: "Por favor, selecione uma data e horário para a reunião.",
        variant: "destructive",
      })
      return
    }

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const meetingDateTime = setMinutes(setHours(selectedDate, hours), minutes)

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...formData,
        meeting_date: meetingDateTime.toISOString(),
      })

      // Resetar form apenas se não houver erro e não for edição
      if (!client) {
        setFormData({
          owner_name: "",
          company_name: "",
          niche: "",
          phone: "",
          status: "pendente",
          proposed_value: 0,
          closed_value: 0,
        })
        setSelectedDate(undefined)
        setSelectedTime("")
      }
      // onClose será chamado pelo componente pai após sucesso
    } catch (error) {
      console.error("Erro ao submeter formulário:", error)
      // Toast será mostrado pelo componente pai
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return "Selecionar data e horário"
    return `${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`
  }

  const handleConfirmSchedule = () => {
    if (selectedDate && selectedTime) {
      setShowSchedulePicker(false)
      toast({
        title: "Horário confirmado!",
        description: `Reunião agendada para ${formatSelectedDateTime()}`,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {client ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Informações do Cliente</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name" className="text-slate-700 dark:text-slate-300">
                    Nome do Dono *
                  </Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    required
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-slate-700 dark:text-slate-300">
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    placeholder="Ex: Silva & Associados"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="niche" className="text-slate-700 dark:text-slate-300">
                    Nicho *
                  </Label>
                  <Input
                    id="niche"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    required
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    placeholder="Ex: Advocacia, E-commerce, Saúde"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Agendamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Agendamento da Reunião</h3>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-auto p-4 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-orange-600" />
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{formatSelectedDateTime()}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Clique para {selectedDate && selectedTime ? "alterar" : "selecionar"} data e horário
                      </div>
                    </div>
                  </div>
                </Button>

                {showSchedulePicker && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                    <div className="max-h-[60vh] overflow-y-auto">
                      <TimeSlotPicker
                        existingClients={existingClients}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onDateSelect={setSelectedDate}
                        onTimeSelect={setSelectedTime}
                      />
                    </div>
                    <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleConfirmSchedule}
                        disabled={!selectedDate || !selectedTime}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0"
                      >
                        Confirmar Horário
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status e Valores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Status e Valores</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-700 dark:text-slate-300">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Client["status"] })}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="falha">Falha</SelectItem>
                      <SelectItem value="sucedida">Sucedida</SelectItem>
                      <SelectItem value="avaliando">Avaliando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposed_value" className="text-slate-700 dark:text-slate-300">
                      Valor Proposto (R$)
                    </Label>
                    <Input
                      id="proposed_value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.proposed_value}
                      onChange={(e) =>
                        setFormData({ ...formData, proposed_value: Number.parseFloat(e.target.value) || 0 })
                      }
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closed_value" className="text-slate-700 dark:text-slate-300">
                      Valor Fechado (R$)
                    </Label>
                    <Input
                      id="closed_value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.closed_value}
                      onChange={(e) =>
                        setFormData({ ...formData, closed_value: Number.parseFloat(e.target.value) || 0 })
                      }
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading || !selectedDate || !selectedTime}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 w-full sm:w-auto"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : client ? (
                  "Atualizar Cliente"
                ) : (
                  "Criar Cliente"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
