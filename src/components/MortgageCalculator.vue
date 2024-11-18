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
import { ref } from 'vue'

const formData = ref({
  loanAmount: 500000,
  loanTerm: 30,
  interestRate: 5.5,
  repaymentFrequency: 'monthly',
  feeAmount: 10,
  feeFrequency: 'monthly'
})

const results = ref(null)

const calculateMortgage = () => {
  // Convert annual interest rate to monthly
  const monthlyRate = formData.value.interestRate / 100 / 12
  const totalMonths = formData.value.loanTerm * 12

  // Calculate monthly fee equivalent
  let monthlyFees = 0
  switch (formData.value.feeFrequency) {
    case 'weekly':
      monthlyFees = formData.value.feeAmount * 52 / 12 // Convert weekly to monthly
      break
    case 'monthly':
      monthlyFees = formData.value.feeAmount
      break
    case 'quarterly':
      monthlyFees = formData.value.feeAmount / 3 // Convert quarterly to monthly
      break
    case 'annually':
      monthlyFees = formData.value.feeAmount / 12 // Convert annual to monthly
      break
    case 'once':
      // Add once-off fee to the loan amount
      formData.value.loanAmount += formData.value.feeAmount
      break
  }

  // Calculate base monthly payment using the mortgage payment formula
  // P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  // where: P = Payment, L = Loan amount, c = monthly interest rate, n = total number of months
  let monthlyPayment = (
    formData.value.loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  )

  // Add recurring fees to the monthly payment
  monthlyPayment += monthlyFees

  // Adjust payment based on frequency
  let minimumRepayment = monthlyPayment
  if (formData.value.repaymentFrequency === 'fortnightly') {
    minimumRepayment = (monthlyPayment * 12) / 26
  } else if (formData.value.repaymentFrequency === 'weekly') {
    minimumRepayment = (monthlyPayment * 12) / 52
  }

  // Calculate total cost including fees
  const totalMonthlyFees = monthlyFees * totalMonths
  const totalOnceOffFees = formData.value.feeFrequency === 'once' ? formData.value.feeAmount : 0
  const totalPayments = (monthlyPayment * totalMonths)
  const totalFees = totalMonthlyFees + totalOnceOffFees
  const totalInterest = totalPayments - formData.value.loanAmount - totalFees

  // Calculate repayment date
  const today = new Date()
  const repaymentDate = new Date(today.getFullYear() + formData.value.loanTerm, today.getMonth(), 1)

  results.value = {
    minimumRepayment,
    repaymentDate: repaymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    timeToRepay: `${formData.value.loanTerm} years`,
    totalInterest,
    totalFees
  }
}
</script>
