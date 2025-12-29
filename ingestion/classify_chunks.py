#!/usr/bin/env python3
"""
Classify text chunks into:
- NARRATIVE
- OPERATIONS
- FINANCIALS

Uses Ollama via non-interactive `ollama generate`.
"""

from pathlib import Path
from collections import Counter
import subprocess

# ----------------------
# CONFIG
# ----------------------
CHUNKS_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/chunks")
OUTPUT_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/classified")

MODEL = "phi3"             # Fastest model (2.2 GB, most reliable)
MAX_CHARS = 900            # key fix
TIMEOUT = 180              # 3 minutes timeout

VALID_LABELS = {"NARRATIVE", "OPERATIONS", "FINANCIALS"}

# ----------------------
# CLEAN TEXT
# ----------------------
def clean_text(text: str) -> str:
    lines = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("="):
            continue
        if line.isupper() and len(line) < 60:
            continue
        lines.append(line)
    return " ".join(lines)

# ----------------------
# RULE-BASED FAST PATH
# ----------------------
def rule_based_classify(text: str) -> str | None:
    t = text.lower()

    # NARRATIVE - CEO letters, board messages
    if "dear stockholders" in t or "chief executive officer" in t:
        return "NARRATIVE"

    # FINANCIALS - Balance sheets, income statements, cash flows
    if "consolidated statements" in t or "balance sheet" in t or "cash flows" in t:
        return "FINANCIALS"
    if "income statement" in t or "consolidated balance" in t:
        return "FINANCIALS"
    if "earnings per share" in t or "net income" in t:
        return "FINANCIALS"
    if "fair value" in t or "interest rate" in t or "foreign currency" in t:
        return "FINANCIALS"
    if "consolidated statements of comprehensive income" in t:
        return "FINANCIALS"

    # OPERATIONS - Business overview, MD&A, form boilerplate, properties
    if "form 10-k" in t or "item 1. business" in t:
        return "OPERATIONS"
    if "management's discussion and analysis" in t or "md&a" in t:
        return "OPERATIONS"
    if "item 2. properties" in t or "table of contents" in t:
        return "OPERATIONS"
    if "risk factors" in t or "business overview" in t:
        return "OPERATIONS"
    if "item 1a. risk factors" in t or "cybersecurity" in t:
        return "OPERATIONS"

    return None

# ----------------------
# LLM CLASSIFIER
# ----------------------
def classify_chunk(text: str) -> str:
    # Fast path
    rule_label = rule_based_classify(text)
    if rule_label:
        return rule_label

    prompt = f"""
Return ONLY ONE WORD.
No explanation.
No punctuation.

Valid outputs:
NARRATIVE
OPERATIONS
FINANCIALS

Text:
{text}
"""

    try:
        result = subprocess.run(
            ["ollama", "run", MODEL],
            input=prompt,
            text=True,
            capture_output=True,
            timeout=TIMEOUT
        )

        if result.returncode != 0:
            print(f"       [DEBUG] Ollama error: {result.stderr.strip()}")
            return "FAILED"

        response = result.stdout.strip().upper()
        print(f"       [DEBUG] Raw response: '{response}'")

        for label in VALID_LABELS:
            if label in response:
                return label

        return "FAILED"

    except subprocess.TimeoutExpired:
        print(f"       [DEBUG] Timeout after {TIMEOUT}s")
        return "FAILED"
    except FileNotFoundError:
        print("❌ Ollama not found. Install from https://ollama.ai")
        return "FAILED"

# ----------------------
# MAIN
# ----------------------
def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    counts = Counter()
    failed = 0

    chunk_files = sorted(CHUNKS_DIR.glob("*.txt"))
    print(f"📁 Found {len(chunk_files)} chunk(s)\n")

    for idx, chunk_file in enumerate(chunk_files, 1):
        print(f"[{idx}/{len(chunk_files)}] 📖 {chunk_file.name}")

        raw = chunk_file.read_text(encoding="utf-8")
        cleaned = clean_text(raw)

        print(f"     📏 Raw: {len(raw):,} chars | Cleaned: {len(cleaned):,}")

        if len(cleaned) < 300:
            print("     ⚠️  Too short, skipping\n")
            failed += 1
            continue

        text = cleaned[:MAX_CHARS]
        label = classify_chunk(text)

        print(f"     ✓ Result: {label}")

        if label in VALID_LABELS:
            out_dir = OUTPUT_DIR / label.lower()
            out_dir.mkdir(parents=True, exist_ok=True)
            (out_dir / chunk_file.name).write_text(raw, encoding="utf-8")
            counts[label] += 1
            print(f"     💾 Saved to {out_dir.name}/\n")
        else:
            failed += 1
            print("     ❌ Failed\n")

    print("=" * 60)
    print("✨ Classification complete!")
    print(f"  📊 Financials: {counts['FINANCIALS']}")
    print(f"  📊 Operations: {counts['OPERATIONS']}")
    print(f"  📊 Narrative: {counts['NARRATIVE']}")
    print(f"  ⚠️  Failed: {failed}")
    print(f"  📂 Output: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
