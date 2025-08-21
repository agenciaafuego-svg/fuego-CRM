"use client"

import { useState } from "react"
import type { Client, User } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  Video,
  UserIcon,
  Building,
  Phone,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Edit,
  Loader2,
} from "lucide-react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ScheduleListProps {
  clients: Client[]
  currentUser: User | null
  onUpdateMeetLink: (clientId: string, meetLink: string) => Promise<void>
  onToggleAcknowledged: (clientId: string, acknowledged: boolean) => Promise<void>
}

export function ScheduleList({ clients, currentUser, onUpdateMeetLink, onToggleAcknowledged }: ScheduleListProps) {
  const [editingMeetLinkClientId, setEditingMeetLinkClientId] = useState<string | null>(null)
  const [meetLinkValue, setMeetLinkValue] = useState("")
  const [isSavingMeetLink, setIsSavingMeetLink] = useState(false)
  const [isTogglingAcknowledged, setIsTogglingAcknowledged] = useState<string | null>(null)
  const { toast } = useToast()

  // Filtrar apenas clientes com reuniões pendentes e ordenar por data
  const scheduledClients = clients
    .filter((client) => client.status === "pendente")
    .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())

  const getDateBadge = (dateString: string) => {
    const date = new Date(dateString)

    if (isPast(date) && !isToday(date)) {
      return (
        <Badge variant="destructive" className="text-xs">
          Atrasada
        </Badge>
      )
    }
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

  const handleSaveMeetLink = async (clientId: string) => {
    // Normaliza o link: adiciona https:// se não tiver
    let normalizedMeetLink = meetLinkValue.trim()
    if (!normalizedMeetLink.startsWith("http://") && !normalizedMeetLink.startsWith("https://")) {
      normalizedMeetLink = `https://${normalizedMeetLink}`
    }

    // Validação mais flexível para links do Google Meet
    // Verifica se contém "meet.google.com" e se é um URL válido
    try {
      const url = new URL(normalizedMeetLink)
      if (!url.hostname.includes("meet.google.com")) {
        toast({
          title: "Erro de Link",
          description: "Por favor, insira um link válido do Google Meet (deve conter 'meet.google.com').",
          variant: "destructive",
        })
        return
      }
    } catch (e) {
      toast({
        title: "Erro de Link",
        description: "O formato do link não é válido. Certifique-se de que é um URL completo.",
        variant: "destructive",
      })
      return
    }

    setIsSavingMeetLink(true)
    try {
      await onUpdateMeetLink(clientId, normalizedMeetLink)
      setEditingMeetLinkClientId(null)
      setMeetLinkValue("")
      // Toast será mostrado pelo componente pai
    } catch (error) {
      // Erro será tratado pelo componente pai
    } finally {
      setIsSavingMeetLink(false)
    }
  }

  const handleToggleAcknowledged = async (clientId: string, currentState: boolean) => {
    if (currentUser?.role !== "admin") {
      toast({
        title: "Permissão negada",
        description: "Apenas administradores podem marcar reuniões como cientes.",
        variant: "destructive",
      })
      return
    }

    setIsTogglingAcknowledged(clientId)
    try {
      await onToggleAcknowledged(clientId, !currentState)
      toast({
        title: currentState ? "Marcado como não ciente" : "Marcado como ciente",
        description: currentState
          ? "A reunião foi desmarcada como ciente."
          : "A reunião foi marcada como ciente e você está preparado.",
      })
    } catch (error) {
      // Erro será tratado pelo componente pai
    } finally {
      setIsTogglingAcknowledged(null)
    }
  }

  return (
    <Card className="shadow-lg border-0 dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Agendamentos ({scheduledClients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledClients.map((client) => (
            <Card key={client.id} className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações do Cliente */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          {client.owner_name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                          <Building className="w-4 h-4" />
                          {client.company_name} • {client.niche}
                        </p>
                      </div>
                      {getDateBadge(client.meeting_date)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(client.meeting_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        {format(new Date(client.meeting_date), "HH:mm", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${client.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {client.phone}
                        </a>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <strong>Prospectador:</strong> {client.user?.name || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Ações e Status */}
                  <div className="flex flex-col gap-3 lg:w-80">
                    {/* Google Meet Link */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Link do Google Meet
                      </Label>
                      {client.google_meet_link ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={client.google_meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate"
                          >
                            {client.google_meet_link}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(client.google_meet_link, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {currentUser?.role === "admin" && (
                            <Dialog
                              open={editingMeetLinkClientId === client.id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setEditingMeetLinkClientId(null)
                                  setMeetLinkValue("")
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingMeetLinkClientId(client.id)
                                    setMeetLinkValue(client.google_meet_link || "")
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Link do Google Meet</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="meetLink">Link do Google Meet</Label>
                                    <Input
                                      id="meetLink"
                                      value={meetLinkValue}
                                      onChange={(e) => setMeetLinkValue(e.target.value)}
                                      placeholder="https://meet.google.com/..."
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingMeetLinkClientId(null)
                                        setMeetLinkValue("")
                                      }}
                                      disabled={isSavingMeetLink}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button onClick={() => handleSaveMeetLink(client.id)} disabled={isSavingMeetLink}>
                                      {isSavingMeetLink ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Salvando...
                                        </>
                                      ) : (
                                        "Salvar"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      ) : (
                        currentUser?.role === "admin" && (
                          <Dialog
                            open={editingMeetLinkClientId === client.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingMeetLinkClientId(null)
                                setMeetLinkValue("")
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start bg-transparent"
                                onClick={() => {
                                  setEditingMeetLinkClientId(client.id)
                                  setMeetLinkValue("")
                                }}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Adicionar Link
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adicionar Link do Google Meet</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="meetLink">Link do Google Meet</Label>
                                  <Input
                                    id="meetLink"
                                    value={meetLinkValue}
                                    onChange={(e) => setMeetLinkValue(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingMeetLinkClientId(null)
                                      setMeetLinkValue("")
                                    }}
                                    disabled={isSavingMeetLink}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button onClick={() => handleSaveMeetLink(client.id)} disabled={isSavingMeetLink}>
                                    {isSavingMeetLink ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                      </>
                                    ) : (
                                      "Salvar"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )
                      )}
                    </div>

                    {/* Admin Acknowledgment */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        {client.admin_acknowledged ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {client.admin_acknowledged ? "Admin Ciente" : "Aguardando Confirmação"}
                        </span>
                      </div>

                      {currentUser?.role === "admin" && (
                        <div className="flex items-center gap-2">
                          {isTogglingAcknowledged === client.id && (
                            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                          )}
                          <Checkbox
                            checked={client.admin_acknowledged}
                            onCheckedChange={() => handleToggleAcknowledged(client.id, client.admin_acknowledged)}
                            disabled={isTogglingAcknowledged === client.id}
                          />
                        </div>
                      )}
                    </div>

                    {client.admin_acknowledged && client.acknowledgedByUser && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Confirmado por {client.acknowledgedByUser.name} em{" "}
                        {client.acknowledged_at &&
                          format(new Date(client.acknowledged_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {scheduledClients.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento pendente encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
