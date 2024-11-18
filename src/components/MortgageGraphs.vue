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
        <LineChart :data="balanceOverTimeData" :options="lineOptions" />
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

const balanceOverTimeData = computed(() => ({
  labels: props.chartData.timeLabels,
  datasets: [{
    label: 'Loan Balance',
    data: props.chartData.balances,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1,
    fill: false
  }]
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
