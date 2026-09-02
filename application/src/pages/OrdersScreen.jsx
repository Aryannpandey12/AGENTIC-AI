import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrdersService, KitchenService } from '../services/apiService.js';

const FILTERS = [
  'सभी',
  'नए',
  'स्वीकार',
  'तैयारी',
  'तैयार',
  'डिलीवरी',
  'Scheduled',
  'Immediate',
];

export default function OrdersScreen() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('सभी');
  const [updatingId, setUpdatingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kitchenStatus, setKitchenStatus] = useState('open');

  const fetchOrders = (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    KitchenService.getKitchenStatus()
      .then((res) => {
        if (res && res.status) setKitchenStatus(res.status);
      })
      .catch(() => {});

    OrdersService.getOrders()
      .then((data) => {
        setOrders(data || []);
        setLoading(false);
        if (showRefresh) setIsRefreshing(false);
      })
      .catch((err) => {
        setLoading(false);
        if (showRefresh) setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (orderId, action) => {
    if (kitchenStatus === 'closed') {
      alert('आज रसोई बंद है। ऑर्डर अपडेट नहीं किए जा सकते।');
      return;
    }
    setUpdatingId(orderId);
    OrdersService.updateOrder(orderId, action)
      .then((data) => {
        if (data && data.orders) {
          setOrders(data.orders);
        } else {
          fetchOrders();
        }
        setUpdatingId(null);
      })
      .catch((err) => {
        alert(err.message || 'स्टेटस अपडेट करने में समस्या आई। कृपया पुन: प्रयास करें।');
        setUpdatingId(null);
      });
  };

  // Separate scheduled orders waiting for backend trigger vs active orders
  const scheduledPendingOrders = orders.filter(
    (o) => o.delivery_type === 'Scheduled' && o.schedule_status === 'Pending'
  );

  const activeOrders = orders.filter(
    (o) => !(o.delivery_type === 'Scheduled' && o.schedule_status === 'Pending')
  );

  // Statistics calculation based on active/today's orders
  const countNew = activeOrders.filter((o) => o.order_status === 'Placed').length;
  const countPreparing = activeOrders.filter(
    (o) => o.order_status === 'Accepted' || o.order_status === 'Preparing'
  ).length;
  const countReady = activeOrders.filter((o) => o.order_status === 'Ready').length;
  const countDelivery = activeOrders.filter((o) => o.order_status === 'Out').length;

  // Search and Filter logic on active orders
  const filteredOrders = activeOrders.filter((order) => {
    // Search check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = order.customer_name?.toLowerCase().includes(q);
      const matchId = order.order_id?.toLowerCase().includes(q);
      const matchPhone = order.phone?.includes(q);
      if (!matchName && !matchId && !matchPhone) return false;
    }

    // Filter check
    if (activeFilter === 'सभी') return true;
    if (activeFilter === 'नए') return order.order_status === 'Placed';
    if (activeFilter === 'स्वीकार') return order.order_status === 'Accepted';
    if (activeFilter === 'तैयारी') return order.order_status === 'Preparing';
    if (activeFilter === 'तैयार') return order.order_status === 'Ready';
    if (activeFilter === 'डिलीवरी') return order.order_status === 'Out';
    if (activeFilter === 'Scheduled') return order.delivery_type === 'Scheduled';
    if (activeFilter === 'Immediate') return order.delivery_type === 'Immediate';
    return true;
  });

  const renderActionButton = (order) => {
    const isBusy = updatingId === order.order_id;

    if (order.order_status === 'Placed') {
      return (
        <button
          type="button"
          className="order-action-btn placed"
          onClick={() => handleUpdateStatus(order.order_id, 'accept')}
          disabled={isBusy}
        >
          <span>✅</span>
          <span>{isBusy ? 'स्वीकार किया जा रहा है...' : 'ऑर्डर स्वीकार करें'}</span>
        </button>
      );
    }

    if (order.order_status === 'Accepted') {
      return (
        <button
          type="button"
          className="order-action-btn accepted"
          onClick={() => handleUpdateStatus(order.order_id, 'preparing')}
          disabled={isBusy}
        >
          <span>👩‍🍳</span>
          <span>{isBusy ? 'अपडेट हो रहा है...' : 'खाना बनाना शुरू करें'}</span>
        </button>
      );
    }

    if (order.order_status === 'Preparing') {
      return (
        <button
          type="button"
          className="order-action-btn preparing"
          onClick={() => handleUpdateStatus(order.order_id, 'ready')}
          disabled={isBusy}
        >
          <span>🍲</span>
          <span>{isBusy ? 'अपडेट हो रहा है...' : 'खाना तैयार है'}</span>
        </button>
      );
    }

    if (order.order_status === 'Ready') {
      return (
        <button
          type="button"
          className="order-action-btn ready"
          onClick={() => handleUpdateStatus(order.order_id, 'out')}
          disabled={isBusy}
        >
          <span>🚚</span>
          <span>{isBusy ? 'भेजा जा रहा है...' : 'डिलीवरी के लिए भेजें'}</span>
        </button>
      );
    }

    if (order.order_status === 'Out') {
      return (
        <button
          type="button"
          className="order-action-btn out"
          onClick={() => handleUpdateStatus(order.order_id, 'delivered')}
          disabled={isBusy}
        >
          <span>✅</span>
          <span>{isBusy ? 'अपडेट हो रहा है...' : 'डिलीवर हो गया'}</span>
        </button>
      );
    }

    return (
      <button type="button" className="order-action-btn completed" disabled>
        <span>✔</span>
        <span>पूरा हुआ (Completed)</span>
      </button>
    );
  };

  return (
    <div className="orders-screen-container">
      {/* Header */}
      <header className="menu-header" style={{ marginBottom: '10px' }}>
        <button
          className="header-back-btn"
          onClick={() => navigate('/')}
          aria-label="वापस जाएं"
        >
          ⬅️
        </button>
        <div className="menu-header-title">
          <h1 className="menu-title-main">आज के ऑर्डर</h1>
          <div className="menu-title-sub">आज प्राप्त सभी ऑर्डर</div>
        </div>
        <button
          type="button"
          className="header-back-btn"
          style={{ fontSize: '20px', backgroundColor: '#5D4037' }}
          onClick={() => fetchOrders(true)}
          title="रीफ्रेश करें"
        >
          {isRefreshing ? '⌛' : '🔄'}
        </button>
      </header>

      {kitchenStatus === 'closed' && (
        <div style={{ backgroundColor: '#8B1E3F', color: '#FFF', padding: '10px 16px', margin: '0 12px 10px', borderRadius: '12px', fontWeight: 'bold', textAlign: 'center' }}>
          🔴 आज रसोई बंद है (Kitchen Closed - Ordering Disabled)
        </div>
      )}

      {/* Top Summary Statistic Cards */}
      <section className="stats-grid">
        <div className="stat-card" style={{ borderColor: '#FF9800' }}>
          <div className="stat-card-title">
            <span>🟠</span>
            <span>नए ऑर्डर</span>
          </div>
          <div className="stat-card-value" style={{ color: '#E65100' }}>
            {countNew}
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: '#4CAF50' }}>
          <div className="stat-card-title">
            <span>🟢</span>
            <span>तैयारी में</span>
          </div>
          <div className="stat-card-value" style={{ color: '#2E7D32' }}>
            {countPreparing}
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: '#2196F3' }}>
          <div className="stat-card-title">
            <span>🔵</span>
            <span>तैयार</span>
          </div>
          <div className="stat-card-value" style={{ color: '#1565C0' }}>
            {countReady}
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: '#8D6E63' }}>
          <div className="stat-card-title">
            <span>🚚</span>
            <span>डिलीवरी</span>
          </div>
          <div className="stat-card-value" style={{ color: '#4E342E' }}>
            {countDelivery}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="search-bar-container" style={{ padding: '0 0 10px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="नाम या ऑर्डर ID खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="filter-chips-scroll">
        {FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`filter-chip ${activeFilter === chip ? 'active' : ''}`}
            onClick={() => setActiveFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Main Order List */}
      <main>
        {loading ? (
          /* Loading Skeletons */
          <div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" style={{ height: '220px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="placeholder-screen" style={{ padding: '40px 16px', borderRadius: '20px', marginTop: '10px' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🍲</div>
            <h2 className="placeholder-title" style={{ fontSize: '24px' }}>
              अभी कोई ऑर्डर नहीं आया है।
            </h2>
            <p className="placeholder-desc">
              जब कोई नया ऑर्डर आएगा तो वह यहाँ अपने-आप दिखाई देगा।
            </p>
          </div>
        ) : (
          /* Render Active Orders */
          filteredOrders.map((order) => (
            <div key={order.order_id} className="order-dabba-card">
              {/* Header Row */}
              <div className="order-header-row">
                <div className="order-id-badge">
                  🧾 ऑर्डर #{order.order_id}
                </div>
                <div className="order-contact-btns">
                  <a
                    href={`tel:${order.phone}`}
                    className="contact-icon-btn call"
                    title="कॉल करें"
                  >
                    📞
                  </a>
                  <a
                    href={`https://wa.me/${order.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `नमस्ते ${order.customer_name} जी, रसोई से आपके ऑर्डर #${order.order_id} के संबंध में संपर्क कर रहे हैं।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-icon-btn whatsapp"
                    title="WhatsApp करें"
                  >
                    💬
                  </a>
                </div>
              </div>

              {/* Customer & Address Info */}
              <div className="order-customer-info">
                <div style={{ fontSize: '20px', color: '#8B1E3F', fontWeight: '800' }}>
                  👤 {order.customer_name}
                </div>
                <div>📞 {order.phone}</div>
                <div>📍 {order.address}</div>
              </div>

              {/* Items List */}
              <div className="order-items-box">
                <div className="order-items-title">🍽️ ऑर्डर में शामिल व्यंजन:</div>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    • {item.name} ×{item.qty}
                  </div>
                ))}
              </div>

              {/* Price & Delivery Meta */}
              <div className="order-meta-footer">
                <span>₹{order.total_amount}</span>
                <span>•</span>
                <span>💵 {order.payment_mode}</span>
                <span>•</span>
                <span style={{ color: order.delivery_type === 'Scheduled' ? '#E65100' : '#2E7D32' }}>
                  {order.delivery_type === 'Scheduled'
                    ? `⏰ Scheduled (${order.scheduled_datetime || 'तय समय'})`
                    : '🟢 Immediate Delivery'}
                </span>
              </div>

              {/* Dynamic Large Action Button */}
              {renderActionButton(order)}
            </div>
          ))
        )}

        {/* Scheduled Orders Waiting Section */}
        {scheduledPendingOrders.length > 0 && (
          <section style={{ marginTop: '24px' }}>
            <h2 className="section-header">⏰ Scheduled Orders</h2>
            {scheduledPendingOrders.map((order) => (
              <div key={order.order_id} className="order-dabba-card" style={{ borderColor: '#FF9800', backgroundColor: '#FFFDF9' }}>
                <div className="order-header-row">
                  <div className="order-id-badge" style={{ color: '#E65100' }}>
                    ⏰ ऑर्डर #{order.order_id}
                  </div>
                  <div className="order-contact-btns">
                    <a href={`tel:${order.phone}`} className="contact-icon-btn call">
                      📞
                    </a>
                    <a
                      href={`https://wa.me/${order.phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-icon-btn whatsapp"
                    >
                      💬
                    </a>
                  </div>
                </div>

                <div className="order-customer-info">
                  <div style={{ fontSize: '20px', color: '#E65100', fontWeight: '800' }}>
                    👤 {order.customer_name}
                  </div>
                  <div>📞 {order.phone}</div>
                  <div>📍 {order.address}</div>
                </div>

                <div className="order-items-box" style={{ backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }}>
                  <div className="order-items-title" style={{ color: '#E65100' }}>🍽️ Scheduled Items:</div>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      • {item.name} ×{item.qty}
                    </div>
                  ))}
                </div>

                <div className="order-meta-footer" style={{ backgroundColor: '#FFE0B2', color: '#E65100' }}>
                  <span>₹{order.total_amount}</span>
                  <span>•</span>
                  <span>⏰ Delivery Time: {order.scheduled_datetime}</span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: '700', color: '#5D4037' }}>
                  * जब बैकएंड द्वारा समय होगा, यह अपने-आप आज के ऑर्डर में आ जाएगा।
                </div>

                {/* Simulation button so user can test the automatic progression */}
                <button
                  type="button"
                  className="order-action-btn accepted"
                  style={{ minHeight: '54px', fontSize: '18px' }}
                  onClick={() => handleUpdateStatus(order.order_id, 'trigger_schedule')}
                >
                  <span>⚡</span>
                  <span>शेड्यूल रिलीज़ करें (Simulate Backend Release)</span>
                </button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
