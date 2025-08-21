"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChangePasswordModal } from "@/components/auth/change-password-modal"
import {
  LayoutDashboard,
  Users,
  Trophy,
  LogOut,
  Menu,
  X,
  Shield,
  Moon,
  Sun,
  Settings,
  KeyRound,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "schedule", label: "Agendamentos", icon: Calendar },
    { id: "ranking", label: "Ranking", icon: Trophy },
    ...(user?.role === "admin" ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
  ]

  const handlePageChange = (page: string) => {
    onPageChange(page)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile menu button - Posicionado no centro esquerdo */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-1/2 left-4 -translate-y-1/2 z-50 md:hidden bg-white dark:bg-slate-800 shadow-lg rounded-full w-12 h-12 border border-slate-200 dark:border-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/fuego-logo.svg" alt="Agencia Fuego" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Agencia Fuego
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Prospecção</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-200",
                    currentPage === item.id
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
                  )}
                  onClick={() => handlePageChange(item.id)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  {user?.role === "admin" ? (
                    <Shield className="w-3 h-3 text-orange-600" />
                  ) : (
                    <Users className="w-3 h-3 text-red-600" />
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 mb-2 bg-transparent border-slate-300 dark:border-slate-600"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Alterar Senha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "light" ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                  {theme === "light" ? "Modo Escuro" : "Modo Claro"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* Change Password Modal */}
      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </>
  )
}
