import { letterSvgs, firstLetterSvgs, lastLetterSvgs } from '../data/letterMappings';
import { LETTER_ROTATION_RULES } from '../data/letterRules';

// Check if a specific SVG file exists
export function svgExists(path: string): boolean {
  // This is a simple check to see if the path is defined in our mappings
  return !!path;
}

// Get the appropriate SVG for a letter based on position and style
export async function getLetterSvg(
  letter: string,
  isAlternate: boolean,
  isFirst: boolean,
  isLast: boolean,
  style: string
): Promise<string> {
  let svgPath: string | undefined;
  
  // Check for first letter variant
  if (style !== 'straight' && isFirst && firstLetterSvgs[letter]) {
    svgPath = firstLetterSvgs[letter];
  }
  // Check for last letter variant
  else if (style !== 'straight' && isLast && lastLetterSvgs[letter]) {
    svgPath = lastLetterSvgs[letter];
  }
  // Check for alternate version (only if it exists)
  else if (isAlternate) {
    const alternateKey = `${letter}2`;
    if (letterSvgs[alternateKey]) {
      svgPath = letterSvgs[alternateKey];
    }
  }
  
  // If no special variant was found or applicable, use the standard version
  if (!svgPath) {
    svgPath = letterSvgs[letter];
  }
  
  // If we still don't have a path, this is a truly missing letter
  if (!svgPath) {
    throw new Error(`No SVG found for letter '${letter}'`);
  }
  
  return svgPath;
}

// Fetch and parse an SVG from a URL
export async function fetchSvg(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch SVG from ${url}:`, error);
    throw error;
  }
}

// Determine if a letter should use an alternate version
export function shouldUseAlternate(letter: string, index: number, letters: string[]): boolean {
  // Only suggest alternate if we know it exists
  const alternateExists = !!letterSvgs[`${letter}2`];
  
  if (!alternateExists) {
    return false;
  }
  
  if (letter === 'o' && index > 0 && letters[index - 1] === 'o') {
    return true;
  }
  
  if (letter === 'm' && index > 0 && letters[index - 1] === 'm') {
    let consecutiveCount = 1;
    for (let i = index - 1; i >= 0; i--) {
      if (letters[i] === 'm') consecutiveCount++;
      else break;
    }
    return consecutiveCount % 2 === 0;
  }
  
  if (letter === 'e' && index > 0 && letters[index - 1] === 'e') {
    let consecutiveCount = 1;
    for (let i = index - 1; i >= 0; i--) {
      if (letters[i] === 'e') consecutiveCount++;
      else break;
    }
    return consecutiveCount % 2 === 0;
  }
  
  return false;
}

// Get letter-specific rotation
export function getLetterRotation(letter: string, prevLetter: string | null): number {
  if (!prevLetter) return 0;
  
  const rules = LETTER_ROTATION_RULES[prevLetter.toLowerCase()];
  return rules && rules[letter.toLowerCase()] ? rules[letter.toLowerCase()] : 0;
}