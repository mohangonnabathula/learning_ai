import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './DeckersData.css';

function DeckersData() {
  const [timeframe, setTimeframe] = useState('quarterly');

  // Stock Price Data
  const priceData = [
    { date: 'Q1 2023', price: 85 },
    { date: 'Q2 2023', price: 92 },
    { date: 'Q3 2023', price: 105 },
    { date: 'Q4 2023', price: 115 },
    { date: 'Q1 2024', price: 128 },
    { date: 'Q2 2024', price: 135 },
    { date: 'Q3 2024', price: 145 },
    { date: 'Q4 2024', price: 155 },
  ];

  // Revenue Data
  const revenueData = [
    { period: 'Q1 2023', revenue: 850 },
    { period: 'Q2 2023', revenue: 920 },
    { period: 'Q3 2023', revenue: 1050 },
    { period: 'Q4 2023', revenue: 1180 },
    { period: 'Q1 2024', revenue: 950 },
    { period: 'Q2 2024', revenue: 1080 },
    { period: 'Q3 2024', revenue: 1240 },
    { period: 'Q4 2024', revenue: 1390 },
  ];

  // EBITDA Data
  const ebitdaData = [
    { period: 'Q1 2023', ebitda: 200 },
    { period: 'Q2 2023', ebitda: 220 },
    { period: 'Q3 2023', ebitda: 280 },
    { period: 'Q4 2023', ebitda: 320 },
    { period: 'Q1 2024', ebitda: 240 },
    { period: 'Q2 2024', ebitda: 290 },
    { period: 'Q3 2024', ebitda: 350 },
    { period: 'Q4 2024', ebitda: 410 },
  ];

  // Free Cash Flow Data
  const fcfData = [
    { period: 'Q1 2023', fcf: 120 },
    { period: 'Q2 2023', fcf: 90 },
    { period: 'Q3 2023', fcf: 150 },
    { period: 'Q4 2023', fcf: 200 },
    { period: 'Q1 2024', fcf: 130 },
    { period: 'Q2 2024', fcf: 110 },
    { period: 'Q3 2024', fcf: 180 },
    { period: 'Q4 2024', fcf: 280 },
  ];

  // Net Income Data
  const netIncomeData = [
    { period: 'Q1 2023', income: 80 },
    { period: 'Q2 2023', income: 95 },
    { period: 'Q3 2023', income: 130 },
    { period: 'Q4 2023', income: 160 },
    { period: 'Q1 2024', income: 100 },
    { period: 'Q2 2024', income: 130 },
    { period: 'Q3 2024', income: 180 },
    { period: 'Q4 2024', income: 220 },
  ];

  // EPS Data
  const epsData = [
    { period: 'Q1 2023', eps: 0.52 },
    { period: 'Q2 2023', eps: 0.61 },
    { period: 'Q3 2023', eps: 0.85 },
    { period: 'Q4 2023', eps: 1.04 },
    { period: 'Q1 2024', eps: 0.64 },
    { period: 'Q2 2024', eps: 0.84 },
    { period: 'Q3 2024', eps: 1.16 },
    { period: 'Q4 2024', eps: 1.42 },
  ];

  // Cash & Debt Data
  const debtData = [
    { period: 'Q1 2023', cash: 600, debt: 300 },
    { period: 'Q2 2023', cash: 650, debt: 300 },
    { period: 'Q3 2023', cash: 700, debt: 280 },
    { period: 'Q4 2023', cash: 750, debt: 250 },
    { period: 'Q1 2024', cash: 800, debt: 250 },
    { period: 'Q2 2024', cash: 850, debt: 220 },
    { period: 'Q3 2024', cash: 920, debt: 200 },
    { period: 'Q4 2024', cash: 1050, debt: 150 },
  ];

  // Brand Distribution
  const brandData = [
    { name: 'UGG', value: 50.4, fill: '#9b59b6' },
    { name: 'HOKA', value: 44.4, fill: '#e67e22' },
    { name: 'Other', value: 5.2, fill: '#95a5a6' },
  ];

  // Expense Data
  const expenseData = [
    { period: 'Q1 2023', marketing: 120, operations: 200, rd: 80 },
    { period: 'Q2 2023', marketing: 135, operations: 210, rd: 85 },
    { period: 'Q3 2023', marketing: 160, operations: 240, rd: 95 },
    { period: 'Q4 2023', marketing: 190, operations: 280, rd: 110 },
    { period: 'Q1 2024', marketing: 140, operations: 220, rd: 90 },
    { period: 'Q2 2024', marketing: 160, operations: 245, rd: 100 },
    { period: 'Q3 2024', marketing: 185, operations: 280, rd: 115 },
    { period: 'Q4 2024', marketing: 220, operations: 320, rd: 135 },
  ];

  const companyProfile = {
    ceo: 'Mr. Robert Lynch',
    website: 'https://www.deckers.com',
    sector: 'Footwear & Apparel',
    industry: 'Consumer Cyclical',
    employees: 12196,
    beta: 1.05,
  };

  const keyMetrics = {
    marketCap: '$24.14B',
    pe: 28.5,
    eps: '$2.06',
    revenue: '$4.96B',
    freeCashFlow: '$1.044B',
    debt: '$167.32m',
    cash: '$310.87m',
  };

  return (
    <div className="deckers-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Deckers Outdoor Corporation</h1>
          <span className="ticker">DECK | NYSE</span>
        </div>
        <div className="timeframe-buttons">
          <button 
            className={timeframe === 'quarterly' ? 'active' : ''} 
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </button>
          <button 
            className={timeframe === 'ttm' ? 'active' : ''} 
            onClick={() => setTimeframe('ttm')}
          >
            TTM
          </button>
          <button 
            className={timeframe === 'annual' ? 'active' : ''} 
            onClick={() => setTimeframe('annual')}
          >
            Annually
          </button>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="metrics-bar">
        <div className="metric-item">
          <span className="metric-label">Market Cap</span>
          <span className="metric-value">{keyMetrics.marketCap}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">P/E Ratio</span>
          <span className="metric-value">{keyMetrics.pe}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">EPS</span>
          <span className="metric-value">{keyMetrics.eps}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Revenue</span>
          <span className="metric-value">{keyMetrics.revenue}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Free Cash Flow</span>
          <span className="metric-value">{keyMetrics.freeCashFlow}</span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Valuation Section */}
        <div className="dashboard-card valuation-card">
          <h3>Valuation</h3>
          <div className="valuation-metrics">
            <div className="val-item">
              <span>Market Cap</span>
              <strong>$24.14B</strong>
            </div>
            <div className="val-item">
              <span>P/E (TTM/FWD)</span>
              <strong>28.5 | 25.8</strong>
            </div>
            <div className="val-item">
              <span>Price to Sales</span>
              <strong>4.87</strong>
            </div>
            <div className="val-item">
              <span>EV To EBITDA</span>
              <strong>18.6</strong>
            </div>
            <div className="val-item">
              <span>Price to Book</span>
              <strong>15.2</strong>
            </div>
          </div>
        </div>

        {/* Cash Flow Section */}
        <div className="dashboard-card cashflow-card">
          <h3>Cash Flow</h3>
          <div className="cashflow-metrics">
            <div className="cf-item">
              <span>Free Cash Flow Yield</span>
              <strong>4.32%</strong>
            </div>
            <div className="cf-item">
              <span>Operating CF / Revenue</span>
              <strong>21.0%</strong>
            </div>
            <div className="cf-item">
              <span>Capital Intensity</span>
              <strong>1.5%</strong>
            </div>
          </div>
        </div>

        {/* Margins & Growth Section */}
        <div className="dashboard-card margins-card">
          <h3>Margins & Growth</h3>
          <div className="margins-metrics">
            <div className="margin-item">
              <span>Profit Margin</span>
              <strong>4.44%</strong>
            </div>
            <div className="margin-item">
              <span>Operating Margin</span>
              <strong>23.6%</strong>
            </div>
            <div className="margin-item">
              <span>Revenue Growth (YoY)</span>
              <strong>16.1%</strong>
            </div>
            <div className="margin-item">
              <span>EPS Growth (YoY)</span>
              <strong>30.2%</strong>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="dashboard-card full-width">
          <h3>Price</h3>
          <div className="growth-badge">↑ 82.4%</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="price" stroke="#00ff00" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="dashboard-card">
          <h3>Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="revenue" fill="#ff9500" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* EBITDA Chart */}
        <div className="dashboard-card">
          <h3>EBITDA</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ebitdaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="ebitda" fill="#5dade2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Free Cash Flow Chart */}
        <div className="dashboard-card">
          <h3>Free Cash Flow</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fcfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="fcf" fill="#ff9500" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Net Income Chart */}
        <div className="dashboard-card">
          <h3>Net Income</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={netIncomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="income" fill="#ff9500" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* EPS Chart */}
        <div className="dashboard-card">
          <h3>EPS</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={epsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="eps" fill="#ffeb3b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cash & Debt Chart */}
        <div className="dashboard-card">
          <h3>Cash & Debt</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={debtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="cash" fill="#ff9500" />
              <Bar dataKey="debt" fill="#f44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Brand Distribution Pie Chart */}
        <div className="dashboard-card">
          <h3>Brand Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={brandData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {brandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Operating Expenses Chart */}
        <div className="dashboard-card full-width">
          <h3>Operating Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="marketing" stackId="a" fill="#ff9500" name="Marketing" />
              <Bar dataKey="operations" stackId="a" fill="#2196f3" name="Operations" />
              <Bar dataKey="rd" stackId="a" fill="#4caf50" name="R&D" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Company Profile */}
        <div className="dashboard-card profile-card">
          <h3>Company Profile</h3>
          <div className="profile-info">
            <div className="profile-item">
              <span className="label">CEO</span>
              <span className="value">{companyProfile.ceo}</span>
            </div>
            <div className="profile-item">
              <span className="label">Website</span>
              <span className="value">{companyProfile.website}</span>
            </div>
            <div className="profile-item">
              <span className="label">Sector</span>
              <span className="value">{companyProfile.sector}</span>
            </div>
            <div className="profile-item">
              <span className="label">Industry</span>
              <span className="value">{companyProfile.industry}</span>
            </div>
            <div className="profile-item">
              <span className="label">Employees</span>
              <span className="value">{companyProfile.employees.toLocaleString()}</span>
            </div>
            <div className="profile-item">
              <span className="label">Beta</span>
              <span className="value">{companyProfile.beta}</span>
            </div>
          </div>
        </div>

        {/* Analyst Estimates */}
        <div className="dashboard-card analyst-card">
          <h3>Analyst Estimates</h3>
          <div className="analyst-tabs">
            <button className="analyst-tab active">EPS</button>
            <button className="analyst-tab">Revenue</button>
          </div>
          <div className="estimates-grid">
            <div className="estimate-item">
              <span className="est-label">No. of Analysts</span>
              <span className="est-value">18</span>
            </div>
            <div className="estimate-item">
              <span className="est-label">Current Qtr</span>
              <span className="est-value">$0.45</span>
            </div>
            <div className="estimate-item">
              <span className="est-label">Next Year</span>
              <span className="est-value">$1.95</span>
            </div>
          </div>
          <div className="estimate-range">
            <div className="range-item">
              <span>Low Estimate</span>
              <span className="value">$0.35</span>
            </div>
            <div className="range-item">
              <span>Avg. Estimate</span>
              <span className="value">$0.52</span>
            </div>
            <div className="range-item">
              <span>High Estimate</span>
              <span className="value">$0.68</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeckersData;
