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
        '#21f37b',
        '#0fe26b',
        '#37ff9f',
        '#1fd58a',
        '#7ef5c7',
        '#2cf6c4',
        '#68ffa4',
        '#14d982',
        '#9bffbb',
        '#20b574'
      ],
      borderColor: '#0a1410',
      borderWidth: 2
    }]
  };

  // Monthly trend bar chart data
  const monthlyData = {
    labels: Object.keys(summary.byMonth),
    datasets: [{
      label: 'Monthly Expenses',
      data: Object.values(summary.byMonth),
      backgroundColor: '#21f37b',
      borderColor: '#0fe26b',
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
