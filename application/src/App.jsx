import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ManualMenuScreen from './pages/ManualMenuScreen.jsx';
import VoiceMenuScreen from './pages/VoiceMenuScreen.jsx';
import OrdersScreen from './pages/OrdersScreen.jsx';
import SettingsScreen from './pages/SettingsScreen.jsx';
import AssistantScreen from './pages/AssistantScreen.jsx';

function HomeScreen() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'voice',
      icon: '🎙️',
      title: 'बोलकर बताइए',
      subtitle: 'आज क्या-क्या उपलब्ध है',
      path: '/voice-menu',
    },
    {
      id: 'manual',
      icon: '✋',
      title: 'मैन्युअली उपलब्ध आइटम चुनें',
      subtitle: 'आज के उपलब्ध व्यंजन चुनें',
      path: '/manual-menu',
    },
    {
      id: 'orders',
      icon: '📦',
      title: 'आज के ऑर्डर',
      subtitle: 'सभी नए और चल रहे ऑर्डर देखें',
      path: '/orders',
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: 'सेटिंग्स',
      subtitle: 'भाषा और अन्य विकल्प',
      path: '/settings',
    },
  ];

  return (
    <>
      <header className="home-header">
        <div className="greeting">🙏 नमस्ते</div>
        <h1 className="app-title">रसोई – माँ के हाथों की</h1>
        <div className="powered-by">Powered by Amigos</div>
      </header>

      <div className="assistant-signboard-wrapper">
        <button
          type="button"
          onClick={() => navigate('/assistant')}
          className="assistant-signboard"
        >
          <span className="signboard-icon">🎙️</span>
          <span className="signboard-text">रसोई सखी (AI Voice Assistant)</span>
        </button>
      </div>

      <main className="cards-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            className="dabba-card"
            onClick={() => navigate(card.path)}
            aria-label={card.title}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-content">
              <div className="card-title">{card.title}</div>
              <div className="card-subtitle">{card.subtitle}</div>
            </div>
          </button>
        ))}
      </main>
    </>
  );
}

function PlaceholderScreen({ icon, title, desc }) {
  const navigate = useNavigate();
  return (
    <div className="placeholder-screen">
      <div className="placeholder-icon">{icon}</div>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-desc">{desc}</p>
      <button className="back-btn" onClick={() => navigate('/')}>
        <span>⬅️</span>
        <span>वापस होम पर जाएं</span>
      </button>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/voice-menu" element={<VoiceMenuScreen />} />
        <Route path="/manual-menu" element={<ManualMenuScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/assistant" element={<AssistantScreen />} />
      </Routes>

      <nav className="bottom-nav">
        <div
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </div>
        <div
          className={`nav-item ${location.pathname === '/orders' ? 'active' : ''}`}
          onClick={() => navigate('/orders')}
        >
          <span className="nav-icon">📦</span>
          <span>Orders</span>
        </div>
        <div
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </div>
      </nav>
    </div>
  );
}
