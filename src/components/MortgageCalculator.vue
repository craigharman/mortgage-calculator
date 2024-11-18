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
          
          <div v-for="(payment, index) in formData.additionalPayments" :key="index" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-base-300 rounded-lg p-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Amount ($)</span>
              </label>
              <input
                v-model.number="payment.amount"
                type="number"
                min="0"
                step="100"
                class="input input-bordered"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Month</span>
              </label>
              <select v-model="payment.month" class="select select-bordered" required>
                <option v-for="(month, index) in months" :key="month" :value="index + 1">
                  {{ month }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Year</span>
              </label>
              <select v-model="payment.year" class="select select-bordered" required>
                <option v-for="year in years" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <button 
                type="button" 
                class="btn btn-error" 
                @click="removeAdditionalPayment(index)"
              >
                Remove
              </button>
            </div>
          </div>

          <div class="form-control">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="addAdditionalPayment"
            >
              Add Additional Payment
            </button>
          </div>

          <!-- Repayment Changes Section -->
          <div class="divider">Repayment Changes</div>
          
          <div v-for="(change, index) in formData.repaymentChanges" :key="index" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-base-300 rounded-lg p-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">New Repayment Amount ($)</span>
              </label>
              <input
                v-model.number="change.amount"
                type="number"
                min="0"
                step="100"
                class="input input-bordered"
                required
              />
              <label class="label" v-if="displayMinPayment !== null && change.amount < displayMinPayment">
                <span class="label-text-alt text-error">Minimum: ${{ displayMinPayment.toFixed(2) }}/{{ formData.repaymentFrequency === 'monthly' ? 'month' : formData.repaymentFrequency.slice(0, -2) }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Start Month</span>
              </label>
              <select v-model="change.month" class="select select-bordered" required>
                <option v-for="(month, index) in months" :key="month" :value="index + 1">
                  {{ month }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Start Year</span>
              </label>
              <select v-model="change.year" class="select select-bordered" required>
                <option v-for="year in years" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <button 
                type="button" 
                class="btn btn-error" 
                @click="removeRepaymentChange(index)"
              >
                Remove
              </button>
            </div>
          </div>

          <div class="form-control">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="addRepaymentChange"
            >
              Add Repayment Change
            </button>
          </div>

          <div class="divider"></div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Calculate</button>
          </div>
        </form>

        <!-- Scenarios -->
        <div class="flex justify-end gap-2 mb-4" v-if="results">
      <button class="btn btn-primary" @click="showSaveScenarioModal = true">
        Save Scenario
      </button>
      <button class="btn btn-error" @click="clearScenarios" v-if="scenarios.length > 0">
        Clear All Scenarios
      </button>
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
              <div class="stat-value text-2xl">${{ results.minimumRepayment.toFixed(2) }}</div>
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
              <div class="stat-value text-2xl">${{ results.totalInterest.toFixed(2) }}</div>
            </div>

            <div class="stat min-w-[200px] flex-1">
              <div class="stat-title">Total Fees</div>
              <div class="stat-value text-2xl">${{ results.totalFees.toFixed(2) }}</div>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MortgageGraphs from './MortgageGraphs.vue'

const formData = ref({
  loanAmount: 500000,
  loanTerm: 30,
  interestRate: 5.5,
  repaymentFrequency: 'monthly',
  feeAmount: 10,
  feeFrequency: 'monthly',
  additionalPayments: [],
  repaymentChanges: []
})

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

// Pass scenarios to chart data
const chartDataWithScenarios = computed(() => {
  if (!chartData.value) return null
  return {
    ...chartData.value,
    scenarios: scenarios.value
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

const chartData = ref(null)

const calculateMortgage = () => {
  // Reset dates
  const startDate = new Date()
  currentDate.value = new Date(startDate)
  finalRepaymentDate.value = new Date(startDate)

  // Convert annual interest rate to monthly
  const monthlyRate = formData.value.interestRate / 100 / 12
  const totalMonths = formData.value.loanTerm * 12

  // Calculate base monthly payment using the loan payment formula
  const baseMonthlyPayment = (
    formData.value.loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  )

  // Add fees based on frequency
  const monthlyFees = formData.value.feeFrequency === 'monthly' ? formData.value.feeAmount : 0

  // Sort additional payments by date
  const sortedPayments = [...formData.value.additionalPayments].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  // Sort repayment changes by date
  const sortedRepaymentChanges = [...formData.value.repaymentChanges].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  // For tracking balance over time
  const balances = [formData.value.loanAmount]
  const standardBalances = [formData.value.loanAmount]
  const timeLabels = ['Start']
  const paymentEvents = [] // Track additional payments and repayment changes

  // Calculate standard monthly payment (without additional payments or changes)
  const standardMonthlyPayment = (
    formData.value.loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  ) + monthlyFees

  let standardBalance = formData.value.loanAmount
  let remainingBalance = formData.value.loanAmount
  let totalInterestPaid = 0
  let monthsToRepay = 0
  let actualMonthlyPayment = baseMonthlyPayment
  let standardMonthsToRepay = 0
  
  // Continue simulation until both loans are paid off or max term reached
  while ((remainingBalance > 0 || standardBalance > 0) && monthsToRepay < totalMonths) {
    // Check for repayment changes starting this month
    const repaymentChange = sortedRepaymentChanges.find(change => 
      change.year === currentDate.value.getFullYear() && 
      change.month === currentDate.value.getMonth() + 1
    )
    if (repaymentChange && remainingBalance > 0) {
      actualMonthlyPayment = repaymentChange.amount + monthlyFees
      paymentEvents.push({
        month: monthsToRepay,
        type: 'repayment',
        amount: repaymentChange.amount,
        balance: remainingBalance
      })
    }

    // Calculate and apply payments for accelerated loan
    if (remainingBalance > 0) {
      const interestThisMonth = remainingBalance * monthlyRate
      totalInterestPaid += interestThisMonth
      const principalPayment = actualMonthlyPayment - monthlyFees - interestThisMonth
      remainingBalance -= principalPayment

      // Check for additional payments in this month
      const paymentsThisMonth = sortedPayments.filter(payment => 
        payment.year === currentDate.value.getFullYear() && 
        payment.month === currentDate.value.getMonth() + 1
      )

      // Apply additional payments
      for (const payment of paymentsThisMonth) {
        remainingBalance -= payment.amount
        if (remainingBalance < 0) remainingBalance = 0
        paymentEvents.push({
          month: monthsToRepay,
          type: 'additional',
          amount: payment.amount,
          balance: remainingBalance
        })
      }

      if (remainingBalance <= 0 && !finalRepaymentDate.value) {
        finalRepaymentDate.value = new Date(currentDate.value)
      }
    }

    // Calculate standard loan for comparison
    if (standardBalance > 0) {
      const standardInterest = standardBalance * monthlyRate
      const standardPrincipal = standardMonthlyPayment - monthlyFees - standardInterest
      standardBalance -= standardPrincipal
      if (standardBalance <= 0) {
        standardBalance = 0
        if (standardMonthsToRepay === 0) {
          standardMonthsToRepay = monthsToRepay + 1
        }
      }
    }

    monthsToRepay++
    currentDate.value.setMonth(currentDate.value.getMonth() + 1)

    // Track balance for graph (every 12 months or at final payment)
    if (monthsToRepay % 12 === 0 || remainingBalance <= 0 || standardBalance <= 0) {
      const yearLabel = `Year ${Math.floor(monthsToRepay / 12)}`
      
      // For your loan: include balance if it's positive or if it just reached zero
      if (remainingBalance > 0 || (remainingBalance <= 0 && balances[balances.length - 1] > 0)) {
        balances.push(Math.max(0, remainingBalance))
      }
      
      // For standard loan: include balance if it's positive or if it just reached zero
      if (standardBalance > 0 || (standardBalance <= 0 && standardBalances[standardBalances.length - 1] > 0)) {
        standardBalances.push(Math.max(0, standardBalance))
      }
      
      // Only add time label if we added at least one balance
      if (remainingBalance > 0 || standardBalance > 0 || 
          balances[balances.length - 1] === 0 || standardBalances[standardBalances.length - 1] === 0) {
        timeLabels.push(
          yearLabel + 
          (remainingBalance <= 0 && standardBalance > 0 ? ' (Your loan paid)' :
           standardBalance <= 0 ? ' (Standard loan paid)' : '')
        )
      }
    }
  }

  // Calculate total fees
  const totalMonthlyFees = monthlyFees * monthsToRepay
  const totalOnceOffFees = formData.value.feeFrequency === 'once' ? formData.value.feeAmount : 0
  const totalFees = totalMonthlyFees + totalOnceOffFees

  // Update chart data
  chartData.value = {
    loanAmount: formData.value.loanAmount,
    totalInterest: totalInterestPaid,
    totalFees,
    balances,
    standardBalances,
    timeLabels,
    paymentEvents
  }

  // Adjust initial payment based on frequency for display
  let minimumRepayment = baseMonthlyPayment
  if (formData.value.repaymentFrequency === 'fortnightly') {
    minimumRepayment = (baseMonthlyPayment * 12) / 26
  } else if (formData.value.repaymentFrequency === 'weekly') {
    minimumRepayment = (baseMonthlyPayment * 12) / 52
  }

  const years = Math.floor(monthsToRepay / 12)
  const months = monthsToRepay % 12

  results.value = {
    minimumRepayment,
    repaymentDate: finalRepaymentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    timeToRepay: `${years} years${months ? ` ${months} months` : ''}`,
    totalInterest: totalInterestPaid,
    totalFees,
    monthsSaved: totalMonths - monthsToRepay
  }
}

const results = ref(null)
const currentDate = ref(new Date())
const finalRepaymentDate = ref(null)
</script>