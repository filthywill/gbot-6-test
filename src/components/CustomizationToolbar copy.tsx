import React from 'react';
import { CustomizationOptions } from '../types';
import { PaintBucket, Square, CircleDashed, Layers } from 'lucide-react';

interface CustomizationToolbarProps {
  options: CustomizationOptions;
  onChange: (newOptions: CustomizationOptions) => void;
}

export const CustomizationToolbar: React.FC<CustomizationToolbarProps> = ({ 
  options, 
  onChange
}) => {
  const handleChange = (updatedValues: Partial<CustomizationOptions>) => {
    onChange({ ...options, ...updatedValues });
  };

  return (
    <div className="mt-4 p-3 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Customize</h3>
      
      <div className="flex flex-wrap justify-start gap-4">
        {/* Background Color */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.backgroundEnabled}
            onChange={(e) => handleChange({ backgroundEnabled: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Square className="w-3 h-3" />
            BG
          </label>
          <input
            type="color"
            value={options.backgroundColor}
            onChange={(e) => handleChange({ backgroundColor: e.target.value })}
            disabled={!options.backgroundEnabled}
            className={`h-7 w-8 rounded border border-gray-300 ${!options.backgroundEnabled ? 'opacity-50' : ''}`}
          />
        </div>
        
        {/* Fill Color */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.fillEnabled}
            onChange={(e) => handleChange({ fillEnabled: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <PaintBucket className="w-3 h-3" />
            Fill
          </label>
          <input
            type="color"
            value={options.fillColor}
            onChange={(e) => handleChange({ fillColor: e.target.value })}
            disabled={!options.fillEnabled}
            className={`h-7 w-8 rounded border border-gray-300 ${!options.fillEnabled ? 'opacity-50' : ''}`}
          />
        </div>
        
        {/* Stroke */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.strokeEnabled}
            onChange={(e) => handleChange({ strokeEnabled: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <CircleDashed className="w-3 h-3" />
            Outline
          </label>
          <input
            type="color"
            value={options.strokeColor}
            onChange={(e) => handleChange({ strokeColor: e.target.value })}
            disabled={!options.strokeEnabled}
            className={`h-7 w-8 rounded border border-gray-300 ${!options.strokeEnabled ? 'opacity-50' : ''}`}
          />
        </div>
        
        {/* Shadow */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.shadowEnabled}
            onChange={(e) => handleChange({ shadowEnabled: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Layers className="w-3 h-3" />
            3D
          </label>
          <input
            type="color"
            value={options.shadowColor}
            onChange={(e) => handleChange({ shadowColor: e.target.value })}
            disabled={!options.shadowEnabled}
            className={`h-7 w-8 rounded border border-gray-300 ${!options.shadowEnabled ? 'opacity-50' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};