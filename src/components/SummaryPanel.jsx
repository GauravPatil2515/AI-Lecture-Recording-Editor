export default function SummaryPanel({ summary }) {
  return (
    <div className="glass rounded-2xl p-6 animate-scale-in relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">AI Summary</h2>
          <p className="text-xs text-gray-500">Key points from your lecture</p>
        </div>
        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20">
          Auto-generated
        </span>
      </div>

      {/* Summary text */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
        <p className="text-[13px] text-gray-300 leading-relaxed">{summary}</p>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
        {[
          { label: 'Words', value: summary.split(/\s+/).length },
          { label: 'Sentences', value: summary.split(/[.!?]+/).filter(s => s.trim()).length },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{s.label}:</span>
            <span className="text-xs font-semibold text-indigo-400">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
