#!/usr/bin/env python3
"""
Quickly categorize all chunks based on rules.
"""

from pathlib import Path
from collections import Counter

CHUNKS_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/chunks")

def rule_based_classify(text: str) -> str:
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

    # Default to OPERATIONS if nothing matches
    return "OPERATIONS"


def main():
    chunks = sorted(CHUNKS_DIR.glob("*.txt"))
    print(f"Categorizing {len(chunks)} chunks...\n")
    
    categories = Counter()
    results = {}
    
    for chunk_file in chunks:
        text = chunk_file.read_text(encoding="utf-8")
        category = rule_based_classify(text)
        categories[category] += 1
        results[chunk_file.name] = category
    
    # Print summary
    print("=" * 60)
    print("CATEGORIZATION SUMMARY")
    print("=" * 60)
    print(f"📊 NARRATIVE:   {categories['NARRATIVE']:3d}")
    print(f"📊 OPERATIONS:  {categories['OPERATIONS']:3d}")
    print(f"📊 FINANCIALS:  {categories['FINANCIALS']:3d}")
    print(f"📊 TOTAL:       {len(chunks):3d}")
    print()
    
    # Print detailed list
    print("=" * 60)
    print("DETAILED BREAKDOWN")
    print("=" * 60)
    
    for category in ["NARRATIVE", "OPERATIONS", "FINANCIALS"]:
        matching = [name for name, cat in results.items() if cat == category]
        print(f"\n{category} ({len(matching)} files):")
        for name in matching[:10]:  # Show first 10
            chunk_num = name.split("_")[-1].replace(".txt", "")
            print(f"  - {name}")
        if len(matching) > 10:
            print(f"  ... and {len(matching) - 10} more")


if __name__ == "__main__":
    main()
