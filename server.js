/**
 * САМООР RESTAURANT ORDERING SYSTEM - NODE.JS/EXPRESS SERVER
 * Serves frontend static assets and secures Telegram Bot API routing.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Try importing node-fetch for older Node.js runtimes, otherwise use native fetch
let fetchApi;
if (typeof fetch !== 'undefined') {
  fetchApi = fetch;
} else {
  fetchApi = require('node-fetch');
}

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 8000;

const fs = require('fs');
const path = require('path');

// Database Files paths
const dishesFilePath = path.join(__dirname, 'dishes.json');
const promosFilePath = path.join(__dirname, 'promos.json');

let dishesDb = [];
let promosDb = [];

// Load dishes
try {
  if (fs.existsSync(dishesFilePath)) {
    dishesDb = JSON.parse(fs.readFileSync(dishesFilePath, 'utf-8'));
    console.log(`Loaded ${dishesDb.length} dishes from database.`);
  } else {
    console.log('No dishes.json database found.');
  }
} catch (err) {
  console.error('Error loading dishes.json:', err);
}

// Load promos
try {
  if (fs.existsSync(promosFilePath)) {
    promosDb = JSON.parse(fs.readFileSync(promosFilePath, 'utf-8'));
    console.log(`Loaded ${promosDb.length} promos from database.`);
  } else {
    console.log('No promos.json database found.');
  }
} catch (err) {
  console.error('Error loading promos.json:', err);
}

// Helper to save databases
function saveDishesDb() {
  fs.writeFile(dishesFilePath, JSON.stringify(dishesDb, null, 2), 'utf-8', (err) => {
    if (err) console.error('Error saving dishes.json:', err);
  });
}

function savePromosDb() {
  fs.writeFile(promosFilePath, JSON.stringify(promosDb, null, 2), 'utf-8', (err) => {
    if (err) console.error('Error saving promos.json:', err);
  });
}

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// 1. SECURITY MIDDLEWARE: Block access to backend configuration files
app.use((req, res, next) => {
  const blockedPaths = [
    '/server.js',
    '/package.json',
    '/package-lock.json',
    '/.env',
    '/.gitignore',
    '/netlify'
  ];
  
  const requestPath = req.path.toLowerCase();
  
  if (blockedPaths.some(p => requestPath === p || requestPath.startsWith(p + '/'))) {
    return res.status(403).send('Access Denied: You are not authorized to access this resource.');
  }
  
  next();
});

// 2. SERVE STATIC FRONTEND FILES
const publicDir = path.join(__dirname, 'public');

if (fs.existsSync(publicDir) && fs.statSync(publicDir).isDirectory()) {
  console.log('Serving static files from /public folder...');
  app.use(express.static(publicDir));
}
// Redirect /admin to /admin/ relatively to prevent HTTP protocol downgrade on reverse proxies
app.get('/admin', (req, res, next) => {
  if (req.path === '/admin') {
    return res.redirect(301, '/admin/');
  }
  next();
});

// Explicitly serve admin/index.html to ensure reliability across all setups
app.get('/admin/', (req, res) => {
  const rootAdminPath = path.join(__dirname, 'admin', 'index.html');
  const publicAdminPath = path.join(publicDir, 'admin', 'index.html');
  
  if (fs.existsSync(publicAdminPath)) {
    return res.sendFile(publicAdminPath);
  } else if (fs.existsSync(rootAdminPath)) {
    return res.sendFile(rootAdminPath);
  } else {
    return res.status(404).send('Admin panel files not found on the server.');
  }
});
// Fall back to root directory serving so that /admin is always accessible
app.use(express.static(__dirname));

// 3. SECURE TELEGRAM API ROUTING ENDPOINT
app.post('/api/order', async (req, res) => {
  try {
    const payload = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Verify server config exists
    if (!token || !chatId) {
      return res.status(500).json({ error: 'Telegram credentials (TELEGRAM_BOT_TOKEN/CHAT_ID) are not configured on the server.' });
    }

    let messageText = "";

    if (payload.type === 'waiter') {
      messageText = `🔔 *ВЫЗОВ ОФИЦИАНТА*\n------------------------------\n📍 *Столик №:* ${payload.tableNumber}`;
    } else if (payload.type === 'support') {
      messageText = `🚨 *ОБРАЩЕНИЕ В ПОДДЕРЖКУ*\n------------------------------\n📞 *Телефон:* ${payload.phone}\n💬 *Проблема:*\n${payload.message}`;
    } else {
      // Order type
      const order = payload.orderData;
      let itemsList = "";
      order.items.forEach((item, idx) => {
        itemsList += `${idx + 1}. *${item.name}* x${item.quantity} — ${item.price * item.quantity} сом\n`;
      });

      const prefText = order.communication === "call" ? "Позвонить мне" : "Только написать";
      
      let payText = "";
      if (order.payment.method === "cash") {
        payText = `Наличными (${order.payment.no_change ? 'Без сдачи' : 'Сдача с ' + order.payment.change_from + ' сом'})`;
      } else if (order.payment.method === "card") {
        payText = "Картой курьеру";
      } else {
        payText = "Онлайн на сайте";
      }

      messageText = `🔔 *НОВЫЙ ЗАКАЗ #${order.orderId}*\n` +
                    `------------------------------\n` +
                    `👤 *Имя:* ${order.customer.name}\n` +
                    `📞 *Телефон:* ${order.customer.phone}\n` +
                    `📍 *Адрес:* ${order.customer.address}\n` +
                    `📞 *Связь:* ${prefText}\n` +
                    `💳 *Оплата:* ${payText}\n` +
                    (order.promo_code ? `🎟️ *Промокод:* ${order.promo_code} (-${order.promo_discount} сом)\n` : '') +
                    (order.customer.comment ? `💬 *Комментарий:* ${order.customer.comment}\n` : '') +
                    `📦 *Блюда:*\n${itemsList}` +
                    `🚗 *Доставка:* ${order.delivery === 0 ? 'Бесплатно' : order.delivery + ' сом'}\n` +
                    `💰 *Итого к оплате:* *${order.total} сом*`;
    }

    const apiURL = `https://api.telegram.org/bot${token}/sendMessage`;
    
    let data;
    try {
      const response = await fetchApi(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });
      
      data = await response.json();
      
      if (!response.ok || !data.ok) {
        console.error('Telegram Bot API Error Response:', data);
        return res.status(500).json({ 
          error: `Telegram Bot API Error: ${data.description || 'Unknown error'}` 
        });
      }
    } catch (fetchError) {
      console.error('Network error requesting Telegram Bot API:', fetchError);
      return res.status(500).json({ 
        error: `Network Error: Failed to connect to Telegram server (${fetchError.message})` 
      });
    }

    return res.status(200).json({ success: true, messageId: data.result.message_id });
  } catch (error) {
    console.error('Error handling Telegram proxy dispatch:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================================================
// BACKEND API ENDPOINTS (DISHES & PROMO CODES CRUD)
// ==========================================================================

// 1. GET ALL DISHES
app.get('/api/dishes', (req, res) => {
  return res.status(200).json(dishesDb);
});

// 2. CREATE A DISH
app.post('/api/dishes', (req, res) => {
  try {
    const newDish = req.body;
    if (!newDish.name || !newDish.price || !newDish.category) {
      return res.status(400).json({ error: 'Missing required dish fields (name, price, category).' });
    }
    // Generate a unique ID
    newDish.id = 'dish_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    dishesDb.push(newDish);
    saveDishesDb();
    console.log(`Created new dish: ${newDish.name} (ID: ${newDish.id})`);
    return res.status(201).json(newDish);
  } catch (error) {
    console.error('Error in POST /api/dishes:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. UPDATE A DISH
app.put('/api/dishes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedDish = req.body;
    const index = dishesDb.findIndex(d => d.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: `Dish with ID ${id} not found.` });
    }
    
    // Merge updated fields, keeping the original ID
    dishesDb[index] = { ...dishesDb[index], ...updatedDish, id };
    saveDishesDb();
    console.log(`Updated dish: ${dishesDb[index].name} (ID: ${id})`);
    return res.status(200).json(dishesDb[index]);
  } catch (error) {
    console.error('Error in PUT /api/dishes/:id:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. DELETE A DISH
app.delete('/api/dishes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = dishesDb.findIndex(d => d.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: `Dish with ID ${id} not found.` });
    }
    
    const deleted = dishesDb.splice(index, 1);
    saveDishesDb();
    console.log(`Deleted dish: ${deleted[0].name} (ID: ${id})`);
    return res.status(200).json({ success: true, message: `Dish with ID ${id} deleted.` });
  } catch (error) {
    console.error('Error in DELETE /api/dishes/:id:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 5. GET ALL PROMO CODES
app.get('/api/promos', (req, res) => {
  return res.status(200).json(promosDb);
});

// 6. CREATE OR UPDATE A PROMO CODE (UPSERT)
app.post('/api/promos', (req, res) => {
  try {
    const promo = req.body;
    if (!promo.code || promo.discount_percent === undefined) {
      return res.status(400).json({ error: 'Missing required promo code fields (code, discount_percent).' });
    }
    
    // Normalize code to uppercase
    promo.code = promo.code.toUpperCase();
    
    const index = promosDb.findIndex(p => p.code === promo.code);
    if (index !== -1) {
      // Update existing promo
      promosDb[index] = { ...promosDb[index], ...promo };
      console.log(`Updated promo code: ${promo.code}`);
    } else {
      // Create new promo
      promosDb.push(promo);
      console.log(`Created new promo code: ${promo.code}`);
    }
    
    savePromosDb();
    return res.status(200).json(promo);
  } catch (error) {
    console.error('Error in POST /api/promos:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 7. DELETE A PROMO CODE
app.delete('/api/promos/:code', (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const index = promosDb.findIndex(p => p.code === code);
    
    if (index === -1) {
      return res.status(404).json({ error: `Promo code ${code} not found.` });
    }
    
    promosDb.splice(index, 1);
    savePromosDb();
    console.log(`Deleted promo code: ${code}`);
    return res.status(200).json({ success: true, message: `Promo code ${code} deleted.` });
  } catch (error) {
    console.error('Error in DELETE /api/promos/:code:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 8. DIAGNOSTIC DIRECTORY CHECKER ROUTE
app.get('/api/debug-paths', (req, res) => {
  const getFiles = (dir, depth = 0) => {
    if (depth > 2) return [];
    let results = [];
    try {
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results.push({ name: file, type: 'dir', path: filePath, children: getFiles(filePath, depth + 1) });
        } else {
          results.push({ name: file, type: 'file', path: filePath });
        }
      });
    } catch (e) {
      results.push({ error: e.message });
    }
    return results;
  };
  
  return res.json({
    __dirname,
    cwd: process.cwd(),
    files: getFiles(__dirname)
  });
});

// START EXPRESS WEB SERVER
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`SAMOOR Express Server successfully started!`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`==================================================`);
});
