"use client"

import * as React from "react"

export function ThemeProvider({ children, ...props }) {
  const [theme, setTheme] = React.useState("light")

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
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

