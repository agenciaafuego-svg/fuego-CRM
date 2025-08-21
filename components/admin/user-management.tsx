"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Shield, UserIcon, Loader2, Mail, Calendar } from "lucide-react"

interface UserManagementProps {
  users: User[]
  onCreateUser: (userData: {
    name: string
    email: string
    password: string
    role: "admin" | "prospectador"
  }) => Promise<void>
  onUpdateUserRole: (userId: string, newRole: "admin" | "prospectador") => Promise<void>
  loading?: boolean
}

export function UserManagement({ users, onCreateUser, onUpdateUserRole, loading }: UserManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "prospectador" as "admin" | "prospectador",
  })
  const [creating, setCreating] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await onCreateUser(formData)
      setFormData({ name: "", email: "", password: "", role: "prospectador" })
      setShowCreateForm(false)
    } finally {
      setCreating(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "prospectador") => {
    setUpdatingUserId(userId)
    try {
      await onUpdateUserRole(userId, newRole)
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <Card className="shadow-lg border-0 dark:bg-slate-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Gerenciamento de Usuários
          </CardTitle>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-700 dark:text-slate-300">Nome</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Email</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Tipo de Acesso</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Data de Criação</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{user.name}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.role === "admin"
                          ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                          : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                      }
                    >
                      {user.role === "admin" ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-3 h-3 mr-1" />
                          Prospectador
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as "admin" | "prospectador")}
                      disabled={updatingUserId === user.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        {updatingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <SelectValue placeholder="Alterar Role" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospectador">Prospectador</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {user.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge
                    className={
                      user.role === "admin"
                        ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                        : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    }
                  >
                    {user.role === "admin" ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-3 h-3 mr-1" />
                        Prospectador
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex justify-end">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as "admin" | "prospectador")}
                    disabled={updatingUserId === user.id}
                  >
                    <SelectTrigger className="w-[140px]">
                      {updatingUserId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <SelectValue placeholder="Alterar Role" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospectador">Prospectador</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum usuário encontrado</div>
        )}
      </CardContent>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                Nome
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                Tipo de Acesso
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "prospectador" })}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospectador">Prospectador</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 w-full sm:w-auto"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Usuário"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
