/**
 * САМООР RESTAURANT ORDERING SYSTEM - NETLIFY SERVERLESS FUNCTION
 * Safely dispatches Telegram messages from the backend without exposing Bot API credentials.
 */

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body);
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Verify credentials are set on server environment
    if (!token || !chatId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Telegram BOT_TOKEN or CHAT_ID environment variables are not set.' })
      };
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
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (!data.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.description || 'Failed to dispatch Telegram message.' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, messageId: data.result.message_id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
