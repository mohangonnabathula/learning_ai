const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Path to Excel file
const excelPath = path.join(__dirname, '../..', 'data/expense_calculator/expense_tracker.xlsx');

// Load and parse Excel file
function loadExpenseData() {
  try {
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let data = xlsx.utils.sheet_to_json(worksheet);
    
    // Normalize categories - combine similar ones (different casing)
    data = data.map(row => ({
      ...row,
      Category: normalizeCategory(row.Category)
    }));
    
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
}

// Normalize category names to combine similar ones with different casing
function normalizeCategory(category) {
  if (!category) return category;
  
  const normalizedMap = {
    'meat': 'Meat',
    'Meat': 'Meat',
    'travel': 'Travel',
    'Travel': 'Travel',
    'entertainment': 'Entertainment',
    'Entertainment': 'Entertainment',
    'food': 'Food',
    'Food': 'Food',
    'gas': 'Gas',
    'Gas': 'Gas'
  };
  
  return normalizedMap[category] || category;
}

// API Endpoints

// Get all expenses
app.get('/api/expenses', (req, res) => {
  const expenses = loadExpenseData();
  res.json(expenses);
});

// Get expenses by month
app.get('/api/expenses/month/:month', (req, res) => {
  const { month } = req.params;
  const expenses = loadExpenseData();
  
  const filtered = expenses.filter(exp => {
    if (exp.month) {
      return exp.month.toLowerCase() === month.toLowerCase();
    }
    return false;
  });
  
  res.json(filtered);
});

// Get summary statistics
app.get('/api/summary', (req, res) => {
  const expenses = loadExpenseData();
  
  const summary = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + (parseFloat(exp.price) || 0), 0),
    byCategory: {},
    byMonth: {}
  };
  
  expenses.forEach(exp => {
    // By category
    if (exp.Category) {
      summary.byCategory[exp.Category] = (summary.byCategory[exp.Category] || 0) + (parseFloat(exp.price) || 0);
    }
    
    // By month
    if (exp.month) {
      summary.byMonth[exp.month] = (summary.byMonth[exp.month] || 0) + (parseFloat(exp.price) || 0);
    }
  });
  
  res.json(summary);
});

// Get categories
app.get('/api/categories', (req, res) => {
  const expenses = loadExpenseData();
  const categories = [...new Set(expenses.map(exp => exp.Category).filter(Boolean))].sort();
  res.json(categories);
});

// Get expenses by category
app.get('/api/expenses/category/:category', (req, res) => {
  const { category } = req.params;
  const expenses = loadExpenseData();
  
  const filtered = expenses.filter(exp => exp.Category === category);
  res.json(filtered);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Reading expenses from: ${excelPath}`);
});
