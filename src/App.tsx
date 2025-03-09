import { useEffect, useState } from 'react';
import { StyleSelector } from './components/StyleSelector';
import { InputForm } from './components/InputForm';
import { GraffitiDisplay } from './components/GraffitiDisplay';
import { CustomizationToolbar } from './components/CustomizationToolbar';
import { useGraffitiGenerator } from './hooks/useGraffitiGenerator';
import { GRAFFITI_STYLES } from './data/styles';
import { CustomizationOptions } from './types';

function App() {
  const {
    inputText,
    setInputText,
    isGenerating,
    error,
    selectedStyle,
    setSelectedStyle,
    processedSvgs,
    generateGraffiti,
    positions,
    contentWidth,
    contentHeight,
    containerScale,
  } = useGraffitiGenerator();

  // Initialize customization options
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>({
    // Background options
    backgroundEnabled: false,
    backgroundColor: '#ffffff',
    
    // Fill options
    fillEnabled: true,
    fillColor: '#ffffff',
    
    // Stroke options (legacy, now disabled by default)
    strokeEnabled: false,
    strokeColor: '#ff0000',
    strokeWidth: 45,
    
    // Shadow options (legacy, now disabled by default)
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowOpacity: 1,
    shadowOffsetX: -400,
    shadowOffsetY: 5,
    shadowBlur: 0,
    
    // Path expansion options (formerly STAMP)
    stampEnabled: true,             // Enable by default
    stampColor: '#000000',          // Black expansion by default
    stampWidth: 75,                // Default expansion amount
    
    // Shine effect options
    shineEnabled: false,
    shineColor: '#ffffff',
    shineOpacity: 1,
    
    // Shadow effect options (using the paths in the SVG)
    shadowEffectEnabled: false,
    shadowEffectOffsetX: -15,         // Default horizontal offset
    shadowEffectOffsetY: 8,          // Default vertical offset

    // Shield effect options
    shieldEnabled: false,
    shieldColor: '#3f51b5', // Default shield color (blue)
    shieldWidth: 15, // Default width
  });

  // History state for undo/redo functionality
  const [customizationHistory, setCustomizationHistory] = useState<CustomizationOptions[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Add current options to history when they change
  const handleCustomizationChange = (newOptions: CustomizationOptions) => {
    // Create a new history entry
    const newHistory = customizationHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newOptions);
    
    // Update history and current index
    setCustomizationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    
    // Update current options
    setCustomizationOptions(newOptions);
  };

  // Handle undo/redo
  const handleUndoRedo = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < customizationHistory.length) {
      setCurrentHistoryIndex(newIndex);
      setCustomizationOptions(customizationHistory[newIndex]);
    }
  };

  // Auto-generate when style changes or when component mounts
  useEffect(() => {
    if (inputText.trim()) {
      generateGraffiti(inputText);
    }
  }, [selectedStyle]); // Only re-run when selected style changes

  // Initialize history when customizationOptions is first set up
  useEffect(() => {
    if (customizationHistory.length === 0) {
      setCustomizationHistory([customizationOptions]);
      setCurrentHistoryIndex(0);
    }
  }, []);

  // Handle style change with custom handler to ensure we update style before regenerating
  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId);
    // Note: The useEffect will handle regeneration
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-yellow-100 p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-1 md:mb-2">REDACTED</h1>
          <p className="text-base md:text-xl text-gray-600">
            Step up to the plate and drop a heater
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          {/* Style Selector with reduced margin */}
          <div className="mb-4">
            <StyleSelector 
              styles={GRAFFITI_STYLES} 
              selectedStyle={selectedStyle} 
              onSelectStyle={handleStyleChange} 
            />
          </div>
          
          {/* Input Field & Generate Button with reduced margin */}
          <div className="mb-3">
            <InputForm 
              inputText={inputText} 
              setInputText={setInputText} 
              isGenerating={isGenerating} 
              onGenerate={generateGraffiti} 
            />
          </div>
          
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {/* Very tight vertical spacing between display and controls */}
          {/* No spacing between display and controls */}
          <div className="flex flex-col">
            <div className="w-full h-[250px] md:h-[300px]">
              <GraffitiDisplay 
                isGenerating={isGenerating} 
                processedSvgs={processedSvgs} 
                positions={positions}
                contentWidth={contentWidth}
                contentHeight={contentHeight}
                containerScale={containerScale}
                customizationOptions={customizationOptions}
                customizationHistory={customizationHistory}
                currentHistoryIndex={currentHistoryIndex}
                onUndoRedo={handleUndoRedo}
              />
            </div>
            
            {/* Customization toolbar attached directly to display */}
            <CustomizationToolbar 
              options={customizationOptions}
              onChange={handleCustomizationChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
