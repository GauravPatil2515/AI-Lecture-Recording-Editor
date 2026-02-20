import { useState, useEffect, useCallback } from 'react';
import UploadSection from './components/UploadSection';
import VideoPlayer from './components/VideoPlayer';
import TranscriptViewer from './components/TranscriptViewer';
import HeatmapTimeline from './components/HeatmapTimeline';
import SummaryPanel from './components/SummaryPanel';
import StatsPanel from './components/StatsPanel';
import ExamModeToggle from './components/ExamModeToggle';
import {
  extractAudioFromVideo,
  detectSilence,
  generateMockTranscript,
  identifyImportantSentences,
  calculateConceptDensity,
  generateSummary,
  filterExamRelevant,
} from './utils/analysis';

function App() {
  // Video and Audio State
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [audioData, setAudioData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingStep, setProcessingStep] = useState(0);

  // Transcript State
  const [fullTranscript, setFullTranscript] = useState([]);
  const [importantIndexes, setImportantIndexes] = useState([]);
  const [summary, setSummary] = useState('');

  // Analysis State
  const [silenceSegments, setSilenceSegments] = useState([]);
  const [conceptDensitySegments, setConceptDensitySegments] = useState([]);

  // UI State
  const [examMode, setExamMode] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [scrollToIndex, setScrollToIndex] = useState(null);
  const [seekTo, setSeekTo] = useState(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [activeTab, setActiveTab] = useState('transcript');

  const totalSteps = 6;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
        if (videoFile) setExamMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoFile]);

  /**
   * Handle video upload and begin analysis pipeline
   */
  const handleVideoUpload = async (file) => {
    try {
      setIsProcessing(true);
      setProcessingStep(1);
      setProcessingStatus('Loading video...');
      setVideoFile(file);

      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration;
          setVideoDuration(duration);
          URL.revokeObjectURL(objectUrl);

          setProcessingStep(2);
          setProcessingStatus('Extracting audio...');
          const audioResult = await extractAudioFromVideo(file);
          setAudioData(audioResult.samples);

          setProcessingStep(3);
          setProcessingStatus('Analyzing audio for silence...');
          const silence = detectSilence(audioResult.samples, audioResult.sampleRate, 0.02, 0.5);
          setSilenceSegments(silence);

          setProcessingStep(4);
          setProcessingStatus('Generating transcript...');
          const transcript = generateMockTranscript(Math.floor(duration));
          setFullTranscript(transcript);

          setProcessingStep(5);
          setProcessingStatus('Analyzing content importance...');
          const important = identifyImportantSentences(transcript);
          setImportantIndexes(important);

          const conceptDensity = calculateConceptDensity(transcript, 3);
          setConceptDensitySegments(conceptDensity);

          setProcessingStep(6);
          setProcessingStatus('Generating summary...');
          const generatedSummary = generateSummary(transcript, important);
          setSummary(generatedSummary);

          setProcessingStatus('');
          setIsProcessing(false);
          setProcessingStep(0);
        } catch (innerError) {
          console.error('Processing error:', innerError);
          setProcessingStatus(`Error: ${innerError.message}`);
          setIsProcessing(false);
          setProcessingStep(0);
        }
      };

      video.onerror = () => {
        setProcessingStatus('Error loading video');
        setIsProcessing(false);
        setProcessingStep(0);
      };
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoDuration(0);
    setAudioData(null);
    setFullTranscript([]);
    setImportantIndexes([]);
    setSummary('');
    setSilenceSegments([]);
    setConceptDensitySegments([]);
    setExamMode(false);
    setSelectedSegment(null);
    setScrollToIndex(null);
    setSeekTo(null);
    setCurrentVideoTime(0);
    setActiveTab('transcript');
  };

  const displayTranscript = examMode
    ? filterExamRelevant(fullTranscript, importantIndexes)
    : fullTranscript;

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
    setScrollToIndex(segment.startIdx);
    // Also seek video to the timestamp of the first sentence in that segment
    if (fullTranscript[segment.startIdx]) {
      setSeekTo(fullTranscript[segment.startIdx].timestamp);
    }
  };

  const handleSeekTo = useCallback((timestamp) => {
    setSeekTo(timestamp);
  }, []);

  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    )},
    { id: 'analytics', label: 'Analytics', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Animated background blurs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-dark-950/80">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight gradient-text">Lecture Editor</h1>
                <p className="text-[10px] text-gray-600">AI-powered analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {videoFile && (
                <>
                  {/* Tab switcher in header */}
                  <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <ExamModeToggle examMode={examMode} onToggle={setExamMode} />

                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center transition-colors group"
                    title="Upload new video"
                  >
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {!videoFile ? (
          <UploadSection
            onUpload={handleVideoUpload}
            isProcessing={isProcessing}
            processingStatus={processingStatus}
          />
        ) : (
          <div className="space-y-6">
            {/* Processing overlay */}
            {isProcessing && (
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                      {processingStep}/{totalSteps}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-2">{processingStatus}</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(processingStep / totalSteps) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {['Load', 'Audio', 'Silence', 'Transcript', 'Analyze', 'Summary'].map((step, i) => (
                        <span key={step} className={`text-[9px] font-medium ${
                          i < processingStep ? 'text-indigo-400' : i === processingStep ? 'text-white' : 'text-gray-700'
                        }`}>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top row: Video + Summary or Stats */}
            {!isProcessing && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Video player - takes 3 cols */}
                <div className="lg:col-span-3">
                  <VideoPlayer
                    videoFile={videoFile}
                    onTimeUpdate={setCurrentVideoTime}
                    seekTo={seekTo}
                  />
                </div>

                {/* Summary or Stats - takes 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                  {summary && <SummaryPanel summary={summary} />}
                </div>
              </div>
            )}

            {/* Heatmap - full width */}
            {!isProcessing && conceptDensitySegments.length > 0 && (
              <HeatmapTimeline
                segments={conceptDensitySegments}
                onSegmentClick={handleSegmentClick}
                selectedSegment={selectedSegment}
              />
            )}

            {/* Bottom section: Transcript or Analytics tab */}
            {!isProcessing && fullTranscript.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Main content area */}
                <div className="lg:col-span-3">
                  {activeTab === 'transcript' && (
                    <TranscriptViewer
                      transcript={displayTranscript}
                      importantIndexes={importantIndexes}
                      silenceSegments={silenceSegments}
                      scrollToIndex={scrollToIndex}
                      examMode={examMode}
                      onSeekTo={handleSeekTo}
                      currentVideoTime={currentVideoTime}
                    />
                  )}

                  {activeTab === 'analytics' && (
                    <StatsPanel
                      transcript={fullTranscript}
                      importantIndexes={importantIndexes}
                      silenceSegments={silenceSegments}
                      videoDuration={videoDuration}
                      conceptDensitySegments={conceptDensitySegments}
                    />
                  )}
                </div>

                {/* Side panel - always show the other */}
                <div className="lg:col-span-2">
                  {activeTab === 'transcript' ? (
                    <StatsPanel
                      transcript={fullTranscript}
                      importantIndexes={importantIndexes}
                      silenceSegments={silenceSegments}
                      videoDuration={videoDuration}
                      conceptDensitySegments={conceptDensitySegments}
                    />
                  ) : (
                    <TranscriptViewer
                      transcript={displayTranscript}
                      importantIndexes={importantIndexes}
                      silenceSegments={silenceSegments}
                      scrollToIndex={scrollToIndex}
                      examMode={examMode}
                      onSeekTo={handleSeekTo}
                      currentVideoTime={currentVideoTime}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-[10px] text-gray-700">AI Lecture Recording Editor</p>
          <div className="flex items-center gap-3 text-[10px] text-gray-700">
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-600">E</span>
            <span>Toggle Exam Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
