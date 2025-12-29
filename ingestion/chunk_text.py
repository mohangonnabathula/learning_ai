#!/usr/bin/env python3
"""
Simple text chunking script - splits raw text into manageable chunks.
"""

from pathlib import Path

# ----------------------
# CONFIGURATION
# ----------------------
RAW_TXT_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/extracted_text")
CHUNKS_DIR = Path("/Users/mohangonnabathula/Desktop/learning_ai/data/chunks")

CHUNK_SIZE = 5000  # Characters per chunk
OVERLAP = 500      # Overlap between chunks (for context)


# ----------------------
# FUNCTION: Chunk text with overlap
# ----------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = OVERLAP) -> list:
    """Split text into chunks with optional overlap."""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundary
        if end < len(text):
            # Find last period
            last_period = chunk.rfind('.')
            if last_period > chunk_size // 2:  # Only break if it's past halfway
                end = start + last_period + 1
                chunk = text[start:end]
        
        chunks.append(chunk)
        start = end - overlap  # Move start back by overlap amount
    
    return chunks


# ----------------------
# FUNCTION: Process all text files
# ----------------------
def main():
    """Main function to chunk all text files."""
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    
    txt_files = list(RAW_TXT_DIR.glob("*.txt"))
    
    if not txt_files:
        print(f"❌ No .txt files found in {RAW_TXT_DIR}")
        return
    
    print(f"📁 Found {len(txt_files)} text file(s)")
    print(f"📂 Output: {CHUNKS_DIR}")
    print(f"📏 Chunk size: {CHUNK_SIZE:,} chars, Overlap: {OVERLAP} chars")
    print()
    
    total_chunks = 0
    
    for txt_file in txt_files:
        print(f"📝 Chunking: {txt_file.name}")
        
        # Read text
        text = txt_file.read_text(encoding="utf-8")
        print(f"  📏 Total size: {len(text):,} characters")
        
        # Chunk it
        chunks = chunk_text(text)
        print(f"  📊 Created {len(chunks)} chunk(s)")
        
        # Save chunks
        for i, chunk in enumerate(chunks, 1):
            chunk_file = CHUNKS_DIR / f"{txt_file.stem}_chunk_{i:04d}.txt"
            chunk_file.write_text(chunk, encoding="utf-8")
        
        total_chunks += len(chunks)
        print()
    
    # Summary
    print("=" * 60)
    print(f"✨ Chunking complete!")
    print(f"  📊 Total chunks created: {total_chunks}")
    print(f"  💾 Saved to: {CHUNKS_DIR}")


if __name__ == "__main__":
    main()
