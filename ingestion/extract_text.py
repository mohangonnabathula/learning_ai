#!/usr/bin/env python3
"""
Extract text from annual report PDFs and organize into categories:
- raw_txt: Raw extracted text (backup/reference)
- narrative: CEO story, strategy, qualitative insights
- financials: Ratios, DCF, historical performance analytics
- operations: Products, markets, competitors, business categorization
"""

from pathlib import Path
import pdfplumber
import subprocess
import re
import time
from collections import Counter
from typing import Optional, List, Tuple

# ----------------------
# CONFIGURATION
# ----------------------
RAW_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/raw/deckers/quarterly_reports/q1_2025")
BASE_OUTPUT_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/extracted_text/Deckers/annual_reports")

# Output directories
RAW_TXT_DIR = BASE_OUTPUT_DIR / "raw_txt"
NARRATIVE_DIR = BASE_OUTPUT_DIR / "narrative"
FINANCIALS_DIR = BASE_OUTPUT_DIR / "financials"
OPERATIONS_DIR = BASE_OUTPUT_DIR / "operations"

OUTPUT_DIRS = {
    "narrative": NARRATIVE_DIR,
    "financials": FINANCIALS_DIR,
    "operations": OPERATIONS_DIR
}

OLLAMA_MODEL = "phi3"  # Try "llama3.2" or "phi3" for faster responses
CHUNK_SIZE = 10000       # Bigger chunks
TIMEOUT_SECONDS = 120     # Give LLM more time
MAX_RETRIES = 2           # Fewer retries for speed
VALID_LABELS = ["narrative", "financials", "operations"]


# ----------------------
# FUNCTION: Check if Ollama is available
# ----------------------
def check_ollama_available() -> bool:
    """Check if Ollama is installed and the server is running."""
    try:
        # Check if ollama command exists+-
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
# FUNCTION: Extract text from PDF
# ----------------------
def extract_text(pdf_path: Path) -> str:
    """Extract all text from a PDF file."""
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


# ----------------------
# FUNCTION: Normalize classification label
# ----------------------
def normalize_label(label: str) -> Optional[str]:
    """Normalize the label from Ollama response to one of the valid labels."""
    label = label.strip().lower()
    
    # Remove common prefixes/suffixes
    label = re.sub(r'^(category|classification|label|result|answer):\s*', '', label)
    label = re.sub(r'[^\w\s]', '', label)
    
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
    
    for key, value in label_mapping.items():
        if key in label:
            return value
    
    return None


# ----------------------
# FUNCTION: Classify text chunk using Ollama (with retry logic)
# ----------------------
def classify_text(text_chunk: str) -> Optional[str]:
    """
    Classify a text chunk using LLaMA 3 via Ollama with retry logic.
    
    Returns one of: 'narrative', 'financials', 'operations', or None if classification fails.
    """
    text_sample = text_chunk[:CHUNK_SIZE]
    
    prompt = f"""Classify the following text excerpt from a company annual report.

You must respond with EXACTLY ONE word from this list: narrative, financials, or operations.

Categories:
- narrative: CEO story, strategy, qualitative insights, executive letters, company overview, strategic vision, management discussions, brand stories
- financials: Financial statements, balance sheets, income statements, cash flow, revenue numbers, profit/loss, accounting data, financial ratios, DCF, historical performance analytics, earnings per share
- operations: Products, markets, competitors, business categorization, supply chain, manufacturing, distribution, logistics, production, operational procedures

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
                    if "server not responding" in error_msg.lower() or "could not find ollama" in error_msg.lower():
                        print(f"    ⚠️  Ollama server not running. Please start Ollama: ollama serve")
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
            error_str = str(e)
            if attempt < MAX_RETRIES - 1:
                print(f"    ⚠️  Error (attempt {attempt + 1}/{MAX_RETRIES}): {e}, retrying...")
                time.sleep(1)
                continue
            else:
                if "server not responding" in error_str.lower() or "could not find ollama" in error_str.lower():
                    print(f"    ⚠️  Ollama server not running. Please start Ollama: ollama serve")
                else:
                    print(f"    ⚠️  Error classifying chunk after {MAX_RETRIES} attempts: {e}")
                return None
    
    return None


# ----------------------
# FUNCTION: Split text into chunks
# ----------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """Split text into chunks of approximately chunk_size characters, breaking at sentence boundaries."""
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
# FUNCTION: Process and classify document chunks
# ----------------------
def process_document(text: str, pdf_name: str) -> dict:
    """
    Chunk the text and classify each chunk, saving to appropriate folders.
    Returns statistics about the processing.
    """
    chunks = chunk_text(text)
    print(f"  📄 Split into {len(chunks)} chunk(s)")
    
    stats = {
        "total_chunks": len(chunks),
        "narrative": 0,
        "financials": 0,
        "operations": 0,
        "failed": 0
    }
    
    # Create output directories
    for label, output_dir in OUTPUT_DIRS.items():
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process each chunk
    for i, chunk in enumerate(chunks, 1):
        print(f"  🔍 Classifying chunk {i}/{len(chunks)}...", end=" ", flush=True)
        label = classify_text(chunk)
        
        if label and label in VALID_LABELS:
            # Save chunk to appropriate folder
            chunk_filename = f"{pdf_name}_chunk_{i:04d}.txt"
            output_file = OUTPUT_DIRS[label] / chunk_filename
            output_file.write_text(chunk, encoding="utf-8")
            stats[label] += 1
            print(f"✓ {label}")
        else:
            stats["failed"] += 1
            print("✗ failed")
    
    return stats


# ----------------------
# MAIN PROCESSING
# ----------------------
def main():
    """Main function to extract PDFs and organize text."""
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
        print("\n⚠️  Will extract text only (no classification) without Ollama.\n")
    else:
        print(f"✅ Ollama is available (using model: {OLLAMA_MODEL})\n")
    
    # Create output directories
    RAW_TXT_DIR.mkdir(parents=True, exist_ok=True)
    for label, output_dir in OUTPUT_DIRS.items():
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # Find PDF files
    pdf_files = list(RAW_DIR.glob("*.pdf"))
    
    if not pdf_files:
        print(f"❌ No PDF files found in {RAW_DIR}")
        return
    
    print(f"📁 Found {len(pdf_files)} PDF file(s) to process")
    print(f"📂 Input directory: {RAW_DIR}")
    print(f"📂 Output directories:")
    print(f"   - raw_txt: {RAW_TXT_DIR}")
    if ollama_available:
        print(f"   - narrative: {NARRATIVE_DIR}")
        print(f"   - financials: {FINANCIALS_DIR}")
        print(f"   - operations: {OPERATIONS_DIR}")
        print(f"🤖 Using model: {OLLAMA_MODEL}")
        print(f"⏱️  Timeout: {TIMEOUT_SECONDS}s per attempt, {MAX_RETRIES} retries")
        print(f"💡 Tip: Use 'llama3.2' or 'phi3' for faster responses")
    print()
    
    # Process each PDF
    processed = 0
    failed = 0
    
    for pdf_file in pdf_files:
        try:
            print(f"📝 Processing: {pdf_file.name}")
            
            # Extract text from PDF
            print("  📄 Extracting text from PDF...")
            text = extract_text(pdf_file)
            
            if not text.strip():
                print(f"  ⚠️  No text extracted, skipping.\n")
                continue
            
            print(f"  📏 Extracted {len(text):,} characters")
            
            # Save raw text
            raw_txt_file = RAW_TXT_DIR / (pdf_file.stem + ".txt")
            raw_txt_file.write_text(text, encoding="utf-8")
            print(f"  💾 Saved raw text to: {raw_txt_file}")
            
            # Process and classify chunks (only if Ollama is available)
            if ollama_available:
                stats = process_document(text, pdf_file.stem)
                
                print(f"  ✅ Processing complete:")
                print(f"     - Total chunks: {stats['total_chunks']}")
                print(f"     - Narrative: {stats['narrative']}")
                print(f"     - Financials: {stats['financials']}")
                print(f"     - Operations: {stats['operations']}")
                if stats['failed'] > 0:
                    print(f"     - Failed: {stats['failed']}")
            else:
                print(f"  ✅ Text extracted (classification skipped - Ollama not available)")
            print()
            
            processed += 1
            
        except Exception as e:
            print(f"  ❌ Error processing {pdf_file.name}: {e}\n")
            failed += 1
            continue
    
    # Summary
    print("=" * 60)
    print(f"✨ Extraction and classification complete!")
    print(f"  ✅ Successfully processed: {processed} file(s)")
    if failed > 0:
        print(f"  ❌ Failed: {failed} file(s)")


if __name__ == "__main__":
    main()
