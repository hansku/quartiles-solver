import { createWorker } from 'tesseract.js';

export async function extractTilesFromImage(imageFile: File, psmMode: number = 6): Promise<string[]> {
  const worker = await createWorker('eng');
  
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: psmMode,
    } as any);
    
    const { data } = await worker.recognize(imageFile);
    
    const tiles: string[] = [];
    const words = data.words || [];
    
    for (const word of words) {
      const text = word.text?.trim().toLowerCase() || '';
      const confidence = word.confidence || 0;
      
      // Filter based on confidence and content
      if (confidence < 70) continue;
      if (!/^[a-z]+$/.test(text)) continue;
      if (text.length < 2) continue;
      
      // Remove any non-alphabetic characters
      const cleaned = text.replace(/[^a-z]/g, '');
      if (cleaned.length >= 2) {
        tiles.push(cleaned);
      }
    }
    
    return tiles;
  } finally {
    await worker.terminate();
  }
}

