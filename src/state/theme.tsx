import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const KEY = 'gather-theme'

type ThemeValue = {
  dark: boolean
  setDark: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem(KEY) === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(KEY, dark ? 'dark' : 'light')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101614' : '#f3efe6')
  }, [dark])

  return <ThemeContext.Provider value={{ dark, setDark }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('Theme missing')
  return value
}
