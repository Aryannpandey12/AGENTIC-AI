import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuService, KitchenService } from '../services/apiService.js';

const CATEGORY_ORDER = [
  '🍽️ थाली',
  '🍛 मुख्य भोजन',
  '🍚 चावल',
  '🫓 रोटी एवं पराठा',
  '🥛 पेय पदार्थ',
  '🍮 मिठाई',
  '🥟 स्नैक्स',
];

export default function ManualMenuScreen() {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    '🍽️ थाली': true,
    '🍛 मुख्य भोजन': true,
    '🍚 चावल': true,
    '🫓 रोटी एवं पराठा': true,
    '🥛 पेय पदार्थ': true,
    '🍮 मिठाई': true,
    '🥟 स्नैक्स': true,
  });
  const [saving, setSaving] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [kitchenStatus, setKitchenStatus] = useState('open');

  const fetchMenu = () => {
    setLoading(true);
    setError(false);
    KitchenService.getKitchenStatus()
      .then((res) => {
        if (res && res.status) setKitchenStatus(res.status);
      })
      .catch(() => {});

    MenuService.getMenu()
      .then((data) => {
        setMenuItems(data);
        setOriginalItems(JSON.parse(JSON.stringify(data)));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Quick actions
  const handleAllAvailable = () => {
    setMenuItems((prev) => prev.map((item) => ({ ...item, available: true })));
  };

  const handleAllUnavailable = () => {
    setMenuItems((prev) => prev.map((item) => ({ ...item, available: false })));
  };

  const handleReset = () => {
    setMenuItems(JSON.parse(JSON.stringify(originalItems)));
  };

  // Toggle single item
  const handleToggleItem = (itemId) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.item_id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };

  // Toggle category expand/collapse
  const handleToggleCategory = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Save changes
  const handleSave = () => {
    if (kitchenStatus === 'closed') {
      alert('आज रसोई बंद है। मेनू अपडेट नहीं किया जा सकता।');
      return;
    }
    setSaving(true);
    // Find changed items only
    const changedPayload = menuItems
      .filter((item) => {
        const orig = originalItems.find((o) => o.item_id === item.item_id);
        return !orig || orig.available !== item.available;
      })
      .map((item) => ({
        item_id: item.item_id,
        available: item.available,
      }));

    MenuService.updateMenu(changedPayload)
      .then(() => {
        setOriginalItems(JSON.parse(JSON.stringify(menuItems)));
        setSaving(false);
        setSnackbarMessage('आज का मेनू सफलतापूर्वक अपडेट हो गया।');
        setTimeout(() => {
          setSnackbarMessage(null);
        }, 4000);
      })
      .catch((err) => {
        setSaving(false);
        alert(err.message || 'सेव करने में त्रुटि हुई। कृपया पुन: प्रयास करें।');
      });
  };

  // Filter items by search
  const filteredItems = menuItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = item.item_name?.toLowerCase().includes(query);
    const catMatch = item.category?.toLowerCase().includes(query);
    const descMatch = item.description?.toLowerCase().includes(query);
    return nameMatch || catMatch || descMatch;
  });

  return (
    <div className="menu-screen-container">
      {/* Top Header */}
      <header className="menu-header">
        <button
          className="header-back-btn"
          onClick={() => navigate('/')}
          aria-label="वापस जाएं"
        >
          ⬅️
        </button>
        <div className="menu-header-title">
          <h1 className="menu-title-main">आज का मेनू</h1>
          <div className="menu-title-sub">आज कौन-कौन से व्यंजन उपलब्ध हैं?</div>
        </div>
      </header>

      {kitchenStatus === 'closed' && (
        <div style={{ backgroundColor: '#8B1E3F', color: '#FFF', padding: '10px 16px', margin: '0 12px 10px', borderRadius: '12px', fontWeight: 'bold', textAlign: 'center' }}>
          🔴 आज रसोई बंद है (Kitchen Closed)
        </div>
      )}

      {/* Sticky Quick Actions & Search */}
      <section className="sticky-actions">
        <div className="search-bar-container">
          <input
            type="text"
            className="search-input"
            placeholder="व्यंजन खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="quick-actions-row">
          <button
            type="button"
            className="quick-btn green"
            onClick={handleAllAvailable}
          >
            <span>🟢</span>
            <span>सभी उपलब्ध</span>
          </button>
          <button
            type="button"
            className="quick-btn red"
            onClick={handleAllUnavailable}
          >
            <span>🔴</span>
            <span>सभी अनुपलब्ध</span>
          </button>
          <button
            type="button"
            className="quick-btn"
            onClick={handleReset}
          >
            <span>🔄</span>
            <span>रीसेट</span>
          </button>
        </div>
      </section>

      {/* Main Scrollable Content */}
      <main className="menu-list-scroll">
        {loading ? (
          /* Loading Skeletons */
          <div style={{ padding: '12px 0' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="placeholder-screen" style={{ padding: '40px 16px' }}>
            <div className="placeholder-icon">⚠️</div>
            <h2 className="placeholder-title" style={{ fontSize: '24px' }}>
              नेटवर्क उपलब्ध नहीं है
            </h2>
            <p className="placeholder-desc" style={{ marginBottom: '20px' }}>
              मेनू लोड करने में समस्या आई। कृपया इंटरनेट चेक करें।
            </p>
            <button
              type="button"
              className="back-btn"
              onClick={fetchMenu}
              style={{ minHeight: '60px', fontSize: '20px' }}
            >
              🔄 पुन: प्रयास करें (Retry)
            </button>
          </div>
        ) : (
          /* Category Groups */
          CATEGORY_ORDER.map((category) => {
            const itemsInCategory = filteredItems.filter(
              (item) => item.category === category
            );

            // Hide empty categories when filtering
            if (itemsInCategory.length === 0) return null;

            const isExpanded = expandedCategories[category] !== false;

            return (
              <div key={category}>
                {/* Collapsible Category Header */}
                <div
                  className="category-header"
                  onClick={() => handleToggleCategory(category)}
                >
                  <span>{category}</span>
                  <span style={{ fontSize: '24px' }}>
                    {isExpanded ? '🔽' : '▶️'}
                  </span>
                </div>

                {/* Category Items */}
                {isExpanded && (
                  <div>
                    {itemsInCategory.map((item) => (
                      <div
                        key={item.item_id}
                        className={`menu-item-card ${
                          !item.available ? 'disabled' : ''
                        }`}
                        onClick={() => handleToggleItem(item.item_id)}
                      >
                        {/* Left: Circular Food Image */}
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="food-img"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80';
                          }}
                        />

                        {/* Middle: Name, Desc, Price, Prep Time */}
                        <div className="item-info">
                          <div className="item-name">{item.item_name}</div>
                          <div className="item-desc" title={item.description}>
                            {item.description}
                          </div>
                          <div className="item-meta">
                            <span className="item-price">₹{item.price}</span>
                            <span>•</span>
                            <span>⏱️ {item.prep_time}</span>
                          </div>
                        </div>

                        {/* Right: Large Android Switch */}
                        <div className="switch-container">
                          <div
                            className={`android-switch ${
                              item.available ? 'on' : 'off'
                            }`}
                          >
                            <div
                              className={`switch-thumb ${
                                item.available ? 'on' : 'off'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Sticky Bottom Save Button */}
      {!loading && !error && (
        <div className="sticky-bottom-save">
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <span>💾</span>
            <span>
              {saving ? 'सेव हो रहा है...' : 'आज का मेनू सेव करें'}
            </span>
          </button>
        </div>
      )}

      {/* Success Snackbar */}
      {snackbarMessage && (
        <div className="snackbar">✅ {snackbarMessage}</div>
      )}
    </div>
  );
}
