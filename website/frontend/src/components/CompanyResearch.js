import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CompanyResearch.css';

function CompanyResearch() {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState('DECK');
  const [docs, setDocs] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/research/companies`);
        setCompanies(res.data || []);
        if (res.data && res.data.length && !company) {
          setCompany(res.data[0].ticker);
        }
      } catch (e) {
        console.error('Failed to load companies', e);
      }
    };
    loadCompanies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadData = async () => {
      if (!company) return;
      setLoading(true);
      try {
        const [docsRes, summaryRes] = await Promise.all([
          axios.get(`${apiUrl}/api/research/docs`, { params: { company } }),
          axios.get(`${apiUrl}/api/research/summary`, { params: { company, years: 10 } })
        ]);
        setDocs(docsRes.data);
        setSummary(summaryRes.data);
      } catch (e) {
        console.error('Failed to load research data', e);
      }
      setLoading(false);
    };
    loadData();
  }, [company]); // eslint-disable-line react-hooks/exhaustive-deps

  const instructions = (
    <div className="note">
      <strong>No processed summaries found.</strong> Place annual reports or summaries under
      <span className="mono"> data/research/{company}/annual_reports</span> to enable analysis.
    </div>
  );

  return (
    <div className="research">
      <div className="research-header">
        <div>
          <h1>Company Research</h1>
          <p>Annual reports summary for Nike, On Running, and Deckers Brands</p>
        </div>
        <div className="controls">
          <label>Company</label>
          <select value={company} onChange={(e) => setCompany(e.target.value)}>
            {companies.map((c) => (
              <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading research...</div>}

      {!loading && summary && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Ticker</div>
              <div className="metric-value">{summary.company}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Years Available</div>
              <div className="metric-value">{summary.yearsAvailable?.length || 0}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Documents</div>
              <div className="metric-value">{summary.documents?.count || 0}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Size</div>
              <div className="metric-value">{(summary.documents?.totalBytes || 0).toLocaleString()} bytes</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>Years Covered</h3>
              {summary.yearsAvailable?.length ? (
                <div className="pill-list">
                  {summary.yearsAvailable.map((y) => (
                    <span className="pill" key={y}>{y}</span>
                  ))}
                </div>
              ) : instructions}
            </div>

            <div className="card">
              <h3>Documents</h3>
              {docs && docs.count ? (
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.docs.map((d) => (
                      <tr key={d.name}>
                        <td>{d.name}</td>
                        <td>{d.ext || '-'}</td>
                        <td>{d.size.toLocaleString()}</td>
                        <td>{new Date(d.mtime).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : instructions}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>Business Overview</h3>
              {summary.sections?.businessOverview?.items?.length ? (
                <ul className="bullet-list">
                  {summary.sections.businessOverview.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              ) : instructions}
            </div>

            <div className="card">
              <h3>Strategy</h3>
              {summary.sections?.strategy?.items?.length ? (
                <ul className="bullet-list">
                  {summary.sections.strategy.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              ) : instructions}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>Financials</h3>
              {summary.sections?.financials?.items?.length ? (
                <ul className="bullet-list">
                  {summary.sections.financials.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              ) : instructions}
            </div>

            <div className="card">
              <h3>Risks</h3>
              {summary.sections?.risks?.items?.length ? (
                <ul className="bullet-list">
                  {summary.sections.risks.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              ) : instructions}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CompanyResearch;
