import { useRef, useState } from 'react';

// SVG Icon components
const UploadCloudIcon = () => (
  <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
  </svg>
);

const MicIcon = () => (
  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

const DocIcon = () => (
  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const FireIcon = () => (
  <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
  </svg>
);

export default function UploadSection({ onUpload, isProcessing, processingStatus }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const isMediaFile = (file) => {
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) return true;
    // Also check by extension for files with no MIME type
    const ext = file.name.split('.').pop().toLowerCase();
    return ['mp4','webm','mov','avi','mkv','mp3','wav','m4a','ogg','flac','aac','wma'].includes(ext);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (isMediaFile(files[0])) {
        onUpload(files[0]);
      } else {
        alert('Please upload a video or audio file (MP4, WebM, MOV, MP3, WAV, etc.)');
      }
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) onUpload(files[0]);
  };

  return (
    <div className="animate-fade-in">
      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-20 px-8 transition-all duration-300 group ${
          dragActive
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.02]'
        }`}
      >
        {/* Glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className={`mb-6 transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
          <UploadCloudIcon />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {isProcessing ? 'Analyzing...' : 'Upload your lecture'}
        </h3>

        {isProcessing ? (
          <div className="mt-3 flex flex-col items-center gap-3">
            <p className="text-sm text-indigo-300">{processingStatus}</p>
            <div className="w-52 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{width: '70%'}} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 max-w-sm text-center">
            Drag & drop a video or audio file, or click to browse.
            <span className="block mt-1 text-gray-600 text-xs">MP4, WebM, MOV, MP3, WAV, M4A supported</span>
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,.mp4,.webm,.mov,.avi,.mkv,.mp3,.wav,.m4a,.ogg,.flac,.aac"
          onChange={handleChange}
          className="hidden"
          disabled={isProcessing}
        />
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 stagger">
        {[
          { icon: <MicIcon />, title: 'Audio Analysis', desc: 'Extract & detect silence in audio' },
          { icon: <DocIcon />, title: 'Smart Transcript', desc: 'Generate & highlight key content' },
          { icon: <FireIcon />, title: 'Concept Heatmap', desc: 'Visualize density of key ideas' },
        ].map((f, i) => (
          <div key={i} className="glass rounded-xl p-5 hover-lift flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              {f.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{f.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
