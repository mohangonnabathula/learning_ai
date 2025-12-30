import React from 'react';
import './Dashboard.css';

function Dashboard({ summary, filteredExpenses }) {
  if (!summary) return null;

  const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.price) || 0), 0);
  const avgExpense = filteredExpenses.length > 0 ? (totalFiltered / filteredExpenses.length).toFixed(2) : 0;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-value">${summary.totalAmount.toFixed(2)}</p>
            <p className="stat-subtitle">{summary.totalExpenses} transactions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Filtered Total</h3>
            <p className="stat-value">${totalFiltered.toFixed(2)}</p>
            <p className="stat-subtitle">{filteredExpenses.length} transactions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Average Expense</h3>
            <p className="stat-value">${avgExpense}</p>
            <p className="stat-subtitle">Per transaction</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <h3>Categories</h3>
            <p className="stat-value">{Object.keys(summary.byCategory).length}</p>
            <p className="stat-subtitle">Total categories</p>
          </div>
        </div>
      </div>

      <div className="breakdown-section">
        <div className="breakdown-card">
          <h2>Expenses by Category</h2>
          <div className="category-list">
            {Object.entries(summary.byCategory).map(([category, amount]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category}</span>
                <span className="category-amount">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="breakdown-card">
          <h2>Top Months</h2>
          <div className="month-list">
            {Object.entries(summary.byMonth)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([month, amount]) => (
                <div key={month} className="month-item">
                  <span className="month-name">{month}</span>
                  <span className="month-amount">${amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
