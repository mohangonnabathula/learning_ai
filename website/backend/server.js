const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Path to Excel file
const excelPath = path.join(__dirname, '../..', 'data/expense_calculator/expense_tracker.xlsx');
const INR_TO_USD = parseFloat(process.env.INR_TO_USD || '89');
const RESEARCH_ROOT = path.join(__dirname, '../..', 'data', 'research');
const investmentsDir = path.join(__dirname, '../..', 'data/investments');

const mutualFundFiles = [
  { path: path.join(investmentsDir, 'Mutual_Funds_mohan.xlsx'), owner: 'Mohan' },
  { path: path.join(investmentsDir, 'Mutual_Funds_swetha.xlsx'), owner: 'Swetha' }
];

const stockFiles = [
  { path: path.join(investmentsDir, 'Stocks_Holdings_Statement_mohan.xlsx'), owner: 'Mohan' },
  { path: path.join(investmentsDir, 'Stocks_Holdings_Statement_swetha.xlsx'), owner: 'Swetha' }
];

const usCsvFiles = [
  { path: path.join(investmentsDir, 'us_mohan.csv'), owner: 'Mohan' },
  { path: path.join(investmentsDir, 'us_swetha.csv'), owner: 'Swetha' },
  { path: path.join(investmentsDir, 'us_emergency.csv'), owner: 'Emergency' }
];

function getCompanyDir(company) {
  if (!company) return null;
  const ticker = String(company).toUpperCase();
  return path.join(RESEARCH_ROOT, ticker);
}

function safeReadDir(p) {
  try {
    return fs.readdirSync(p, { withFileTypes: true });
  } catch (e) {
    return [];
  }
}

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

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  return Number(String(value).replace(/,/g, '')) || 0;
}

function findHeaderRow(rows, headerLabel) {
  return rows.findIndex((row) => row.some((cell) => String(cell || '').trim() === headerLabel));
}

function parseMutualFundFile(filePath, owner) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });

    const headerRowIndex = findHeaderRow(rows, 'Scheme Name');
    if (headerRowIndex === -1) return [];

    const dataRows = rows.slice(headerRowIndex + 1).filter((r) => r[0]);

    return dataRows.map((r) => ({
      owner,
      scheme: r[0],
      amc: r[1],
      category: r[2],
      subCategory: r[3],
      folio: r[4],
      source: r[5],
      units: toNumber(r[6]),
      invested: toNumber(r[7]),
      current: toNumber(r[8]),
      returns: toNumber(r[9]),
      xirr: r[10] || null
    }));
  } catch (err) {
    console.error('Error parsing mutual fund file:', filePath, err.message);
    return [];
  }
}

function parseStockFile(filePath, owner) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });

    const headerRowIndex = findHeaderRow(rows, 'Stock Name');
    if (headerRowIndex === -1) return { positions: [], summary: { invested: 0, current: 0, pl: 0 } };

    const dataRows = rows.slice(headerRowIndex + 1).filter((r) => r[0]);
    const positions = dataRows.map((r) => ({
      owner,
      stock: r[0],
      isin: r[1],
      quantity: toNumber(r[2]),
      avgBuyPrice: toNumber(r[3]),
      buyValue: toNumber(r[4]),
      closingPrice: toNumber(r[5]),
      closingValue: toNumber(r[6]),
      unrealisedPL: toNumber(r[7])
    }));

    const invested = positions.reduce((sum, p) => sum + p.buyValue, 0);
    const current = positions.reduce((sum, p) => sum + p.closingValue, 0);
    const pl = current - invested;

    return { positions, summary: { invested, current, pl } };
  } catch (err) {
    console.error('Error parsing stock file:', filePath, err.message);
    return { positions: [], summary: { invested: 0, current: 0, pl: 0 } };
  }
}

function parseUsCsv(filePath, owner) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l !== '');

    let currentAccount = null;
    const positions = [];

    lines.forEach((line) => {
      const parts = line.split(',');

      if (parts.length === 1 && /^Z\d+/.test(parts[0])) {
        currentAccount = parts[0];
        return;
      }

      if (
        parts[0] === 'Symbol/CUSIP' ||
        parts[0]?.startsWith('Subtotal') ||
        parts[0]?.includes('Symbol/CUSIP') ||
        parts[0] === 'Account Type'
      ) {
        return;
      }

      if (parts.length >= 7 && parts[0] && !parts[0].includes('Subtotal')) {
        const quantity = toNumber(parts[2]);
        const price = toNumber(parts[3]);
        const endingValue = toNumber(parts[5]);
        const costBasis = toNumber(parts[6]);
        if (!quantity && !endingValue && !costBasis) return;
        positions.push({
          owner,
          account: currentAccount,
          symbol: parts[0],
          description: parts[1],
          quantity,
          price,
          endingValue,
          costBasis,
          pl: endingValue - costBasis
        });
      }
    });

    const invested = positions.reduce((sum, p) => sum + p.costBasis, 0);
    const current = positions.reduce((sum, p) => sum + p.endingValue, 0);
    const pl = current - invested;

    return { positions, summary: { invested, current, pl } };
  } catch (err) {
    console.error('Error parsing US CSV file:', filePath, err.message);
    return { positions: [], summary: { invested: 0, current: 0, pl: 0 } };
  }
}

function listCompanyDocs(company) {
  const baseDir = getCompanyDir(company);
  if (!baseDir) return { docs: [], totalSize: 0 };
  const subDirs = ['annual_reports', 'reports', 'filings'];
  const docs = [];
  let totalSize = 0;
  subDirs.forEach((d) => {
    const dir = path.join(baseDir, d);
    const entries = safeReadDir(dir);
    entries.forEach((ent) => {
      if (!ent.isFile()) return;
      const fp = path.join(dir, ent.name);
      const stat = fs.statSync(fp);
      const ext = path.extname(ent.name).toLowerCase();
      docs.push({
        name: ent.name,
        path: fp,
        ext,
        size: stat.size,
        mtime: stat.mtimeMs
      });
      totalSize += stat.size;
    });
  });
  return { docs, totalSize };
}

function loadParsedSummaries(company) {
  const summariesDir = path.join(getCompanyDir(company), 'summaries');
  const parsedSummaries = {};
  if (fs.existsSync(summariesDir)) {
    const summaryFiles = fs.readdirSync(summariesDir).filter((f) => f.endsWith('.json'));
    summaryFiles.forEach((f) => {
      try {
        const content = fs.readFileSync(path.join(summariesDir, f), 'utf8');
        const parsed = JSON.parse(content);
        parsedSummaries[parsed.year] = parsed;
      } catch (e) {
        console.warn(`Failed to read summary ${f}: ${e.message}`);
      }
    });
  }
  return parsedSummaries;
}

function buildResearchSummary(company, years = 10) {
  const { docs, totalSize } = listCompanyDocs(company);
  const yearRegex = /(20\d{2})/g;
  const yearsFound = new Set();
  docs.forEach((d) => {
    const matches = String(d.name).match(yearRegex);
    if (matches) matches.forEach((y) => yearsFound.add(y));
  });
  const yearsAvailable = Array.from(yearsFound).sort();
  const limitedYears = yearsAvailable.slice(-years);

  const parsedSummaries = loadParsedSummaries(company);

  return {
    company: String(company).toUpperCase(),
    yearsRequested: years,
    yearsAvailable: limitedYears,
    parsedSummaries: Object.keys(parsedSummaries).length > 0 ? parsedSummaries : null,
    documents: {
      count: docs.length,
      totalBytes: totalSize,
      byType: docs.reduce((acc, d) => {
        acc[d.ext || ''] = (acc[d.ext || ''] || 0) + 1;
        return acc;
      }, {})
    },
    metrics: {
      placeholder: Object.keys(parsedSummaries).length === 0,
      note: 'Parsed 10-K data with financials, operations, and CEO narratives'
    }
  };
}

function buildPortfolio() {
  const mutualFunds = mutualFundFiles.flatMap((file) => parseMutualFundFile(file.path, file.owner));
  const stocksParse = stockFiles.map((file) => parseStockFile(file.path, file.owner));
  const stocks = stocksParse.flatMap((s) => s.positions);
  const usParse = usCsvFiles.map((file) => parseUsCsv(file.path, file.owner));
  const usPositions = usParse.flatMap((p) => p.positions);

  const mutualByOwner = mutualFunds.reduce((acc, mf) => {
    if (!acc[mf.owner]) acc[mf.owner] = { invested: 0, current: 0, pl: 0 };
    acc[mf.owner].invested += mf.invested;
    acc[mf.owner].current += mf.current;
    acc[mf.owner].pl += mf.current - mf.invested;
    return acc;
  }, {});

  const stockByOwner = stocks.reduce((acc, st) => {
    if (!acc[st.owner]) acc[st.owner] = { invested: 0, current: 0, pl: 0 };
    acc[st.owner].invested += st.buyValue;
    acc[st.owner].current += st.closingValue;
    acc[st.owner].pl += st.closingValue - st.buyValue;
    return acc;
  }, {});

  const mutualSummary = Object.values(mutualByOwner).reduce((acc, v) => ({
    invested: acc.invested + v.invested,
    current: acc.current + v.current,
    pl: acc.pl + v.pl
  }), { invested: 0, current: 0, pl: 0 });

  const stockSummary = Object.values(stockByOwner).reduce((acc, v) => ({
    invested: acc.invested + v.invested,
    current: acc.current + v.current,
    pl: acc.pl + v.pl
  }), { invested: 0, current: 0, pl: 0 });

  const usByOwner = usPositions.reduce((acc, pos) => {
    if (!acc[pos.owner]) acc[pos.owner] = { invested: 0, current: 0, pl: 0 };
    acc[pos.owner].invested += pos.costBasis;
    acc[pos.owner].current += pos.endingValue;
    acc[pos.owner].pl += pos.pl;
    return acc;
  }, {});

  const usSummary = Object.values(usByOwner).reduce((acc, v) => ({
    invested: acc.invested + v.invested,
    current: acc.current + v.current,
    pl: acc.pl + v.pl
  }), { invested: 0, current: 0, pl: 0 });

  const combined = {
    invested: mutualSummary.invested + stockSummary.invested,
    current: mutualSummary.current + stockSummary.current
  };
  combined.pl = combined.current - combined.invested;
  combined.plPct = combined.invested ? (combined.pl / combined.invested) * 100 : 0;

  const mutualUsd = {
    invested: mutualSummary.invested / INR_TO_USD,
    current: mutualSummary.current / INR_TO_USD,
    pl: mutualSummary.pl / INR_TO_USD
  };
  mutualUsd.plPct = mutualUsd.invested ? (mutualUsd.pl / mutualUsd.invested) * 100 : 0;

  const stocksUsd = {
    invested: stockSummary.invested / INR_TO_USD,
    current: stockSummary.current / INR_TO_USD,
    pl: stockSummary.pl / INR_TO_USD
  };
  stocksUsd.plPct = stocksUsd.invested ? (stocksUsd.pl / stocksUsd.invested) * 100 : 0;

  const indiaUsd = {
    invested: mutualUsd.invested + stocksUsd.invested,
    current: mutualUsd.current + stocksUsd.current
  };
  indiaUsd.pl = indiaUsd.current - indiaUsd.invested;
  indiaUsd.plPct = indiaUsd.invested ? (indiaUsd.pl / indiaUsd.invested) * 100 : 0;

  const globalUsd = {
    invested: indiaUsd.invested + usSummary.invested,
    current: indiaUsd.current + usSummary.current
  };
  globalUsd.pl = globalUsd.current - globalUsd.invested;
  globalUsd.plPct = globalUsd.invested ? (globalUsd.pl / globalUsd.invested) * 100 : 0;

  const categoryBreakdown = mutualFunds.reduce((acc, mf) => {
    acc[mf.category] = (acc[mf.category] || 0) + mf.current;
    return acc;
  }, {});

  const subCategoryBreakdown = mutualFunds.reduce((acc, mf) => {
    acc[mf.subCategory] = (acc[mf.subCategory] || 0) + mf.current;
    return acc;
  }, {});

  const assetAllocation = [
    { name: 'Mutual Funds', value: mutualSummary.current },
    { name: 'Stocks', value: stockSummary.current }
  ];

  const ownerAllocation = Array.from(new Set([...Object.keys(mutualByOwner), ...Object.keys(stockByOwner)])).map((owner) => ({
    owner,
    value: (mutualByOwner[owner]?.current || 0) + (stockByOwner[owner]?.current || 0)
  }));

  const ownerAllocationUsd = Array.from(new Set([
    ...Object.keys(mutualByOwner),
    ...Object.keys(stockByOwner),
    ...Object.keys(usByOwner)
  ])).map((owner) => ({
    owner,
    value:
      ((mutualByOwner[owner]?.current || 0) + (stockByOwner[owner]?.current || 0)) / INR_TO_USD +
      (usByOwner[owner]?.current || 0)
  }));

  const byOwner = {};
  const owners = new Set([...Object.keys(mutualByOwner), ...Object.keys(stockByOwner)]);
  owners.forEach((owner) => {
    byOwner[owner] = {
      invested: (mutualByOwner[owner]?.invested || 0) + (stockByOwner[owner]?.invested || 0),
      current: (mutualByOwner[owner]?.current || 0) + (stockByOwner[owner]?.current || 0),
      pl: (mutualByOwner[owner]?.pl || 0) + (stockByOwner[owner]?.pl || 0)
    };
    byOwner[owner].plPct = byOwner[owner].invested ? (byOwner[owner].pl / byOwner[owner].invested) * 100 : 0;
  });

  const topHoldings = [...mutualFunds]
    .sort((a, b) => b.current - a.current)
    .slice(0, 5)
    .map((item) => ({
      name: item.scheme,
      owner: item.owner,
      current: item.current,
      pl: item.current - item.invested,
      plPct: item.invested ? ((item.current - item.invested) / item.invested) * 100 : 0,
      category: item.category
    }));

  const topUsHoldings = [...usPositions]
    .sort((a, b) => b.endingValue - a.endingValue)
    .slice(0, 5)
    .map((item) => ({
      name: item.symbol,
      owner: item.owner,
      current: item.endingValue,
      pl: item.pl,
      plPct: item.costBasis ? (item.pl / item.costBasis) * 100 : 0,
      account: item.account
    }));

  const assetAllocationUsd = [
    { name: 'Mutual Funds (INR→USD)', value: mutualSummary.current / INR_TO_USD },
    { name: 'Stocks (INR→USD)', value: stockSummary.current / INR_TO_USD },
    { name: 'US Holdings', value: usSummary.current }
  ];

  return {
    mutualFunds,
    stocks,
    usPositions,
    summary: {
      fxRateInrUsd: INR_TO_USD,
      mutual: {
        ...mutualSummary,
        plPct: mutualSummary.invested ? (mutualSummary.pl / mutualSummary.invested) * 100 : 0
      },
      stocks: {
        ...stockSummary,
        plPct: stockSummary.invested ? (stockSummary.pl / stockSummary.invested) * 100 : 0
      },
      us: {
        ...usSummary,
        plPct: usSummary.invested ? (usSummary.pl / usSummary.invested) * 100 : 0
      },
      indiaUsd,
      globalUsd,
      combined,
      byOwner,
      byCategory: categoryBreakdown,
      bySubCategory: subCategoryBreakdown,
      assetAllocation,
      ownerAllocation,
      assetAllocationUsd,
      ownerAllocationUsd,
      usByOwner: Object.keys(usByOwner).map((owner) => ({
        owner,
        invested: usByOwner[owner].invested,
        current: usByOwner[owner].current,
        pl: usByOwner[owner].pl,
        plPct: usByOwner[owner].invested ? (usByOwner[owner].pl / usByOwner[owner].invested) * 100 : 0
      }))
    },
    topHoldings,
    topUsHoldings
  };
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

app.get('/api/portfolio', (req, res) => {
  const portfolio = buildPortfolio();
  res.json(portfolio);
});

app.get('/api/research/companies', (req, res) => {
  res.json([
    { ticker: 'DECK', name: 'Deckers Outdoor' },
    { ticker: 'NKE', name: 'Nike' },
    { ticker: 'ONON', name: 'On Holding' }
  ]);
});

app.get('/api/research/docs', (req, res) => {
  const { company } = req.query;
  if (!company) return res.status(400).json({ error: 'Missing company ticker' });
  const { docs, totalSize } = listCompanyDocs(company);
  res.json({
    company: String(company).toUpperCase(),
    count: docs.length,
    totalBytes: totalSize,
    docs: docs.map((d) => ({ name: d.name, ext: d.ext, size: d.size, mtime: d.mtime }))
  });
});

app.get('/api/research/summary', (req, res) => {
  const { company, years } = req.query;
  if (!company) return res.status(400).json({ error: 'Missing company ticker' });
  const yrs = years ? parseInt(years, 10) : 10;
  const summary = buildResearchSummary(company, isNaN(yrs) ? 10 : yrs);
  res.json(summary);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Reading expenses from: ${excelPath}`);
});
