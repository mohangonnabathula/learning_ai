import React, { useState } from 'react';
import './ExpenseList.css';

function ExpenseList({ expenses }) {
  const [sortField, setSortField] = useState('month');
  const [sortDir, setSortDir] = useState('desc');

  const sortedExpenses = [...expenses].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'price') {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="expense-list">
        <div className="no-data">
          No expenses found. Try adjusting your filters.
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <table className="expense-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('month')}>
              Month {sortField === 'month' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('Category')}>
              Category {sortField === 'Category' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('price')}>
              Amount {sortField === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense, idx) => (
            <tr key={idx}>
              <td>{expense.month || 'N/A'}</td>
              <td><span className="category-badge">{expense.Category}</span></td>
              <td className="amount">${parseFloat(expense.price || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="list-footer">
        Total: {expenses.length} expenses
      </div>
    </div>
  );
}

export default ExpenseList;
