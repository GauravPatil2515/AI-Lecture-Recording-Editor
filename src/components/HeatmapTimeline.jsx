import { useState, useRef } from 'react';
import { getHeatmapColor } from '../utils/analysis';

export default function HeatmapTimeline({ segments, onSegmentClick, selectedSegment }) {
  const containerRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!segments || segments.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6 animate-scale-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Concept Density</h2>
            <p className="text-xs text-gray-500">Click a bar to jump to that section</p>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3">
          {[
            { color: 'bg-blue-500', label: 'Low' },
            { color: 'bg-yellow-500', label: 'Mid' },
            { color: 'bg-red-500', label: 'High' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
              <span className="text-[10px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap bars */}
      <div ref={containerRef} className="flex gap-1 h-28 items-end">
        {segments.map((segment, idx) => {
          const score = segment.normalizedScore || 0;
          const isSelected = selectedSegment?.segment === segment.segment;
          const isHovered = hoveredIdx === idx;
          const color = getHeatmapColor(score);

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 relative">
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 glass rounded-lg px-3 py-2 pointer-events-none z-50 whitespace-nowrap animate-fade-in">
                  <p className="text-[11px] text-white font-medium">Seg {idx + 1}</p>
                  <p className="text-[10px] text-gray-400">Score: {(score * 100).toFixed(0)}%</p>
                </div>
              )}
              {/* Bar */}
              <div
                className={`w-full rounded-t-md cursor-pointer transition-all duration-300 ${color} ${
                  isSelected ? 'ring-2 ring-white/80 brightness-125' : 'hover:brightness-125'
                }`}
                style={{
                  height: `${Math.max(8, score * 100)}%`,
                  opacity: score === 0 ? 0.3 : 0.85,
                }}
                onClick={() => onSegmentClick(segment)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </div>
          );
        })}
      </div>

      {/* Selected segment detail */}
      {selectedSegment && (
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">
              Segment {selectedSegment.segment + 1}
            </span>
            <span className="text-xl font-bold gradient-text">
              {(selectedSegment.normalizedScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Keywords', value: selectedSegment.keywordScore || 0, color: 'text-indigo-400' },
              { label: 'Repetition', value: selectedSegment.repetitionScore || 0, color: 'text-yellow-400' },
              { label: 'Energy', value: (selectedSegment.energyScore || 0).toFixed(1), color: 'text-red-400' },
            ].map((m) => (
              <div key={m.label} className="text-center p-2 rounded-lg bg-white/[0.03]">
                <p className="text-[10px] text-gray-500 mb-1">{m.label}</p>
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
