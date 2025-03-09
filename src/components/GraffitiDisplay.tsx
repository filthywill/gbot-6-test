import React, { useEffect, useState, useRef } from 'react';
import { ProcessedSvg, CustomizationOptions } from '../types';
import { Undo2, Redo2, Download, Copy, Clipboard, ClipboardCopy } from 'lucide-react';

interface GraffitiDisplayProps {
  isGenerating: boolean;
  processedSvgs: ProcessedSvg[];
  positions: number[];
  contentWidth: number;
  contentHeight: number;
  containerScale: number;
  customizationOptions: CustomizationOptions;
  customizationHistory?: CustomizationOptions[];
  currentHistoryIndex?: number;
  onUndoRedo?: (newIndex: number) => void;
}

// Function to apply customization options to SVG for main content
const customizeSvg = (svgString: string, isSpace: boolean | undefined, options: CustomizationOptions): string => {
  // For space characters, just return the empty SVG - no customization needed
  if (isSpace) {
    return svgString;
  }
  
  // Try parsing the SVG
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('SVG parsing error:', parserError.textContent);
      return svgString; // Return original if parsing fails
    }
    
    // Get SVG element and ensure overflow is visible
    const svgElement = doc.documentElement;
    svgElement.setAttribute('overflow', 'visible');
    
    // Special handling for shadow shield only
    if (options.shadowShieldOnly) {
      const paths = doc.querySelectorAll('.shadow-effect');
      paths.forEach(path => {
        // Show only shield for shadow
        path.setAttribute('style', 'display:inline');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', options.shieldColor);
        path.setAttribute('stroke-width', (options.stampWidth * 0.5 + options.shieldWidth * 2).toString());
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
      });
      
      // Hide all other paths
      const otherPaths = doc.querySelectorAll('path:not(.shadow-effect)');
      otherPaths.forEach(path => {
        path.setAttribute('style', 'display:none');
      });
      
      return new XMLSerializer().serializeToString(doc);
    }
    
    // Special handling for shadow only
    if (options.shadowOnly) {
      const paths = doc.querySelectorAll('.shadow-effect');
      paths.forEach(path => {
        // Show only shadow
        path.setAttribute('style', 'display:inline');
        path.setAttribute('fill', options.stampColor);
        
        if (options.stampEnabled) {
          path.setAttribute('stroke', options.stampColor);
          path.setAttribute('stroke-width', (options.stampWidth * 0.5).toString());
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('stroke-linecap', 'round');
        } else {
          path.removeAttribute('stroke');
        }
      });
      
      // Hide all other paths
      const otherPaths = doc.querySelectorAll('path:not(.shadow-effect)');
      otherPaths.forEach(path => {
        path.setAttribute('style', 'display:none');
      });
      
      return new XMLSerializer().serializeToString(doc);
    }
    
    // Special handling for content only (no stamp, shield or shadow)
    if (options.contentOnly) {
      // Process regular paths (not shadow or shine)
      const regularPaths = doc.querySelectorAll('path:not(.shadow-effect):not(.shine-effect)');
      regularPaths.forEach(path => {
        // Apply fill color if enabled
        if (options.fillEnabled) {
          path.setAttribute('fill', options.fillColor);
        } else {
          path.setAttribute('fill', '#000000');
        }
        
        // Apply stroke if enabled
        if (options.strokeEnabled) {
          path.setAttribute('stroke', options.strokeColor);
          path.setAttribute('stroke-width', options.strokeWidth.toString());
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('paint-order', 'stroke fill');
        } else {
          path.removeAttribute('stroke');
        }
      });
      
      // Handle shine layers
      const shineLayers = doc.querySelectorAll('.shine-effect');
      shineLayers.forEach(layer => {
        if (options.shineEnabled) {
          // Make shine visible
          layer.setAttribute('style', 'display:inline');
          layer.setAttribute('fill', options.shineColor);
          layer.setAttribute('fill-opacity', options.shineOpacity.toString());
        } else {
          layer.setAttribute('style', 'display:none');
        }
      });
      
      // Hide shadow layers
      const shadowLayers = doc.querySelectorAll('.shadow-effect');
      shadowLayers.forEach(layer => {
        layer.setAttribute('style', 'display:none');
      });
      
      return new XMLSerializer().serializeToString(doc);
    }
    
    // Regular processing (complete SVG)
    
    // Process all paths
    const paths = doc.querySelectorAll('path');
    paths.forEach(path => {
      // Skip shadow and shine layers - we'll handle those separately
      if (path.classList.contains('shine-effect') || path.classList.contains('shadow-effect')) {
        return;
      }
      
      // Apply fill color if enabled
      if (options.fillEnabled) {
        path.setAttribute('fill', options.fillColor);
      } else {
        path.setAttribute('fill', '#000000');
      }
      
      // Apply stroke if enabled
      if (options.strokeEnabled) {
        path.setAttribute('stroke', options.strokeColor);
        path.setAttribute('stroke-width', options.strokeWidth.toString());
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
        // This is the key - puts stroke behind the fill
        path.setAttribute('paint-order', 'stroke fill');
      } else {
        path.removeAttribute('stroke');
        path.removeAttribute('stroke-width');
        path.removeAttribute('stroke-linejoin');
        path.removeAttribute('stroke-linecap');
        path.removeAttribute('paint-order');
      }
    });
    
    // Handle shine layers
    const shineLayers = doc.querySelectorAll('.shine-effect');
    shineLayers.forEach(layer => {
      if (options.shineEnabled) {
        // Make shine visible
        layer.setAttribute('style', 'display:inline');
        
        // Apply user-selected color and opacity
        layer.setAttribute('fill', options.shineColor);
        layer.setAttribute('fill-opacity', options.shineOpacity.toString());
      } else {
        layer.setAttribute('style', 'display:none');
      }
    });
    
    // Handle shadow effect layers
    const shadowLayers = doc.querySelectorAll('.shadow-effect');
    shadowLayers.forEach(layer => {
      if (options.shadowEffectEnabled) {
        // Make shadow visible
        layer.setAttribute('style', 'display:inline');
        
        // Use the STAMP color for shadow fill
        layer.setAttribute('fill', options.stampColor);
        
        // Apply STAMP stroke if STAMP is enabled
        if (options.stampEnabled) {
          layer.setAttribute('stroke', options.stampColor);
          layer.setAttribute('stroke-width', (options.stampWidth * 0.5).toString());
          layer.setAttribute('stroke-linejoin', 'round');
          layer.setAttribute('stroke-linecap', 'round');
        } else {
          // If STAMP is disabled, remove stroke
          layer.removeAttribute('stroke');
          layer.removeAttribute('stroke-width');
        }
      } else {
        // Hide shadow if disabled
        layer.setAttribute('style', 'display:none');
      }
    });
    
    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
    console.error("Error customizing SVG:", error);
    return svgString; // Return original if customization fails
  }
};

// Function to create SVG for the STAMP effect layer
const createStampSvg = (svgString: string, isSpace: boolean | undefined, options: CustomizationOptions): string => {
  // For spaces or when both STAMP and SHIELD are disabled, return empty SVG
  if (isSpace || (!options.stampEnabled && !options.shieldEnabled)) {
    return '<svg></svg>'; // Empty SVG
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return '<svg></svg>';
    }
    
    const svgElement = doc.documentElement;
    svgElement.setAttribute('overflow', 'visible');
    
    // Remove any shadow-effect paths, as they'll be rendered separately
    const shadowPaths = doc.querySelectorAll('.shadow-effect');
    shadowPaths.forEach(path => {
      path.parentNode?.removeChild(path);
    });
    
    // Remove any shine-effect paths, as they'll be rendered separately
    const shinePaths = doc.querySelectorAll('.shine-effect');
    shinePaths.forEach(path => {
      path.parentNode?.removeChild(path);
    });
    
    // Process all remaining paths for the stamp/shield effects
    const paths = doc.querySelectorAll('path');
    
    // If we're only rendering the SHIELD (no STAMP)
    if (options.shieldEnabled && !options.stampEnabled) {
      paths.forEach(path => {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', options.shieldColor);
        path.setAttribute('stroke-width', options.shieldWidth.toString());
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
      });
      
      return new XMLSerializer().serializeToString(doc);
    }
    
    // If we're only rendering the STAMP (no SHIELD)
    if (!options.shieldEnabled && options.stampEnabled) {
      paths.forEach(path => {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', options.stampColor);
        path.setAttribute('stroke-width', options.stampWidth.toString());
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
      });
      
      return new XMLSerializer().serializeToString(doc);
    }
    
    // If we're rendering both SHIELD and STAMP
    // Create a group for shield paths (bottommost layer)
    const shieldGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    shieldGroup.setAttribute('id', 'stamp-shield-group');
    
    // Create a group for stamp paths (above shield)
    const stampGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    stampGroup.setAttribute('id', 'stamp-group');
    
    // Add groups to SVG in proper order
    svgElement.appendChild(shieldGroup);
    svgElement.appendChild(stampGroup);
    
    // Create and add shield paths
    paths.forEach(path => {
      // Skip any non-standard paths
      if (path.classList.contains('shine-effect') || path.classList.contains('shadow-effect')) {
        return;
      }
      
      // Create shield path
      const shieldPath = path.cloneNode(true) as SVGPathElement;
      shieldPath.setAttribute('fill', 'none');
      shieldPath.setAttribute('stroke', options.shieldColor);
      shieldPath.setAttribute('stroke-width', (options.stampWidth + options.shieldWidth * 2).toString());
      shieldPath.setAttribute('stroke-linejoin', 'round');
      shieldPath.setAttribute('stroke-linecap', 'round');
      
      // Add to shield group
      shieldGroup.appendChild(shieldPath);
      
      // Create stamp path (only if STAMP is enabled)
      if (options.stampEnabled) {
        const stampPath = path.cloneNode(true) as SVGPathElement;
        stampPath.setAttribute('fill', 'none');
        stampPath.setAttribute('stroke', options.stampColor);
        stampPath.setAttribute('stroke-width', options.stampWidth.toString());
        stampPath.setAttribute('stroke-linejoin', 'round');
        stampPath.setAttribute('stroke-linecap', 'round');
        
        // Add to stamp group
        stampGroup.appendChild(stampPath);
      }
      
      // Remove original path
      if (path.parentNode) {
        path.parentNode.removeChild(path);
      }
    });
    
    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
    console.error("Error creating stamp/shield SVG:", error);
    return '<svg></svg>';
  }
};

export const GraffitiDisplay: React.FC<GraffitiDisplayProps> = ({ 
  isGenerating, 
  processedSvgs, 
  positions,
  contentWidth,
  contentHeight,
  containerScale,
  customizationOptions,
  customizationHistory = [],
  currentHistoryIndex = -1,
  onUndoRedo
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  
  // Update dimensions when container resizes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDisplayDimensions({
          width: containerRef.current.clientWidth - 32, // account for padding
          height: containerRef.current.clientHeight - 32
        });
      }
    };
    
    // Initialize dimensions
    updateDimensions();
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Calculate the optimal scale factor
  const getScaleFactor = () => {
    if (contentWidth === 0 || contentHeight === 0 || displayDimensions.width === 0) {
      return containerScale;
    }
    
    // Calculate scale based on both width and height
    const widthScale = displayDimensions.width / contentWidth;
    const heightScale = displayDimensions.height / contentHeight;
    
    // Use the smaller scale to ensure content fits completely
    // Use 0.8 instead of 0.9 to provide more margin for effects
    return Math.min(widthScale, heightScale, 1) * 0.8; 
  };
  
  const scaleFactor = getScaleFactor();
  
  // Calculate centering offsets
  const offsetX = displayDimensions.width > 0 
    ? (displayDimensions.width - contentWidth * scaleFactor) / 2 
    : 0;
  
  const offsetY = displayDimensions.height > 0 
    ? (displayDimensions.height - contentHeight * scaleFactor) / 2 
    : 0;
    
  // Background styles with checkerboard pattern when background is disabled
  const backgroundStyle = customizationOptions.backgroundEnabled
    ? { backgroundColor: customizationOptions.backgroundColor }
    : {
        backgroundImage: `
          linear-gradient(45deg, #ccc 25%, transparent 25%), 
          linear-gradient(-45deg, #ccc 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, #ccc 75%), 
          linear-gradient(-45deg, transparent 75%, #ccc 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundColor: '#efefef'
      };

  // Function to handle undo/redo
  const handleUndoRedo = (direction: 'undo' | 'redo') => {
    if (!onUndoRedo || customizationHistory.length === 0) return;
    
    const newIndex = direction === 'undo' 
      ? Math.max(0, currentHistoryIndex - 1)
      : Math.min(customizationHistory.length - 1, currentHistoryIndex + 1);
    
    // Only trigger if the index actually changes
    if (newIndex !== currentHistoryIndex) {
      onUndoRedo(newIndex);
    }
  };

  // Function to copy the current design to clipboard as PNG using a targeted approach
  const copyToPng = async () => {
    if (!contentRef.current || processedSvgs.length === 0) return;
    
    try {
      // Create a canvas with appropriate dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size to match the content dimensions plus padding
      // Adding padding to avoid cut-off at edges
      const padding = 20;
      canvas.width = contentWidth * scaleFactor + (padding * 2);
      canvas.height = contentHeight * scaleFactor + (padding * 2);
      
      // For transparent background, we just leave the canvas as is
      // No need to draw the checkerboard pattern since we want transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // If background is enabled, fill with the background color
      if (customizationOptions.backgroundEnabled) {
        ctx.fillStyle = customizationOptions.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Focus on just rendering the content layer
      // First, create an offscreen div to hold our content for processing
      const offscreenDiv = document.createElement('div');
      offscreenDiv.style.position = 'absolute';
      offscreenDiv.style.left = '-9999px';
      offscreenDiv.style.top = '-9999px';
      offscreenDiv.style.width = `${canvas.width}px`;
      offscreenDiv.style.height = `${canvas.height}px`;
      offscreenDiv.style.overflow = 'hidden';
      document.body.appendChild(offscreenDiv);
      
      // Clone the content without UI controls
      const clone = contentRef.current.cloneNode(true) as HTMLElement;
      
      // Position the content in the center of our canvas (with padding)
      clone.style.position = 'absolute';
      clone.style.left = `${padding}px`;
      clone.style.top = `${padding}px`;
      clone.style.transform = `scale(${scaleFactor})`;
      clone.style.transformOrigin = 'left top';
      
      // Add the clone to the offscreen div
      offscreenDiv.appendChild(clone);
      
      // Create an SVG that contains all the visual elements
      const svgNS = "http://www.w3.org/2000/svg";
      const combinedSvg = document.createElementNS(svgNS, "svg");
      combinedSvg.setAttribute("width", canvas.width.toString());
      combinedSvg.setAttribute("height", canvas.height.toString());
      combinedSvg.setAttribute("xmlns", svgNS);
      
      // We'll draw layers in order:
      // 1. Background (already handled above)
      // 2. Shield layers
      // 3. Shadow layers
      // 4. Outlines
      // 5. Main content
      
      // Start by gathering all SVG elements in their correct layers
      const layers = [];
      
      // Function to safely get the computed z-index
      const getZIndex = (el) => {
        const style = window.getComputedStyle(el);
        const zIndex = style.zIndex;
        return zIndex === 'auto' ? 0 : parseInt(zIndex, 10);
      };
      
      // Collect all SVG-containing divs
      const svgDivs = offscreenDiv.querySelectorAll('div');
      for (const div of Array.from(svgDivs)) {
        const svg = div.querySelector('svg');
        if (svg) {
          const rect = div.getBoundingClientRect();
          const offscreenRect = offscreenDiv.getBoundingClientRect();
          
          // Get computed style
          const style = window.getComputedStyle(div);
          
          // Store this layer's information
          layers.push({
            element: svg,
            parent: div,
            zIndex: getZIndex(div),
            left: parseInt(style.left) || 0,
            top: parseInt(style.top) || 0,
            transform: style.transform
          });
        }
      }
      
      // Sort layers by z-index
      layers.sort((a, b) => a.zIndex - b.zIndex);
      
      // Process each layer
      for (const layer of layers) {
        const svgContent = new XMLSerializer().serializeToString(layer.element);
        
        // Create image for this SVG
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Save current context state
            ctx.save();
            
            // Apply translation to position the layer
            ctx.translate(padding + layer.left, padding + layer.top);
            
            // Apply any transforms from the parent
            if (layer.transform && layer.transform !== 'none') {
              // Extract transform components
              if (layer.transform.includes('matrix')) {
                const matrix = layer.transform.match(/matrix\\(([^)]+)\\)/);
                if (matrix && matrix[1]) {
                  const values = matrix[1].split(',').map(parseFloat);
                  ctx.transform(values[0], values[1], values[2], values[3], values[4], values[5]);
                }
              } else if (layer.transform.includes('rotate')) {
                const rotate = layer.transform.match(/rotate\\(([^)]+)\\)/);
                if (rotate && rotate[1]) {
                  const angle = parseFloat(rotate[1]);
                  ctx.rotate(angle * Math.PI / 180);
                }
              } else if (layer.transform.includes('scale')) {
                const scale = layer.transform.match(/scale\\(([^)]+)\\)/);
                if (scale && scale[1]) {
                  const values = scale[1].split(',').map(parseFloat);
                  if (values.length === 1) {
                    ctx.scale(values[0], values[0]);
                  } else if (values.length >= 2) {
                    ctx.scale(values[0], values[1]);
                  }
                }
              }
            }
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Restore context state
            ctx.restore();
            resolve();
          };
          
          img.onerror = reject;
          
          // Create blob URL from SVG string
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          img.src = URL.createObjectURL(blob);
        });
      }
      
      // Clean up the offscreen div
      document.body.removeChild(offscreenDiv);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob conversion failed'));
        }, 'image/png');
      });
      
      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      
      // Show success message
      const indicator = document.createElement('div');
      indicator.innerText = 'Copied to clipboard!';
      indicator.style.position = 'absolute';
      indicator.style.top = '40px';
      indicator.style.left = '10px';
      indicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
      indicator.style.color = 'white';
      indicator.style.padding = '5px 10px';
      indicator.style.borderRadius = '4px';
      indicator.style.fontSize = '12px';
      indicator.style.zIndex = '1000';
      indicator.style.transition = 'opacity 0.5s ease-out';
      
      containerRef.current?.appendChild(indicator);
      
      // Fade out and remove after 2 seconds
      setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
          indicator.remove();
        }, 500);
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Error in copyToPng:', error);
      
      // Show error message
      if (containerRef.current) {
        const indicator = document.createElement('div');
        indicator.innerText = 'Error copying to clipboard';
        indicator.style.position = 'absolute';
        indicator.style.top = '40px';
        indicator.style.left = '10px';
        indicator.style.backgroundColor = 'rgba(220,53,69,0.9)';
        indicator.style.color = 'white';
        indicator.style.padding = '5px 10px';
        indicator.style.borderRadius = '4px';
        indicator.style.fontSize = '12px';
        indicator.style.zIndex = '1000';
        indicator.style.transition = 'opacity 0.5s ease-out';
        
        containerRef.current.appendChild(indicator);
        
        // Fade out and remove after 2 seconds
        setTimeout(() => {
          indicator.style.opacity = '0';
          setTimeout(() => {
            indicator.remove();
          }, 500);
        }, 3000);
      }
      
      return false;
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        ...backgroundStyle,
        overflow: 'hidden', // Clip only at the outer container level
        position: 'relative' // For positioning the control buttons
      }}
      className="border-2 border-dashed border-gray-200 rounded-xl p-4 h-full w-full flex items-center justify-center"
    >
      {/* Copy to clipboard button (top left) */}
      {processedSvgs.length > 0 && !isGenerating && (
        <button
          onClick={copyToPng}
          className="absolute top-2 left-2 z-50 bg-white bg-opacity-70 hover:bg-opacity-100 p-1 rounded-md shadow-sm transition-all"
          title="Copy to clipboard"
        >
          <ClipboardCopy size={18} className="text-gray-700" />
        </button>
      )}
      
      {/* Undo/Redo buttons (bottom left) */}
      {customizationHistory.length > 0 && !isGenerating && (
        <div className="absolute bottom-2 left-2 z-50 flex gap-1">
          <button
            onClick={() => handleUndoRedo('undo')}
            disabled={currentHistoryIndex <= 0}
            className={`bg-white bg-opacity-70 hover:bg-opacity-100 p-1 rounded-md shadow-sm transition-all ${
              currentHistoryIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Undo"
          >
            <Undo2 size={18} className="text-gray-700" />
          </button>
          <button
            onClick={() => handleUndoRedo('redo')}
            disabled={currentHistoryIndex >= customizationHistory.length - 1}
            className={`bg-white bg-opacity-70 hover:bg-opacity-100 p-1 rounded-md shadow-sm transition-all ${
              currentHistoryIndex >= customizationHistory.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Redo"
          >
            <Redo2 size={18} className="text-gray-700" />
          </button>
        </div>
      )}

      {isGenerating ? (
        <div className="text-gray-500 animate-pulse">Generating your graffiti...</div>
      ) : processedSvgs.length > 0 ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '200px',
            overflow: 'visible' // Let content overflow this layer
          }}
        >
          {/* Content container */}
          <div
            ref={contentRef}
            style={{
              position: 'absolute',
              left: `${offsetX}px`,
              top: `${offsetY}px`,
              width: `${contentWidth}px`,
              height: `${contentHeight}px`,
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'left top',
              overflow: 'visible' // Let content overflow this layer
            }}
          >
            {/* Render layers with proper z-index order (from bottom to top) */}
            
            {/* 1. Background (lowest z-index) */}
            {/* Background is handled by container background style */}
            
            {/* 2. First render the shield outlines for SHIELD with second-lowest z-index */}
            {customizationOptions.shieldEnabled && processedSvgs.map((item, index) => {
              if (item.isSpace) return null; // Skip spaces for shield effect
              
              // Create a modified version of options with SHIELD settings
              // Note: We're allowing SHIELD to work even when STAMP is disabled
              const shieldOptions = {
                ...customizationOptions,
                // We'll handle shadow effect separately to prevent duplicates
                shadowEffectEnabled: false
              };
              
              return (
                <div
                  key={`shield-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${positions[index]}px`,
                    top: 0,
                    width: '200px',
                    height: '200px',
                    zIndex: 1, // Lowest z-index for shield
                    transform: `scale(${item.scale}) rotate(${item.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    overflow: 'visible'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: createStampSvg(item.svg, item.isSpace, shieldOptions) 
                  }}
                />
              );
            })}
            
            {/* 3. Then render shadow shield layer */}
            {customizationOptions.shadowEffectEnabled && customizationOptions.shieldEnabled && processedSvgs.map((item, index) => {
              if (item.isSpace) return null;
              
              // Create specific options for shadow shield only
              const shadowShieldOptions = {
                ...customizationOptions,
                shieldEnabled: true,
                // Only render the shadow shield, no other effects
                stampEnabled: false, 
                shadowShieldOnly: true
              };
              
              return (
                <div
                  key={`shadow-shield-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${positions[index]}px`,
                    top: 0,
                    width: '200px',
                    height: '200px',
                    zIndex: 2, // z-index for shadow shield
                    transform: `scale(${item.scale}) rotate(${item.rotation || 0}deg) 
                              translate(${customizationOptions.shadowEffectOffsetX}px, ${customizationOptions.shadowEffectOffsetY}px)`,
                    transformOrigin: 'center center',
                    overflow: 'visible'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: customizeSvg(item.svg, item.isSpace, shadowShieldOptions) 
                  }}
                />
              );
            })}
            
            {/* 4. Then render shadow layer */}
            {customizationOptions.shadowEffectEnabled && processedSvgs.map((item, index) => {
              if (item.isSpace) return null;
              
              // Create specific options for shadow only
              const shadowOptions = {
                ...customizationOptions,
                shieldEnabled: false, // No shield for shadow
                shadowOnly: true
              };
              
              return (
                <div
                  key={`shadow-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${positions[index]}px`,
                    top: 0,
                    width: '200px',
                    height: '200px',
                    zIndex: 3, // z-index for shadow
                    transform: `scale(${item.scale}) rotate(${item.rotation || 0}deg) 
                              translate(${customizationOptions.shadowEffectOffsetX}px, ${customizationOptions.shadowEffectOffsetY}px)`,
                    transformOrigin: 'center center',
                    overflow: 'visible'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: customizeSvg(item.svg, item.isSpace, shadowOptions) 
                  }}
                />
              );
            })}
            
            {/* 5. Then render stamp outlines */}
            {customizationOptions.stampEnabled && processedSvgs.map((item, index) => {
              if (item.isSpace) return null;
              
              // Create options for STAMP only with no shield
              const stampOnlyOptions = {
                ...customizationOptions,
                shieldEnabled: false,
                shadowEffectEnabled: false
              };
              
              return (
                <div
                  key={`stamp-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${positions[index]}px`,
                    top: 0,
                    width: '200px',
                    height: '200px',
                    zIndex: 4, // z-index for stamp
                    transform: `scale(${item.scale}) rotate(${item.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    overflow: 'visible'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: createStampSvg(item.svg, item.isSpace, stampOnlyOptions) 
                  }}
                />
              );
            })}
            
            {/* 6. Finally render the main content layer with highest z-index */}
            {processedSvgs.map((item, index) => {
              // Skip rendering spaces visually, but keep their position
              if (item.isSpace) {
                return (
                  <div
                    key={`main-${index}`}
                    style={{
                      position: 'absolute',
                      left: `${positions[index]}px`,
                      top: 0,
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                      overflow: 'visible'
                    }}
                  />
                );
              }
              
              // Create options for main content only - no stamp, shield or shadow
              const contentOnlyOptions = {
                ...customizationOptions,
                stampEnabled: false,
                shieldEnabled: false,
                shadowEffectEnabled: false,
                contentOnly: true
              };
              
              return (
                <div
                  key={`main-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${positions[index]}px`,
                    top: 0,
                    width: '200px',
                    height: '200px',
                    zIndex: 5 + (processedSvgs.length - index), // Highest z-index for main content
                    transform: `scale(${item.scale}) rotate(${item.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    overflow: 'visible' // Important: allow effects to extend beyond boundaries
                  }}
                  className="hover:z-50"
                  dangerouslySetInnerHTML={{ 
                    __html: customizeSvg(item.svg, item.isSpace, contentOnlyOptions) 
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center">
          <p className="text-xl mb-2">Your graffiti will appear here</p>
          <p className="text-sm">Enter some text and hit generate!</p>
        </div>
      )}
    </div>
  );
};
