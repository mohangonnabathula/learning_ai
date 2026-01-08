import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './Charts.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Charts({ expenses, summary }) {
  if (!summary) return null;

  // Category pie chart data
  const categoryData = {
    labels: Object.keys(summary.byCategory),
    datasets: [{
      data: Object.values(summary.byCategory),
      backgroundColor: [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe',
        '#00f2fe',
        '#43e97b',
        '#fa709a',
        '#ff6b6b',
        '#ffd93d',
        '#6bcf7f'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  // Monthly trend bar chart data
  const monthlyData = {
    labels: Object.keys(summary.byMonth),
    datasets: [{
      label: 'Monthly Expenses',
      data: Object.values(summary.byMonth),
      backgroundColor: '#667eea',
      borderColor: '#764ba2',
      borderWidth: 2,
      borderRadius: 5
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 15
        }
      }
    }
  };

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h2>Expenses by Category</h2>
        <div className="chart-wrapper">
          <Pie data={categoryData} options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return '$' + context.parsed.toFixed(2);
                  }
                }
              }
            }
          }} />
        </div>
      </div>

      <div className="chart-card full-width">
        <h2>Monthly Spending Trend</h2>
        <div className="chart-wrapper">
          <Bar data={monthlyData} options={{
            ...chartOptions,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toFixed(0);
                  }
                }
              }
            },
            plugins: {
              ...chartOptions.plugins,
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return '$' + context.parsed.y.toFixed(2);
                  }
                }
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
}

export default Charts;
