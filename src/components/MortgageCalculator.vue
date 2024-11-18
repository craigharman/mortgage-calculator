<template>
  <div class="container mx-auto p-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6">Mortgage Calculator</h2>
        
        <form @submit.prevent="calculateMortgage" class="space-y-4">
          <!-- Loan Amount -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Loan Amount ($)</span>
            </label>
            <input
              v-model.number="formData.loanAmount"
              type="number"
              min="0"
              step="1000"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Loan Term -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Loan Term (years)</span>
            </label>
            <input
              v-model.number="formData.loanTerm"
              type="number"
              min="1"
              max="30"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Interest Rate -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Interest Rate (%)</span>
            </label>
            <input
              v-model.number="formData.interestRate"
              type="number"
              min="0"
              step="0.01"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Repayment Frequency -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Repayment Frequency</span>
            </label>
            <select v-model="formData.repaymentFrequency" class="select select-bordered" required>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <!-- Fee Amount -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Fee Amount ($)</span>
            </label>
            <input
              v-model.number="formData.feeAmount"
              type="number"
              min="0"
              step="0.01"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Fee Frequency -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Fee Frequency</span>
            </label>
            <select v-model="formData.feeFrequency" class="select select-bordered" required>
              <option value="once">Once-off</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <!-- Additional Payments Section -->
          <div class="divider">Additional Payments</div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Additional Payments</span>
            </label>
            <div class="space-y-4">
              <div v-for="(payment, index) in formData.additionalPayments" :key="index" class="flex gap-4">
                <div class="flex-1">
                  <input type="number" v-model="payment.amount" placeholder="Amount" class="input input-bordered w-full" />
                </div>
                <div class="flex-1">
                  <select v-model="payment.month" class="select select-bordered w-full">
                    <option v-for="(month, index) in months" :key="month" :value="index + 1">
                      {{ month }}
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <select v-model="payment.year" class="select select-bordered w-full">
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
                <button @click="removeAdditionalPayment(index)" class="btn btn-ghost">×</button>
              </div>
            </div>
            <div class="mt-2">
              <button @click="addAdditionalPayment" type="button" class="btn btn-outline w-full">
                + Add Additional Payment
              </button>
            </div>
          </div>

          <!-- Repayment Changes Section -->
          <div class="divider">Repayment Changes</div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Repayment Changes</span>
            </label>
            <div class="space-y-4">
              <div v-for="(change, index) in formData.repaymentChanges" :key="index" class="flex gap-4">
                <div class="flex-1">
                  <input type="number" v-model="change.amount" placeholder="New Amount" class="input input-bordered w-full" />
                </div>
                <div class="flex-1">
                  <select v-model="change.month" class="select select-bordered w-full">
                    <option v-for="(month, index) in months" :key="month" :value="index + 1">
                      {{ month }}
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <select v-model="change.year" class="select select-bordered w-full">
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
                <button @click="removeRepaymentChange(index)" class="btn btn-ghost">×</button>
              </div>
            </div>
            <div class="mt-2">
              <button @click="addRepaymentChange" type="button" class="btn btn-outline w-full">
                + Add Repayment Change
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Calculate</button>
          </div>
        </form>

        <!-- Scenarios -->
        <div class="flex justify-end gap-2 mb-4">
          <button class="btn btn-warning" @click="confirmReset">
            Reset Calculator
          </button>
          <button class="btn btn-secondary" @click="exportToExcel">
            Export to Excel
          </button>
          <template v-if="results">
            <button class="btn btn-primary" @click="showSaveScenarioModal = true">
              Save Scenario
            </button>
            <button class="btn btn-error" @click="clearScenarios" v-if="scenarios.length > 0">
              Clear All Scenarios
            </button>
          </template>
        </div>

        <div class="mb-4" v-if="scenarios.length > 0">
          <h3 class="text-lg font-bold mb-2">Saved Scenarios</h3>
          <div class="flex flex-wrap gap-2">
            <div v-for="scenario in scenarios" :key="scenario.id" 
                 class="badge badge-lg gap-2 p-4">
              <span>{{ scenario.name }}</span>
              <button class="btn btn-ghost btn-xs" @click="deleteScenario(scenario.id)">
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="results" class="mt-8 space-y-4">
          <h3 class="text-xl font-semibold">Results</h3>
          <div class="stats stats-vertical w-full lg:stats-horizontal flex-wrap">
            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title">Minimum Repayment</div>
              <div class="stat-value text-2xl">${{ results.minimumRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
              <div class="stat-desc">{{ formData.repaymentFrequency }}</div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title">Repayment Date</div>
              <div class="stat-value text-2xl">{{ results.repaymentDate }}</div>
              <div class="stat-desc text-success" v-if="results.monthsSaved > 0">
                {{ results.monthsSaved }} months earlier!
              </div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title">Time to Repay</div>
              <div class="stat-value text-2xl">{{ results.timeToRepay }}</div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title">Total Interest</div>
              <div class="stat-value text-2xl">${{ results.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title">Total Fees</div>
              <div class="stat-value text-2xl">${{ results.totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
            </div>
          </div>
        </div>

         <!-- Graphs Section -->
        <div v-if="results" class="mt-4">
      <MortgageGraphs :chart-data="chartDataWithScenarios" />
    </div>
      
      </div>
    </div>
    <dialog :class="{'modal': true, 'modal-open': showSaveScenarioModal}">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Save Current Scenario</h3>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Scenario Name</span>
          </label>
          <input v-model="currentScenarioName" type="text" 
                 placeholder="e.g., Extra $1000 in December" 
                 class="input input-bordered" />
        </div>
        <div class="modal-action">
          <button class="btn" @click="showSaveScenarioModal = false">Cancel</button>
          <button class="btn btn-primary" 
                  @click="saveCurrentScenario"
                  :disabled="!currentScenarioName.trim()">
            Save
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showSaveScenarioModal = false">close</button>
      </form>
    </dialog>
    <dialog :class="{'modal': true, 'modal-open': showResetModal}">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Reset Calculator</h3>
        <p>Are you sure you want to reset the calculator? This will clear all saved data and scenarios.</p>
        <div class="modal-action">
          <button class="btn" @click="showResetModal = false">Cancel</button>
          <button class="btn btn-warning" @click="resetCalculator">
            Reset
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showResetModal = false">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MortgageGraphs from './MortgageGraphs.vue'
import * as XLSX from 'xlsx'

const STORAGE_KEY = 'mortgage-calculator-state'
const showResetModal = ref(false)

const formData = ref({
  loanAmount: 500000,
  interestRate: 7.5,
  loanTerm: 30,
  repaymentFrequency: 'monthly',
  feeAmount: 0,
  feeFrequency: 'monthly',
  additionalPayments: [],
  repaymentChanges: []
})

const results = ref({
  minimumRepayment: 0,
  repaymentDate: '',
  timeToRepay: '',
  totalInterest: 0,
  totalFees: 0,
  monthsSaved: 0
})

const chartData = ref({
  balances: [],
  standardBalances: [],
  timeLabels: [],
  paymentEvents: []
})

const minimumRepayment = ref(0)

const minMonthlyPayment = ref(null)

const scenarios = ref([])
const currentScenarioName = ref('')
const showSaveScenarioModal = ref(false)

const saveCurrentScenario = () => {
  if (!currentScenarioName.value.trim()) return
  
  // Calculate mortgage to ensure we have the latest data
  calculateMortgage()
  
  const scenario = {
    id: Date.now(),
    name: currentScenarioName.value,
    data: {
      formData: JSON.parse(JSON.stringify(formData.value)),
      results: JSON.parse(JSON.stringify(results.value)),
      chartData: JSON.parse(JSON.stringify(chartData.value))
    }
  }
  
  scenarios.value.push(scenario)
  showSaveScenarioModal.value = false
  currentScenarioName.value = ''
}

const deleteScenario = (id) => {
  scenarios.value = scenarios.value.filter(s => s.id !== id)
}

const clearScenarios = () => {
  scenarios.value = []
}

// Pass all chart data through the computed property
const chartDataWithScenarios = computed(() => {
  if (!chartData.value) return null
  return {
    ...chartData.value,
    scenarioBalances: scenarios.value.reduce((acc, scenario) => {
      acc[scenario.name] = scenario.data.chartData.balances
      return acc
    }, {}),
    interestRate: formData.value.interestRate,
    minimumRepayment: minimumRepayment.value
  }
})

// Add a new empty additional payment
const addAdditionalPayment = () => {
  formData.value.additionalPayments.push({
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
}

// Remove an additional payment by index
const removeAdditionalPayment = (index) => {
  formData.value.additionalPayments.splice(index, 1)
}

// Add a new repayment change
const addRepaymentChange = () => {
  formData.value.repaymentChanges.push({
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
}

// Remove a repayment change by index
const removeRepaymentChange = (index) => {
  formData.value.repaymentChanges.splice(index, 1)
}

// Function to format currency for Excel
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value).replace('$', '')
}

// Function to format month and year
const formatMonthYear = (month, year) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[month]} ${year}`
}

// Function to export data to Excel
const exportToExcel = () => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  
  // Main Results Sheet
  const mainResults = [
    ['Mortgage Calculator Results'],
    [''],
    ['Input Parameters'],
    ['Loan Amount', formatCurrency(formData.value.loanAmount)],
    ['Interest Rate', `${formData.value.interestRate}%`],
    ['Loan Term', `${formData.value.loanTerm} years`],
    ['Fees', formatCurrency(formData.value.feeAmount)],
    [''],
    ['Results'],
    ['Monthly Payment', formatCurrency(results.value.minimumRepayment)],
    ['Total Interest', formatCurrency(results.value.totalInterest)],
    ['Total Cost', formatCurrency(results.value.totalInterest + formData.value.loanAmount)],
    ['Payoff Date', results.value.repaymentDate],
    ['Total Years', results.value.timeToRepay]
  ]
  
  // Add saved scenarios if they exist
  if (scenarios.value.length > 0) {
    mainResults.push([''])
    mainResults.push(['Saved Scenarios'])
    mainResults.push(['Name', 'Monthly Payment', 'Total Interest', 'Total Cost', 'Years'])
    scenarios.value.forEach(scenario => {
      mainResults.push([
        scenario.name,
        formatCurrency(scenario.data.results.minimumRepayment),
        formatCurrency(scenario.data.results.totalInterest),
        formatCurrency(scenario.data.results.totalInterest + scenario.data.formData.loanAmount),
        scenario.data.results.timeToRepay
      ])
    })
  }
  
  // Add additional payments if they exist
  if (formData.value.additionalPayments.length > 0) {
    mainResults.push([''])
    mainResults.push(['Additional Payments'])
    mainResults.push(['Year', 'Amount'])
    formData.value.additionalPayments.forEach(payment => {
      mainResults.push([
        payment.year,
        formatCurrency(payment.amount)
      ])
    })
  }
  
  // Add repayment changes if they exist
  if (formData.value.repaymentChanges.length > 0) {
    mainResults.push([''])
    mainResults.push(['Repayment Changes'])
    mainResults.push(['Date', 'New Amount'])
    formData.value.repaymentChanges.forEach(change => {
      mainResults.push([
        formatMonthYear(change.month - 1, change.year),
        formatCurrency(change.amount)
      ])
    })
  }

  // Create the main results worksheet
  const wsMain = XLSX.utils.aoa_to_sheet(mainResults)
  
  // Set column widths
  const wscols = [
    {wch: 20}, // A
    {wch: 15}, // B
    {wch: 15}, // C
    {wch: 15}, // D
    {wch: 15}  // E
  ]
  wsMain['!cols'] = wscols
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, wsMain, 'Summary')
  
  // Create amortization schedule sheet if it exists
  if (chartData.value && chartData.value.balances.length > 0) {
    const scheduleData = [
      ['Year', 'Beginning Balance', 'Payment', 'Principal', 'Interest', 'Additional Payment', 'Ending Balance']
    ]
    
    for (let i = 0; i < chartData.value.balances.length; i++) {
      scheduleData.push([
        chartData.value.timeLabels[i],
        formatCurrency(chartData.value.balances[i]),
        formatCurrency(chartData.value.standardBalances[i]),
        formatCurrency(chartData.value.balances[i] - chartData.value.standardBalances[i]),
        formatCurrency(chartData.value.standardBalances[i] - chartData.value.balances[i]),
        formatCurrency(chartData.value.balances[i] - chartData.value.standardBalances[i]),
        formatCurrency(chartData.value.balances[i])
      ])
    }
    
    const wsSchedule = XLSX.utils.aoa_to_sheet(scheduleData)
    wsSchedule['!cols'] = [
      {wch: 8},  // Year
      {wch: 15}, // Beginning Balance
      {wch: 12}, // Payment
      {wch: 12}, // Principal
      {wch: 12}, // Interest
      {wch: 18}, // Additional Payment
      {wch: 15}  // Ending Balance
    ]
    
    XLSX.utils.book_append_sheet(wb, wsSchedule, 'Amortization Schedule')
  }
  
  // Generate the Excel file
  XLSX.writeFile(wb, 'mortgage-calculator-results.xlsx')
}

// Generate array of months for select
const months = computed(() => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
])

// Generate array of years starting from current year
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const endYear = currentYear + formData.value.loanTerm
  return Array.from({length: endYear - currentYear + 1}, (_, i) => currentYear + i)
})

const displayMinPayment = computed(() => {
  if (!minMonthlyPayment.value || !formData.value) return null;
  
  if (formData.value.repaymentFrequency === 'monthly') {
    return minMonthlyPayment.value;
  } else if (formData.value.repaymentFrequency === 'fortnightly') {
    return (minMonthlyPayment.value * 12) / 26;
  } else if (formData.value.repaymentFrequency === 'weekly') {
    return (minMonthlyPayment.value * 12) / 52;
  }
  return minMonthlyPayment.value; // default to monthly if frequency not recognized
});

const calculateMortgage = () => {
  // Calculate monthly interest rate
  const monthlyRate = (formData.value.interestRate / 100) / 12
  const totalMonths = formData.value.loanTerm * 12
  
  // Calculate base monthly payment using the loan payment formula
  const baseMonthlyPayment = formData.value.loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1)

  // Set minimum repayment based on frequency with proper rounding
  if (formData.value.repaymentFrequency === 'fortnightly') {
    minimumRepayment.value = Math.round((baseMonthlyPayment * 12 / 26) * 100) / 100
  } else if (formData.value.repaymentFrequency === 'weekly') {
    minimumRepayment.value = Math.round((baseMonthlyPayment * 12 / 52) * 100) / 100
  } else {
    minimumRepayment.value = Math.round(baseMonthlyPayment * 100) / 100
  }

  const calculateBalances = () => {
    const balances = []
    const standardBalances = []
    const timeLabels = []
    const paymentEvents = []
    let remainingBalance = formData.value.loanAmount
    let standardBalance = formData.value.loanAmount
    let monthsToRepay = 0
    const maxMonths = formData.value.loanTerm * 12
    let totalInterestPaid = 0
    let standardTotalInterestPaid = 0

    // Start date is today
    const startDate = new Date()
    // Set to first of current month for consistent calculations
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)
    
    let currentRepayment = minimumRepayment.value

    // Add initial point
    balances.push(remainingBalance)
    standardBalances.push(standardBalance)
    timeLabels.push('Start')

    // Track when loan is fully paid
    let actualMonthsToRepay = maxMonths
    let finalRepaymentDate = null

    // Calculate standard loan separately first
    for (let month = 1; month <= maxMonths; month++) {
      const standardInterestThisMonth = standardBalance * monthlyRate
      const standardPrincipalPayment = baseMonthlyPayment - standardInterestThisMonth
      standardBalance = Math.max(0, standardBalance - standardPrincipalPayment)
      standardTotalInterestPaid += standardInterestThisMonth

      if (month % 12 === 0 || standardBalance <= 0.01) {
        standardBalances.push(Math.max(0, standardBalance))
      }
    }

    // Reset standard balance for the main calculation loop
    standardBalance = formData.value.loanAmount

    // Now calculate the accelerated repayment
    while (remainingBalance > 0.01 && monthsToRepay <= maxMonths) {
      monthsToRepay++
      
      // Calculate and apply interest for accelerated repayment
      const interestThisMonth = remainingBalance * monthlyRate
      totalInterestPaid += interestThisMonth

      // Check for repayment change this month
      const currentMonth = monthsToRepay % 12 || 12
      const currentYear = Math.ceil(monthsToRepay / 12)
      
      const repaymentChange = formData.value.repaymentChanges.find(
        change => {
          const changeStartMonth = (change.year - startDate.getFullYear()) * 12 + change.month - (startDate.getMonth() + 1)
          const isChangeMonth = monthsToRepay === changeStartMonth + 1
          if (isChangeMonth) {
            paymentEvents.push({
              month: monthsToRepay,
              amount: change.amount,
              type: 'repaymentChange'
            })
          }
          return monthsToRepay > changeStartMonth
        }
      )
      
      // Use changed repayment amount if applicable
      currentRepayment = repaymentChange ? repaymentChange.amount : minimumRepayment.value

      // Calculate and apply principal payment for accelerated repayment
      const principalPayment = currentRepayment - interestThisMonth
      remainingBalance = Math.max(0, remainingBalance - principalPayment)

      // Check for additional payment this month
      const additionalPayment = formData.value.additionalPayments.find(payment => {
        const paymentDate = new Date(startDate)
        paymentDate.setMonth(startDate.getMonth() + monthsToRepay - 1)
        return payment.month === paymentDate.getMonth() + 1 && payment.year === paymentDate.getFullYear()
      })

      if (additionalPayment) {
        remainingBalance = Math.max(0, remainingBalance - additionalPayment.amount)
        paymentEvents.push({
          month: monthsToRepay,
          amount: additionalPayment.amount,
          type: 'additional'
        })
      }

      // Track when loan is fully paid
      if (remainingBalance <= 0.01 && !finalRepaymentDate) {
        actualMonthsToRepay = monthsToRepay
        finalRepaymentDate = new Date(startDate)
        finalRepaymentDate.setMonth(startDate.getMonth() + monthsToRepay)
      }

      // Track balance for graph (every 12 months or at final payment)
      if (monthsToRepay % 12 === 0 || remainingBalance <= 0.01) {
        balances.push(Math.max(0, remainingBalance))
        const yearLabel = Math.floor(monthsToRepay / 12)
        timeLabels.push(yearLabel === 0 ? 'Start' : `Year ${yearLabel}`)
      }
    }

    return {
      balances,
      standardBalances,
      timeLabels,
      paymentEvents,
      actualMonthsToRepay,
      finalRepaymentDate,
      totalInterestPaid
    }
  }

  const {
    balances,
    standardBalances,
    timeLabels,
    paymentEvents,
    actualMonthsToRepay,
    finalRepaymentDate,
    totalInterestPaid
  } = calculateBalances()

  // Format the final repayment date
  const formattedRepaymentDate = finalRepaymentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  })

  // Calculate time to repay in years and months
  const years = Math.floor(actualMonthsToRepay / 12)
  const remainingMonths = actualMonthsToRepay % 12
  const timeToRepay = remainingMonths === 0 
    ? `${years} years` 
    : years === 0 
      ? `${remainingMonths} months`
      : `${years} years and ${remainingMonths} months`

  // Calculate total fees
  const totalMonthlyFees = formData.value.feeAmount * actualMonthsToRepay
  const totalOnceOffFees = formData.value.feeFrequency === 'once' ? formData.value.feeAmount : 0
  const totalFees = totalMonthlyFees + totalOnceOffFees

  // Calculate months saved
  const monthsSaved = formData.value.loanTerm * 12 - actualMonthsToRepay

  // Update the results
  results.value = {
    minimumRepayment: minimumRepayment.value,
    repaymentDate: formattedRepaymentDate,
    timeToRepay: timeToRepay,
    totalInterest: totalInterestPaid,
    totalFees: totalFees,
    monthsSaved: monthsSaved
  }

  // Update chart data
  chartData.value = {
    balances,
    standardBalances,
    timeLabels,
    paymentEvents
  }
}

// Load data from localStorage on mount
onMounted(() => {
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState) {
    const state = JSON.parse(savedState)
    formData.value = state.formData
    results.value = state.results
    chartData.value = state.chartData
    scenarios.value = state.scenarios || []
  }
  calculateMortgage()
})

// Save to localStorage whenever important data changes
watch([formData, results, chartData, scenarios], () => {
  if (results.value) {
    const state = {
      formData: formData.value,
      results: results.value,
      chartData: chartData.value,
      scenarios: scenarios.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}, { deep: true })

const confirmReset = () => {
  showResetModal.value = true
}

const resetCalculator = () => {
  // Reset all state
  formData.value = {
    loanAmount: 500000,
    interestRate: 7.5,
    loanTerm: 30,
    repaymentFrequency: 'monthly',
    feeAmount: 0,
    feeFrequency: 'monthly',
    additionalPayments: [],
    repaymentChanges: []
  }
  results.value = {
    minimumRepayment: 0,
    repaymentDate: '',
    timeToRepay: '',
    totalInterest: 0,
    totalFees: 0,
    monthsSaved: 0
  }
  chartData.value = {
    balances: [],
    standardBalances: [],
    timeLabels: [],
    paymentEvents: []
  }
  scenarios.value = []
  
  // Clear localStorage
  localStorage.removeItem(STORAGE_KEY)
  showResetModal.value = false
}
</script>

<style>
/* Base button styles - only apply white text to non-outline buttons */
.btn:not(.btn-outline):not(.btn-ghost) {
  @apply text-white;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white;
}

.btn-warning {
  @apply bg-slate-600 hover:bg-slate-700 border-slate-600 hover:border-slate-700 text-white;
}

.btn-error {
  @apply bg-blue-800 hover:bg-blue-900 border-blue-800 hover:border-blue-900 text-white;
}

.btn-ghost {
  @apply text-blue-600 hover:bg-blue-100 hover:text-blue-700;
}

.btn-secondary {
  @apply bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 text-white;
}

/* Add additional payment button */
.btn-outline {
  @apply border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500;
}

.badge {
  @apply bg-blue-100 text-blue-800 border-blue-200;
}

.stats {
  @apply bg-blue-50;
}

/* Update stat titles to match input labels */
.stat-title {
  @apply text-gray-800;
}

.stat-value {
  @apply text-gray-900;
}

.stat-desc {
  @apply text-gray-600;
}

.modal-box {
  @apply bg-white border-2 border-blue-100;
}

/* Updated input styles with neutral grays */
.input-bordered {
  @apply border-gray-300 focus:border-gray-400 focus:ring-gray-400;
}

.select-bordered {
  @apply border-gray-300 focus:border-gray-400 focus:ring-gray-400;
}

.label-text {
  @apply text-gray-800;
}

/* Additional input focus styles */
.input:focus, .select:focus {
  @apply outline-none ring-2 ring-gray-400 border-gray-400;
}

/* Make sure all buttons in the form have good contrast */
.form-control .btn:not(.btn-outline):not(.btn-ghost) {
  @apply text-white;
}

/* Style for input labels */
.label {
  @apply mb-1;
}

/* Divider styling */
.divider {
  @apply text-gray-800;
}
</style>