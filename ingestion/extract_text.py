#!/usr/bin/env python3
"""
Extract text from PDF files and save as .txt files.
"""

from pathlib import Path
import pdfplumber

# ----------------------
# CONFIGURATION
# ----------------------
INPUT_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/raw/deckers/annual_reports/2025")
OUTPUT_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/extracted_text")


# ----------------------
# FUNCTION: Extract text from PDF
# ----------------------
def extract_text(pdf_path: Path) -> str:
    """Extract all text from a PDF file."""
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


# ----------------------
# MAIN PROCESSING
# ----------------------
def main():
    """Main function to extract PDFs and save as text files."""
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Find PDF files
    pdf_files = list(INPUT_DIR.glob("*.pdf"))
    
    if not pdf_files:
        print(f"❌ No PDF files found in {INPUT_DIR}")
        return
    
    print(f"📁 Found {len(pdf_files)} PDF file(s)")
    print(f"📂 Input: {INPUT_DIR}")
    print(f"📂 Output: {OUTPUT_DIR}\n")
    
    # Process each PDF
    processed = 0
    failed = 0
    
    for pdf_file in pdf_files:
        try:
            print(f"📝 Processing: {pdf_file.name}")
            
            # Extract text from PDF
            text = extract_text(pdf_file)
            
            if not text.strip():
                print(f"  ⚠️  No text extracted, skipping.\n")
                continue
            
            print(f"  📏 Extracted {len(text):,} characters")
            
            # Save as text file
            output_file = OUTPUT_DIR / (pdf_file.stem + ".txt")
            output_file.write_text(text, encoding="utf-8")
            print(f"  💾 Saved to: {output_file}\n")
            
            processed += 1
            
        except Exception as e:
            print(f"  ❌ Error processing {pdf_file.name}: {e}\n")
            failed += 1
            continue
    
    # Summary
    print("=" * 60)
    print(f"✨ Extraction complete!")
    print(f"  ✅ Successfully processed: {processed} file(s)")
    if failed > 0:
        print(f"  ❌ Failed: {failed} file(s)")


if __name__ == "__main__":
    main()
