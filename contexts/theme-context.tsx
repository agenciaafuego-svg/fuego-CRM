"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Verificar tema salvo no localStorage
    const savedTheme = localStorage.getItem("fuego-theme") as Theme
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Se não houver tema salvo, verificar preferência do sistema
      const prefersDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      setThemeState(prefersDarkMode ? "dark" : "light")
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Aplicar tema ao documento
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(theme)
      localStorage.setItem("fuego-theme", theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Evitar flash de conteúdo não estilizado
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
