import React from 'react';
import { DifferenceItem } from '../types';

interface DifferenceOverlayProps {
  imageSrc: string;
  differences: DifferenceItem[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  title: string;
}

export const DifferenceOverlay: React.FC<DifferenceOverlayProps> = ({ 
  imageSrc, 
  differences, 
  hoveredId, 
  setHoveredId,
  title
}) => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">{title}</h3>
      <div className="relative w-full h-full border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm">
        {/* Container for Image + Overlay */}
        <div className="relative inline-block w-full h-full">
          <img 
            src={imageSrc} 
            alt="Analyzed" 
            className="w-full h-full object-contain block"
          />
          
          {/* Overlay Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {differences.map((diff) => {
              // box_2d is [ymin, xmin, ymax, xmax] in 0-1000 scale
              const [ymin, xmin, ymax, xmax] = diff.box_2d;
              
              const top = ymin / 10;
              const left = xmin / 10;
              const height = (ymax - ymin) / 10;
              const width = (xmax - xmin) / 10;

              const isHovered = hoveredId === diff.id;

              return (
                <div
                  key={diff.id}
                  className={`absolute border-2 transition-all duration-200 pointer-events-auto cursor-help ${
                    isHovered 
                      ? 'border-red-500 bg-red-500/20 z-20 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'border-yellow-400/80 bg-yellow-400/10 z-10 hover:border-yellow-500'
                  }`}
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                  }}
                  onMouseEnter={() => setHoveredId(diff.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                    {isHovered && (
                        <div className="absolute -top-8 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                            {diff.id}
                        </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};