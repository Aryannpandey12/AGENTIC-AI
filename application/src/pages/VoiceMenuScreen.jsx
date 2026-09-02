import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiService, MenuService } from '../services/apiService.js';

const VOICE_EXAMPLES = [
  'आज सिर्फ़ राजमा, कढ़ी और लस्सी मिलेगी',
  'आज पनीर खत्म है',
  'आज सारी थालियाँ उपलब्ध हैं',
  'आज सिर्फ़ नाश्ता मिलेगा',
  'आज दुकान बंद है',
];

export default function VoiceMenuScreen() {
  const navigate = useNavigate();

  const [status, setStatus] = useState('ready'); // ready, listening, processing, recognized, confirming, saving, completed, error
  const [recognizedText, setRecognizedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [aiResult, setAiResult] = useState({ available: [], updates: [] });
  const [errorMessage, setErrorMessage] = useState('');

  const timerRef = useRef(null);
  const speechRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRef.current) speechRef.current.abort();
    };
  }, []);

  const formatTimer = (sec) => {
    const s = sec < 10 ? `0${sec}` : sec;
    return `00:${s}`;
  };

  const startListening = (customExample = null) => {
    setStatus('listening');
    setTimerSeconds(0);
    setErrorMessage('');
    setIsEditing(false);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    const fallbackPhrase =
      typeof customExample === 'string'
        ? customExample
        : 'आज सिर्फ़ राजमा, कढ़ी और लस्सी मिलेगी';

    // Try Web Speech API
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition && typeof customExample !== 'string') {
      try {
        const recognition = new SpeechRecognition();
        speechRef.current = recognition;
        recognition.lang = 'hi-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          clearInterval(timerRef.current);
          const transcript = event.results[0][0].transcript;
          setRecognizedText(transcript || fallbackPhrase);
          setStatus('recognized');
        };

        recognition.onerror = () => {
          // Fallback simulation if speech reco fails/denied
          simulateRecording(fallbackPhrase);
        };

        recognition.onend = () => {
          if (status === 'listening') {
            clearInterval(timerRef.current);
            if (!recognizedText) {
              setRecognizedText(fallbackPhrase);
              setStatus('recognized');
            }
          }
        };

        recognition.start();
        return;
      } catch (err) {
        simulateRecording(fallbackPhrase);
      }
    } else {
      simulateRecording(fallbackPhrase);
    }
  };

  const simulateRecording = (phrase) => {
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecognizedText(phrase);
      setStatus('recognized');
    }, 3500);
  };

  const processSpeech = () => {
    if (!recognizedText.trim()) {
      setErrorMessage('आवाज़ स्पष्ट नहीं मिली। कृपया दोबारा बोलें।');
      setStatus('error');
      return;
    }

    setStatus('processing');
    AiService.sendVoiceMessage(recognizedText)
      .then((data) => {
        setAiResult(data);
        setStatus('confirming');
      })
      .catch((err) => {
        setErrorMessage(err.message || 'इंटरनेट या सर्वर से संपर्क नहीं हो पाया।');
        setStatus('error');
      });
  };

  const confirmAndSave = () => {
    setStatus('saving');
    MenuService.updateMenu(aiResult.updates || [])
      .then(() => {
        setStatus('completed');
        playSpeechResponse('आज का मेनू सफलतापूर्वक अपडेट हो गया है।');
      })
      .catch((err) => {
        setErrorMessage(err.message || 'इंटरनेट या सर्वर से संपर्क नहीं हो पाया।');
        setStatus('error');
      });
  };

  const playSpeechResponse = (textMsg) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textMsg);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="voice-screen-container">
      {/* Top Header */}
      <header className="menu-header" style={{ marginBottom: '10px' }}>
        <button
          className="header-back-btn"
          onClick={() => navigate('/')}
          aria-label="वापस होम जाएं"
        >
          ⬅️
        </button>
        <div className="menu-header-title">
          <h1 className="menu-title-main">बोलकर मेनू अपडेट करें</h1>
          <div className="menu-title-sub">"जो आज उपलब्ध है, बस बोल दीजिए"</div>
        </div>
      </header>

      {/* Center Microphone Area */}
      <section className="voice-mic-section">
        <button
          type="button"
          className={`brass-mic-btn ${status === 'listening' ? 'recording' : ''}`}
          onClick={() => status !== 'listening' && startListening()}
          disabled={status === 'processing' || status === 'saving'}
          aria-label="माइक्रोफ़ोन"
        >
          {status === 'completed' ? '✅' : status === 'listening' ? '🎤' : '🎙️'}
        </button>

        <div className="voice-status">
          {status === 'ready' && 'स्थिति: तैयार (Ready)'}
          {status === 'listening' && '🎤 सुन रही हूँ...'}
          {status === 'processing' && '🤖 समझ रही हूँ...'}
          {status === 'saving' && '💾 सेव किया जा रहा है...'}
          {status === 'completed' && '✅ मेनू अपडेट हो गया'}
          {status === 'error' && '⚠️ त्रुटि (Error)'}
        </div>

        {status === 'listening' && (
          <>
            <div className="recording-timer">{formatTimer(timerSeconds)}</div>
            <div className="sound-waves">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
          </>
        )}
      </section>

      {/* Error State */}
      {status === 'error' && (
        <div className="recognized-card" style={{ borderColor: '#D32F2F', backgroundColor: '#FFEBEE' }}>
          <div className="recognized-text" style={{ color: '#C62828' }}>
            {errorMessage}
          </div>
          <div className="voice-btn-row">
            <button
              type="button"
              className="voice-action-btn primary"
              onClick={() => startListening()}
            >
              🔄 दोबारा बोलें / प्रयास करें
            </button>
          </div>
        </div>
      )}

      {/* Ready / Listening: Examples Card */}
      {(status === 'ready' || status === 'listening') && (
        <div className="recipe-card">
          <h2 className="recipe-card-title">💡 उदाहरण के लिए बोलें (या छूकर चुनें):</h2>
          <ul className="recipe-list">
            {VOICE_EXAMPLES.map((ex, idx) => (
              <li
                key={idx}
                className="recipe-item"
                onClick={() => startListening(ex)}
              >
                <span>🗣️</span>
                <span>"{ex}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recognized State Card */}
      {status === 'recognized' && (
        <div className="recognized-card">
          <div className="recognized-label">मैंने सुना:</div>
          {isEditing ? (
            <input
              type="text"
              className="search-input"
              style={{ marginBottom: '14px', textAlign: 'center', fontWeight: '800' }}
              value={recognizedText}
              onChange={(e) => setRecognizedText(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="recognized-text">"{recognizedText}"</div>
          )}

          <div className="voice-btn-row">
            <button
              type="button"
              className="voice-action-btn secondary"
              onClick={() => setIsEditing(!isEditing)}
            >
              <span>✏️</span>
              <span>{isEditing ? 'डन (Done)' : 'बदलें (Edit)'}</span>
            </button>
            <button
              type="button"
              className="voice-action-btn secondary"
              onClick={() => startListening()}
            >
              <span>🔁</span>
              <span>दोबारा बोलें</span>
            </button>
            <button
              type="button"
              className="voice-action-btn primary"
              onClick={processSpeech}
            >
              <span>🚀</span>
              <span>आगे बढ़ें</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation State Card */}
      {status === 'confirming' && (
        <div className="recognized-card" style={{ borderColor: '#2E7D32' }}>
          <h2 className="recipe-card-title" style={{ color: '#2E7D32' }}>
            📋 आज उपलब्ध (पुष्टि करें):
          </h2>
          {aiResult.available && aiResult.available.length > 0 ? (
            <div className="confirm-list">
              {aiResult.available.map((item, index) => (
                <div key={index} className="confirm-item">
                  <span>✅</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="confirm-item" style={{ backgroundColor: '#FFEBEE', color: '#C62828', borderColor: '#EF5350' }}>
              <span>⛔</span>
              <span>आज कोई व्यंजन उपलब्ध नहीं रहेगा (दुकान बंद)</span>
            </div>
          )}
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#5D4037', margin: '12px 0 18px' }}>
            * बाकी सभी व्यंजन आज उपलब्ध नहीं रहेंगे।
          </p>

          <div className="voice-btn-row">
            <button
              type="button"
              className="voice-action-btn secondary"
              onClick={() => startListening()}
            >
              <span>🎤</span>
              <span>दोबारा बोलें</span>
            </button>
            <button
              type="button"
              className="voice-action-btn primary"
              style={{ backgroundColor: '#2E7D32', borderColor: '#4CAF50' }}
              onClick={confirmAndSave}
            >
              <span>✅</span>
              <span>पुष्टि करें और सेव करें</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed State */}
      {status === 'completed' && (
        <div className="recognized-card" style={{ borderColor: '#2E7D32', backgroundColor: '#E8F5E9' }}>
          <div style={{ fontSize: '64px', margin: '10px 0' }}>🎉</div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1B5E20', marginBottom: '10px' }}>
           आज का मेनू सफलतापूर्वक अपडेट हो गया है!
          </h2>
          <p style={{ fontSize: '18px', color: '#2E7D32', marginBottom: '20px' }}>
            (आवाज़ द्वारा पुष्टि संदेश सुनाया जा रहा है)
          </p>
          <div className="voice-btn-row">
            <button
              type="button"
              className="voice-action-btn primary"
              style={{ backgroundColor: '#1B5E20' }}
              onClick={() => navigate('/')}
            >
              <span>🏠</span>
              <span>होम स्क्रीन पर वापस जाएं</span>
            </button>
            <button
              type="button"
              className="voice-action-btn secondary"
              onClick={() => setStatus('ready')}
            >
              <span>🎤</span>
              <span>फिर से मेनू बदलें</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
