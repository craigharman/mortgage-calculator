<template>
  <div class="container mx-auto p-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6 text-gray-800">Mortgage Calculator</h2>
        
        <form @submit.prevent="calculateMortgage" class="space-y-6">
          <!-- Basic Loan Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Loan Amount -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-800">Loan Amount ($)</span>
              </label>
              <input
                type="number"
                v-model.number="formData.loanAmount"
                class="input input-bordered w-full text-gray-800"
                min="0"
                step="1000"
                required
              />
            </div>

            <!-- Interest Rate -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-800">Interest Rate (%)</span>
              </label>
              <input
                type="number"
                v-model.number="formData.interestRate"
                class="input input-bordered w-full text-gray-800"
                min="0"
                step="0.01"
                required
              />
            </div>

            <!-- Loan Term -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-800">Loan Term (years)</span>
              </label>
              <input
                type="number"
                v-model.number="formData.loanTerm"
                class="input input-bordered w-full text-gray-800"
                min="1"
                max="30"
                required
              />
            </div>

            <!-- Repayment Frequency -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-800">Repayment Frequency</span>
              </label>
              <select
                v-model="formData.repaymentFrequency"
                class="select select-bordered w-full text-gray-800"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <!-- Fee Amount -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-800">Fee Amount ($)</span>
              </label>
              <input
                type="number"
                v-model.number="formData.feeAmount"
                class="input input-bordered w-full text-gray-800"
                min="0"
                step="1"
              />
            </div>

            <!-- Fee Frequency -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-800">Fee Frequency</span>
              </label>
              <select
                v-model="formData.feeFrequency"
                class="select select-bordered w-full text-gray-800"
              >
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
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
                 class="badge badge-lg gap-2 p-4 flex items-center">
              <span>{{ scenario.name }}</span>
              <button class="btn btn-ghost btn-xs p-0 min-h-0 h-auto flex items-center justify-center" @click="deleteScenario(scenario.id)">
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="results" class="mt-8 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800">Results</h3>
            <select 
              v-if="scenarios.length > 0"
              v-model="selectedScenarioId" 
              class="select select-bordered w-full max-w-xs"
            >
              <option :value="null">Current Scenario</option>
              <option v-for="scenario in scenarios" :key="scenario.id" :value="scenario.id">
                {{ scenario.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- First Row -->
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title text-gray-800">Monthly Payment</div>
                <div class="stat-value text-2xl">${{ displayedStats.monthlyPayment?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</div>
                <div class="stat-desc">Minimum required payment</div>
              </div>
            </div>

            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title text-gray-800">Total Interest</div>
                <div class="stat-value text-2xl">${{ displayedStats.totalInterest?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</div>
              </div>
            </div>

            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title text-gray-800">Total Fees</div>
                <div class="stat-value text-2xl">${{ displayedStats.totalFees?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</div>
              </div>
            </div>

            <!-- Second Row -->
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title text-gray-800">Time to Repay</div>
                <div class="stat-value text-2xl">{{ formatMonthsToYearsAndMonths(displayedStats.actualMonthsToRepay) }}</div>
              </div>
            </div>

            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title text-gray-800">Payoff Date</div>
                <div class="stat-value text-2xl">{{ formatDate(displayedStats.finalRepaymentDate) }}</div>
                <div class="stat-desc">
                  <span v-if="displayedStats.timeSavedText">{{ displayedStats.timeSavedText }}</span>
                </div>
              </div>
            </div>

            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title text-gray-800">Total Savings</div>
                <div class="stat-value text-2xl" :class="{ 'text-emerald-600': displayedStats.totalSavings > 0 }">${{ displayedStats.totalSavings?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</div>
                <div class="stat-desc">Compared to standard loan</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Scenario Details Section -->
        <div v-if="selectedScenario" class="mt-8 space-y-4">
          <h3 class="text-xl font-semibold text-gray-800">Scenario Configuration</h3>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Loan Settings -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body p-6">
                <h4 class="card-title text-gray-800 text-lg mb-4">Loan Settings</h4>
                <div class="space-y-3">
                  <div class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">Loan Amount</span>
                    <span class="text-gray-800 text-right font-medium">${{ selectedScenario.data.formData.loanAmount?.toLocaleString() }}</span>
                  </div>
                  <div class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">Interest Rate</span>
                    <span class="text-gray-800 text-right font-medium">{{ selectedScenario.data.formData.interestRate }}%</span>
                  </div>
                  <div class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">Loan Term</span>
                    <span class="text-gray-800 text-right font-medium">{{ selectedScenario.data.formData.loanTerm }} years</span>
                  </div>
                  <div class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">Repayment Frequency</span>
                    <span class="text-gray-800 text-right font-medium">{{ selectedScenario.data.formData.repaymentFrequency }}</span>
                  </div>
                  <div class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">Fee Amount</span>
                    <span class="text-gray-800 text-right font-medium">${{ selectedScenario.data.formData.feeAmount?.toLocaleString() }}</span>
                  </div>
                  <div class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">Fee Frequency</span>
                    <span class="text-gray-800 text-right font-medium">{{ selectedScenario.data.formData.feeFrequency }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Payments -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body p-6">
                <h4 class="card-title text-gray-800 text-lg mb-4">Additional Payments</h4>
                <div class="space-y-3">
                  <div v-if="!selectedScenario.data.formData.additionalPayments?.length" class="text-gray-600 text-sm italic">
                    No additional payments configured
                  </div>
                  <div v-else v-for="(payment, index) in selectedScenario.data.formData.additionalPayments" :key="index" class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">
                      {{ formatMonthYear(payment.month, payment.year) }}
                    </span>
                    <span class="text-gray-800 text-right font-medium">${{ payment.amount?.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Repayment Changes -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body p-6">
                <h4 class="card-title text-gray-800 text-lg mb-4">Repayment Changes</h4>
                <div class="space-y-3">
                  <div v-if="!selectedScenario.data.formData.repaymentChanges?.length" class="text-gray-600 text-sm italic">
                    No repayment changes configured
                  </div>
                  <div v-else v-for="(change, index) in selectedScenario.data.formData.repaymentChanges" :key="index" class="grid grid-cols-2 items-center">
                    <span class="text-gray-600 text-sm">
                      {{ formatMonthYear(change.month, change.year) }}
                    </span>
                    <span class="text-gray-800 text-right font-medium">${{ change.amount?.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphs Section -->
        <div v-if="results" class="mt-4">
          <MortgageGraphs :chart-data="chartDataWithScenarios" />
        </div>

        <!-- What If Section -->
<div class="mb-8 p-4 bg-base-200 rounded-lg">
  <div class="flex items-center gap-4 mb-4">
    <h3 class="text-lg font-bold text-gray-800">What If Analysis</h3>
    <label class="cursor-pointer label">
      <input type="checkbox" v-model="whatIfEnabled" class="toggle toggle-primary" />
    </label>
  </div>
  
  <div v-if="whatIfEnabled" class="space-y-4">
    <div class="form-control">
      <label class="label">
        <span class="label-text">Interest Rate (%)</span>
        <span class="label-text-alt">{{ whatIfInterestRate?.toFixed(2) }}%</span>
      </label>
      <input 
        type="range" 
        v-model.number="whatIfInterestRate" 
        class="range range-primary" 
        min="0" 
        max="15" 
        step="0.05"
      />
      <div class="w-full flex justify-between text-xs px-2 mt-1">
        <span>0%</span>
        <span>7.5%</span>
        <span>15%</span>
      </div>
    </div>

    <div v-if="whatIfResults" class="stats shadow">
      <div class="stat">
        <div class="stat-title">Monthly Payment Difference</div>
        <div class="stat-value" :class="{'text-success': whatIfResults.monthlyPayment <= results.monthlyPayment, 'text-error': whatIfResults.monthlyPayment > results.monthlyPayment}">
          {{ formatCurrency(whatIfResults.monthlyPayment - results.monthlyPayment) }}
        </div>
        <div class="stat-desc">Compared to current rate</div>
      </div>
      
      <div class="stat">
        <div class="stat-title">Total Interest Difference</div>
        <div class="stat-value" :class="{'text-success': whatIfResults.totalInterest <= results.totalInterest, 'text-error': whatIfResults.totalInterest > results.totalInterest}">
          {{ formatCurrency(whatIfResults.totalInterest - results.totalInterest) }}
        </div>
        <div class="stat-desc">Compared to current rate</div>
      </div>
    </div>
  </div>
</div>
        
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MortgageGraphs from './MortgageGraphs.vue'
import * as XLSX from 'xlsx'

const STORAGE_KEY = 'mortgage-calculator-state'
const showResetModal = ref(false)
const selectedScenarioId = ref(null)

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
  finalRepaymentDate: null,
  totalSavings: null,
  timeSavedText: null
})

const chartData = ref({
  labels: [],
  datasets: [],
  loanAmount: 0,
  totalInterest: 0,
  totalFees: 0
})

const minimumRepayment = ref(0)

const minMonthlyPayment = ref(null)

const scenarios = ref([])
const currentScenarioName = ref('')
const showSaveScenarioModal = ref(false)

const selectedScenario = computed(() => {
  if (!selectedScenarioId.value) return null
  return scenarios.value.find(s => s.id === selectedScenarioId.value)
})

const displayedStats = computed(() => {
  if (selectedScenario.value) {
    return selectedScenario.value.data.results
  }
  return results.value
})

// Add whatIf state
const whatIfEnabled = ref(false)
const whatIfInterestRate = ref(formData.value.interestRate)
const whatIfResults = ref(null)
const whatIfChartData = ref(null)

// Watch for whatIf changes and recalculate
watch([whatIfEnabled, whatIfInterestRate], ([enabled, rate]) => {
  if (enabled && rate !== null) {
    calculateWhatIf(rate)
  } else {
    whatIfResults.value = null
    whatIfChartData.value = null
  }
})

// Function to calculate whatIf scenario
const calculateWhatIf = (rate) => {
  if (!rate) return
  
  // Store original interest rate
  const originalRate = formData.value.interestRate
  
  // Temporarily set the interest rate to whatIf rate
  formData.value.interestRate = rate
  
  // Calculate with whatIf rate
  calculateMortgage()
  
  // Store results in whatIf variables
  whatIfResults.value = { ...results.value }
  whatIfChartData.value = {
    labels: [...chartData.value.labels],
    datasets: chartData.value.datasets.map(dataset => ({
      ...dataset,
      data: [...dataset.data]  // Deep copy the data array
    })),
    loanAmount: chartData.value.loanAmount,
    totalInterest: chartData.value.totalInterest,
    totalFees: chartData.value.totalFees
  }
  
  // Restore original rate and recalculate
  formData.value.interestRate = originalRate
  calculateMortgage()
}

// Update chartDataWithScenarios to include both scenarios and whatIf data
const chartDataWithScenarios = computed(() => {
  if (!chartData.value || !chartData.value.datasets) {
    return {
      labels: [],
      datasets: [],
      loanAmount: 0,
      totalInterest: 0,
      totalFees: 0
    }
  }

  const baseData = {
    labels: [...chartData.value.labels],
    datasets: [],
    loanAmount: chartData.value.loanAmount,
    totalInterest: chartData.value.totalInterest,
    totalFees: chartData.value.totalFees
  };

  // Add current loan balance dataset
  if (chartData.value.datasets[0]) {
    baseData.datasets.push({
      ...chartData.value.datasets[0],
      data: [...chartData.value.datasets[0].data],
      label: 'Current Plan',
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F622'
    });
  }

  // Add standard loan dataset
  if (chartData.value.datasets[1]) {
    baseData.datasets.push({
      ...chartData.value.datasets[1],
      data: [...chartData.value.datasets[1].data],
      label: 'Standard Loan',
      borderColor: '#9CA3AF',
      backgroundColor: '#9CA3AF22'
    });
  }

  // Add all scenarios
  scenarios.value.forEach((scenario, index) => {
    if (scenario.data.chartData && scenario.data.chartData.balances) {
      // Generate a unique color for each scenario
      const hue = (120 + (index * 40)) % 360; // Start from green (120) and rotate around the color wheel
      const scenarioColor = `hsl(${hue}, 60%, 45%)`;
      
      // Add scenario's loan balance
      baseData.datasets.push({
        label: scenario.name,
        data: [...scenario.data.chartData.balances],
        borderColor: scenarioColor,
        backgroundColor: `${scenarioColor}22`,
        fill: true,
        tension: 0.4
      });
    }
  });
  
  // Add whatIf data if enabled
  if (whatIfEnabled.value && whatIfChartData.value && whatIfChartData.value.datasets) {
    // Add what-if loan balance
    if (whatIfChartData.value.datasets[0]) {
      baseData.datasets.push({
        ...whatIfChartData.value.datasets[0],
        data: [...whatIfChartData.value.datasets[0].data],
        label: `What If (${whatIfInterestRate.value}%)`,
        borderColor: '#FF6B6B',
        backgroundColor: '#FF6B6B22'
      });
    }
  }

  // Update payment breakdown data based on selected scenario
  if (selectedScenarioId.value && !whatIfEnabled.value) {
    const selectedScenario = scenarios.value.find(s => s.id === selectedScenarioId.value);
    if (selectedScenario) {
      baseData.loanAmount = selectedScenario.data.chartData.loanAmount;
      baseData.totalInterest = selectedScenario.data.chartData.totalInterest;
      baseData.totalFees = selectedScenario.data.chartData.totalFees;
    }
  } else if (whatIfEnabled.value && whatIfChartData.value) {
    baseData.loanAmount = whatIfChartData.value.loanAmount;
    baseData.totalInterest = whatIfChartData.value.totalInterest;
    baseData.totalFees = whatIfChartData.value.totalFees;
  }
  
  return baseData;
});

const saveCurrentScenario = () => {
  if (!currentScenarioName.value.trim()) return
  
  // Calculate mortgage to ensure we have the latest data
  calculateMortgage()

  // Create a new scenario object with deep copy of chart data
  const newScenario = {
    id: Date.now(),
    name: currentScenarioName.value,
    data: {
      formData: { ...formData.value },
      results: { ...results.value },
      chartData: {
        labels: [...chartData.value.labels],
        balances: [...chartData.value.datasets[0].data],  // Save just the balances array
        loanAmount: chartData.value.loanAmount,
        totalInterest: chartData.value.totalInterest,
        totalFees: chartData.value.totalFees
      }
    }
  }

  // Add to scenarios list
  scenarios.value.push(newScenario)
  
  showSaveScenarioModal.value = false
  currentScenarioName.value = ''
  
  // Save to localStorage
  saveToLocalStorage()
}

const deleteScenario = (id) => {
  scenarios.value = scenarios.value.filter(s => s.id !== id)
  // If we're deleting the currently selected scenario, reset to current
  if (selectedScenarioId.value === id) {
    selectedScenarioId.value = null
  }
  // Save to localStorage
  saveToLocalStorage()
}

const clearScenarios = () => {
  scenarios.value = []
  selectedScenarioId.value = null
  saveToLocalStorage()
}


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
  
  // Helper function to create valid Excel sheet name
  function createSheetName(baseName, suffix) {
    // Remove any invalid characters
    const validName = baseName.replace(/[\\/?*[\]]/g, '')
    // Limit the base name length to allow for suffix
    const maxBaseLength = 27 - suffix.length
    const truncatedName = validName.length > maxBaseLength 
      ? validName.substring(0, maxBaseLength) + '...'
      : validName
    return truncatedName + suffix
  }

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
    ['Total Years', results.value.actualMonthsToRepay],
    ['Total Savings', formatCurrency(results.value.totalSavings)]
  ]
  
  // Add additional payments if they exist
  if (formData.value.additionalPayments.length > 0) {
    mainResults.push([''])
    mainResults.push(['Additional Payments'])
    mainResults.push(['Year', 'Month', 'Amount'])
    formData.value.additionalPayments
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
      .forEach(payment => {
        mainResults.push([
          payment.year,
          months.value[payment.month - 1],
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
  
  // Set column widths for main sheet
  wsMain['!cols'] = [
    {wch: 20}, // A
    {wch: 15}, // B
    {wch: 15}, // C
    {wch: 15}, // D
    {wch: 15}  // E
  ]
  
  // Add the main worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, wsMain, createSheetName('Current', ''))

  // Create amortization schedule sheet for current scenario
  if (chartData.value && chartData.value.datasets[0] && chartData.value.datasets[0].data.length > 0) {
    const scheduleData = createAmortizationSchedule(
      chartData.value.datasets[0].data,
      chartData.value.datasets[0].data,
      chartData.value.labels
    )
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
    XLSX.utils.book_append_sheet(wb, wsSchedule, createSheetName('Current', ' Amort'))
  }

  // Add sheets for each scenario
  if (scenarios.value.length > 0) {
    scenarios.value.forEach(scenario => {
      // Scenario Summary Sheet
      const scenarioResults = [
        [`Scenario: ${scenario.name}`],
        [''],
        ['Input Parameters'],
        ['Loan Amount', formatCurrency(scenario.data.formData.loanAmount)],
        ['Interest Rate', `${scenario.data.formData.interestRate}%`],
        ['Loan Term', `${scenario.data.formData.loanTerm} years`],
        ['Fees', formatCurrency(scenario.data.formData.feeAmount)],
        [''],
        ['Results'],
        ['Monthly Payment', formatCurrency(scenario.data.results.monthlyPayment)],
        ['Total Interest', formatCurrency(scenario.data.results.totalInterest)],
        ['Total Cost', formatCurrency(scenario.data.results.totalRepayment)],
        ['Payoff Date', scenario.data.results.finalRepaymentDate],
        ['Total Years', scenario.data.results.actualMonthsToRepay],
        ['Total Savings', formatCurrency(scenario.data.results.totalSavings)]
      ]

      // Add additional payments if they exist
      if (scenario.data.formData.additionalPayments.length > 0) {
        scenarioResults.push([''])
        scenarioResults.push(['Additional Payments'])
        scenarioResults.push(['Year', 'Month', 'Amount'])
        scenario.data.formData.additionalPayments
          .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
          .forEach(payment => {
            scenarioResults.push([
              payment.year,
              months.value[payment.month - 1],
              formatCurrency(payment.amount)
            ])
          })
      }

      // Add repayment changes if they exist
      if (scenario.data.formData.repaymentChanges.length > 0) {
        scenarioResults.push([''])
        scenarioResults.push(['Repayment Changes'])
        scenarioResults.push(['Date', 'New Amount'])
        scenario.data.formData.repaymentChanges.forEach(change => {
          scenarioResults.push([
            formatMonthYear(change.month - 1, change.year),
            formatCurrency(change.amount)
          ])
        })
      }

      const wsScenario = XLSX.utils.aoa_to_sheet(scenarioResults)
      wsScenario['!cols'] = [
        {wch: 20}, // A
        {wch: 15}, // B
        {wch: 15}, // C
        {wch: 15}, // D
        {wch: 15}  // E
      ]
      XLSX.utils.book_append_sheet(wb, wsScenario, createSheetName(scenario.name, ' Sum'))

      // Scenario Amortization Schedule
      if (scenario.data.chartData && scenario.data.chartData.balances && scenario.data.chartData.balances.length > 0) {
        const scheduleData = createAmortizationSchedule(
          scenario.data.chartData.balances,
          scenario.data.chartData.balances,
          scenario.data.chartData.labels
        )
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
        XLSX.utils.book_append_sheet(wb, wsSchedule, createSheetName(scenario.name, ' Amort'))
      }
    })
  }
  
  // Helper function to create amortization schedule data
  function createAmortizationSchedule(balances, standardBalances, timeLabels) {
    const scheduleData = [
      ['Year', 'Beginning Balance', 'Payment', 'Principal', 'Interest', 'Additional Payment', 'Ending Balance']
    ]
    
    // Find the last non-zero balance index
    let lastNonZeroIndex = balances.length - 1
    while (lastNonZeroIndex >= 0 && balances[lastNonZeroIndex] === 0) {
      lastNonZeroIndex--
    }
    // Include one more year to show the zero balance
    lastNonZeroIndex = Math.min(lastNonZeroIndex + 1, balances.length - 1)
    
    for (let i = 0; i <= lastNonZeroIndex; i++) {
      scheduleData.push([
        timeLabels[i],
        formatCurrency(balances[i]),
        formatCurrency(standardBalances[i]),
        formatCurrency(balances[i] - standardBalances[i]),
        formatCurrency(standardBalances[i] - balances[i]),
        formatCurrency(balances[i] - standardBalances[i]),
        formatCurrency(balances[i])
      ])
    }
    
    return scheduleData
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

// PMT function to calculate loan payments (similar to Excel's PMT)
const PMT = (rate, nper, pv, fv = 0, type = 0) => {
  if (rate === 0) return -pv / nper
  
  const pvif = Math.pow(1 + rate, nper)
  const pmt = rate * pv * (pvif + fv) / (pvif - 1)
  
  if (type === 1) {
    return -pmt / (1 + rate)
  } else {
    return -pmt
  }
}

const calculateMortgage = () => {
  // Reset results
  results.value = {
    monthlyPayment: null,
    totalInterest: null,
    totalRepayment: null,
    totalFees: null,
    actualMonthsToRepay: null,
    finalRepaymentDate: null,
    totalSavings: null,
    timeSavedText: null
  }

  if (!formData.value.loanAmount || !formData.value.interestRate || !formData.value.loanTerm) {
    return
  }

  // Calculate base monthly payment using PMT function
  const monthlyInterestRate = (formData.value.interestRate / 100) / 12
  const totalMonths = formData.value.loanTerm * 12
  const baseMonthlyPayment = -PMT(monthlyInterestRate, totalMonths, formData.value.loanAmount)
  
  // Store minimum monthly payment for validation
  minMonthlyPayment.value = baseMonthlyPayment
  
  // Initialize variables for tracking loan balance and payments
  let loanBalance = formData.value.loanAmount
  let totalInterestPaid = 0
  let monthsToRepay = 0
  let actualMonthsToRepay = null
  let startDate = new Date()
  let standardLoanBalance = formData.value.loanAmount
  let standardTotalInterest = 0
  const balances = [loanBalance] // Start with initial balance
  const standardBalances = [standardLoanBalance] // Start with initial balance
  const timeLabels = ['Start']
  const paymentEvents = []

  // Calculate monthly fee if applicable
  const getMonthlyFeeEquivalent = () => {
    if (!formData.value.feeAmount) return 0;
    
    switch (formData.value.feeFrequency) {
      case 'weekly':
        return (formData.value.feeAmount * 52) / 12;
      case 'fortnightly':
        return (formData.value.feeAmount * 26) / 12;
      case 'monthly':
        return formData.value.feeAmount;
      case 'quarterly':
        return formData.value.feeAmount / 3;
      case 'annual':
        return formData.value.feeAmount / 12;
      default:
        return 0;
    }
  }

  const monthlyFeeEquivalent = getMonthlyFeeEquivalent();
  let totalFeesPaid = 0;
  
  // Process each month until loan is paid off or term is reached
  while (monthsToRepay < totalMonths) {
    const month = monthsToRepay % 12;
    const year = Math.floor(monthsToRepay / 12) + startDate.getFullYear();
    const currentMonthDate = new Date(year, month);
    
    // Calculate interest for this month
    const monthlyInterest = loanBalance * monthlyInterestRate;
    const standardMonthlyInterest = standardLoanBalance * monthlyInterestRate;
    
    // Get additional payment for this month if any
    const additionalPayment = formData.value.additionalPayments.find(
      p => p.month === month + 1 && p.year === year
    )?.amount || 0;
    
    // Get repayment change for this month if any
    const repaymentChange = formData.value.repaymentChanges.find(
      p => p.month === month + 1 && p.year === year
    );
    
    // Calculate payment for this month
    let monthlyPayment = repaymentChange ? repaymentChange.amount : baseMonthlyPayment;
    
    // Apply fees if loan is still active
    if (loanBalance > 0) {
      if (formData.value.feeAmount > 0) {
        switch (formData.value.feeFrequency) {
          case 'weekly':
            totalFeesPaid += formData.value.feeAmount * (52/12);
            break;
          case 'fortnightly':
            totalFeesPaid += formData.value.feeAmount * (26/12);
            break;
          case 'monthly':
            totalFeesPaid += formData.value.feeAmount;
            break;
          case 'quarterly':
            if (month % 3 === 0) {
              totalFeesPaid += formData.value.feeAmount;
            }
            break;
          case 'annual':
            if (month === 0) {
              totalFeesPaid += formData.value.feeAmount;
            }
            break;
        }
      }
      
      // Track interest for actual loan
      totalInterestPaid += monthlyInterest;
    }
    
    // Track interest for standard loan
    if (standardLoanBalance > 0) {
      standardTotalInterest += standardMonthlyInterest;
    }
    
    // Apply payments
    let totalPayment = monthlyPayment + additionalPayment;
    
    // Update loan balances
    if (loanBalance > 0) {
      loanBalance = Math.max(0, loanBalance - (totalPayment - monthlyInterest));
      
      // Check if loan is just paid off
      if (loanBalance === 0 && actualMonthsToRepay === null) {
        actualMonthsToRepay = monthsToRepay + 1; // Add 1 since we're 0-indexed
      }
    }
    
    if (standardLoanBalance > 0) {
      standardLoanBalance = Math.max(0, standardLoanBalance - (baseMonthlyPayment - standardMonthlyInterest));
    }
    
    // Record payment events
    if (additionalPayment > 0) {
      paymentEvents.push({
        type: 'additional',
        amount: additionalPayment,
        balance: loanBalance,
        month: month + 1,
        year: year
      });
    }
    
    if (repaymentChange) {
      paymentEvents.push({
        type: 'change',
        amount: repaymentChange.amount,
        balance: loanBalance,
        month: month + 1,
        year: year
      });
    }
    
    // Record balances at the end of each year or when paid off
    if (month === 11 || monthsToRepay === totalMonths - 1) {
      balances.push(loanBalance);
      standardBalances.push(standardLoanBalance);
      timeLabels.push(`Year ${Math.floor(monthsToRepay / 12) + 1}`);
    }
    
    monthsToRepay++;
  }

  // If loan wasn't paid off, use total months
  if (actualMonthsToRepay === null) {
    actualMonthsToRepay = totalMonths;
  }

  // Calculate final repayment date and time saved
  const finalRepaymentDate = new Date(startDate);
  finalRepaymentDate.setMonth(startDate.getMonth() + actualMonthsToRepay - 1); // Subtract 1 to get to the last payment month
  
  const monthsSaved = totalMonths - actualMonthsToRepay;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonthsSaved = monthsSaved % 12;
  
  let timeSavedText = '';
  if (monthsSaved > 0) {
    if (yearsSaved > 0) {
      timeSavedText += `${yearsSaved} year${yearsSaved !== 1 ? 's' : ''}`;
      if (remainingMonthsSaved > 0) {
        timeSavedText += ` and ${remainingMonthsSaved} month${remainingMonthsSaved !== 1 ? 's' : ''}`;
      }
    } else {
      timeSavedText = `${remainingMonthsSaved} month${remainingMonthsSaved !== 1 ? 's' : ''}`;
    }
    timeSavedText += ' earlier than scheduled';
  }

  // Calculate total savings compared to standard repayment
  const standardTotalRepayment = baseMonthlyPayment * totalMonths;
  const actualTotalRepayment = formData.value.loanAmount + totalInterestPaid + totalFeesPaid;
  const totalSavings = standardTotalRepayment - actualTotalRepayment;

  // Update results
  results.value = {
    monthlyPayment: baseMonthlyPayment,
    totalInterest: totalInterestPaid,
    totalRepayment: actualTotalRepayment,
    totalFees: totalFeesPaid,
    actualMonthsToRepay: actualMonthsToRepay,
    finalRepaymentDate: finalRepaymentDate.toISOString(),
    timeSavedText: timeSavedText,
    totalSavings: totalSavings
  };

  // Update chart data
  chartData.value = {
    labels: timeLabels,
    datasets: [{
      label: 'Loan Balance',
      data: balances,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }, {
      label: 'Standard Loan',
      data: standardBalances,
      borderColor: 'rgb(156, 163, 175)',  // gray-400
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      fill: true,
      tension: 0.4
    }],
    loanAmount: formData.value.loanAmount,
    totalInterest: totalInterestPaid,
    totalFees: totalFeesPaid
  };
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

// Format date to a readable string
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
const saveToLocalStorage = () => {
  if (results.value) {
    const state = {
      formData: formData.value,
      results: results.value,
      chartData: chartData.value,
      scenarios: scenarios.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

// Save to localStorage whenever important data changes
watch([formData, results, chartData, scenarios], () => {
  saveToLocalStorage()
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
    finalRepaymentDate: null,
    totalSavings: null,
    timeSavedText: null
  }
  chartData.value = {
  labels: [],
  datasets: [],
  loanAmount: 0,
  totalInterest: 0,
  totalFees: 0
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