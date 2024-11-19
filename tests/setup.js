import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { JSDOM } from 'jsdom'

// Create localStorage mock
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Set up JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true
})

// Set up global objects
global.window = dom.window
global.document = dom.window.document
global.navigator = dom.window.navigator

// Add localStorage mock to window
Object.defineProperty(global.window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class {
    constructor() {}
    destroy() {}
  },
  registerables: []
}))

// Mock vue-chartjs
vi.mock('vue-chartjs', () => ({
  Line: {
    name: 'Line',
    render() {
      return null
    }
  }
}))

// Configure Vue Test Utils
config.global.mocks = {
  $localStorage: localStorageMock
}
