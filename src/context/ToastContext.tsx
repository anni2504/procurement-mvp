import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  exiting?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast)))
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 250)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '380px' }}>
        {toasts.map((toast) => {
          const colors = {
            success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
            info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          }
          const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
          }
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${colors[toast.type]} ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}`}
            >
              <span className="text-sm font-bold mt-0.5 flex-shrink-0">{icons[toast.type]}</span>
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-auto text-xs opacity-50 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
