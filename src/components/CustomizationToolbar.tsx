import React, { useState } from 'react';
import { CustomizationOptions } from '../types';
import { PaintBucket, Square, Stamp, ChevronDown, ChevronUp, Palette, Star, Sparkles, Moon, Sun, Shield, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface StylePreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  settings: Partial<CustomizationOptions>;
}

interface CustomizationToolbarProps {
  options: CustomizationOptions;
  onChange: (newOptions: CustomizationOptions) => void;
}

export const CustomizationToolbar: React.FC<CustomizationToolbarProps> = ({ 
  options, 
  onChange
}) => {
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  
  const handleChange = (updatedValues: Partial<CustomizationOptions>) => {
    onChange({ ...options, ...updatedValues });
  };

  // Style presets
  const stylePresets: StylePreset[] = [
    {
      id: 'CLASSIC',
      name: 'CLASSIC',
            settings: {
        backgroundEnabled: false,
        fillEnabled: true,
        fillColor: '#ffffff',
        stampEnabled: true,
        stampColor: '#000000',
        stampWidth: 60,
        shineEnabled: false,
        shineColor: '#ffffff',
        shineOpacity: 1,
        shieldEnabled: true,
        shieldColor: '#f00000', // Red shield
        shieldWidth: 40,
        shadowEffectEnabled: true,
        shadowEffectOffsetX: -8,
        shadowEffectOffsetY: 2
      }
    },
    {
      id: 'SLAP',
      name: 'SLAP',
      settings: {
        backgroundEnabled: true,
        backgroundColor: '#f00000',
        fillEnabled: true,
        fillColor: '#ffffff',
        stampEnabled: true,
        stampColor: '#000000',
        stampWidth: 50,
        shineEnabled: false,
        shieldEnabled: true,
        shieldColor: '#ffffff',
        shieldWidth: 50
      }
    },
    {
      id: 'IGLOO',
      name: 'IGLOO',
      settings: {
        backgroundEnabled: true,
        backgroundColor: '#0a2e52',
        fillEnabled: true,
        fillColor: '#ffffff',
        stampEnabled: true,
        stampColor: '#00aeff',
        stampWidth: 40,
        shineEnabled: false,
        shieldEnabled: true,
        shieldColor: '#002171',
        shieldWidth: 15
      }
    },
    {
      id: 'SUNKIST',
      name: 'SUNKIST',
      settings: {
        backgroundEnabled: true,
        backgroundColor: '#ffeb3b',
        fillEnabled: true,
        fillColor: '#ff430a',
        stampEnabled: true,
        stampColor: '#fff176',
        stampWidth: 60,
        shineEnabled: false,
        shieldEnabled: true,
        shieldColor: '#ff430a',
        shieldWidth: 15
      }
    },
    {
      id: 'CONCRETE',
      name: 'CONCRETE',
      settings: {
        backgroundEnabled: true,
        backgroundColor: '#212121',
        fillEnabled: true,
        fillColor: '#e0e0e0',
        stampEnabled: true,
        stampColor: '#000000',
        stampWidth: 40,
        shineEnabled: false,
        shieldEnabled: true,
        shieldColor: '#f44336', // Red shield
        shieldWidth: 30,
        shadowEffectEnabled: true,
        shadowEffectOffsetX: -12,
        shadowEffectOffsetY: 12
      }
    }
  ];

  // Apply a preset's settings without closing the dropdown
  const applyPreset = (preset: StylePreset) => {
    onChange({ ...options, ...preset.settings });
  };

  // Toggle the preset dropdown section
  const togglePresetDropdown = () => {
    setIsPresetDropdownOpen(!isPresetDropdownOpen);
  };

  return (
    <div className="pt-1">
      {/* Main Controls - Responsive layout with custom grid */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2">
        {/* Background Color - 10% width on large screens */}
        <div className="bg-gray-100 rounded p-2 md:col-span-2" style={{ minWidth: "0" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="bg-toggle"
                checked={options.backgroundEnabled}
                onChange={(e) => handleChange({ backgroundEnabled: e.target.checked })}
                className="h-3 w-3"
              />
              <label htmlFor="bg-toggle" className="text-xs">BG</label>
            </div>
            <div className="ml-1 flex-grow">
              <input
                type="color"
                value={options.backgroundColor}
                onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                disabled={!options.backgroundEnabled}
                className={`h-4 w-full rounded-sm ${!options.backgroundEnabled ? 'opacity-50' : ''}`}
              />
            </div>
          </div>
        </div>
        
{/* Fill Color - 10% width on large screens */}
<div className="bg-gray-100 rounded p-2 md:col-span-2" style={{ minWidth: "0" }}>
  <div className="flex items-center justify-between">
    {/* Removed the checkbox toggle */}
    <label htmlFor="fill-color" className="text-xs">FILL</label>
    <div className="ml-1 flex-grow">
      <input
        type="color"
        id="fill-color"
        value={options.fillColor}
        onChange={(e) => handleChange({ fillColor: e.target.value })}
        // Removed disabled prop to ensure it's always enabled
        className="h-4 w-full rounded-sm"
      />
    </div>
  </div>
</div>

        
        {/* OUTLINE (STAMP) effect - 20% width on large screens */}
        <div className="bg-gray-100 rounded p-2 md:col-span-3" style={{ minWidth: "0" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="stamp-toggle"
                checked={options.stampEnabled}
                onChange={(e) => handleChange({ stampEnabled: e.target.checked })}
                className="h-3 w-3"
              />
              <label htmlFor="stamp-toggle" className="text-xs">OUTLINE</label>
            </div>
            <div className="ml-1 flex-grow">
              <input
                type="color"
                value={options.stampColor}
                onChange={(e) => handleChange({ stampColor: e.target.value })}
                disabled={!options.stampEnabled}
                className={`h-4 w-full rounded-sm ${!options.stampEnabled ? 'opacity-50' : ''}`}
              />
            </div>
          </div>
          
          {/* Size slider */}
          <div className="mt-1 pl-4">
            <input
              type="range"
              min="50"
              max="150"
              value={options.stampWidth}
              onChange={(e) => handleChange({ stampWidth: parseInt(e.target.value) })}
              disabled={!options.stampEnabled}
              className={`w-full h-1 ${!options.stampEnabled ? 'opacity-50' : ''}`}
            />
          </div>
        </div>
        
        {/* AURA Effect (SHIELD) - 20% width on large screens */}
        <div className="bg-gray-100 rounded p-2 md:col-span-3" style={{ minWidth: "0" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="shield-toggle"
                checked={options.shieldEnabled}
                onChange={(e) => handleChange({ shieldEnabled: e.target.checked })}
                className="h-3 w-3"
              />
              <label htmlFor="shield-toggle" className="text-xs">AURA</label>
            </div>
            <div className="ml-1 flex-grow">
              <input
                type="color"
                value={options.shieldColor}
                onChange={(e) => handleChange({ shieldColor: e.target.value })}
                disabled={!options.shieldEnabled}
                className={`h-4 w-full rounded-sm ${!options.shieldEnabled ? 'opacity-50' : ''}`}
              />
            </div>
          </div>
          
          {/* Size slider */}
          <div className="mt-1 pl-4">
            <input
              type="range"
              min="5"
              max="150"
              value={options.shieldWidth}
              onChange={(e) => handleChange({ shieldWidth: parseInt(e.target.value) })}
              disabled={!options.shieldEnabled}
              className={`w-full h-1 ${!options.shieldEnabled ? 'opacity-50' : ''}`}
            />
          </div>
        </div>
        
        {/* Shadow Effect - 40% width on large screens */}
        <div className="bg-gray-100 rounded p-2 col-span-2 md:col-span-2" style={{ minWidth: "0", overflow: "hidden" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="shadow-effect-toggle"
                checked={options.shadowEffectEnabled}
                onChange={(e) => handleChange({ shadowEffectEnabled: e.target.checked })}
                className="h-3 w-3"
              />
              <label htmlFor="shadow-effect-toggle" className="text-xs">SHADOW</label>
            </div>
          </div>
          
          {/* Shadow sliders with improved layout */}
          {options.shadowEffectEnabled && (
            <div className="mt-1 pl-4 pr-2 space-y-2 w-full">
              <div className="flex items-center w-full">
                <ArrowLeft className="w-3 h-3 text-gray-400 flex-shrink-0 mr-1" />
                <input
                  type="range"
                  min="-40"
                  max="70"
                  value={options.shadowEffectOffsetX}
                  onChange={(e) => handleChange({ shadowEffectOffsetX: parseInt(e.target.value) })}
                  className="flex-1 w-full h-1 min-w-0"
                />
                <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
              </div>
              
              <div className="flex items-center w-full">
                <ArrowUp className="w-3 h-3 text-gray-400 flex-shrink-0 mr-1" />
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={options.shadowEffectOffsetY}
                  onChange={(e) => handleChange({ shadowEffectOffsetY: parseInt(e.target.value) })}
                  className="flex-1 w-full h-1 min-w-0"
                />
                <ArrowDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Style Presets Button */}
      <div className="mt-2">
        <button 
          onClick={togglePresetDropdown}
          className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 p-1 rounded w-full text-xs transition-colors"
        >
          <Palette className="w-3 h-3 text-gray-600" />
          <span className="text-gray-700">Style Presets</span>
          {isPresetDropdownOpen ? 
            <ChevronUp className="w-3 h-3 text-gray-600" /> : 
            <ChevronDown className="w-3 h-3 text-gray-600" />
          }
        </button>
      </div>
      
      {/* Style Presets Dropdown Content */}
      {isPresetDropdownOpen && (
        <div className="mt-1 p-2 border border-gray-200 rounded bg-white shadow-sm">
          <div className="flex flex-wrap gap-2">
            {stylePresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-xs transition-colors"
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};