"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // Log error to electron main process for crash reporting
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.logError?.({
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReportBug = () => {
    const errorDetails = {
      error: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack || 'No stack trace',
      component: this.state.errorInfo?.componentStack || 'Unknown component',
      timestamp: new Date().toISOString()
    }

    const issueUrl = `https://github.com/JSB2010/virus-total-scanner-app/issues/new?title=Bug%20Report%3A%20${encodeURIComponent(errorDetails.error)}&body=${encodeURIComponent(`
**Error Details:**
- Message: ${errorDetails.error}
- Timestamp: ${errorDetails.timestamp}

**Stack Trace:**
\`\`\`
${errorDetails.stack}
\`\`\`

**Component Stack:**
\`\`\`
${errorDetails.component}
\`\`\`

**Environment:**
- OS: ${navigator.platform}
- User Agent: ${navigator.userAgent}

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**

    `)}`

    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(issueUrl)
    } else {
      window.open(issueUrl, '_blank')
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-lg">
                DropSentinel encountered an unexpected error and needs to restart.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Error Details
                </h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart Application
                </Button>
                <Button
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please{' '}
                  <button
                    type="button"
                    onClick={this.handleReportBug}
                    className="text-primary hover:underline"
                  >
                    report it on GitHub
                  </button>
                  {' '}with the error details above.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Developer Details (Development Mode)
                  </summary>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="text-xs overflow-auto whitespace-pre-wrap mt-2 pt-2 border-t">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
