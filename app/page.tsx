'use client';

import { useState, useRef } from 'react';
import { extractTilesFromImage } from '@/lib/ocr';
import { solveQuartiles, WordResult } from '@/lib/solver';
import { DictionaryType } from '@/lib/dictionary';

export default function Home() {
  const [tiles, setTiles] = useState<string[]>([]);
  const [manualTiles, setManualTiles] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [solving, setSolving] = useState(false);
  const [results, setResults] = useState<Record<number, WordResult[]>>({});
  const [totalFound, setTotalFound] = useState(0);
  const [questionableCount, setQuestionableCount] = useState(0);
  const [dictionarySize, setDictionarySize] = useState(0);
  const [dictType, setDictType] = useState<DictionaryType>('twl06');
  const [minLength, setMinLength] = useState(2);
  const [psmMode, setPsmMode] = useState(6);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      const extractedTiles = await extractTilesFromImage(file, psmMode);
      if (extractedTiles.length === 0) {
        setError('No tiles found in the image. Try a different PSM mode or use manual entry.');
      } else {
        setTiles(extractedTiles);
      }
    } catch (err) {
      setError(`OCR failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTiles = () => {
    const tileList = manualTiles
      .split(/\s+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length >= 2);
    
    if (tileList.length === 0) {
      setError('Please enter at least one tile (2+ characters each)');
      return;
    }
    
    setTiles(tileList);
    setError('');
  };

  const handleSolve = async () => {
    if (tiles.length === 0) {
      setError('Please provide tiles first (upload image or enter manually)');
      return;
    }

    setSolving(true);
    setError('');
    
    try {
      const solveResult = await solveQuartiles(tiles, dictType, minLength);
      setResults(solveResult.results);
      setTotalFound(solveResult.totalFound);
      setQuestionableCount(solveResult.questionableCount);
      setDictionarySize(solveResult.dictionarySize);
    } catch (err) {
      setError(`Solving failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSolving(false);
    }
  };

  const formatTilesGrid = (tiles: string[]) => {
    const cols = 4;
    const rows: string[][] = [];
    for (let i = 0; i < tiles.length; i += cols) {
      rows.push(tiles.slice(i, i + cols));
    }
    return rows;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            🧩 Quartiles Solver
          </h1>
          <p className="text-gray-600 text-lg">
            Find all valid word combinations from puzzle tiles
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Input Tiles</h2>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Puzzle Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Choose Image'}
                </button>
                <select
                  value={psmMode}
                  onChange={(e) => setPsmMode(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={6}>PSM 6 (Uniform Block)</option>
                  <option value={4}>PSM 4 (Single Column)</option>
                  <option value={11}>PSM 11 (Sparse Text)</option>
                </select>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Tiles Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualTiles}
                  onChange={(e) => setManualTiles(e.target.value)}
                  placeholder="cli ta ous ci sul ni con da..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualTiles();
                    }
                  }}
                />
                <button
                  onClick={handleManualTiles}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dictionary
                </label>
                <select
                  value={dictType}
                  onChange={(e) => setDictType(e.target.value as DictionaryType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="twl06">TWL06 (Tournament Word List)</option>
                  <option value="enable">ENABLE</option>
                  <option value="both">Both (Maximum Coverage)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Word Length: {minLength}
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={minLength}
                  onChange={(e) => setMinLength(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Solve Button */}
            <button
              onClick={handleSolve}
              disabled={tiles.length === 0 || solving}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {solving ? 'Solving...' : 'Solve Puzzle'}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Tiles Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Extracted Tiles ({tiles.length})
            </h2>
            {tiles.length > 0 ? (
              <div className="space-y-2">
                {formatTilesGrid(tiles).map((row, i) => (
                  <div key={i} className="flex gap-2 flex-wrap">
                    {row.map((tile, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-mono text-sm font-semibold"
                      >
                        {tile}
                      </span>
                    ))}
                  </div>
                ))}
                <div className="mt-4 text-sm text-gray-600">
                  <p>Tiles: {tiles.join(', ')}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">No tiles loaded yet</p>
            )}
          </div>
        </div>

        {/* Results Section */}
        {totalFound > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Results</h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Total words: <strong className="text-gray-900">{totalFound}</strong></span>
                <span>Dictionary: <strong className="text-gray-900">{dictionarySize.toLocaleString()}</strong> words</span>
                {questionableCount > 0 && (
                  <span className="text-amber-600">
                    Review needed: <strong>{questionableCount}</strong>
                  </span>
                )}
              </div>
            </div>

            {[1, 2, 3, 4].map((numTiles) => {
              const tileResults = results[numTiles] || [];
              if (tileResults.length === 0) return null;

              const maxWidth = Math.max(
                ...tileResults.map(r => r.tiles.join(' + ').length),
                20
              );

              return (
                <div key={numTiles} className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-700">
                    {numTiles} Tile Combination{numTiles > 1 ? 's' : ''} ({tileResults.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-1 font-mono text-sm">
                      {tileResults.map((result, idx) => {
                        const leftSide = result.tiles.join(' + ');
                        const hasTags = result.tags.length > 0;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 py-1 ${
                              hasTags ? 'text-amber-700' : 'text-gray-800'
                            }`}
                          >
                            <span className="text-gray-500 w-48 text-right">{leftSide}</span>
                            <span className="text-gray-400">=</span>
                            <span className="font-semibold">{result.word}</span>
                            {hasTags && (
                              <span className="text-xs text-amber-600 ml-2">
                                [{result.tags.join(', ')}]
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

