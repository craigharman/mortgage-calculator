import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MortgageCalculator from '../src/components/MortgageCalculator.vue'

// Mock MortgageGraphs component
vi.mock('../src/components/MortgageGraphs.vue', () => ({
  default: {
    name: 'MortgageGraphs',
    props: ['chartData'],
    template: '<div>Chart Mock</div>'
  }
}))

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(),
    aoa_to_sheet: vi.fn(),
    book_append_sheet: vi.fn()
  },
  writeFile: vi.fn()
}))

describe('MortgageCalculator.vue', () => {
  let wrapper = null

  beforeEach(async () => {
    // Reset localStorage mock
    vi.clearAllMocks()
    
    // Create container element
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    // Mount component with required stubs
    wrapper = mount(MortgageCalculator, {
      global: {
        stubs: {
          'mortgage-graphs': true,
          dialog: true
        }
      },
      attachTo: container
    })

    // Wait for component to be ready
    await wrapper.vm.$nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    document.body.innerHTML = ''
  })

  describe('Initial Loan Calculation', () => {
    it('calculates correct monthly payment for standard loan', async () => {
      const testData = {
        loanAmount: 1072715,
        interestRate: 5.94,
        loanTerm: 30,
        repaymentFrequency: 'monthly',
        feeAmount: 248,
        feeFrequency: 'annual',
        additionalPayments: [],
        repaymentChanges: []
      }

      // Set the form data
      wrapper.vm.formData = testData

      // Trigger calculation
      await wrapper.vm.calculateMortgage()
      
      // Wait for Vue to update the DOM
      await wrapper.vm.$nextTick()

      // Verify the monthly payment with proper rounding
      const expectedMonthlyPayment = 6390.15
      const actualMonthlyPayment = wrapper.vm.results.monthlyPayment
      
      // Use a small epsilon for floating point comparison
      expect(Math.abs(actualMonthlyPayment - expectedMonthlyPayment)).toBeLessThan(0.01)
    })

    it('includes annual fee in total cost', async () => {
      const testData = {
        loanAmount: 1072715,
        interestRate: 5.94,
        loanTerm: 30,
        repaymentFrequency: 'monthly',
        feeAmount: 248,
        feeFrequency: 'annual',
        additionalPayments: [],
        repaymentChanges: []
      }

      // Set the form data
      wrapper.vm.formData = testData

      // Trigger calculation
      await wrapper.vm.calculateMortgage()
      
      // Wait for Vue to update the DOM
      await wrapper.vm.$nextTick()

      // Verify that fees are included
      expect(wrapper.vm.results.totalFees).toBeGreaterThan(0)
      
      // Annual fee over 30 years should be 248 * 30 = 7440
      const expectedTotalFees = 7440
      expect(Math.abs(wrapper.vm.results.totalFees - expectedTotalFees)).toBeLessThan(1)
    })
  })

  describe('Repayment Changes', () => {
    it('correctly applies repayment change', async () => {
      const testData = {
        loanAmount: 500000,
        interestRate: 5.94,
        loanTerm: 30,
        repaymentFrequency: 'monthly',
        feeAmount: 0,
        feeFrequency: 'annual',
        additionalPayments: [],
        repaymentChanges: [{
          amount: 4000, // Higher than minimum payment
          month: 1,
          year: new Date().getFullYear()
        }]
      }

      // Set the form data
      wrapper.vm.formData = testData

      // Trigger calculation
      await wrapper.vm.calculateMortgage()
      
      // Wait for Vue to update the DOM
      await wrapper.vm.$nextTick()

      // With higher repayments, loan should be paid off earlier than 30 years (360 months)
      expect(wrapper.vm.results.actualMonthsToRepay).toBeLessThan(360)
      
      // Verify the repayment change is reflected in the payment events
      expect(wrapper.vm.chartData.paymentEvents.length).toBeGreaterThan(0)
      expect(wrapper.vm.chartData.paymentEvents[0].amount).toBe(4000)
    })
  })

  describe('Early Payoff Calculation', () => {
    it('correctly calculates time saved with higher payments', async () => {
      const testData = {
        loanAmount: 500000,
        interestRate: 5.94,
        loanTerm: 30,
        repaymentFrequency: 'monthly',
        feeAmount: 0,
        feeFrequency: 'annual',
        additionalPayments: [],
        repaymentChanges: [{
          amount: 4000, // Higher than minimum payment
          month: 1,
          year: new Date().getFullYear()
        }]
      }

      // Set the form data
      wrapper.vm.formData = testData

      // Trigger calculation
      await wrapper.vm.calculateMortgage()
      
      // Wait for Vue to update the DOM
      await wrapper.vm.$nextTick()

      // Verify time saved text is generated
      expect(wrapper.vm.results.timeSavedText).toBeTruthy()
      expect(wrapper.vm.results.timeSavedText).toContain('earlier')

      // Verify time to repay calculation
      // With $4000 monthly payments, it should take about 11 years and 1 month
      const expectedMonths = 133 // 11 years and 1 month
      expect(Math.abs(wrapper.vm.results.actualMonthsToRepay - expectedMonths)).toBeLessThan(1)

      // Verify standard loan balance plot
      const standardBalances = wrapper.vm.chartData.standardBalances
      expect(standardBalances.length).toBeGreaterThan(1)
      
      // Standard loan balance should decrease over time
      for (let i = 1; i < standardBalances.length; i++) {
        expect(standardBalances[i]).toBeLessThan(standardBalances[i-1])
      }

      // Standard loan should reach zero at end of term
      expect(standardBalances[standardBalances.length - 1]).toBeLessThan(0.01)
    })
  })

  describe('Total Cost Calculation', () => {
    it('calculates total cost including interest and fees', async () => {
      const testData = {
        loanAmount: 500000,
        interestRate: 5.94,
        loanTerm: 30,
        repaymentFrequency: 'monthly',
        feeAmount: 248,
        feeFrequency: 'annual',
        additionalPayments: [],
        repaymentChanges: []
      }

      // Set the form data
      wrapper.vm.formData = testData

      // Trigger calculation
      await wrapper.vm.calculateMortgage()
      
      // Wait for Vue to update the DOM
      await wrapper.vm.$nextTick()

      // Total repayment should include principal, interest, and fees
      expect(wrapper.vm.results.totalRepayment).toBeGreaterThan(testData.loanAmount)
      
      // Total should include loan amount, interest, and fees
      expect(wrapper.vm.results.totalRepayment).toBe(
        wrapper.vm.results.totalInterest + 
        testData.loanAmount + 
        wrapper.vm.results.totalFees
      )
    })
  })

  describe('Chart Data Generation', () => {
    it('generates correct balance data points', async () => {
      const testData = {
        loanAmount: 500000,
        interestRate: 5.94,
        loanTerm: 30,
        repaymentFrequency: 'monthly',
        feeAmount: 0,
        feeFrequency: 'annual',
        additionalPayments: [],
        repaymentChanges: []
      }

      // Set the form data
      wrapper.vm.formData = testData

      // Trigger calculation
      await wrapper.vm.calculateMortgage()
      
      // Wait for Vue to update the DOM
      await wrapper.vm.$nextTick()

      // Verify chart data structure
      expect(wrapper.vm.chartData.balances).toBeTruthy()
      expect(wrapper.vm.chartData.standardBalances).toBeTruthy()
      expect(wrapper.vm.chartData.timeLabels).toBeTruthy()

      // Initial balance should match loan amount
      expect(wrapper.vm.chartData.balances[0]).toBe(testData.loanAmount)
      expect(wrapper.vm.chartData.standardBalances[0]).toBe(testData.loanAmount)

      // Final balance should be close to 0
      const lastIndex = wrapper.vm.chartData.balances.length - 1
      expect(wrapper.vm.chartData.balances[lastIndex]).toBeLessThan(1)
    })
  })

  describe('Standard Loan Plot', () => {
    it('correctly shows standard loan amortization over full term', async () => {
      const testData = {
        loanAmount: 500000,
        interestRate: 5.94,
        loanTerm: 30,
        repaymentFrequency: 'monthly',
        feeAmount: 0,
        feeFrequency: 'annual',
        additionalPayments: [],
        repaymentChanges: [{
          amount: 4000, // Higher than minimum payment
          month: 1,
          year: new Date().getFullYear()
        }]
      }

      // Set the form data
      wrapper.vm.formData = testData

      // Trigger calculation
      await wrapper.vm.calculateMortgage()
      
      // Wait for Vue to update the DOM
      await wrapper.vm.$nextTick()

      const standardBalances = wrapper.vm.chartData.standardBalances
      const timeLabels = wrapper.vm.chartData.timeLabels

      // Test 1: We should have enough points for each year plus start
      expect(standardBalances.length).toBe(Math.ceil(testData.loanTerm) + 1)
      
      // Test 2: First balance should be loan amount
      expect(standardBalances[0]).toBe(testData.loanAmount)
      
      // Test 3: Each balance should be less than the previous
      for (let i = 1; i < standardBalances.length; i++) {
        expect(standardBalances[i]).toBeLessThan(standardBalances[i-1])
      }

      // Test 4: Balance should decrease by roughly consistent percentage each year
      // (allowing for some variation due to amortization)
      const decreaseRates = []
      for (let i = 1; i < standardBalances.length; i++) {
        if (standardBalances[i-1] > 0) {
          const rate = (standardBalances[i-1] - standardBalances[i]) / standardBalances[i-1]
          decreaseRates.push(rate)
        }
      }
      
      // Check rates are within reasonable range of each other
      for (let i = 1; i < decreaseRates.length; i++) {
        const rateChange = Math.abs(decreaseRates[i] - decreaseRates[i-1])
        expect(rateChange).toBeLessThan(0.1) // Allow 10% variation between years
      }

      // Test 5: Final balance should be very close to zero
      expect(standardBalances[standardBalances.length - 1]).toBeLessThan(1)
      
      // Test 6: Time labels should match number of balances
      expect(timeLabels.length).toBe(standardBalances.length)
      expect(timeLabels[0]).toBe('Start')
      for (let i = 1; i < timeLabels.length; i++) {
        expect(timeLabels[i]).toBe(`Year ${i}`)
      }
    })
  })
})
