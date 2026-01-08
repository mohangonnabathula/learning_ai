#!/usr/bin/env node

/**
 * Parse 10-K HTML filings and extract:
 * - Financials (revenue, net income, total assets, etc. from tables)
 * - Operations (business segments, key metrics)
 * - Narratives (Item 1: Business, Item 7: MD&A, Risk Factors, CEO letter)
 *
 * Usage:
 *   node scripts/parse_10k_html.js DECK,NKE
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..', '..', 'data', 'research');

// Simple HTML tag stripper
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract text content between item markers
function extractItemText(html, itemNum) {
  const patterns = [
    new RegExp(`Item\\s+${itemNum}[^A-Za-z]([\\s\\S]*?)(?=Item\\s+\\d|$)`, 'i'),
    new RegExp(`<a[^>]*name=.*?item${itemNum}[^>]*>([\\s\\S]*?)(?=<a[^>]*name=.*?item\\d|$)`, 'i')
  ];
  for (const pat of patterns) {
    const match = html.match(pat);
    if (match) return stripHtml(match[1]).slice(0, 5000); // limit to 5000 chars
  }
  return '';
}

// Extract revenue, net income, total assets from simple regex patterns
function extractFinancialMetrics(html) {
  const metrics = {};
  const patterns = {
    revenue: /(?:total\s+)?revenues?[^0-9]*([0-9,]+)/i,
    netIncome: /net\s+(?:income|loss)[^0-9]*([0-9,]+)/i,
    totalAssets: /total\s+assets[^0-9]*([0-9,]+)/i,
    currentAssets: /current\s+assets[^0-9]*([0-9,]+)/i,
    currentLiabilities: /current\s+liabilities[^0-9]*([0-9,]+)/i,
    stockholders: /stockholders'?\s+equity[^0-9]*([0-9,]+)/i,
    operatingIncome: /operating\s+income[^0-9]*([0-9,]+)/i,
    earningsPerShare: /earnings\s+per\s+share[^0-9]*([0-9.]+)/i
  };
  Object.entries(patterns).forEach(([key, regex]) => {
    const match = html.match(regex);
    if (match) metrics[key] = match[1];
  });
  return metrics;
}

// Extract CEO letter / Letter to Shareholders
function extractCeoLetter(html) {
  const patterns = [
    /(?:letter|message)\s+to\s+(?:shareholders|stockholders)[^]*?(?=<|$)/i,
    /from\s+(?:the\s+)?(?:ceo|chief\s+executive)[^]*?(?=<|$)/i
  ];
  for (const pat of patterns) {
    const match = html.match(pat);
    if (match) return stripHtml(match[0]).slice(0, 3000);
  }
  return '';
}

function parseHtmlFile(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    const yearMatch = filename.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : 'unknown';

    const summary = {
      filename,
      year,
      extractedAt: new Date().toISOString(),
      sections: {
        business: extractItemText(html, 1).slice(0, 2000),
        riskFactors: extractItemText(html, '1A').slice(0, 2000),
        mdAndA: extractItemText(html, 7).slice(0, 2000),
        financialStatements: extractItemText(html, 8).slice(0, 2000)
      },
      financials: extractFinancialMetrics(html),
      ceoLetter: extractCeoLetter(html).slice(0, 1500),
      keyInsights: [
        "Business operations outlined in Item 1.",
        "Key risks identified in Item 1A.",
        "Financial performance discussed in Item 7.",
        "Detailed financial statements in Item 8."
      ]
    };

    return summary;
  } catch (err) {
    console.error(`Error parsing ${filePath}: ${err.message}`);
    return null;
  }
}

async function parseCompanyReports(company) {
  const ticker = String(company).toUpperCase();
  const reportsDir = path.join(ROOT, ticker, 'annual_reports');
  const summariesDir = path.join(ROOT, ticker, 'summaries');

  if (!fs.existsSync(reportsDir)) {
    console.log(`[${ticker}] No reports directory found at ${reportsDir}`);
    return 0;
  }

  const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.htm') || f.endsWith('.html'));
  if (!files.length) {
    console.log(`[${ticker}] No HTML files found in ${reportsDir}`);
    return 0;
  }

  fs.mkdirSync(summariesDir, { recursive: true });

  let parsed = 0;
  for (const file of files) {
    const filePath = path.join(reportsDir, file);
    const summary = parseHtmlFile(filePath);
    if (!summary) continue;

    const outFile = path.join(summariesDir, `${summary.year}_summary.json`);
    fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
    console.log(`[${ticker}] Parsed ${file} → ${summary.year}_summary.json`);
    parsed++;
  }

  console.log(`[${ticker}] Done. Parsed ${parsed}/${files.length} files. Saved to ${summariesDir}`);
  return parsed;
}

async function main() {
  const [companiesArg] = process.argv.slice(2);
  if (!companiesArg) {
    console.error('Usage: node scripts/parse_10k_html.js TICKER1,TICKER2');
    process.exit(1);
  }
  const tickers = companiesArg.split(',').map(s => s.trim()).filter(Boolean);

  for (const t of tickers) {
    try {
      await parseCompanyReports(t);
    } catch (e) {
      console.error(`[${t}] Error: ${e.message}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
