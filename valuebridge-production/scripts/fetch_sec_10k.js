#!/usr/bin/env node

/**
 * Fetch last N 10-K filings from SEC EDGAR for given tickers
 * Saves primary documents (HTML/PDF) into data/research/<TICKER>/annual_reports
 *
 * Usage:
 *   node scripts/fetch_sec_10k.js DECK,NKE,ONON 10
 *
 * Notes:
 * - Set env SEC_USER_AGENT for compliant requests, e.g.
 *   SEC_USER_AGENT="ValueBridge Research (contact: you@example.com)"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const UA = process.env.SEC_USER_AGENT || 'ValueBridge Research (contact: you@example.com)';
const ROOT = path.join(__dirname, '..', '..', 'data', 'research');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return resolve(httpGetJson(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
  });
}

function httpDownload(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/pdf,*/*'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlinkSync(destPath);
        return resolve(httpDownload(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        file.close(); fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });
    req.on('error', (err) => { try { file.close(); fs.unlinkSync(destPath); } catch {} reject(err); });
  });
}

async function getTickerMap() {
  const url = 'https://www.sec.gov/files/company_tickers.json';
  const json = await httpGetJson(url);
  // company_tickers.json is an object with numeric keys: {"0": {cik_str, ticker, title}, ...}
  const map = {};
  Object.values(json).forEach((row) => {
    if (!row.ticker || !row.cik_str) return;
    const cik10 = String(row.cik_str).padStart(10, '0');
    map[row.ticker.toUpperCase()] = cik10;
  });
  return map;
}

async function getSubmissions(cik10) {
  const url = `https://data.sec.gov/submissions/CIK${cik10}.json`;
  return await httpGetJson(url);
}

function normalizeAccession(a) { return String(a).replace(/-/g, ''); }

function buildPrimaryUrl(cikInt, accessionNo, primaryDoc) {
  const cikNoZeros = String(cikInt).replace(/^0+/, '');
  const accNoNoDash = normalizeAccession(accessionNo);
  return `https://www.sec.gov/Archives/edgar/data/${cikNoZeros}/${accNoNoDash}/${primaryDoc}`;
}

async function download10KsForTicker(ticker, maxCount) {
  const tickerUpper = ticker.toUpperCase();
  const map = await getTickerMap();
  if (!map[tickerUpper]) throw new Error(`Ticker not found in SEC list: ${tickerUpper}`);
  const cik10 = map[tickerUpper];

  console.log(`[${tickerUpper}] CIK ${cik10}`);
  const subs = await getSubmissions(cik10);

  // Collect 10-Ks from recent
  const recent = subs.filings?.recent || {};
  const items = [];
  const len = (recent.form || []).length;
  for (let i = 0; i < len; i++) {
    if (recent.form[i] !== '10-K') continue;
    items.push({
      accessionNumber: recent.accessionNumber[i],
      filingDate: recent.filingDate?.[i],
      reportDate: recent.reportDate?.[i],
      primaryDocument: recent.primaryDocument?.[i]
    });
  }

  // Older filings via index files
  const files = subs.filings?.files || [];
  for (const f of files) {
    try {
      const idxUrl = `https://data.sec.gov/submissions/${f.name}`;
      const idx = await httpGetJson(idxUrl);
      const len2 = (idx.form || []).length;
      for (let i = 0; i < len2; i++) {
        if (idx.form[i] !== '10-K') continue;
        items.push({
          accessionNumber: idx.accessionNumber[i],
          filingDate: idx.filingDate?.[i],
          reportDate: idx.reportDate?.[i],
          primaryDocument: idx.primaryDocument?.[i]
        });
      }
      // Be polite
      await sleep(150);
    } catch (e) {
      console.warn(`[${tickerUpper}] Failed reading older index ${f.name}: ${e.message}`);
    }
  }

  // Sort newest first by filingDate
  items.sort((a, b) => String(b.filingDate || '').localeCompare(String(a.filingDate || '')));
  const selected = items.slice(0, maxCount);

  const outDir = path.join(ROOT, tickerUpper, 'annual_reports');
  ensureDir(outDir);

  let downloaded = 0;
  for (const it of selected) {
    const year = (it.reportDate || it.filingDate || '').slice(0, 4) || 'unknown';
    const baseName = `${year}_${normalizeAccession(it.accessionNumber)}_${it.primaryDocument || 'primary.html'}`;
    const dest = path.join(outDir, baseName);
    if (fs.existsSync(dest)) {
      console.log(`[${tickerUpper}] Exists, skipping: ${baseName}`);
      continue;
    }
    const url = buildPrimaryUrl(cik10, it.accessionNumber, it.primaryDocument);
    console.log(`[${tickerUpper}] Downloading ${url}`);
    try {
      await httpDownload(url, dest);
      downloaded++;
    } catch (e) {
      console.warn(`[${tickerUpper}] Failed download ${url}: ${e.message}`);
    }
    await sleep(300); // polite delay
  }

  console.log(`[${tickerUpper}] Done. Downloaded ${downloaded}/${selected.length}. Saved to ${outDir}`);
}

async function main() {
  const [tickersArg, countArg] = process.argv.slice(2);
  if (!tickersArg) {
    console.error('Usage: node scripts/fetch_sec_10k.js TICKER1,TICKER2 [COUNT]');
    process.exit(1);
  }
  const count = parseInt(countArg || '10', 10);
  const tickers = tickersArg.split(',').map(s => s.trim()).filter(Boolean);

  for (const t of tickers) {
    try {
      await download10KsForTicker(t, count);
    } catch (e) {
      console.error(`[${t}] Error: ${e.message}`);
    }
    await sleep(500);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
