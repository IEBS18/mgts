import { useEffect, useState } from "react"

// Custom hook to manage theme
export function useTheme() {
  const [theme, setTheme] = useState("system")

  useEffect(() => {
    // Get theme from localStorage or default to 'system'
    const savedTheme = localStorage.getItem("theme") || "system"
    setTheme(savedTheme)

    // Apply the saved theme to the document
    if (savedTheme === "light") {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    } else if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      // Apply system theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.add("light")
      }
    }
  }, [])

  // Function to toggle between themes
  const toggleTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    
    if (newTheme === "light") {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    } else if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      // Set to system default
      document.documentElement.classList.remove("light", "dark")
    }
  }

  return { theme, toggleTheme }
}
