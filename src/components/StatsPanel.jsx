import { useState, useMemo } from 'react';
import { formatTime } from '../utils/analysis';

export default function StatsPanel({ transcript, importantIndexes, silenceSegments, videoDuration, conceptDensitySegments }) {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo(() => {
    const totalSilence = silenceSegments.reduce((sum, s) => sum + s.duration, 0);
    const silencePct = videoDuration > 0 ? ((totalSilence / videoDuration) * 100).toFixed(1) : 0;
    const speechTime = videoDuration - totalSilence;
    const speechPct = videoDuration > 0 ? ((speechTime / videoDuration) * 100).toFixed(1) : 0;

    const allWords = transcript.map(t => t.text).join(' ').split(/\s+/);
    const totalWords = allWords.length;
    const avgWordsPerSentence = transcript.length > 0 ? (totalWords / transcript.length).toFixed(1) : 0;
    const wpm = speechTime > 0 ? Math.round(totalWords / (speechTime / 60)) : 0;

    // Top keywords
    const wordFreq = {};
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'to', 'of', 'and', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'this', 'that', 'it', 'as', 'or', 'we', 'our', 'its', 'will', 'can']);
    allWords.forEach(w => {
      const word = w.toLowerCase().replace(/[^a-z]/g, '');
      if (word.length > 2 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    const maxKeywordFreq = topKeywords.length > 0 ? topKeywords[0][1] : 1;

    // Avg confidence
    const avgConfidence = transcript.length > 0
      ? (transcript.reduce((sum, t) => sum + (t.confidence || 0.9), 0) / transcript.length * 100).toFixed(1)
      : 0;

    // Peak density segment
    const peakDensity = conceptDensitySegments.length > 0
      ? conceptDensitySegments.reduce((max, s) => s.normalizedScore > max.normalizedScore ? s : max, conceptDensitySegments[0])
      : null;

    return {
      totalSilence, silencePct, speechTime, speechPct,
      totalWords, avgWordsPerSentence, wpm,
      topKeywords, maxKeywordFreq,
      avgConfidence, peakDensity,
    };
  }, [transcript, importantIndexes, silenceSegments, videoDuration, conceptDensitySegments]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'timeline', label: 'Silence' },
  ];

  return (
    <div className="glass rounded-2xl p-6 animate-scale-in relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Analytics</h2>
          <p className="text-xs text-gray-500">Lecture statistics & insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Duration', value: formatTime(videoDuration), icon: '⏱', color: 'text-blue-400' },
            { label: 'Words/min', value: stats.wpm, icon: '💬', color: 'text-indigo-400' },
            { label: 'Key Points', value: importantIndexes.length, icon: '⭐', color: 'text-yellow-400' },
            { label: 'Sentences', value: transcript.length, icon: '📝', color: 'text-purple-400' },
            { label: 'Confidence', value: `${stats.avgConfidence}%`, icon: '🎯', color: 'text-emerald-400' },
            { label: 'Total Words', value: stats.totalWords, icon: '📊', color: 'text-cyan-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{stat.icon}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="space-y-2">
          {stats.topKeywords.map(([word, count]) => (
            <div key={word} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-20 truncate font-medium">{word}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500/70 to-purple-500/70 rounded-full transition-all duration-500"
                  style={{ width: `${(count / stats.maxKeywordFreq) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-600 w-6 text-right tabular-nums">{count}</span>
            </div>
          ))}
          {stats.topKeywords.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">No keywords found</p>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Pie-style stats */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.05)" />
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" stroke="#6366f1"
                    strokeDasharray={`${stats.speechPct * 0.88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {stats.speechPct}%
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Speech</p>
            </div>
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.05)" />
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" stroke="#f59e0b"
                    strokeDasharray={`${stats.silencePct * 0.88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-yellow-400">
                  {stats.silencePct}%
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Silence</p>
            </div>
          </div>

          {/* Silence segments list */}
          <div className="max-h-32 overflow-y-auto space-y-1">
            {silenceSegments.slice(0, 10).map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] text-xs">
                <span className="text-gray-500">
                  {formatTime(s.start)} → {formatTime(s.end)}
                </span>
                <span className="text-yellow-400/70 font-medium tabular-nums">
                  {s.duration.toFixed(1)}s
                </span>
              </div>
            ))}
            {silenceSegments.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-4">No silence detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
