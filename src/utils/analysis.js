/**
 * Analysis utilities for lecture recording Editor
 * Handles audio analysis, transcript processing, and concept density scoring
 */

/**
 * Extract audio data from a video file for analysis
 * @param {File} videoFile - The uploaded video file
 * @returns {Promise<Float32Array>} Audio samples normalized to [-1, 1]
 */
export async function extractAudioFromVideo(videoFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = e.target.result;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get mono audio from the first channel
        const rawAudio = audioBuffer.getChannelData(0);
        resolve(new Float32Array(rawAudio));
      } catch (error) {
        reject(new Error('Failed to decode audio: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(videoFile);
  });
}

/**
 * Detect silence segments in audio using volume threshold
 * @param {Float32Array} audioData - Audio samples
 * @param {number} sampleRate - Sample rate of audio (e.g., 44100)
 * @param {number} threshold - Volume threshold (0-1, default 0.02)
 * @param {number} minDuration - Minimum silence duration in seconds
 * @returns {Array<{start: number, end: number}>} Silence segments with timestamps
 */
export function detectSilence(audioData, sampleRate = 44100, threshold = 0.02, minDuration = 0.5) {
  const silenceSegments = [];
  const frameSampleCount = Math.floor(sampleRate * 0.1); // 100ms frames
  
  let currentSilenceStart = null;
  
  // Calculate RMS energy for each frame
  for (let i = 0; i < audioData.length; i += frameSampleCount) {
    const frame = audioData.slice(i, i + frameSampleCount);
    const rms = Math.sqrt(
      frame.reduce((sum, sample) => sum + sample * sample, 0) / frame.length
    );
    
    const timestamp = (i / sampleRate);
    
    if (rms < threshold) {
      if (currentSilenceStart === null) {
        currentSilenceStart = timestamp;
      }
    } else {
      if (currentSilenceStart !== null) {
        const duration = timestamp - currentSilenceStart;
        if (duration >= minDuration) {
          silenceSegments.push({
            start: currentSilenceStart,
            end: timestamp,
            duration: duration,
            label: 'silence'
          });
        }
        currentSilenceStart = null;
      }
    }
  }
  
  // Close any remaining silence segment
  if (currentSilenceStart !== null) {
    const duration = (audioData.length / sampleRate) - currentSilenceStart;
    if (duration >= minDuration) {
      silenceSegments.push({
        start: currentSilenceStart,
        end: audioData.length / sampleRate,
        duration: duration,
        label: 'silence'
      });
    }
  }
  
  return silenceSegments;
}

/**
 * Generate mock transcript for demo purposes
 * In production, replace with actual speech-to-text service
 * @param {number} videoDuration - Duration of video in seconds
 * @returns {Array<{id: string, text: string, timestamp: number, confidence: number}>}
 */
export function generateMockTranscript(videoDuration = 300) {
  const mockSentences = [
    { text: "Today we're going to discuss the important concept of neural networks.", timestamp: 5 },
    { text: "Definition: A neural network is a series of algorithms that recognize patterns in data.", timestamp: 15 },
    { text: "This is a note this concept is fundamental to modern AI.", timestamp: 30 },
    { text: "Let me repeat: neural networks are essential for deep learning applications.", timestamp: 45 },
    { text: "The formula for a neuron is: output = activation(sum(weights * inputs) + bias).", timestamp: 60 },
    { text: "Remember this will be on the exam, especially the backpropagation algorithm.", timestamp: 75 },
    { text: "Important: gradient descent helps us optimize the weights.", timestamp: 90 },
    { text: "Definition of backpropagation: the process of computing gradients of weights.", timestamp: 105 },
    { text: "Note this technique reduces computational complexity significantly.", timestamp: 120 },
    { text: "The formula for ReLU activation is: max(0, x).", timestamp: 135 },
    { text: "This is important for preventing vanishing gradient problems.", timestamp: 150 },
    { text: "Exam tip: understand the differences between CNNs and RNNs.", timestamp: 165 },
    { text: "Remember to normalize your input data before training.", timestamp: 180 },
    { text: "Definition: Convolutional Neural Networks are specialized for image processing.", timestamp: 195 },
    { text: "Important: hyperparameter tuning can make or break your model.", timestamp: 210 },
    { text: "Note this: regularization prevents overfitting in neural networks.", timestamp: 225 },
    { text: "The formula for dropout is randomly setting activations to zero.", timestamp: 240 },
    { text: "Remember: batch normalization improves training stability.", timestamp: 255 },
    { text: "Definition of loss function: measures how wrong our model is.", timestamp: 270 },
    { text: "Important exam concept: architecture matters as much as optimization.", timestamp: 285 },
  ];
  
  return mockSentences.map((item, idx) => ({
    id: `sentence-${idx}`,
    text: item.text,
    timestamp: item.timestamp,
    confidence: 0.92 + Math.random() * 0.08,
  }));
}

/**
 * Identify important sentences based on keyword scoring
 * @param {Array<{text: string}>} transcript - Array of transcript items
 * @returns {Array<number>} Indexes of important sentences
 */
export function identifyImportantSentences(transcript) {
  const keywords = {
    'important': 3,
    'definition': 3,
    'formula': 3,
    'exam': 4,
    'note this': 3,
    'remember': 2,
    'key': 2.5,
    'must know': 4,
    'critical': 3.5,
    'essential': 2.5,
    'fundamentally': 2,
    'crucial': 3.5,
    'significant': 2.5,
    'relevant': 1.5,
  };
  
  const importantIndexes = [];
  const scoreThreshold = 2.5;
  
  transcript.forEach((item, index) => {
    const text = item.text.toLowerCase();
    let score = 0;
    
    Object.entries(keywords).forEach(([keyword, weight]) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      score += matches.length * weight;
    });
    
    if (score >= scoreThreshold) {
      importantIndexes.push(index);
    }
  });
  
  return importantIndexes;
}

/**
 * Calculate concept density scores for heatmap
 * Segments transcript and scores each segment based on:
 * - keyword frequency
 * - repetition count
 * - simulated speech energy
 * @param {Array<{text: string, timestamp: number}>} transcript - Transcript items
 * @param {number} segmentSize - Number of sentences per segment (default 3)
 * @returns {Array<{segment: number, score: number, text: string, startIdx: number, endIdx: number}>}
 */
export function calculateConceptDensity(transcript, segmentSize = 3) {
  const importantKeywords = [
    'important',
    'definition',
    'formula',
    'exam',
    'remember',
    'note',
    'key',
    'critical',
    'essential',
    'fundamental',
  ];
  
  const segments = [];
  let segmentNum = 0;
  
  for (let i = 0; i < transcript.length; i += segmentSize) {
    const startIdx = i;
    const endIdx = Math.min(i + segmentSize, transcript.length);
    const segmentText = transcript.slice(startIdx, endIdx);
    
    // Calculate keyword frequency
    let keywordScore = 0;
    const combinedText = segmentText.map(s => s.text).join(' ').toLowerCase();
    
    importantKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(regex) || [];
      keywordScore += matches.length;
    });
    
    // Calculate repetition score (word frequency analysis)
    const words = combinedText.split(/\s+/).filter(w => w.length > 4);
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    let repetitionScore = 0;
    Object.values(wordFreq).forEach(freq => {
      if (freq > 1) repetitionScore += Math.min(freq, 3); // Cap contribution
    });
    
    // Simulated energy score (based on exclamation marks and caps)
    let energyScore = 0;
    segmentText.forEach(item => {
      energyScore += (item.text.match(/[!?]/g) || []).length * 0.5;
      energyScore += (item.text.match(/[A-Z]{2,}/g) || []).length * 0.3;
    });
    
    // Combine scores with weights
    const totalScore = (keywordScore * 0.6) + (repetitionScore * 0.25) + (energyScore * 0.15);
    
    segments.push({
      segment: segmentNum,
      score: totalScore,
      text: combinedText.substring(0, 100) + '...',
      startIdx,
      endIdx,
      keywordScore,
      repetitionScore,
      energyScore,
    });
    
    segmentNum++;
  }
  
  // Normalize scores to 0-1 range
  if (segments.length > 0) {
    const maxScore = Math.max(...segments.map(s => s.score));
    const minScore = Math.min(...segments.map(s => s.score));
    const range = maxScore - minScore || 1;
    
    segments.forEach(segment => {
      segment.normalizedScore = (segment.score - minScore) / range;
    });
  }
  
  return segments;
}

/**
 * Generate AI-style summary from transcript
 * Extracts key sentences and combines them intelligently
 * @param {Array<{text: string}>} transcript - Transcript items
 * @param {Array<number>} importantIndexes - Indexes of important sentences
 * @returns {string} Generated summary
 */
export function generateSummary(transcript, importantIndexes) {
  if (importantIndexes.length === 0) {
    return "No significant content detected in the transcript.";
  }
  
  // Get important sentences, limit to max 5 for summary
  const summaryIndexes = importantIndexes.slice(0, 5);
  const summaryText = summaryIndexes
    .map(idx => transcript[idx]?.text || '')
    .filter(text => text.length > 0)
    .join(' ');
  
  // Post-process summary
  return summaryText || "Unable to generate summary from available content.";
}

/**
 * Filter transcript items based on exam relevance
 * @param {Array<{text: string}>} transcript - Full transcript
 * @param {Array<number>} importantIndexes - Important sentence indexes
 * @returns {Array} Filtered transcript items
 */
export function filterExamRelevant(transcript, importantIndexes) {
  const examKeywords = ['exam', 'remember', 'important', 'must know', 'critical', 'definition', 'formula'];
  
  return transcript.filter((item, index) => {
    const text = item.text.toLowerCase();
    const hasExamKeyword = examKeywords.some(keyword => text.includes(keyword));
    return hasExamKeyword || importantIndexes.includes(index);
  });
}

/**
 * Get color for a normalized score (blue -> yellow -> red)
 * @param {number} normalizedScore - Score between 0 and 1
 * @returns {string} CSS color class
 */
export function getHeatmapColor(normalizedScore) {
  if (normalizedScore < 0.33) {
    // Blue (low intensity)
    return 'bg-blue-600';
  } else if (normalizedScore < 0.67) {
    // Yellow (medium intensity)
    return 'bg-yellow-500';
  } else {
    // Red (high intensity)
    return 'bg-red-600';
  }
}

/**
 * Format timestamp to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
