export default function ExamModeToggle({ examMode, onToggle }) {
  return (
    <button
      onClick={() => onToggle(!examMode)}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 border cursor-pointer ${
        examMode
          ? 'bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
          : 'glass border-white/5 hover:border-white/10'
      }`}
      aria-label="Toggle exam mode"
    >
      {/* Icon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
        examMode ? 'bg-emerald-500/20' : 'bg-white/5'
      }`}>
        <svg className={`w-3.5 h-3.5 transition-colors ${examMode ? 'text-emerald-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      </div>

      <span className={`text-sm font-medium transition-colors ${examMode ? 'text-emerald-300' : 'text-gray-400'}`}>
        Exam Mode
      </span>

      {/* Toggle pill */}
      <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
        examMode ? 'bg-emerald-500' : 'bg-gray-700'
      }`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          examMode ? 'translate-x-4' : 'translate-x-0'
        }`} />
      </div>
    </button>
  );
}
