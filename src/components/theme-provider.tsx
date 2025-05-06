
"use client"

import * as React from "react"
import { createContext, useContext, useEffect } from "react"

type Theme = "dark"

type ThemeProviderProps = {
  children: React.ReactNode
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
}

const initialState: ThemeProviderState = {
  theme: "dark",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Force dark theme
  const theme: Theme = "dark"

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove any other theme classes
    root.classList.remove("light")
    
    // Add dark theme
    root.classList.add("dark")
    
    // Set custom primary color to match podcast interface
    document.documentElement.style.setProperty('--primary', '139 92 246'); // purple-500
    
    // Store theme preference
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
