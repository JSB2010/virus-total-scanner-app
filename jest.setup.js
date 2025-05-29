import '@testing-library/jest-dom'

// Mock electron APIs for testing
global.window = global.window || {}
global.window.electronAPI = {
  // Mock electron API methods
  getStoreValue: jest.fn(),
  setStoreValue: jest.fn(),
  scanFile: jest.fn(),
  selectFiles: jest.fn(),
  selectFolder: jest.fn(),
  showNotification: jest.fn(),
  onFileDetected: jest.fn(),
  onScanProgress: jest.fn(),
  onShowSetupRequired: jest.fn(),
  onShowWelcome: jest.fn(),
  onShowManualScan: jest.fn(),
  onShowSettings: jest.fn(),
  removeAllListeners: jest.fn(),
  removeShowSetupRequiredListener: jest.fn(),
  getDashboardStats: jest.fn(),
  getRecentScans: jest.fn(),
  updateDashboardStats: jest.fn(),
  addScanResult: jest.fn(),
  getMonitoringStatus: jest.fn(),
  setMonitoringStatus: jest.fn(),
  getAutoStartStatus: jest.fn(),
  setAutoStart: jest.fn(),
  deleteFile: jest.fn(),
  showFileInFolder: jest.fn(),
  quarantineFile: jest.fn(),
  getQuarantinedFiles: jest.fn(),
  restoreQuarantinedFile: jest.fn(),
  deleteQuarantinedFile: jest.fn(),
  getQuarantineStats: jest.fn(),
  cleanupQuarantine: jest.fn(),
  isQuarantineAvailable: jest.fn(),
  openExternal: jest.fn(),
  getFilesInFolder: jest.fn(),
  clearAllData: jest.fn(),
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
  },
  AnimatePresence: ({ children }) => children,
}))

// Suppress console warnings in tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: React.createFactory') ||
        args[0].includes('Warning: componentWillReceiveProps'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React Router Future Flag Warning') ||
        args[0].includes('Warning: React.createFactory'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
