import { ProcessedSvg } from '../types';
import { LETTER_OVERLAP_RULES, DEFAULT_OVERLAP, overlapExceptions } from '../data/letterRules';

// Create a space SVG object with valid SVG content
export function createSpaceSvg(): ProcessedSvg {
  const spaceWidth = 70;
  const blankSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"></svg>`;
  
  return {
    svg: blankSvg,
    width: spaceWidth,
    height: 200,
    bounds: { left: 0, right: spaceWidth, top: 0, bottom: 200 },
    pixelData: Array(200).fill(null).map(() => Array(200).fill(false)),
    verticalPixelRanges: Array(200).fill(null),
    scale: 1,
    letter: ' ',
    isSpace: true
  };
}

// Find optimal overlap between two letters
export function findOptimalOverlap(prev: ProcessedSvg, current: ProcessedSvg): number {
  if (prev.isSpace || current.isSpace) return 0;
  
  const prevLetter = prev.letter.toLowerCase();
  const currentLetter = current.letter.toLowerCase();
  
  // Get letter-specific overlap rules or use defaults
  const rules = LETTER_OVERLAP_RULES[prevLetter] || DEFAULT_OVERLAP;
  let minOverlap = rules.minOverlap;
  let maxOverlap = rules.maxOverlap;
  
  // Check for special case overlaps
  if (rules.specialCases && rules.specialCases[currentLetter]) {
    maxOverlap = rules.specialCases[currentLetter];
  }
  
  // Check if current letter is in the exceptions list for the previous letter
  const exceptions = overlapExceptions[prevLetter] || [];
  if (exceptions.includes(currentLetter)) {
    // Reduce overlap for exception pairs
    maxOverlap = Math.max(minOverlap, maxOverlap * 0.7);
  }
  
  const prevWidth = prev.bounds.right - prev.bounds.left;
  
  // Check for overlaps at decreasing amounts
  for (let overlap = maxOverlap; overlap >= minOverlap; overlap -= 0.005) {
    const offset = prevWidth * overlap;
    const startX = Math.floor(prev.bounds.right - offset);
    
    // Use a reduced resolution for collision detection to improve performance
    const step = 2; // Check every 2nd pixel instead of every pixel
    
    for (let x = Math.max(0, startX); x < prev.bounds.right; x += step) {
      const currentX = x - startX + current.bounds.left;
      if (currentX >= 0 && currentX < 200) {
        const prevRange = prev.verticalPixelRanges[x];
        const currentRange = current.verticalPixelRanges[currentX];
        if (prevRange && currentRange) {
          const rangeOverlap = Math.min(prevRange.bottom, currentRange.bottom) -
                              Math.max(prevRange.top, currentRange.top);
          if (rangeOverlap > 0 && prevRange.density > 0.1 && currentRange.density > 0.1) {
            return overlap;
          }
        }
      }
    }
  }
  
  return minOverlap;
}

// Process an SVG string into a ProcessedSvg object
export async function processSvg(
  svgText: string, 
  letter: string, 
  resolution: number = 200
): Promise<ProcessedSvg> {
  if (!svgText.includes('<svg') || !svgText.includes('</svg>')) {
    throw new Error('Invalid SVG content');
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) throw new Error('Invalid SVG element');

  svg.setAttribute('width', String(resolution));
  svg.setAttribute('height', String(resolution));
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('class', 'transition-transform duration-200 hover:scale-102');

  // Process SVG on a canvas with reduced resolution for better performance
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load SVG for letter "${letter}"`));
    img.src = 'data:image/svg+xml;base64,' + btoa(svg.outerHTML);
  });

  ctx.clearRect(0, 0, resolution, resolution);
  ctx.drawImage(img, 0, 0, resolution, resolution);
  
  // Sample pixels with reduced frequency for better performance
  const samplingRate = 2; // Sample every 2nd pixel
  const { data } = ctx.getImageData(0, 0, resolution, resolution);

  let left = resolution, right = 0, top = resolution, bottom = 0;
  const pixelData: boolean[][] = Array(resolution).fill(null).map(() => Array(resolution).fill(false));
  const verticalPixelRanges: { top: number; bottom: number; density: number }[] = Array(resolution).fill(null);

  for (let x = 0; x < resolution; x += samplingRate) {
    let columnTop = resolution, columnBottom = 0, pixelCount = 0;
    
    for (let y = 0; y < resolution; y += samplingRate) {
      const index = (y * resolution + x) * 4;
      const alpha = data[index + 3];
      
      if (alpha > 20) {
        // Mark as filled for full resolution
        for (let dx = 0; dx < samplingRate && x + dx < resolution; dx++) {
          for (let dy = 0; dy < samplingRate && y + dy < resolution; dy++) {
            pixelData[x + dx][y + dy] = true;
          }
        }
        
        columnTop = Math.min(columnTop, y);
        columnBottom = Math.max(columnBottom, y);
        pixelCount++;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    
    if (pixelCount > 0) {
      const height = columnBottom - columnTop + 1;
      const density = pixelCount / (height / samplingRate);
      
      // Fill in the vertical range data for all columns in the sampling range
      for (let dx = 0; dx < samplingRate && x + dx < resolution; dx++) {
        verticalPixelRanges[x + dx] = { top: columnTop, bottom: columnBottom, density };
      }
    }
  }

  // Interpolate missing columns to ensure continuous data
  for (let x = 0; x < resolution; x++) {
    if (!verticalPixelRanges[x] && x > left && x < right) {
      let leftIdx = x - 1, rightIdx = x + 1;
      
      while (leftIdx >= left && !verticalPixelRanges[leftIdx]) leftIdx--;
      while (rightIdx <= right && !verticalPixelRanges[rightIdx]) rightIdx++;
      
      if (leftIdx >= left && rightIdx <= right && (rightIdx - leftIdx) < 10) {
        const leftRange = verticalPixelRanges[leftIdx];
        const rightRange = verticalPixelRanges[rightIdx];
        const progress = (x - leftIdx) / (rightIdx - leftIdx);
        
        verticalPixelRanges[x] = {
          top: Math.round(leftRange.top + (rightRange.top - leftRange.top) * progress),
          bottom: Math.round(leftRange.bottom + (rightRange.bottom - leftRange.bottom) * progress),
          density: (leftRange.density + rightRange.density) / 2
        };
      }
    }
  }

  // For empty SVGs like spaces, provide default bounds
  if (left === resolution || right === 0 || top === resolution || bottom === 0) {
    if (letter === ' ') {
      // For space characters, create default dimensions
      left = 0;
      right = 70; // spaceWidth
      top = 0;
      bottom = 200;
    } else {
      throw new Error(`No visible pixels found in SVG for letter "${letter}"`);
    }
  }

  return {
    svg: svg.outerHTML,
    width: resolution,
    height: resolution,
    bounds: { left, right, top, bottom },
    pixelData,
    verticalPixelRanges,
    scale: 1,
    letter
  };
}