# Quartiles Solver 🧩

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)

**Quartiles Solver** is a web application for solving Quartiles word puzzles. It finds all valid word combinations from puzzle tiles using the TWL06 or ENABLE dictionaries with minimal filtering to prioritize finding all valid words over avoiding false positives.

🌐 **Live Demo**: [Deploy to Vercel](#-deployment)

## ✨ Features

- **📸 Image Recognition**: Automatically extracts tiles from screenshots using Tesseract.js OCR (client-side)
- **👁️ Visual Tile Grid**: Displays extracted tiles in a grid layout for easy verification
- **📚 Multiple Dictionaries**: Choose from TWL06 (default), ENABLE, or use both for maximum coverage
- **🎯 Minimal Filtering**: Only excludes profanity - shows all valid dictionary words for human review
- **📊 Aligned Output**: Results are formatted with aligned '=' signs for easy scanning
- **⚡ Fast**: Generates and validates thousands of tile combinations quickly
- **🌐 Web-Based**: No installation required - works in your browser

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hansku/quartiles-solver.git
   cd quartiles-solver
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

This project is configured for easy deployment on Vercel:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure the build
   - Click "Deploy"

3. **That's it!** Your app will be live in seconds.

The project includes:
- ✅ `vercel.json` configuration
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Optimized for serverless deployment

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build the project
npm run build

# The output will be in the .next directory
# Deploy the .next directory to your hosting provider
```

## 🎮 Usage

### Image Input (Recommended)

1. Take a screenshot of your Quartiles puzzle (crop to just the tiles for best results)
2. Click "Choose Image" and select your screenshot
3. The app will automatically extract tiles using OCR
4. Review the extracted tiles in the grid
5. Adjust PSM mode if tiles are misread (try PSM 4, 6, or 11)
6. Click "Solve Puzzle" to find all valid word combinations

### Manual Tile Input

If OCR doesn't work well, you can manually specify tiles:

1. Enter tiles in the "Or Enter Tiles Manually" field (space-separated)
2. Click "Set" or press Enter
3. Review the tiles in the grid
4. Click "Solve Puzzle"

### Options

- **Dictionary**: Choose TWL06, ENABLE, or both
  - `twl06`: Tournament Word List 2006 (178k words, standard for North American tournaments)
  - `enable`: Enhanced North American Basic Lexicon (173k words, alternative word list)
  - `both`: Union of both dictionaries (maximum word coverage)
- **Minimum Word Length**: Adjust the slider to filter out shorter words (default: 2)
- **PSM Mode**: Tesseract OCR page segmentation mode
  - PSM 6: Uniform block (default, best for grid layouts)
  - PSM 4: Single column (try if tiles are in a column)
  - PSM 11: Sparse text (try if tiles are scattered)

### Example Output

The results are organized by number of tiles used (1-4) and show:
- Tile combinations (e.g., `ca + nt`)
- Resulting word (e.g., `cant`)
- Tags for words that may need review (e.g., `[abbreviation]`)

## 🎯 Design Philosophy

This solver prioritizes **recall over precision** - it's better to show all valid words and let you decide what's in the puzzle than to miss valid words by over-filtering. The approach:

- **Minimal filtering**: Only excludes obvious profanity
- **Human-in-the-loop**: Shows all valid dictionary words for your review
- **Visual verification**: Grid display helps catch OCR errors early
- **Simple and maintainable**: Clean code without unnecessary complexity

Words marked with `[abbreviation]` are short all-consonant words that might need review, but they're still shown to avoid false negatives.

## 📝 Technical Details

### Architecture

- **Frontend**: Next.js 14 with React and TypeScript
- **OCR**: Tesseract.js (client-side, no server required)
- **Styling**: Tailwind CSS
- **Dictionary Loading**: Fetched from GitHub repositories with caching

### Dictionary Sources

- **TWL06**: [Tournament Word List 2006](https://github.com/jessicatysu/scrabble/blob/master/TWL06.txt)
- **ENABLE**: [Enhanced North American Basic Lexicon](https://github.com/dolph/dictionary/blob/master/enable1.txt)

Dictionaries are loaded on-demand and cached in memory for performance.

## 🤝 Contributing

Pull requests welcome! This is a vibe-coded project, so keep it simple and focused.

### Development Principles

**CRITICAL RULE: NO WORKAROUNDS, NO FALLBACKS, NO HARDCODED SOLUTIONS**

When fixing bugs or improving OCR accuracy:
- ❌ **DO NOT** add post-processing corrections for specific misreads
- ❌ **DO NOT** add hardcoded mappings or character substitutions
- ❌ **DO NOT** add fallback logic that masks root causes
- ✅ **DO** fix the root cause: improve preprocessing, OCR parameters, or image quality
- ✅ **DO** improve actual OCR accuracy rather than patching results

If OCR misreads characters, the solution is to improve the OCR pipeline (preprocessing, scaling, PSM modes, etc.), not to add workarounds that hide the problem.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Happy Solving!* 🕵️‍♂️
