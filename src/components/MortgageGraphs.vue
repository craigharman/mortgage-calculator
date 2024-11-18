<template>
  <div class="flex flex-col gap-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Payment Breakdown</h3>
        <DoughnutChart :data="paymentBreakdownData" :options="doughnutOptions" />
      </div>
    </div>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Loan Balance Over Time</h3>
        <div class="h-96"> 
          <LineChart :data="balanceChartData" :options="balanceChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Line as LineChart, Doughnut as DoughnutChart } from 'vue-chartjs';
import { computed } from 'vue';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
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
      backgroundColor: 'rgba(30, 58, 138, 0.8)', // dark blue background
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(59, 130, 246, 0.5)', // blue border
      borderWidth: 1,
    },
    filler: {
      propagate: false
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(226, 232, 240, 0.3)', // subtle grid lines
      },
    },
    y: {
      grid: {
        color: 'rgba(226, 232, 240, 0.3)', // subtle grid lines
      },
      ticks: {
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

// Professional color palette
const colors = {
  standard: {
    line: 'rgba(30, 58, 138, 0.7)', // dark blue
    fill: 'rgba(30, 58, 138, 0.1)'
  },
  current: {
    line: 'rgba(59, 130, 246, 1)', // medium blue
    fill: 'rgba(59, 130, 246, 0.1)'
  },
  scenarios: [
    { line: 'rgba(14, 165, 233, 0.7)', fill: 'rgba(14, 165, 233, 0.1)' }, // sky blue
    { line: 'rgba(56, 189, 248, 0.7)', fill: 'rgba(56, 189, 248, 0.1)' }, // lighter blue
    { line: 'rgba(2, 132, 199, 0.7)', fill: 'rgba(2, 132, 199, 0.1)' },   // darker blue
    { line: 'rgba(51, 65, 85, 0.7)', fill: 'rgba(51, 65, 85, 0.1)' },     // slate
    { line: 'rgba(71, 85, 105, 0.7)', fill: 'rgba(71, 85, 105, 0.1)' }    // darker slate
  ]
}

const paymentBreakdownData = computed(() => ({
  labels: ['Principal', 'Interest', 'Fees'],
  datasets: [{
    data: [
      props.chartData.loanAmount,
      props.chartData.totalInterest,
      props.chartData.totalFees
    ],
    backgroundColor: [
      colors.standard.fill,
      colors.current.fill,
      colors.scenarios[0].fill
    ],
    borderColor: [
      colors.standard.line,
      colors.current.line,
      colors.scenarios[0].line
    ],
    borderWidth: 1
  }]
}));

const balanceChartData = computed(() => {
  const datasets = [
    {
      label: 'Standard Loan',
      data: props.chartData.standardBalances,
      borderColor: colors.standard.line,
      backgroundColor: colors.standard.fill,
      fill: true,
      tension: 0.4,
      borderDash: [5, 5], // Make it a dashed line
      spanGaps: true,
    }
  ]

  // Add current scenario
  datasets.push({
    label: 'Current Scenario',
    data: props.chartData.balances,
    borderColor: colors.current.line,
    backgroundColor: colors.current.fill,
    fill: true,
    tension: 0.4,
    spanGaps: true,
  })

  // Add saved scenarios
  if (props.chartData.scenarios) {
    props.chartData.scenarios.forEach((scenario, index) => {
      const colorIndex = index % colors.scenarios.length
      datasets.push({
        label: scenario.name,
        data: scenario.data.chartData.balances,
        borderColor: colors.scenarios[colorIndex].line,
        backgroundColor: colors.scenarios[colorIndex].fill,
        fill: true,
        tension: 0.4,
        spanGaps: true,
      })
    })
  }

  // Add payment events
  datasets.push({
    label: 'Payment Events',
    data: props.chartData.paymentEvents.map(event => ({
      x: props.chartData.timeLabels[Math.floor(event.month / 12)],
      y: event.balance,
    })),
    backgroundColor: event => 
      event.raw?.type === 'additional' ? colors.scenarios[0].fill : colors.scenarios[1].fill,
    borderColor: event => 
      event.raw?.type === 'additional' ? colors.scenarios[0].line : colors.scenarios[1].line,
    pointStyle: event => 
      event.raw?.type === 'additional' ? 'star' : 'triangle',
    pointRadius: 8,
    showLine: false,
  })

  return {
    labels: props.chartData.timeLabels,
    datasets
  }
})

const balanceChartOptions = computed(() => ({
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: {
      ...baseOptions.plugins.legend,
      align: 'center',
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      ...baseOptions.plugins.tooltip,
      callbacks: {
        label: (context) => {
          if (context.dataset.label === 'Payment Events') {
            const event = props.chartData.paymentEvents[context.dataIndex]
            return `${event.type === 'additional' ? 'Additional Payment' : 'Repayment Change'}: $${event.amount.toLocaleString()}`
          }
          const value = context.raw || 0
          return `${context.dataset.label}: $${value.toLocaleString()}`
        }
      }
    },
  },
  scales: {
    ...baseOptions.scales,
    x: {
      ...baseOptions.scales.x,
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
}))

const doughnutOptions = {
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
        }
      }
    }
  }
};
</script>
