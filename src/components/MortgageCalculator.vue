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

          <div class="divider"></div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Calculate</button>
          </div>
        </form>

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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const formData = ref({
  loanAmount: 500000,
  loanTerm: 30,
  interestRate: 5.5,
  repaymentFrequency: 'monthly',
  feeAmount: 10,
  feeFrequency: 'monthly',
  additionalPayments: []
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

const calculateMortgage = () => {
  // Convert annual interest rate to monthly
  const monthlyRate = formData.value.interestRate / 100 / 12
  const totalMonths = formData.value.loanTerm * 12

  // Calculate monthly fee equivalent
  let monthlyFees = 0
  switch (formData.value.feeFrequency) {
    case 'weekly':
      monthlyFees = formData.value.feeAmount * 52 / 12
      break
    case 'monthly':
      monthlyFees = formData.value.feeAmount
      break
    case 'quarterly':
      monthlyFees = formData.value.feeAmount / 3
      break
    case 'annually':
      monthlyFees = formData.value.feeAmount / 12
      break
    case 'once':
      formData.value.loanAmount += formData.value.feeAmount
      break
  }

  // Sort additional payments by date
  const sortedPayments = [...formData.value.additionalPayments]
    .sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1)
      const dateB = new Date(b.year, b.month - 1)
      return dateA - dateB
    })

  // Calculate loan amortization with additional payments
  let remainingBalance = formData.value.loanAmount
  let totalInterestPaid = 0
  let monthsToRepay = 0
  let actualMonthlyPayment = (
    formData.value.loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  ) + monthlyFees

  const startDate = new Date()
  let currentDate = new Date(startDate)
  let finalRepaymentDate = new Date(startDate)

  // Simulate monthly payments until loan is paid off
  while (remainingBalance > 0 && monthsToRepay < totalMonths) {
    // Calculate interest for this month
    const interestThisMonth = remainingBalance * monthlyRate
    totalInterestPaid += interestThisMonth

    // Apply regular payment
    const principalPayment = actualMonthlyPayment - monthlyFees - interestThisMonth
    remainingBalance -= principalPayment

    // Check for additional payments in this month
    const paymentsThisMonth = sortedPayments.filter(payment => 
      payment.year === currentDate.getFullYear() && 
      payment.month === currentDate.getMonth() + 1
    )

    // Apply additional payments
    for (const payment of paymentsThisMonth) {
      remainingBalance -= payment.amount
      if (remainingBalance < 0) remainingBalance = 0
    }

    monthsToRepay++
    currentDate.setMonth(currentDate.getMonth() + 1)
    
    if (remainingBalance <= 0) {
      finalRepaymentDate = new Date(currentDate)
    }
  }

  // Calculate total fees
  const totalMonthlyFees = monthlyFees * monthsToRepay
  const totalOnceOffFees = formData.value.feeFrequency === 'once' ? formData.value.feeAmount : 0
  const totalFees = totalMonthlyFees + totalOnceOffFees

  // Adjust payment based on frequency
  let minimumRepayment = actualMonthlyPayment
  if (formData.value.repaymentFrequency === 'fortnightly') {
    minimumRepayment = (actualMonthlyPayment * 12) / 26
  } else if (formData.value.repaymentFrequency === 'weekly') {
    minimumRepayment = (actualMonthlyPayment * 12) / 52
  }

  const years = Math.floor(monthsToRepay / 12)
  const months = monthsToRepay % 12

  results.value = {
    minimumRepayment,
    repaymentDate: finalRepaymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    timeToRepay: `${years} years${months ? ` ${months} months` : ''}`,
    totalInterest: totalInterestPaid,
    totalFees,
    monthsSaved: totalMonths - monthsToRepay
  }
}

const results = ref(null)
</script>