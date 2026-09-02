import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KitchenService } from '../services/apiService.js';

export default function SettingsScreen() {
  const navigate = useNavigate();

  // Section 1: Profile
  const [profile, setProfile] = useState({
    name: 'Amigos',
    kitchenName: 'रसोई – माँ के हाथों की',
    phone: '+91 98765 43210',
    address: 'Civil Lines, Prayagraj',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Section 2: Language
  const [language, setLanguage] = useState('हिन्दी');

  // Section 3: Voice Assistant
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Section 4: Notifications
  const [notifNewOrder, setNotifNewOrder] = useState(true);
  const [notifScheduled, setNotifScheduled] = useState(true);
  const [notifCompleted, setNotifCompleted] = useState(true);

  // Section 5: Voice Speed
  const [voiceSpeed, setVoiceSpeed] = useState('normal'); // slow, normal, fast

  // Section 6: Microphone
  const [micStatus, setMicStatus] = useState('idle'); // idle, testing, success, fail

  // Section 7 & Emergency: Kitchen Status
  const [kitchenStatus, setKitchenStatus] = useState('open'); // open, closed
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Section 8: Working Hours
  const [openTime, setOpenTime] = useState('9:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');

  // Feedback Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  useEffect(() => {
    KitchenService.getKitchenStatus()
      .then((data) => {
        if (data && data.status) setKitchenStatus(data.status);
      })
      .catch(() => {});
  }, []);

  const showSnackbar = (msg) => {
    setSnackbarMessage(msg);
    setTimeout(() => {
      setSnackbarMessage(null);
    }, 4000);
  };

  const handleVoiceToggle = () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    if (nextVal && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('आवाज़ सहायक चालू हो गया है। आज का मेनू अपडेट हो गया।');
      u.lang = 'hi-IN';
      window.speechSynthesis.speak(u);
    }
  };

  const handleVoicePreview = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('नमस्ते');
      u.lang = 'hi-IN';
      if (voiceSpeed === 'slow') u.rate = 0.75;
      else if (voiceSpeed === 'fast') u.rate = 1.25;
      else u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const handleMicTest = () => {
    setMicStatus('testing');
    setTimeout(() => {
      setMicStatus('success');
    }, 2500);
  };

  const handleUpdateKitchenStatus = (statusToSet) => {
    if (statusToSet === 'closed' && kitchenStatus === 'open') {
      setShowCloseModal(true);
      return;
    }

    KitchenService.updateKitchenStatus({ status: statusToSet })
      .then(() => {
        setKitchenStatus(statusToSet);
        showSnackbar(statusToSet === 'open' ? '🟢 रसोई खोल दी गई है।' : '🔴 आज रसोई बंद कर दी गई है।');
      })
      .catch((err) => {
        alert(err.message || 'स्टेटस बदलने में समस्या आई।');
      });
  };

  const confirmCloseKitchen = () => {
    KitchenService.updateKitchenStatus({ status: 'closed' })
      .then(() => {
        setKitchenStatus('closed');
        setShowCloseModal(false);
        showSnackbar('🔴 आज रसोई बंद कर दी गई है।');
        if (voiceEnabled && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance('आज रसोई बंद कर दी गई है। सभी आइटम उपलब्ध नहीं रहेंगे।');
          u.lang = 'hi-IN';
          window.speechSynthesis.speak(u);
        }
      })
      .catch(() => {
        alert('त्रुटि हुई। कृपया पुन: प्रयास करें।');
        setShowCloseModal(false);
      });
  };

  return (
    <div className="settings-screen-container">
      {/* Top Header */}
      <header className="menu-header" style={{ marginBottom: '14px' }}>
        <button
          className="header-back-btn"
          onClick={() => navigate('/')}
          aria-label="वापस जाएं"
        >
          ⬅️
        </button>
        <div className="menu-header-title">
          <h1 className="menu-title-main">सेटिंग्स</h1>
          <div className="menu-title-sub">रसोई की सेटिंग्स</div>
        </div>
      </header>

      {/* Section 1: प्रोफ़ाइल (Profile) */}
      <section className="settings-section">
        <h2 className="settings-section-title">👩 प्रोफ़ाइल (Profile)</h2>
        {isEditingProfile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div className="profile-label">नाम:</div>
              <input
                type="text"
                className="search-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <div className="profile-label">Kitchen Name:</div>
              <input
                type="text"
                className="search-input"
                value={profile.kitchenName}
                onChange={(e) => setProfile({ ...profile, kitchenName: e.target.value })}
              />
            </div>
            <div>
              <div className="profile-label">Phone Number:</div>
              <input
                type="text"
                className="search-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div>
              <div className="profile-label">Kitchen Address:</div>
              <input
                type="text"
                className="search-input"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
            <button
              type="button"
              className="order-action-btn placed"
              style={{ minHeight: '56px', marginTop: '6px' }}
              onClick={() => {
                setIsEditingProfile(false);
                showSnackbar('प्रोफ़ाइल जानकारी सेव कर ली गई है।');
              }}
            >
              <span>💾</span>
              <span>सेव करें (Save)</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="profile-info-row">
              <span className="profile-label">नाम: </span> {profile.name}
            </div>
            <div className="profile-info-row">
              <span className="profile-label">Kitchen Name: </span> {profile.kitchenName}
            </div>
            <div className="profile-info-row">
              <span className="profile-label">Phone: </span> {profile.phone}
            </div>
            <div className="profile-info-row">
              <span className="profile-label">Address: </span> {profile.address}
            </div>
            <button
              type="button"
              className="preview-voice-btn"
              onClick={() => setIsEditingProfile(true)}
            >
              <span>✏️</span>
              <span>जानकारी बदलें (Edit)</span>
            </button>
          </div>
        )}
      </section>

      {/* Section 2: भाषा (Language) */}
      <section className="settings-section">
        <h2 className="settings-section-title">🌐 भाषा (Language)</h2>
        <div className="lang-cards-grid">
          {['हिन्दी', 'English', 'Hinglish'].map((lang) => (
            <button
              key={lang}
              type="button"
              className={`lang-card ${language === lang ? 'active' : ''}`}
              onClick={() => {
                setLanguage(lang);
                showSnackbar(`भाषा बदली गई: 🇮🇳 ${lang}`);
              }}
            >
              <span>🇮🇳</span>
              <span>{lang}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 3: आवाज़ (Voice Assistant) */}
      <section className="settings-section">
        <h2 className="settings-section-title">🔊 आवाज़ (Voice Assistant)</h2>
        <div className="setting-switch-row">
          <div className="setting-switch-label">
            <div>बोलकर पुष्टि करें (Speak Confirmations)</div>
            <div style={{ fontSize: '15px', color: '#8D6E63', fontWeight: '600' }}>
              उदा. "आज का मेनू अपडेट हो गया।"
            </div>
          </div>
          <div
            className={`android-switch ${voiceEnabled ? 'on' : 'off'}`}
            onClick={handleVoiceToggle}
            style={{ cursor: 'pointer' }}
          >
            <div className={`switch-thumb ${voiceEnabled ? 'on' : 'off'}`} />
          </div>
        </div>
      </section>

      {/* Section 4: सूचनाएँ (Notifications) */}
      <section className="settings-section">
        <h2 className="settings-section-title">🔔 सूचनाएँ (Notifications)</h2>
        <div className="setting-switch-row">
          <div className="setting-switch-label">नये ऑर्डर की सूचना (New Order Notification)</div>
          <div
            className={`android-switch ${notifNewOrder ? 'on' : 'off'}`}
            onClick={() => setNotifNewOrder(!notifNewOrder)}
            style={{ cursor: 'pointer' }}
          >
            <div className={`switch-thumb ${notifNewOrder ? 'on' : 'off'}`} />
          </div>
        </div>

        <div className="setting-switch-row">
          <div className="setting-switch-label">शेड्यूल ऑर्डर की याद (Scheduled Reminder)</div>
          <div
            className={`android-switch ${notifScheduled ? 'on' : 'off'}`}
            onClick={() => setNotifScheduled(!notifScheduled)}
            style={{ cursor: 'pointer' }}
          >
            <div className={`switch-thumb ${notifScheduled ? 'on' : 'off'}`} />
          </div>
        </div>

        <div className="setting-switch-row">
          <div className="setting-switch-label">ऑर्डर पूरा होने की सूचना (Completed Reminder)</div>
          <div
            className={`android-switch ${notifCompleted ? 'on' : 'off'}`}
            onClick={() => setNotifCompleted(!notifCompleted)}
            style={{ cursor: 'pointer' }}
          >
            <div className={`switch-thumb ${notifCompleted ? 'on' : 'off'}`} />
          </div>
        </div>
      </section>

      {/* Section 5: आवाज़ की गति (Voice Speed) */}
      <section className="settings-section">
        <h2 className="settings-section-title">🔊 आवाज़ की गति (Voice Speed)</h2>
        <div className="speed-cards-grid">
          {[
            { id: 'slow', label: 'धीमी (Slow)' },
            { id: 'normal', label: 'सामान्य (Normal)' },
            { id: 'fast', label: 'तेज़ (Fast)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`speed-btn ${voiceSpeed === item.id ? 'active' : ''}`}
              onClick={() => setVoiceSpeed(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="preview-voice-btn"
          onClick={handleVoicePreview}
        >
          <span>🔊</span>
          <span>सुनकर देखें ("नमस्ते")</span>
        </button>
      </section>

      {/* Section 6: माइक्रोफोन (Microphone Test) */}
      <section className="settings-section">
        <h2 className="settings-section-title">🎤 माइक्रोफोन (Microphone Test)</h2>
        <div className="mic-test-box">
          {micStatus === 'idle' && (
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#5D4037', marginBottom: '12px' }}>
              अपनी आवाज़ की जाँच करने के लिए नीचे दिए बटन को दबाएँ।
            </div>
          )}
          {micStatus === 'testing' && (
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#E65100', marginBottom: '12px' }}>
              🎤 बोलिए, हम सुन रहे हैं...
            </div>
          )}
          {micStatus === 'success' && (
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#2E7D32', marginBottom: '12px' }}>
              🎤 आपकी आवाज़ साफ़ सुनाई दे रही है।
            </div>
          )}
          {micStatus === 'fail' && (
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#C62828', marginBottom: '12px' }}>
              ⚠️ कृपया दोबारा प्रयास करें।
            </div>
          )}

          <button
            type="button"
            className="mic-test-btn"
            onClick={handleMicTest}
            disabled={micStatus === 'testing'}
          >
            <span>🎙️</span>
            <span>{micStatus === 'testing' ? 'जाँच हो रही है...' : 'माइक्रोफोन जाँचें'}</span>
          </button>
        </div>
      </section>

      {/* Section 7: Kitchen Status */}
      <section className="settings-section">
        <h2 className="settings-section-title">🍽️ Kitchen Status</h2>
        <div className="status-cards-grid">
          <button
            type="button"
            className={`status-card-btn open ${kitchenStatus === 'open' ? 'active' : ''}`}
            onClick={() => handleUpdateKitchenStatus('open')}
          >
            <span style={{ fontSize: '32px' }}>🟢</span>
            <span>रसोई खुली है</span>
          </button>

          <button
            type="button"
            className={`status-card-btn closed ${kitchenStatus === 'closed' ? 'active' : ''}`}
            onClick={() => handleUpdateKitchenStatus('closed')}
          >
            <span style={{ fontSize: '32px' }}>🔴</span>
            <span>आज रसोई बंद है</span>
          </button>
        </div>
      </section>

      {/* Section 8: Working Hours */}
      <section className="settings-section">
        <h2 className="settings-section-title">📅 Working Hours</h2>
        <div className="hours-box">
          <div style={{ flex: 1, minWidth: '130px' }}>
            <div className="profile-label" style={{ marginBottom: '4px' }}>खुलने का समय (Opening):</div>
            <select
              className="hours-select"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            >
              {['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <div className="profile-label" style={{ marginBottom: '4px' }}>बंद होने का समय (Closing):</div>
            <select
              className="hours-select"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            >
              {['8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 9: सहायता (Help & Support) */}
      <section className="settings-section">
        <h2 className="settings-section-title">📞 सहायता (Help & Support)</h2>
        <div className="help-btns-grid">
          <a href="tel:18001234567" className="help-btn">
            <span>📱</span>
            <span>कॉल सपोर्ट (Call Support)</span>
          </a>
          <a
            href="https://wa.me/919876543210?text=नमस्ते"
            target="_blank"
            rel="noopener noreferrer"
            className="help-btn"
            style={{ borderColor: '#4CAF50', color: '#2E7D32' }}
          >
            <span>💬</span>
            <span>WhatsApp सपोर्ट</span>
          </a>
          <button
            type="button"
            className="help-btn"
            style={{ borderColor: '#2196F3', color: '#1565C0' }}
            onClick={() => alert('उपयोगकर्ता मार्गदर्शिका (User Guide): किसी भी आइटम को टॉगल करने के लिए उस पर टैप करें। कोई भी मदद चाहिए तो ऊपर दिए गए बटन से कॉल करें।')}
          >
            <span>📘</span>
            <span>उपयोगकर्ता मार्गदर्शिका (User Guide)</span>
          </button>
        </div>
      </section>

      {/* Section 10: About */}
      <section className="settings-section" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <div className="about-card">
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#8B1E3F' }}>
            रसोई – माँ के हाथों की
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#5D4037', margin: '4px 0' }}>
            Powered by Amigos • v1.0.0
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#D4A017', marginTop: '8px' }}>
            Made with ❤️ for Traditional Kitchens
          </div>
        </div>
      </section>

      {/* Emergency Button */}
      <section style={{ padding: '0 4px 10px' }}>
        <button
          type="button"
          className="emergency-red-btn"
          onClick={() => setShowCloseModal(true)}
        >
          <span>🚨</span>
          <span>आज रसोई बंद करें (Emergency Close)</span>
        </button>
      </section>

      {/* Confirmation Modal */}
      {showCloseModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize: '56px', marginBottom: '6px' }}>⚠️</div>
            <div className="modal-title">क्या आप रसोई बंद करना चाहती हैं?</div>
            <div style={{ fontSize: '18px', color: '#5D4037', fontWeight: '700' }}>
              यदि रसोई बंद करेंगे:
            </div>
            <ul className="modal-bullet-list">
              <li>• सभी मेनू Items Unavailable हो जाएँगे</li>
              <li>• ग्राहक नए ऑर्डर नहीं कर पाएँगे</li>
            </ul>
            <div className="modal-btn-row">
              <button
                type="button"
                className="modal-btn no"
                onClick={() => setShowCloseModal(false)}
              >
                नहीं (No)
              </button>
              <button
                type="button"
                className="modal-btn yes"
                onClick={confirmCloseKitchen}
              >
                हाँ (Yes, Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbarMessage && (
        <div className="snackbar">{snackbarMessage}</div>
      )}
    </div>
  );
}
