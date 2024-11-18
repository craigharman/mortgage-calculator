<template>
  <div class="flex flex-col gap-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title text-gray-800">Payment Breakdown</h3>
        <div class="relative h-64">
          <PieChart 
            v-if="hasData"
            :data="paymentBreakdownData" 
            :options="pieOptions"
          />
          <div v-else class="text-center text-gray-500 mt-4">
            Enter loan details and click calculate to see the breakdown
          </div>
        </div>
      </div>
    </div>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title text-gray-800">Loan Balance Over Time</h3>
        <div class="h-96"> 
          <LineChart :data="balanceChartData" :options="balanceChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Line as LineChart, Pie as PieChart } from 'vue-chartjs';
import { computed } from 'vue';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({
      loanAmount: 0,
      totalInterest: 0,
      totalFees: 0,
      balances: [],
      standardBalances: [],
      timeLabels: [],
      paymentEvents: [],
      interestRate: 0,
      minimumRepayment: 0
    })
  }
});

const hasData = computed(() => {
  return props.chartData && 
         (props.chartData.loanAmount > 0 || 
          props.chartData.totalInterest > 0 || 
          props.chartData.totalFees > 0);
});

const paymentBreakdownData = computed(() => {
  const loanAmount = Number(props.chartData.loanAmount) || 0;
  const totalInterest = Number(props.chartData.totalInterest) || 0;
  const totalFees = Number(props.chartData.totalFees) || 0;

  return {
    labels: ['Principal', 'Interest', 'Fees'],
    datasets: [{
      data: [loanAmount, totalInterest, totalFees],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(79, 70, 229, 0.7)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(79, 70, 229, 1)'
      ],
      borderWidth: 1
    }]
  };
});

const baseOptions = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',  // gray-800
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(107, 114, 128, 0.5)',  // gray-500
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      titleFont: {
        weight: 600
      }
    },
    filler: {
      propagate: false
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(243, 244, 246, 0.6)',  // gray-100
        tickColor: 'rgba(209, 213, 219, 0.6)'  // gray-300
      },
      ticks: {
        color: 'rgb(55, 65, 81)'  // gray-700
      }
    },
    y: {
      grid: {
        color: 'rgba(243, 244, 246, 0.6)',  // gray-100
        tickColor: 'rgba(209, 213, 219, 0.6)'  // gray-300
      },
      ticks: {
        color: 'rgb(55, 65, 81)',  // gray-700
        callback: value => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value);
        }
      }
    }
  }
}

const colors = {
  standard: {
    line: 'rgba(79, 70, 229, 0.7)',  // indigo-600
    fill: 'rgba(79, 70, 229, 0.1)'
  },
  current: {
    line: 'rgba(16, 185, 129, 0.9)',  // emerald-500
    fill: 'rgba(16, 185, 129, 0.1)'
  },
  scenarios: [
    { line: 'rgba(245, 158, 11, 0.7)', fill: 'rgba(245, 158, 11, 0.1)' },  // amber-500
    { line: 'rgba(219, 39, 119, 0.7)', fill: 'rgba(219, 39, 119, 0.1)' },  // pink-600
    { line: 'rgba(37, 99, 235, 0.7)', fill: 'rgba(37, 99, 235, 0.1)' },    // blue-600
    { line: 'rgba(147, 51, 234, 0.7)', fill: 'rgba(147, 51, 234, 0.1)' },  // purple-600
    { line: 'rgba(220, 38, 38, 0.7)', fill: 'rgba(220, 38, 38, 0.1)' }     // red-600
  ]
}

const balanceChartData = computed(() => {
  const fullTimeLabels = ['Start']
  for (let i = 1; i <= Math.max(30, Math.ceil(props.chartData.timeLabels.length / 12)); i++) {
    fullTimeLabels.push(`Year ${i}`)
  }

  const extendedBalances = [...props.chartData.balances]
  const extendedStandardBalances = [...props.chartData.standardBalances]
  
  while (extendedBalances.length < fullTimeLabels.length) {
    extendedBalances.push(0)
  }

  if (extendedStandardBalances.length < fullTimeLabels.length) {
    const monthlyRate = (props.chartData.interestRate / 100) / 12
    const monthlyPayment = props.chartData.minimumRepayment
    let balance = extendedStandardBalances[extendedStandardBalances.length - 1]
    
    while (extendedStandardBalances.length < fullTimeLabels.length) {
      for (let i = 0; i < 12 && balance > 0; i++) {
        const interestPayment = balance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        balance = Math.max(0, balance - principalPayment)
      }
      extendedStandardBalances.push(balance)
    }
  }

  const extendedScenarioBalances = {}
  if (props.chartData.scenarioBalances) {
    Object.entries(props.chartData.scenarioBalances).forEach(([key, balances]) => {
      const extended = [...balances]
      while (extended.length < fullTimeLabels.length) {
        extended.push(0)  
      }
      extendedScenarioBalances[key] = extended
    })
  }

  const datasets = [
    {
      label: 'Standard Loan',
      data: extendedStandardBalances,
      borderColor: colors.standard.line,
      backgroundColor: colors.standard.fill,
      fill: true,
      tension: 0.4
    },
    {
      label: 'Current',
      data: extendedBalances,
      borderColor: colors.current.line,
      backgroundColor: colors.current.fill,
      fill: true,
      tension: 0.4
    }
  ]

  if (props.chartData.scenarioBalances) {
    Object.entries(extendedScenarioBalances).forEach(([key, balances], index) => {
      datasets.push({
        label: key,
        data: balances,
        borderColor: colors.scenarios[index % colors.scenarios.length].line,
        backgroundColor: colors.scenarios[index % colors.scenarios.length].fill,
        fill: true,
        tension: 0.4
      })
    })
  }

  if (props.chartData.paymentEvents && props.chartData.paymentEvents.length > 0) {
    // Add event markers for current balance and scenarios
    const allBalances = [
      { balances: extendedBalances, label: 'Current', color: colors.current.line },
      ...Object.entries(extendedScenarioBalances).map(([key, balances], index) => ({
        balances,
        label: key,
        color: colors.scenarios[index % colors.scenarios.length].line
      }))
    ]

    allBalances.forEach(({ balances, label, color }) => {
      const eventPoints = new Array(fullTimeLabels.length).fill(null)
      const eventLabels = new Array(fullTimeLabels.length).fill(null)
      
      props.chartData.paymentEvents.forEach(event => {
        const yearIndex = Math.floor(event.month / 12)
        if (yearIndex < eventPoints.length) {
          eventPoints[yearIndex] = balances[yearIndex]
          eventLabels[yearIndex] = `${label} - ${event.type === 'repaymentChange' ? 'Repayment Change' : 'Additional Payment'}: $${event.amount.toLocaleString()}`
        }
      })

      datasets.push({
        label: `Payment Events (${label})`,
        data: eventPoints,
        borderColor: color,
        backgroundColor: color,
        pointStyle: 'circle',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
        tooltip: {
          callbacks: {
            label: (context) => eventLabels[context.dataIndex] || ''
          }
        }
      })
    })
  }

  return {
    labels: fullTimeLabels,
    datasets
  }
})

const balanceChartOptions = {
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: {
      ...baseOptions.plugins.legend,
      labels: {
        filter: function(legendItem, data) {
          return !legendItem.text.includes('Payment Events')
        }
      }
    },
    tooltip: {
      ...baseOptions.plugins.tooltip,
      callbacks: {
        label: function(context) {
          const dataset = context.dataset
          if (dataset.label.includes('Payment Events') && dataset.tooltip.callbacks.label) {
            return dataset.tooltip.callbacks.label(context)
          }
          if (!context.raw && context.raw !== 0) return ''
          return `${dataset.label}: $${context.raw.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    ...baseOptions.scales,
    x: {
      ...baseOptions.scales.x,
      grid: {
        ...baseOptions.scales.x.grid,
        display: true
      },
      ticks: {
        ...baseOptions.scales.x.ticks,
        autoSkip: false,
        maxRotation: 45
      }
    },
    y: {
      ...baseOptions.scales.y,
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            compactDisplay: 'short'
          }).format(value)
        }
      }
    }
  }
}

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(107, 114, 128, 0.5)',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          const formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value);
          return `${context.label}: ${formattedValue} (${percentage}%)`;
        }
      }
    }
  }
}
</script>
