#!/usr/bin/env python3
"""
Extract ONLY financials sections from text files using LLaMA 3 via Ollama.

This script processes text files and extracts only the financials sections:
- Financials: Financial statements, balance sheets, income statements, cash flow, 
  revenue numbers, profit/loss, accounting data, financial ratios, earnings per share
"""

import subprocess
import re
import time
from pathlib import Path
from collections import Counter
from typing import Optional, List, Tuple

# ----------------------
# CONFIGURATION
# ----------------------
RAW_TXT_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/extracted_text/Deckers/annual_reports/raw_txt")
FINANCIALS_OUTPUT_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/extracted_text/Deckers/annual_reports/financials")
OLLAMA_MODEL = "llama3"  # Using LLaMA 3 as requested (try "llama3.2" or "phi3" for faster responses)
CHUNK_SIZE = 200  # Characters per chunk for classification
TIMEOUT_SECONDS = 30  # Timeout per attempt (reduced, with retries)
MAX_RETRIES = 3  # Number of retry attempts for failed classifications


# ----------------------
# FUNCTION: Check if Ollama is available
# ----------------------
def check_ollama_available() -> bool:
    """Check if Ollama is installed and the server is running."""
    try:
        # Check if ollama command exists
        result = subprocess.run(
            ["ollama", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode != 0:
            return False
        
        # Try to list models to check if server is running
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        return False


# ----------------------
# FUNCTION: Normalize classification label
# ----------------------
def normalize_label(label: str) -> Optional[str]:
    """Normalize the label from Ollama response to one of the valid labels."""
    label = label.strip().lower()
    
    # Remove common prefixes/suffixes
    label = re.sub(r'^(category|classification|label|result|answer):\s*', '', label)
    label = re.sub(r'[^\w\s]', '', label)  # Remove punctuation
    
    # Map variations to valid labels
    label_mapping = {
        "narrative": "narrative",
        "financials": "financials",
        "financial": "financials",
        "finance": "financials",
        "operations": "operations",
        "operational": "operations",
        "operation": "operations",
    }
    
    # Check for exact match or partial match
    for key, value in label_mapping.items():
        if key in label:
            return value
    
    # If no match found, return None
    return None


# ----------------------
# FUNCTION: Classify text chunk using Ollama (with retry logic)
# ----------------------
def classify_text(text_chunk: str) -> Optional[str]:
    """
    Classify a text chunk using LLaMA 3 via Ollama with retry logic.
    
    Returns one of: 'narrative', 'financials', 'operations', or None if classification fails.
    """
    # Truncate to chunk size if needed
    text_sample = text_chunk[:CHUNK_SIZE]
    
    prompt = f"""Classify the following text excerpt from a company annual or quarterly report.

You must respond with EXACTLY ONE word from this list: narrative, financials, or operations.

Categories:
- narrative: Executive letters, company overview, strategic vision, management discussions, brand stories, qualitative descriptions
- financials: Financial statements, balance sheets, income statements, cash flow, revenue numbers, profit/loss, accounting data, financial ratios, earnings per share
- operations: Business operations, supply chain, manufacturing, distribution, logistics, production, operational procedures

Text excerpt:
{text_sample}

Your response (one word only):"""

    # Retry logic
    for attempt in range(MAX_RETRIES):
        try:
            result = subprocess.run(
                ["ollama", "run", OLLAMA_MODEL],
                input=prompt,
                text=True,
                capture_output=True,
                timeout=TIMEOUT_SECONDS
            )
            
            if result.returncode != 0:
                error_msg = result.stderr.decode('utf-8') if isinstance(result.stderr, bytes) else str(result.stderr)
                if attempt < MAX_RETRIES - 1:
                    print(f"    ⚠️  Ollama error (attempt {attempt + 1}/{MAX_RETRIES}), retrying...")
                    time.sleep(1)  # Brief pause before retry
                    continue
                else:
                    print(f"    ⚠️  Ollama error after {MAX_RETRIES} attempts: {error_msg}")
                    return None
            
            response = result.stdout.strip()
            normalized = normalize_label(response)
            
            if normalized:
                return normalized
            else:
                if attempt < MAX_RETRIES - 1:
                    print(f"    ⚠️  Unexpected response (attempt {attempt + 1}/{MAX_RETRIES}), retrying...")
                    time.sleep(1)
                    continue
                else:
                    print(f"    ⚠️  Unexpected response after {MAX_RETRIES} attempts: '{response}'")
                    return None
                
        except subprocess.TimeoutExpired:
            if attempt < MAX_RETRIES - 1:
                print(f"    ⚠️  Timeout (attempt {attempt + 1}/{MAX_RETRIES}), retrying...")
                time.sleep(2)  # Longer pause after timeout
                continue
            else:
                print(f"    ⚠️  Classification timeout after {MAX_RETRIES} attempts")
                return None
        except FileNotFoundError:
            print(f"    ❌ Ollama not found. Please install Ollama from https://ollama.ai")
            return None
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                print(f"    ⚠️  Error (attempt {attempt + 1}/{MAX_RETRIES}): {e}, retrying...")
                time.sleep(1)
                continue
            else:
                print(f"    ⚠️  Error classifying chunk after {MAX_RETRIES} attempts: {e}")
                return None
    
    return None


# ----------------------
# FUNCTION: Split text into chunks
# ----------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """
    Split text into chunks of approximately chunk_size characters.
    Tries to break at sentence boundaries when possible.
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        if end >= len(text):
            chunks.append(text[start:])
            break
        
        # Try to break at sentence boundary
        last_period = text.rfind('.', start, end)
        last_newline = text.rfind('\n', start, end)
        
        # Prefer newline, then period
        if last_newline > start:
            end = last_newline + 1
        elif last_period > start:
            end = last_period + 1
        
        chunks.append(text[start:end])
        start = end
    
    return chunks


# ----------------------
# FUNCTION: Extract only financials from document
# ----------------------
def extract_financials(text: str) -> Tuple[str, dict]:
    """
    Extract only financials sections from a document by classifying chunks.
    
    Returns: (financials_text, statistics_dict)
    """
    chunks = chunk_text(text)
    print(f"  📄 Split into {len(chunks)} chunk(s)")
    
    financials_chunks = []
    labels = []
    
    for i, chunk in enumerate(chunks, 1):
        print(f"  🔍 Classifying chunk {i}/{len(chunks)}...", end=" ", flush=True)
        label = classify_text(chunk)
        if label:
            labels.append(label)
            if label == "financials":
                financials_chunks.append(chunk)
                print(f"✓ {label} (saved)")
            else:
                print(f"✓ {label} (skipped)")
        else:
            print("✗ failed")
    
    # Combine all financials chunks
    financials_text = "\n\n".join(financials_chunks) if financials_chunks else ""
    
    label_counts = Counter(labels)
    stats = {
        "total_chunks": len(chunks),
        "successful": len(labels),
        "failed": len(chunks) - len(labels),
        "financials_chunks": len(financials_chunks),
        "label_distribution": dict(label_counts)
    }
    
    return financials_text, stats


# ----------------------
# MAIN PROCESSING
# ----------------------
def main():
    """Main function to extract only financials from text files."""
    # Check if Ollama is available
    print("🔍 Checking Ollama availability...")
    ollama_available = check_ollama_available()
    
    if not ollama_available:
        print("❌ Ollama is not available or the server is not running.")
        print("\nTo fix this:")
        print("1. Install Ollama from https://ollama.ai")
        print("2. Start the Ollama server:")
        print("   - On macOS: The Ollama app should start automatically")
        print("   - Or run: ollama serve")
        print("3. Pull the required model:")
        print(f"   - ollama pull {OLLAMA_MODEL}")
        print("\n⚠️  Cannot proceed without Ollama.\n")
        return
    else:
        print(f"✅ Ollama is available (using model: {OLLAMA_MODEL})\n")
    
    # Create output directory
    FINANCIALS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if input directory exists
    if not RAW_TXT_DIR.exists():
        print(f"❌ Input directory does not exist: {RAW_TXT_DIR}")
        return
    
    # Find all text files
    txt_files = list(RAW_TXT_DIR.glob("*.txt"))
    
    if not txt_files:
        print(f"❌ No text files found in {RAW_TXT_DIR}")
        return
    
    print(f"📁 Found {len(txt_files)} text file(s) to process")
    print(f"📂 Input directory: {RAW_TXT_DIR}")
    print(f"📂 Output directory: {FINANCIALS_OUTPUT_DIR}")
    print(f"🎯 Extracting ONLY financials sections")
    print(f"🤖 Using model: {OLLAMA_MODEL}")
    print(f"⏱️  Timeout: {TIMEOUT_SECONDS}s per attempt, {MAX_RETRIES} retries")
    print(f"💡 Tip: Use 'llama3.2' or 'phi3' for faster responses\n")
    
    # Process each file
    processed = 0
    failed = 0
    
    for txt_file in txt_files:
        try:
            print(f"📝 Processing: {txt_file.name}")
            print(f"  📊 File size: {txt_file.stat().st_size:,} bytes")
            
            # Read file
            try:
                text = txt_file.read_text(encoding="utf-8")
            except Exception as e:
                print(f"  ❌ Error reading file: {e}\n")
                failed += 1
                continue
            
            # Check if empty
            if not text.strip():
                print(f"  ⚠️  File is empty, skipping.\n")
                continue
            
            print(f"  📏 Text length: {len(text):,} characters")
            
            # Extract only financials
            financials_text, stats = extract_financials(text)
            
            # Check if any financials were found
            if not financials_text.strip():
                print(f"  ⚠️  No financials sections found in this document.\n")
                processed += 1
                continue
            
            # Save financials to output directory
            output_file = FINANCIALS_OUTPUT_DIR / txt_file.name
            try:
                output_file.write_text(financials_text, encoding="utf-8")
            except Exception as e:
                print(f"  ❌ Error saving file: {e}\n")
                failed += 1
                continue
            
            print(f"  ✅ Extracted {stats['financials_chunks']} financials chunk(s)")
            print(f"  📊 Stats: {stats['successful']}/{stats['total_chunks']} chunks classified successfully")
            print(f"  📏 Financials text length: {len(financials_text):,} characters")
            if stats['label_distribution']:
                dist_str = ", ".join(f"{k}: {v}" for k, v in stats['label_distribution'].items())
                print(f"  📈 Distribution: {dist_str}")
            print(f"  💾 Saved to: {output_file}\n")
            
            processed += 1
            
        except Exception as e:
            print(f"  ❌ Error processing {txt_file.name}: {e}\n")
            failed += 1
            continue
    
    # Summary
    print("=" * 60)
    print(f"✨ Financials extraction complete!")
    print(f"  ✅ Successfully processed: {processed} file(s)")
    if failed > 0:
        print(f"  ❌ Failed: {failed} file(s)")


if __name__ == "__main__":
    main()
