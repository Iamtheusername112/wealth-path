"use client"

import * as React from "react"

export function ThemeProvider({ children, ...props }) {
  // Force light mode by default for consistency across all devices
  const [theme, setTheme] = React.useState("light")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Always use light mode for now (can be changed later)
    const savedTheme = "light" // Force light mode
    setTheme(savedTheme)
    document.documentElement.classList.remove("dark") // Ensure dark mode is off
    localStorage.setItem("theme", savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const ThemeContext = React.createContext({
  theme: "light",
  toggleTheme: () => {},
})

export const useTheme = () => React.useContext(ThemeContext)

