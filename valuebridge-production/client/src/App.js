import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import CompanyResearch from './components/CompanyResearch';
import Portfolio from './components/Portfolio';
import LoginScreen from './components/LoginScreen';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogin = (email, fullName) => {
    setUser({ email, fullName });
    setIsDemoMode(false);
  };

  const handleDemoMode = () => {
    setUser({ email: 'demo@example.com', fullName: 'Demo User' });
    setIsDemoMode(true);
  };

  const handleLogout = () => {
    setUser(null);
    setExpenses([]);
    setSummary(null);
    setPortfolio(null);
    setSelectedMonth(null);
    setSelectedCategory(null);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      console.log('Fetching from:', apiUrl);
      const [expensesRes, summaryRes, portfolioRes] = await Promise.all([
        axios.get(`${apiUrl}/api/expenses`),
        axios.get(`${apiUrl}/api/summary`),
        axios.get(`${apiUrl}/api/portfolio`)
      ]);
      console.log('Expenses loaded:', expensesRes.data.length);
      console.log('Summary:', summaryRes.data);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
      setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      alert('Error loading data: ' + error.message);
    }
    setLoading(false);
  };

  const getFilteredExpenses = () => {
    let filtered = [...expenses];
    
    if (selectedMonth) {
      filtered = filtered.filter(exp => {
        if (exp.month) {
          return exp.month.toLowerCase() === selectedMonth.toLowerCase();
        }
        return false;
      });
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(exp => exp.Category === selectedCategory);
    }
    
    return filtered;
  };

  const months = Array.from(new Set(
    expenses
      .filter(exp => exp.month)
      .map(exp => exp.month)
  )).sort();

  const categories = Array.from(new Set(expenses.map(exp => exp.Category).filter(Boolean))).sort();
  const filteredExpenses = getFilteredExpenses();

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onDemoMode={handleDemoMode} />;
  }

  if (loading || !summary || !portfolio) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>💰 ValueBridge</h1>
        </div>
        <div className="header-right">
          <span className="user-info">Welcome back, <strong>{user.fullName}</strong></span>
          {isDemoMode && <span className="demo-badge">Demo Mode</span>}
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <nav className="tab-nav">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts
        </button>
        <button 
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
        <button 
          className={`tab ${activeTab === 'research' ? 'active' : ''}`}
          onClick={() => setActiveTab('research')}
        >
          Company Research
        </button>
      </nav>

      <div className="filters">
        <div className="filter-group">
          <label>Month:</label>
          <select value={selectedMonth || ''} onChange={(e) => setSelectedMonth(e.target.value || null)}>
            <option value="">All Months</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={selectedCategory || ''} onChange={(e) => setSelectedCategory(e.target.value || null)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard summary={summary} filteredExpenses={filteredExpenses} />}
        {activeTab === 'charts' && <Charts expenses={expenses} summary={summary} />}
        {activeTab === 'portfolio' && <Portfolio data={portfolio} />}
        {activeTab === 'research' && <CompanyResearch />}
      </main>
    </div>
  );
}

export default App;
