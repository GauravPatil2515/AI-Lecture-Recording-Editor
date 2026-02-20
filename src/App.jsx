import { useState } from 'react';
import UploadSection from './components/UploadSection';
import TranscriptViewer from './components/TranscriptViewer';
import HeatmapTimeline from './components/HeatmapTimeline';
import SummaryPanel from './components/SummaryPanel';
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

  /**
   * Handle video upload and begin analysis pipeline
   */
  const handleVideoUpload = async (file) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Loading video...');
      setVideoFile(file);

      // Create video element to get duration
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onloadedmetadata = async () => {
        const duration = video.duration;
        setVideoDuration(duration);
        URL.revokeObjectURL(objectUrl);

        // Extract audio data
        setProcessingStatus('Extracting audio...');
        const audio = await extractAudioFromVideo(file);
        setAudioData(audio);

        // Detect silence segments
        setProcessingStatus('Analyzing audio for silence...');
        const silence = detectSilence(audio, 44100, 0.02, 0.5);
        setSilenceSegments(silence);

        // Generate mock transcript
        setProcessingStatus('Generating transcript...');
        const transcript = generateMockTranscript(Math.floor(duration));
        setFullTranscript(transcript);

        // Identify important sentences
        setProcessingStatus('Analyzing content importance...');
        const important = identifyImportantSentences(transcript);
        setImportantIndexes(important);

        // Calculate concept density
        setProcessingStatus('Building concept density heatmap...');
        const conceptDensity = calculateConceptDensity(transcript, 3);
        setConceptDensitySegments(conceptDensity);

        // Generate summary
        setProcessingStatus('Generating summary...');
        const generatedSummary = generateSummary(transcript, important);
        setSummary(generatedSummary);

        setProcessingStatus('');
        setIsProcessing(false);
      };

      video.onerror = () => {
        setProcessingStatus('Error loading video');
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  /**
   * Get display transcript based on exam mode
   */
  const displayTranscript = examMode
    ? filterExamRelevant(fullTranscript, importantIndexes)
    : fullTranscript;

  /**
   * Handle heatmap segment click
   */
  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
    setScrollToIndex(segment.startIdx);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Subtle animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-dark-950/80">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Lecture Editor</h1>
                <p className="text-xs text-gray-500">AI-powered analysis</p>
              </div>
            </div>
            {videoFile && (
              <ExamModeToggle 
                examMode={examMode}
                onToggle={setExamMode}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!videoFile ? (
          <UploadSection 
            onUpload={handleVideoUpload}
            isProcessing={isProcessing}
            processingStatus={processingStatus}
          />
        ) : (
          <div className="space-y-8 stagger">
            {/* Processing Status */}
            {isProcessing && (
              <div className="glass rounded-xl p-5 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{processingStatus}</p>
                    <div className="mt-2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{width: '60%'}} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {summary && <SummaryPanel summary={summary} />}

            {/* Heatmap */}
            {conceptDensitySegments.length > 0 && (
              <HeatmapTimeline
                segments={conceptDensitySegments}
                onSegmentClick={handleSegmentClick}
                selectedSegment={selectedSegment}
              />
            )}

            {/* Transcript */}
            {fullTranscript.length > 0 && (
              <TranscriptViewer
                transcript={displayTranscript}
                importantIndexes={importantIndexes}
                silenceSegments={silenceSegments}
                scrollToIndex={scrollToIndex}
                examMode={examMode}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
