"use client"

import { useEffect } from "react"

/**
 * Component to fix hydration warnings caused by browser extensions
 * (like Grammarly) that inject attributes into the DOM
 */
export function HydrationFix() {
  useEffect(() => {
    // Remove Grammarly attributes that cause hydration warnings
    const removeGrammarlyAttributes = () => {
      const body = document.body
      if (body) {
        body.removeAttribute("data-new-gr-c-s-check-loaded")
        body.removeAttribute("data-gr-ext-installed")
      }
      
      const html = document.documentElement
      if (html) {
        html.removeAttribute("data-new-gr-c-s-check-loaded")
        html.removeAttribute("data-gr-ext-installed")
      }
    }

    // Remove immediately on mount
    removeGrammarlyAttributes()

    // Also remove on a short delay to catch any late injections
    const timeout = setTimeout(removeGrammarlyAttributes, 100)

    // Cleanup
    return () => clearTimeout(timeout)
  }, [])

  return null
}


