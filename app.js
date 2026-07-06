/**
 * "САМООР" RESTAURANT ORDERING SYSTEM - CORE JAVASCRIPT
 * Handles Cart state, DOM rendering, validations, animations, and Telegram Bot integrations.
 */

// ==========================================================================
// SAFE STORAGE WRAPPER (Prevents crashes in incognito, local file:// or blocked cookie environments)
// ==========================================================================
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem access blocked:", e);
      return null;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      console.warn("localStorage.setItem access blocked:", e);
    }
  },
  getSession(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn("sessionStorage.getItem access blocked:", e);
      return null;
    }
  },
  setSession(key, val) {
    try {
      sessionStorage.setItem(key, val);
    } catch (e) {
      console.warn("sessionStorage.setItem access blocked:", e);
    }
  }
};

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let cart = [];
let activeCategory = "all";
let searchQuery = "";
let dishesList = [];
let orderMode = ""; // "dine_in" or "delivery"
let communicationPreference = "call"; // "call" or "chat"
let paymentMethod = "cash"; // "cash", "card", or "online"
let activePromo = null; // will store { code: "SAMOR10", discount_percent: 10 }

// Telegram Bot Settings (loaded securely from config.js)
let tgConfig = {
  token: CONFIG.telegramBotToken,
  chatId: CONFIG.telegramChatId
};

// Check if the restaurant is currently within working hours
function isRestaurantOpen() {
  const now = new Date();
  const currentHour = now.getHours();
  
  const startHour = CONFIG.workingHours?.start ?? 10;
  const endHour = CONFIG.workingHours?.end ?? 23;
  
  return currentHour >= startHour && currentHour < endHour;
}

// ==========================================================================
// ORDER SERVICE MODE MANAGEMENT
// ==========================================================================
function setOrderMode(mode) {
  // If they just made the selection from the welcome overlay, log it as a visit on the server
  const isInitialSelection = DOM.welcomeOverlay && DOM.welcomeOverlay.style.display !== "none";
  if (isInitialSelection) {
    fetch("/api/stats/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: mode })
    }).catch(e => console.warn("Failed to log visit:", e));
  }

  orderMode = mode;
  storage.setSession("samoor_order_mode", mode);
  
  if (mode === "dine_in") {
    document.body.classList.add("dine-in-mode");
    if (DOM.modeHeaderIcon) DOM.modeHeaderIcon.textContent = "🍽️";
    if (DOM.modeHeaderText) DOM.modeHeaderText.textContent = "В ресторане";
    if (DOM.waiterCallBtn) DOM.waiterCallBtn.style.display = "flex";
    
    // Clear cart automatically for dine-in mode (for checkout safety)
    cart = [];
    saveCart();
    renderCart();
    renderDishes();
  } else {
    document.body.classList.remove("dine-in-mode");
    if (DOM.modeHeaderIcon) DOM.modeHeaderIcon.textContent = "🚗";
    if (DOM.modeHeaderText) DOM.modeHeaderText.textContent = "Доставка";
    if (DOM.waiterCallBtn) DOM.waiterCallBtn.style.display = "none";
    
    renderDishes();
  }
  
  if (DOM.welcomeOverlay) {
    DOM.welcomeOverlay.style.display = "none";
  }
  document.body.classList.remove("auth-locked");
}

function handleCallWaiter(e) {
  e.preventDefault();
  
  const tableVal = DOM.waiterTableNumber.value.trim();
  const groupTable = document.getElementById("group-waiter-table");
  const tableNum = parseInt(tableVal);
  
  if (!tableVal || isNaN(tableNum) || tableNum < 1 || tableNum > 100) {
    if (groupTable) groupTable.classList.add("has-error");
    return;
  }
  if (groupTable) groupTable.classList.remove("has-error");
  
  const submitBtn = DOM.waiterForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="spinner" style="width:18px; height:18px; animation: spin 1s linear infinite; margin-right: 8px;">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
    <span>Отправка...</span>
  `;
  
  const callMessage = 
`🔔 *ВЫЗОВ ОФИЦИАНТА*
------------------------------
📍 *Столик №:* ${tableNum}`;

  // 1. Try Express backend dispatch first
  fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "waiter", tableNumber: tableNum })
  })
  .then(res => {
    if (!res.ok) throw new Error("Serverless dispatch failed");
    return res.json();
  })
  .then(data => {
    closeModal(DOM.waiterModal);
    DOM.waiterForm.reset();
    alert(`Официант вызван! Он подойдёт к вашему столику №${tableNum} в ближайшее время.`);
  })
  .catch(err => {
    console.warn("Serverless waiter dispatch failed, executing fallback:", err);
    // 2. Client-side fallback
    if (tgConfig.token && tgConfig.token !== "YOUR_BOT_TOKEN_HERE" && tgConfig.chatId && tgConfig.chatId !== "YOUR_CHAT_ID_HERE") {
      const apiURL = `https://api.telegram.org/bot${tgConfig.token}/sendMessage`;
      fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: tgConfig.chatId,
          text: callMessage,
          parse_mode: "Markdown"
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          closeModal(DOM.waiterModal);
          DOM.waiterForm.reset();
          alert(`Официант вызван! Он подойдёт к вашему столику №${tableNum} в ближайшее время.`);
        } else {
          throw new Error(data.description || "Unknown Telegram Bot API error");
        }
      })
      .catch(error => {
        console.error("Waiter call fallback failed:", error);
        alert(`Ошибка при вызове: ${error.message}\nПопробуйте позвать официанта лично.`);
      });
    } else {
      fallbackRedirectToChat(callMessage);
      closeModal(DOM.waiterModal);
      DOM.waiterForm.reset();
      alert(`Официант вызван! Он подойдёт к вашему столику №${tableNum} в ближайшее время.`);
    }
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
  });
}

// Apply promocode inside cart
async function handleApplyPromo() {
  if (!DOM.promoInput || !DOM.promoMessage) return;
  
  const codeVal = DOM.promoInput.value.trim().toUpperCase();
  if (!codeVal) {
    showPromoMsg("Введите промокод!", "error");
    return;
  }
  
  // Load promocodes list from backend
  let promos = [];
  try {
    const res = await fetch(`/api/promos?t=${Date.now()}`);
    if (res.ok) {
      promos = await res.json();
    } else {
      throw new Error(`HTTP error: ${res.status}`);
    }
  } catch (err) {
    console.warn("Failed to fetch promos from server, loading from local cache:", err);
    const savedPromos = storage.get("samoor_promo_codes");
    if (savedPromos) {
      try {
        promos = JSON.parse(savedPromos);
      } catch (e) {
        console.error("Error parsing promo codes database:", e);
      }
    }
  }
  
  const promo = promos.find(p => p.code.toUpperCase() === codeVal);
  if (!promo) {
    showPromoMsg("Промокод не найден!", "error");
    activePromo = null;
    renderCart();
    return;
  }
  
  if (!promo.is_active) {
    showPromoMsg("Промокод больше неактивен!", "error");
    activePromo = null;
    renderCart();
    return;
  }
  
  // Success application
  activePromo = {
    code: promo.code,
    discount_percent: promo.discount_percent
  };
  
  showPromoMsg(`Скидка ${promo.discount_percent}% успешно применена!`, "success");
  renderCart();
}

function showPromoMsg(text, type) {
  if (!DOM.promoMessage) return;
  DOM.promoMessage.textContent = text;
  DOM.promoMessage.style.display = "block";
  DOM.promoMessage.style.color = type === "success" ? "#27ae60" : "#c0392b";
}

// Dishes List Database Loader
async function loadDishes() {
  try {
    const res = await fetch(`/api/dishes?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    dishesList = await res.json();
    console.log(`Successfully fetched ${dishesList.length} dishes from backend API.`);
  } catch (err) {
    console.warn("Failed to fetch dishes from backend, falling back to local cache:", err);
    const saved = storage.get("samoor_dishes");
    if (saved) {
      try {
        dishesList = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved dishes, loading defaults:", e);
        dishesList = getDefaultDishes();
      }
    } else {
      dishesList = getDefaultDishes();
      saveDishes();
    }
  }
}

function getDefaultDishes() {
  return MENU_DATA.map(dish => ({
    id: dish.id,
    category: dish.category,
    name: dish.name,
    description: dish.description || "",
    price: dish.price,
    portion: dish.portion || "",
    image_url: dish.image || "",
    is_discounted: false,
    discount_price: 0
  }));
}

function saveDishes() {
  storage.set("samoor_dishes", JSON.stringify(dishesList));
}

// ==========================================================================
// TELEGRAM WEBAPP INITIALIZATION
// ==========================================================================
let isTelegramWebApp = false;
if (window.Telegram && window.Telegram.WebApp) {
  try {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    isTelegramWebApp = true;
    console.log("Telegram WebApp detected and initialized.");
  } catch (e) {
    console.error("Failed to initialize Telegram WebApp SDK:", e);
  }
}

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const DOM = {
  header: document.getElementById("main-header"),
  headerLogo: document.getElementById("header-logo"),
  categoriesContainer: document.getElementById("categories-container"),
  dishesGrid: document.getElementById("dishes-grid"),
  searchInput: document.getElementById("search-input"),
  cartTrigger: document.getElementById("cart-trigger-btn"),
  cartCounter: document.getElementById("cart-counter"),
  cartBackdrop: document.getElementById("cart-backdrop"),
  cartDrawer: document.getElementById("cart-drawer"),
  closeCartBtn: document.getElementById("close-cart-btn"),
  cartItemsList: document.getElementById("cart-items-list"),
  
  // Cart Footer Panel
  subtotalPrice: document.getElementById("summary-subtotal"),
  deliveryPrice: document.getElementById("summary-delivery"),
  totalPrice: document.getElementById("summary-total"),
  checkoutBtn: document.getElementById("checkout-btn"),
  cartFooterPanel: document.getElementById("cart-footer-panel"),
  
  // Mobile Action Bar
  mobileActionBar: document.getElementById("mobile-action-bar"),
  mobileCheckoutBtn: document.getElementById("mobile-checkout-btn"),
  mobileCartCount: document.getElementById("mobile-cart-count"),
  mobileCartTotal: document.getElementById("mobile-cart-total"),
  
  // Modals
  checkoutModal: document.getElementById("checkout-modal"),
  closeCheckoutBtn: document.getElementById("close-checkout-btn"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutName: document.getElementById("checkout-name"),
  checkoutPhone: document.getElementById("checkout-phone"),
  checkoutAddress: document.getElementById("checkout-address"),
  checkoutComment: document.getElementById("checkout-comment"),
  
  verificationModal: document.getElementById("verification-modal"),
  closeVerificationBtn: document.getElementById("close-verification-btn"),
  verifItemsList: document.getElementById("verif-items-list"),
  verifDetailsList: document.getElementById("verif-details-list"),
  verifBackBtn: document.getElementById("verif-back-btn"),
  verifConfirmBtn: document.getElementById("verif-confirm-btn"),
  
  successModal: document.getElementById("success-modal"),
  successCloseBtn: document.getElementById("success-close-btn"),
  successMessageText: document.getElementById("success-message-text"),
  
  // Critical Error Modal
  errorModal: document.getElementById("error-modal"),
  errorModalMsg: document.getElementById("error-modal-msg"),
  errorFallbackBtn: document.getElementById("error-fallback-btn"),
  errorRetryBtn: document.getElementById("error-retry-btn"),
  closeErrorBtn: document.getElementById("close-error-btn"),
  
  settingsModal: document.getElementById("settings-modal"),
  settingsTrigger: document.getElementById("settings-trigger-btn"),
  closeSettingsBtn: document.getElementById("close-settings-btn"),
  
  // Support Form (embedded inside Settings Modal)
  supportForm: document.getElementById("support-form"),
  supportMessage: document.getElementById("support-message"),
  supportPhone: document.getElementById("support-phone"),

  // Welcome Overlay & Mode Selector
  welcomeOverlay: document.getElementById("welcome-overlay"),
  btnModeDineIn: document.getElementById("btn-mode-dine-in"),
  btnModeDelivery: document.getElementById("btn-mode-delivery"),
  modeHeaderBtn: document.getElementById("mode-switcher-header-btn"),
  modeHeaderIcon: document.getElementById("mode-header-icon"),
  modeHeaderText: document.getElementById("mode-header-text"),

  // Waiter Call Modal
  waiterCallBtn: document.getElementById("waiter-call-btn"),
  waiterModal: document.getElementById("waiter-modal"),
  closeWaiterBtn: document.getElementById("close-waiter-btn"),
  waiterForm: document.getElementById("waiter-form"),
  waiterTableNumber: document.getElementById("waiter-table-number"),

  // Checkout custom additions (Connection & Payment)
  prefCall: document.getElementById("pref-call"),
  prefChat: document.getElementById("pref-chat"),
  payCash: document.getElementById("pay-cash"),
  payCard: document.getElementById("pay-card"),
  payOnline: document.getElementById("pay-online"),
  cashChangeContainer: document.getElementById("cash-change-container"),
  checkoutChange: document.getElementById("checkout-change"),
  checkoutNoChange: document.getElementById("checkout-no-change"),

  // Promocode customer features
  promoInput: document.getElementById("promo-input"),
  applyPromoBtn: document.getElementById("apply-promo-btn"),
  promoMessage: document.getElementById("promo-message"),
  rowPromoDiscount: document.getElementById("row-promo-discount"),
  summaryPromoDiscount: document.getElementById("summary-promo-discount")
};

// ==========================================================================
// IMAGE FALLBACK HANDLER
// ==========================================================================
function handleImageError(img) {
  img.onerror = null; // Prevent infinite loop
  
  // Reliable Unsplash food plate fallback image
  img.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";
}

// ==========================================================================
// RENDER FUNCTIONS
// ==========================================================================

// Render Category Nav List
function renderCategories() {
  DOM.categoriesContainer.innerHTML = "";
  
  // 1. Add "Все" (All) button
  const allBtn = document.createElement("button");
  allBtn.className = `category-btn ${activeCategory === "all" ? 'active' : ''}`;
  allBtn.dataset.id = "all";
  allBtn.id = "cat-all";
  allBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
    <span>Все</span>
  `;
  allBtn.addEventListener("click", (e) => {
    const targetBtn = e.target.closest(".category-btn");
    if (!targetBtn) return;
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    targetBtn.classList.add("active");
    activeCategory = "all";
    renderDishes();
    targetBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
  DOM.categoriesContainer.appendChild(allBtn);

  // 2. Add standard categories
  Object.values(CATEGORIES).forEach(category => {
    const btn = document.createElement("button");
    btn.className = `category-btn ${category.id === activeCategory ? 'active' : ''}`;
    btn.dataset.id = category.id;
    btn.id = `cat-${category.id}`;
    
    // Icon selection helper
    let iconSvg = getCategoryIconSvg(category.icon);
    
    btn.innerHTML = `${iconSvg} <span>${category.name}</span>`;
    
    btn.addEventListener("click", (e) => {
      const targetBtn = e.target.closest(".category-btn");
      if (!targetBtn) return;
      
      // Toggle active class
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      targetBtn.classList.add("active");
      
      activeCategory = category.id;
      renderDishes();
      
      // Smooth scroll categories slightly if cut off
      targetBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    
    DOM.categoriesContainer.appendChild(btn);
  });
}

// Render Menu Cards
function renderDishes() {
  DOM.dishesGrid.innerHTML = "";
  
  // Filter dishes based on active category and search query
  let filtered = dishesList.filter(dish => {
    const matchesCategory = activeCategory === "all" || dish.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If search query is active, ignore category filtering to allow global search
    return searchQuery !== "" ? matchesSearch : (matchesCategory && matchesSearch);
  });
  
  // Sort dishes: discounted items first
  filtered.sort((a, b) => {
    const aDiscount = a.is_discounted ? 1 : 0;
    const bDiscount = b.is_discounted ? 1 : 0;
    return bDiscount - aDiscount;
  });
  
  if (filtered.length === 0) {
    DOM.dishesGrid.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 36px; color: var(--text-muted); margin-bottom: 12px; display: block; text-align: center; width: 100%;"></i>
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить поисковый запрос</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach((dish, index) => {
    const card = document.createElement("div");
    card.className = "dish-card glass";
    if (dish.is_discounted) {
      card.classList.add("discounted");
    }
    card.id = `dish-card-${dish.id}`;
    card.style.animationDelay = `${index * 0.03}s`;
    
    const inCart = getCartItem(dish.id);
    const buttonText = inCart ? `В корзине (${inCart.quantity})` : 'Добавить';
    const buttonClass = inCart ? 'add-to-cart-btn added' : 'add-to-cart-btn';
    
    // Price rendering with discount support
    let priceHtml = "";
    if (dish.is_discounted) {
      priceHtml = `
        <span class="dish-price-old">${dish.price} ${CONFIG.currencySymbol}</span>
        <span class="dish-price-discount">${dish.discount_price} ${CONFIG.currencySymbol}</span>
      `;
    } else {
      priceHtml = `<span class="dish-price">${dish.price} ${CONFIG.currencySymbol}</span>`;
    }
    
    const promoBadge = dish.is_discounted ? `<span class="promo-badge">% Акция</span>` : '';
    
    // Render property badges alongside portion size
    const portionBadge = `
      <div class="dish-badges-left">
        <span class="dish-portion" style="position:static;">${dish.portion}</span>
        ${dish.is_spicy ? '<span class="property-badge spicy" title="Острое">🌶️</span>' : ''}
        ${dish.is_veg ? '<span class="property-badge veg" title="Вегетарианское">🌱</span>' : ''}
      </div>
    `;

    card.innerHTML = `
      <div class="dish-img-container">
        <img src="${dish.image_url}" alt="${dish.name}" loading="lazy" onerror="handleImageError(this)">
        ${portionBadge}
        ${promoBadge}
        <div class="price-container-badge">
          ${priceHtml}
        </div>
      </div>
      <div class="dish-details">
        <h3>${dish.name}</h3>
        <p>${dish.description || ''}</p>
        <button class="${buttonClass}" data-id="${dish.id}" id="add-btn-${dish.id}">
          <i class="fa-solid fa-plus" style="margin-right: 6px;"></i>
          <span class="btn-text">${buttonText}</span>
        </button>
      </div>
    `;
    
    // Add event listener programmatically
    const btn = card.querySelector(".add-to-cart-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetBtn = e.target.closest(".add-to-cart-btn");
      if (targetBtn) {
        handleAddToCart(dish.id, targetBtn);
      }
    });
    
    DOM.dishesGrid.appendChild(card);
  });
}

// Render Cart Drawer Content
function renderCart() {
  DOM.cartItemsList.innerHTML = "";
  
  if (cart.length === 0) {
    activePromo = null;
    if (DOM.promoInput) DOM.promoInput.value = "";
    if (DOM.promoMessage) DOM.promoMessage.style.display = "none";
    
    DOM.cartItemsList.innerHTML = `
      <div class="empty-cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h3>Ваша корзина пуста</h3>
        <p>Выберите блюда из меню, чтобы оформить заказ</p>
      </div>
    `;
    DOM.cartFooterPanel.style.display = "none";
    DOM.cartCounter.textContent = "0";
    DOM.cartCounter.style.transform = "scale(0)";
    
    // Mobile bottom bar total update
    DOM.mobileCartCount.textContent = "0";
    DOM.mobileCartTotal.textContent = `0 ${CONFIG.currencySymbol}`;
    DOM.mobileActionBar.style.transform = "translateY(100%)";
    DOM.mobileActionBar.classList.remove("visible");
    return;
  }
  
  DOM.cartFooterPanel.style.display = "block";
  
  let subtotal = 0;
  let totalItemsCount = 0;
  
  cart.forEach(cartItem => {
    const dish = cartItem.item;
    const itemPrice = dish.is_discounted ? dish.discount_price : dish.price;
    const itemTotal = itemPrice * cartItem.quantity;
    subtotal += itemTotal;
    totalItemsCount += cartItem.quantity;
    
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.id = `cart-item-${dish.id}`;
    
    itemEl.innerHTML = `
      <div class="cart-item-img">
        <img src="${dish.image_url}" alt="${dish.name}" onerror="handleImageError(this)">
      </div>
      <div class="cart-item-info">
        <div>
          <div class="cart-item-title">${dish.name}</div>
          <div class="cart-item-portion">${dish.portion}</div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="qty-btn btn-qty-minus" aria-label="Уменьшить">
              <i class="fa-solid fa-minus" style="font-size: 10px;"></i>
            </button>
            <div class="qty-number">${cartItem.quantity}</div>
            <button class="qty-btn btn-qty-plus" aria-label="Увеличить">
              <i class="fa-solid fa-plus" style="font-size: 10px;"></i>
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
              ${dish.is_discounted ? `<span class="cart-price-old" style="font-size: 0.8rem; text-decoration: line-through; color: var(--text-muted);">${dish.price * cartItem.quantity} сом</span>` : ''}
              <span class="cart-item-price" style="font-weight: 700; color: ${dish.is_discounted ? 'var(--accent-gold)' : 'var(--text-primary)'};">${itemTotal} ${CONFIG.currencySymbol}</span>
            </div>
            <button class="remove-item-btn btn-remove" aria-label="Удалить">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Programmatic event listeners binding
    itemEl.querySelector(".btn-qty-minus").addEventListener("click", (e) => {
      const targetBtn = e.target.closest(".btn-qty-minus");
      if (targetBtn) updateItemQuantity(dish.id, -1);
    });
    itemEl.querySelector(".btn-qty-plus").addEventListener("click", (e) => {
      const targetBtn = e.target.closest(".btn-qty-plus");
      if (targetBtn) updateItemQuantity(dish.id, 1);
    });
    itemEl.querySelector(".btn-remove").addEventListener("click", (e) => {
      const targetBtn = e.target.closest(".btn-remove");
      if (targetBtn) removeFromCart(dish.id);
    });
    
    DOM.cartItemsList.appendChild(itemEl);
  });
  
  // Recalculate subtotal with promocode discount if applied
  let promoDiscount = 0;
  if (activePromo) {
    promoDiscount = Math.round(subtotal * (activePromo.discount_percent / 100));
  }
  
  const discountedSubtotal = subtotal - promoDiscount;

  // Calculate delivery (using subtotal *before* promocode discount, matching standard commercial practices)
  const isFreeDelivery = subtotal >= CONFIG.freeDeliveryThreshold;
  const deliveryCost = isFreeDelivery ? 0 : CONFIG.deliveryPrice;
  const grandTotal = discountedSubtotal + deliveryCost;
  
  DOM.subtotalPrice.textContent = `${subtotal} ${CONFIG.currencySymbol}`;
  
  if (promoDiscount > 0) {
    if (DOM.rowPromoDiscount) DOM.rowPromoDiscount.style.display = "flex";
    if (DOM.summaryPromoDiscount) DOM.summaryPromoDiscount.textContent = `-${promoDiscount} сом`;
  } else {
    if (DOM.rowPromoDiscount) DOM.rowPromoDiscount.style.display = "none";
  }

  if (isFreeDelivery) {
    DOM.deliveryPrice.innerHTML = `<span class="delivery-badge free">Бесплатно</span>`;
  } else {
    DOM.deliveryPrice.innerHTML = `${deliveryCost} ${CONFIG.currencySymbol} <span class="delivery-badge">(от ${CONFIG.freeDeliveryThreshold} сом бесплатно)</span>`;
  }
  
  DOM.totalPrice.textContent = `${grandTotal} ${CONFIG.currencySymbol}`;
  
  // Badge Counter Animation
  DOM.cartCounter.textContent = totalItemsCount;
  DOM.cartCounter.style.transform = "scale(1)";
  
  // Mobile Action Bar
  DOM.mobileCartCount.textContent = totalItemsCount;
  DOM.mobileCartTotal.textContent = `${grandTotal} ${CONFIG.currencySymbol}`;
  DOM.mobileActionBar.style.transform = "translateY(0)";
  DOM.mobileActionBar.classList.add("visible");

  // Operational Hours Check
  if (DOM.checkoutBtn) {
    DOM.checkoutBtn.disabled = false;
    DOM.checkoutBtn.style.opacity = "1";
    DOM.checkoutBtn.style.cursor = "pointer";
  }

  const isOpen = isRestaurantOpen();
  if (!isOpen && orderMode === "delivery") {
    if (DOM.checkoutBtn) {
      DOM.checkoutBtn.disabled = true;
      DOM.checkoutBtn.style.opacity = "0.5";
      DOM.checkoutBtn.style.cursor = "not-allowed";
    }

    // Inject warning banner at the top of items list
    const warningEl = document.createElement("div");
    warningEl.className = "cart-warning-banner";
    warningEl.style.cssText = "background: rgba(192, 57, 43, 0.1); border: 1px dashed rgba(192, 57, 43, 0.4); padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px; font-size: 0.85rem; line-height: 1.4; color: var(--text-primary); display: flex; gap: 10px; align-items: start;";
    warningEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px; color:#c0392b; flex-shrink:0; margin-top:2px;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>Ресторан сейчас закрыт. Мы принимаем заказы на доставку с ${CONFIG.workingHours.start}:00 до ${CONFIG.workingHours.end}:00. Вы можете ознакомиться с меню!</span>
    `;
    DOM.cartItemsList.insertBefore(warningEl, DOM.cartItemsList.firstChild);
  }
}

// ==========================================================================
// CART & USER FLOW LOGIC
// ==========================================================================

function handleAddToCart(id, btnElement) {
  const dish = dishesList.find(d => d.id === id);
  if (!dish) return;
  
  const existing = cart.find(item => item.item.id === id);
  
  // Flying Animation trigger
  if (btnElement && !existing) {
    triggerFlyAnimation(btnElement);
  }
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ item: dish, quantity: 1 });
  }
  
  console.log("Блюдо добавлено:", dish.name, "Количество:", existing ? existing.quantity : 1);
  saveCart();
  renderCart();
  renderDishes();
}

function updateItemQuantity(id, change) {
  const item = cart.find(i => i.item.id === id);
  if (!item) return;
  
  item.quantity += change;
  console.log("Изменено количество блюда (ID:", id, ",", item.item.name, ") на:", change, "Текущее количество:", item.quantity);
  
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.item.id !== id);
    console.log("Количество <= 0, блюдо удалено из корзины");
  }
  
  saveCart();
  renderCart();
  renderDishes();
}

function removeFromCart(id) {
  const item = cart.find(i => i.item.id === id);
  const name = item ? item.item.name : id;
  cart = cart.filter(i => i.item.id !== id);
  console.log("Блюдо удалено из корзины:", name);
  saveCart();
  renderCart();
  renderDishes();
}

function getCartItem(id) {
  return cart.find(i => i.item.id === id);
}

function saveCart() {
  storage.set("samoor_cart", JSON.stringify(cart));
}

function loadCart() {
  const saved = storage.get("samoor_cart");
  if (saved) {
    try {
      cart = JSON.parse(saved);
      // Validate items still exist in current menu list
      cart = cart.filter(item => dishesList.some(d => d.id === item.item.id));
      
      // Update item references in cart to match updated dishes details (price, discounts, names)
      cart.forEach(item => {
        const freshDish = dishesList.find(d => d.id === item.item.id);
        if (freshDish) {
          item.item = freshDish;
        }
      });
    } catch (e) {
      console.error("Error loading cart:", e);
      cart = [];
    }
  }
  renderCart();
}

// Header Scroll animation trigger
function handleHeaderScroll() {
  if (window.scrollY > 50) {
    DOM.header.classList.add("scrolled");
  } else {
    DOM.header.classList.remove("scrolled");
  }
}

// ==========================================================================
// SUPPORT FORM SUBMISSION & VALIDATION
// ==========================================================================
function handleSupportSubmit(e) {
  e.preventDefault();
  
  if (!validateSupportForm()) return;
  
  const submitBtn = document.getElementById("support-submit-btn");
  if (!submitBtn) return;
  
  submitBtn.disabled = true;
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="spinner" style="width:18px; height:18px; animation: spin 1s linear infinite; margin-right: 8px;">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
    <span>Отправка...</span>
  `;

  const phone = DOM.supportPhone.value.trim();
  const message = DOM.supportMessage.value.trim();

  const supportTelegramMessage = 
`🚨 *ОБРАЩЕНИЕ В ПОДДЕРЖКУ*
------------------------------
📞 *Телефон:* ${phone}
💬 *Проблема:*
${message}`;

  // 1. Try Express backend dispatch first
  fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "support", phone: phone, message: message })
  })
  .then(res => {
    if (!res.ok) throw new Error("Serverless support dispatch failed");
    return res.json();
  })
  .then(data => {
    handleSupportSuccess();
  })
  .catch(err => {
    console.warn("Serverless support dispatch failed, executing fallback:", err);
    // 2. Client-side fallback
    if (tgConfig.token && tgConfig.token !== "YOUR_BOT_TOKEN_HERE" && tgConfig.chatId && tgConfig.chatId !== "YOUR_CHAT_ID_HERE") {
      const apiURL = `https://api.telegram.org/bot${tgConfig.token}/sendMessage`;
      fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: tgConfig.chatId,
          text: supportTelegramMessage,
          parse_mode: "Markdown"
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          handleSupportSuccess();
        } else {
          throw new Error(data.description || "Unknown API error");
        }
      })
      .catch(error => {
        console.error("Support dispatch fallback failed:", error);
        alert(`Ошибка при отправке обращения: ${error.message}\nПопробуйте написать напрямую или позвонить.`);
      });
    } else {
      fallbackRedirectToChat(supportTelegramMessage);
      handleSupportSuccess();
    }
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
  });
}

function handleSupportSuccess() {
  closeModal(DOM.settingsModal);
  DOM.supportForm.reset();
  alert("Ваше обращение успешно отправлено! Менеджер свяжется с вами в течение 5 минут для решения проблемы.");
}

function validateSupportForm() {
  let isValid = true;
  
  const msg = DOM.supportMessage.value.trim();
  const groupMsg = document.getElementById("group-support-msg");
  if (msg.length < 5) {
    groupMsg.classList.add("has-error");
    isValid = false;
  } else {
    groupMsg.classList.remove("has-error");
  }
  
  const phone = DOM.supportPhone.value.trim();
  const groupPhone = document.getElementById("group-support-phone");
  const digitCount = phone.replace(/\D/g, "").length;
  if (phone.length < 7 || digitCount < 5) {
    groupPhone.classList.add("has-error");
    isValid = false;
  } else {
    groupPhone.classList.remove("has-error");
  }
  
  return isValid;
}

// Setup Event Listeners
function setupEventListeners() {
  // Search bar logic
  DOM.searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderDishes();
  });
  
  // Header Logo click (smooth scroll to top)
  if (DOM.headerLogo) {
    DOM.headerLogo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // Cart panel toggle triggers
  DOM.cartTrigger.addEventListener("click", () => openCartDrawer());
  DOM.closeCartBtn.addEventListener("click", () => closeCartDrawer());
  DOM.cartBackdrop.addEventListener("click", (e) => {
    if (e.target === DOM.cartBackdrop) {
      closeCartDrawer();
    }
  });
  
  // Apply promocode inside cart trigger
  if (DOM.applyPromoBtn) {
    DOM.applyPromoBtn.addEventListener("click", handleApplyPromo);
  }

  // Mobile checkout button click
  DOM.mobileCheckoutBtn.addEventListener("click", () => {
    openCartDrawer();
  });
  
  // Checkout Modal open trigger
  DOM.checkoutBtn.addEventListener("click", () => {
    if (!isRestaurantOpen() && orderMode === "delivery") {
      alert(`Ресторан сейчас закрыт. Мы принимаем заказы на доставку с ${CONFIG.workingHours.start}:00 до ${CONFIG.workingHours.end}:00.`);
      return;
    }
    closeCartDrawer();
    openModal(DOM.checkoutModal);
  });
  
  DOM.closeCheckoutBtn.addEventListener("click", () => closeModal(DOM.checkoutModal));
  
  // Checkout Form submit trigger
  DOM.checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateCheckoutForm()) {
      closeModal(DOM.checkoutModal);
      openVerificationModal();
    }
  });
  
  // Verification Modal Actions
  DOM.closeVerificationBtn.addEventListener("click", () => closeModal(DOM.verificationModal));
  DOM.verifBackBtn.addEventListener("click", () => {
    closeModal(DOM.verificationModal);
    openModal(DOM.checkoutModal);
  });
  DOM.verifConfirmBtn.addEventListener("click", () => handleConfirmOrder());
  
  // Success Modal close
  DOM.successCloseBtn.addEventListener("click", () => closeModal(DOM.successModal));
  
  // Critical Error Modal close
  if (DOM.closeErrorBtn) {
    DOM.closeErrorBtn.addEventListener("click", () => closeModal(DOM.errorModal));
  }
  if (DOM.errorRetryBtn) {
    DOM.errorRetryBtn.addEventListener("click", () => closeModal(DOM.errorModal));
  }
  
  // Settings & Support Modal Trigger (Gear icon click)
  if (DOM.settingsTrigger) {
    DOM.settingsTrigger.addEventListener("click", () => {
      openModal(DOM.settingsModal);
    });
  }
  if (DOM.closeSettingsBtn) {
    DOM.closeSettingsBtn.addEventListener("click", () => closeModal(DOM.settingsModal));
  }

  // Support Form submit inside Settings modal
  if (DOM.supportForm) {
    DOM.supportForm.addEventListener("submit", handleSupportSubmit);
  }

  // Theme selection actions inside Settings modal
  const themeDarkBtn = document.getElementById("theme-dark-btn");
  const themeLightBtn = document.getElementById("theme-light-btn");
  if (themeDarkBtn && themeLightBtn) {
    themeDarkBtn.addEventListener("click", () => {
      document.body.classList.remove("light-theme");
      themeDarkBtn.classList.add("active");
      themeLightBtn.classList.remove("active");
      storage.set("samoor_theme", "dark");
      updateThemeLogos("dark");
    });

    themeLightBtn.addEventListener("click", () => {
      document.body.classList.add("light-theme");
      themeLightBtn.classList.add("active");
      themeDarkBtn.classList.remove("active");
      storage.set("samoor_theme", "light");
      updateThemeLogos("light");
    });
  }

  // Welcome Mode Screen Listeners
  if (DOM.btnModeDineIn) {
    DOM.btnModeDineIn.addEventListener("click", () => setOrderMode("dine_in"));
  }
  if (DOM.btnModeDelivery) {
    DOM.btnModeDelivery.addEventListener("click", () => setOrderMode("delivery"));
  }
  if (DOM.modeHeaderBtn) {
    DOM.modeHeaderBtn.addEventListener("click", () => {
      if (DOM.welcomeOverlay) {
        DOM.welcomeOverlay.style.display = "flex";
      }
      document.body.classList.add("auth-locked");
    });
  }

  // Waiter Call Modal Listeners
  if (DOM.waiterCallBtn) {
    DOM.waiterCallBtn.addEventListener("click", () => openModal(DOM.waiterModal));
  }
  if (DOM.closeWaiterBtn) {
    DOM.closeWaiterBtn.addEventListener("click", () => closeModal(DOM.waiterModal));
  }
  if (DOM.waiterForm) {
    DOM.waiterForm.addEventListener("submit", handleCallWaiter);
  }

  // Connection Preference Selector Chips
  if (DOM.prefCall && DOM.prefChat) {
    DOM.prefCall.addEventListener("click", () => {
      communicationPreference = "call";
      DOM.prefCall.classList.add("active");
      DOM.prefChat.classList.remove("active");
    });
    DOM.prefChat.addEventListener("click", () => {
      communicationPreference = "chat";
      DOM.prefChat.classList.add("active");
      DOM.prefCall.classList.remove("active");
    });
  }

  // Payment Method Selector Chips
  if (DOM.payCash && DOM.payCard && DOM.payOnline) {
    DOM.payCash.addEventListener("click", () => {
      paymentMethod = "cash";
      DOM.payCash.classList.add("active");
      DOM.payCard.classList.remove("active");
      DOM.payOnline.classList.remove("active");
      if (DOM.cashChangeContainer) DOM.cashChangeContainer.classList.add("active");
    });
    DOM.payCard.addEventListener("click", () => {
      paymentMethod = "card";
      DOM.payCard.classList.add("active");
      DOM.payCash.classList.remove("active");
      DOM.payOnline.classList.remove("active");
      if (DOM.cashChangeContainer) DOM.cashChangeContainer.classList.remove("active");
    });
    DOM.payOnline.addEventListener("click", () => {
      paymentMethod = "online";
      DOM.payOnline.classList.add("active");
      DOM.payCash.classList.remove("active");
      DOM.payCard.classList.remove("active");
      if (DOM.cashChangeContainer) DOM.cashChangeContainer.classList.remove("active");
    });
  }

  // Exact payment checkbox toggler
  if (DOM.checkoutNoChange && DOM.checkoutChange) {
    DOM.checkoutNoChange.addEventListener("change", (e) => {
      DOM.checkoutChange.disabled = e.target.checked;
      if (e.target.checked) {
        DOM.checkoutChange.value = "";
        const groupChange = document.getElementById("group-change-amount");
        if (groupChange) groupChange.classList.remove("has-error");
      }
    });
  }

  // Handle mobile keyboard layout bugs (iOS Safari scroll/zoom offset after keyboard closes)
  document.addEventListener("focusout", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      setTimeout(() => {
        window.scrollTo(document.documentElement.scrollLeft, document.documentElement.scrollTop);
        // Force browser layout repaint/reflow to snap fixed panels back into place
        document.body.style.display = 'none';
        document.body.offsetHeight; // trigger reflow
        document.body.style.display = '';
      }, 80);
    }
  });
}

// ==========================================================================
// MICRO-ANIMATIONS (FLYING CART PARTICLE EFFECT)
// ==========================================================================
function triggerFlyAnimation(btn) {
  // Create animated particle
  const flyEl = document.createElement("div");
  flyEl.className = "fly-item";
  flyEl.innerHTML = `
    <i class="fa-solid fa-cart-shopping" style="font-size: 14px; color: var(--accent-gold);"></i>
  `;
  document.body.appendChild(flyEl);
  
  const btnRect = btn.getBoundingClientRect();
  const cartRect = DOM.cartTrigger.getBoundingClientRect();
  
  // Starting absolute coordinates
  const startX = btnRect.left + btnRect.width / 2 - 20;
  const startY = btnRect.top + btnRect.height / 2 - 20 + window.scrollY;
  
  // Destination coordinates
  const destX = cartRect.left + cartRect.width / 2 - 20;
  const destY = cartRect.top + cartRect.height / 2 - 20 + window.scrollY;
  
  flyEl.style.left = `${startX}px`;
  flyEl.style.top = `${startY}px`;
  
  // Force reflow
  flyEl.offsetWidth;
  
  // Animate using CSS translate transitions
  const diffX = destX - startX;
  const diffY = destY - startY;
  
  flyEl.style.transform = `translate(${diffX}px, ${diffY}px) scale(0.6)`;
  flyEl.style.opacity = "0.2";
  
  setTimeout(() => {
    flyEl.remove();
    // Add brief jump bounce to cart icon
    DOM.cartTrigger.style.transform = "scale(1.2)";
    setTimeout(() => {
      DOM.cartTrigger.style.transform = "scale(1)";
    }, 150);
  }, 600);
}

// Drawer Visibility triggers
function openCartDrawer() {
  DOM.cartBackdrop.classList.add("open");
  document.body.style.overflow = "hidden"; // Prevent body scrolling
}

function closeCartDrawer() {
  DOM.cartBackdrop.classList.remove("open");
  document.body.style.overflow = "";
}

// Modal Visibility helpers
function openModal(modal) {
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

// ==========================================================================
// FORM VALIDATIONS
// ==========================================================================
function validateCheckoutForm() {
  let isValid = true;
  
  // 1. Validate Name (min 2 chars)
  const name = DOM.checkoutName.value.trim();
  const groupName = document.getElementById("group-name");
  if (name.length < 2) {
    groupName.classList.add("has-error");
    isValid = false;
  } else {
    groupName.classList.remove("has-error");
  }
  
  // 2. Validate Phone
  const phone = DOM.checkoutPhone.value.trim();
  const groupPhone = document.getElementById("group-phone");
  const digitCount = phone.replace(/\D/g, "").length;
  if (phone.length < 7 || digitCount < 5) {
    groupPhone.classList.add("has-error");
    isValid = false;
  } else {
    groupPhone.classList.remove("has-error");
  }
  
  // 3. Validate Address
  const address = DOM.checkoutAddress.value.trim();
  const groupAddress = document.getElementById("group-address");
  if (address.length < 5) {
    groupAddress.classList.add("has-error");
    isValid = false;
  } else {
    groupAddress.classList.remove("has-error");
  }

  // 4. Validate Cash Change if Cash Payment is active
  if (paymentMethod === "cash" && DOM.checkoutNoChange && !DOM.checkoutNoChange.checked) {
    const groupChange = document.getElementById("group-change-amount");
    const changeVal = parseFloat(DOM.checkoutChange.value.trim());
    
    // Calculate Grand Total
    let subtotal = 0;
    cart.forEach(cartItem => {
      const itemPrice = cartItem.item.is_discounted ? cartItem.item.discount_price : cartItem.item.price;
      subtotal += itemPrice * cartItem.quantity;
    });
    let promoDiscount = 0;
    if (activePromo) {
      promoDiscount = Math.round(subtotal * (activePromo.discount_percent / 100));
    }
    const discountedSubtotal = subtotal - promoDiscount;
    const isFreeDelivery = subtotal >= CONFIG.freeDeliveryThreshold;
    const deliveryCost = isFreeDelivery ? 0 : CONFIG.deliveryPrice;
    const grandTotal = discountedSubtotal + deliveryCost;

    if (isNaN(changeVal) || changeVal < grandTotal) {
      if (groupChange) groupChange.classList.add("has-error");
      isValid = false;
    } else {
      if (groupChange) groupChange.classList.remove("has-error");
    }
  } else {
    const groupChange = document.getElementById("group-change-amount");
    if (groupChange) groupChange.classList.remove("has-error");
  }
  
  return isValid;
}

// ==========================================================================
// VERIFICATION DIALOG & ORDER COMPILATION
// ==========================================================================
function openVerificationModal() {
  DOM.verifItemsList.innerHTML = "";
  DOM.verifDetailsList.innerHTML = "";
  
  // Render items in verification dialog
  let subtotal = 0;
  cart.forEach(cartItem => {
    const itemPrice = cartItem.item.is_discounted ? cartItem.item.discount_price : cartItem.item.price;
    const itemTotal = itemPrice * cartItem.quantity;
    subtotal += itemTotal;
    
    const row = document.createElement("div");
    row.className = "verif-item";
    row.innerHTML = `
      <span class="verif-item-name">${cartItem.item.name}</span>
      <span class="verif-item-qty">x${cartItem.quantity}</span>
      <span class="verif-item-price">${itemTotal} ${CONFIG.currencySymbol}</span>
    `;
    DOM.verifItemsList.appendChild(row);
  });
  
  // Append delivery and grand total to verification list
  let promoDiscount = 0;
  if (activePromo) {
    promoDiscount = Math.round(subtotal * (activePromo.discount_percent / 100));
  }
  const discountedSubtotal = subtotal - promoDiscount;
  const isFreeDelivery = subtotal >= CONFIG.freeDeliveryThreshold;
  const deliveryCost = isFreeDelivery ? 0 : CONFIG.deliveryPrice;
  const grandTotal = discountedSubtotal + deliveryCost;
  
  const deliveryRow = document.createElement("div");
  deliveryRow.className = "verif-item";
  deliveryRow.style.color = "var(--text-secondary)";
  deliveryRow.style.borderTop = "1px solid rgba(255,255,255,0.05)";
  deliveryRow.style.paddingTop = "12px";
  deliveryRow.innerHTML = `
    <span class="verif-item-name">Доставка:</span>
    <span class="verif-item-qty"></span>
    <span class="verif-item-price">${isFreeDelivery ? 'Бесплатно' : deliveryCost + ' сом'}</span>
  `;
  DOM.verifItemsList.appendChild(deliveryRow);

  if (promoDiscount > 0) {
    const promoRow = document.createElement("div");
    promoRow.className = "verif-item";
    promoRow.style.color = "#27ae60";
    promoRow.innerHTML = `
      <span class="verif-item-name">Скидка (промокод ${activePromo.code}):</span>
      <span class="verif-item-qty"></span>
      <span class="verif-item-price">-${promoDiscount} сом</span>
    `;
    DOM.verifItemsList.appendChild(promoRow);
  }
  
  const totalRow = document.createElement("div");
  totalRow.className = "verif-item";
  totalRow.style.fontWeight = "800";
  totalRow.style.color = "var(--accent-gold)";
  totalRow.innerHTML = `
    <span class="verif-item-name">Итого к оплате:</span>
    <span class="verif-item-qty"></span>
    <span class="verif-item-price" style="font-size: 1.1rem;">${grandTotal} ${CONFIG.currencySymbol}</span>
  `;
  DOM.verifItemsList.appendChild(totalRow);
  
  // Render Customer details
  const name = DOM.checkoutName.value.trim();
  const phone = DOM.checkoutPhone.value.trim();
  const address = DOM.checkoutAddress.value.trim();
  const comment = DOM.checkoutComment.value.trim();
  
  const prefText = communicationPreference === "call" ? "Позвонить мне" : "Только написать";
  
  let payText = "";
  if (paymentMethod === "cash") {
    const isNoChange = DOM.checkoutNoChange && DOM.checkoutNoChange.checked;
    const changeAmt = DOM.checkoutChange.value.trim();
    payText = `Наличными (${isNoChange ? 'Без сдачи' : 'Сдача с ' + changeAmt + ' сом'})`;
  } else if (paymentMethod === "card") {
    payText = "Картой курьеру";
  } else {
    payText = "Онлайн на сайте";
  }

  DOM.verifDetailsList.innerHTML = `
    <div class="verif-detail-row">
      <span>Клиент:</span>
      <span>${name}</span>
    </div>
    <div class="verif-detail-row">
      <span>Телефон:</span>
      <span>${phone}</span>
    </div>
    <div class="verif-detail-row">
      <span>Адрес:</span>
      <span>${address}</span>
    </div>
    <div class="verif-detail-row">
      <span>Связь:</span>
      <span>${prefText}</span>
    </div>
    <div class="verif-detail-row">
      <span>Оплата:</span>
      <span>${payText}</span>
    </div>
    ${comment ? `
    <div class="verif-detail-row">
      <span>Инфо:</span>
      <span>${comment}</span>
    </div>
    ` : ''}
  `;
  
  openModal(DOM.verificationModal);
}

// ==========================================================================
// BOT API DISPATCH
// ==========================================================================
async function handleConfirmOrder() {
  // Show sending state
  DOM.verifConfirmBtn.disabled = true;
  const originalBtnContent = DOM.verifConfirmBtn.innerHTML;
  DOM.verifConfirmBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="spinner" style="width:18px; height:18px; animation: spin 1s linear infinite;">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
    <span>Отправка...</span>
  `;
  
  // 1. Compile order details
  const name = DOM.checkoutName.value.trim();
  const phone = DOM.checkoutPhone.value.trim();
  const address = DOM.checkoutAddress.value.trim();
  const comment = DOM.checkoutComment.value.trim();
  
  const orderId = Math.floor(1000 + Math.random() * 9000); // Random Order ID
  
  let subtotal = 0;
  let itemsMarkdown = "";
  let itemsPlaintext = "";
  
  cart.forEach((cartItem, idx) => {
    const itemPrice = cartItem.item.is_discounted ? cartItem.item.discount_price : cartItem.item.price;
    const itemTotal = itemPrice * cartItem.quantity;
    subtotal += itemTotal;
    
    itemsMarkdown += `${idx + 1}. *${cartItem.item.name}* x${cartItem.quantity} — ${itemTotal} сом${cartItem.item.is_discounted ? ' (акция)' : ''}\n`;
    itemsPlaintext += `${idx + 1}. ${cartItem.item.name} x${cartItem.quantity} - ${itemTotal} сом\n`;
  });
  
  let promoDiscount = 0;
  if (activePromo) {
    promoDiscount = Math.round(subtotal * (activePromo.discount_percent / 100));
  }
  const discountedSubtotal = subtotal - promoDiscount;
  const isFreeDelivery = subtotal >= CONFIG.freeDeliveryThreshold;
  const deliveryCost = isFreeDelivery ? 0 : CONFIG.deliveryPrice;
  const grandTotal = discountedSubtotal + deliveryCost;
  
  const prefText = communicationPreference === "call" ? "Позвонить мне" : "Только написать";
  
  let payText = "";
  let changeAmount = 0;
  let isNoChange = false;
  if (paymentMethod === "cash") {
    isNoChange = DOM.checkoutNoChange && DOM.checkoutNoChange.checked;
    changeAmount = isNoChange ? 0 : parseFloat(DOM.checkoutChange.value.trim());
    payText = `Наличными (${isNoChange ? 'Без сдачи' : 'Сдача с ' + changeAmount + ' сом'})`;
  } else if (paymentMethod === "card") {
    payText = "Картой курьеру";
  } else {
    payText = "Онлайн на сайте";
  }

  // Format beautifully for Telegram Bot channel with Markdown
  const telegramMessage = 
`🔔 *НОВЫЙ ЗАКАЗ #${orderId}*
------------------------------
👤 *Имя:* ${name}
📞 *Телефон:* ${phone}
📍 *Адрес:* ${address}
📞 *Связь:* ${prefText}
💳 *Оплата:* ${payText}
${activePromo ? `🎟️ *Промокод:* ${activePromo.code} (-${promoDiscount} сом)\n` : ''}
${comment ? `💬 *Комментарий:* ${comment}\n` : ''}
📦 *Блюда:*
${itemsMarkdown}
🚗 *Доставка:* ${isFreeDelivery ? 'Бесплатно' : deliveryCost + ' сом'}
💰 *Итого к оплате:* *${grandTotal} сом*`;

  const orderData = {
    orderId,
    mode: storage.getSession("samoor_order_mode") || "delivery",
    customer: { name, phone, address, comment },
    items: cart.map(i => ({ 
      id: i.item.id, 
      name: i.item.name, 
      quantity: i.quantity, 
      price: i.item.is_discounted ? i.item.discount_price : i.item.price 
    })),
    subtotal,
    promo_discount: promoDiscount,
    promo_code: activePromo ? activePromo.code : null,
    delivery: deliveryCost,
    total: grandTotal,
    payment: {
      method: paymentMethod,
      no_change: isNoChange,
      change_from: changeAmount
    },
    communication: communicationPreference
  };

  console.log("Отправка заказа на сервер...", orderData);

  // Try Express backend dispatch first
  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "order", orderData: orderData })
    });
    
    if (!res.ok) {
      throw new Error(`Serverless order dispatch failed: status ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Заказ успешно отправлен и обработан сервером:", data);
    handleSuccessOrder();

    // Close WebApp on success if in Telegram Mode
    if (isTelegramWebApp) {
      try {
        const tg = window.Telegram.WebApp;
        setTimeout(() => {
          tg.close();
        }, 1000);
      } catch (tgErr) {
        console.warn("Failed to close Telegram WebApp:", tgErr);
      }
    }
  } catch (err) {
    console.error("Express order dispatch failed:", err);
    
    // Close verification modal
    closeModal(DOM.verificationModal);
    
    // Display Critical Error Modal
    if (DOM.errorModal && DOM.errorModalMsg) {
      DOM.errorModalMsg.innerHTML = `
        Не удалось автоматически отправить ваш заказ на сервер.<br><br>
        <strong>Причина:</strong> <code>${err.message || 'Ошибка подключения к серверу API'}</code><br><br>
        Пожалуйста, попробуйте отправить заказ ещё раз или нажмите кнопку ниже для отправки заказа напрямую через Telegram-чат.
      `;
      
      // Bind handler to fallback action
      if (DOM.errorFallbackBtn) {
        // Reset listeners using clone
        const newFallback = DOM.errorFallbackBtn.cloneNode(true);
        DOM.errorFallbackBtn.parentNode.replaceChild(newFallback, DOM.errorFallbackBtn);
        DOM.errorFallbackBtn = newFallback;
        
        DOM.errorFallbackBtn.addEventListener("click", () => {
          closeModal(DOM.errorModal);
          console.log("Инициализирован переход в Telegram-чат по резервной ссылке");
          fallbackRedirectToChat(telegramMessage);
          handleSuccessOrder();
        });
      }
      
      openModal(DOM.errorModal);
    } else {
      // Direct alert fallback
      alert(`Ошибка при отправке заказа: ${err.message || 'Ошибка API'}\nЗаказ будет открыт в Telegram-чате.`);
      console.log("Инициализирован переход в Telegram-чат по резервной ссылке");
      fallbackRedirectToChat(telegramMessage);
      handleSuccessOrder();
    }
  } finally {
    DOM.verifConfirmBtn.disabled = false;
    DOM.verifConfirmBtn.innerHTML = originalBtnContent;
  }
}

// Fallback deep link to send message via client interface
function fallbackRedirectToChat(msg) {
  const encodedMsg = encodeURIComponent(msg);
  window.open(`https://t.me/share/url?url=${encodedMsg}`, '_blank');
}

// Handle success animations and clear cart
function handleSuccessOrder() {
  closeModal(DOM.verificationModal);
  
  // Pre-fill success message details
  DOM.successMessageText.textContent = `Спасибо за заказ! Заказ отправлен менеджеру. Мы свяжемся с вами в течение 5 минут по номеру ${DOM.checkoutPhone.value.trim()} для подтверждения доставки на адрес: ${DOM.checkoutAddress.value.trim()}.`;
  
  // Clear cart
  cart = [];
  saveCart();
  renderCart();
  renderDishes();
  
  // Clear checkout form
  DOM.checkoutForm.reset();
  
  // Show success modal
  openModal(DOM.successModal);
}

// ==========================================================================
// HELPERS & CONSTANTS
// ==========================================================================

// SVG Icon Selection
function getCategoryIconSvg(iconName) {
  const icons = {
    coffee: `<i class="fa-solid fa-coffee"></i>`,
    leaf: `<i class="fa-solid fa-leaf"></i>`,
    utensils: `<i class="fa-solid fa-utensils"></i>`,
    flame: `<i class="fa-solid fa-fire"></i>`,
    star: `<i class="fa-solid fa-star"></i>`,
    beef: `<i class="fa-solid fa-drumstick-bite"></i>`,
    soup: `<i class="fa-solid fa-bowl-food"></i>`,
    smile: `<i class="fa-solid fa-face-smile"></i>`,
    pizza: `<i class="fa-solid fa-pizza-slice"></i>`,
    glass: `<i class="fa-solid fa-glass-water"></i>`
  };
  return icons[iconName] || `<i class="fa-solid fa-utensils"></i>`;
}

// Add spinning keyframe animation to CSS dynamically for the loader
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spinner {
    animation: spin 1.2s linear infinite;
  }
`;
document.head.appendChild(style);

// ==========================================================================
// SAFE INITIALIZATION (Solves the cached script / missed DOMContentLoaded race condition)
// ==========================================================================
async function init() {
  // Load Theme
  const savedTheme = storage.get("samoor_theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    const themeDarkBtn = document.getElementById("theme-dark-btn");
    const themeLightBtn = document.getElementById("theme-light-btn");
    if (themeLightBtn && themeDarkBtn) {
      themeLightBtn.classList.add("active");
      themeDarkBtn.classList.remove("active");
    }
  }
  updateThemeLogos(savedTheme);

  // Load Dishes database from localStorage
  await loadDishes();

  // Load Cart from localStorage
  loadCart();
  
  // Check Service Mode on load (session-based)
  const savedMode = storage.getSession("samoor_order_mode");
  if (savedMode) {
    setOrderMode(savedMode);
  } else {
    // Show Welcome Screen and lock body scroll
    if (DOM.welcomeOverlay) {
      DOM.welcomeOverlay.style.display = "flex";
    }
    document.body.classList.add("auth-locked");
  }
  
  // Scroll Effect for Header
  window.addEventListener("scroll", handleHeaderScroll);
  
  // Render Categories
  renderCategories();
  
  // Render Dishes
  renderDishes();
  
  // Set up Event Listeners
  setupEventListeners();
  
  // Settings trigger auto-hide removed
  
  console.log("Samoor application successfully initialized.");
}

// Helper to update logos and favicon based on selected theme
function updateThemeLogos(theme) {
  const isLight = theme === "light";
  const logoPath = isLight ? "data:image/jpeg;base64,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" : "data:image/jpeg;base64,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EQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQfQOCpNt0knMEM+16NHj6OM42vFRay0kHKiyVMtjr9g1Hd6qop4mmiAAAhgc0NGz48yqb8oNeazUOy80j5ombEklMzALuhPMjgob59qfRGwtaxrwNnth7WFtehU94ohLQR7FfE36amBz2o+szv6hc/Hw9GfXW+fJ1zUfGmZJPnH0dkkUbpRsh0h2fLPJTVx1Fd7XmgdXx1FKR61OCHt8+O/vUFNRxWqicKyParpm+pETuiH1nd/QclEukLmhu7d0Wtwly6lJnZj0tyona2B8MZ2oZDtt2vaYehUesotJGdu2EREQIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIsjiEAcVNxwmy08dXI4trn+tCwHBjH1j39AvmlhgtkIq6xu3UEZggP2Od0UZUTy1U7pZXlz3cSfuUXutOyYqYBfKSS40+PS4xmphz7QHvju6hQRBBOV7UtTPSVDZqeQskafVc1S1dT0t0pn3CgAZK1u1UU3Tq5vd16J4/sef7oFEIwilUREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEHFEHFBKU1BAaU1dbUOijJxG1rdp7/ALcoo7ZC19bEZal8LdoQSsDd/1jgncFBl7iwBxJDeAJ4L6imfC4ujdg4LfIjeos37plkfVVUy1lQ+eVxdI/j+QXgnM54opQLZoKyWgrI6iB2HtON43EdFqrKCxVlPZ8R1MrqindM0PNNEwO2c8wSRgHotCut0EVKKuiqxNTl2y5rhsyMPQjP2hR8kj5XFz3FzsYyTlfHJRJr3Tbv2YREUoEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERB//2Q==";
  
  const favicon = document.getElementById("favicon");
  if (favicon) favicon.href = logoPath;
  
  const logoImg = document.getElementById("logo-img");
  if (logoImg) logoImg.src = logoPath;
  
  const footerLogoImg = document.getElementById("footer-logo-img");
  if (footerLogoImg) footerLogoImg.src = logoPath;
  
  const welcomeLogoImg = document.getElementById("welcome-logo-img");
  if (welcomeLogoImg) welcomeLogoImg.src = logoPath;
}

// Run immediately if DOM is already parsed (interactive/complete), otherwise wait for DOMContentLoaded
if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
