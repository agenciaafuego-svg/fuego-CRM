"use client"

import { useState } from "react"
import type { Client, User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Phone, Calendar, DollarSign, Building, UserIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ClientTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onUpdateStatus: (clientId: string, status: Client["status"]) => void
  onDelete: (clientId: string) => void
  currentUser: { id: string; role: "admin" | "prospectador" } | null
  allUsers: User[]
  periodFilter: string
  onPeriodFilterChange: (value: string) => void
}

const statusColors = {
  pendente:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  falha: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  sucedida:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  avaliando: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
}

const statusLabels = {
  pendente: "Pendente",
  falha: "Falha",
  sucedida: "Sucedida",
  avaliando: "Avaliando",
}

export function ClientTable({
  clients,
  onEdit,
  onUpdateStatus,
  onDelete,
  currentUser,
  allUsers,
  periodFilter,
  onPeriodFilterChange,
}: ClientTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [prospectorFilter, setProspectorFilter] = useState<string>("all")

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.niche.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesProspector = prospectorFilter === "all" || client.user_id === prospectorFilter

    return matchesSearch && matchesStatus && matchesProspector
  })

  const totalFilteredClients = filteredClients.length
  const totalClosedFiltered = filteredClients
    .filter((c) => c.status === "sucedida")
    .reduce((sum, c) => sum + c.closed_value, 0)

  const canDeleteClient = (client: Client) => {
    if (!currentUser) return false
    return currentUser.role === "admin" || client.user_id === currentUser.id
  }

  const DeleteButton = ({ client }: { client: Client }) => {
    if (!canDeleteClient(client)) return null

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{client.owner_name}</strong> da empresa{" "}
              <strong>{client.company_name}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(client.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Card className="shadow-lg border-0 dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">Lista de Clientes</CardTitle>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Buscar por nome, empresa ou nicho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="falha">Falha</SelectItem>
                <SelectItem value="sucedida">Sucedida</SelectItem>
                <SelectItem value="avaliando">Avaliando</SelectItem>
              </SelectContent>
            </Select>
            <Select value={prospectorFilter} onValueChange={setProspectorFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por prospectador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Prospectadores</SelectItem>
                {allUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o Período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="3days">Últimos 3 Dias</SelectItem>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="15days">Últimos 15 Dias</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>
              Total de Clientes: <strong className="text-slate-800 dark:text-slate-200">{totalFilteredClients}</strong>
            </span>
            <span>
              Valor Total Fechado:{" "}
              <strong className="text-green-600 dark:text-green-400">
                R$ {totalClosedFiltered.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table className="min-w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-700 dark:text-slate-300">Cliente</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Empresa</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Nicho</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Telefone</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Google Meu Negócio</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Valor Proposto</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Valor Fechado</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Data da Reunião</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Prospectador</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100 max-w-[150px] truncate">
                    {client.owner_name}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
                    {client.company_name}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {client.niche}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    {client.google_meu_negocio ? (
                      <a
                        href={client.google_meu_negocio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        <Building className="w-4 h-4" />
                        Ver Negócio
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/business/search?q=${encodeURIComponent(client.company_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        <Building className="w-4 h-4" />
                        Buscar no Google
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={client.status}
                      onValueChange={(value) => onUpdateStatus(client.id, value as Client["status"])}
                    >
                      <SelectTrigger className="w-[120px] border-0 p-0">
                        <Badge className={statusColors[client.status]}>{statusLabels[client.status]}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="falha">Falha</SelectItem>
                        <SelectItem value="sucedida">Sucedida</SelectItem>
                        <SelectItem value="avaliando">Avaliando</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    R$ {client.proposed_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    R$ {client.closed_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {format(new Date(client.meeting_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {client.user?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(client)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DeleteButton client={client} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {client.owner_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4" />
                      {client.company_name}
                    </p>
                  </div>
                  <Select
                    value={client.status}
                    onValueChange={(value) => onUpdateStatus(client.id, value as Client["status"])}
                  >
                    <SelectTrigger className="w-auto border-0 p-0">
                      <Badge className={statusColors[client.status]}>{statusLabels[client.status]}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="falha">Falha</SelectItem>
                      <SelectItem value="sucedida">Sucedida</SelectItem>
                      <SelectItem value="avaliando">Avaliando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="text-slate-600 dark:text-slate-400">
                    <strong>Nicho:</strong> {client.niche}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <a
                      href={`tel:${client.phone}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {client.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building className="w-4 h-4" />
                    {client.google_meu_negocio ? (
                      <a
                        href={client.google_meu_negocio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Ver Google Meu Negócio
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/business/search?q=${encodeURIComponent(client.company_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Buscar no Google
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(client.meeting_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      Proposto: R$ {client.proposed_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} |
                      Fechado: R$ {client.closed_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <UserIcon className="w-4 h-4" />
                    <span>Prospectador: {client.user?.name || "N/A"}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(client)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <DeleteButton client={client} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum cliente encontrado</div>
        )}
      </CardContent>
    </Card>
  )
}
