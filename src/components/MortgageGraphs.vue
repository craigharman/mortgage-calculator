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

// Professional color palette with vibrant but corporate colors
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

const paymentBreakdownData = computed(() => ({
  labels: ['Principal', 'Interest', 'Fees'],
  datasets: [{
    data: [
      props.chartData.loanAmount,
      props.chartData.totalInterest,
      props.chartData.totalFees
    ],
    backgroundColor: [
      'rgba(16, 185, 129, 0.7)',  // emerald-500
      'rgba(245, 158, 11, 0.7)',  // amber-500
      'rgba(79, 70, 229, 0.7)'    // indigo-600
    ],
    borderColor: [
      'rgba(16, 185, 129, 1)',    // emerald-500
      'rgba(245, 158, 11, 1)',    // amber-500
      'rgba(79, 70, 229, 1)'      // indigo-600
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
      tension: 0.4
    },
    {
      label: 'With Extra Payments',
      data: props.chartData.balances,
      borderColor: colors.current.line,
      backgroundColor: colors.current.fill,
      fill: true,
      tension: 0.4
    }
  ]

  // Add payment events if they exist
  if (props.chartData.paymentEvents && props.chartData.paymentEvents.length > 0) {
    const eventPoints = new Array(props.chartData.timeLabels.length).fill(null)
    props.chartData.paymentEvents.forEach(event => {
      const index = Math.floor(event.month / 12)
      if (index < eventPoints.length) {
        eventPoints[index] = props.chartData.balances[index]
      }
    })

    datasets.push({
      label: 'Payment Events',
      data: eventPoints,
      borderColor: 'rgba(239, 68, 68, 1)', // red-500
      backgroundColor: 'rgba(239, 68, 68, 1)',
      pointStyle: 'circle',
      pointRadius: 6,
      pointHoverRadius: 8,
      showLine: false
    })
  }

  return {
    labels: props.chartData.timeLabels,
    datasets
  }
})

const balanceChartOptions = {
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    tooltip: {
      ...baseOptions.plugins.tooltip,
      callbacks: {
        label: function(context) {
          if (!context.raw && context.raw !== 0) return ''
          return `${context.dataset.label}: $${context.raw.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    ...baseOptions.scales,
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
          if (!context.raw && context.raw !== 0) return '';
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
