# Quartiles Solver 🧩

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)

**Quartiles Solver** is a simple, effective tool for solving Quartiles word puzzles. It finds all valid word combinations from puzzle tiles using the TWL06 dictionary with minimal filtering to prioritize finding all valid words over avoiding false positives.

> **Note**: This project was vibe coded - developed iteratively with a focus on simplicity and user feedback rather than over-engineering. The code prioritizes clarity and maintainability.

## ✨ Features

- **📸 Image Recognition**: Automatically extracts tiles from screenshots using Tesseract OCR
- **👁️ Visual Tile Grid**: Displays extracted tiles in a grid layout for easy verification
- **📚 Multiple Dictionaries**: Choose from TWL06 (default), ENABLE, or use both for maximum coverage
- **🎯 Minimal Filtering**: Only excludes profanity - shows all valid dictionary words for human review
- **📊 Aligned Output**: Results are formatted with aligned '=' signs for easy scanning
- **⚡ Fast**: Generates and validates thousands of tile combinations quickly

## 🚀 Installation

### Prerequisites

1. **Python 3.8+**: Make sure you have Python installed
2. **Tesseract OCR**: Required for image recognition
   - **macOS**: `brew install tesseract`
   - **Ubuntu**: `sudo apt-get install tesseract-ocr`
   - **Windows**: [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hansku/quartiles-solver.git
   cd quartiles-solver
   ```

2. (Optional) Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

Dictionaries will be automatically downloaded on first use.

## 🎮 Usage

### Image Input (Recommended)

Take a screenshot of your Quartiles puzzle (crop to just the tiles for best results) and save it as `tiles.png`:

```bash
python3 tiles.py tiles.png
```

The script will:
1. Extract tiles from the image using OCR
2. Display tiles in a grid for visual verification
3. Find all valid word combinations (1-4 tiles)
4. Show results with aligned formatting for easy scanning

### Manual Tile Input

If OCR doesn't work well, you can manually specify tiles:

```bash
python3 tiles.py --tiles cli ta ous ci sul ni con da
```

### Options

- `--min-length N`: Minimum word length (default: 2, includes valid 2-letter words)
- `--ocr-psm N`: Tesseract PSM mode (default: 6, try 4 or 11 if tiles are misread)
- `--tiles TILE ...`: Manually specify tiles (space-separated)
- `--dict {twl06,enable,both}`: Dictionary to use (default: twl06)
  - `twl06`: Tournament Word List 2006 (178k words, standard for North American tournaments)
  - `enable`: Enhanced North American Basic Lexicon (173k words, alternative word list)
  - `both`: Union of both dictionaries (maximum word coverage)

### Example Output

```
Found 20 tiles:

  cli       ta        ous       ci      
  sul       ni        con       da      
  nt        wat       aut       lly     
  ate       wri       men       st      
  ca        tic       ch        hen     

--- 2 Tile Combinations ---
ca + nt   = cant
ca + st   = cast
ci + st   = cist
cli + tic = clitic
con + ch  = conch
...
```

## 🎯 Design Philosophy

This solver prioritizes **recall over precision** - it's better to show all valid words and let you decide what's in the puzzle than to miss valid words by over-filtering. The approach:

- **Minimal filtering**: Only excludes obvious profanity
- **Human-in-the-loop**: Shows all valid dictionary words for your review
- **Visual verification**: Grid display helps catch OCR errors early
- **Simple and maintainable**: Clean code without unnecessary complexity

Words marked with `[abbreviation]` are short all-consonant words that might need review, but they're still shown to avoid false negatives.

## 📝 Notes

- **Dictionary Options**: 
  - `twl06` (default): Tournament Word List 2006, standard for North American tournaments (~178k words)
  - `enable`: Enhanced North American Basic Lexicon, alternative comprehensive list (~173k words)
  - `both`: Combines both dictionaries for maximum coverage
- The dictionaries include many valid words that Quartiles may not accept (proper nouns, obscure terms, etc.)
- Some words in the output may not be valid in Quartiles - this is intentional to avoid missing valid words
- If tiles look incorrect, try different `--ocr-psm` modes or use `--tiles` to specify manually
- Dictionaries are downloaded automatically on first use

## 🤝 Contributing

Pull requests welcome! This is a vibe-coded project, so keep it simple and focused.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Happy Solving!* 🕵️‍♂️
