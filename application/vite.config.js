import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory backend database for cloud kitchen menu
let menuItemsDb = [
  {
    item_id: 'ITM-001',
    item_name: 'शाही पनीर थाली',
    description: 'ताज़ा घर का बना पनीर, दाल मखनी, 4 रोटी, चावल और सलाद',
    category: '🍽️ थाली',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80',
    prep_time: '20 मिनट',
    price: 180,
  },
  {
    item_id: 'ITM-002',
    item_name: 'पंजाबी संपूर्ण थाली',
    description: 'सरसों का साग, 2 मक्की की रोटी, सफेद मक्खन, गुड़ और लस्सी',
    category: '🍽️ थाली',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=150&auto=format&fit=crop&q=80',
    prep_time: '25 मिनट',
    price: 200,
  },
  {
    item_id: 'ITM-003',
    item_name: 'माँ के हाथ की दाल मखनी',
    description: 'रात भर धीमी आँच पर पकाई गई गाढ़ी उड़द दाल और मक्खन का तड़का',
    category: '🍛 मुख्य भोजन',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=150&auto=format&fit=crop&q=80',
    prep_time: '15 मिनट',
    price: 140,
  },
  {
    item_id: 'ITM-004',
    item_name: 'कढ़ाई पनीर देसी स्टाइल',
    description: 'शिमला मिर्च और पारंपरिक ताज़ा खड़े मसालों से भुना हुआ पनीर',
    category: '🍛 मुख्य भोजन',
    available: false,
    image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=150&auto=format&fit=crop&q=80',
    prep_time: '20 मिनट',
    price: 160,
  },
  {
    item_id: 'ITM-005',
    item_name: 'आलू गोभी मसाला',
    description: 'घर के पिसे हल्दी और धनिया मसाले में बनी स्वादिष्ट सूखी गोभी',
    category: '🍛 मुख्य भोजन',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=150&auto=format&fit=crop&q=80',
    prep_time: '15 मिनट',
    price: 110,
  },
  {
    item_id: 'ITM-006',
    item_name: 'खुशबूदार जीरा राइस',
    description: 'खिले हुए बासमती चावल शुद्ध देसी घी और भुने जीरे के तड़के के साथ',
    category: '🍚 चावल',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=150&auto=format&fit=crop&q=80',
    prep_time: '10 मिनट',
    price: 90,
  },
  {
    item_id: 'ITM-007',
    item_name: 'ताज़ा हरे मटर का पुलाव',
    description: 'मीठे हरे मटर और हल्के खड़े मसालों से बना स्वादिष्ट पुलाव',
    category: '🍚 चावल',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=150&auto=format&fit=crop&q=80',
    prep_time: '15 मिनट',
    price: 110,
  },
  {
    item_id: 'ITM-008',
    item_name: 'गरमा-गरम तवा रोटी (मक्खन)',
    description: 'चक्की के ताज़ा गेहूँ के आटे की फूली हुई रोटी सफेद मक्खन के साथ',
    category: '🫓 रोटी एवं पराठा',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&auto=format&fit=crop&q=80',
    prep_time: '5 मिनट',
    price: 15,
  },
  {
    item_id: 'ITM-009',
    item_name: 'चटपटा गोभी का पराठा',
    description: 'मसालेदार गोभी के भरावन वाला करारा तवा पराठा, ताज़ा दही के साथ',
    category: '🫓 रोटी एवं पराठा',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=150&auto=format&fit=crop&q=80',
    prep_time: '10 मिनट',
    price: 60,
  },
  {
    item_id: 'ITM-010',
    item_name: 'खस्ता लच्छा पराठा',
    description: 'कई परतों वाला खस्ता पराठा शुद्ध देसी घी में सिका हुआ',
    category: '🫓 रोटी एवं पराठा',
    available: false,
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=150&auto=format&fit=crop&q=80',
    prep_time: '10 मिनट',
    price: 40,
  },
  {
    item_id: 'ITM-011',
    item_name: 'गाढ़ी पंजाबी लस्सी (मीठी)',
    description: 'ऊपर से गाढ़ी मलाई मार के मथनी से बनी ताज़ा दही की ठंडी लस्सी',
    category: '🥛 पेय पदार्थ',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1571006682668-5e4860d5b62b?w=150&auto=format&fit=crop&q=80',
    prep_time: '5 मिनट',
    price: 50,
  },
  {
    item_id: 'ITM-012',
    item_name: 'पाचक मसाला छाछ',
    description: 'ताज़ा पुदीना, काला नमक और भुने जीरे से युक्त पाचक ठंडी छाछ',
    category: '🥛 पेय पदार्थ',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=150&auto=format&fit=crop&q=80',
    prep_time: '5 मिनट',
    price: 30,
  },
  {
    item_id: 'ITM-013',
    item_name: 'गरम गाजर का हलवा',
    description: 'शुद्ध खोया, देसी घी, काजू और बादाम से बना सर्दियों का खास हलवा',
    category: '🍮 मिठाई',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=150&auto=format&fit=crop&q=80',
    prep_time: '10 मिनट',
    price: 80,
  },
  {
    item_id: 'ITM-014',
    item_name: 'केसरिया रबड़ीदार खीर',
    description: 'दूध और बासमती चावल की धीमी आँच पर पकाई गई गाढ़ी केसरिया खीर',
    category: '🍮 मिठाई',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1567327613485-fbc7bf196198?w=150&auto=format&fit=crop&q=80',
    prep_time: '10 मिनट',
    price: 70,
  },
  {
    item_id: 'ITM-015',
    item_name: 'पंजाबी खस्ता समोसा (2 पीस)',
    description: 'आलू और मटर का चटपटा मसालेदार भरावन, खट्टी-मीठी और हरी चटनी के साथ',
    category: '🥟 स्नैक्स',
    available: true,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=150&auto=format&fit=crop&q=80',
    prep_time: '10 मिनट',
    price: 40,
  },
  {
    item_id: 'ITM-016',
    item_name: 'कुरकुरे पनीर पकोड़े',
    description: 'बेसन के घोल में तले हुए ताज़ा नर्म पनीर के गरमा-गरम पकोड़े',
    category: '🥟 स्नैक्स',
    available: false,
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=150&auto=format&fit=crop&q=80',
    prep_time: '15 मिनट',
    price: 80,
  },
];

let kitchenStatusDb = 'open';

let ordersDb = [
  {
    order_id: 'CKF-1782622368588',
    customer_name: 'SHRISTI',
    phone: '8765595134',
    address: 'Katwarupur Prayagraj',
    items: [
      { name: 'माँ की स्पेशल थाली', qty: 1 },
      { name: 'Regular Veg Thali', qty: 1 },
    ],
    total_amount: 549,
    payment_mode: 'COD',
    order_status: 'Placed',
    kitchen_status: 'Pending',
    delivery_status: 'Pending',
    delivery_type: 'Immediate',
    scheduled_datetime: null,
    schedule_status: 'Pending',
    created_at: '11:10 AM',
  },
  {
    order_id: 'CKF-1782622368589',
    customer_name: 'RAHUL SHARMA',
    phone: '9837462819',
    address: 'Civil Lines, Allahabad',
    items: [
      { name: 'शाही पनीर थाली', qty: 2 },
      { name: 'गाढ़ी पंजाबी लस्सी (मीठी)', qty: 2 },
    ],
    total_amount: 760,
    payment_mode: 'Online (UPI)',
    order_status: 'Placed',
    kitchen_status: 'Pending',
    delivery_status: 'Pending',
    delivery_type: 'Immediate',
    scheduled_datetime: null,
    schedule_status: 'Pending',
    created_at: '11:15 AM',
  },
  {
    order_id: 'CKF-1782622368590',
    customer_name: 'POOJA GUPTA',
    phone: '9123456780',
    address: 'George Town, Prayagraj',
    items: [
      { name: 'माँ के हाथ की दाल मखनी', qty: 1 },
      { name: 'खस्ता लच्छा पराठा', qty: 3 },
    ],
    total_amount: 300,
    payment_mode: 'COD',
    order_status: 'Placed',
    kitchen_status: 'Pending',
    delivery_status: 'Pending',
    delivery_type: 'Immediate',
    scheduled_datetime: null,
    schedule_status: 'Pending',
    created_at: '11:18 AM',
  },
  {
    order_id: 'CKF-1782622368591',
    customer_name: 'AMIT VERMA',
    phone: '9988776655',
    address: 'Tagore Town, Prayagraj',
    items: [{ name: 'पंजाबी संपूर्ण थाली', qty: 1 }],
    total_amount: 320,
    payment_mode: 'Online',
    order_status: 'Accepted',
    kitchen_status: 'Accepted',
    delivery_status: 'Pending',
    delivery_type: 'Immediate',
    scheduled_datetime: null,
    schedule_status: 'Pending',
    created_at: '10:50 AM',
  },
  {
    order_id: 'CKF-1782622368592',
    customer_name: 'NEHA SINGH',
    phone: '8877665544',
    address: 'Allahpur, Prayagraj',
    items: [
      { name: 'राजमा चावल कॉम्बो', qty: 2 },
      { name: 'बेसन का हलवा', qty: 1 },
    ],
    total_amount: 470,
    payment_mode: 'COD',
    order_status: 'Preparing',
    kitchen_status: 'Preparing',
    delivery_status: 'Pending',
    delivery_type: 'Immediate',
    scheduled_datetime: null,
    schedule_status: 'Pending',
    created_at: '10:35 AM',
  },
  {
    order_id: 'CKF-1782622368593',
    customer_name: 'VIKAS MISHRA',
    phone: '7766554433',
    address: 'Kydganj, Prayagraj',
    items: [{ name: 'कढ़ी चावल स्पेशल', qty: 1 }],
    total_amount: 170,
    payment_mode: 'Online',
    order_status: 'Ready',
    kitchen_status: 'Ready',
    delivery_status: 'Waiting',
    delivery_type: 'Immediate',
    scheduled_datetime: null,
    schedule_status: 'Pending',
    created_at: '10:20 AM',
  },
  {
    order_id: 'CKF-1782622368594',
    customer_name: 'SURESH YADAV',
    phone: '6655443322',
    address: 'Dhoomanganj, Prayagraj',
    items: [{ name: 'आलू पराठा (दही और अचार)', qty: 2 }],
    total_amount: 200,
    payment_mode: 'COD',
    order_status: 'Out',
    kitchen_status: 'Ready',
    delivery_status: 'Out for Delivery',
    delivery_type: 'Immediate',
    scheduled_datetime: null,
    schedule_status: 'Pending',
    created_at: '10:00 AM',
  },
  {
    order_id: 'CKF-1782622368595',
    customer_name: 'ANJALI KAPOOR',
    phone: '9456781234',
    address: 'Lukerganj, Prayagraj',
    items: [{ name: 'शाही पनीर थाली', qty: 4 }],
    total_amount: 1400,
    payment_mode: 'Online',
    order_status: 'Placed',
    kitchen_status: 'Pending',
    delivery_status: 'Pending',
    delivery_type: 'Scheduled',
    scheduled_datetime: 'रात 9:00 बजे',
    schedule_status: 'Pending',
    created_at: '11:00 AM',
  },
];

function mockBackendPlugin() {
  return {
    name: 'mock-backend-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/kitchen-orders' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          setTimeout(() => {
            res.end(JSON.stringify(ordersDb));
          }, 400);
          return;
        }

        if (req.url === '/update-order-status' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { order_id, action } = JSON.parse(body || '{}');
              const idx = ordersDb.findIndex((o) => o.order_id === order_id);
              if (idx !== -1) {
                if (action === 'accept') {
                  ordersDb[idx].order_status = 'Accepted';
                  ordersDb[idx].kitchen_status = 'Accepted';
                } else if (action === 'preparing') {
                  ordersDb[idx].order_status = 'Preparing';
                  ordersDb[idx].kitchen_status = 'Preparing';
                } else if (action === 'ready') {
                  ordersDb[idx].order_status = 'Ready';
                  ordersDb[idx].kitchen_status = 'Ready';
                  ordersDb[idx].delivery_status = 'Waiting';
                } else if (action === 'out') {
                  ordersDb[idx].order_status = 'Out';
                  ordersDb[idx].delivery_status = 'Out for Delivery';
                } else if (action === 'delivered') {
                  ordersDb[idx].order_status = 'Completed';
                  ordersDb[idx].delivery_status = 'Delivered';
                } else if (action === 'trigger_schedule') {
                  ordersDb[idx].schedule_status = 'Triggered';
                }
              }
              res.setHeader('Content-Type', 'application/json');
              setTimeout(() => {
                res.end(JSON.stringify({ success: true, orders: ordersDb }));
              }, 300);
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid order action payload' }));
            }
          });
          return;
        }

        if (req.url === '/api/menu' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          // Simulate brief network latency for realistic loading experience
          setTimeout(() => {
            res.end(JSON.stringify(menuItemsDb));
          }, 600);
          return;
        }

        if (req.url === '/update-menu-availability' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const updates = JSON.parse(body);
              if (Array.isArray(updates)) {
                updates.forEach((u) => {
                  const idx = menuItemsDb.findIndex((m) => m.item_id === u.item_id);
                  if (idx !== -1 && typeof u.available === 'boolean') {
                    menuItemsDb[idx].available = u.available;
                  }
                });
              }
              res.setHeader('Content-Type', 'application/json');
              setTimeout(() => {
                res.end(JSON.stringify({ success: true, message: 'Updated successfully' }));
              }, 500);
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (req.url === '/voice-menu' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { text } = JSON.parse(body || '{}');
              const t = (text || '').toLowerCase();
              let availableNames = ['Rajma Chawal', 'Kadhi Chawal', 'Sweet Lassi'];
              let activeIds = ['ITM-001', 'ITM-003', 'ITM-011'];

              if (t.includes('पनीर खत्म') || t.includes('paneer nahi')) {
                availableNames = ['माँ के हाथ की दाल मखनी', 'खुशबूदार जीरा राइस', 'गरमा-गरम तवा रोटी (मक्खन)'];
                activeIds = ['ITM-003', 'ITM-006', 'ITM-008'];
              } else if (t.includes('थालियाँ') || t.includes('thali')) {
                availableNames = ['शाही पनीर थाली', 'पंजाबी संपूर्ण थाली'];
                activeIds = ['ITM-001', 'ITM-002'];
              } else if (t.includes('नाश्ता') || t.includes('nashta')) {
                availableNames = ['चटपटा गोभी का पराठा', 'खस्ता लच्छा पराठा', 'गाढ़ी पंजाबी लस्सी (मीठी)'];
                activeIds = ['ITM-009', 'ITM-010', 'ITM-011'];
              } else if (t.includes('बंद') || t.includes('band') || t.includes('closed')) {
                availableNames = [];
                activeIds = [];
              }

              const updates = menuItemsDb.map((m) => ({
                item_id: m.item_id,
                available: activeIds.includes(m.item_id),
              }));

              res.setHeader('Content-Type', 'application/json');
              setTimeout(() => {
                res.end(
                  JSON.stringify({
                    available: availableNames,
                    updates: updates,
                  })
                );
              }, 800);
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid voice text payload' }));
            }
          });
          return;
        }

        if (req.url === '/kitchen-status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          setTimeout(() => {
            res.end(JSON.stringify({ status: kitchenStatusDb }));
          }, 300);
          return;
        }

        if (req.url === '/kitchen-status' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { status } = JSON.parse(body || '{}');
              if (status === 'closed' || status === 'open') {
                kitchenStatusDb = status;
                if (status === 'closed') {
                  menuItemsDb.forEach((m) => {
                    m.available = false;
                  });
                }
              }
              res.setHeader('Content-Type', 'application/json');
              setTimeout(() => {
                res.end(JSON.stringify({ success: true, status: kitchenStatusDb }));
              }, 400);
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid kitchen status payload' }));
            }
          });
          return;
        }

        if ((req.url === '/ai-kitchen-agent' || req.url === '/webhook/kitchen-ai') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { text, message } = JSON.parse(body || '{}');
              const t = (text || message || '').toLowerCase();
              let responsePayload = {};

              // Destructive confirmation check
              if (t.includes('दुकान बंद') || t.includes('रसोई बंद') || t.includes('close kitchen')) {
                responsePayload = {
                  intent: 'confirm_destructive',
                  action: 'close_kitchen',
                  confirmation_question: 'क्या आप सच में आज रसोई बंद करना चाहती हैं?',
                  reply: 'क्या आप सच में आज रसोई बंद करना चाहती हैं?',
                };
              } else if (t.includes('राजमा') && t.includes('कढ़ी') && t.includes('लस्सी')) {
                responsePayload = {
                  intent: 'update_menu',
                  available_items: ['Rajma Chawal', 'Kadhi Chawal', 'Sweet Lassi'],
                  reply: 'आज का मेनू अपडेट कर दिया गया है। आज सिर्फ़ राजमा, कढ़ी और लस्सी मिलेगी।',
                };
              } else if (t.includes('राजमा मिलेगा') || t.includes('राजमा है')) {
                responsePayload = {
                  intent: 'update_menu',
                  available_items: ['Rajma Chawal Combo'],
                  reply: 'जी Suchitra Ji, मैंने राजमा चावल उपलब्ध मार्क कर दिया है।',
                };
              } else if (t.includes('पनीर खत्म') || t.includes('paneer nahi') || t.includes('पनीर नहीं')) {
                responsePayload = {
                  intent: 'update_menu',
                  available_items: ['माँ के हाथ की दाल मखनी', 'खुशबूदार जीरा राइस', 'गरमा-गरम तवा रोटी (मक्खन)'],
                  reply: 'जी, मैंने पनीर के आइटम मेनू से हटा दिए हैं। बाकी व्यंजन उपलब्ध हैं।',
                };
              } else if (t.includes('थालियाँ') || t.includes('thali')) {
                responsePayload = {
                  intent: 'update_menu',
                  available_items: ['शाही पनीर थाली', 'पंजाबी संपूर्ण थाली'],
                  reply: 'जी Suchitra Ji, आज सभी थालियाँ उपलब्ध कर दी गई हैं।',
                };
              } else if (t.includes('नाश्ता') || t.includes('nashta')) {
                responsePayload = {
                  intent: 'update_menu',
                  available_items: ['चटपटा गोभी का पराठा', 'खस्ता लच्छा पराठा', 'गाढ़ी पंजाबी लस्सी (मीठी)'],
                  reply: 'जी Suchitra Ji, आज नाश्ता उपलब्ध कर दिया गया है।',
                };
              } else if (t.includes('मेनू अपडेट कर दो')) {
                responsePayload = {
                  intent: 'navigate',
                  route: '/voice-menu',
                  reply: 'जी Suchitra Ji, मैं आपको बोलकर मेनू अपडेट करने वाली स्क्रीन पर ले चलती हूँ।',
                };
              } else if (t.includes('ऑर्डर दिखाओ') || t.includes('कितने ऑर्डर आए हैं') || t.includes('ऑर्डर आए')) {
                responsePayload = {
                  intent: 'navigate',
                  route: '/orders',
                  reply: 'जी Suchitra Ji, आज कुल 8 ऑर्डर आए हैं। मैं आपको ऑर्डर स्क्रीन पर ले चलती हूँ।',
                };
              } else if (t.includes('तैयार है') || t.includes('ऑर्डर तैयार') || t.includes('accept')) {
                responsePayload = {
                  intent: 'update_order',
                  reply: 'ठीक है Suchitra Ji, मैंने ऑर्डर का स्टेटस तैयार मार्क कर दिया है।',
                };
              } else if (t.includes('डिलीवर') || t.includes('भेज दो')) {
                responsePayload = {
                  intent: 'update_order',
                  reply: 'जी, मैंने ऑर्डर डिलीवरी के लिए भेज दिया है।',
                };
              } else if (t.includes('फोन लगाओ') || t.includes('call')) {
                responsePayload = {
                  intent: 'call_phone',
                  phone: '8765595134',
                  reply: 'जी Suchitra Ji, मैं ग्राहक सृष्टि जी को कॉल लगा रही हूँ।',
                };
              } else if (t.includes('व्हाट्सएप') || t.includes('whatsapp')) {
                responsePayload = {
                  intent: 'open_whatsapp',
                  phone: '8765595134',
                  reply: 'जी, मैं ग्राहक सृष्टि जी के लिए व्हाट्सएप संदेश खोल रही हूँ।',
                };
              } else if (t.includes('क्या उपलब्ध है') || t.includes('what available')) {
                responsePayload = {
                  intent: 'info',
                  reply: 'Suchitra Ji, आज रसोई में शाही पनीर थाली, दाल मखनी और लस्सी उपलब्ध हैं।',
                };
              } else if (t.includes('scheduled') || t.includes('कल के')) {
                responsePayload = {
                  intent: 'info',
                  reply: 'कल रात 9 बजे के लिए अंजलि कपूर जी का 4 शाही पनीर थाली का शेड्यूल ऑर्डर है।',
                };
              } else if (t.includes('कमाई') || t.includes('earnings') || t.includes('बिक्री')) {
                responsePayload = {
                  intent: 'info',
                  agent: 'Sales Analytics Agent',
                  reply: 'Suchitra Ji, आज अभी तक कुल 5,459 रुपये की बिक्री हुई है। आज का दिन बहुत अच्छा रहा है!',
                };
              } else if (t.includes('सबसे ज़्यादा बिके') || t.includes('top selling')) {
                responsePayload = {
                  intent: 'info',
                  agent: 'Demand Prediction Agent',
                  reply: 'आज शाही पनीर थाली और माँ की स्पेशल थाली सबसे ज़्यादा बिक रहे हैं।',
                };
              } else if (t.includes('खत्म होने वाला') || t.includes('low stock') || t.includes('inventory')) {
                responsePayload = {
                  intent: 'info',
                  agent: 'Inventory Agent',
                  reply: 'Suchitra Ji, पनीर और ताज़ी दही की खपत ज़्यादा है, शाम तक स्टॉक खत्म हो सकता है।',
                };
              } else {
                responsePayload = {
                  intent: 'info',
                  reply: 'जी Suchitra Ji, मैं समझ गई। आपकी रसोई सखी हमेशा आपकी मदद के लिए तैयार है।',
                };
              }

              res.setHeader('Content-Type', 'application/json');
              setTimeout(() => {
                res.end(JSON.stringify(responsePayload));
              }, 700);
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid AI payload' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockBackendPlugin()],
});
