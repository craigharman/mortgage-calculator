<template>
  <div v-if="chartData" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Payment Breakdown</h3>
        <DoughnutChart :data="paymentBreakdownData" :options="doughnutOptions" />
      </div>
    </div>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Loan Balance Over Time</h3>
        <LineChart :data="balanceChartData" :options="balanceChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Line as LineChart, Doughnut as DoughnutChart } from 'vue-chartjs';
import { computed } from 'vue';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

const paymentBreakdownData = computed(() => ({
  labels: ['Principal', 'Interest', 'Fees'],
  datasets: [{
    data: [
      props.chartData.loanAmount,
      props.chartData.totalInterest,
      props.chartData.totalFees
    ],
    backgroundColor: [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 206, 86, 0.8)'
    ],
    borderColor: [
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 206, 86, 1)'
    ],
    borderWidth: 1
  }]
}));

const balanceChartData = computed(() => ({
  labels: props.chartData.timeLabels,
  datasets: [
    {
      label: 'Your Loan Balance',
      data: props.chartData.balances,
      borderColor: '#2563eb', // blue-600
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
      spanGaps: true, // This will connect points even with gaps in data
    },
    {
      label: 'Standard Loan',
      data: props.chartData.standardBalances,
      borderColor: '#dc2626', // red-600
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      fill: true,
      tension: 0.4,
      borderDash: [5, 5], // Make it a dashed line
      spanGaps: true, // This will connect points even with gaps in data
    },
    {
      label: 'Payment Events',
      data: props.chartData.paymentEvents.map(event => ({
        x: props.chartData.timeLabels[Math.floor(event.month / 12)],
        y: event.balance,
      })),
      backgroundColor: event => 
        event.raw?.type === 'additional' ? '#16a34a' : '#eab308', // green-600 for additional, yellow-500 for repayment
      borderColor: event => 
        event.raw?.type === 'additional' ? '#16a34a' : '#eab308',
      pointStyle: event => 
        event.raw?.type === 'additional' ? 'star' : 'triangle',
      pointRadius: 8,
      showLine: false, // Don't connect the points
    }
  ]
}));

const balanceChartOptions = computed(() => ({
  responsive: true,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    tooltip: {
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
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      }
    },
    x: {
      grid: {
        color: (context) => {
          const label = context.tick.label || '';
          return label.includes('paid)') ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        }
      }
    }
  },
}));

const doughnutOptions = {
  responsive: true,
  plugins: {
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

const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `Balance: $${context.raw.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString();
        }
      }
    }
  }
};
</script>
