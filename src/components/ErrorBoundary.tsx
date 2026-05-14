import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)

    // Auto-recover from removeChild or other DOM/hydration errors
    if (
      error.message.includes('removeChild') ||
      error.message.includes('Node') ||
      error.message.includes('is not a valid')
    ) {
      const hasReloaded = sessionStorage.getItem('error_reloaded')
      if (!hasReloaded) {
        sessionStorage.setItem('error_reloaded', 'true')
        try {
          localStorage.clear()
        } catch {
          /* intentionally ignored */
        }
        window.location.href = '/login'
      }
    }
  }

  private handleReload = () => {
    try {
      const keysToKeep = ['pocketbase_auth']
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !keysToKeep.includes(key)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
      sessionStorage.clear()
    } catch (err) {
      console.warn('Failed to clear non-essential storage:', err)
    }
    this.setState({ hasError: false, error: null })
  }

  private handleClearAndReload = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (err) {
      console.warn('Failed to clear storage:', err)
    }
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                <span>Ops! Algo deu errado.</span>
              </h1>
              <p className="text-muted-foreground">
                <span>
                  Ocorreu um erro inesperado na aplicação. Tente recarregar a página ou limpar os
                  dados locais para continuar.
                </span>
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-muted/50 rounded-lg text-left text-xs font-mono overflow-auto text-muted-foreground break-words max-h-32 border border-border">
                <span>{this.state.error.message}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={this.handleReload} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </Button>
              <Button variant="outline" onClick={this.handleClearAndReload}>
                <span>Limpar Cache e Recarregar</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
