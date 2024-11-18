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

const balanceChartData = computed(() => {
  const datasets = [
    {
      label: 'Standard Loan',
      data: props.chartData.standardBalances,
      borderColor: '#dc2626', // red-600
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
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
    borderColor: '#2563eb', // blue-600
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    fill: true,
    tension: 0.4,
    spanGaps: true,
  })

  // Add saved scenarios
  if (props.chartData.scenarios) {
    const colors = [
      '#16a34a', // green-600
      '#9333ea', // purple-600
      '#ea580c', // orange-600
      '#0891b2', // cyan-600
      '#4f46e5', // indigo-600
    ]

    props.chartData.scenarios.forEach((scenario, index) => {
      const colorIndex = index % colors.length
      datasets.push({
        label: scenario.name,
        data: scenario.data.chartData.balances,
        borderColor: colors[colorIndex],
        backgroundColor: `${colors[colorIndex]}1a`, // 10% opacity
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
      event.raw?.type === 'additional' ? '#16a34a' : '#eab308',
    borderColor: event => 
      event.raw?.type === 'additional' ? '#16a34a' : '#eab308',
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
  responsive: true,
  maintainAspectRatio: false,
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
      align: 'center',
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      },
      grid: {
        drawBorder: false,
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        color: (context) => {
          const label = context.tick.label || '';
          return label.includes('paid)') ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        }
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  },
}))

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
