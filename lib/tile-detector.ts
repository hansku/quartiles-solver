/**
 * Advanced tile detection system using multiple strategies
 * 1. Grid-based detection (if tiles are in a regular grid)
 * 2. Contour-based detection (find rectangular regions)
 * 3. Color-based segmentation (detect tiles by color/borders)
 * 4. Per-tile OCR with optimized settings
 */

export interface TileRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
}

export interface DetectionResult {
  tiles: string[];
  regions: TileRegion[];
  method: string;
  debugImages?: DebugImage[];
}

export interface DebugImage {
  tileIndex: number;
  step: string;
  imageData: string; // base64 data URL
  description: string;
}

/**
 * Load image file to canvas
 */
export function loadImageToCanvas(imageFile: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    const objectUrl = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objectUrl;
  });
}

/**
 * Get image data as grayscale array
 */
function getGrayscaleData(canvas: HTMLCanvasElement): { data: Uint8Array; width: number; height: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const grayscale = new Uint8Array(canvas.width * canvas.height);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    grayscale[i / 4] = gray;
  }
  
  return { data: grayscale, width: canvas.width, height: canvas.height };
}

/**
 * Apply adaptive thresholding to create binary image
 */
function adaptiveThreshold(
  grayscale: Uint8Array,
  width: number,
  height: number,
  blockSize: number = 15,
  C: number = 10
): Uint8Array {
  const binary = new Uint8Array(width * height);
  const halfBlock = Math.floor(blockSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      
      // Calculate local mean
      for (let dy = -halfBlock; dy <= halfBlock; dy++) {
        for (let dx = -halfBlock; dx <= halfBlock; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            sum += grayscale[ny * width + nx];
            count++;
          }
        }
      }
      
      const mean = sum / count;
      const idx = y * width + x;
      binary[idx] = grayscale[idx] < (mean - C) ? 0 : 255;
    }
  }
  
  return binary;
}

/**
 * Apply Otsu's method for thresholding
 */
function otsuThreshold(grayscale: Uint8Array): number {
  const histogram = new Array(256).fill(0);
  const total = grayscale.length;
  
  for (let i = 0; i < total; i++) {
    histogram[grayscale[i]]++;
  }
  
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;
    
    wF = total - wB;
    if (wF === 0) break;
    
    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }
  
  return threshold;
}

/**
 * Create binary image using Otsu thresholding
 */
function createBinaryImage(
  grayscale: Uint8Array,
  width: number,
  height: number,
  invert: boolean = false
): HTMLCanvasElement {
  const threshold = otsuThreshold(grayscale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < grayscale.length; i++) {
    const value = grayscale[i] < threshold ? (invert ? 255 : 0) : (invert ? 0 : 255);
    const idx = i * 4;
    data[idx] = value;     // R
    data[idx + 1] = value; // G
    data[idx + 2] = value; // B
    data[idx + 3] = 255;    // A
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Detect grid structure in image
 * Assumes tiles are arranged in a regular grid
 */
function detectGridRegions(
  canvas: HTMLCanvasElement,
  expectedRows: number = 5,
  expectedCols: number = 4
): TileRegion[] {
  const width = canvas.width;
  const height = canvas.height;
  const regions: TileRegion[] = [];
  
  const tileWidth = width / expectedCols;
  const tileHeight = height / expectedRows;
  
  for (let row = 0; row < expectedRows; row++) {
    for (let col = 0; col < expectedCols; col++) {
      regions.push({
        x: Math.round(col * tileWidth),
        y: Math.round(row * tileHeight),
        width: Math.round(tileWidth),
        height: Math.round(tileHeight),
        confidence: 1.0
      });
    }
  }
  
  // Ensure regions are sorted by row (y) then column (x) for consistent processing
  regions.sort((a, b) => {
    if (Math.abs(a.y - b.y) > tileHeight * 0.5) {
      // Different rows - sort by y
      return a.y - b.y;
    }
    // Same row - sort by x
    return a.x - b.x;
  });
  
  return regions;
}

/**
 * Enhance contrast - invert dark text on dark background and enhance
 */
function enhanceContrast(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Find min/max for normalization
  let minGray = 255;
  let maxGray = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    if (gray < minGray) minGray = gray;
    if (gray > maxGray) maxGray = gray;
  }
  
  const range = maxGray - minGray || 1;
  
  // Enhance contrast: normalize range, invert, then apply moderate contrast
  // Goal: preserve letter shapes while improving readability
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    // Normalize to full range (0-255) to maximize contrast
    gray = range > 0 ? ((gray - minGray) / range) * 255 : gray;
    
    // Invert: dark text on dark bg becomes light text on dark bg
    gray = 255 - gray;
    
    // Stronger contrast enhancement - better separation of text from background
    // Use a more aggressive threshold to ensure text is clearly white
    const threshold = 80; // Lower threshold for better text/background separation
    
    if (gray > threshold) {
      // Text areas - stretch more aggressively toward white
      const stretchFactor = 255 / (255 - threshold);
      gray = threshold + (gray - threshold) * stretchFactor;
      // Additional boost to ensure text is very white
      gray = Math.min(255, gray * 1.1);
    } else {
      // Background - push more aggressively toward black
      gray = gray * (threshold / 255) * 0.5;
    }
    
    gray = Math.max(0, Math.min(255, gray));
    
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Extract region from canvas
 */
export function extractRegion(canvas: HTMLCanvasElement, region: TileRegion): HTMLCanvasElement {
  const regionCanvas = document.createElement('canvas');
  regionCanvas.width = region.width;
  regionCanvas.height = region.height;
  const ctx = regionCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(
    canvas,
    region.x, region.y, region.width, region.height,
    0, 0, region.width, region.height
  );
  
  return regionCanvas;
}

/**
 * Preprocess image with multiple strategies
 */
export function preprocessImage(
  canvas: HTMLCanvasElement,
  strategy: 'contrast' | 'binary' | 'adaptive' | 'original' = 'contrast'
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  if (strategy === 'original') {
    ctx.drawImage(canvas, 0, 0);
    return result;
  }
  
  if (strategy === 'contrast') {
    const enhanced = enhanceContrast(canvas);
    ctx.drawImage(enhanced, 0, 0);
    return result;
  }
  
  if (strategy === 'binary' || strategy === 'adaptive') {
    const { data, width, height } = getGrayscaleData(canvas);
    
    let binary: Uint8Array;
    if (strategy === 'adaptive') {
      binary = adaptiveThreshold(data, width, height);
    } else {
      // Use Otsu thresholding for optimal black/white separation
      const threshold = otsuThreshold(data);
      // Use the threshold directly for clean binary separation
      // Invert: dark text becomes white (255), light background becomes black (0)
      binary = new Uint8Array(data.map(v => v < threshold ? 255 : 0));
    }
    
    // Create binary image
    const binaryCanvas = document.createElement('canvas');
    binaryCanvas.width = width;
    binaryCanvas.height = height;
    const binaryCtx = binaryCanvas.getContext('2d');
    if (!binaryCtx) throw new Error('Could not get canvas context');
    
    const imageData = binaryCtx.createImageData(width, height);
    const imgData = imageData.data;
    
    for (let i = 0; i < binary.length; i++) {
      const value = binary[i];
      const idx = i * 4;
      imgData[idx] = value;     // R
      imgData[idx + 1] = value; // G
      imgData[idx + 2] = value; // B
      imgData[idx + 3] = 255;    // A
    }
    
    binaryCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(binaryCanvas, 0, 0);
    return result;
  }
  
  return result;
}

/**
 * Detect tile regions using grid-based approach
 */
export async function detectTileRegions(
  imageFile: File,
  expectedRows: number = 5,
  expectedCols: number = 4
): Promise<TileRegion[]> {
  const canvas = await loadImageToCanvas(imageFile);
  return detectGridRegions(canvas, expectedRows, expectedCols);
}

