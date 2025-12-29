# Ollama Setup and Usage Guide

## 1. Installation

### macOS
```bash
# Download and install from https://ollama.ai
# Or use Homebrew:
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows
Download the installer from https://ollama.ai/download

---

## 2. Starting Ollama

### Automatic Start (macOS/Windows)
- After installation, Ollama typically starts automatically as a background service
- Check if it's running: `ollama list` (should work without errors)

### Manual Start
```bash
# Start the Ollama server
ollama serve

# This will run in the foreground. For background:
ollama serve &
```

### Verify Ollama is Running
```bash
# Check if Ollama is available
ollama --version

# List installed models (this also verifies the server is running)
ollama list
```

---

## 3. Downloading Models

Your script uses `llama3`. Download it with:

```bash
# Pull the llama3 model (this will download it)
ollama pull llama3

# Other popular models you might want:
ollama pull llama3.2        # Smaller, faster version
ollama pull mistral         # Alternative model
ollama pull phi3            # Microsoft's efficient model
ollama pull gemma2          # Google's model
```

**Note:** The first time you pull a model, it may take several minutes depending on your internet connection and the model size.

---

## 4. Using Ollama

### Command Line Interface

#### Basic Chat
```bash
# Run a model interactively
ollama run llama3

# Then type your prompt and press Enter
# Type /bye or Ctrl+D to exit
```

#### One-time Query
```bash
# Run a single prompt (non-interactive)
ollama run llama3 "What is machine learning?"

# Or pipe input
echo "Classify this text: ..." | ollama run llama3
```

#### List Commands
```bash
ollama list              # List installed models
ollama show llama3       # Show model information
ollama ps                # Show running models
ollama stop llama3       # Stop a running model
ollama rm llama3         # Remove a model
```

### Python Integration

Your script already uses Ollama via subprocess. Here's how it works:

```python
import subprocess

# Run a model with a prompt
result = subprocess.run(
    ["ollama", "run", "llama3"],
    input="Your prompt here",
    text=True,
    capture_output=True,
    timeout=90
)

response = result.stdout.strip()
```

### Using Ollama Python Library (Alternative)

You can also use the official Python library:

```bash
pip install ollama
```

```python
import ollama

# Generate a response
response = ollama.generate(
    model='llama3',
    prompt='Classify this text: ...'
)
print(response['response'])

# Or use chat format
response = ollama.chat(
    model='llama3',
    messages=[
        {'role': 'user', 'content': 'Classify this text: ...'}
    ]
)
print(response['message']['content'])
```

---

## 5. Troubleshooting

### Server Not Running
```bash
# Error: "server not responding" or "could not find ollama"

# Solution 1: Start the server
ollama serve

# Solution 2: On macOS, check if Ollama app is running
# Open Applications > Ollama (if installed via .dmg)
```

### Model Not Found
```bash
# Error: "model 'llama3' not found"

# Solution: Pull the model
ollama pull llama3
```

### Timeout Issues
- Increase the timeout in your script (currently 90 seconds)
- Try a smaller model like `llama3.2` for faster responses
- Check system resources (CPU/RAM usage)

### Check Ollama Status
```bash
# Verify installation
ollama --version

# Check if server is accessible
curl http://localhost:11434/api/tags
```

---

## 6. Stopping Processes

### Stop a Running Python Script
```bash
# In the terminal where the script is running:
# Press Ctrl + C (or Cmd + C on macOS)

# If Ctrl+C doesn't work:
# Press Ctrl + Z to suspend, then:
kill %1

# Or find and kill the process:
ps aux | grep python
kill <PID>
```

### Stop an Ollama Model
```bash
# Check which models are running
ollama ps

# Stop a specific model
ollama stop llama3

# Stop all running models (run stop for each one)
```

### Stop the Ollama Server
```bash
# If started manually in a terminal:
# Press Ctrl + C in that terminal

# Or kill the process:
pkill ollama          # macOS/Linux
killall ollama        # macOS/Linux

# Find the process ID first:
ps aux | grep ollama
kill <PID>
```

### Emergency Stop (All Python/Ollama Processes)
```bash
# Stop all Python processes (be careful!)
pkill -f python

# Stop all Ollama processes
pkill ollama
```

**Note:** Stopping a script mid-run may leave files in an incomplete state. The script will stop at the current chunk being processed.

---

## 7. Quick Start Checklist

1. ✅ Install Ollama: `brew install ollama` or download from https://ollama.ai
2. ✅ Verify installation: `ollama --version`
3. ✅ Start server: `ollama serve` (or let it auto-start)
4. ✅ Pull model: `ollama pull llama3`
5. ✅ Test: `ollama run llama3 "Hello, world!"`
6. ✅ Run your script: `python ingestion/extract_text.py`

---

## 8. Model Recommendations for Your Use Case

For text classification (as in your script):

- **llama3** (current): Good balance of accuracy and speed
- **llama3.2**: Faster, smaller, good for classification tasks
- **mistral**: Fast and efficient
- **phi3**: Very fast, good for simple classification

To switch models in your script, change:
```python
OLLAMA_MODEL = "llama3.2"  # or "mistral", "phi3", etc.
```

---

## 9. API Endpoint (Advanced)

Ollama also provides a REST API:

```bash
# List models via API
curl http://localhost:11434/api/tags

# Generate via API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Why is the sky blue?"
}'
```

---

## Resources

- Official Website: https://ollama.ai
- Documentation: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library

