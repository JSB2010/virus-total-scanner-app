import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock window.electronAPI
const mockElectronAPI = {
  logError: jest.fn(),
  openExternal: jest.fn(),
}

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('DropSentinel encountered an unexpected error and needs to restart.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /restart application/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /report bug/i })).toBeInTheDocument()
  })

  it('logs error to electron when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(mockElectronAPI.logError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          name: 'Error',
          message: 'Test error',
          stack: expect.any(String),
        }),
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String),
      })
    )
  })

  it('reloads page when restart button is clicked', () => {
    // Mock window.location.reload
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const restartButton = screen.getByRole('button', { name: /restart application/i })
    fireEvent.click(restartButton)

    expect(mockReload).toHaveBeenCalled()
  })

  it('opens bug report when report bug button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reportButton = screen.getByRole('button', { name: /report bug/i })
    fireEvent.click(reportButton)

    expect(mockElectronAPI.openExternal).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/JSB2010/DropSentinel/issues/new')
    )
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
})
