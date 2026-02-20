import { useEffect, useRef } from 'react';
import { formatTime } from '../utils/analysis';

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default function TranscriptViewer({
  transcript,
  importantIndexes,
  silenceSegments,
  scrollToIndex,
  examMode
}) {
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (scrollToIndex !== null && transcriptRef.current) {
      const el = transcriptRef.current.querySelector(`[data-original-index="${scrollToIndex}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-indigo-400/60');
        setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400/60'), 2000);
      }
    }
  }, [scrollToIndex]);

  const isInSilence = (ts) => silenceSegments.some(s => ts >= s.start && ts <= s.end);
  const isImportant = (origIdx) => importantIndexes.includes(origIdx);

  if (!transcript || transcript.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6 animate-scale-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              {examMode ? 'Exam-Relevant Content' : 'Transcript'}
            </h2>
            <p className="text-xs text-gray-500">{transcript.length} sentences</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <StarIcon />
            <span className="text-xs text-gray-400">{importantIndexes.length} key</span>
          </div>
        </div>
      </div>

      {/* Transcript list */}
      <div ref={transcriptRef} className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
        {transcript.map((item, index) => {
          const origIdx = item.originalIndex ?? index;
          const important = isImportant(origIdx);
          const silence = isInSilence(item.timestamp);
          const confidence = item.confidence || 0.9;

          return (
            <div
              key={item.id || index}
              data-index={index}
              data-original-index={origIdx}
              className={`group relative rounded-xl px-4 py-3 transition-all duration-200 ${
                important
                  ? 'bg-yellow-500/[0.06] border-l-2 border-yellow-400/70'
                  : 'bg-white/[0.02] border-l-2 border-transparent hover:bg-white/[0.04]'
              } ${silence ? 'opacity-40' : ''}`}
            >
              {/* Top row */}
              <div className="flex items-center gap-2 mb-1.5">
                {important && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/15 text-yellow-300">
                    <StarIcon /> Key
                  </span>
                )}
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-gray-600">
                  <ClockIcon />
                  {formatTime(item.timestamp || 0)}
                </span>
              </div>

              {/* Text */}
              <p className={`text-[13px] leading-relaxed ${important ? 'text-gray-100' : 'text-gray-400'}`}>
                {item.text}
              </p>

              {/* Confidence bar */}
              <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      confidence > 0.9 ? 'bg-emerald-500/60' : confidence > 0.8 ? 'bg-yellow-500/60' : 'bg-red-500/60'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-8 text-right">{(confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
