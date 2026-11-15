import * as React from "react"
import { palNotch } from "@ui/pal-notch"

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: ToastType
}

interface ToastContextValue {
  toast: (msg: Omit<ToastMessage, "id">) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    return {
      toast: (msg: Omit<ToastMessage, "id">) => {
        palNotch.notify({
          title: msg.title,
          description: msg.description,
          variant: msg.type || "info",
        })
      },
    }
  }
  return context
}

export const toast = {
  success: (title: string, description?: string) => {
    palNotch.success(title, description)
  },
  error: (title: string, description?: string) => {
    palNotch.error(title, description)
  },
  warning: (title: string, description?: string) => {
    palNotch.warning(title, description)
  },
  info: (title: string, description?: string) => {
    palNotch.info(title, description)
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const pushToast = React.useCallback((msg: Omit<ToastMessage, "id">) => {
    palNotch.notify({
      title: msg.title,
      description: msg.description,
      variant: msg.type || "info",
    })
  }, [])

  return (
    <ToastContext.Provider value={{ toast: pushToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const Toaster = ToastProvider

