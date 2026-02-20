import { useEffect, useRef, useState, useMemo } from 'react';
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

const BookmarkIcon = ({ filled }) => (
  <svg className={`w-3.5 h-3.5 transition-colors ${filled ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`}
    fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
  </svg>
);

export default function TranscriptViewer({
  transcript,
  importantIndexes,
  silenceSegments,
  scrollToIndex,
  examMode,
  onSeekTo,
  currentVideoTime,
}) {
  const transcriptRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

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

  // Auto-highlight current sentence based on video time
  useEffect(() => {
    if (currentVideoTime === undefined || currentVideoTime === null) return;
    for (let i = transcript.length - 1; i >= 0; i--) {
      if (transcript[i].timestamp <= currentVideoTime) {
        setActiveIndex(i);
        return;
      }
    }
    setActiveIndex(null);
  }, [currentVideoTime, transcript]);

  const isInSilence = (ts) => silenceSegments.some(s => ts >= s.start && ts <= s.end);
  const isImportant = (origIdx) => importantIndexes.includes(origIdx);

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter by search and bookmarks
  const filteredTranscript = useMemo(() => {
    let items = transcript;
    if (showBookmarksOnly) {
      items = items.filter(item => bookmarks.has(item.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => item.text.toLowerCase().includes(q));
    }
    return items;
  }, [transcript, searchQuery, showBookmarksOnly, bookmarks]);

  // Highlight search matches in text
  const highlightText = (text) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-indigo-500/30 text-indigo-200 rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  const handleExport = () => {
    const content = filteredTranscript
      .map(item => `[${formatTime(item.timestamp)}] ${item.text}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript${examMode ? '-exam' : ''}${showBookmarksOnly ? '-bookmarked' : ''}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!transcript || transcript.length === 0) return null;

  const searchMatches = searchQuery.trim() ? filteredTranscript.length : null;

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
            <p className="text-xs text-gray-500">
              {filteredTranscript.length} of {transcript.length} sentences
              {searchMatches !== null && ` • ${searchMatches} matches`}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <StarIcon />
            <span className="text-xs text-gray-400">{importantIndexes.length} key</span>
          </div>
          {bookmarks.size > 0 && (
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                showBookmarksOnly
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <BookmarkIcon filled={showBookmarksOnly} />
              {bookmarks.size}
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-medium text-gray-400 transition-colors"
            title="Export transcript"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transcript..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Transcript list */}
      <div ref={transcriptRef} className="max-h-[480px] overflow-y-auto space-y-2 pr-1">
        {filteredTranscript.map((item, index) => {
          const origIdx = item.originalIndex ?? index;
          const important = isImportant(origIdx);
          const silence = isInSilence(item.timestamp);
          const confidence = item.confidence || 0.9;
          const isBookmarked = bookmarks.has(item.id);
          const isActive = activeIndex !== null && index === activeIndex;

          return (
            <div
              key={item.id || index}
              data-index={index}
              data-original-index={origIdx}
              className={`group relative rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-500/[0.1] border-l-2 border-indigo-400'
                  : important
                    ? 'bg-yellow-500/[0.06] border-l-2 border-yellow-400/70'
                    : 'bg-white/[0.02] border-l-2 border-transparent hover:bg-white/[0.04]'
              } ${silence ? 'opacity-40' : ''}`}
              onClick={() => onSeekTo?.(item.timestamp)}
            >
              {/* Top row */}
              <div className="flex items-center gap-2 mb-1.5">
                {important && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/15 text-yellow-300">
                    <StarIcon /> Key
                  </span>
                )}
                {silence && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/15 text-gray-400">
                    Silence
                  </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {/* Bookmark button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    <BookmarkIcon filled={isBookmarked} />
                  </button>

                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                    <ClockIcon />
                    {formatTime(item.timestamp || 0)}
                  </span>
                </div>
              </div>

              {/* Text */}
              <p className={`text-[13px] leading-relaxed ${
                isActive ? 'text-white' : important ? 'text-gray-100' : 'text-gray-400'
              }`}>
                {highlightText(item.text)}
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

        {filteredTranscript.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <svg className="w-10 h-10 mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-sm">No results found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
