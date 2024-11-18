<template>
  <div class="container mx-auto p-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6 text-gray-800">Mortgage Calculator</h2>
        
        <form @submit.prevent="calculateMortgage" class="space-y-4">
          <!-- Loan Amount -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Loan Amount ($)</span>
            </label>
            <input
              v-model.number="formData.loanAmount"
              type="number"
              min="0"
              step="1000"
              class="input input-bordered text-gray-800"
              required
            />
          </div>

          <!-- Loan Term -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Loan Term (years)</span>
            </label>
            <input
              v-model.number="formData.loanTerm"
              type="number"
              min="1"
              max="30"
              class="input input-bordered text-gray-800"
              required
            />
          </div>

          <!-- Interest Rate -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Interest Rate (%)</span>
            </label>
            <input
              v-model.number="formData.interestRate"
              type="number"
              min="0"
              step="0.01"
              class="input input-bordered text-gray-800"
              required
            />
          </div>

          <!-- Repayment Frequency -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Repayment Frequency</span>
            </label>
            <select v-model="formData.repaymentFrequency" class="select select-bordered text-gray-800" required>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <!-- Fee Amount -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Fee Amount ($)</span>
            </label>
            <input
              v-model.number="formData.feeAmount"
              type="number"
              min="0"
              step="0.01"
              class="input input-bordered text-gray-800"
              required
            />
          </div>

          <!-- Fee Frequency -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Fee Frequency</span>
            </label>
            <select v-model="formData.feeFrequency" class="select select-bordered text-gray-800" required>
              <option value="once">Once-off</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <!-- Additional Payments Section -->
          <div class="divider text-gray-800">Additional Payments</div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Additional Payments</span>
            </label>
            <div class="space-y-4">
              <div v-for="(payment, index) in formData.additionalPayments" :key="index" class="flex gap-4">
                <div class="flex-1">
                  <input type="number" v-model="payment.amount" placeholder="Amount" class="input input-bordered w-full text-gray-800" />
                </div>
                <div class="flex-1">
                  <select v-model="payment.month" class="select select-bordered w-full text-gray-800">
                    <option v-for="(month, index) in months" :key="month" :value="index + 1">
                      {{ month }}
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <select v-model="payment.year" class="select select-bordered w-full text-gray-800">
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
                <button @click="removeAdditionalPayment(index)" class="btn btn-ghost">×</button>
              </div>
            </div>
            <div class="mt-2">
              <button @click="addAdditionalPayment" type="button" class="btn btn-outline w-full text-gray-800">
                + Add Additional Payment
              </button>
            </div>
          </div>

          <!-- Repayment Changes Section -->
          <div class="divider text-gray-800">Repayment Changes</div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-800">Repayment Changes</span>
            </label>
            <div class="space-y-4">
              <div v-for="(change, index) in formData.repaymentChanges" :key="index" class="flex gap-4">
                <div class="flex-1">
                  <input type="number" v-model="change.amount" placeholder="New Amount" class="input input-bordered w-full text-gray-800" />
                </div>
                <div class="flex-1">
                  <select v-model="change.month" class="select select-bordered w-full text-gray-800">
                    <option v-for="(month, index) in months" :key="month" :value="index + 1">
                      {{ month }}
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <select v-model="change.year" class="select select-bordered w-full text-gray-800">
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
                <button @click="removeRepaymentChange(index)" class="btn btn-ghost">×</button>
              </div>
            </div>
            <div class="mt-2">
              <button @click="addRepaymentChange" type="button" class="btn btn-outline w-full text-gray-800">
                + Add Repayment Change
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary text-gray-800">Calculate</button>
          </div>
        </form>

        <!-- Scenarios -->
        <div class="flex justify-end gap-2 mb-4">
          <button class="btn btn-warning text-gray-800" @click="confirmReset">
            Reset Calculator
          </button>
          <button class="btn btn-secondary text-gray-800" @click="exportToExcel">
            Export to Excel
          </button>
          <template v-if="results">
            <button class="btn btn-primary text-gray-800" @click="showSaveScenarioModal = true">
              Save Scenario
            </button>
            <button class="btn btn-error text-gray-800" @click="clearScenarios" v-if="scenarios.length > 0">
              Clear All Scenarios
            </button>
          </template>
        </div>

        <div class="mb-4" v-if="scenarios.length > 0">
          <h3 class="text-lg font-bold mb-2 text-gray-800">Saved Scenarios</h3>
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
          <h3 class="text-xl font-semibold text-gray-800">Results</h3>
          <div class="stats stats-vertical w-full lg:stats-horizontal flex-wrap">
            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title text-gray-800">Minimum Repayment</div>
              <div class="stat-value text-2xl">${{ results.monthlyPayment?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</div>
              <div class="stat-desc">{{ formData.repaymentFrequency }}</div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title text-gray-800">Repayment Date</div>
              <div class="stat-value text-2xl">{{ results.finalRepaymentDate ? new Date(results.finalRepaymentDate).toLocaleString('default', { month: 'long', year: 'numeric' }) : '-' }}</div>
              <div class="stat-desc text-success" v-if="results.actualMonthsToRepay < formData.loanTerm * 12">
                {{ formData.loanTerm * 12 - results.actualMonthsToRepay }} months earlier!
              </div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title text-gray-800">Time to Repay</div>
              <div class="stat-value text-2xl">{{ formatMonthsToYearsAndMonths(results.actualMonthsToRepay) }}</div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title text-gray-800">Total Interest</div>
              <div class="stat-value text-2xl">${{ results.totalInterest?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title text-gray-800">Total Fees</div>
              <div class="stat-value text-2xl">${{ results.totalFees?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</div>
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
        <h3 class="font-bold text-lg mb-4 text-gray-800">Save Current Scenario</h3>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-800">Scenario Name</span>
          </label>
          <input v-model="currentScenarioName" type="text" 
                 placeholder="e.g., Extra $1000 in December" 
                 class="input input-bordered text-gray-800" />
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost text-gray-700"
                  @click="showSaveScenarioModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
        <h3 class="font-bold text-lg mb-4 text-gray-800">Reset Calculator</h3>
        <p>Are you sure you want to reset the calculator? This will clear all saved data and scenarios.</p>
        <div class="modal-action">
          <button class="btn text-gray-800" @click="showResetModal = false">Cancel</button>
          <button class="btn btn-warning text-gray-800" @click="resetCalculator">
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
  interestRate: 5.98,
  loanTerm: 30,
  repaymentFrequency: 'monthly',
  feeAmount: 0,
  feeFrequency: 'monthly',
  additionalPayments: [],
  repaymentChanges: []
})

const results = ref({
  monthlyPayment: null,
  totalInterest: null,
  totalRepayment: null,
  totalFees: null,
  actualMonthsToRepay: null,
  finalRepaymentDate: null
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
  if (!chartData.value) return null;
  return {
    ...chartData.value,
    loanAmount: formData.value.loanAmount,
    totalInterest: results.value.totalInterest,
    totalFees: results.value.totalFees,
    scenarioBalances: scenarios.value.reduce((acc, scenario) => {
      acc[scenario.name] = scenario.data.chartData.balances;
      return acc;
    }, {}),
    interestRate: formData.value.interestRate,
    minimumRepayment: minimumRepayment.value
  };
});

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
    ['Monthly Payment', formatCurrency(results.value.monthlyPayment)],
    ['Total Interest', formatCurrency(results.value.totalInterest)],
    ['Total Cost', formatCurrency(results.value.totalRepayment)],
    ['Payoff Date', results.value.finalRepaymentDate],
    ['Total Years', results.value.actualMonthsToRepay]
  ]
  
  // Add saved scenarios if they exist
  if (scenarios.value.length > 0) {
    mainResults.push([''])
    mainResults.push(['Saved Scenarios'])
    mainResults.push(['Name', 'Monthly Payment', 'Total Interest', 'Total Cost', 'Years'])
    scenarios.value.forEach(scenario => {
      mainResults.push([
        scenario.name,
        formatCurrency(scenario.data.results.monthlyPayment),
        formatCurrency(scenario.data.results.totalInterest),
        formatCurrency(scenario.data.results.totalRepayment),
        scenario.data.results.actualMonthsToRepay
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
  // Calculate monthly interest rate (convert from annual percentage to monthly decimal)
  const monthlyRate = (formData.value.interestRate / 100) / 12
  const totalMonths = formData.value.loanTerm * 12
  const principal = formData.value.loanAmount
  
  // Calculate monthly payment using the loan payment formula
  // P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  // where P = monthly payment, L = loan amount, c = monthly interest rate, n = total number of months
  const powerTerm = Math.pow(1 + monthlyRate, totalMonths)
  const monthlyPayment = principal * (monthlyRate * powerTerm) / (powerTerm - 1)

  // Round to 2 decimal places
  const baseMonthlyPayment = Math.round(monthlyPayment * 100) / 100

  // Set minimum repayment based on frequency with proper rounding
  if (formData.value.repaymentFrequency === 'fortnightly') {
    minimumRepayment.value = Math.round((baseMonthlyPayment * 12 / 26) * 100) / 100
  } else if (formData.value.repaymentFrequency === 'weekly') {
    minimumRepayment.value = Math.round((baseMonthlyPayment * 12 / 52) * 100) / 100
  } else {
    minimumRepayment.value = baseMonthlyPayment
  }

  console.log('Initial values:')
console.log('Principal:', principal)
console.log('Monthly Rate:', monthlyRate)
console.log('Base Monthly Payment:', baseMonthlyPayment)
console.log('Total Months:', totalMonths)

  const calculateBalances = () => {
    let balance = principal
    let standardBalance = principal
    let totalInterestPaid = 0
    let totalPrincipalPaid = 0
    const balances = [balance]
    const standardBalances = [standardBalance]
    const timeLabels = ['Start']
    const paymentEvents = []

    // Start date is today
    const startDate = new Date()
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)
    
    // Track when loan is fully paid
    let actualMonthsToRepay = totalMonths
    let finalRepaymentDate = null

    // Sort repayment changes by date
    const sortedRepaymentChanges = [...formData.value.repaymentChanges]
      .sort((a, b) => {
        const dateA = new Date(a.year, a.month - 1)
        const dateB = new Date(b.year, b.month - 1)
        return dateA - dateB
      })

    // Sort additional payments by date
    const sortedAdditionalPayments = [...formData.value.additionalPayments]
      .sort((a, b) => {
        const dateA = new Date(a.year, a.month - 1)
        const dateB = new Date(b.year, b.month - 1)
        return dateA - dateB
      })

    // Calculate loan amortization
    let currentPayment = baseMonthlyPayment
    let currentRepaymentChangeIndex = 0
    let currentAdditionalPaymentIndex = 0
    let standardMonthlyPayment = baseMonthlyPayment

    for (let month = 1; month <= totalMonths && (balance > 0.01 || standardBalance > 0.01); month++) {
      // Calculate standard loan balance
      if (standardBalance > 0.01) {
        const standardInterestPayment = standardBalance * monthlyRate
        let standardPrincipalPayment = standardMonthlyPayment - standardInterestPayment
        
        if (standardPrincipalPayment > standardBalance) {
          standardPrincipalPayment = standardBalance
          standardMonthlyPayment = standardBalance + standardInterestPayment
        }
        
        standardBalance = Math.max(0, standardBalance - standardPrincipalPayment)

        if (month % 12 === 0) {
          console.log(`\nYear ${month/12} Standard Loan:`)
          console.log('Standard Balance:', standardBalance)
          console.log('Standard Interest Payment:', standardInterestPayment)
          console.log('Standard Principal Payment:', standardPrincipalPayment)
          console.log('Standard Monthly Payment:', standardMonthlyPayment)
        }
      }

      // Check if there's a repayment change for this month
      const currentDate = new Date(startDate)
      currentDate.setMonth(startDate.getMonth() + month - 1)
      
      while (currentRepaymentChangeIndex < sortedRepaymentChanges.length) {
        const change = sortedRepaymentChanges[currentRepaymentChangeIndex]
        const changeDate = new Date(change.year, change.month - 1)
        
        if (changeDate <= currentDate) {
          currentPayment = change.amount
          paymentEvents.push({
            type: 'repaymentChange',
            month,
            amount: change.amount
          })
          currentRepaymentChangeIndex++
        } else {
          break
        }
      }

      // Check for additional payments this month
      while (currentAdditionalPaymentIndex < sortedAdditionalPayments.length) {
        const payment = sortedAdditionalPayments[currentAdditionalPaymentIndex]
        const paymentDate = new Date(payment.year, payment.month - 1)
        
        if (paymentDate <= currentDate) {
          balance = Math.max(0, balance - payment.amount)
          totalPrincipalPaid += payment.amount
          paymentEvents.push({
            type: 'additionalPayment',
            month,
            amount: payment.amount
          })
          currentAdditionalPaymentIndex++
        } else {
          break
        }
      }

      // Calculate actual loan balance
      if (balance > 0.01) {
        const interestPayment = balance * monthlyRate
        let principalPayment = currentPayment - interestPayment
        
        if (principalPayment > balance) {
          principalPayment = balance
          currentPayment = balance + interestPayment
        }
        
        totalInterestPaid += interestPayment
        totalPrincipalPaid += principalPayment
        balance -= principalPayment
      }

      // Record balances at yearly intervals or when paid off
      if (month % 12 === 0) {
        balances.push(Math.max(0, balance))
        standardBalances.push(Math.max(0, standardBalance))
        const yearLabel = Math.floor(month / 12)
        timeLabels.push(`Year ${yearLabel}`)
      }

      // Check if loan is fully paid off
      if (balance <= 0.01 && !finalRepaymentDate) {
        actualMonthsToRepay = month
        finalRepaymentDate = new Date(startDate)
        finalRepaymentDate.setMonth(startDate.getMonth() + month - 1)
      }
    }

    console.log('\nFinal values:')
console.log('Standard Balances:', standardBalances)
console.log('Time Labels:', timeLabels)

    return {
      balances,
      standardBalances,
      timeLabels,
      paymentEvents,
      actualMonthsToRepay,
      finalRepaymentDate,
      totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
      monthlyPayment: baseMonthlyPayment
    }
  }

  // Calculate results
  const calcResults = calculateBalances()
  chartData.value = calcResults
  
  // Calculate total fees based on frequency
  let totalFees = formData.value.feeAmount
  if (formData.value.feeFrequency === 'weekly') {
    totalFees *= 52 * formData.value.loanTerm
  } else if (formData.value.feeFrequency === 'monthly') {
    totalFees *= 12 * formData.value.loanTerm
  } else if (formData.value.feeFrequency === 'quarterly') {
    totalFees *= 4 * formData.value.loanTerm
  } else if (formData.value.feeFrequency === 'annually') {
    totalFees *= formData.value.loanTerm
  }
  // Round to 2 decimal places
  totalFees = Math.round(totalFees * 100) / 100
  
  results.value = {
    monthlyPayment: calcResults.monthlyPayment,
    totalInterest: calcResults.totalInterestPaid,
    totalRepayment: principal + calcResults.totalInterestPaid + totalFees,
    totalFees: totalFees,
    actualMonthsToRepay: calcResults.actualMonthsToRepay,
    finalRepaymentDate: calcResults.finalRepaymentDate
  }
}

// Format months to years and months string
const formatMonthsToYearsAndMonths = (totalMonths) => {
  if (!totalMonths) return '-'
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (months === 0) return `${years} years`
  if (years === 0) return `${months} months`
  return `${years} years, ${months} months`
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
    interestRate: 5.98,
    loanTerm: 30,
    repaymentFrequency: 'monthly',
    feeAmount: 0,
    feeFrequency: 'monthly',
    additionalPayments: [],
    repaymentChanges: []
  }
  results.value = {
    monthlyPayment: null,
    totalInterest: null,
    totalRepayment: null,
    totalFees: null,
    actualMonthsToRepay: null,
    finalRepaymentDate: null
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

/* Style for input labels */
.label {
  @apply mb-1;
}

/* Divider styling */
.divider {
  @apply text-gray-800;
}
</style>