import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import './Portfolio.css';

const COLORS = ['#21f37b', '#0fe26b', '#37ff9f', '#1fd58a', '#7ef5c7', '#2cf6c4'];

const formatCurrency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    : '-';

const formatNumber = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '-';

const formatPct = (value) =>
  typeof value === 'number' ? `${value.toFixed(2)}%` : '-';

const formatUsd = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : '-';

function MetricCard({ label, value, helper }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <div className="metric-value">{value}</div>
      {helper && <div className="metric-helper">{helper}</div>}
    </div>
  );
}

function Portfolio({ data }) {
  if (!data) return null;

  const {
    summary,
    mutualFunds,
    stocks,
    usPositions = [],
    topHoldings,
    topUsHoldings = []
  } = data;

  const assetAllocData = summary.assetAllocation.map((item, idx) => ({
    name: item.name,
    value: Number(item.value || 0),
    fill: COLORS[idx % COLORS.length]
  }));

  const ownerAllocData = (summary.ownerAllocation || []).map((item, idx) => ({
    name: item.owner,
    value: Number(item.value || 0),
    fill: COLORS[idx % COLORS.length]
  }));

  const assetAllocUsd = (summary.assetAllocationUsd || []).map((item, idx) => ({
    name: item.name,
    value: Number(item.value || 0),
    fill: COLORS[idx % COLORS.length]
  }));

  const ownerAllocUsd = (summary.ownerAllocationUsd || []).map((item, idx) => ({
    name: item.owner,
    value: Number(item.value || 0),
    fill: COLORS[idx % COLORS.length]
  }));

  const categoryData = Object.entries(summary.byCategory || {}).map(([name, value]) => ({
    name,
    value: Number(value || 0)
  }));

  const ownerPerfData = Object.entries(summary.byOwner || {}).map(([name, info]) => ({
    name,
    invested: Number(info.invested || 0),
    current: Number(info.current || 0)
  }));

  const assetPerfData = [
    {
      name: 'Mutual Funds',
      invested: Number(summary.mutual.invested || 0),
      current: Number(summary.mutual.current || 0)
    },
    {
      name: 'Stocks',
      invested: Number(summary.stocks.invested || 0),
      current: Number(summary.stocks.current || 0)
    }
  ];

  const subCategoryData = Object.entries(summary.bySubCategory || {}).map(([name, value]) => ({
    name,
    value: Number(value || 0)
  }));

  const globalPerfData = [
    {
      name: 'Mutual Funds (INR→USD)',
      invested: Number(summary.indiaUsd?.mutualInvested || summary.mutual.invested / (summary.fxRateInrUsd || 83)),
      current: Number(summary.indiaUsd?.mutualCurrent || summary.mutual.current / (summary.fxRateInrUsd || 83))
    },
    {
      name: 'Stocks (INR→USD)',
      invested: Number(summary.indiaUsd?.stocksInvested || summary.stocks.invested / (summary.fxRateInrUsd || 83)),
      current: Number(summary.indiaUsd?.stocksCurrent || summary.stocks.current / (summary.fxRateInrUsd || 83))
    },
    {
      name: 'US Holdings',
      invested: Number(summary.us.invested || 0),
      current: Number(summary.us.current || 0)
    }
  ];

  const usOwnerData = (summary.usByOwner || []).map((item) => ({
    name: item.owner,
    invested: Number(item.invested || 0),
    current: Number(item.current || 0)
  }));

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <div>
          <h1>Family Portfolio</h1>
          <p>Consolidated view across Mohan and Swetha — mutual funds + stocks</p>
        </div>
        <div className="header-pill">
          1 USD = {summary.fxRateInrUsd?.toFixed(2) || '83.00'} INR
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Total Invested" value={formatCurrency(summary.combined.invested)} />
        <MetricCard label="Current Value" value={formatCurrency(summary.combined.current)} />
        <MetricCard
          label="Unrealised P/L"
          value={formatCurrency(summary.combined.pl)}
          helper={formatPct(summary.combined.plPct)}
        />
        <MetricCard
          label="Mutual Funds"
          value={`${formatCurrency(summary.mutual.current)} (${formatPct(summary.mutual.plPct)})`}
          helper={`Invested ${formatCurrency(summary.mutual.invested)}`}
        />
        <MetricCard
          label="Stocks"
          value={`${formatCurrency(summary.stocks.current)} (${formatPct(summary.stocks.plPct)})`}
          helper={`Invested ${formatCurrency(summary.stocks.invested)}`}
        />
        <MetricCard
          label="US Invested"
          value={formatUsd(summary.us.invested)}
          helper={formatPct(summary.us.plPct)}
        />
        <MetricCard
          label="US Current"
          value={formatUsd(summary.us.current)}
          helper={formatUsd(summary.us.pl)}
        />
        <MetricCard
          label="India Current (USD)"
          value={formatUsd(summary.indiaUsd?.current)}
          helper={formatUsd(summary.indiaUsd?.pl)}
        />
        <MetricCard
          label="Global Current (USD)"
          value={formatUsd(summary.globalUsd?.current)}
          helper={formatUsd(summary.globalUsd?.pl)}
        />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">Asset Allocation</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie dataKey="value" data={assetAllocData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                {assetAllocData.map((entry, index) => (
                  <Cell key={`asset-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Global Allocation (USD)</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie dataKey="value" data={assetAllocUsd} cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                {assetAllocUsd.map((entry, index) => (
                  <Cell key={`asset-usd-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatUsd(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Owner Allocation</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie dataKey="value" data={ownerAllocData} cx="50%" cy="50%" outerRadius={90} label>
                {ownerAllocData.map((entry, index) => (
                  <Cell key={`owner-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Owner Allocation (USD)</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie dataKey="value" data={ownerAllocUsd} cx="50%" cy="50%" outerRadius={90} label>
                {ownerAllocUsd.map((entry, index) => (
                  <Cell key={`owner-usd-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatUsd(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Category Mix (MF)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1_00_000).toFixed(1)}L`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" fill="#21f37b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Sub-Category (MF)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1_00_000).toFixed(1)}L`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" fill="#37ff9f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Performance by Owner</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ownerPerfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1_00_000).toFixed(1)}L`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="invested" fill="#7ef5c7" name="Invested" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" fill="#21f37b" name="Current" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Asset Performance</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={assetPerfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1_00_000).toFixed(1)}L`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="invested" fill="#2cf6c4" name="Invested" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" fill="#0fe26b" name="Current" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">US Performance by Owner</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usOwnerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip formatter={(v) => formatUsd(Number(v))} />
              <Legend />
              <Bar dataKey="invested" fill="#68ffa4" name="Invested" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" fill="#14d982" name="Current" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Global Performance (USD)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={globalPerfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip formatter={(v) => formatUsd(Number(v))} />
              <Legend />
              <Bar dataKey="invested" fill="#9bffbb" name="Invested" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" fill="#1fd58a" name="Current" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tables-grid">
        <div className="card table-card">
          <div className="card-header">Mutual Funds</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Scheme</th>
                  <th>Owner</th>
                  <th>Category</th>
                  <th>Invested</th>
                  <th>Current</th>
                  <th>P/L</th>
                  <th>P/L %</th>
                </tr>
              </thead>
              <tbody>
                {mutualFunds.map((mf, idx) => {
                  const pl = mf.current - mf.invested;
                  const plPct = mf.invested ? (pl / mf.invested) * 100 : 0;
                  return (
                    <tr key={`${mf.scheme}-${idx}`}>
                      <td>{mf.scheme}</td>
                      <td>{mf.owner}</td>
                      <td>{mf.subCategory || mf.category}</td>
                      <td>{formatCurrency(mf.invested)}</td>
                      <td>{formatCurrency(mf.current)}</td>
                      <td className={pl >= 0 ? 'pos' : 'neg'}>{formatCurrency(pl)}</td>
                      <td className={pl >= 0 ? 'pos' : 'neg'}>{formatPct(plPct)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card table-card">
          <div className="card-header">Stocks</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Owner</th>
                  <th>Quantity</th>
                  <th>Avg Buy</th>
                  <th>Buy Value</th>
                  <th>Current</th>
                  <th>P/L</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((st, idx) => {
                  const pl = st.closingValue - st.buyValue;
                  return (
                    <tr key={`${st.stock}-${idx}`}>
                      <td>{st.stock}</td>
                      <td>{st.owner}</td>
                      <td>{formatNumber(st.quantity)}</td>
                      <td>{formatCurrency(st.avgBuyPrice)}</td>
                      <td>{formatCurrency(st.buyValue)}</td>
                      <td>{formatCurrency(st.closingValue)}</td>
                      <td className={pl >= 0 ? 'pos' : 'neg'}>{formatCurrency(pl)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card table-card">
          <div className="card-header">US Holdings</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Owner</th>
                  <th>Account</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Current</th>
                  <th>Cost</th>
                  <th>P/L</th>
                </tr>
              </thead>
              <tbody>
                {usPositions.map((pos, idx) => {
                  const pl = pos.pl;
                  return (
                    <tr key={`${pos.symbol}-${idx}`}>
                      <td>{pos.symbol}</td>
                      <td>{pos.owner}</td>
                      <td>{pos.account}</td>
                      <td>{formatNumber(pos.quantity)}</td>
                      <td>{formatUsd(pos.price)}</td>
                      <td>{formatUsd(pos.endingValue)}</td>
                      <td>{formatUsd(pos.costBasis)}</td>
                      <td className={pl >= 0 ? 'pos' : 'neg'}>{formatUsd(pl)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="cards-row">
        <div className="card top-card">
          <div className="card-header">Top Holdings (by value)</div>
          <div className="top-list">
            {topHoldings.map((item, idx) => (
              <div key={item.name + idx} className="top-item">
                <div>
                  <div className="top-title">{item.name}</div>
                  <div className="top-meta">{item.owner} · {item.category}</div>
                </div>
                <div className="top-values">
                  <span>{formatCurrency(item.current)}</span>
                  <span className={item.pl >= 0 ? 'pos' : 'neg'}>{formatCurrency(item.pl)} ({formatPct(item.plPct)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card top-card">
          <div className="card-header">Top US Holdings</div>
          <div className="top-list">
            {topUsHoldings.map((item, idx) => (
              <div key={item.name + idx} className="top-item">
                <div>
                  <div className="top-title">{item.name}</div>
                  <div className="top-meta">{item.owner} · {item.account}</div>
                </div>
                <div className="top-values">
                  <span>{formatUsd(item.current)}</span>
                  <span className={item.pl >= 0 ? 'pos' : 'neg'}>{formatUsd(item.pl)} ({formatPct(item.plPct)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
